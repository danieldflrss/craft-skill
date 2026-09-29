# Modern installer wizard

## Authorization and scope

The user authorized option 1: replace the current minimal interactive setup with a modern,
guided terminal installer while retaining the existing non-interactive CLI contract. This task
does not add a full-screen TUI framework, change supported agents or destination rules, or add a
runtime dependency.

## Observed baseline

- `src/prompts.js` has three independent Clack prompts: scope, agents, and skills.
- The installer already provides safe plans, unmanaged-conflict detection, manifest recovery,
  link/junction/copy materialization, and a managed `AGENTS.md` block.
- The interactive path does not select the optional orchestrator, does not render conflicts or
  materialization mode, and silently discards partially supplied scope/agent choices.
- `update` and `uninstall` perform destructive work without an interactive confirmation.
- `npm test` is the required full test command; no executable strict-TDD configuration is present.

## Design

Keep `@clack/prompts` as the presentation boundary. The wizard collects a complete installation
selection and renders an inspectable plan before applying it. Core planning and filesystem code
remain the source of truth; the UI must not duplicate coverage or conflict logic.

The interactive install journey will:

1. Preserve explicit `--local`/`--global` and `--agents` choices, prompting only for values that
   were omitted.
2. Select skills, materialization mode (automatic link/junction with copy fallback, or copy), and
   whether to install the native orchestrator where supported.
3. Render destinations, covered agents, per-destination mode, uncovered/duplicate warnings,
   unmanaged conflicts, and orchestrator destinations.
4. Require an explicit confirmation before writes. A conflict requires a separate explicit
   acknowledgement before the existing `--force` overwrite behavior is enabled.
5. Use Clack progress/status output and end with a concise summary and next action.

The interactive `update` and `uninstall` paths will show their affected scope/items and require
confirmation. Non-TTY and `--yes` behavior stays non-interactive and script-compatible.

## Tasks

- [x] Add behavior-focused prompt/wizard tests, using deterministic answers or injected prompt
  boundaries rather than a real terminal.
- [x] Refactor `src/prompts.js` into a reusable interactive presentation boundary for setup,
  plan rendering, conflict acknowledgement, progress, and lifecycle confirmation.
- [x] Wire `src/cli.js` so interactive install preserves explicit flags and includes every
  installation choice in the plan and execution; retain current non-interactive semantics.
- [x] Add guarded interactive confirmations to `update` and `uninstall` without weakening their
  existing safe removal behavior.
- [x] Update the Spanish README with the interactive wizard journey and unchanged automation
  flags.
- [x] Run focused tests, the real-process CLI smoke tests, and `npm test`; inspect the final diff
  and perform a code review pass.

## Acceptance checks

- An interactive install can choose or retain scope, agents, skills, copy/auto mode, and native
  orchestrator installation.
- The plan shows all writes and all limitations before confirmation, including conflicts and
  coverage warnings.
- Unmanaged conflicts are never overwritten without the user explicitly opting into force.
- Cancelling any wizard or destructive lifecycle confirmation leaves the filesystem unchanged.
- Existing `--yes`/non-TTY installation, dry-run, and manifest safety behavior remain covered.
- The full `npm test` suite passes.

## Evidence and assumptions

- Context7 documentation for Clack confirms supported `select`, `multiselect`, `confirm`,
  `isCancel`, `note`, and `spinner` primitives; no new package is required.
- The installer interacts with user-selected filesystem paths, so prompts must expose—not bypass—
  conflict and coverage information.
- No concurrency, network, credential, or scale changes are in scope.
- Delegation: a bounded read-only exploration was delegated to map the installer, tests, and
  platform constraints. Implementation and final verification remain primary because the CLI,
  prompts, and destructive lifecycle flows are tightly coupled.
- User approval was received before implementation.
- `node --test test/prompts.test.js test/cli.test.js test/cli-smoke.test.js test/lifecycle.test.js`
  passed: 21 tests.
- `npm test` passed: 110 tests. `git diff --check` passed.
- Self-review found no supported blocking defects. The review covered cancellation, conflict
  acknowledgement, dry-run behavior, managed-file safety, and non-interactive compatibility.

## Next step

Ask the user whether to create a work-unit commit for the verified change.
