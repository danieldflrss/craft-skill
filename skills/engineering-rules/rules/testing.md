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

1. Write the failing test first and run it to confirm it fails for the right reason. A test never
   seen red proves nothing.
2. One behavior per test. The name states the behavior and its condition:
   `rejects a transfer when the balance is insufficient`.
3. Arrange, Act, Assert — visibly separated. A huge arrange section is a design signal, not a test
   problem.
4. Test through public behavior, not internals. Tests asserting on private calls break on every
   refactor.
5. Pyramid: many fast unit tests, fewer integration tests at real boundaries, very few end-to-end.
6. Prefer fakes and stubs. Use mocks with call verification only where the interaction *is* the
   behavior. Never mock what you do not own — wrap it and fake the wrapper.
7. Determinism: inject clock, randomness, and identifiers. No sleeps, no dependence on test order,
   no shared mutable fixtures.
8. Coverage is a signal, never a target. An untested branch matters; a percentage does not.
9. Test boundaries and error paths — that is where the bugs live. Do not test the framework or
   trivial accessors.

## Do / Don't

```ts
// Don't — asserts on how the result was produced; breaks on any refactor
it('rejects an insufficient balance', () => {
  const spy = jest.spyOn(account, 'getBalance');
  service.withdraw(account, 100);
  expect(spy).toHaveBeenCalledTimes(1);
});

// Do — asserts on the observable behavior itself
it('rejects a withdrawal when the balance is insufficient', () => {
  const account = new Account({ balance: 50 });
  expect(() => service.withdraw(account, 100)).toThrow(InsufficientBalanceError);
});
```

## Smells

an `if` inside a test · a test that still passes when the implementation is deleted · `sleep(500)`
· tests that must run in order.

## When to ignore

Throwaway spikes, explicitly labeled as such and deleted afterwards.
