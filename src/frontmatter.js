const BLOCK = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;
const LINE = /^([A-Za-z0-9_-]+):\s*(.*)$/;

export function parseFrontmatter(text) {
  const match = BLOCK.exec(text);
  if (!match) return { data: {}, body: text };
  const data = {};
  for (const line of match[1].split(/\r?\n/)) {
    const entry = LINE.exec(line);
    if (!entry) continue;
    let value = entry[2].trim();
    const quoted = (value.startsWith('"') && value.endsWith('"')) ||
                   (value.startsWith("'") && value.endsWith("'"));
    if (quoted && value.length >= 2) value = value.slice(1, -1);
    data[entry[1]] = value;
  }
  return { data, body: text.slice(match[0].length) };
}
