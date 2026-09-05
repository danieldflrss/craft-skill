---
name: anti-patterns
applies-when: Reviewing or extending code you did not write.
---

# Anti-Patterns

## Why

These shapes recur across codebases because each one looks like a reasonable shortcut the day it
is introduced. What they share is a cost that shows up later — in the reviewer who cannot find the
rule, or the change that should touch one file and ends up touching twenty.

## Checklist

Each entry names a detection signal and its fix. Recognizing the signal is the checkable act.

1. **God object** — touched by most features. Fix: split by responsibility.
2. **Anemic domain model** — entities of getters and setters with all rules in "services". Fix:
   move invariants into the entity.
3. **Primitive obsession** — `string` for email, money, or id. Fix: value objects that validate on
   construction.
4. **Shotgun surgery** — one requirement forces edits across many files. Fix: colocate what changes
   together.
5. **Feature envy** — a method that mostly reads another object's data. Fix: move the method to
   that object.
6. **Stringly typed** — behavior switched by magic strings. Fix: union types or enums.
7. **Singleton as global state** — a hidden, untestable dependency. Fix: inject it.
8. **Leaky abstraction** — the interface exposes its implementation, e.g. an ORM entity crossing
   the API boundary. Fix: a DTO at the boundary.

## Do / Don't

```ts
// Don't — primitive obsession: any string satisfies the type, valid or not
function sendReceipt(email: string, amountCents: number): void { /* ... */ }
sendReceipt('not-an-email', -500);

// Do — a value object that makes the invalid state unrepresentable
class Email {
  private constructor(readonly value: string) {}
  static parse(input: string): Email {
    if (!input.includes('@')) throw new Error(`invalid email: ${input}`);
    return new Email(input);
  }
}
function sendReceipt(email: Email, amountCents: number): void { /* ... */ }
```

## Smells

a file every PR touches · a class with no methods, only fields and accessors · an id or amount
typed as `string`/`number` with validation scattered at every call site · a `switch` on a string
that is not an enum · `Singleton.getInstance()` in business logic · a repository returning ORM
entities from a public method.

## When to ignore

Do not refactor an anti-pattern you are not otherwise touching. Record it and move on — fixing it
is a separate, deliberate change, not a side effect of the one you came to make.
