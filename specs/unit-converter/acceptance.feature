# Stage 1 Plan, written with the PRD. Every acceptance criterion, as executable Gherkin.
# Test levels for this product (no dependencies, Node built-in node:test only, no browser in the gate):
#   @unit       against the ES module src/convert.mjs (conversion logic and every refusal message).
#   @subsystem  Node reads index.html and the page files as text and checks their structure.
#   @e2e        needs a real browser or the live site. R6, R13, R17, R19 are checked by hand in a
#               browser in Verify. R15 and R22 run after release against the public URL.

Feature: Convert a length, weight or temperature value
  As a visitor with a number in one unit
  I want to see it in another unit of the same kind right away
  So that I do not need an ad-heavy site or error-prone arithmetic

  @R1 @AC-1 @subsystem
  Scenario: The page offers exactly three categories
    Given the page source in index.html
    When the category control is read
    Then it offers exactly "Length", "Weight" and "Temperature"

  @R1 @AC-2 @subsystem
  Scenario Outline: Each category limits both unit lists to its own units
    Given the page source in index.html
    When the units defined for the "<category>" category are read
    Then both the from list and the to list are exactly "<units>"

    Examples:
      | category    | units                      |
      | Length      | mm, cm, m, km, in, ft, yd, mi |
      | Weight      | mg, g, kg, oz, lb, st      |
      | Temperature | C, F, K                    |

  @R2 @AC-3 @subsystem
  Scenario: The page opens on Length from m to ft with an empty input
    Given the page source in index.html
    When the initial state is read
    Then Length is selected, the from unit is "m" and the to unit is "ft"
    And the input is empty
    And the message area says "Enter a number"
    And no result number is present

  @R3 @AC-4 @unit
  Scenario Outline: Length converts between units using the international definitions
    Given the category "length"
    When "<value>" is converted from "<from>" to "<to>"
    Then the result is "<result>"

    Examples:
      | value | from | to | result  |
      | 1     | mi   | km | 1.60934 |
      | 1     | ft   | cm | 30.48   |
      | 1     | in   | mm | 25.4    |
      | 1     | yd   | m  | 0.9144  |
      | 1     | km   | m  | 1000    |
      | 100   | cm   | m  | 1       |
      | 1     | m    | mm | 1000    |

  @R4 @AC-5 @unit
  Scenario Outline: Weight converts between units using the international definitions
    Given the category "weight"
    When "<value>" is converted from "<from>" to "<to>"
    Then the result is "<result>"

    Examples:
      | value | from | to | result  |
      | 1     | kg   | lb | 2.20462 |
      | 1     | st   | kg | 6.35029 |
      | 1     | lb   | oz | 16      |
      | 1     | oz   | g  | 28.3495 |
      | 1     | g    | mg | 1000    |
      | 1     | st   | lb | 14      |

  @R5 @AC-6 @unit
  Scenario Outline: Temperature converts with the Celsius, Fahrenheit and Kelvin formulas
    Given the category "temperature"
    When "<value>" is converted from "<from>" to "<to>"
    Then the result is "<result>"

    Examples:
      | value | from | to | result |
      | 100   | C    | F  | 212    |
      | 0     | C    | K  | 273.15 |
      | -40   | F    | C  | -40    |
      | 32    | F    | K  | 273.15 |
      | 0     | K    | C  | -273.15 |
      | 5     | C    | C  | 5      |

  # Checked by hand in a real browser in Verify (no browser in the gate).
  @R6 @AC-7 @e2e
  Scenario Outline: The result updates on every change with no button press
    Given the page is open with a valid value entered
    When the "<control>" is changed
    Then the displayed result matches the new inputs without any button press

    Examples:
      | control   |
      | input     |
      | from unit |
      | to unit   |
      | category  |

  @R7 @AC-8 @unit
  Scenario Outline: Results are rounded to 6 significant digits with trailing zeros removed
    Given the category "<category>"
    When "<value>" is converted from "<from>" to "<to>"
    Then the result is "<result>"

    Examples:
      | category | value | from | to | result   |
      | length   | 1     | in   | mm | 25.4     |
      | length   | 1     | m    | ft | 3.28084  |
      | length   | 1     | mi   | m  | 1609.34  |
      | weight   | 1     | mg   | st | 1.57473e-7 |
      | length   | 3     | m    | m  | 3        |

  @R8 @AC-9 @unit
  Scenario Outline: Empty or whitespace-only input asks for a number
    Given the category "length"
    When an input that is <input> is converted from "m" to "ft"
    Then the message is "Enter a number"
    And there is no result number

    Examples:
      | input                    |
      | empty                    |
      | two spaces               |
      | a tab and a space        |

  @R9 @AC-10 @unit
  Scenario Outline: Input that is not a finite decimal number is refused
    Given the category "length"
    When "<value>" is converted from "m" to "ft"
    Then the message is "Enter a valid number"
    And there is no result number

    Examples:
      | value    |
      | abc      |
      | 12abc    |
      | 1,5      |
      | Infinity |
      | NaN      |
      | 1.2.3    |
      | -        |

  @R9 @AC-11 @unit
  Scenario Outline: Plain decimal forms are accepted
    Given the category "length"
    When "<value>" is converted from "m" to "m"
    Then the result is "<result>"

    Examples:
      | value | result |
      | 12    | 12     |
      | -3.5  | -3.5   |
      | .5    | 0.5    |
      | 1e3   | 1000   |

  @R10 @AC-12 @unit
  Scenario Outline: Negative length and weight are refused
    Given the category "<category>"
    When "<value>" is converted from "<from>" to "<to>"
    Then the message is "Length and weight cannot be negative"
    And there is no result number

    Examples:
      | category | value | from | to |
      | length   | -1    | m    | ft |
      | length   | -0.001 | km  | mi |
      | weight   | -1    | kg   | lb |
      | weight   | -5    | st   | g  |

  @R10 @AC-13 @unit
  Scenario Outline: Zero length and weight convert to zero
    Given the category "<category>"
    When "0" is converted from "<from>" to "<to>"
    Then the result is "0"

    Examples:
      | category | from | to |
      | length   | m    | ft |
      | weight   | kg   | lb |

  @R11 @AC-14 @unit
  Scenario Outline: A temperature below absolute zero is refused
    Given the category "temperature"
    When "<value>" is converted from "<from>" to "C"
    Then the message is "Below absolute zero"
    And there is no result number

    Examples:
      | value   | from |
      | -0.01   | K    |
      | -273.16 | C    |
      | -459.68 | F    |
      | -500    | C    |

  @R11 @AC-15 @unit
  Scenario Outline: Exactly absolute zero converts
    Given the category "temperature"
    When "<value>" is converted from "<from>" to "<to>"
    Then the result is "<result>"

    Examples:
      | value   | from | to | result  |
      | 0       | K    | C  | -273.15 |
      | -273.15 | C    | K  | 0       |
      | -459.67 | F    | K  | 0       |

  @R12 @AC-16 @unit
  Scenario Outline: An input above 1e15 in absolute value is refused as too large
    Given the category "<category>"
    When "<value>" is converted from "<from>" to "<to>"
    Then the message is "Number too large"
    And there is no result number

    Examples:
      | category    | value         | from | to |
      | length      | 1000000000000001 | m | ft |
      | length      | 1e16          | km   | mi |
      | weight      | 2e15          | kg   | lb |
      | temperature | -2e15         | C    | F  |

  @R12 @AC-17 @unit
  Scenario: An input of exactly 1e15 is accepted
    Given the category "length"
    When "1e15" is converted from "m" to "m"
    Then the result is "1e+15"
    And there is no message

  # Checked by hand in a real browser in Verify (no browser in the gate).
  @R13 @AC-18 @e2e
  Scenario: A stale result is removed the moment the input becomes invalid
    Given the page shows a result for a valid value
    When the input is changed to an invalid value
    Then the earlier result is gone at the same moment the message appears
    And no result number is visible beside the message

  @R14 @AC-19 @unit
  Scenario: The conversion module runs in Node with no browser
    Given src/convert.mjs is imported in Node with no DOM or window
    When the exported conversion function is called with a valid and an invalid input
    Then it returns the result for the valid input and the refusal message for the invalid one

  @R14 @AC-20 @unit
  Scenario: The page calls the same exported function the tests call
    Given the page script in the page files
    When its imports are read as text
    Then it imports the conversion function from the same src/convert.mjs module

  # Runs after release against the public URL.
  @R15 @AC-21 @e2e
  Scenario: The live page responds and carries the deployed commit sha
    Given the workflow has deployed the latest main commit
    When the public URL "https://arunendapally.github.io/unit-converter/" is requested
    Then the response is HTTP 200
    And the page contains a build meta whose content equals the deployed main sha

  @R16 @AC-22 @subsystem
  Scenario: Every control is native and labelled, and the page declares language and title
    Given the page source in index.html
    When the controls, labels and head are read
    Then the category, from unit, to unit and value controls are native select and input elements
    And each has a visible label whose "for" matches its id
    And the html element declares a lang attribute
    And the page has a non-empty title

  # Checked by hand in a real browser in Verify (no browser in the gate).
  @R17 @AC-23 @e2e
  Scenario: A keyboard-only user can convert and sees where focus is
    Given the page is open and only the keyboard is used
    When the user tabs to the category, both units and the value, and chooses and types
    Then the result is reachable
    And each control shows a visible focus indicator

  @R18 @AC-24 @subsystem
  Scenario: The result and messages sit in a polite live region
    Given the page source in index.html
    When the element holding the result and messages is read
    Then it has aria-live "polite"

  # Checked by hand in a real browser in Verify (no browser in the gate).
  @R19 @AC-25 @e2e
  Scenario: The page is usable at 320 CSS pixels with no horizontal scroll
    Given a viewport 320 CSS pixels wide
    When the page is loaded and a conversion is made
    Then every control and the result are usable
    And the page does not scroll horizontally

  @R20 @AC-26 @subsystem
  Scenario: The page references only same-origin files
    Given the page files as text
    When every src, href and import reference is read
    Then none points to another origin
    And there is no http:// or https:// URL used to load anything

  @R20 @AC-27 @subsystem
  Scenario Outline: The page source never uses storage or network APIs
    Given the page files as text
    When the source is searched for "<api>"
    Then it is not found

    Examples:
      | api            |
      | document.cookie |
      | localStorage   |
      | sessionStorage |
      | indexedDB      |
      | fetch(         |
      | XMLHttpRequest |
      | sendBeacon     |

  @R21 @AC-28 @subsystem
  Scenario: The whole page is under 50 KB
    Given the HTML, CSS and JavaScript files of the page
    When their uncompressed sizes are added
    Then the total is under 50 KB

  # Runs after release against the public URL.
  @R22 @AC-29 @e2e
  Scenario Outline: The scheduled probe fails visibly when the page is unhealthy
    Given the probe workflow runs at least daily
    When the public page is "<state>"
    Then the probe run fails so the owner is emailed

    Examples:
      | state                  |
      | down                   |
      | missing the build meta |
      | showing a wrong sha    |
