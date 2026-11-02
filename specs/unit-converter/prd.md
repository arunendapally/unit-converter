# PRD: unit-converter

<!-- Stage 1 Plan. Owner: product-owner agent. Gate: the product lead, asked with "sdlc ask <feature>"; under autonomy it passes on its checks.
     One approval covers this PRD and acceptance.feature, where every requirement becomes a Gherkin
     scenario tagged with the requirement it proves (@R1). Write "None, because ..." for a section that
     does not apply. A slice of a big capability starts with "sdlc init <feature> --capability <capability>",
     which names the capability on the line under the title. -->

## Intent

<!-- Typed by Arun Endapally on 2026-11-02. Only a person changes it: sdlc intent <feature> change: ...; smallest: ...; drop if: ... -->

- Change: Convert on one page
- Smallest: Three categories
- Drop if: Not live

## Problem

<!-- Who has the problem, how often, and what it costs them today. -->

People who need a quick length, weight or temperature conversion today use a search engine widget or an ad-heavy converter site, or do the arithmetic by hand and get it wrong (temperature offsets are the classic error). There is no page of ours that does this at all: today nothing is live. The cost is small per use but frequent, and the page is also the first real product run through the ai-sdlc v0.6.0 plugin, so a page that never goes live fails both purposes.

## Users and jobs

<!-- Each user type and the job they hire this feature to do. -->

- Anyone on the public web with a number in one unit: "tell me this value in another unit of the same kind, right now, without signing up, installing or reading ads."
- Arun Endapally, owner and product lead: "prove the ai-sdlc plugin can take a small real product from intent to a live, probed release."

## Questions asked

<!-- Before drafting, ask the person who asked for this the questions whose answers would change the
     PRD. One per line: "- Q1: <question> A: <answer> (who answered)". If they could not answer, write
     "- Q2: <question> unanswered" and carry it as an assumption. Do not guess silently. -->

None asked, because Arun Endapally was not reachable from this planning session and no open choice is irreversible or conflicts with the repo docs. Every question that would have been asked is carried as an unconfirmed assumption below and listed in Open questions.

## Assumptions

<!-- What this PRD takes as true without proof yet: "- A1: <assumption> [confirmed]" (by a person or a
     fact in facts.md) or "[unconfirmed]". Every unconfirmed assumption appears in Open questions. -->

- A1: The product is one public web page converting within three categories: length, weight, temperature. [confirmed: Arun Endapally, feature brief]
- A2: Plain HTML, CSS and JavaScript, no build step, no runtime dependencies; the conversion logic is an ES module the page imports and Node tests (node:test) import directly, so unit tests need no browser. [confirmed: Arun Endapally, feature brief]
- A3: Deployed to GitHub Pages from the public repo arunendapally/unit-converter by a GitHub Actions workflow that writes the commit sha into `<meta name="build" content="<sha>">`. [confirmed: Arun Endapally, feature brief]
- A4: Owner and product lead is Arun Endapally. [confirmed: Arun Endapally, feature brief]
- A5: Units offered are length: mm, cm, m, km, in, ft, yd, mi; weight: mg, g, kg, oz, lb, st; temperature: C, F, K. [unconfirmed]
- A6: Imperial units use the international definitions (1 in = 25.4 mm, 1 ft = 0.3048 m, 1 yd = 0.9144 m, 1 mi = 1609.344 m, 1 lb = 0.45359237 kg, 1 oz = 1/16 lb, 1 st = 14 lb). [unconfirmed]
- A7: Results update live as the person types or changes a selection; there is no Convert button. [unconfirmed]
- A8: Results are rounded to 6 significant digits with trailing zeros removed. [unconfirmed]
- A9: Only a dot is a decimal separator; "1,5" is rejected as invalid rather than read as 1.5. [unconfirmed]
- A10: Negative length and weight are rejected; zero is allowed. Temperatures below absolute zero are rejected; absolute zero itself is allowed. [unconfirmed]
- A11: Inputs with an absolute value above 1e15 are rejected as too large, because results past that size stop being meaningful at 6 significant digits of the input's precision. [unconfirmed]
- A12: The live URL is https://arunendapally.github.io/unit-converter/ (the GitHub Pages default for this repo). [unconfirmed]
- A13: The page opens on Length, from m to ft, with an empty input. [unconfirmed]
- A14: Constitution 5 (Reversible) is met for a static page by redeploying the previous main commit through the same workflow, rehearsed once before release, rather than by a feature flag. [unconfirmed]
- A15: Constitution 6 (Observable) is met by a scheduled probe that checks the live page and its build meta, with GitHub's failed-workflow email to the owner as the alert and a short runbook; SLO 99% of daily probes pass over 30 days. [unconfirmed]
- A16: The page collects nothing about its visitors: no analytics, no cookies, no storage. So the outcome metric is measured by the probe, not by usage. [unconfirmed]
- A17: The objective this serves is proving the ai-sdlc v0.6.0 plugin end to end on a real public product. [unconfirmed]

