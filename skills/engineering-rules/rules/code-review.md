---
name: code-review
applies-when: Reviewing someone else's change, or preparing your own for review.
---

# Code Review

## Why

Review is the cheapest point in the whole lifecycle to catch a defect — before it ships, before a
user hits it, before a rollback is needed. That leverage is wasted the moment review time goes to
what a formatter could have caught instead of to the one input the diff doesn't handle.

## Checklist

1. Review in priority order and say which level each comment is at: correctness, then security,
   then design, then tests, then readability, then style.
2. Style is not a review topic. If you argued about formatting, the formatter is missing from CI.
3. Verify the change does what its description claims, and that the description matches the diff.
4. Read the tests first: they state what the author believes the behavior is.
5. Ask about the case the diff does not cover — empty, null, concurrent, failing dependency —
   instead of asserting it is broken.
6. Comment on the code, never the author. Mark each comment blocking or optional (`nit:`,
   `consider:`).
7. Cap review size. Beyond roughly four hundred changed lines, defect detection collapses — ask
   for a split instead of skimming.
8. Approve when the change is better than what is there and the risks are understood. Perfection
   is not the bar.

## Do / Don't

```ts
function parseAmount(input: string): number {
  return parseFloat(input) * 100;
}
// Don't — a vague preference with no failing input
// "I'd probably do this differently."

// Do — names a concrete input the diff gets wrong
// "parseAmount('12,50') returns NaN * 100 = NaN — European decimal
// commas will hit this in production. Needs a test for that input."
```

## Smells

a review that is only style nits · "LGTM" on a two-thousand-line diff · a reviewer rewriting the
change in comments.

## When to ignore

Nothing — but a solo prototype can be self-reviewed against this list.
