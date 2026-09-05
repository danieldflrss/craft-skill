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

1. Write the definition of done and make it mechanical: build, format, lint, type-check, tests,
   vulnerability audit — all green.
2. Gates run in CI, not only locally, and against the merge result rather than the stale branch.
3. Never merge with a red or skipped gate. Disabling a gate is a change that needs its own review
   and an expiry date.
4. Gates must be fast enough to run on every push, or people route around them. Move slow suites
   to a post-merge stage.
5. A flaky test is a broken gate. Quarantine it with an owner and a deadline; never retry until
   green.
6. New behavior arrives with its tests in the same pull request. "Tests later" means never.
7. Claiming "done" requires having run the gates and seen the output. Evidence before assertion.

## Do / Don't

```ts
// Don't — the failure is swallowed; CI reports success either way
const scripts = { test: 'node --test || true' };

// Do — a failing gate fails the command, and CI blocks the merge
const scripts = { test: 'node --test' };
```

## Smells

`--no-verify` in shell history · a skipped test with no ticket · a CI job allowed to fail · "it
works on my machine".

## When to ignore

Never, for code anyone else will run.
