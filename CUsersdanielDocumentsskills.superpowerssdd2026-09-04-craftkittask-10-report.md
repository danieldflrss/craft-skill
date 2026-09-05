
## Fix Round 1: Handling empty list flags and correcting the non-interactive error message

### Changes applied

**Edit 1 (src/cli.js):** Added `requireValue()` helper function after the `split` definition
(lines 42-47). This function calls `split()` and throws an error if the result is empty,
preventing silent success with zero destinations when a flag like `--agents` is passed with
no value.

**Edit 2 (src/cli.js):** Updated the `--agents` and `--skills` lines in the argument parsing
loop (lines 26-27) to use `requireValue()` instead of bare `split()`, ensuring both flags
reject empty values.

**Edit 3 (src/cli.js):** Replaced the error message at line 111 from
`'Sin TTY: --agents es obligatorio.'` to `'Modo no interactivo: --agents es obligatorio.'`
with an explanatory comment. The old message was misleading because this code path is
reached both without a TTY and via `--yes` on a real terminal.

**Test addition (test/cli.test.js):** Added new test
`'una bandera de lista sin valor falla en vez de quedarse vacia'` (lines 33-36) immediately
before the existing `'agente desconocido lanza error legible'` test. This test verifies that
both `--agents` and `--skills` flags throw an error when passed without a value, pinning the
behaviour that the `requireValue()` function enforces.

### Verification

**Revert test:** Temporarily reverted Edit 2 (restored bare `split()` calls) and ran
`node --test test/cli.test.js`. The new test correctly FAILED with
`AssertionError: Missing expected exception`, confirming the behaviour was not pinned before
the fix. Then restored Edit 2 and re-ran `node --test test/cli.test.js`; all 8 tests in
that file now PASS.

**Git diff:** Confirmed with `git diff src/cli.js` that only the three intended edits are
present; no extraneous changes.

**Full suite:** Ran `npm test` (i.e. `node --test` with no arguments); all 65 tests pass
(up from the prior 64, confirming the new test was added).

**git status:** Shows only `M src/cli.js` and `M test/cli.test.js` are modified; no other
files touched.

### CLI invocation outputs

**Command:** `node src/cli.js install --agents`
**Output:** `--agents necesita un valor.`

**Command:** `node src/cli.js install --yes`
**Output:** `Modo no interactivo: --agents es obligatorio.`

Both invocations now correctly report the issue instead of silently succeeding or reporting
a misleading TTY-specific error.

