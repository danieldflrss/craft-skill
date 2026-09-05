---
name: craft-architect
description: Use when designing a system or service, choosing between technologies or architectural styles, reviewing an existing architecture, or recording a technical decision as an ADR.
---

# Craft Architect

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
conditionals only when their trigger holds. Never load more than eight rules. If the core
set plus the conditionals whose triggers hold would exceed eight, the task spans more than
one design pass: narrow it to a single component and run this skill again for the next.

**Core — read all of these:**

- `../engineering-rules/rules/architecture.md`
- `../engineering-rules/rules/clean-architecture.md`
- `../engineering-rules/rules/ddd.md`
- `../engineering-rules/rules/api-design.md`
- `../engineering-rules/rules/security.md`
- `../engineering-rules/rules/performance.md`

**Conditional — read only if its trigger holds:**

- `../engineering-rules/rules/hexagonal-architecture.md` — when the domain must be testable without infrastructure.
- `../engineering-rules/rules/design-patterns.md` — when you recognize a recurring structural problem and want a known solution.
- `../engineering-rules/rules/concurrency.md` — when two things can run at once.
- `../engineering-rules/rules/observability.md` — when the code runs anywhere you cannot attach a debugger.

## Workflow

1. Write down the functional requirement, the constraints, and the quality attributes that actually bind — latency, availability, consistency, team size, deploy cadence. A design without stated constraints is a preference.
2. Name the components by the responsibility each owns and the decision each hides.
3. Draw the dependency direction and confirm there is no cycle.
4. Propose two or three options with honest trade-offs, and a recommendation with its reason.
5. Choose the simplest option that satisfies the stated constraints; distribution, caching, and eventing must each be earned.
6. Record the decision as an ADR: context, options, decision, consequences.
7. Name the one thing most likely to make this design wrong, and what evidence would reveal it.

## Quality gates

- [ ] Constraints written before the design.
- [ ] No dependency cycle.
- [ ] Every heavyweight element justified by a stated constraint.
- [ ] At least one alternative documented with why it lost.
- [ ] ADR committed to the repository.

## Red flags

| Thought | Reality |
| --- | --- |
| "We'll need microservices to scale" | Name the constraint and the number, or build the modular monolith. |
| "This is the industry standard" | Standard for whose constraints? |
| "I'll add a queue in case" | Speculative infrastructure is the most expensive kind of YAGNI. |
| "The diagram is the design" | The trade-offs and the consequences are the design. |
