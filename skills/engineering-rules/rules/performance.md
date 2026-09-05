---
name: performance
applies-when: There is a measured performance problem, or you are choosing a data-access pattern.
---

# Performance

## Why

Performance work done without a measurement optimizes whatever the author's intuition points at,
which is usually not where the time actually goes, and it trades away clarity for a change that
may not move the number at all. Naming the budget and measuring before and after is what turns
performance work into an engineering change instead of a guess that happens to compile.

## Checklist

1. Measure first — a profile or a benchmark, never intuition. Optimizing without a measurement is
   guessing.
2. State the budget: a target latency (p95 or p99, never the mean) or throughput. Without a
   target you cannot know when to stop.
3. Fix the algorithm and the data access before micro-optimizing. Most real wins are complexity
   and I/O, not CPU.
4. Eliminate N+1 queries: one round trip, a batch, or a join. Watch the ORM's lazy loading.
5. Index the columns you filter, join, and sort on, and confirm with the query plan rather than
   by hope.
6. Cache only after measuring, and decide invalidation before adding it. A cache you cannot
   invalidate is a bug you cannot fix.
7. Paginate and stream instead of loading unbounded collections into memory.
8. Re-measure after the change and put the before/after number in the commit message.

## Do / Don't

```ts
// Don't — one query per order: N+1 round trips to the database
const orders = await db.orders.findAll();
for (const order of orders) {
  order.customer = await db.customers.findById(order.customerId);
}

// Do — one batched query; the ORM resolves the join
const orders = await db.orders.findAll({ include: ['customer'] });
```

## Smells

a query inside a loop · `SELECT *` on a wide table · an "optimization" with no benchmark · a
cache with neither TTL nor invalidation path.

## When to ignore

Code off the hot path with no measured problem. Clarity wins by default.
