---
name: security
applies-when: The code handles external input, credentials, personal data, or authorization decisions.
---

# Security

## Why

Every other rule in this catalogue trades off against schedule or clarity; this one mostly does
not, because the cost of a shortcut here is not paid by the team that took it. It is paid by
whoever's data leaks, all at once, with no easy revert. Treating the boundary as adversarial by
default — rather than validating after something has already gone wrong — is the only version of
this rule that holds up against an attacker who is looking for the one place it doesn't.

## Checklist

1. Validate and normalize all external input at the boundary against an allowlist. Never sanitize
   by blocklist.
2. Never build a query, command, path, or markup by string concatenation: parameterized queries,
   argument arrays, path resolution with a containment check, context-aware output encoding.
3. Authentication answers *who*; authorization answers *may they*. Check authorization
   server-side, on every request, per resource — object identifiers included.
4. Secrets live in the environment or a secret manager. Never in code, logs, URLs, or error
   messages. Rotate on exposure.
5. Store passwords with a memory-hard KDF (argon2id, or bcrypt) — never a bare hash. Compare
   tokens in constant time.
6. Default deny: new endpoints, fields, and roles start with no access.
7. Audit dependencies in CI. A known advisory on a direct dependency blocks the merge.
8. Log security-relevant events — authentication, authorization failures, privilege changes —
   without logging the secret or the personal data itself.

## Do / Don't

```ts
// Don't — string concatenation lets the input become part of the query
const user = await db.query(`SELECT * FROM users WHERE email = '${email}'`);

// Do — a parameterized query; the input can never become SQL
const user = await db.query('SELECT * FROM users WHERE email = $1', [email]);
```

## Smells

SQL built by concatenation · a JWT accepted without verifying the algorithm · authorization
enforced in the frontend · a token in a log line · hand-rolled cryptography.

## When to ignore

Never, for anything reachable from outside. At most, a local script with no network exposure may
relax input validation — and nothing else on this list.
