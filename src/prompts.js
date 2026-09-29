import * as p from '@clack/prompts';
import { AGENTS } from './targets.js';

const cancelled = (ui, value) => ui.isCancel(value);

export async function promptSetup({ detected, availableSkills, initial = {}, ui = p }) {
  ui.intro('craftkit · instalación guiada');

  const scope = initial.scope ?? await ui.select({
    message: '¿Dónde quieres instalar los skills?',
    options: [
      { value: 'project', label: 'Este proyecto', hint: 'recomendado para un repositorio' },
      { value: 'global', label: 'Global (tu usuario)', hint: 'para todos tus proyectos' },
    ],
  });
  if (cancelled(ui, scope)) return cancel(ui);

  const agents = initial.agents ?? await ui.multiselect({
    message: '¿Qué agentes quieres cubrir?',
    options: Object.entries(AGENTS).map(([value, agent]) => ({
      value,
      label: agent.label,
      hint: detected.includes(value) ? 'detectado' : undefined,
    })),
    initialValues: detected.length > 0 ? detected : ['claude-code'],
    required: true,
  });
  if (cancelled(ui, agents)) return cancel(ui);

  const skills = initial.skills ?? await ui.multiselect({
    message: '¿Qué skills quieres instalar?',
    options: availableSkills.map((value) => ({ value, label: value })),
    initialValues: availableSkills,
    required: true,
  });
  if (cancelled(ui, skills)) return cancel(ui);

  const mode = initial.mode ?? await ui.select({
    message: '¿Cómo quieres materializar los skills?',
    options: [
      { value: 'auto', label: 'Automático', hint: 'enlace; copia si no es posible' },
      { value: 'copy', label: 'Copiar archivos', hint: 'independiente del checkout' },
    ],
  });
  if (cancelled(ui, mode)) return cancel(ui);

  const withOrchestrator = initial.withOrchestrator ?? await ui.confirm({
    message: '¿Instalar también el agente nativo craft-orchestrator?',
    initialValue: false,
  });
  if (cancelled(ui, withOrchestrator)) return cancel(ui);

  return { scope, agents, skills, mode, withOrchestrator };
}

export function renderPlan({
  plan, mode, orchestratorPlan = [], orchestratorConflicts = [], withOrchestrator = false, cwd,
}) {
  const modeLabel = mode === 'copy' ? 'copia de archivos' : 'enlace automático (copia si falla)';
  const lines = [
    `Modo: ${modeLabel}`,
    ...plan.destinations.map((destination) =>
      `${destination.absPath}  ←  ${destination.skills.length} skills  (cubre: ${destination.covers.join(', ')})`,
    ),
  ];

  if (plan.destinations.length > 0) lines.push(`${cwd}/AGENTS.md  ←  bloque gestionado de craftkit`);
  for (const id of plan.uncovered) {
    lines.push(
      plan.scope === 'global'
        ? `AVISO: ${id} no tiene directorio de skills global; solo lo cubre el bloque gestionado de AGENTS.md.`
        : `AVISO: ${id} no admite skills en ámbito de proyecto; usa --global o confía en AGENTS.md.`,
    );
  }
  for (const id of plan.duplicated) lines.push(`AVISO: ${id} cargaría los skills por duplicado.`);
  for (const conflict of plan.conflicts) lines.push(`CONFLICTO: ${conflict} ya existe y no lo gestiona craftkit.`);
  for (const item of orchestratorPlan) lines.push(`${item.file}  ←  craft-orchestrator (${item.id})`);
  for (const conflict of orchestratorConflicts) lines.push(`CONFLICTO: ${conflict} ya existe y no lo gestiona craftkit.`);
  if (withOrchestrator && orchestratorPlan.length === 0) {
    lines.push('AVISO: ninguno de los agentes elegidos admite craft-orchestrator nativo.');
  }
  if (plan.destinations.length === 0) {
    lines.push('AVISO: no se instalarán skills: ningún agente pedido tiene un destino en este ámbito.');
  }
  return lines;
}

export async function confirmInstall({ lines, hasConflicts, force = false, ui = p }) {
  ui.note(lines.join('\n'), 'Plan de instalación');
  let allowForce = force;
  if (hasConflicts && !force) {
    const overwrite = await ui.confirm({
      message: 'Hay destinos ajenos. ¿Sobrescribirlos con --force?',
      initialValue: false,
    });
    if (cancelled(ui, overwrite) || !overwrite) return null;
    allowForce = true;
  }
  const ok = await ui.confirm({ message: '¿Aplicar este plan?', initialValue: true });
  if (cancelled(ui, ok) || !ok) return cancel(ui);
  return { force: allowForce };
}

export async function promptScope({ scopes, message, ui = p }) {
  if (scopes.length === 1) return scopes[0];
  const scope = await ui.select({
    message,
    options: scopes.map((value) => ({
      value,
      label: value === 'project' ? 'Este proyecto' : 'Global (tu usuario)',
    })),
  });
  return cancelled(ui, scope) ? cancel(ui) : scope;
}

export async function confirmDestructive({ title, lines, ui = p }) {
  ui.note(lines.join('\n'), title);
  const ok = await ui.confirm({ message: '¿Continuar?', initialValue: false });
  return cancelled(ui, ok) || !ok ? cancel(ui) : true;
}

export function startProgress(message, ui = p) {
  const spinner = ui.spinner();
  spinner.start(message);
  return spinner;
}

export function done(message, ui = p) {
  ui.outro(message);
}

function cancel(ui) {
  ui.cancel('Cancelado. No se hicieron cambios.');
  return null;
}
