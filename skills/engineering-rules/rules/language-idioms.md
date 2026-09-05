---
name: language-idioms
applies-when: Writing in a language whose local conventions you have not confirmed in this repository.
---

# Language Idioms

## Why

Code that is technically correct but foreign to its language reads as a translation, not a native
text. It fights the type checker, the linter, and the next contributor who expected the local
dialect — and every fight like that is a cost paid on every future change.

## Checklist

1. Read the repo before the docs: existing code, formatter and linter config, type-checker
   settings. Those define the local dialect, and the local dialect wins over the global one.
2. Prefer the standard library over a dependency when it covers the need.
3. Use the language's own error mechanism; do not port another language's.
4. Match the repo's async, nullability, and immutability conventions exactly.
5. Run the repo's formatter and linter; never hand-format against them.

## Idioms by language

| Language | Reach for |
| --- | --- |
| **TypeScript** | discriminated unions, `unknown` over `any`, `readonly`, `satisfies` |
| **Python** | context managers, comprehensions, dataclasses, EAFP |
| **Go** | explicit `error` returns, `defer`, small interfaces defined by the consumer |
| **Java/Kotlin** | records and data classes, nullability types, try-with-resources |
| **C#** | `IDisposable`/`using`, LINQ, nullable reference types |
| **Rust** | `Result` with `?`, ownership over cloning, `Option` over sentinels |

## Do / Don't

```ts
// Don't — porting Go's [error, value] tuple into TypeScript
function parseAmount(input: string): [Error | null, number | null] {
  const n = Number(input);
  if (Number.isNaN(n)) return [new Error('invalid amount'), null];
  return [null, n];
}

// Do — TypeScript's own mechanism: throw, or a typed Result the caller narrows
function parseAmount(input: string): number {
  const n = Number(input);
  if (Number.isNaN(n)) throw new Error('invalid amount');
  return n;
}
```

## Smells

`any` in TypeScript · manual index loops in Python · an ignored `error` in Go · getters and setters
on a Kotlin data class.

## When to ignore

Never as a whole — but when the repo's own convention conflicts with the language's general idiom,
the repo wins.
