---
name: quality-gates
applies-when: Deciding whether a change is done, or setting up CI.
---

# Quality Gates

## Why

"Done" is a claim, and claims are cheap. A gate that runs automatically and blocks the merge turns
the claim into evidence, which is the only thing that scales past the size of team where everyone
already trusts everyone else's judgment.

## Checklist

1. Discover repository-required build, format, lint, type, test, and dependency checks. Run the
   applicable commands; do not invent missing scripts or silently weaken existing gates.
2. Gates run in CI, not only locally, and against the merge result rather than the stale branch.
3. Report required gates as passed, failed, or not run with evidence. Separate baseline failures
   from regressions. A failed or unrun required gate prevents a claim of verified completion;
   any exception follows repository policy, not an agent's unilateral decision.
4. Keep feedback fast through targeted checks and parallel jobs. Critical correctness checks remain
   pre-merge even when slow; only non-blocking diagnostics belong exclusively after merge.
5. A flaky test is a broken gate. Quarantine it with an owner and a deadline; never retry until
   green.
6. New behavior arrives with meaningful verification in the same change. Use behavior tests where
   they add evidence and document any acceptance criterion that remains unverified.
7. Claiming "done" requires having run the gates and seen the output. Evidence before assertion.

## Do / Don't

```ts
// Don't — the failure is swallowed; CI reports success either way
const swallowed = { test: 'node --test || true' };

// Do — a failing gate fails the command, and CI blocks the merge
const enforced = { test: 'node --test' };
```

## Smells

`--no-verify` in shell history · a skipped test with no ticket · a CI job allowed to fail · "it
works on my machine".

## When to ignore

Never, for code anyone else will run.
