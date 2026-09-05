---
name: craft-code-review
description: Use when reviewing a diff, a pull request, or existing code, and when preparing your own change to be reviewed.
---

# Craft Code Review

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

- `../engineering-rules/rules/code-review.md`
- `../engineering-rules/rules/anti-patterns.md`
- `../engineering-rules/rules/clean-code.md`
- `../engineering-rules/rules/solid.md`
- `../engineering-rules/rules/security.md`
- `../engineering-rules/rules/testing.md`

**Conditional — read only if its trigger holds:**

- `../engineering-rules/rules/performance.md` — when there is a measured performance problem, or you are choosing a data-access pattern.
- `../engineering-rules/rules/quality-gates.md` — when deciding whether a change is done, or setting up CI.

## Workflow

1. Read the description, then the tests, then the diff.
2. Confirm the diff does what the description claims and nothing more.
3. Pass one — correctness and security only: wrong results, lost data on retry, unhandled error paths, missing authorization, injection, leaked secrets.
4. Pass two — design: boundaries, dependency direction, anti-patterns from the catalogue.
5. Pass three — tests: do they fail if the implementation is wrong, and do they cover the error and empty cases?
6. Pass four — readability. Skip style entirely; that belongs to the formatter.
7. Report findings ordered by severity, each with the concrete failing scenario — inputs and state leading to the wrong output — never a vague concern.
8. Say explicitly what you did not review and why.

## Quality gates

- [ ] Every finding names a concrete failure scenario.
- [ ] Findings ordered by severity.
- [ ] Each marked blocking or optional.
- [ ] No style comments.
- [ ] The limits of the review stated.

## Red flags

| Thought | Reality |
| --- | --- |
| "This could be cleaner" | Without a concrete defect that is noise; skip it. |
| "It's a big diff but it looks fine" | Beyond ~400 lines you are skimming; ask for a split. |
| "The tests pass, so it's correct" | Passing tests prove what was tested. |
| "I'd have done it differently" | Different is not worse; find the defect or approve. |
