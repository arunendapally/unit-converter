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

People who need a quick length, weight or temperature conversion use a search engine widget, an ad-heavy converter site, or do the arithmetic by hand and get it wrong; temperature offsets are the classic slip. How often this happens to our visitors is not known: nothing of ours is live, so there is no baseline (A16).

## Users and jobs

- Visitor with a number in one unit: when I have a length, weight or temperature in one unit, I want it in another unit of the same kind at once, so I can carry on without signing up, installing anything or reading ads.

## Questions asked

None asked, because Arun Endapally was not reachable from the planning session and no open choice is irreversible or conflicts with the repo docs. Each choice is an unconfirmed assumption below and listed in Open questions.

## Constraints

Choices a person made before the requirements; the design follows them, and no requirement repeats them.

- Plain HTML, CSS and JavaScript with no build step and no runtime dependencies; the conversion logic can be checked without a browser. (Arun Endapally, feature brief)
- Published on GitHub Pages from the public repo arunendapally/unit-converter. (Arun Endapally, feature brief)
- Owner and product lead: Arun Endapally. (feature brief)

## Assumptions

- A1: The product is one public web page converting within three categories: length, weight, temperature. [confirmed: Arun Endapally, feature brief]
- A5: Units offered are length: mm, cm, m, km, in, ft, yd, mi; weight: mg, g, kg, oz, lb, st; temperature: C, F, K. [unconfirmed]
- A6: Imperial units use the international definitions (1 in = 25.4 mm, 1 ft = 0.3048 m, 1 yd = 0.9144 m, 1 mi = 1609.344 m, 1 lb = 0.45359237 kg, 1 oz = 1/16 lb, 1 st = 14 lb). [unconfirmed]
- A7: Results update as the visitor types or changes a choice; there is no Convert button. [unconfirmed]
- A8: Results are rounded to 6 significant digits with trailing zeros removed. [unconfirmed]
- A9: Only a dot is a decimal separator; "1,5" is refused rather than read as 1.5. [unconfirmed]
- A10: Negative length and weight are refused; zero is allowed. Temperatures below absolute zero are refused; absolute zero itself is allowed. [unconfirmed]
- A11: Values above 1e15 in size are refused as too large. [unconfirmed]
- A12: The public address is https://arunendapally.github.io/unit-converter/. [unconfirmed]
- A13: The page opens on Length, from m to ft, with an empty value. [unconfirmed]
- A14: A bad release is undone by putting the previous version back, rehearsed once before the first release. [unconfirmed]
- A15: Hearing within a day that the page is down or out of date is soon enough for a free utility. [unconfirmed]
- A16: The page collects nothing about its visitors, so how much it is used cannot be measured. [unconfirmed]
- A17: The objective is proving the ai-sdlc plugin end to end on a real public product. [unconfirmed]

## Requirements

