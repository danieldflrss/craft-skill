---
name: design-patterns
applies-when: You recognize a recurring structural problem and want a known solution.
---

# Design Patterns

## Why

A pattern is a name for a problem and its solution, not a badge of sophistication. Applied where
the problem actually recurs, it lets a reader recognize the shape instantly; applied because it is
familiar, it adds classes, interfaces, and indirection that the problem never asked for.

## Checklist

Index **by problem**, not by name: interchangeable algorithms chosen at runtime → Strategy; an
incompatible external interface → Adapter; complex or conditional construction → Factory or
Builder; many parties reacting to one event → Observer; adding behavior without changing the type
→ Decorator; persistence behind domain language → Repository; an object meaning "nothing" → Null
Object; fixed steps with varying details → Template Method.

1. Name the problem first. A pattern chosen before the problem is an anti-pattern.
2. Use the pattern's vocabulary in your names so readers recognize it.
3. Prefer the language's native mechanism where it already provides the pattern — in TypeScript a
   function *is* a Strategy.
4. One pattern per problem. Nesting three patterns to solve one is a smell.

## Do / Don't

```ts
// Don't — a Strategy "pattern" built from an interface and two classes
interface DiscountStrategy { apply(amount: number): number; }
class VipDiscount implements DiscountStrategy { apply(amount: number) { return amount * 0.9; } }
class NoDiscount implements DiscountStrategy { apply(amount: number) { return amount; } }
function price(strategy: DiscountStrategy, amount: number): number {
  return strategy.apply(amount);
}

// Do — TypeScript functions already are Strategy; skip the interface and classes
type DiscountFn = (amount: number) => number;
const vipDiscount: DiscountFn = (amount) => amount * 0.9;
function price(discount: DiscountFn, amount: number): number {
  return discount(amount);
}
```

## Smells

names like `AbstractSingletonProxyFactoryBean` · a Strategy interface with one implementation ·
patterns applied to a fifty-line script.

## When to ignore

When a plain function does the job.
