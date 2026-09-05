import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const CLI = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'src', 'cli.js');
const roots = [];

async function tmpCwd() {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'craftkit-smoke-'));
  roots.push(root);
  return root;
}

test('el binario se ejecuta de verdad y responde a status', async () => {
  const cwd = await tmpCwd();
  const out = execFileSync(process.execPath, [CLI, 'status'], { cwd, encoding: 'utf8' });
  assert.match(out, /no está instalado/);
});

test('el binario resuelve el plan en un dry-run', async () => {
  const cwd = await tmpCwd();
  const out = execFileSync(
    process.execPath,
    [CLI, 'install', '--agents', 'claude-code,opencode', '--local', '--yes', '--dry-run'],
    { cwd, encoding: 'utf8' },
  );
  assert.match(out, /\.claude[\\/]skills/);
  assert.match(out, /claude-code/);
});

after(async () => {
  for (const root of roots) await fs.rm(root, { recursive: true, force: true });
});
