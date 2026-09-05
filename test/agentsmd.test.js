import test from 'node:test';
import assert from 'node:assert/strict';
import { START, END, upsertBlock, removeBlock, renderBlock } from '../src/agentsmd.js';

test('añade el bloque preservando el contenido previo', () => {
  const out = upsertBlock('# Mi proyecto\n\nUsa pnpm.\n', 'CUERPO');
  assert.ok(out.startsWith('# Mi proyecto\n\nUsa pnpm.\n'));
  assert.ok(out.includes(`${START}\nCUERPO\n${END}`));
});

test('la segunda ejecución reemplaza en lugar de duplicar', () => {
  const once = upsertBlock('# P\n', 'A');
  const twice = upsertBlock(once, 'B');
  assert.equal(twice.match(new RegExp(START, 'g')).length, 1);
  assert.ok(twice.includes('B'));
  assert.ok(!twice.includes('\nA\n'));
});

test('sobre archivo vacío produce solo el bloque', () => {
  assert.equal(upsertBlock('', 'X'), `${START}\nX\n${END}\n`);
});

test('removeBlock deja el resto intacto', () => {
  const out = removeBlock(upsertBlock('# P\n\ntexto\n', 'X'));
  assert.equal(out.includes(START), false);
  assert.ok(out.includes('texto'));
});

test('removeBlock sin bloque devuelve el original', () => {
  assert.equal(removeBlock('# P\n'), '# P\n');
});

test('renderBlock lista los skills y la ruta', () => {
  const body = renderBlock(['craft-architect', 'engineering-rules'], '.claude/skills');
  assert.ok(body.includes('.claude/skills'));
  assert.ok(body.includes('craft-architect'));
  assert.ok(body.includes('engineering-rules'));
});

test('renderBlock acepta varias rutas y las lista todas', () => {
  const body = renderBlock(['craft-architect'], ['.claude/skills', '.cursor/skills']);
  assert.ok(body.includes('.claude/skills'));
  assert.ok(body.includes('.cursor/skills'));
});
