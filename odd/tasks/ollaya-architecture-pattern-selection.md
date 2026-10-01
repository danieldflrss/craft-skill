# Task: Ollaya-assisted architecture pattern selection

## Authorized scope

Extend the `craft-architect` skill so it can use the Ollaya MCP `decide` tool, when available, to help choose an architecture pattern. If Ollaya MCP is unavailable, continue with the existing decision workflow. Keep the architecture guidance and engineering rules authoritative; Ollaya supports the decision rather than replacing them.

## Out of scope

- Requiring users to install or configure Ollaya.
- Adding a runtime dependency, direct Ollaya API client, or repository-level MCP configuration.
- Changing unrelated architecture rules or other skills.

## Evidence inspected

- `skills/craft-architect/SKILL.md`: current process asks agents to assess constraints, compare viable options, and recommend with trade-offs.
- `skills/engineering-rules/SKILL.md` and `skills/engineering-rules/rules/architecture.md`: guidance emphasizes applicable rules, evidence, stable boundaries, and simplicity.
- Repository `AGENTS.md`: skill content must be in English; required `npm test` gate applies before commits.
- Ollaya official docs, `https://ollaya.dev/docs/agents`: MCP tool `decide` accepts state plus typed questions or a preset; MCP resources expose model information.
- Read-only exploration found no existing automated architecture recommendation implementation or tests; architecture selection is currently skill guidance.

## Tasks

1. Define a bounded Ollaya decision protocol in `craft-architect`: provide relevant constraints and structural evidence; use a typed choice/score decision for candidate patterns; retain rationale, uncertainty, and the existing comparison/recommendation standard.
2. Specify graceful fallback when the MCP tool is unavailable or its output is unusable: continue with the existing manual workflow without making Ollaya a prerequisite.
3. Add/update focused tests or repository validation for the skill content, following existing test conventions; run the relevant checks and `npm test`.

## Acceptance evidence

- The skill tells an agent when and how to call Ollaya MCP `decide`, including useful input and how to interpret the result without treating it as unquestionable authority.
- With Ollaya unavailable or an unusable response, the existing workflow still yields the decision; no setup or API dependency is introduced.
- Focused test `node --test test/content-lint.test.js`: passed (10/10). The new contract assertion was first run against the unchanged skill and failed as expected, then passed after the skill update.
- `npm test`: passed (111/111, 0 skipped).
- `git diff --check`: passed.
- No dependency, runtime integration, or MCP configuration was added. No commit was created.

## Next step

Implementation and verification are complete within the approved scope. Review the resulting changes; commit, push, and PR remain separate user decisions.
