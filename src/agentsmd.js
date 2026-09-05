export const START = '<!-- craftkit:start -->';
export const END = '<!-- craftkit:end -->';

export function upsertBlock(content, body) {
  const block = `${START}\n${body}\n${END}`;
  const s = content.indexOf(START);
  const e = content.indexOf(END);
  if (s !== -1 && e !== -1) {
    return content.slice(0, s) + block + content.slice(e + END.length);
  }
  if (content.trim() === '') return block + '\n';
  const separator = content.endsWith('\n\n') ? '' : content.endsWith('\n') ? '\n' : '\n\n';
  return content + separator + block + '\n';
}

export function removeBlock(content) {
  const s = content.indexOf(START);
  const e = content.indexOf(END);
  if (s === -1 || e === -1) return content;
  const out = (content.slice(0, s) + content.slice(e + END.length)).replace(/\n{3,}/g, '\n\n');
  return out.trim() === '' ? '' : out;
}

// `relDir` acepta una ruta o varias: install escribe el bloque una sola vez,
// después del bucle de destinos, con todas las rutas que materializó.
export function renderBlock(skillNames, relDir) {
  const dirs = Array.isArray(relDir) ? relDir : [relDir];
  const list = skillNames.map((n) => `- \`${n}\``).join('\n');
  const where = dirs.map((d) => `\`${d}/\``).join(' and ');
  return [
    '## craftkit skills',
    '',
    `Engineering skills are installed at ${where}. Each is a directory with a`,
    '`SKILL.md` describing when it applies. Read the `SKILL.md` of a skill before',
    'starting work that matches its description.',
    '',
    list,
    '',
    'Rules are NOT loaded upfront. Read `engineering-rules/SKILL.md` for the index,',
    'then read only the rule files that apply to the task at hand (at most eight).',
  ].join('\n');
}
