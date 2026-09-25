---
name: craft-spec-driven-development
description: "Use when requirements are ambiguous or a project or subsystem is new, to agree on a spec before implementation."
license: MIT
metadata:
  author: craftkit contributors
  version: "0.2.0"
---

# Craft Spec Driven Development

## Activation Contract

Use for materially ambiguous requirements or a new project or subsystem.

## Hard Rules

- Inspect existing capabilities and repository instructions before asking questions or proposing new components.
- Obtain explicit approval of the written spec before implementation. Follow the user's permitted artifact location; use the conversation when file writing is not authorized.
- Distinguish requirements, assumptions, and unresolved questions. Do not manufacture certainty to remove a placeholder.
- Read `../engineering-rules/SKILL.md` and `../engineering-rules/rules/engineering-workflow.md`; select other rules by risk.

## Decision Gates

| Evidence | Action |
| --- | --- |
| Unknown changes behavior, contract, or acceptance | Ask a focused question before deciding it. |
| Independent subsystems | Agree on scope, shared contracts, and an order; specify one deliverable at a time. |
| Expensive-to-reverse design decision | Use `craft-architect` for options and consequences. |
| Spec approved and task bounded to an existing flow | Hand off to `craft-quick-implementation`. |
| Spec approved and task crosses layers | Hand off to `craft-feature-implementation`. |

## Execution Steps

1. Establish purpose, users, constraints, existing flows, and observable success criteria. Ask only questions whose answers affect a decision.
2. Write the spec: problem, goals, non-goals, acceptance scenarios, decisions with reasons, interfaces, errors, and verification strategy.
3. Where relevant, specify authorization, state invariants, compatibility and migrations, expected load, resource bounds, and failure recovery. Identify real reuse needs without inventing future consumers.
4. Self-review for contradictions, ambiguous outcomes, and unresolved blocking assumptions. Resolve blockers and get explicit approval on the written artifact.
5. Map each requirement to an independently verifiable task and acceptance check. Record task dependencies and shared invariants.
6. Hand tasks to the matching implementation skill with the approved spec and constraints. Seek renewed approval only for material deviations; carry acceptance criteria through final verification.

## Output Contract

Return the spec or its authorized path, approval status, unresolved questions, requirement-to-task/check mapping, and the next workflow. At delivery, distinguish satisfied, failed, and unverified acceptance criteria. Follow repository and user commit policy.

## References

- `../engineering-rules/SKILL.md` — risk selection and completion evidence.
