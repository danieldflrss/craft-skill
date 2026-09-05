---
name: dependency-management
applies-when: Adding, upgrading, or removing a third-party dependency.
---

# Dependency Management

## Why

Every dependency is code you did not write, running with the same privileges as the code you did.
It brings its own bugs, its own release schedule, and its own decision about when to stop being
maintained — none of which you control. The one thing you keep control of is how much of your
domain ever has to know the dependency exists.

## Checklist

1. Before adding, ask whether the standard library does it in under fifty lines you would
   understand. If so, write it.
2. Evaluate maintenance (recent releases, open issues), transitive weight, license, and
   alternatives — and record the answer in the PR.
3. A dependency that would cross your domain gets wrapped behind an interface you own; only the
   adapter imports it.
4. Commit the lockfile. Reproducible installs are not negotiable.
5. Pin exact versions for applications; use ranges only for libraries you publish.
6. Automate upgrades as small, frequent pull requests. A big-bang upgrade is unreviewable.
7. Run a vulnerability audit in CI; a known advisory on a direct dependency blocks the merge.
8. Remove a dependency in the same change that stops using it.

## Do / Don't

```ts
// Don't — the third-party type leaks into the domain signature
import Stripe from 'stripe';
export function chargeCustomer(charge: Stripe.Charge): Promise<Stripe.Response<Stripe.Charge>> {
  return stripe.charges.create(charge);
}

// Do — an interface you own; only the adapter imports the library
export interface PaymentGateway {
  charge(amount: Money, customerId: string): Promise<PaymentResult>;
}
class StripePaymentGateway implements PaymentGateway { /* imports Stripe here only */ }
```

## Smells

a whole package for one function · two libraries doing the same job · a lockfile in `.gitignore` ·
a version pinned years ago "because it broke".

## When to ignore

Prototypes, where exploration speed beats supply-chain hygiene — but never ship them.
