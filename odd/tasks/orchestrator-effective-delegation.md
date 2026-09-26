# Make craft-orchestrator delegate effective work

## Authorized scope

Investigate why the native craft-orchestrator installed by this repository does not launch subagents and correct the supported cause. Preserve ODD authorization, task approval, and primary-session ownership. Cover the OpenCode manifest and, if the same defect applies, the Claude Code and Codex manifests; add focused regression checks. Do not change unrelated installation behavior or commit without separate confirmation.

## Tasks

- [x] Verify the native agent configuration and documented subagent mechanism for each affected platform; distinguish prompt weakness from possible disabled permissions or stale installations.
- [x] Make the delegation decision actionable: name suitable subagent/tool choices, launch bounded independent work when beneficial, and record why delegation was skipped when not feasible, without delegating final authority.
- [x] Add checks that distinguish the corrected contract from the current generic delegation language; verify the installed artifact matches its source.
- [x] Run focused checks and `npm test`, inspect the diff, and report runtime limitations and update instructions.

## Evidence

- `src/orchestrator.js` copies the three native manifests; installation requires `--with-orchestrator` and `update` preserves that selection (`src/cli.js`). Existing installations do not update automatically.
- All three manifests say to evaluate and delegate when beneficial, but do not identify an actual subagent tool or concrete next action. `test/content-lint.test.js` verifies only generic wording; no runtime delegation test exists.
- OpenCode V2 documentation confirms `mode: primary` is valid, `subagent` launches child sessions, and the parent agent's `subagent` permission controls launch. The current OpenCode manifest does not explicitly restrict that permission; an external/global restriction remains possible. Context7 documentation lookup failed (invalid API key), so this evidence is from OpenCode's V2 docs.
- A past `odd/tasks/orchestrator-delegation.md` is closed and documented a prompt-only change; that historical test result does not establish actual delegation. Current worktree already has an unrelated deletion of `.github/workflows/ci.yml`; leave it untouched.
- No runtime session or installed copy was supplied; prompt-actionability is a supported hypothesis rather than a proven sole cause.
- Official OpenCode V2 docs identify `subagent` and built-in `explore`/`general`; Claude Code docs identify main-thread `Agent` and `Explore`/`general-purpose`; Codex docs identify multi-agent sessions, `explorer`/`worker`, and the custom-agent files as definitions for spawned sessions. Claude and Codex nested-agent availability depends on the session/client settings.
- The new focused contract test failed before changing the manifests (`missing launch mechanism subagent tool`), then passed with all eight content-lint tests. A real temporary-directory installation copies each source manifest verbatim; its directory is removed in `after`.
- `npm test` completed with 104 passing tests, zero failures/skips. Python `tomllib` parsed the updated Codex manifest. `git diff --check` exited successfully; diff reviewed. No live model run was performed, so actual launch behavior is not proven end-to-end.
- README now explains selecting the primary OpenCode/Claude agent, Codex's child-agent limitation, permission restrictions, and how to update installed copies. The unrelated pre-existing CI deletion remains untouched.
- Delegation decision for this work: read-only repository exploration was delegated independently; platform documentation lookup, tightly coupled manifest/test edits, integration, review, and final checks stayed in the primary session.

## Next step

Implementation verified and left uncommitted. If a commit is desired, request separate confirmation first. A user-provided live session that still fails to delegate would require checking its selected agent, installed copy, and effective subagent permissions.
