---
name: hexagonal-architecture
applies-when: You need to exercise the domain without infrastructure, or to swap an external system.
---

# Hexagonal Architecture

## Why

A domain that can only run against a live database or a live third-party API can only be tested
slowly, flakily, and after infrastructure is provisioned. Naming the domain's needs as ports
separates "what the application requires" from "which system currently provides it," so either
side can change without touching the other.

## Checklist

1. Two kinds of port: driving (the application's API, used by tests, UI, CLI) and driven (what the
   application needs: persistence, clock, mail).
2. Ports are owned by the domain and written in domain language: `OrderRepository.save(order)`,
   not `save(row)`.
3. Adapters translate and contain no rules. A rule inside an adapter is a bug.
4. The application must run with every driven port replaced by an in-memory fake. If it cannot, a
   dependency has leaked inward.
5. Test the domain through driving ports with fake driven adapters; test each adapter separately
   against the real system.
6. The composition root is the only place that knows concrete adapters.

## Do / Don't

```ts
// Don't — the domain imports the database driver; it can't run without Postgres
import { Pool } from 'pg';

class OrderService {
  constructor(private pool: Pool) {}
  async place(order: Order): Promise<void> {
    await this.pool.query('INSERT INTO orders (id, total) VALUES ($1, $2)', [order.id, order.total]);
  }
}

// Do — the domain depends on a port; an in-memory fake replaces pg in tests
interface OrderRepository {
  save(order: Order): Promise<void>;
}

class OrderService {
  constructor(private repository: OrderRepository) {}
  async place(order: Order): Promise<void> {
    await this.repository.save(order);
  }
}
```

## Smells

domain code importing `pg`, `axios`, or `fs` · a port whose signature mirrors a SQL statement ·
mocking your own domain classes.

## When to ignore

A service that is a thin pass-through to a single external API — the ports would only duplicate
it.
