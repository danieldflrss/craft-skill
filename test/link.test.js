import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { copyDir, materializeSkill } from '../src/link.js';

async function fixture() {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'craftkit-link-'));
  const src = path.join(root, 'src-skill');
  await fs.mkdir(path.join(src, 'rules'), { recursive: true });
  await fs.writeFile(path.join(src, 'SKILL.md'), '# skill\n');
  await fs.writeFile(path.join(src, 'rules', 'solid.md'), '# solid\n');
  return { root, src };
}

test('copyDir replica el árbol y devuelve rutas relativas', async () => {
  const { root, src } = await fixture();
  const dest = path.join(root, 'dest');
  const files = await copyDir(src, dest);
  assert.deepEqual(files.sort(), ['SKILL.md', path.join('rules', 'solid.md')].sort());
  assert.equal(await fs.readFile(path.join(dest, 'rules', 'solid.md'), 'utf8'), '# solid\n');
});

test('modo copy fuerza copia y registra los archivos', async () => {
  const { root, src } = await fixture();
  const res = await materializeSkill(src, path.join(root, 'd2'), { mode: 'copy' });
  assert.equal(res.mode, 'copy');
  assert.equal(res.files.length, 2);
});

test('modo auto deja el contenido legible sea cual sea el mecanismo', async () => {
  const { root, src } = await fixture();
  const dest = path.join(root, 'd3');
  const res = await materializeSkill(src, dest, { mode: 'auto' });
  assert.ok(['symlink', 'junction', 'copy'].includes(res.mode));
  assert.equal(await fs.readFile(path.join(dest, 'SKILL.md'), 'utf8'), '# skill\n');
  if (res.mode !== 'copy') assert.deepEqual(res.files, []);
});

test('destino ya existente lanza EEXIST', async () => {
  const { root, src } = await fixture();
  const dest = path.join(root, 'd4');
  await fs.mkdir(dest, { recursive: true });
  await fs.writeFile(path.join(dest, 'ajeno.txt'), 'x');
  await assert.rejects(() => materializeSkill(src, dest, { mode: 'auto' }), /EEXIST|not empty/i);
});
