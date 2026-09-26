# Enable craft-orchestrator delegation

## Authorized scope

Update the existing native `craft-orchestrator` manifests so the agent explicitly evaluates whether delegation is feasible and delegates qualifying subagent work. Keep its primary-session ownership, ODD constraints, and output-verification requirements intact across OpenCode, Claude Code, and Codex. Make commits optional for agent users, requiring their confirmation before each commit. After creating an ODD task, require user approval before implementation begins.

## Tasks

- [x] Define an explicit delegation decision procedure in all native manifests.
- [x] Extend content validation to protect the procedure across all manifests.
- [x] Run the required test suite and review the diff.
- [x] Commit this work unit on the feature branch.
- [x] Make native-agent commits optional and confirmation-gated.
- [x] Require approval after creating ODD task artifacts and before implementation.

## Evidence

- The current manifests only state which work *may* be delegated; they do not require a feasibility evaluation or decision recording.
- `package.json` requires `npm test` (`node --test`); the repository instructs it must pass before commit.
- Added equivalent procedures to the OpenCode, Claude Code, and Codex manifests: assess suitability, dependencies, authority, and verification; delegate only when benefit exceeds coordination cost; retain primary ownership; and record the decision.
- `node --test test/content-lint.test.js`: 7 passing tests after adding contract coverage (initially failed as expected before the manifests changed).
- `npm test`: 102 passing tests.
- Added equivalent task-approval gates to all native manifests. After creating `odd/tasks/<feature-name>.md`, the agent presents it, asks for confirmation, and waits for explicit approval before implementation.
- The strengthened content test failed before the manifests changed, then passed: `node --test test/content-lint.test.js` (7 passing tests).
- `npm test`: 102 passing tests.
- Self-review found no supported defects. `git diff --check` completed without output.
- Added equivalent optional-commit instructions to all native manifests. Each now requires user confirmation immediately before a commit and reports verified, uncommitted work if the user declines.
- The strengthened content test failed before the manifests changed, then passed: `node --test test/content-lint.test.js` (7 passing tests).
- `npm test`: 102 passing tests.

## Next step

Closed with work-unit commits in this task's git history.
