---
name: SKILL_NAME
description: Use when <concrete, observable trigger>
---

# SKILL_TITLE

## When to use

| The task is… | Skill |
| --- | --- |
| <situation> | `SKILL_NAME` |

## Rule selection

Read `../engineering-rules/SKILL.md` for the index. Load the core set below, then add
conditionals only when their trigger holds. Never load more than eight rules. If the core
set plus the conditionals whose triggers hold would exceed eight, the task spans more than
one design pass: narrow it to a single component and run this skill again for the next.

**Core — read all of these:**

- `../engineering-rules/rules/<name>.md`

**Conditional — read only if its trigger holds:**

- `../engineering-rules/rules/<name>.md` — when <trigger>

## Workflow

1. <Step.>

## Quality gates

- [ ] <Gate.>

## Red flags

| Thought | Reality |
| --- | --- |
| <rationalization> | <correction> |
