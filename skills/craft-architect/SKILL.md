---
name: craft-architect
description: "Use when designing or reviewing system boundaries, comparing technologies, or recording an architectural decision."
license: MIT
metadata:
  author: craftkit contributors
  version: "0.2.0"
---

# Craft Architect

## Activation Contract

Use for system design, architecture review, technology choices, and expensive-to-reverse decisions.

## Hard Rules

- Read existing boundaries, deployment constraints, and repository instructions before proposing a design.
- State constraints before choosing a solution. Never invent load targets or claim measurements you did not run.
- Choose the simplest option meeting the constraints; distribution, caching, eventing, and extra layers each need evidence.
- Read `../engineering-rules/SKILL.md` and `../engineering-rules/rules/architecture.md`; select additional rules by their actual conditions.

## Decision Gates

| Evidence | Action |
| --- | --- |
| Business rules need protection from I/O | Load `../engineering-rules/rules/clean-architecture.md`. |
| Domain vocabulary and invariants are complex | Load `../engineering-rules/rules/ddd.md`. |
| Infrastructure must be replaceable or domain tests isolated | Load `../engineering-rules/rules/hexagonal-architecture.md`. |
| A recurring structural problem has been demonstrated | Consider `../engineering-rules/rules/design-patterns.md`; compare with a direct solution. |
| Product goals or constraints are ambiguous | Resolve them with `craft-spec-driven-development`. |
| The decision is settled | Return to the appropriate implementation skill; workflow transitions are not a one-way ladder. |

## Execution Steps

1. State functional needs, team and deployment constraints, and binding quality attributes: latency, throughput, availability, consistency, or change isolation. Mark unknowns and how to resolve them.
2. Name components by owned responsibility, data, invariant, and hidden decision. Draw dependency direction and remove cycles.
3. Compare two or three viable options with trade-offs and a recommendation. For reuse, identify actual consumers and stable shared semantics.
4. When scale matters, define expected volume and concurrency, resource bounds, saturation behavior, and the benchmark or load test needed. Trace partial failure and recovery across boundaries.
5. Record expensive-to-reverse decisions in an ADR: context, options, decision, consequences. Use repository conventions and respect permission to write files.
6. Name the assumption most likely to invalidate the decision and the evidence that would trigger reconsideration.

## Output Contract

Return constraints and unknowns, component responsibilities and dependencies, options and recommendation, compatibility and failure consequences, and a validation plan. Distinguish measured evidence from estimates. Report any ADR path actually written; do not commit unless requested or required by policy.

## References

- `../engineering-rules/SKILL.md` — risk selection and completion evidence.
