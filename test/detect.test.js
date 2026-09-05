import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { detectAgents } from '../src/detect.js';

const roots = [];

async function env() {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'craftkit-detect-'));
  roots.push(root);
  const cwd = path.join(root, 'proj');
  const home = path.join(root, 'home');
  await fs.mkdir(cwd, { recursive: true });
  await fs.mkdir(home, { recursive: true });
  return { cwd, home };
}

after(async () => {
  for (const root of roots) await fs.rm(root, { recursive: true, force: true });
});

test('sin nada instalado no detecta agentes', async () => {
  assert.deepEqual(await detectAgents(await env()), []);
});

test('detecta por marcador global y por marcador de proyecto', async () => {
  const ctx = await env();
  await fs.mkdir(path.join(ctx.home, '.claude'), { recursive: true });
  await fs.mkdir(path.join(ctx.cwd, '.cursor'), { recursive: true });
  assert.deepEqual(await detectAgents(ctx), ['claude-code', 'cursor']);
});

test('un archivo con el nombre del marcador no cuenta como directorio', async () => {
  const ctx = await env();
  await fs.writeFile(path.join(ctx.home, '.codex'), 'no soy un directorio');
  assert.deepEqual(await detectAgents(ctx), []);
});
