## Summary

A one-page unit converter for length, weight and temperature: plain HTML, CSS and JS with no dependencies, converting as the visitor types. The conversion logic is `src/convert.mjs`, tested with `node:test`; the page is `index.html` with `src/app.mjs`.
Spec: `specs/unit-converter/prd.md` (R1 to R22, Plan v2) and `acceptance.feature` (AC-1 to AC-29). Not in this PR: the Pages deploy and the scheduled probe workflows (task T4, done in Release because a person approves workflow files).

## Test results

Suite: `node --test test/*.test.mjs` 99 passed, 0 failed, 0 skipped, 0 cancelled on Node 22.23.4 (main has no tests: this repo starts here).
Proof: `sdlc proof unit-converter` passed against 2bd0536 (the init-repo commit); 3 test files locked.
Criteria: 27 of 29 traced (`sdlc tests unit-converter`). AC-21 and AC-29 are release probes and run after the deploy (T4).
Browser: `node test/e2e/unit-converter.e2e.cjs` (Playwright, Chromium) 13 of 13 pass: AC-7, AC-18, AC-23, AC-25, no page errors, and the Back-navigation case. It exits 1 on any FAIL; it is outside the gate, which stays dependency-free.
Fixed in Verify: subtests were not awaited, so Node 22.23 cancelled 55 of the 88 tests the Build gate had counted (F1); two browser crashes when the category changed or was restored by Back (F2, F3); units outside the category, temperature rounding at absolute zero, and the iPhone keypad (F4, F5, F7). See `specs/unit-converter/review.md`.
Removed, skipped or quarantined: none.

## Pre-review

Risk: medium, because it changes code (a static page and a pure conversion module) and touches no high-risk path
Open findings: 0 (nits left open: F8, F10, F12)
Look here first: src/app.mjs:24 (units are refilled on pageshow after Back: is resetting the restored unit choice to the category defaults acceptable?), src/convert.mjs:20 (a new refusal, "Choose units from the same category", reachable only if the page and module disagree: keep it, or treat it as a spec change?), src/convert.mjs:37 (F8: results from 1e6 to 1e15 show padding zeros such as 328084000000000; needs a product ruling)
Lenses run: correctness, simplicity, tests
Revert: git revert of the merge commit; nothing is deployed yet and there is no data to back out
Checked mechanically: 8 mutations (1e15 bound, absolute zero, negative check, 6-digit precision, stone factor, kelvin offset, Fahrenheit offset, survey mile) each caught by the suite; convert() edge cases "-0", "1.", "+5", "1e400"; no new dependencies; no storage or network APIs
Could not check: the iOS keypad on a real device; Firefox and Safari form restore; screen reader output

## Not verified

The browser checks ran in Chromium only, not Firefox or Safari, and not on a phone.
The e2e script needs Playwright; on a machine without it, `sdlc proof` will fail on that file, since the proof command runs it too.
No screen reader was used; AC-24 is checked only by reading the markup (`aria-live="polite"`).
AC-21 and AC-29 (live page and scheduled probe) run only after release.
