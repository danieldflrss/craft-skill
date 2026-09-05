import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { AGENTS, agentIds, pathsFor, candidatePaths, resolveDest } from '../src/targets.js';

test('cubre los seis agentes de la v1', () => {
  assert.deepEqual(agentIds().sort(), ['claude-code', 'codex', 'cursor', 'gemini-cli', 'opencode', 'windsurf']);
});

test('Codex no tiene rutas de proyecto, solo globales', () => {
  assert.deepEqual(pathsFor('codex', 'project'), []);
  assert.ok(pathsFor('codex', 'global').includes('~/.codex/skills'));
});

test('OpenCode lee la ruta neutral y la de Claude Code', () => {
  const p = pathsFor('opencode', 'project');
  assert.ok(p.includes('.agents/skills'));
  assert.ok(p.includes('.claude/skills'));
});

test('agente desconocido lanza error', () => {
  assert.throws(() => pathsFor('emacs', 'project'), /Unknown agent/);
});

test('candidatePaths une y deduplica', () => {
  const c = candidatePaths(['claude-code', 'opencode'], 'project');
  assert.deepEqual(c, ['.agents/skills', '.claude/skills', '.opencode/skills']);
});

test('resolveDest expande ~ contra home y lo relativo contra cwd', () => {
  const ctx = { cwd: path.join('/proj'), home: path.join('/home/u') };
  assert.equal(resolveDest('~/.claude/skills', ctx), path.join('/home/u', '.claude/skills'));
  assert.equal(resolveDest('.claude/skills', ctx), path.join('/proj', '.claude/skills'));
});

test('resolveDest no anida rutas absolutas ni pierde un ~ suelto', () => {
  const ctx = { cwd: path.join('/proj'), home: path.join('/home/u') };
  assert.equal(resolveDest('~', ctx), path.join('/home/u'));
  assert.equal(resolveDest(path.resolve('/etc/foo'), ctx), path.resolve('/etc/foo'));
});

test('la tabla expone exactamente las rutas documentadas de cada agente', () => {
  assert.deepEqual(pathsFor('claude-code', 'project'), ['.claude/skills']);
  assert.deepEqual(pathsFor('opencode', 'project'), ['.agents/skills', '.claude/skills', '.opencode/skills']);
  assert.deepEqual(pathsFor('codex', 'global'), ['~/.agents/skills', '~/.codex/skills']);
  assert.deepEqual(pathsFor('cursor', 'global'), []);
});
