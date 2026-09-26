import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseFrontmatter } from '../src/frontmatter.js';
import { generateIndexTable, RULES_START, RULES_END } from '../src/index-gen.js';
import { installOrchestrator } from '../src/orchestrator.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SKILLS = path.join(ROOT, 'skills');
const roots = [];
const RULES = path.join(SKILLS, 'engineering-rules', 'rules');
const NAME = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const SECTIONS = ['## Why', '## Checklist', '## Do / Don\'t', '## Smells', '## When to ignore'];
const SKILL_SECTIONS = [
  '## Activation Contract', '## Hard Rules', '## Decision Gates',
  '## Execution Steps', '## Output Contract', '## References',
];

const dirs = async (p) =>
  (await fs.readdir(p, { withFileTypes: true })).filter((e) => e.isDirectory()).map((e) => e.name);

test('cada SKILL.md tiene frontmatter válido y coherente con su directorio', async () => {
  for (const name of await dirs(SKILLS)) {
    const text = await fs.readFile(path.join(SKILLS, name, 'SKILL.md'), 'utf8');
    const { data } = parseFrontmatter(text);
    assert.equal(data.name, name, `${name}: name no coincide con el directorio`);
    assert.match(data.name, NAME, `${name}: nombre inválido`);
    assert.ok(data.description?.length >= 1 && data.description.length <= 250, `${name}: description fuera de rango`);
    assert.match(text, /^description: "[^"\r\n]+"$/m, `${name}: quote description on one line`);
    assert.equal(data.license, 'MIT');
    assert.match(text, /^metadata:\n  author: .+\n  version: "\d+\.\d+\.\d+"$/m);
  }
});

test('workflow contracts and the skill template keep ordered, nonempty sections', async () => {
  const files = (await dirs(SKILLS)).map((name) => path.join(SKILLS, name, 'SKILL.md'));
  files.push(path.join(ROOT, 'templates', 'skill.md'));
  for (const file of files) {
    const text = await fs.readFile(file, 'utf8');
    const headings = [...text.matchAll(/^## .+$/gm)];
    assert.deepEqual(headings.slice(0, SKILL_SECTIONS.length).map((m) => m[0]), SKILL_SECTIONS, file);
    for (const section of SKILL_SECTIONS) {
      assert.equal(headings.filter((m) => m[0] === section).length, 1, `${file}: ${section}`);
      const i = headings.findIndex((m) => m[0] === section);
      assert.ok(text.slice(headings[i].index + section.length, headings[i + 1]?.index).trim(), `${file}: empty ${section}`);
    }
  }
});

test('los cinco skills de flujo llevan prefijo craft-', async () => {
  const names = await dirs(SKILLS);
  assert.equal(names.filter((n) => n.startsWith('craft-')).length, 5);
  assert.ok(names.includes('engineering-rules'));
});

test('los agentes nativos aplican el contrato ODD', async () => {
  const agents = [
    'agents/opencode/craft-orchestrator.md',
    'agents/claude-code/craft-orchestrator.md',
    'agents/codex/craft-orchestrator.toml',
  ];
  const required = [
    'Organic Driven Development (ODD)',
    'explanations, investigations, and read-only analysis must not edit files',
    'odd/tasks/<feature-name>.md',
    'work-unit commit on the feature branch',
    'observe RED before implementation, GREEN after, then REFACTOR',
    'Evaluate delegation before beginning substantial work',
    'Delegate when the benefit outweighs coordination and integration cost',
    'Record the delegation decision and rationale',
    'Treat committing as optional',
    'ask the user for confirmation before creating a commit',
    'ask the user for confirmation before beginning implementation',
    'Do not begin implementation until the user explicitly approves the task',
  ];
  for (const agent of agents) {
    const text = await fs.readFile(path.join(ROOT, agent), 'utf8');
    for (const contract of required) assert.ok(text.includes(contract), `${agent}: falta ${contract}`);
  }
});

test('cada orquestador indica cómo lanzar subagentes y cómo responder si no están disponibles', async () => {
  const platforms = [
    { file: 'agents/opencode/craft-orchestrator.md', mechanism: 'subagent tool', choices: ['explore', 'general'] },
    { file: 'agents/claude-code/craft-orchestrator.md', mechanism: 'Agent tool', choices: ['Explore', 'general-purpose'] },
    { file: 'agents/codex/craft-orchestrator.toml', mechanism: 'spawn_agent', choices: ['explorer', 'worker'] },
  ];
  for (const { file, mechanism, choices } of platforms) {
    const text = await fs.readFile(path.join(ROOT, file), 'utf8');
    assert.ok(text.includes(mechanism), `${file}: missing launch mechanism ${mechanism}`);
    for (const choice of choices) assert.ok(text.includes(choice), `${file}: missing agent ${choice}`);
    assert.match(text, /launch .*eligible.*before .*implementation/i, `${file}: launch must happen before primary implementation`);
    assert.match(text, /unavailable or denied/i, `${file}: report unavailable delegation`);
    assert.match(text, /wait for .*results/i, `${file}: integrate child results`);
  }
});

test('la instalación copia las instrucciones de delegación de los tres agentes nativos', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'craftkit-orchestrator-'));
  roots.push(root);
  const plan = await installOrchestrator({
    cwd: root, home: path.join(root, 'home'), scope: 'project',
    agents: ['opencode', 'claude-code', 'codex'], agentSourceDir: path.join(ROOT, 'agents'),
  });
  assert.equal(plan.length, 3);
  for (const item of plan) {
    assert.equal(await fs.readFile(item.file, 'utf8'), await fs.readFile(item.source, 'utf8'), item.id);
  }
});

