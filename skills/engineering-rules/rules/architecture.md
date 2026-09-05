---
name: architecture
applies-when: Deciding how modules, services, or layers fit together.
---

# Architecture

## Why

Architecture is the set of decisions that are expensive to reverse. Get the boundaries and
dependency directions wrong and every later feature pays a tax: a change that should touch one
component ends up touching three, and the system can only be understood by tracing everything at
once instead of one piece at a time.

## Checklist

1. Draw boundaries before boxes: name each component by the responsibility it owns and the
   decision it hides.
2. Dependencies point one way. A cycle between modules is a design bug, not a build detail.
3. Couple to stable things you own; never to a vendor's schema or a volatile external model.
4. Prefer a modular monolith until you have a proven reason to distribute: independent scaling,
   independent deploy cadence, or team autonomy. Distribution buys those and costs latency,
   partial failure, and eventual consistency.
5. Every hard-to-reverse decision gets a short ADR: context, options, decision, consequences.
6. Separate reversible from irreversible decisions. Take reversible ones fast; take irreversible
   ones with evidence.
7. Encode the boundary rules you care about as an automated check — import lint or a dependency
   test — or they will erode.

## Do / Don't

```ts
// Don't — inventory and order import each other directly: a cycle
// inventory.ts
import { placeOrder } from './order';
export function reserveStock(sku: string) {
  if (isLowStock(sku)) placeOrder(reorderFor(sku));
}

// order.ts
import { reserveStock } from './inventory';
export function placeOrder(item: OrderItem) {
  reserveStock(item.sku);
}

// Do — inventory publishes; order reacts. The dependency now points one way.
// inventory.ts
export function reserveStock(sku: string, events: EventBus) {
  if (isLowStock(sku)) events.publish({ type: 'LowStock', sku });
}

// order.ts
import { reserveStock } from './inventory';
export function placeOrder(item: OrderItem, events: EventBus) {
  reserveStock(item.sku, events);
}
```

## Smells

import cycles · a `shared`/`common` module everything depends on · services that always deploy
together · a decision nobody can explain.

## When to ignore

Scripts and prototypes with a known expiry date.
