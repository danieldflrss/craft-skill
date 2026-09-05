---
name: engineering-rules
description: Index of engineering rules. Read this to pick which rules apply to the task at hand, then read only those rule files. Use when any craft-* skill asks for rule selection, or when you need a concrete, checkable standard for naming, SOLID, architecture, DDD, API design, error handling, concurrency, security, observability, performance, testing, dependencies, review, quality gates, or workflow.
---

# Engineering Rules

These rules are **optional**. Nothing here is loaded automatically — a task pulls in only the
rules whose `applies-when` condition actually holds for the code in front of it.

## How to use this index

1. Read the whole table below. It is cheap — a few lines per rule, not the rule body.
2. Select rules using the *Read it when* column: does the current task match that condition?
3. **Never load more than eight rules for one task.** If more than eight seem to apply, the task
   itself is not triaged yet — split it into smaller tasks first.
4. For each rule you selected, read `rules/<name>.md`, relative to this file. If that path does
   not exist in your current context, search for `**/engineering-rules/rules/<name>.md` instead.

## Index

<!-- craftkit:rules:start -->
| Rule | Read it when |
| --- | --- |
| `anti-patterns` | Reviewing or extending code you did not write. |
| `api-design` | Designing or changing an interface consumed by another team, service, or client. |
| `architecture` | Deciding how modules, services, or layers fit together. |
| `clean-architecture` | The codebase has business rules worth protecting from frameworks and I/O. |
| `clean-code` | Any code you write or modify. |
| `ddd` | The domain has rules and vocabulary that non-programmers argue about. |
| `design-patterns` | You recognize a recurring structural problem and want a known solution. |
| `hexagonal-architecture` | You need to exercise the domain without infrastructure, or to swap an external system. |
| `language-idioms` | Writing in a language whose local conventions you have not confirmed in this repository. |
| `refactoring` | The code's current shape resists the change you need, or a feature left the design worse than it found it. |
| `simplicity-and-yagni` | You are about to add an abstraction, a configuration option, or a capability nobody asked for. |
| `solid` | The design uses classes, modules, or interfaces with more than one collaborator. |
<!-- craftkit:rules:end -->

## Adding a rule

Create `rules/<name>.md` from `templates/rule.md`, then run `npx craftkit add-rule <name>` to
regenerate the table above.
