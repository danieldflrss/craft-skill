import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveDestinations } from '../src/resolve.js';

const paths = (r) => r.destinations.map((d) => d.path);

test('una sola ruta cubre Claude Code y OpenCode', () => {
  const r = resolveDestinations(['claude-code', 'opencode'], 'project');
  assert.deepEqual(paths(r), ['.claude/skills']);
  assert.deepEqual(r.duplicated, []);
});

test('prefiere la ruta neutral cuando cubre a todos por sí sola', () => {
  const r = resolveDestinations(['opencode', 'gemini-cli'], 'project');
  assert.deepEqual(paths(r), ['.agents/skills']);
});

test('NO usa la ruta neutral si provocaría doble carga', () => {
  const r = resolveDestinations(['claude-code', 'opencode', 'gemini-cli'], 'project');
  assert.deepEqual(paths(r).sort(), ['.claude/skills', '.gemini/skills']);
  assert.deepEqual(r.duplicated, []);
});

test('Codex en ámbito de proyecto queda sin cubrir', () => {
  const r = resolveDestinations(['codex'], 'project');
  assert.deepEqual(r.destinations, []);
  assert.deepEqual(r.uncovered, ['codex']);
});

test('empate de tamaño: gana la que incluye la ruta neutral', () => {
  const r = resolveDestinations(['codex', 'claude-code'], 'global');
  assert.deepEqual(paths(r).sort(), ['~/.agents/skills', '~/.claude/skills']);
});

test('los seis agentes en proyecto: cuatro destinos y Codex sin cubrir', () => {
  const all = ['claude-code', 'codex', 'cursor', 'gemini-cli', 'opencode', 'windsurf'];
  const r = resolveDestinations(all, 'project');
  assert.deepEqual(paths(r).sort(), ['.claude/skills', '.cursor/skills', '.gemini/skills', '.windsurf/skills']);
  assert.deepEqual(r.uncovered, ['codex']);
  assert.deepEqual(r.duplicated, []);
});

test('cuando no existe cobertura exacta, informa de los duplicados', () => {
  const table = {
    a: { label: 'A', detect: [], paths: { project: ['p/one'], global: [] } },
    b: { label: 'B', detect: [], paths: { project: ['p/one', 'p/two'], global: [] } },
    c: { label: 'C', detect: [], paths: { project: ['p/two'], global: [] } },
  };
  const r = resolveDestinations(['a', 'b', 'c'], 'project', { table });
  assert.deepEqual(paths(r).sort(), ['p/one', 'p/two']);
  assert.deepEqual(r.duplicated, ['b']);
});
