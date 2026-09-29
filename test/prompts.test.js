import test from 'node:test';
import assert from 'node:assert/strict';
import { confirmInstall, promptSetup, renderPlan } from '../src/prompts.js';

function fakeUi({ answers = [] } = {}) {
  const calls = [];
  return {
    calls,
    intro: () => calls.push('intro'),
    select: async () => answers.shift(),
    multiselect: async () => answers.shift(),
    confirm: async () => answers.shift(),
    note: (text, title) => calls.push({ text, title }),
    cancel: () => calls.push('cancel'),
    isCancel: (value) => value === Symbol.for('cancel'),
    spinner: () => ({ start: () => {}, stop: () => {} }),
    outro: () => {},
  };
}

test('el wizard conserva las selecciones que llegaron por flags', async () => {
  const ui = fakeUi({ answers: [['craft-architect'], 'copy', true] });
  const answer = await promptSetup({
    detected: ['opencode'],
    availableSkills: ['craft-architect'],
    initial: { scope: 'global', agents: ['opencode'] },
    ui,
  });

  assert.deepEqual(answer, {
    scope: 'global', agents: ['opencode'], skills: ['craft-architect'], mode: 'copy', withOrchestrator: true,
  });
});

test('el plan muestra destinos, bloque gestionado, conflictos y orquestador', () => {
  const lines = renderPlan({
    cwd: '/project',
    mode: 'auto',
    plan: {
      scope: 'project',
      destinations: [{ absPath: '/project/.claude/skills', skills: ['craft-architect'], covers: ['claude-code'] }],
      uncovered: ['codex'], duplicated: [], conflicts: ['/project/.claude/skills/craft-architect'],
    },
    orchestratorPlan: [{ file: '/project/.claude/agents/craft-orchestrator.md', id: 'claude-code' }],
    orchestratorConflicts: ['/project/.claude/agents/craft-orchestrator.md'],
    withOrchestrator: true,
  });

  assert.ok(lines.some((line) => line.includes('/project/AGENTS.md')));
  assert.ok(lines.some((line) => line.startsWith('CONFLICTO:')));
  assert.ok(lines.some((line) => line.includes('craft-orchestrator')));
  assert.equal(lines.filter((line) => line.startsWith('CONFLICTO:')).length, 2);
  assert.ok(lines.some((line) => line.includes('codex')));
});

test('el plan avisa cuando no hay un orquestador nativo para los agentes elegidos', () => {
  const lines = renderPlan({
    cwd: '/project', mode: 'auto', withOrchestrator: true,
    plan: { scope: 'project', destinations: [], uncovered: [], duplicated: [], conflicts: [] },
  });

  assert.ok(lines.some((line) => line.includes('ninguno de los agentes')));
});

test('un conflicto solo se aplica tras confirmar el overwrite y el plan', async () => {
  const ui = fakeUi({ answers: [true, true] });
  const result = await confirmInstall({ lines: ['CONFLICTO: /tmp/skill'], hasConflicts: true, ui });
  assert.deepEqual(result, { force: true });
});

test('rechazar overwrite cancela antes de aplicar el plan', async () => {
  const ui = fakeUi({ answers: [false] });
  const result = await confirmInstall({ lines: ['CONFLICTO: /tmp/skill'], hasConflicts: true, ui });
  assert.equal(result, null);
  assert.equal(ui.calls.filter((call) => call === 'cancel').length, 0);
});
