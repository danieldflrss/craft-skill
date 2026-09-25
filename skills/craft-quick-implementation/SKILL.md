---
name: craft-quick-implementation
description: "Use when making a bounded change to an existing flow: a flag, endpoint, or localized bugfix."
license: MIT
metadata:
  author: craftkit contributors
  version: "0.2.0"
---

# Craft Quick Implementation

## Activation Contract

Use for a bounded change to an existing flow. Size does not determine risk.

## Hard Rules

- Read the existing flow, callers, tests, and repository instructions before editing.
- Preserve unrelated work. Follow repository tooling and the user's commit policy.
- Justify new abstractions by a real consumer, invariant, or boundary; a test double alone is not justification.
- Read `../engineering-rules/SKILL.md` and follow its risk selection and verification procedure.

## Decision Gates

| Evidence | Action |
| --- | --- |
| Requirements are ambiguous or the subsystem is new | Use `craft-spec-driven-development`. |
| The change crosses several layers with clear requirements | Use `craft-feature-implementation`. |
| A component boundary or expensive-to-reverse decision changes | Use `craft-architect` for that decision, then return. |
| Current structure blocks the change | Load `../engineering-rules/rules/refactoring.md`; keep refactoring behavior-preserving. |
| A new dependency is needed | Evaluate it through the index; reconsider scope rather than silently adding it. |

## Execution Steps

1. State the intended behavior, affected callers, acceptance criterion, and files likely to change.
2. Load `../engineering-rules/rules/clean-code.md` and select applicable risk rules from the index, including testing for behavior changes.
3. For a reproducible bug, demonstrate the failure with a regression test or reproduction. For other changes, choose checks that distinguish correct from incorrect behavior.
4. Make the smallest cohesive change. Reuse existing domain logic only when its contract matches; avoid unrelated cleanup and speculative options.
5. Verify the acceptance criterion, error and boundary cases, and affected callers. Run repository-required checks; review the diff for unintended changes.

## Output Contract

Report changed behavior and files, verification commands and observed results, and any unverified acceptance criteria or remaining risks. Explain added dependencies or abstractions. Commit only when requested or required by repository policy.

## References

- `../engineering-rules/SKILL.md` — risk selection and completion evidence.
