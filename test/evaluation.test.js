import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const exec = promisify(execFile);
const ROOT = fileURLToPath(new URL('..', import.meta.url));
const cases = JSON.parse(await fs.readFile(path.join(ROOT, 'eval/cases.json'), 'utf8'));
const roots = [];

after(async () => {
  for (const root of roots) await fs.rm(root, { recursive: true, force: true });
});

async function evaluate(id, implementation) {
  const env = { ...process.env, EVAL_CASE: id, EVAL_IMPLEMENTATION: implementation };
  // This is an independent runner, not a worker of the parent node:test process.
  delete env.NODE_TEST_CONTEXT;
  return exec(process.execPath, ['--test', '--test-reporter=tap', 'eval/checks.mjs'], {
    cwd: ROOT,
    env,
    timeout: 10_000,
  });
}

test('evaluation rejects the known-defective starter for every case', async (t) => {
  assert.equal(new Set(cases.map(({ id }) => id)).size, 6);
  for (const { id } of cases) {
    await t.test(id, async () => {
      await assert.rejects(evaluate(id, path.join(ROOT, 'eval/starter.mjs')), (error) => {
        assert.equal(error.code, 1);
        assert.match(error.stdout, /AssertionError|unbounded read|unknown customer kind/);
        return true;
      });
    });
  }
});

test('evaluation accepts a contract-correct candidate for every case', async (t) => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'craftkit-evaluation-'));
  roots.push(root);
  const implementation = path.join(root, 'candidate.mjs');
  await fs.writeFile(implementation, `
export async function readDocument(store, actor, id) {
  const document = await store.findById(id);
  if (!actor?.id || !document || actor.id !== document.ownerId) throw new Error('not found');
  return document;
}
export async function reserveSeat(store, id) {
  if (!await store.updateIfAvailable(id)) throw new Error('unavailable');
}
export async function listOrders(db, { limit = 20, cursor = 0 } = {}) {
  if (!Number.isInteger(limit) || limit < 1 || limit > 100 || !Number.isInteger(cursor) || cursor < 0) {
    throw new Error('invalid pagination');
  }
  return db.readPage({ limit, cursor });
}
export function priceFor(kind, amount) {
  switch (kind) {
    case 'standard': return amount;
    case 'vip': return amount * 0.9;
    case 'employee': return amount * 0.7;
    default: throw new Error('unknown customer kind');
  }
}
export function invoiceTotal(kind, amount) { return priceFor(kind, amount); }
export function checkoutTotal(kind, amount) { return priceFor(kind, amount); }
export function parseAmount(input) {
  if (typeof input !== 'string' || input.trim() !== input || !/^[0-9]+(?:\\.[0-9]{1,2})?$/.test(input)) throw new Error('invalid amount');
  const [whole, fraction = ''] = input.split('.');
  const cents = BigInt(whole) * 100n + BigInt(fraction.padEnd(2, '0'));
  if (cents > BigInt(Number.MAX_SAFE_INTEGER)) throw new Error('invalid amount');
  return Number(cents);
}
`);
  for (const { id } of cases) {
    await t.test(id, async () => {
      const { stdout } = await evaluate(id, implementation);
      assert.match(stdout, /# tests 1\b/);
      assert.match(stdout, /# pass 1\b/);
    });
  }
});
