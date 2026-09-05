---
name: clean-architecture
applies-when: The codebase has business rules worth protecting from frameworks and I/O.
---

# Clean Architecture

## Why

Frameworks, databases, and HTTP libraries change on their own schedule, not the business's. When
business rules are written in terms of a framework's types, every framework upgrade and every
migration risks the rules themselves — the thing least likely to need to change ends up the most
expensive to touch.

## Checklist

1. Four rings: entities (enterprise rules), use cases (application rules), adapters (controllers,
   gateways, presenters), frameworks and drivers.
2. The dependency rule: source dependencies point inward only. Nothing in an inner ring names
   anything in an outer ring.
3. Entities hold rules that would be true without this application. A use case orchestrates
   entities for exactly one user intent.
4. Cross a boundary inward with a plain input DTO and outward with a plain output DTO. Never pass
   a framework request or response object inward.
5. The database, the web framework, and the broker are late-bound details. The use case must
   compile without them.
6. When an inner ring needs an outer capability, declare the interface inside and implement it
   outside.
7. The directory structure announces the architecture — one directory per ring or per use case —
   not the framework.

## Do / Don't

```ts
// Don't — the use case takes Express's Request; it now depends on Express
function createOrderUseCase(req: Request): OrderResult {
  return placeOrder(req.body.customerId, req.body.items);
}

// Do — a plain DTO crosses the boundary; the use case compiles without Express
interface CreateOrderInput {
  customerId: string;
  items: { sku: string; qty: number }[];
}

function createOrderUseCase(input: CreateOrderInput): OrderResult {
  return placeOrder(input.customerId, input.items);
}

function createOrderHandler(req: Request, res: Response): void {
  res.json(createOrderUseCase({ customerId: req.body.customerId, items: req.body.items }));
}
```

## Smells

an entity importing an ORM decorator · a use case receiving an HTTP request · business rules in a
controller · a `models/` folder that is really the database schema.

## When to ignore

CRUD with no rules beyond validation; the layering costs more than it returns.
