---
name: observability
applies-when: The code runs anywhere you cannot attach a debugger.
---

# Observability

## Why

A system running in production cannot be paused and stepped through; the only account of what
happened is whatever it wrote down while it was happening. If that account is a free-text
sentence, a human can read it once and never query, aggregate, or alert on it again. Structuring
it as data — fields, identifiers, stable names — is what turns a log from a story into something a
machine can watch on your behalf.

## Checklist

1. Logs are structured — one JSON event per line, with a stable event name and typed fields.
   Never interpolated prose.
2. Propagate a correlation or trace identifier across every boundary and include it in every log
   line.
3. Instrument with OpenTelemetry semantics: spans around I/O and unit-of-work boundaries,
   attributes for the identifiers you would filter by.
4. Metrics: RED (rate, errors, duration) for request-driven work; USE (utilization, saturation,
   errors) for resources.
5. Never log secrets, tokens, passwords, full card numbers, or personal data. Redact in the
   logger, not at each call site.
6. Levels mean something: `error` a human must act, `warn` degraded but handled, `info` business
   events, `debug` off in production.
7. Alert on symptoms users feel — SLO burn — not on causes. An alert nobody acts on must be
   deleted.

## Do / Don't

```ts
// Don't — interpolated prose; no field can filter or aggregate on this
console.log(`User ${userId} failed to check out, cart total was ${total}`);

// Do — one structured event with typed fields
logger.info({ event: 'checkout_failed', userId, total, traceId });
```

## Smells

`console.log('here')` · a log line no field can find · nightly alerts everyone ignores · an error
logged and then swallowed.

## When to ignore

Local tools and scripts run by a human watching the output.
