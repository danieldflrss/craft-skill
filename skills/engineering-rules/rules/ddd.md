---
name: ddd
applies-when: The domain has rules and vocabulary that non-programmers argue about.
---

# Domain-Driven Design

## Why

When the code's vocabulary drifts from the business's vocabulary, every conversation needs a
translation step, and the translation is where rules get lost or misapplied. DDD's machinery —
bounded contexts, aggregates, ubiquitous language — exists to keep the model and the language the
domain experts actually use from ever diverging.

## Checklist

1. Use the domain experts' words unchanged in code. If code says `Item` and the business says
   `LineItem`, the code is wrong.
2. Split the model into bounded contexts along language boundaries: when one word means two
   things, you have found a boundary.
3. Map context relationships explicitly — shared kernel, customer/supplier, conformist,
   anti-corruption layer. Use an anti-corruption layer against any model you do not control.
4. An aggregate is a consistency boundary: it enforces its invariants in its own constructor and
   methods, and is loaded and saved whole.
5. One transaction changes one aggregate. Coordinate across aggregates with domain events and
   accept eventual consistency.
6. Reference other aggregates by id, never by object.
7. Model identity-less concepts as immutable value objects that validate on construction: `Money`,
   `EmailAddress`, `DateRange`.
8. Name domain events in the past tense; they carry what happened, not what to do.

## Do / Don't

```ts
// Don't — nothing stops adding items to an order that has already shipped
class Order {
  items: OrderItem[] = [];
  status: string = 'draft';
}
function addItem(order: Order, item: OrderItem): void {
  order.items.push(item);
}

// Do — the aggregate enforces its own invariant, every time, everywhere
class Order {
  private items: OrderItem[] = [];
  private status: 'draft' | 'shipped' = 'draft';

  addItem(item: OrderItem): void {
    if (this.status !== 'draft') throw new Error('cannot modify a shipped order');
    this.items.push(item);
  }
}
```

## Smells

`setStatus()` on an entity · one transaction saving three aggregates · a `Utils` class holding
business rules · the same term meaning different things in two modules.

## When to ignore

CRUD, reporting, and integration glue. DDD's cost is only repaid where the rules are genuinely
contested — do not spend an aggregate on a table with no invariants.