## Requirements

<!-- Numbered R1, R2, ... One behaviour each, testable, with the data it needs. Priority: must, should, could. -->

- R1. (must) The page offers exactly three categories, Length, Weight and Temperature, and choosing one limits both unit lists to that category's units (A5). Data needed: category and unit lists.
- R2. (must) On first load the page shows Length selected, from m to ft, an empty input and the empty-input message, with no result number (A13). Data needed: default category and units.
- R3. (must) Length converts between any two of mm, cm, m, km, in, ft, yd, mi using the factors in A6; for example 1 mi is 1.60934 km and 1 ft is 30.48 cm. Data needed: length factors to metres.
- R4. (must) Weight converts between any two of mg, g, kg, oz, lb, st using the factors in A6; for example 1 kg is 2.20462 lb and 1 st is 6.35029 kg. Data needed: weight factors to kilograms.
- R5. (must) Temperature converts between any two of C, F, K using F = C x 9/5 + 32 and K = C + 273.15; for example 100 C is 212 F, 0 C is 273.15 K and -40 F is -40 C. Data needed: the two formulas.
- R6. (must) The result updates on every change to the input, the from unit, the to unit or the category, with no button press (A7). Data needed: none beyond the current inputs.
- R7. (must) The result is shown rounded to 6 significant digits with trailing zeros removed, for example 1 in to mm shows 25.4, not 25.4000 (A8). Data needed: none.
- R8. (must) An empty or whitespace-only input shows the message "Enter a number" and no result number. Data needed: none.
- R9. (must) An input that is not a finite decimal number (for example "abc", "12abc", "1,5", "Infinity") shows the message "Enter a valid number" and no result number; plain forms such as "12", "-3.5", ".5" and "1e3" are accepted (A9). Data needed: none.
- R10. (must) A negative length or weight shows the message "Length and weight cannot be negative" and no result number; zero converts to 0 (A10). Data needed: category of the input.
- R11. (must) A temperature below absolute zero (below 0 K, -273.15 C or -459.67 F) shows the message "Below absolute zero" and no result number; exactly absolute zero converts (A10). Data needed: absolute zero in each temperature unit.
- R12. (must) An input whose absolute value is above 1e15 shows the message "Number too large" and no result number (A11). Data needed: the 1e15 limit.
- R13. (must) When an input becomes invalid, any earlier result is removed at the same moment the message appears, so a stale number is never shown beside a message. Data needed: none.
- R14. (must) The conversion module, imported directly in Node with no browser, returns the same results and the same refusals as the page for R3 to R12. Data needed: the module's exported conversion function.
- R15. (must) The live page at the public URL (A12) responds with HTTP 200 and contains `<meta name="build" content="<sha>">` whose sha equals the main commit the workflow deployed. Data needed: the deployed commit sha, written by the workflow.
- R16. (must) Every control is a native form control with a visible `<label for>` tied to its id, and the page declares its language and a title. Data needed: none.
- R17. (must) A keyboard-only user can choose a category, both units and type a value, and reach the result, with a visible focus indicator on each control. Data needed: none.
- R18. (must) The result and every message are in a polite live region, so a screen reader announces each change without moving focus. Data needed: none.
- R19. (must) At a 320 CSS pixel wide viewport the whole page is usable with no horizontal scrolling. Data needed: none.
- R20. (must) The page loads only its own same-origin HTML, CSS and JavaScript, sends no request after load, and writes no cookie, local storage or session storage. Data needed: none.
- R21. (must) The whole page (HTML, CSS and JavaScript, uncompressed) is under 50 KB. Data needed: none.
- R22. (should) A scheduled probe checks R15 at least daily and fails visibly to the owner when the page is down or the build meta is missing (A15). Data needed: the public URL and the expected sha.

## Non-functional requirements

<!-- How fast, safe, usable and bounded it must be. One line each: the requirement above that states it
     (so acceptance.feature tests it), or "None, because ...". A security and privacy need that touches
     auth, payments or personal data needs the full lane. -->

- Performance: R21
- Security and privacy: R20
- Accessibility: R16, R17, R18, R19
- Limits and quotas: R12

## Never

<!-- What the product must never claim or do: overclaims, dark patterns, risky defaults. -->

