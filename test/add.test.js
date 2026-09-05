import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { addRule, addSkill } from '../src/commands/add.js';
import { RULES_START, RULES_END } from '../src/index-gen.js';

const roots = [];

async function pkg() {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'craftkit-add-'));
  roots.push(root);
  const rules = path.join(root, 'skills', 'engineering-rules', 'rules');
  await fs.mkdir(rules, { recursive: true });
  await fs.mkdir(path.join(root, 'templates'), { recursive: true });
  await fs.writeFile(path.join(root, 'templates', 'rule.md'),
    '---\nname: RULE_NAME\napplies-when: <cond>\n---\n\n# RULE_TITLE\n\n## Why\n\n## Checklist\n\n## Do / Don\'t\n\n## Smells\n\n## When to ignore\n');
  await fs.writeFile(path.join(root, 'templates', 'skill.md'),
    '---\nname: SKILL_NAME\ndescription: Use when <trigger>\n---\n\n# SKILL_TITLE\n');
  await fs.writeFile(path.join(rules, 'solid.md'), '---\nname: solid\napplies-when: Hay clases\n---\n# SOLID\n');
  await fs.writeFile(path.join(root, 'skills', 'engineering-rules', 'SKILL.md'),
    `# Rules\n\n${RULES_START}\n${RULES_END}\n`);
  return root;
}

after(async () => {
  for (const root of roots) await fs.rm(root, { recursive: true, force: true });
});

test('addRule crea el archivo desde plantilla y actualiza el índice', async () => {
  const root = await pkg();
  const { file } = await addRule({ packageRoot: root, name: 'caching' });
  const text = await fs.readFile(file, 'utf8');
  assert.ok(text.includes('name: caching'));
  assert.ok(!text.includes('RULE_NAME'));
  const index = await fs.readFile(path.join(root, 'skills', 'engineering-rules', 'SKILL.md'), 'utf8');
  assert.ok(index.includes('`caching`'));
  assert.ok(index.includes('`solid`'));
});

test('addRule rechaza un nombre inválido', async () => {
  const root = await pkg();
  await assert.rejects(() => addRule({ packageRoot: root, name: 'Mi Regla' }), /invalid name/i);
});

test('addRule no sobrescribe un rule existente', async () => {
  const root = await pkg();
  await assert.rejects(() => addRule({ packageRoot: root, name: 'solid' }), /already exists/i);
});

test('addSkill crea el directorio con su SKILL.md', async () => {
  const root = await pkg();
  const { dir } = await addSkill({ packageRoot: root, name: 'craft-migration' });
  const text = await fs.readFile(path.join(dir, 'SKILL.md'), 'utf8');
  assert.ok(text.includes('name: craft-migration'));
  assert.ok(!text.includes('SKILL_NAME'));
});
