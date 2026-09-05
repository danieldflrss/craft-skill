---
name: error-handling
applies-when: The code crosses a boundary: I/O, network, parsing, or user input.
---

# Error Handling

## Why

A boundary is where your assumptions about the world stop holding: the network drops, the file
is missing, the caller sends garbage. What happens at that instant decides whether the system
degrades in a way an operator can diagnose, or fails silently and resurfaces later as a support
ticket with no explanation attached. Handling errors deliberately, at the boundary, is what keeps
the failure local instead of letting it spread.

## Checklist

1. Distinguish expected errors (bad input, not found, conflict) from bugs (a broken invariant).
   Expected errors belong in the signature; bugs must fail loudly.
2. Never catch without handling, translating, or rethrowing. An empty `catch` is forbidden.
3. Preserve the cause when wrapping (`new Error(msg, { cause })`). Never discard the original.
4. Every I/O call has an explicit timeout. No timeout, no availability.
5. Retry only idempotent operations, with exponential backoff, jitter, and a cap. Never retry a
   `4xx`.
6. Validate input once, at the boundary, and trust it afterwards.
7. The message shown to the user and the detail written to the log are different artifacts. Never
   expose internals to the caller.
8. Add a circuit breaker where a dependency's failure would otherwise exhaust your own resources.

## Do / Don't

```ts
// Don't — the catch swallows the failure and loses the cause
async function loadUser(id: string): Promise<User | null> {
  try {
    return await db.users.findById(id);
  } catch {
    return null; // not found, or is the database down?
  }
}

// Do — translate to a typed error and preserve the cause
async function loadUser(id: string): Promise<User> {
  try {
    return await db.users.findById(id);
  } catch (cause) {
    throw new Error(`failed to load user ${id}`, { cause });
  }
}
```

## Smells

`catch {}` · errors carried as `string` · one `try` wrapping sixty lines · retries with no cap ·
a rethrow that loses the cause.

## When to ignore

One-off scripts and throwaway prototypes, where failing fast without a taxonomy is correct.