after(async () => {
  for (const root of roots) await fs.rm(root, { recursive: true, force: true });
});

test('cada rule tiene las cinco secciones obligatorias y no pasa de 120 líneas', async () => {
  for (const file of (await fs.readdir(RULES)).filter((f) => f.endsWith('.md'))) {
    const text = await fs.readFile(path.join(RULES, file), 'utf8');
    const headings = [...text.matchAll(/^## .+$/gm)];
    assert.deepEqual(headings.map((m) => m[0]), SECTIONS, `${file}: section order or duplication`);
    for (let i = 0; i < headings.length; i++) {
      const content = text.slice(headings[i].index + headings[i][0].length, headings[i + 1]?.index).trim();
      assert.ok(content.replace(/<!--[\s\S]*?-->/g, '').trim(), `${file}: empty ${headings[i][0]}`);
    }
    assert.match(text, /```ts\n[\s\S]+?\n```/, `${file}: missing TypeScript example`);
    assert.ok(text.split('\n').length <= 120, `${file}: supera las 120 líneas`);
    const { data } = parseFrontmatter(text);
    assert.equal(data.name, path.basename(file, '.md'));
    assert.ok(data['applies-when']?.length > 0, `${file}: falta applies-when`);
  }
});

test('el índice está sincronizado con el directorio de rules', async () => {
  const skillMd = await fs.readFile(path.join(SKILLS, 'engineering-rules', 'SKILL.md'), 'utf8');
  const s = skillMd.indexOf(RULES_START) + RULES_START.length;
  const e = skillMd.indexOf(RULES_END);
  assert.equal(skillMd.slice(s, e).trim(), (await generateIndexTable(RULES)).trim());
});

test('ninguna referencia relativa a un skill o rule está rota', async () => {
  for (const name of await dirs(SKILLS)) {
    const file = path.join(SKILLS, name, 'SKILL.md');
    const text = await fs.readFile(file, 'utf8');
    for (const m of text.matchAll(/`(\.\.\/[a-z0-9-/]+\.md)`/g)) {
      await fs.access(path.resolve(path.dirname(file), m[1]));
    }
  }
});
