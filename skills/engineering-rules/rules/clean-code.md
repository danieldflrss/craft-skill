---
name: clean-code
applies-when: Any code you write or modify.
---

# Clean Code

## Why

Code is read far more often than it is written. When names, structure, and shape don't carry
intent, every reader — including you in six months — has to re-derive what the code already knew
and then lost.

## Checklist

1. Names state intent: a function name says what it does or returns; booleans read as predicates
   (`isExpired`, not `flag`).
2. No abbreviations except domain-standard ones (`id`, `url`, `http`).
3. A function does one thing at one level of abstraction. If you need a blank line to separate
   phases, extract a function.
4. At most three positional parameters; beyond that, pass a named object.
5. No boolean parameter that switches behavior — split it into two functions.
6. Replace magic numbers and strings with named constants at their point of definition.
7. Use guard clauses. At most two levels of nesting inside a function.
8. Comments explain *why*, never *what*. Delete commented-out code; git remembers it.
9. Delete dead code on sight instead of keeping it "just in case".

## Do / Don't

```ts
// Don't — a boolean switches the behavior at every call site
function sendNotification(user: User, urgent: boolean): void {
  if (urgent) pager.page(user);
  else email.send(user);
}

// Do — split into two functions with intent-bearing names
function pageUser(user: User): void {
  pager.page(user);
}

function emailUser(user: User): void {
  email.send(user);
}
```

## Smells

a function longer than a screen · a name that needs a comment to be understood · `data`, `info`,
`manager`, `helper`, `util` in a name · `if (flag)` as the first line · nesting deeper than two.

## When to ignore

Generated code, vendored files, and one-off scripts you will delete after a single run.
