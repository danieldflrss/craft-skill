---
name: api-design
applies-when: Designing or changing an interface consumed by another team, service, or client.
---

# API Design

## Why

Once another team or client depends on an interface, every inconsistency and every ambiguity
becomes their problem to work around — and every fix becomes a breaking change they did not ask
for. Deciding the contract deliberately, before implementing it, is what keeps a change on your
side of the boundary instead of theirs.

## Checklist

1. Contract first: agree the schema (OpenAPI, protobuf, shared types) before implementing, and
   validate against it in CI.
2. Resources are nouns; the verb is the HTTP method. `GET` is safe and cacheable — never let it
   mutate.
3. Use correct status codes: `201` with `Location` on creation, `400` malformed, `401` versus
   `403`, `404` versus `409`, `422` semantic validation, `429` with `Retry-After`.
4. Every non-idempotent write accepts an idempotency key. A retried request must not duplicate its
   effect.
5. One machine-readable error shape across the whole API — `application/problem+json` (RFC 9457)
   with `type`, `title`, `status`, `detail` — plus a stable error code. Never leak a stack trace.
6. Paginate every collection from day one; prefer cursors over offsets for large or changing sets.
7. Within a version, changes are additive only: add optional fields, never remove or repurpose
   one. Breaking changes get a new version and a deprecation window announced with `Deprecation`
   and `Sunset` headers.
8. Validate and normalize input at the boundary; inside the service, trust the types.

## Do / Don't

```ts
// Don't — a verb baked into the path; GET used to mutate state
router.get('/getUser', getUserHandler);
router.get('/deleteUser', deleteUserHandler);

// Do — resources are nouns; the verb is the HTTP method
router.get('/users/:id', getUserHandler);
router.delete('/users/:id', deleteUserHandler);
```

## Smells

`POST /getUser` · `200 OK` carrying `{"error": ...}` · an unbounded list endpoint · a field
renamed in place.

## When to ignore

An internal interface with exactly one consumer that ships in the same deploy.
