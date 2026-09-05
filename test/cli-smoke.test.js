import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const CLI = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'src', 'cli.js');
const roots = [];

// El proceso hijo hereda el entorno, y `status` escanea tambien las rutas GLOBALES.
// Aislar solo el cwd deja el test dependiendo de si quien lo ejecuta tiene craftkit
// instalado en su home: pasaria en una maquina limpia y fallaria en la de cualquier
// colaborador del proyecto. Aislamos tambien el home (USERPROFILE en Windows, HOME en
// POSIX) para que el binario mire a un arbol vacio en los dos ambitos.
async function tmpEnv() {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'craftkit-smoke-'));
  roots.push(root);
  const cwd = path.join(root, 'proj');
  const home = path.join(root, 'home');
  await fs.mkdir(cwd, { recursive: true });
  await fs.mkdir(home, { recursive: true });
  return { cwd, env: { ...process.env, HOME: home, USERPROFILE: home } };
}

test('el binario se ejecuta de verdad y responde a status', async () => {
  const { cwd, env } = await tmpEnv();
  const out = execFileSync(process.execPath, [CLI, 'status'], { cwd, env, encoding: 'utf8' });
  assert.match(out, /no está instalado/);
});

test('el binario resuelve el plan en un dry-run', async () => {
  const { cwd, env } = await tmpEnv();
  const out = execFileSync(
    process.execPath,
    [CLI, 'install', '--agents', 'claude-code,opencode', '--local', '--yes', '--dry-run'],
    { cwd, env, encoding: 'utf8' },
  );
  assert.match(out, /\.claude[\\/]skills/);
  assert.match(out, /claude-code/);
});

after(async () => {
  for (const root of roots) await fs.rm(root, { recursive: true, force: true });
});
