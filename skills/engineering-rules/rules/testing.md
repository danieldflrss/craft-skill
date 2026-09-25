---
name: testing
applies-when: Implementing any change in behavior.
---

# Testing

## Why

A test suite is the only artifact that tells the next person — often you, in six months — whether a
change broke something, without them having to read and simulate the code by hand. A suite that
passes regardless of what the implementation does is worse than no suite: it spends review
attention on green checkmarks that mean nothing.

## Checklist

1. For a reproducible bug, run a regression test or reproduction before the fix and confirm the
   failure reason. Prefer test-first for new behavior; choose checks that detect a plausible wrong
   implementation rather than tests that mirror the code. Report when reproduction is unavailable.
2. One behavior per test. The name states the behavior and its condition:
   `rejects a transfer when the balance is insufficient`.
3. Arrange, Act, Assert — visibly separated. A huge arrange section is a design signal, not a test
   problem.
4. Test through public behavior, not internals. Tests asserting on private calls break on every
   refactor.
5. Choose test levels by risk: fast behavior tests, real-boundary integration checks for storage,
   transactions, and protocols, and end-to-end tests for critical journeys.
6. Use fakes and stubs for controlled failures and isolated logic. Verify real integration contracts
   where a fake cannot establish correctness. Mock calls only when the interaction is the behavior;
   avoid coupling tests to third-party implementation details.
7. Determinism: inject clock, randomness, and identifiers. No sleeps, no dependence on test order,
   no shared mutable fixtures.
8. Coverage is a signal, never a target. An untested branch matters; a percentage does not.
9. Test boundaries and error paths — that is where the bugs live. Do not test the framework or
   trivial accessors.

## Do / Don't

```ts
// Don't — asserts a collaborator was called; passes even if the balance is wrong
const calls: string[] = [];
const audit = { record: (event: string) => calls.push(event) };
service.withdraw(richAccount, 100, audit);
if (calls.length !== 1) throw new Error('expected audit.record to be called');

// Do — asserts what the caller actually observes
try {
  service.withdraw(poorAccount, 100, audit);
  throw new Error('expected an overdraft to be rejected');
} catch (err) {
  if (!(err instanceof InsufficientBalanceError)) throw err;
}
```

## Smells

an `if` inside a test · a test that still passes when the implementation is deleted · `sleep(500)`
· tests that must run in order.

## When to ignore

Throwaway spikes explicitly labeled for deletion, or non-behavioral edits already covered by
appropriate static or content checks. Do not add redundant tests just to satisfy a ritual.
