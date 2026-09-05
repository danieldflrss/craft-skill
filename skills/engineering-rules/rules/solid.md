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

1. SRP: name each module with a single noun phrase and no "and". If the honest name needs "and",
   split it.
2. SRP detection: list who would ask for a change here. More than one stakeholder means more than
   one responsibility.
3. OCP: adding a variant should mean adding a file, not editing a `switch`. A type `switch` that
   grows with every feature becomes polymorphism or a registry.
4. LSP: a subtype accepts everything the base accepts and promises at least as much. An override
   that throws `NotSupported` is a violation.
5. ISP: no consumer depends on methods it never calls. Split fat interfaces per consumer.
6. DIP: the high-level policy declares the interface it needs and owns it; the low-level detail
   implements it. The interface lives with the policy.
7. Introduce an abstraction only where a second implementation exists — a test double counts. One
   implementation and no double means the interface is speculative.

## Do / Don't

```ts
// Don't — OCP violation: every new discount type edits this switch
function priceFor(kind: 'standard' | 'vip' | 'employee', amount: number): number {
  switch (kind) {
    case 'standard': return amount;
    case 'vip': return amount * 0.9;
    case 'employee': return amount * 0.7;
  }
}

// Do — adding a discount means adding a class, not editing this function
interface DiscountPolicy {
  apply(amount: number): number;
}

function priceFor(policy: DiscountPolicy, amount: number): number {
  return policy.apply(amount);
}
```

## Smells

"and" in a class name · the same type `switch` repeated across the codebase · overrides that throw
· single-implementation interfaces created "for flexibility" · domain code importing an ORM.

## When to ignore

Scripts, prototypes, and modules with a single collaborator — there is no second implementation or
stakeholder to protect against yet.
