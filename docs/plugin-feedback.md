# ai-sdlc plugin feedback from the unit-converter run

What the ai-sdlc plugin (0.6.0) did wrong or made harder while taking the `unit-converter` feature from intent to release, found from `git log`, `sdlc` output and the Verify session on 2026-11-04. Each entry: what happened, the exact message, and a proposed fix. Fixes land in the plugin repo, one PR per related group.

## Plan

### P1. The PRD stated solutions, not requirements

- **What happened:** the approved PRD (v2) put mechanisms in its requirements: R14 "The conversion module, imported directly in Node", R15 "`<meta name="build" content="<sha>">` whose sha equals the main commit the workflow deployed", R20 "writes no cookie, local storage or session storage", R22 "A scheduled probe". The scenarios read the page source ("Given the page source in index.html"). The light lane has no Design stage, so the build choices had nowhere else to go, and nothing checked. Rewritten as PRD v3 on 2026-11-04.
- **Message:** none; that is the problem.
- **Fix:** the PRD template says requirements, not solutions, and gets an optional `## Constraints` for choices a person made; `tasks.md` gets `## Approach` as the light lane's design; the Plan gate warns on solution language in requirements and scenario steps; the product owner and tech lead agents say the same; a golden and an agent eval.

### P2. The gate command was accepted without running once

- **What happened:** `sdlc init-repo` stored `"gateCommand": "node --test test/"`. On Node 22 a directory argument is read as a module path, so the command always fails. It was found and fixed at Plan v2 (commit dca318b, `.ai-sdlc/config.json`).
- **Message:** `Error: Cannot find module '/home/user/unit-converter/test'` then `not ok 1 - test`.
- **Fix:** `init-repo` (and the first `sdlc gate`) runs the gate command once and refuses one that fails before any test runs, or that runs fewer than one test file, naming the likely fix (`node --test "test/**/*.test.mjs"`). The getting-started guide gives that form for Node.

## Build

### B1. The gate counted tests a newer Node never ran

- **What happened:** the Build gate recorded `Gate green: 88 passing (baseline 88)` on 2026-11-02. On Node 22.23.4 the same suite ran 33 of 88: the unit tests started subtests with `t.test()` without awaiting them, and Node cancels those when the parent returns. The gate stores no runtime, so nobody could tell the run had changed under it. Fixed in the product (F1, commit cf0bf79).
- **Message:** `# tests 88 # pass 33 # fail 12 # cancelled 43` and `error: 'test did not finish before its parent and was cancelled'`.
- **Fix:** the gate records the runtime version with its count (`node --version`, or a `runtimeCommand`) and warns when it differs from the baseline's; a trap in `standards/traps.md` for un-awaited subtests, guarded by a lint rule or a check that a node:test run reports `# cancelled 0`.

### B2. End-to-end test files count as code toward the PR limit

- **What happened:** `test/e2e/unit-converter.e2e.cjs` (115 lines) counted as code: PR size went from 97 to 222 of 300 when it and the Verify fixes landed. The test matrix treats `**/*.e2e.*` and `test/e2e/**` as tests, but `prLineExcludes` (scripts/lib.mjs:138) does not.
- **Message:** `Gate green: 99 passing (baseline 99). PR size: 222 of 300 code lines.`
- **Fix:** add the e2e patterns the test matrix knows (`**/*.e2e.*`, `**/e2e/**`, `**/*.e2e-spec.*`) to `prLineExcludes`.

## Verify

### V1. The proof claims criteria it never ran

- **What happened:** with six criteria traced to no test, `sdlc proof` still listed all 29 as proved.
- **Message:** `Proof passed against 2bd0536: AC-1, AC-2, ... AC-29 failed on the base code and pass here.` while `sdlc tests` said `6 criteria are not tested at their level.`
- **Fix:** the proof names only criteria traced to a locked test file, and lists the rest as `not proved: no test`.

### V2. No "Greenfield" note on a repo with no product code

- **What happened:** the base commit 2bd0536 held only what `sdlc init-repo` wrote (standards, `.github` scripts, `.claude`, `CONSTITUTION.md`), so every test failed there because the code was missing. The proof did not say so: the init-repo scaffold counts as code.
- **Message:** the proof line above, with no `Greenfield:` sentence.
- **Fix:** the greenfield check (scripts/loop.mjs:123) ignores files that `init-repo` copies from `templates/repo/`.

### V3. The plugin's own traps leak into the product's test matrix

- **What happened:** `init-repo` copies the plugin's `standards/traps.md`, which cites the plugin's own test "AC-7". `sdlc tests` then matched the product's AC-7 against it.
- **Message:** `AC-7 has no test: standards/traps.md names it but is not a recognised test file. Rename it to a test pattern, or a person adds its pattern to "testLevels" in .ai-sdlc/config.json`
- **Fix:** the repo template's `traps.md` cites no test ids of the plugin (name the test file instead); the test matrix ignores `standards/**`.

### V4. Criteria that can only run after release block Verify

- **What happened:** AC-21 (the live page is the released version) and AC-29 (the owner hears about an outage) can only run against the public site. Verify refused them, so a probe module and local-server tests were written early to get past the gate; the scenarios as written still run only after release.
- **Message:** `Gate 5 cannot be requested: - test matrix: AC-21 has no test: name a test after it (...)` and the same for AC-29.
- **Fix:** a `@release` tag (or `@probe`) marks a scenario proved at Release by a probe in `release.md`; Verify lists it as due at Release instead of refusing, and Release refuses until a probe names it with a result.

### V5. Criteria checked by hand have no place for their evidence

- **What happened:** the plan said AC-7, AC-18, AC-23 and AC-25 are "checked by hand in a real browser in Verify". `sdlc tests` reported them as untested and nothing recorded the hand check. The pre-review found the check script lived in a scratch folder and could not fail (F6); it is now committed.
- **Message:** `- AC-7 has no test: name a test after it (...)` for each.
- **Fix:** prefer a committed e2e check (the template's test plan says so); where a check is truly manual, a `@manual` tag with a `Checked by hand: AC-n, <who>, <date>, <how>` line under `## Test results` in `pr.md`, which the gate reads.

### V6. The proof runs end-to-end scripts that need tools the gate does not

- **What happened:** `proofCommand` is `node --test {files}`, and the proof picks every file naming a criterion, including the Playwright script. It passed here only because Playwright was installed; on a machine without it the proof fails on that file.
- **Message:** none here; recorded under "Not verified" in `pr.md`.
- **Fix:** a per-level proof command (`proofCommands: { e2e: ... }`), or the proof skips files of a level whose command is not set and says so.

## Guard

### G1. A read-only listing counted toward the denial cap

- **What happened (reported by the earlier session):** a read-only `ls .ai-sdlc .github/workflows` was refused, and the refusal counted toward the two-refusals cap that holds the session until the person replies. Reading state through `sdlc status --json` or the Read tool works.
- **Message:** not recorded in this repo; the earlier session reported it.
- **Fix:** the Bash guard allows read-only listings (`ls`, `stat`) of `.ai-sdlc/` and `.github/`, and a refusal of a read-only command does not count toward the cap.