- R1. (must) The visitor can choose one of exactly three categories: Length, Weight and Temperature (A1). Needs: nothing new.
- R23. (must) Once a category is chosen, both unit choices offer only that category's units (A5). Needs: the units of each category.
- R2. (must) On first visit the page shows Length, from m to ft, an empty value and the "Enter a number" message, with no result number (A13). Needs: nothing new.
- R3. (must) Length converts between any two of mm, cm, m, km, in, ft, yd, mi using the definitions in A6; for example 1 mi is 1.60934 km and 1 ft is 30.48 cm. Needs: the length definitions.
- R4. (must) Weight converts between any two of mg, g, kg, oz, lb, st using the definitions in A6; for example 1 kg is 2.20462 lb and 1 st is 6.35029 kg. Needs: the weight definitions.
- R5. (must) Temperature converts between any two of C, F, K; for example 100 C is 212 F, 0 C is 273.15 K and -40 F is -40 C. Needs: the temperature scales.
- R6. (must) The result follows every change to the value, either unit or the category, with no button to press (A7). Needs: nothing new.
- R7. (must) The result shows at most 6 significant digits, with trailing zeros removed: 1 in in mm shows 25.4, not 25.4000 (A8). Needs: nothing new.
- R8. (must) An empty value shows "Enter a number" and no result number. Needs: nothing new.
- R9. (must) A value that is not a plain decimal number ("abc", "12abc", "1,5", "Infinity") shows "Enter a valid number" and no result number; "12", "-3.5", ".5" and "1e3" are accepted (A9). Needs: nothing new.
- R10. (must) A negative length or weight shows "Length and weight cannot be negative" and no result number; zero converts to 0 (A10). Needs: nothing new.
- R11. (must) A temperature below absolute zero (0 K, -273.15 C, -459.67 F) shows "Below absolute zero" and no result number; absolute zero itself converts (A10). Needs: absolute zero on each scale.
- R12. (must) A value above 1e15 in size shows "Number too large" and no result number (A11). Needs: nothing new.
- R13. (must) When the value turns invalid, the earlier result disappears at the moment the message appears; a stale number is never shown beside a message. Needs: nothing new.
- R15. (must) A visitor at the public address (A12) always gets the latest released version of the page. Needs: which version was released last.
- R16. (must) Every choice and the value have a visible label that assistive technology reads with them, and the page states its language and title. Needs: nothing new.
- R17. (must) A keyboard-only visitor can choose a category and both units, type a value and reach the result, and can always see where they are. Needs: nothing new.
- R18. (must) A screen reader announces each new result or message without moving the visitor's place on the page. Needs: nothing new.
- R19. (must) On a screen 320 CSS pixels wide the whole page is usable without scrolling sideways. Needs: nothing new.
- R20. (must) The page never collects, keeps or sends anything about the visitor, and nothing on it comes from another site (A16). Needs: nothing.
- R21. (must) The whole page weighs under 50 KB, so it opens quickly on a slow mobile connection. Needs: nothing new.
- R22. (should) If the public page stops working or serves an old version, the owner hears about it within a day (A15). Needs: which version was released last.

## Non-functional requirements

- Performance: R21
- Security and privacy: R20
- Accessibility: R16, R17, R18, R19
- Limits and quotas: R12

## Never

- Never show a number for an empty, invalid, negative (length, weight), below-absolute-zero or too-large value (Constitution 1).
- Never leave a stale result beside a message (R13).
- Never claim to be a certified or official measurement tool.
- Never collect, keep or send anything about the visitor: no analytics, no tracking, no ads.

## Out of scope

- Any category beyond length, weight and temperature (volume, area, speed, currency and so on).
- Swapping units, history, favourites, sharing a conversion.
- Comma decimals, thousands separators and translation.
- Showing every unit at once; offline or installable use; accounts; a custom address.

## Outcome metric

Metric: None, because the page collects nothing about its visitors (R20, A16), so whether people use it or are better off cannot be measured. Whether it stays live and current is checked after release (R22).

Objective: prove the ai-sdlc plugin end to end on a real public product (A17).

## Open questions

All have a low-cost default; Arun Endapally confirms each.

- A5, A6: units and definitions. Recommend: as listed, international definitions.
- A7, A8, A9: live update, 6 significant digits, dot decimals only. Recommend: as listed.
- A10, A11: refuse negatives, below absolute zero and values above 1e15. Recommend: as listed.
- A12, A13: public address and opening state. Recommend: as listed.
- A14, A15: undo by putting the previous version back; hear about an outage within a day. Recommend: yes.
- A16, A17: collect nothing, and the objective is proving the plugin. Recommend: yes.
- Results from 1e6 up to 1e15 show padding zeros (1e14 m in ft shows 328084000000000), while R7 allows 6 significant digits (review F8). Recommend: show exponent form from 1e6 up, in a later change.

## Changes since v1

- AC-11 in acceptance.feature: the example "-3.5" was a length, which AC-12 refuses as negative. It now runs as a temperature (C to C), and the outline gained category and unit columns. Found by the QA engineer in Build; ruling by the tech lead. No requirement changed.

## Changes since v2

- Requirements now state needs, not solutions (Arun Endapally, Verify, 2026-11-04): R15, R16, R18, R20 and R22 no longer name a meta tag, a commit, a workflow, markup or browser storage; the conversion module that ran in Node (R14) is a constraint, not a requirement, and its scenarios AC-19 and AC-20 are gone; R1 is split into R1 and R23.
- New "## Constraints" holds the brief's build and hosting choices (were A2, A3, A4). Removed: the plugin owner as a user, Stakeholders, Dependencies and Release criteria, which repeated the brief or the gate. The outcome metric was uptime; it is now none, because nothing about visitors is collected.
- No behaviour changes, and no code changes.
