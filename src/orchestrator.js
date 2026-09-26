import fs from 'node:fs/promises';
import path from 'node:path';
import { resolveDest } from './targets.js';

const NAME = 'craft-orchestrator';
const MANIFEST = '.craftkit-orchestrator.json';
const TARGETS = {
  opencode: { project: '.opencode/agents', global: '~/.config/opencode/agents', source: 'opencode/craft-orchestrator.md' },
  'claude-code': { project: '.claude/agents', global: '~/.claude/agents', source: 'claude-code/craft-orchestrator.md' },
  codex: { project: '.codex/agents', global: '~/.codex/agents', source: 'codex/craft-orchestrator.toml' },
};

export function planOrchestrator({ cwd, home, scope, agents, agentSourceDir }) {
  return agents.filter((id) => TARGETS[id]).map((id) => {
    const target = TARGETS[id];
    const dir = resolveDest(target[scope], { cwd, home });
    return { id, dir, file: path.join(dir, path.basename(target.source)), source: path.join(agentSourceDir, target.source) };
  });
}

export async function installOrchestrator(opts) {
  const plan = planOrchestrator(opts);
  if (opts.dryRun) return plan;
  for (const item of plan) {
    const manifestFile = path.join(item.dir, MANIFEST);
    const manifest = JSON.parse(await fs.readFile(manifestFile, 'utf8').catch(() => 'null'));
    const exists = await fs.lstat(item.file).catch(() => null);
    if (exists && manifest?.file !== path.basename(item.file) && !opts.force) {
      throw new Error(`Agent destination already exists and is not managed by craftkit: ${item.file}`);
    }
    await fs.mkdir(item.dir, { recursive: true });
    await fs.rm(item.file, { force: true });
    await fs.copyFile(item.source, item.file);
    await fs.writeFile(manifestFile, JSON.stringify({ schema: 1, agent: NAME, file: path.basename(item.file), scope: opts.scope, platform: item.id }, null, 2) + '\n');
  }
  return plan;
}

export async function uninstallOrchestrator({ cwd, home }, { scope } = {}) {
  const removed = [];
  for (const [id, target] of Object.entries(TARGETS)) {
    for (const candidateScope of scope ? [scope] : ['project', 'global']) {
      const dir = resolveDest(target[candidateScope], { cwd, home });
      const manifestFile = path.join(dir, MANIFEST);
      const manifest = JSON.parse(await fs.readFile(manifestFile, 'utf8').catch(() => 'null'));
      if (!manifest || manifest.platform !== id || manifest.scope !== candidateScope || !/^[a-z0-9-]+\.(md|toml)$/.test(manifest.file)) continue;
      const file = path.join(dir, manifest.file);
      await fs.rm(file, { force: true });
      await fs.rm(manifestFile, { force: true });
      await fs.rmdir(dir).catch(() => {});
      removed.push(file);
    }
  }
  return removed;
}

export async function hasOrchestrator({ cwd, home }, scope) {
  for (const target of Object.values(TARGETS)) {
    for (const candidateScope of scope ? [scope] : ['project', 'global']) {
      const dir = resolveDest(target[candidateScope], { cwd, home });
      const manifest = JSON.parse(await fs.readFile(path.join(dir, MANIFEST), 'utf8').catch(() => 'null'));
      if (manifest?.agent === NAME && manifest.scope === candidateScope) return true;
    }
  }
  return false;
}
