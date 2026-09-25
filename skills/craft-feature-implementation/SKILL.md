---
name: craft-feature-implementation
description: "Use when implementing a feature across several layers of an existing repository with clear requirements."
license: MIT
metadata:
  author: craftkit contributors
  version: "0.2.0"
---

# Craft Feature Implementation

## Activation Contract

Use for a feature crossing existing data, domain, API, or UI boundaries with clear requirements.

## Hard Rules

- Read repository instructions, existing flows, callers, tests, and integration conventions first.
- Preserve unrelated work and follow the user's commit policy.
- Deliver vertical increments with error and empty paths alongside the happy path.
- Read `../engineering-rules/SKILL.md`; select rules by risk for each slice and check cross-slice invariants.
- Reuse shared business knowledge, not merely similar syntax. Explain each new abstraction's consumer or protected boundary.

## Decision Gates

| Evidence | Action |
| --- | --- |
| A requirement has materially different interpretations | Resolve it with `craft-spec-driven-development`, then return. |
| A component boundary or expensive-to-reverse decision changes | Use `craft-architect` for the decision. |
| Public contracts or stored data change | Plan compatibility, migration, and failure recovery before implementing. |
| Concurrency or data volume matters | Specify the invariant, expected load, resource bounds, and evidence needed to verify them. |

## Execution Steps

1. Map affected layers, callers, existing reusable logic, and acceptance criteria. Load `../engineering-rules/rules/clean-code.md` plus applicable rules from the index.
2. Define boundary contracts and failure behavior using repository conventions. Seek review where required by policy or unresolved trade-offs.
3. Split into independently verifiable vertical increments. Record dependencies where independent shipment is impossible.
4. For each slice, choose behavior-level tests and real-boundary integration checks. Reproduce bugs before fixing; prefer test-first for new behavior without requiring redundant tests for low-impact edits.
5. Implement each slice, verify its acceptance criteria, and inspect the diff. Keep tests and documentation with the behavior they cover.
6. Check interactions across slices: authorization, atomicity, retries, compatibility, and bounded data access when applicable. Run required repository gates and use `craft-code-review` for self-review.

## Output Contract

Report delivered acceptance criteria, contracts and compatibility decisions, justified abstractions, verification commands and observed results, and incomplete checks or residual risks. Create commits only when requested or required by repository policy.

## References

- `../engineering-rules/SKILL.md` — risk selection and completion evidence.
