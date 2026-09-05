import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { RULES_START, RULES_END, generateIndexTable, syncIndex } from '../src/index-gen.js';

const roots = [];

async function fixture() {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'craftkit-idx-'));
  roots.push(root);
  const rules = path.join(root, 'rules');
  await fs.mkdir(rules, { recursive: true });
  await fs.writeFile(path.join(rules, 'solid.md'), '---\nname: solid\napplies-when: Hay clases\n---\n# SOLID\n');
  await fs.writeFile(path.join(rules, 'ddd.md'), '---\nname: ddd\napplies-when: Dominio complejo\n---\n# DDD\n');
  return { root, rules };
}

after(async () => {
  for (const root of roots) await fs.rm(root, { recursive: true, force: true });
});

test('genera una fila por rule, ordenadas', async () => {
  const { rules } = await fixture();
  const table = await generateIndexTable(rules);
  const rows = table.split('\n').filter((l) => l.startsWith('| `'));
  assert.equal(rows.length, 2);
  assert.ok(rows[0].includes('`ddd`'));
  assert.ok(rows[1].includes('`solid`'));
  assert.ok(rows[1].includes('Hay clases'));
});

test('syncIndex reemplaza solo lo que hay entre marcadores', async () => {
  const { root, rules } = await fixture();
  const skillMd = path.join(root, 'SKILL.md');
  await fs.writeFile(skillMd, `# Rules\n\nIntro.\n\n${RULES_START}\nviejo\n${RULES_END}\n\nCola.\n`);
  const out = await syncIndex(skillMd, rules);
  assert.ok(out.includes('Intro.'));
  assert.ok(out.includes('Cola.'));
  assert.ok(!out.includes('viejo'));
  assert.ok(out.includes('`solid`'));
});

test('un rule cuyo name no casa con el fichero lanza error', async () => {
  const { rules } = await fixture();
  await fs.writeFile(path.join(rules, 'mal.md'), '---\nname: otro\napplies-when: X\n---\n');
  await assert.rejects(() => generateIndexTable(rules), /does not match filename/);
});

test('una barra vertical en applies-when no rompe la tabla', async () => {
  const { rules } = await fixture();
  await fs.writeFile(path.join(rules, 'pipes.md'), '---\nname: pipes\napplies-when: A | B\n---\n');
  const row = (await generateIndexTable(rules)).split('\n').find((l) => l.includes('`pipes`'));
  assert.equal(row.split('|').length, 4);
});

test('sin marcadores lanza un error accionable', async () => {
  const { root, rules } = await fixture();
  const skillMd = path.join(root, 'sin.md');
  await fs.writeFile(skillMd, '# Rules\n');
  await assert.rejects(() => syncIndex(skillMd, rules), /craftkit:rules:start/);
});

test('un rule sin applies-when lanza error', async () => {
  const { rules } = await fixture();
  await fs.writeFile(path.join(rules, 'roto.md'), '---\nname: roto\n---\n# Roto\n');
  await assert.rejects(() => generateIndexTable(rules), /applies-when/);
});
