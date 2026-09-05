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

// Estos tres cubren el borrado silencioso de contenido del usuario. Sin ellos, los
// demas pasan igual con la version ingenua basada en indexOf.
test('ida y vuelta byte a byte, preservando las lineas en blanco del usuario', () => {
  const original = '# Proyecto\n\n\n\n## Notas\n\ntexto\n';
  assert.equal(removeBlock(upsertBlock(original, 'X')), original);
});

// El fixture necesita la mencion en prosa Y un bloque real instalado. Con solo la
// mencion no hay END en el archivo, la version ingenua caia por la rama de anadir y
// preservaba el contenido por accidente: el test pasaba sin probar nada.
test('una mencion del marcador en la prosa no destruye el contenido del usuario', () => {
  const original = `Usamos ${START} para delimitar.\n\nparrafo del usuario\n\n${START}\nviejo\n${END}\n`;
  const out = upsertBlock(original, 'X');
  assert.ok(out.includes('parrafo del usuario'));
  assert.ok(out.includes('Usamos'));
  assert.ok(out.includes('X'));
  assert.ok(!out.includes('viejo'));
});

test('un END antes que un START deja el archivo intacto', () => {
  const original = `${END}\ntexto\n${START}\n`;
  assert.equal(removeBlock(original), original);
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
