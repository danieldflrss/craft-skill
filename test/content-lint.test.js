import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseFrontmatter } from '../src/frontmatter.js';
import { generateIndexTable, RULES_START, RULES_END } from '../src/index-gen.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SKILLS = path.join(ROOT, 'skills');
const RULES = path.join(SKILLS, 'engineering-rules', 'rules');
const NAME = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const SECTIONS = ['## Why', '## Checklist', '## Do / Don\'t', '## Smells', '## When to ignore'];

const dirs = async (p) =>
  (await fs.readdir(p, { withFileTypes: true })).filter((e) => e.isDirectory()).map((e) => e.name);

test('cada SKILL.md tiene frontmatter válido y coherente con su directorio', async () => {
  for (const name of await dirs(SKILLS)) {
    const { data } = parseFrontmatter(await fs.readFile(path.join(SKILLS, name, 'SKILL.md'), 'utf8'));
    assert.equal(data.name, name, `${name}: name no coincide con el directorio`);
    assert.match(data.name, NAME, `${name}: nombre inválido`);
    assert.ok(data.description?.length >= 1 && data.description.length <= 1024, `${name}: description fuera de rango`);
  }
});

test('los cinco skills de flujo llevan prefijo craft-', async () => {
  const names = await dirs(SKILLS);
  assert.equal(names.filter((n) => n.startsWith('craft-')).length, 5);
  assert.ok(names.includes('engineering-rules'));
});

test('cada rule tiene las cinco secciones obligatorias y no pasa de 120 líneas', async () => {
  for (const file of (await fs.readdir(RULES)).filter((f) => f.endsWith('.md'))) {
    const text = await fs.readFile(path.join(RULES, file), 'utf8');
    for (const section of SECTIONS) {
      assert.ok(text.includes(section), `${file}: falta la sección ${section}`);
    }
    assert.ok(text.split('\n').length <= 120, `${file}: supera las 120 líneas`);
    const { data } = parseFrontmatter(text);
    assert.equal(data.name, path.basename(file, '.md'));
    assert.ok(data['applies-when']?.length > 0, `${file}: falta applies-when`);
  }
});

test('el índice está sincronizado con el directorio de rules', async () => {
  const skillMd = await fs.readFile(path.join(SKILLS, 'engineering-rules', 'SKILL.md'), 'utf8');
  const s = skillMd.indexOf(RULES_START) + RULES_START.length;
  const e = skillMd.indexOf(RULES_END);
  assert.equal(skillMd.slice(s, e).trim(), (await generateIndexTable(RULES)).trim());
});

test('ninguna referencia relativa a un rule está rota', async () => {
  for (const name of await dirs(SKILLS)) {
    const file = path.join(SKILLS, name, 'SKILL.md');
    const text = await fs.readFile(file, 'utf8');
    for (const m of text.matchAll(/\.\.\/engineering-rules\/rules\/([a-z0-9-]+)\.md/g)) {
      await fs.access(path.join(RULES, `${m[1]}.md`));
    }
  }
});
