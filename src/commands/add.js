import fs from 'node:fs/promises';
import path from 'node:path';
import { syncIndex } from '../index-gen.js';

const NAME = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function title(name) {
  return name.split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join(' ');
}

async function refuseIfExists(target) {
  if (await fs.lstat(target).catch(() => null)) {
    throw new Error(`already exists: ${target}`);
  }
}

export async function addRule({ packageRoot, name }) {
  if (!name || !NAME.test(name)) throw new Error(`invalid name: ${name}`);
  const rulesDir = path.join(packageRoot, 'skills', 'engineering-rules', 'rules');
  const file = path.join(rulesDir, `${name}.md`);
  await refuseIfExists(file);

  const template = await fs.readFile(path.join(packageRoot, 'templates', 'rule.md'), 'utf8');
  await fs.writeFile(file, template.replaceAll('RULE_NAME', name).replaceAll('RULE_TITLE', title(name)), 'utf8');
  // Si esto falla, el archivo de la rule ya escrito arriba queda en disco y el indice
  // no se regenera: es un fallo intencionado (fail-loud), no una limpieza a medias.
  // Solo ocurre cuando a SKILL.md ya le faltan los marcadores <!-- craftkit:rules:* -->.
  await syncIndex(path.join(packageRoot, 'skills', 'engineering-rules', 'SKILL.md'), rulesDir);
  return { file };
}

export async function addSkill({ packageRoot, name }) {
  if (!name || !NAME.test(name)) throw new Error(`invalid name: ${name}`);
  const dir = path.join(packageRoot, 'skills', name);
  await refuseIfExists(dir);

  const template = await fs.readFile(path.join(packageRoot, 'templates', 'skill.md'), 'utf8');
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(
    path.join(dir, 'SKILL.md'),
    template.replaceAll('SKILL_NAME', name).replaceAll('SKILL_TITLE', title(name)),
    'utf8',
  );
  return { dir };
}
