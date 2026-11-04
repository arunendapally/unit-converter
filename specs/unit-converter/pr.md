## Summary

A one-page unit converter for length, weight and temperature: plain HTML, CSS and JS with no dependencies, converting as the visitor types. The conversion logic is `src/convert.mjs`, tested with `node:test`; the page is `index.html` with `src/app.mjs`.
Spec: `specs/unit-converter/prd.md` (R1 to R22, Plan v2) and `acceptance.feature` (AC-1 to AC-29). `scripts/probe.mjs` checks the live page (AC-21, AC-29). Not in this PR: the Pages deploy and scheduled probe workflows that run it (task T4, done in Release because a person approves workflow files).

## Test results

Suite: `node --test test/*.test.mjs` 110 passed, 0 failed, 0 skipped, 0 cancelled on Node 22.23.4 (main has no tests: this repo starts here).
Proof: `sdlc proof unit-converter` passed against 2bd0536 (the init-repo commit); 4 test files locked.
Criteria: 29 of 29 traced (`sdlc tests unit-converter`). AC-21 and AC-29 test the probe against local healthy, down, stale and broken pages; it runs against the public URL in Release.
Browser: `node test/e2e/unit-converter.e2e.cjs` (Playwright, Chromium) 13 of 13 pass: AC-7, AC-18, AC-23, AC-25, no page errors, and the Back-navigation case. It exits 1 on any FAIL; it is outside the gate, which stays dependency-free.
Fixed in Verify: subtests were not awaited, so Node 22.23 cancelled 55 of the 88 tests the Build gate had counted (F1); two browser crashes when the category changed or was restored by Back (F2, F3); units outside the category, temperature rounding at absolute zero, and the iPhone keypad (F4, F5, F7); the probe's sha check and command exit code (F14, F15). See `specs/unit-converter/review.md`.
Removed, skipped or quarantined: none.

## Pre-review

Risk: medium, because it changes code (a static page and a pure conversion module) and touches no high-risk path
Open findings: 0 (nits left open: F8, F10, F12; F13 wontfix)
Look here first: src/app.mjs:26 (units are refilled on pageshow after Back: is resetting the restored unit choice to the category defaults acceptable?), src/convert.mjs:20 (F13: a new refusal, "Choose units from the same category", kept as an internal guard and not added to the spec: agree?), src/convert.mjs:37 (F8: results from 1e6 to 1e15 show padding zeros such as 328084000000000; needs a product ruling)
Lenses run: correctness, simplicity, tests
Revert: git revert of the merge commit; nothing is deployed yet and there is no data to back out
Checked mechanically: 8 mutations (1e15 bound, absolute zero, negative check, 6-digit precision, stone factor, kelvin offset, Fahrenheit offset, survey mile) each caught by the suite; convert() edge cases "-0", "1.", "+5", "1e400"; no new dependencies; no storage or network APIs
Could not check: the iOS keypad on a real device; Firefox and Safari form restore; screen reader output

## Not verified

The browser checks ran in Chromium only, not Firefox or Safari, and not on a phone.
The e2e script needs Playwright; on a machine without it, `sdlc proof` will fail on that file, since the proof command runs it too.
No screen reader was used; AC-24 is checked only by reading the markup (`aria-live="polite"`).
The probe has not run against the public URL yet; that is the Release step. The scheduled workflow that runs it daily is not written yet (T4).
