#!/usr/bin/env node
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { agentIds } from './targets.js';
import { planInstall, install } from './commands/install.js';
import { status } from './commands/status.js';
import { uninstall } from './commands/uninstall.js';

// `commands/add.js` se importa de forma diferida: lo crea la Task 17, y este
// módulo debe poder cargarse (y testearse) antes de que exista.

const COMMANDS = ['install', 'update', 'uninstall', 'status', 'add-rule', 'add-skill'];
const PKG_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export function parseArgs(argv) {
  const [first, ...rest] = argv;
  const command = first && !first.startsWith('-') ? first : 'install';
  if (!COMMANDS.includes(command)) throw new Error(`Unknown command: ${command}`);
  const args = first && !first.startsWith('-') ? rest : argv;

  const flags = { mode: 'auto', force: false, dryRun: false, yes: false };
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--agents') flags.agents = requireValue('--agents', args[++i]).map(assertAgent);
    else if (arg === '--skills') flags.skills = requireValue('--skills', args[++i]);
    else if (arg === '--global') flags.scope = 'global';
    else if (arg === '--local') flags.scope = 'project';
    else if (arg === '--copy') flags.mode = 'copy';
    else if (arg === '--force') flags.force = true;
    else if (arg === '--dry-run') flags.dryRun = true;
    else if (arg === '--yes' || arg === '-y') flags.yes = true;
    else if (!arg.startsWith('-')) flags.name = arg;
    else throw new Error(`Unknown flag: ${arg}`);
  }
  return { command, flags };
}

const split = (value) => String(value ?? '').split(',').map((s) => s.trim()).filter(Boolean);

// Una bandera de lista sin valor devolvia [] en silencio. Un array vacio es truthy, asi
// que la guarda de mas abajo no saltaba, el resolvedor daba cero destinos, y el comando
// reportaba exito sin instalar nada. Fallar aqui es la unica opcion honesta.
function requireValue(flag, value) {
  const parts = split(value);
  if (parts.length === 0) throw new Error(`${flag} necesita un valor.`);
  return parts;
}

function assertAgent(id) {
  if (!agentIds().includes(id)) throw new Error(`Unknown agent: ${id}`);
  return id;
}

async function main(argv) {
  const { command, flags } = parseArgs(argv);
  const ctx = { cwd: process.cwd(), home: os.homedir() };
  const sourceDir = path.join(PKG_ROOT, 'skills');
  const version = JSON.parse(await fs.readFile(path.join(PKG_ROOT, 'package.json'), 'utf8')).version;

  if (command === 'status') {
    const rows = await status(ctx);
    console.log(rows.length === 0 ? 'craftkit no está instalado aquí.' : JSON.stringify(rows, null, 2));
    return;
  }
  if (command === 'uninstall') {
    const { removed } = await uninstall(ctx);
    console.log(`Eliminados ${removed.length} skills.`);
    return;
  }
  if (command === 'add-rule' || command === 'add-skill') {
    const add = await import('./commands/add.js');
    const fn = command === 'add-rule' ? add.addRule : add.addSkill;
    const created = await fn({ packageRoot: PKG_ROOT, name: flags.name });
    console.log(`Creado: ${created.file ?? created.dir}`);
    return;
  }

  let { scope, agents, skills } = flags;

  if (command === 'update') {
    // `update` re-aplica la seleccion registrada: los agentes salen de los manifiestos,
    // no de flags ni de una deduccion por ruta, que seria ambigua (`.claude/skills`
    // sirve a la vez a claude-code y a opencode). Un flag explicito tiene prioridad,
    // para poder cambiar la seleccion en la misma operacion.
    const rows = await status(ctx);
    if (rows.length === 0) throw new Error('craftkit no esta instalado aqui; usa install.');
    agents = agents ?? [...new Set(rows.flatMap((r) => r.agents))];
    scope = scope ?? rows[0].scope;
    await uninstall(ctx);
  }
  const interactive = process.stdin.isTTY && !flags.yes && (!agents || !scope);
  if (interactive) {
    const { detectAgents } = await import('./detect.js');
    const { promptSetup, confirmPlan, done } = await import('./prompts.js');
    const entries = await fs.readdir(sourceDir, { withFileTypes: true });
    const answers = await promptSetup({
      detected: await detectAgents(ctx),
      availableSkills: entries.filter((e) => e.isDirectory()).map((e) => e.name).sort(),
    });
    if (answers === null) return;
    ({ scope, agents, skills } = answers);
    const plan = await planInstall({ ...ctx, scope, agents, skills, sourceDir, version });
    if ((await confirmPlan(describe(plan))) === null) return;
    await install({ ...ctx, scope, agents, skills, sourceDir, version, mode: flags.mode, force: flags.force });
    done('Listo.');
    return;
  }

  // Se llega aqui sin TTY o con --yes, asi que el mensaje no puede hablar solo de TTY.
  if (!agents) throw new Error('Modo no interactivo: --agents es obligatorio.');
  const result = await install({
    ...ctx, scope: scope ?? 'project', agents, skills, sourceDir, version,
    mode: flags.mode, force: flags.force, dryRun: flags.dryRun,
  });
  describe(result.plan).forEach((line) => console.log(line));
}

function describe(plan) {
  const lines = plan.destinations.map(
    (d) => `${d.path}  <-  ${d.skills.length} skills  (cubre: ${d.covers.join(', ')})`,
  );
  for (const id of plan.uncovered) {
    lines.push(`AVISO: ${id} no admite skills en ámbito de proyecto; usa --global o confía en AGENTS.md.`);
  }
  for (const id of plan.duplicated) lines.push(`AVISO: ${id} cargaría los skills por duplicado.`);
  return lines;
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('cli.js')) {
  main(process.argv.slice(2)).catch((err) => {
    console.error(err.message);
    process.exitCode = 1;
  });
}
