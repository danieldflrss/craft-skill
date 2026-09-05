---
name: engineering-workflow
applies-when: Planning how a change gets from idea to production.
---

# Engineering Workflow

## Why

The distance between writing a line of code and finding out it was wrong is the single biggest
lever on how expensive that mistake is. Every practice below exists to shrink that distance —
smaller changes, faster merges, a main branch that is always shippable — so the feedback comes
while the change is still cheap to fix.

## Checklist

1. Small changes, merged often. A branch older than a few days is a merge conflict accruing
   interest.
2. One concern per commit and per pull request. The message says *why*; the diff already says
   what.
3. Use conventional prefixes (`feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`) so history
   and changelog are machine-readable.
4. Separate deploy from release: ship incomplete work behind a feature flag rather than on a
   long-lived branch.
5. Every feature flag has an owner and a removal date. Flags are debt.
6. Keep the main branch releasable at all times.
7. Write the migration and its rollback together. A change you cannot roll back is a change you
   must stage.
8. Record decisions where the next person will look — an ADR in the repository, not a chat thread.

## Do / Don't

```ts
// Don't — incomplete work lives on its own branch for weeks, diverging from main
// branch: feature/new-checkout (opened 3 weeks ago, not yet mergeable)

// Do — merged to main from day one, gated behind an owned, dated flag
if (flags.isEnabled('new-checkout', { owner: 'team-payments', removeBy: '2026-10-15' })) {
  return renderNewCheckout();
}
return renderLegacyCheckout();
```

## Smells

pull requests over a thousand lines · "misc fixes" commits · release branches alive for weeks ·
flags older than the feature they gated.

## When to ignore

Solo prototypes.
