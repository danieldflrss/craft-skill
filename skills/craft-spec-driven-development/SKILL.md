---
name: craft-spec-driven-development
description: Use when the requirements are ambiguous, or when starting a new project or subsystem, so that a written and approved spec exists before any code is written.
---

# Craft Spec Driven Development

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

- `../engineering-rules/rules/engineering-workflow.md`
- `../engineering-rules/rules/quality-gates.md`
- `../engineering-rules/rules/testing.md`
- `../engineering-rules/rules/ddd.md`
- `../engineering-rules/rules/api-design.md`

**Conditional — read only if its trigger holds:**

- `../engineering-rules/rules/architecture.md` — when the spec creates or moves a component boundary.

## Workflow

1. Ask clarifying questions one at a time until purpose, constraints, and success criteria are unambiguous.
2. If the request contains several independent subsystems, decompose first and spec only the first one.
3. Write the spec: problem, goals, non-goals, decisions with their reasons, interfaces, error behavior, testing strategy.
4. Self-review the spec for placeholders, internal contradictions, and requirements that admit two readings; fix them inline.
5. Get explicit approval on the written spec before any implementation.
6. Turn the spec into a task list where each task ends in an independently testable deliverable. Where `superpowers:writing-plans` is available, use it here.
7. Implement task by task, committing after each.

## Quality gates

- [ ] No "TBD" or placeholder in the spec.
- [ ] Every requirement traceable to a task.
- [ ] Spec approved before the first line of implementation.
- [ ] Each task independently testable.

## Red flags

| Thought | Reality |
| --- | --- |
| "The requirements are clear enough, I'll start" | If you cannot write them down, they are not clear. |
| "I'll write the spec after, from the code" | Then it documents what you built, not what was needed. |
| "It's one big feature" | If it has independent subsystems, it is several specs. |
| "They approved the idea, so the spec is approved" | Approval is on the written artifact. |
