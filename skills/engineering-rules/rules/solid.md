---
name: solid
applies-when: The design uses classes, modules, or interfaces with more than one collaborator.
---

# SOLID

## Why

SOLID is not a style preference — each letter names a specific way a design makes the next change
more expensive than it needs to be. Applied where there is only one collaborator, it adds ceremony
with no payoff; applied where several collaborators meet, it keeps a change local instead of
radiating across the codebase.

## Checklist

1. SRP: identify the decision and invariant a module owns. Split responsibilities that change
   independently; names and stakeholder count are investigation signals, not proof.
2. Inspect callers before extracting shared behavior. Share stable business knowledge, not merely
   similar syntax; unrelated rules must be able to evolve independently.
3. OCP: keep an exhaustive `switch` for a small closed set. Consider functions, polymorphism, or a
   registry when independently extended variants force repeated coordinated edits.
4. LSP: a subtype accepts everything the base accepts and promises at least as much. An override
   that throws `NotSupported` is a violation.
5. ISP: no consumer depends on methods it never calls. Split fat interfaces per consumer.
6. DIP: the high-level policy declares the interface it needs and owns it; the low-level detail
   implements it. The interface lives with the policy.
7. Justify an abstraction by actual consumers, a volatile boundary, or a protected invariant.
   A second implementation can be evidence; a test double alone does not justify an interface.

## Do / Don't

```ts
// Don't — duplicate the same pricing rule across invoice and checkout callers.
const invoiceTotal = kind === 'vip' ? amount * 0.9 : amount;
const checkoutTotal = kind === 'vip' ? amount * 0.9 : amount;

// Do — one owner for a closed business rule; classes are not required.
type CustomerKind = 'standard' | 'vip';
function priceFor(kind: CustomerKind, amount: number): number {
  switch (kind) {
    case 'standard': return amount;
    case 'vip': return amount * 0.9;
  }
}
```

## Smells

unrelated changes repeatedly touching one module · duplicated business decisions · overrides that
throw · interfaces justified only by a mock · domain policy coupled to an ORM.

## When to ignore

Do not introduce extension machinery for a closed set or a short-lived script. A concrete function
or module is enough when it already localizes the decision and protects the needed contract.
