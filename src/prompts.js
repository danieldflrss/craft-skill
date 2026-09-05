import * as p from '@clack/prompts';
import { AGENTS } from './targets.js';

export async function promptSetup({ detected, availableSkills }) {
  p.intro('craftkit');

  const scope = await p.select({
    message: '¿Dónde quieres instalar los skills?',
    options: [
      { value: 'project', label: 'Este proyecto' },
      { value: 'global', label: 'Global (tu usuario)' },
    ],
  });
  if (p.isCancel(scope)) return cancel();

  const agents = await p.multiselect({
    message: '¿Para qué agentes?',
    options: Object.entries(AGENTS).map(([value, a]) => ({
      value,
      label: a.label,
      hint: detected.includes(value) ? 'detectado' : undefined,
    })),
    initialValues: detected.length > 0 ? detected : ['claude-code'],
    required: true,
  });
  if (p.isCancel(agents)) return cancel();

  const skills = await p.multiselect({
    message: '¿Qué skills?',
    options: availableSkills.map((value) => ({ value, label: value })),
    initialValues: availableSkills,
    required: true,
  });
  if (p.isCancel(skills)) return cancel();

  return { scope, agents, skills };
}

export async function confirmPlan(lines) {
  p.note(lines.join('\n'), 'Plan');
  const ok = await p.confirm({ message: '¿Aplicar?' });
  if (p.isCancel(ok) || !ok) return cancel();
  return true;
}

export function done(message) {
  p.outro(message);
}

function cancel() {
  p.cancel('Cancelado.');
  return null;
}
