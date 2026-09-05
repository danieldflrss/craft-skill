import path from 'node:path';

export const AGENTS = {
  'claude-code': {
    label: 'Claude Code',
    detect: ['~/.claude', '.claude'],
    paths: { project: ['.claude/skills'], global: ['~/.claude/skills'] },
  },
  opencode: {
    label: 'OpenCode',
    detect: ['~/.config/opencode', '.opencode'],
    paths: {
      project: ['.agents/skills', '.claude/skills', '.opencode/skills'],
      global: ['~/.agents/skills', '~/.claude/skills', '~/.config/opencode/skills'],
    },
  },
  codex: {
    label: 'Codex CLI',
    detect: ['~/.codex'],
    paths: { project: [], global: ['~/.agents/skills', '~/.codex/skills'] },
  },
  cursor: {
    label: 'Cursor',
    detect: ['~/.cursor', '.cursor'],
    paths: { project: ['.cursor/skills'], global: [] },
  },
  windsurf: {
    label: 'Windsurf',
    detect: ['~/.windsurf', '.windsurf'],
    paths: { project: ['.windsurf/skills'], global: [] },
  },
  'gemini-cli': {
    label: 'Gemini CLI',
    detect: ['~/.gemini', '.gemini'],
    paths: {
      project: ['.agents/skills', '.gemini/skills'],
      global: ['~/.agents/skills', '~/.gemini/skills'],
    },
  },
};

export function agentIds() {
  return Object.keys(AGENTS);
}

export function pathsFor(agentId, scope) {
  const agent = AGENTS[agentId];
  if (!agent) throw new Error(`Unknown agent: ${agentId}`);
  return agent.paths[scope] ?? [];
}

export function candidatePaths(ids, scope) {
  const set = new Set();
  for (const id of ids) for (const p of pathsFor(id, scope)) set.add(p);
  return [...set].sort();
}

// Un `~` suelto y las rutas absolutas se resuelven antes de llegar a `path.join`:
// `path.join` no re-enraiza, asi que `join(cwd, '/etc/foo')` daria `cwd/etc/foo`,
// una corrupcion silenciosa. Ninguna entrada de AGENTS los usa hoy; el guardado
// existe porque esta funcion es la unica resolucion de rutas del paquete.
export function resolveDest(p, { cwd, home }) {
  if (p === '~') return home;
  if (p.startsWith('~/')) return path.join(home, p.slice(2));
  if (path.isAbsolute(p)) return path.normalize(p);
  return path.join(cwd, p);
}
