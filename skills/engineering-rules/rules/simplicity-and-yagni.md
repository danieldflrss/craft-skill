---
name: simplicity-and-yagni
applies-when: You are about to add an abstraction, a configuration option, or a capability nobody asked for.
---

# Simplicity and YAGNI

## Why

Every abstraction, option, and layer is a liability that must be understood, tested, and maintained
forever — whether or not it is ever used for the second case it was built to anticipate. Unused
flexibility does not sit idle; it accumulates interest as dead weight on every future change.

## Checklist

1. Build what the current requirement needs, not the one you imagine next.
2. Treat repetition as a signal to inspect semantics, not an extraction threshold. Consolidate a
   shared invariant when divergence would be a bug; keep independently evolving rules separate.
3. Prefer duplication over the wrong abstraction. Duplication is cheap; a wrong abstraction is paid
   on every future change.
4. No configuration option without a caller that needs it today.
5. Justify interfaces by a real consumer contract or protected boundary. Neither implementation
   count nor a test double alone decides whether an abstraction is useful.
6. Try deleting before adding: check whether the requirement disappears by removing something.
7. Every dependency, layer, and indirection must justify its cost out loud, in the PR description.

## Do / Don't

```ts
// Don't — one caller, and an imagined "maybe we'll need XML someday"
interface Serializer {
  serialize(order: Order): string;
}
class JsonSerializer implements Serializer { /* ... */ }
class XmlSerializer implements Serializer { /* never called anywhere */ }

// Do — one requirement, one function, no abstraction to maintain
function serializeOrder(order: Order): string {
  return JSON.stringify(order);
}
```

## Smells

a factory that builds factories · options objects whose fields are all optional and unused · "we
might need" in a commit message · a plugin system with one plugin.

## When to ignore

A boundary you already know is public API, where a later change breaks external consumers and
reversibility is genuinely expensive — there, a small amount of anticipatory design pays for itself.
