---
name: refactoring
applies-when: The code's current shape resists the change you need, or a feature left the design worse than it found it.
---

# Refactoring

## Why

Refactoring changes shape without changing behavior. The moment a commit does both, a reviewer can
no longer tell which change caused a regression, and "just a refactor" stops being something you
can trust in a rollback or a bisect.

## Checklist

1. Never refactor and change behavior in the same commit. Two commits, always.
2. Refactor only under passing tests. If there are none, write characterization tests first.
3. Run the suite after every move, not at the end.
4. Prefer mechanical moves: extract function or variable, inline, rename, move, introduce
   parameter object, replace conditional with polymorphism.
5. Make the change easy, then make the easy change.
6. For large migrations use the strangler fig: build the new path beside the old, move callers one
   at a time, delete the old path when it has no callers.
7. Stop when the change you came for is easy. Refactoring is not the goal.

## Do / Don't

```ts
// Don't — a mixed change: extracting a helper AND adding a new discount rule at once
function total(items: Item[], isMember: boolean): number {
  let sum = 0;
  for (const item of items) sum += item.price;
  if (isMember) sum *= 0.95; // new behavior, snuck into the same commit as the extraction
  return sum;
}

// Do — commit 1: pure mechanical extraction, behavior identical, tests still green
function total(items: Item[]): number {
  return sumPrices(items);
}
function sumPrices(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}
// commit 2, separately: add the membership discount as its own reviewable change
```

## Smells

a PR mixing `refactor:` and `feat:` · a refactor with no test run in between · a rewrite proposed
because the code is "ugly" with no failing requirement behind it.

## When to ignore

Code already scheduled for deletion — polishing what will not exist next week wastes the effort
the deletion was meant to save.
