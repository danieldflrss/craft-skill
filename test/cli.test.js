import test from 'node:test';
import assert from 'node:assert/strict';
import { parseArgs } from '../src/cli.js';

test('sin comando usa install', () => {
  assert.equal(parseArgs([]).command, 'install');
});

test('parsea agentes separados por coma', () => {
  const { flags } = parseArgs(['install', '--agents', 'claude-code,opencode']);
  assert.deepEqual(flags.agents, ['claude-code', 'opencode']);
});

test('--global y --local fijan el ámbito', () => {
  assert.equal(parseArgs(['install', '--global']).flags.scope, 'global');
  assert.equal(parseArgs(['install', '--local']).flags.scope, 'project');
});

test('banderas booleanas', () => {
  const { flags } = parseArgs(['install', '--dry-run', '--force', '--copy', '--yes']);
  assert.equal(flags.dryRun, true);
  assert.equal(flags.force, true);
  assert.equal(flags.mode, 'copy');
  assert.equal(flags.yes, true);
});

test('add-rule captura el nombre posicional', () => {
  const parsed = parseArgs(['add-rule', 'caching']);
  assert.equal(parsed.command, 'add-rule');
  assert.equal(parsed.flags.name, 'caching');
});

test('una bandera de lista sin valor falla en vez de quedarse vacia', () => {
  assert.throws(() => parseArgs(['install', '--agents']), /--agents necesita un valor/);
  assert.throws(() => parseArgs(['install', '--skills']), /--skills necesita un valor/);
});

test('agente desconocido lanza error legible', () => {
  assert.throws(() => parseArgs(['install', '--agents', 'emacs']), /Unknown agent: emacs/);
});

test('comando desconocido lanza error legible', () => {
  assert.throws(() => parseArgs(['frobnicate']), /Unknown command: frobnicate/);
});
