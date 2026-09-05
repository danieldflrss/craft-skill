import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { install } from '../src/commands/install.js';
import { status } from '../src/commands/status.js';
import { uninstall } from '../src/commands/uninstall.js';

const roots = [];

async function env() {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'craftkit-life-'));
  roots.push(root);
  const cwd = path.join(root, 'proj');
  const home = path.join(root, 'home');
  const sourceDir = path.join(root, 'skills');
  await fs.mkdir(path.join(sourceDir, 'craft-architect'), { recursive: true });
  await fs.writeFile(path.join(sourceDir, 'craft-architect', 'SKILL.md'), '# a\n');
  await fs.mkdir(cwd, { recursive: true });
  await fs.mkdir(home, { recursive: true });
  return { cwd, home, sourceDir, scope: 'project', version: '0.1.0' };
}

after(async () => {
  for (const root of roots) await fs.rm(root, { recursive: true, force: true });
});

test('status informa de lo instalado', async () => {
  const ctx = await env();
  await install({ ...ctx, agents: ['claude-code'], mode: 'copy' });
  const rows = await status(ctx);
  assert.equal(rows.length, 1);
  assert.deepEqual(rows[0].skills, [{ name: 'craft-architect', mode: 'copy' }]);
});

test('status sobre un proyecto limpio devuelve lista vacía', async () => {
  assert.deepEqual(await status(await env()), []);
});

test('uninstall borra lo instalado y limpia AGENTS.md', async () => {
  const ctx = await env();
  await fs.writeFile(path.join(ctx.cwd, 'AGENTS.md'), '# Mi proyecto\n');
  await install({ ...ctx, agents: ['claude-code'], mode: 'copy' });
  await uninstall(ctx);
  await assert.rejects(() => fs.stat(path.join(ctx.cwd, '.claude', 'skills', 'craft-architect')));
  const agentsmd = await fs.readFile(path.join(ctx.cwd, 'AGENTS.md'), 'utf8');
  assert.ok(agentsmd.includes('# Mi proyecto'));
  assert.ok(!agentsmd.includes('craftkit:start'));
});

test('uninstall no toca archivos ajenos en el mismo directorio', async () => {
  const ctx = await env();
  await install({ ...ctx, agents: ['claude-code'], mode: 'copy' });
  const intruso = path.join(ctx.cwd, '.claude', 'skills', 'mi-skill');
  await fs.mkdir(intruso, { recursive: true });
  await fs.writeFile(path.join(intruso, 'SKILL.md'), 'mio');
  await uninstall(ctx);
  assert.equal(await fs.readFile(path.join(intruso, 'SKILL.md'), 'utf8'), 'mio');
});
