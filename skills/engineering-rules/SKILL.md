---
name: engineering-rules
description: "Use when a craft workflow selects engineering rules, or when a task needs a concrete standard for design, implementation, or verification."
license: MIT
metadata:
  author: craftkit contributors
  version: "0.2.0"
---

# Engineering Rules

## Activation Contract

Use as the shared rule-selection procedure for craft workflows or for a specific engineering concern.

## Hard Rules

- Load only applicable rules, including the workflow's core. Rules are guidance within repository and user constraints; consult their explicit exceptions.
- Read at most eight rule files per focused pass. If more apply, schedule additional risk-focused passes and preserve cross-component invariants and pending checks. Do not drop a risk to meet the budget.
- Do not claim verification without observed output. Follow repository-required gates and user commit policy.

## Decision Gates

| Change touches | Rules to assess |
| --- | --- |
| External input, credentials, personal data, authorization | `security`, `error-handling` |
| Shared state, concurrent callers, retries, message delivery | `concurrency`, `error-handling` |
| Queries, collection size, expected load, latency | `performance` |
| External contracts, persisted formats, migrations | `api-design`, `architecture`; check compatibility and recovery |
| New abstractions, duplicated business knowledge, boundaries | `simplicity-and-yagni`, `solid`, `architecture` |
| Changed behavior or integration | `testing`; choose checks that can detect a wrong implementation |
| Added, upgraded, or removed library | `dependency-management` |
| Production failure diagnosis | `observability` |
| Completion or CI | `quality-gates` |

## Execution Steps

1. Read the index and inspect the change and its callers. Map applicable risks to rule files; a small diff can still have high risk.
2. Read selected `rules/<name>.md` relative to this file. If unavailable, search for `**/engineering-rules/rules/<name>.md`.
3. For scale-sensitive work, state expected data volume/concurrency, resource bounds, saturation behavior, and a measurable budget. Mark unknowns; never invent measurements.
4. Verify observable acceptance criteria at the right level: behavior tests, real-boundary integration checks, static checks, or a documented manual reproduction. Reproduce bugs before fixes when feasible.
5. Run required repository checks. For unrelated baseline failures, record evidence and distinguish them from regressions; never silently weaken a gate.
6. Review cross-pass interactions and remaining checks before declaring completion.

## Output Contract

In the workflow's final response, report behavior delivered, material design decisions, commands/checks with observed results, and failed or unverified criteria. Include measurements only when obtained, otherwise label estimates and validation work. Do not report unfinished verification as passed.

## References

The generated index below maps conditions to local rule files. Read selected files, not the entire rule directory.

## Index

<!-- craftkit:rules:start -->
| Rule | Read it when |
| --- | --- |
| `anti-patterns` | Reviewing or extending code you did not write. |
| `api-design` | Designing or changing an interface consumed by another team, service, or client. |
| `architecture` | Deciding how modules, services, or layers fit together. |
| `clean-architecture` | The codebase has business rules worth protecting from frameworks and I/O. |
| `clean-code` | Any code you write or modify. |
| `code-review` | Reviewing someone else's change, or preparing your own for review. |
| `concurrency` | Two things can run at once: threads, async tasks, workers, or multiple instances of the service. |
| `ddd` | The domain has rules and vocabulary that non-programmers argue about. |
| `dependency-management` | Adding, upgrading, or removing a third-party dependency. |
| `design-patterns` | You recognize a recurring structural problem and want a known solution. |
| `engineering-workflow` | Planning how a change gets from idea to production. |
| `error-handling` | The code crosses a boundary: I/O, network, parsing, or user input. |
| `hexagonal-architecture` | You need to exercise the domain without infrastructure, or to swap an external system. |
| `language-idioms` | Writing in a language whose local conventions you have not confirmed in this repository. |
| `observability` | The code runs anywhere you cannot attach a debugger. |
| `performance` | Choosing data-access patterns or resource bounds, defining load budgets, or investigating measured performance problems. |
| `quality-gates` | Deciding whether a change is done, or setting up CI. |
| `refactoring` | The code's current shape resists the change you need, or a feature left the design worse than it found it. |
| `security` | The code handles external input, credentials, personal data, or authorization decisions. |
| `simplicity-and-yagni` | You are about to add an abstraction, a configuration option, or a capability nobody asked for. |
| `solid` | The design uses classes, modules, or interfaces with more than one collaborator. |
| `testing` | Implementing any change in behavior. |
<!-- craftkit:rules:end -->

## Adding a rule

From a craftkit checkout, run `npx craftkit add-rule <name>` to create the rule and regenerate
the table. For edits to existing rules, call `syncIndex` from `src/index-gen.js`.
