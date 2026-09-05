import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { planInstall, install } from '../src/commands/install.js';
import { readManifest } from '../src/manifest.js';

const roots = [];

async function env() {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'craftkit-inst-'));
  roots.push(root);
  const cwd = path.join(root, 'proj');
  const home = path.join(root, 'home');
  const sourceDir = path.join(root, 'skills');
  for (const name of ['craft-architect', 'engineering-rules']) {
    await fs.mkdir(path.join(sourceDir, name), { recursive: true });
    await fs.writeFile(path.join(sourceDir, name, 'SKILL.md'), `---\nname: ${name}\ndescription: d\n---\n`);
  }
  await fs.mkdir(cwd, { recursive: true });
  await fs.mkdir(home, { recursive: true });
  return { cwd, home, sourceDir, scope: 'project', version: '0.1.0' };
}

after(async () => {
  for (const root of roots) await fs.rm(root, { recursive: true, force: true });
});

test('el plan elige una sola ruta para Claude Code y OpenCode', async () => {
  const ctx = await env();
  const plan = await planInstall({ ...ctx, agents: ['claude-code', 'opencode'] });
  assert.deepEqual(plan.destinations.map((d) => d.path), ['.claude/skills']);
  assert.deepEqual(plan.destinations[0].skills.sort(), ['craft-architect', 'engineering-rules']);
});

test('dryRun no escribe nada en disco', async () => {
  const ctx = await env();
  await install({ ...ctx, agents: ['claude-code'], dryRun: true });
  await assert.rejects(() => fs.stat(path.join(ctx.cwd, '.claude')));
});

test('instala los skills y deja manifiesto y AGENTS.md', async () => {
  const ctx = await env();
  await install({ ...ctx, agents: ['claude-code'], mode: 'copy' });
  const dest = path.join(ctx.cwd, '.claude', 'skills');
  assert.ok(await fs.stat(path.join(dest, 'craft-architect', 'SKILL.md')));
  const manifest = await readManifest(dest);
  assert.equal(manifest.entries.length, 2);
  const agentsmd = await fs.readFile(path.join(ctx.cwd, 'AGENTS.md'), 'utf8');
  assert.ok(agentsmd.includes('craft-architect'));
});

test('instalar dos veces deja el mismo estado', async () => {
  const ctx = await env();
  const opts = { ...ctx, agents: ['claude-code'], mode: 'copy' };
  await install(opts);
  const first = await readManifest(path.join(ctx.cwd, '.claude', 'skills'));
  await install(opts);
  const second = await readManifest(path.join(ctx.cwd, '.claude', 'skills'));
  assert.deepEqual(second.entries, first.entries);
});

test('un directorio ajeno en el destino aborta sin --force', async () => {
  const ctx = await env();
  const dest = path.join(ctx.cwd, '.claude', 'skills', 'craft-architect');
  await fs.mkdir(dest, { recursive: true });
  await fs.writeFile(path.join(dest, 'mio.md'), 'no me borres');
  await assert.rejects(
    () => install({ ...ctx, agents: ['claude-code'], mode: 'copy' }),
    /already exists|--force/,
  );
  assert.ok(await fs.readFile(path.join(dest, 'mio.md'), 'utf8'));
});

test('Codex en ámbito de proyecto se reporta como no cubierto', async () => {
  const ctx = await env();
  const plan = await planInstall({ ...ctx, agents: ['codex'] });
  assert.deepEqual(plan.uncovered, ['codex']);
  assert.deepEqual(plan.destinations, []);
});
