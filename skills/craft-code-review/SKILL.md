---
name: craft-code-review
description: "Use when reviewing a diff, pull request, existing code, or your own change before delivery."
license: MIT
metadata:
  author: craftkit contributors
  version: "0.2.0"
---

# Craft Code Review

## Activation Contract

Use for independent code review or self-review before delivery.

## Hard Rules

- Read repository instructions, the stated intent, tests, changed code, and affected callers.
- Read `../engineering-rules/SKILL.md` and `../engineering-rules/rules/code-review.md`; select additional rules by risk.
- Separate confirmed findings from open questions. Never invent a failing scenario or claim a check ran when it did not.
- Report observable defects and design consequences, not personal preferences or formatter concerns.

## Decision Gates

| Finding or scope | Required evidence or action |
| --- | --- |
| Functional or security defect | Inputs/state, execution path, and incorrect result or violated invariant. |
| Design defect | Violated boundary or contract, affected locations, and concrete change or operational consequence. |
| Performance concern | Unbounded work, query pattern, complexity, or measurement tied to expected load; label unmeasured impact. |
| Missing context | Ask a focused question and identify the uncertainty rather than declaring a defect. |
| Large diff, roughly over 400 lines | Review cohesive slices and then their interactions; request a split if reliable coverage is not feasible. |

## Execution Steps

1. Establish scope and intended behavior; for existing code without a diff, identify entry points and contracts.
2. Review correctness and security: error paths, authorization, data loss, retry behavior, and shared-state invariants when applicable.
3. Review design: ownership, dependency direction, duplicated business rules, compatibility, and abstraction cost. Similar syntax alone is not a defect.
4. Review tests: meaningful assertions, boundary and failure cases, determinism, and real integrations where mocks cannot establish correctness.
5. Review readability without style comments. Run relevant checks when feasible and distinguish inspection from execution.
6. Rank findings by impact and likelihood. Tie each to an exact location, evidence, and a focused correction; mark blocking or optional.

## Output Contract

Return findings ordered by severity, each with file/line, evidence, consequence, and recommended correction. If none are supported, say so explicitly. State reviewed scope, checks and observed results, and material gaps or open questions without implying unreviewed code is correct.

## References

- `../engineering-rules/SKILL.md` — risk selection and completion evidence.
