---
name: craft-quick-implementation
description: Use when making a bounded change to code that already exists — adding a flag, a single endpoint, a one-file bugfix — and the flow you are changing is already in the repository.
---

# Craft Quick Implementation

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

- `../engineering-rules/rules/simplicity-and-yagni.md`
- `../engineering-rules/rules/clean-code.md`
- `../engineering-rules/rules/error-handling.md`
- `../engineering-rules/rules/language-idioms.md`
- `../engineering-rules/rules/testing.md`

**Conditional — read only if its trigger holds:**

- `../engineering-rules/rules/refactoring.md` — when the current shape resists the change.

## Workflow

1. Locate the existing flow and read it end to end before editing.
2. Confirm the change is bounded — if there is no existing flow to change, stop and switch to `craft-spec-driven-development`.
3. State in one or two sentences what you will change and which files you will touch.
4. Write the failing test for the new behavior and run it to see it fail.
5. Make the smallest change that passes it.
6. Run the full suite, plus lint and type-check.
7. Commit with a conventional message.

## Quality gates

- [ ] The failing test was observed failing.
- [ ] Full suite green.
- [ ] No unrelated file touched.
- [ ] No new dependency.
- [ ] The diff is explainable in two sentences.

## Red flags

| Thought | Reality |
| --- | --- |
| "It's obvious, I'll skip the test" | The test is how you know it works, and it costs two minutes. |
| "While I'm here I'll clean this up too" | That is a separate commit. |
| "I'll add the option now, we'll need it later" | YAGNI; add it when a caller needs it. |
| "I understand this kind of app, so it's bounded" | Bounded is about the repository, not your familiarity. |
