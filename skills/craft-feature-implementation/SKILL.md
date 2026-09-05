---
name: craft-feature-implementation
description: Use when implementing a complete feature that crosses several layers of an existing repository — data, domain, API, and UI — where the requirements are already clear.
---

# Craft Feature Implementation

## When to use

| The task is… | Skill |
| --- | --- |
| Designing a system or service, choosing between technologies, writing an ADR | `craft-architect` |
| A bounded change to code that already exists: a flag, an endpoint, a bugfix | `craft-quick-implementation` |
| A complete feature crossing several layers of an existing repository | `craft-feature-implementation` |
| Ambiguous requirements, or a new subsystem or project | `craft-spec-driven-development` |
| Reviewing a diff, a pull request, or existing code | `craft-code-review` |

Ratchet: if hidden complexity appears mid-task, move up to the heavier skill. Never move down.

## Rule selection

Read `../engineering-rules/SKILL.md` for the index. Load the core set below, then add
conditionals only when their trigger holds. Never load more than eight rules.

**Core — read all of these:**

- `../engineering-rules/rules/solid.md`
- `../engineering-rules/rules/clean-code.md`
- `../engineering-rules/rules/testing.md`
- `../engineering-rules/rules/error-handling.md`
- `../engineering-rules/rules/api-design.md`
- `../engineering-rules/rules/security.md`

**Conditional — read only if its trigger holds:**

- `../engineering-rules/rules/dependency-management.md` — when a library is being added.
- `../engineering-rules/rules/observability.md` — when the code runs in production.

## Workflow

1. Map the existing layers the feature crosses and name the files you will touch in each.
2. Define the boundary contracts first — types, interfaces, endpoints — and get them reviewed before implementing behind them.
3. Slice the feature into vertical increments, each independently shippable and testable; a horizontal slice ("all the models first") is not one.
4. For each slice: failing test, minimal implementation, green suite, commit.
5. Where `superpowers:test-driven-development` is available, follow it for the inner loop.
6. Handle the error and empty paths in the same slice as the happy path, never "later".
7. Run the full gates before declaring done.

## Quality gates

- [ ] Every slice has tests that were seen failing first.
- [ ] Boundary contracts documented.
- [ ] Error and empty states implemented.
- [ ] No secret, token, or personal data in logs.
- [ ] Lint, types, tests, and audit green.

## Red flags

| Thought | Reality |
| --- | --- |
| "I'll wire the happy path and handle errors at the end" | The error path is the feature. |
| "All the models first, then all the services" | Horizontal slices ship nothing; go vertical. |
| "The tests are slow, I'll run them once at the end" | You lose the ability to know which change broke it. |
| "It's mostly done" | Run the gates and report the output. |