- Never show a number for empty, invalid, negative (length, weight), below-absolute-zero or too-large input (Constitution 1).
- Never leave a stale result on screen beside an error message (R13).
- Never show more digits than the 6 significant digits it rounds to, or claim to be a certified or official measurement tool.
- Never collect, store or send anything about the visitor: no analytics, no cookies, no third-party scripts, fonts or ads.
- Never call the page live unless the probe reads the deployed sha from the build meta on the public URL.

## Out of scope

- Any category beyond length, weight and temperature (volume, area, speed, currency and so on).
- A swap-units button, conversion history, favourites, sharing links or URL state.
- Localised number formats (comma decimals, thousands separators) and translation of the page.
- Showing every unit at once; the page converts one value from one unit to one other unit.
- Offline or installable app behaviour, analytics, accounts of any kind.
- A custom domain.

## Outcome metric

<!-- One measurable outcome, its target and its baseline today, or "None, because ...". After release its
     owner reads it (14 days in the full lane, 7 in the light lane). Then the objective it serves, so
     features roll up to an OKR:
Objective: <the objective or OKR key result this moves, or None> -->

Share of daily probes over the 7 days after release that find the public page responding with HTTP 200 and a build meta sha equal to the latest main commit. Baseline today: 0% (no page is live). Target: 100% (7 of 7). Owner: Arun Endapally reads it 7 days after release. Measured by the probe, not by visitor data (A16).

Objective: Prove the ai-sdlc v0.6.0 plugin end to end on a real public product (A17).

## Open questions

<!-- Each with a recommendation, and who can answer it. -->

All of these can be changed later at low cost; each recommendation is the default this PRD already uses.

- A5: Are these the right units for each category? Recommendation: keep them, they cover everyday metric and imperial use. Who can confirm: Arun Endapally.
- A6: Use the international definitions for imperial units (not US survey miles)? Recommendation: yes. Who can confirm: Arun Endapally.
- A7: Live results with no Convert button? Recommendation: yes. Who can confirm: Arun Endapally.
- A8: Round to 6 significant digits, trailing zeros removed? Recommendation: yes. Who can confirm: Arun Endapally.
- A9: Reject comma decimals rather than read them as dots? Recommendation: reject, it is never ambiguous. Who can confirm: Arun Endapally.
- A10: Reject negative length and weight and below-absolute-zero temperatures, allow zero and absolute zero? Recommendation: yes. Who can confirm: Arun Endapally.
- A11: Cap input at an absolute value of 1e15? Recommendation: yes. Who can confirm: Arun Endapally.
- A12: Is the live URL the GitHub Pages default https://arunendapally.github.io/unit-converter/? Recommendation: yes, no custom domain now. Who can confirm: Arun Endapally.
- A13: Open on Length, m to ft, empty input? Recommendation: yes. Who can confirm: Arun Endapally.
- A14: Is redeploying the previous main commit, rehearsed once, an acceptable reading of Constitution 5 instead of a flag? Recommendation: yes for a static page. Who can confirm: Arun Endapally.
- A15: Is a daily probe with GitHub's failed-workflow email, a short runbook and a 99% SLO an acceptable reading of Constitution 6? Recommendation: yes, and keep R22 as should so it can follow in a second PR if the size limit is tight. Who can confirm: Arun Endapally.
- A16: Confirm the page collects nothing about visitors, so usage is not measured. Recommendation: yes. Who can confirm: Arun Endapally.
- A17: Is the objective proving the ai-sdlc plugin end to end, or is there a product OKR this rolls up to? Recommendation: the plugin objective. Who can confirm: Arun Endapally.

## Stakeholders

- Arun Endapally: owner and product lead; approves every gate and the release.
- Public visitors: users of the page; not consulted.

## Dependencies

- GitHub Pages enabled for the public repo arunendapally/unit-converter.
- A GitHub Actions workflow that deploys main to Pages and writes the commit sha into the build meta.
- Node with the built-in node:test runner for unit tests; no other dependency.

## Release criteria

- Every must requirement's scenarios in acceptance.feature pass.
- The change fits one PR under 300 code lines (light lane).
- The release comes from main on the remote, and the probe reads that main sha from the build meta on the public URL (R15).
- A rollback to the previous main commit has been rehearsed once (A14), or, for the first release, removing the Pages deployment has been shown to work.

## Changes since v1

- AC-11 in acceptance.feature: the example "-3.5" was a length, which AC-12 refuses as negative. It now runs as a temperature (C to C), and the outline gained category and unit columns. Found by the QA engineer in Build; ruling by the tech lead. No requirement changed.

