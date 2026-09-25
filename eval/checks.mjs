import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import fs from 'node:fs/promises';

const cases = JSON.parse(await fs.readFile(new URL('./cases.json', import.meta.url), 'utf8'));

const selected = process.env.EVAL_CASE;
assert.ok(cases.some(({ id }) => id === selected), 'Set EVAL_CASE to an id in eval/cases.json');
assert.ok(process.env.EVAL_IMPLEMENTATION, 'Set EVAL_IMPLEMENTATION to the candidate .mjs file');
const candidate = await import(pathToFileURL(path.resolve(process.env.EVAL_IMPLEMENTATION)).href);

const checks = {
  authorization() {
    test('only the owner can read; denied and missing records reveal no content', async () => {
      const document = { id: 'doc', ownerId: 'alice', body: 'private' };
      const store = { findById: async (id) => id === 'doc' ? document : null };
      assert.deepEqual(await candidate.readDocument(store, { id: 'alice' }, 'doc'), document);
      for (const actor of [null, {}, { id: 'bob' }]) {
        await assert.rejects(() => candidate.readDocument(store, actor, 'doc'), { message: 'not found' });
      }
      await assert.rejects(() => candidate.readDocument(store, { id: 'alice' }, 'missing'), { message: 'not found' });
    });
  },
  concurrency() {
    test('concurrent callers have exactly one winner without sleeps', async () => {
      let available = true;
      const store = {
        findById: async () => ({ available }),
        markReserved: async () => { available = false; },
        updateIfAvailable: async () => {
          if (!available) return false;
          available = false;
          return true;
        },
      };
      const outcomes = await Promise.allSettled(
        Array.from({ length: 20 }, () => candidate.reserveSeat(store, 'seat')),
      );
      assert.equal(outcomes.filter(({ status }) => status === 'fulfilled').length, 1);
      for (const result of outcomes.filter(({ status }) => status === 'rejected')) {
        assert.equal(result.reason.message, 'unavailable');
      }
      assert.equal(available, false);
    });
  },
  'bounded-access'() {
    test('bounded pages cover the dataset without per-row lookups', async () => {
      const accesses = [];
      const db = {
        findAll: async () => { throw new Error('unbounded read'); },
        findCustomer: async () => { throw new Error('per-row query'); },
        readPage: async ({ limit, cursor }) => {
          assert.ok(Number.isInteger(limit) && limit >= 1 && limit <= 100);
          accesses.push({ limit, cursor });
          const count = Math.min(limit, Math.max(0, 1_000_000 - cursor));
          return {
            rows: Array.from({ length: count }, (_, i) => ({ id: cursor + i, customer: { id: cursor + i } })),
            nextCursor: cursor + count < 1_000_000 ? cursor + count : null,
          };
        },
      };
      const first = await candidate.listOrders(db);
      assert.equal(first.rows.length, 20);
      assert.equal(first.nextCursor, 20);
      const next = await candidate.listOrders(db, { limit: 100, cursor: first.nextCursor });
      assert.deepEqual(next.rows.map(({ id }) => id), Array.from({ length: 100 }, (_, i) => i + 20));
      assert.ok(next.rows.every(({ customer }) => customer));
      const last = await candidate.listOrders(db, { limit: 100, cursor: 999_999 });
      assert.equal(last.rows.length, 1);
      assert.equal(last.nextCursor, null);
      const empty = await candidate.listOrders(db, { cursor: 1_000_000 });
      assert.deepEqual(empty, { rows: [], nextCursor: null });
      assert.equal(accesses.length, 4);
      for (const options of [{ limit: 0 }, { limit: 101 }, { limit: 1.5 }, { limit: '20' }, { cursor: -1 }, { cursor: 0.5 }]) {
        await assert.rejects(() => candidate.listOrders(db, options), { message: 'invalid pagination' });
      }
      assert.equal(accesses.length, 4, 'invalid input must fail before I/O');
    });
  },
  'closed-variant'() {
    test('closed pricing variants preserve old behavior', () => {
      for (const amount of [0, 100, 250]) {
        assert.equal(candidate.priceFor('standard', amount), amount);
        assert.equal(candidate.priceFor('vip', amount), amount * 0.9);
        assert.equal(candidate.priceFor('employee', amount), amount * 0.7);
      }
      assert.throws(() => candidate.priceFor('other', 100));
    });
  },
  'shared-knowledge'() {
    test('both public consumers obey the pricing contract', () => {
      for (const consumer of [candidate.invoiceTotal, candidate.checkoutTotal]) {
        for (const amount of [0, 100, 250]) {
          assert.equal(consumer('standard', amount), amount);
          assert.equal(consumer('vip', amount), amount * 0.9);
        }
        assert.throws(() => consumer('other', 100));
      }
    });
  },
  'localized-bug'() {
    test('amount parsing is complete, exact, and bounded', () => {
      for (const [input, cents] of [['0', 0], ['12.50', 1250], ['1.1', 110], ['0.29', 29], ['001.20', 120], ['90071992547409.91', Number.MAX_SAFE_INTEGER]]) {
        assert.equal(candidate.parseAmount(input), cents);
      }
      for (const input of ['12,50', '12x', '1.234', '1.', '.5', '-1', '+1', ' 1', '1 ', '1\n', '', '1e3', 'Infinity', '90071992547409.92', 12, null]) {
        assert.throws(() => candidate.parseAmount(input), { message: 'invalid amount' });
      }
    });
  },
};

checks[selected]();
