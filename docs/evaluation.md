# Evaluate generated code before claiming a skill improvement

Compare the baseline and candidate skill revisions on the six fixed tasks in `eval/cases.json`.
Each run starts from `eval/starter.mjs`. The evaluator checks externally visible behavior and
reviews design separately. These small fixtures test specific decisions, not production scalability.

## Run one case

1. Create an isolated workspace outside the checkout and copy `eval/starter.mjs` into it.
   Preserve its `.mjs` extension; the fixtures need only Node and no dependencies.
2. Enable exactly one skill revision and supply the selected case's `task` verbatim to the agent.
   Include the repository instructions used for the experiment. Keep `review` and `checks.mjs`
   out of the agent workspace until implementation is complete. The agent may add its own tests.
3. Save the entire candidate workspace and transcript. Run the evaluator from this checkout:

   ```bash
   EVAL_CASE=authorization EVAL_IMPLEMENTATION=/absolute/run/starter.mjs node --test eval/checks.mjs
   ```

4. Record the exit status and full output, then inspect the diff using the case's `review` criterion.
   A passing test does not prove that shared logic has one owner or that abstractions are justified.
5. Remove disposable workspaces after preserving the evidence. Do not overwrite the baseline fixture.

`checks.mjs` is intentionally outside automatic test discovery. `npm test` validates craftkit;
the evaluation command validates an agent's candidate and is expected to fail against the starter.
The evaluator uses controllable storage adapters; it cannot establish real database atomicity,
query plans, or production latency. Those require separate integration/load experiments.

## Compare revisions fairly

- Pin baseline and candidate commit IDs (or archive hashes), fixture/evaluator revision, model ID,
  provider/version, system instructions, tools, runtime version, and time/token budget.
- Run all six cases at least three times per revision, each in a fresh session/workspace.
  Alternate baseline/candidate order. Record seeds and sampling settings when supported.
- Install one revision's complete skills and rules per run. Record the actual loaded skills/rules;
  do not mix globally installed copies with the selected revision. A no-skills control is optional.
- Keep prompts and starting files identical. Do not reveal evaluator results and repair the same run;
  a repair experiment must be recorded separately with the same repair budget for both revisions.
- Review anonymized diffs when possible. Use the rubric below with file/line evidence, not prose style
  or a preference for a particular pattern. Do not count missing measurements as zero-cost runs.

## Rubric

Score each dimension from 0 to 2; report dimensions individually rather than hiding defects in a total.

| Dimension | 0 | 1 | 2 |
| --- | --- | --- | --- |
| Correctness | Acceptance checks fail | Checks pass, but a demonstrated uncovered defect remains | Checks pass and no additional supported defect is found |
| Design/reuse | Unjustified coupling or duplicated policy remains | Works with avoidable indirection | Localized responsibility and justified reuse without speculative machinery |
| Verification | Missing or vacuous evidence | Useful tests with material gaps | Meaningful behavior/failure checks and honest integration limits |
| Scope/compatibility | Unrelated changes or broken callers | Minor unnecessary changes | Cohesive change preserving unaffected contracts |
| Evidence honesty | Claims checks/measurements that did not run | Results lack commands or context | Commands, results, limitations, and estimates are distinguishable |

Record elapsed time, tool calls, input/output tokens, and cost separately when available.
For authorization or concurrency, a correctness failure prevents accepting that run regardless of
other scores. Describe regressions by case; a higher average cannot erase a new security defect.

## Result record

For each run preserve:

- Revision/fixture hashes, case ID, repetition, model/settings, runtime, tool and instruction context.
- Prompt, transcript, actually loaded rules, candidate workspace/diff, and agent-authored tests.
- Evaluator command/output/exit status and any additional reviewer reproduction.
- Per-dimension scores with file/line rationale; elapsed time and available token/cost metrics.

Publish per-case pass counts, score distributions, cost distributions, and observed regressions.
Mark a run as incomplete when blocked by environment or tooling; do not relabel it passed.
There are no measured model-comparison results bundled with this protocol. Passing craftkit's
content tests establishes instruction integrity, not an improvement in generated software.
