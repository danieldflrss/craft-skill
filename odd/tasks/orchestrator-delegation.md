# Enable craft-orchestrator delegation

## Authorized scope

Update the existing native `craft-orchestrator` manifests so the agent explicitly evaluates whether delegation is feasible and delegates qualifying subagent work. Keep its primary-session ownership, ODD constraints, and output-verification requirements intact across OpenCode, Claude Code, and Codex.

## Tasks

- [x] Define an explicit delegation decision procedure in all native manifests.
- [x] Extend content validation to protect the procedure across all manifests.
- [x] Run the required test suite and review the diff.
- [x] Commit this work unit on the feature branch.

## Evidence

- The current manifests only state which work *may* be delegated; they do not require a feasibility evaluation or decision recording.
- `package.json` requires `npm test` (`node --test`); the repository instructs it must pass before commit.
- Added equivalent procedures to the OpenCode, Claude Code, and Codex manifests: assess suitability, dependencies, authority, and verification; delegate only when benefit exceeds coordination cost; retain primary ownership; and record the decision.
- `node --test test/content-lint.test.js`: 7 passing tests after adding contract coverage (initially failed as expected before the manifests changed).
- `npm test`: 102 passing tests.
- Self-review found no supported defects. `git diff --check` completed without output.

## Next step

Closed with the work-unit commit in this task's git history.
