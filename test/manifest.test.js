import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { MANIFEST_NAME, readManifest, writeManifest, removeManifest } from '../src/manifest.js';

const roots = [];

const tmp = async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'craftkit-mf-'));
  roots.push(root);
  return root;
};

const sample = {
  schema: 1,
  craftkitVersion: '0.1.0',
  scope: 'project',
  installedAt: '2026-09-04T00:00:00.000Z',
  entries: [{ skill: 'craft-architect', mode: 'copy', files: ['SKILL.md'] }],
};

after(async () => {
  for (const root of roots) await fs.rm(root, { recursive: true, force: true });
});

test('devuelve null si no hay manifiesto', async () => {
  assert.equal(await readManifest(await tmp()), null);
});

test('escribe y relee sin perder información', async () => {
  const root = await tmp();
  await writeManifest(root, sample);
  assert.deepEqual(await readManifest(root), sample);
});

test('un manifiesto corrupto se trata como inexistente', async () => {
  const root = await tmp();
  await fs.writeFile(path.join(root, MANIFEST_NAME), '{ no es json');
  assert.equal(await readManifest(root), null);
});

test('removeManifest es idempotente', async () => {
  const root = await tmp();
  await writeManifest(root, sample);
  await removeManifest(root);
  await removeManifest(root);
  assert.equal(await readManifest(root), null);
});
