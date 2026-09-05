export const START = '<!-- craftkit:start -->';
export const END = '<!-- craftkit:end -->';

// Localiza el bloque gestionado por el ULTIMO par START/END. Con indexOf ingenuo, una
// mencion del marcador en la prosa del usuario -- o un START huerfano de un archivo
// editado a mano -- se emparejaba con el END real y borraba EN SILENCIO todo lo que
// hubiera en medio. AGENTS.md es del usuario: ante un archivo malformado preferimos no
// encontrar bloque (y anadir uno nuevo) antes que cortar por donde no es.
function findBlock(content) {
  const end = content.lastIndexOf(END);
  if (end === -1) return null;
  const start = content.lastIndexOf(START, end);
  if (start === -1) return null;
  return { start, end: end + END.length };
}

export function upsertBlock(content, body) {
  const block = `${START}\n${body}\n${END}`;
  const found = findBlock(content);
  if (found) return content.slice(0, found.start) + block + content.slice(found.end);
  if (content.trim() === '') return block + '\n';
  const separator = content.endsWith('\n\n') ? '' : content.endsWith('\n') ? '\n' : '\n\n';
  return content + separator + block + '\n';
}

export function removeBlock(content) {
  const found = findBlock(content);
  if (!found) return content;
  // La normalizacion de saltos se aplica SOLO a la juntura. Un replace sobre todo el
  // archivo colapsaria lineas en blanco que el usuario puso a proposito lejos del bloque.
  const before = content.slice(0, found.start).replace(/\n+$/, '');
  const after = content.slice(found.end).replace(/^\n+/, '');
  const out = before === '' ? after : `${before}\n${after}`;
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
