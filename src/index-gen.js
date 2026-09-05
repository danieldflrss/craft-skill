import fs from 'node:fs/promises';
import path from 'node:path';
import { parseFrontmatter } from './frontmatter.js';

export const RULES_START = '<!-- craftkit:rules:start -->';
export const RULES_END = '<!-- craftkit:rules:end -->';

export async function readRuleMeta(file) {
  const { data } = parseFrontmatter(await fs.readFile(file, 'utf8'));
  const expected = path.basename(file, '.md');
  if (data.name !== expected) {
    throw new Error(`${file}: frontmatter name "${data.name}" does not match filename "${expected}"`);
  }
  if (!data['applies-when']) throw new Error(`${file}: missing "applies-when" in frontmatter`);
  return { name: data.name, appliesWhen: data['applies-when'] };
}

export async function generateIndexTable(rulesDir) {
  const files = (await fs.readdir(rulesDir)).filter((f) => f.endsWith('.md')).sort();
  const metas = [];
  for (const file of files) metas.push(await readRuleMeta(path.join(rulesDir, file)));
  return [
    '| Rule | Read it when |',
    '| --- | --- |',
    // Una barra vertical sin escapar en applies-when parte la tabla markdown sin dar
    // ningun error, justo en el modulo cuyo trabajo es que el indice sea confiable.
    ...metas.map((m) => `| \`${m.name}\` | ${m.appliesWhen.replaceAll('|', '\\|')} |`),
  ].join('\n');
}

export async function syncIndex(skillMdPath, rulesDir) {
  const content = await fs.readFile(skillMdPath, 'utf8');
  const s = content.indexOf(RULES_START);
  const e = content.indexOf(RULES_END);
  if (s === -1 || e === -1) {
    throw new Error(`${skillMdPath}: missing ${RULES_START} / ${RULES_END} markers`);
  }
  const table = await generateIndexTable(rulesDir);
  const next = content.slice(0, s) + `${RULES_START}\n${table}\n` + content.slice(e);
  await fs.writeFile(skillMdPath, next, 'utf8');
  return next;
}
