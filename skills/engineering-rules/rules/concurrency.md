---
name: concurrency
applies-when: Two things can run at once: threads, async tasks, workers, or multiple instances of the service.
---

# Concurrency

## Why

Two operations that overlap in time create interleavings nobody wrote down: a lock taken in the
wrong order, a message delivered twice, a read and a write racing across the same record. These
bugs are rare on a laptop and common in production, because production is where concurrency
actually happens at scale — and by the time one reproduces, the interleaving that caused it is
long gone. Naming the invariant and the guard up front is what makes the failure preventable
instead of merely debuggable after the fact.

## Checklist

1. Prefer no shared mutable state. Immutable data and message passing remove whole classes of bug.
2. Where state must be shared, document the invariant and its guard: atomic operation, constraint,
   transaction, or lock. An in-process mutex does not coordinate multiple service instances.
3. Acquire multiple locks in one documented global order. That is what prevents deadlock.
4. Avoid holding locks across I/O or callbacks. When a transaction or async lock must span awaits,
   keep the scope bounded and define timeout, cancellation, release, and deadlock behavior.
5. For retryable writes and redelivered messages, define an operation-specific idempotency key,
   atomic deduplication, and retention. An entity ID alone can suppress legitimate repeat actions.
6. Make cancellation explicit and propagate it all the way down (`AbortSignal`, context,
   cancellation token).
7. Bound every queue and pool, and decide what happens at the bound — reject, shed, or block. That
   decision is your backpressure.
8. Check-then-act across a boundary is a race. Use an atomic operation, a conditional write, or a
   unique constraint.

## Do / Don't

```ts
// Don't — check-then-act: two requests can both pass the check before either writes
async function reserveSeat(id: string): Promise<void> {
  const seat = await db.seats.findById(id);
  if (seat.available) {
    await db.seats.update(id, { available: false });
  }
}

// Do — the check and the write are one atomic, conditional operation
async function reserveSeat(id: string): Promise<void> {
  const result = await db.seats.updateOne(
    { id, available: true },
    { available: false },
  );
  if (result.matchedCount === 0) throw new Error(`seat ${id} unavailable`);
}
```

## Smells

`sleep` used for synchronization · unbounded queues · a test that flakes only in CI ·
read-modify-write over the network.

## When to ignore

Single-threaded code with no concurrent callers and no retries.
