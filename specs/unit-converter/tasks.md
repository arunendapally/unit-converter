# Tasks: unit-converter

<!-- Stage 4 Build. Passes on checks: the gate green at or above the baseline, the diff under the limit, and every
     task ending with the tasks it waits for ("depends-on: []" for none), with no task missing and no loop. -->

Read first: standards/engineering-standards.md, standards/testing-standards.md, standards/traps.md.

## Tasks

- [ ] T1 [R3, R4, R5, R7, R8, R9, R10, R11, R12] files: src/convert.mjs, test/unit-converter.unit.test.mjs test: AC-4, AC-5, AC-6, AC-8, AC-9, AC-10, AC-11, AC-12, AC-13, AC-14, AC-15, AC-16, AC-17 traps: "The reviewer started rubber-stamping" depends-on: []
- [ ] T2 [R1, R23, R2, R6, R13, R16, R17, R18, R19, R20, R21] files: index.html, src/app.mjs, style.css, test/unit-converter.page.test.mjs test: AC-1, AC-2, AC-3, AC-22, AC-24, AC-26, AC-27, AC-28 (AC-7, AC-18, AC-23, AC-25 by hand in Verify) traps: "Requirements needed data nobody records" (units come from convert.mjs only) depends-on: [T1]
- [ ] T4 [R15, R22] files: scripts/probe.mjs, test/unit-converter.probe.test.mjs, .github/workflows/pages.yml, .github/workflows/probe.yml test: AC-21, AC-29 traps: "A branch deploy was erased by the next merge" depends-on: [T2]. The probe and its tests land in this PR (Verify needs a test per criterion); the two workflows are done in Release, because a human approves workflow files.
