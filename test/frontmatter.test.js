import test from 'node:test';
import assert from 'node:assert/strict';
import { parseFrontmatter } from '../src/frontmatter.js';

test('extrae claves y devuelve el cuerpo sin el bloque', () => {
  const { data, body } = parseFrontmatter('---\nname: solid\napplies-when: Hay clases\n---\n# SOLID\n');
  assert.equal(data.name, 'solid');
  assert.equal(data['applies-when'], 'Hay clases');
  assert.equal(body, '# SOLID\n');
});

test('quita comillas envolventes del valor', () => {
  const { data } = parseFrontmatter('---\nname: "clean-code"\n---\nx');
  assert.equal(data.name, 'clean-code');
});

test('sin frontmatter devuelve el texto intacto', () => {
  const { data, body } = parseFrontmatter('# Sin frontmatter\n');
  assert.deepEqual(data, {});
  assert.equal(body, '# Sin frontmatter\n');
});

test('tolera CRLF', () => {
  const { data } = parseFrontmatter('---\r\nname: ddd\r\n---\r\ncuerpo');
  assert.equal(data.name, 'ddd');
});
