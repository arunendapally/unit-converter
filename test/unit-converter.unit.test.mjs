// Feature unit-converter, task T1: tests for src/convert.mjs (AC-4 to AC-6, AC-8 to AC-17, AC-19).
//
// Contract for the builder:
//   export const UNITS = {
//     length: ['mm','cm','m','km','in','ft','yd','mi'],
//     weight: ['mg','g','kg','oz','lb','st'],
//     temperature: ['C','F','K'],
//   };
//   export function convert(category, input, from, to)
//     input is the raw string from the text box.
//     Returns { result: '<string>' } on success or { message: '<exact message>' } on refusal, never both.
//     result = String(Number(x.toPrecision(6))), except from 1e15 up it is in exponent form ("1e+15"),
//     which String() does not give on its own; 1 mg in st gives "1.57473e-7".
//     Messages: "Enter a number", "Enter a valid number", "Length and weight cannot be negative",
//               "Below absolute zero", "Number too large".
//
// Data: pure functions, no I/O. Each test builds its own inputs inline and leaves nothing behind.

import test from 'node:test';
import assert from 'node:assert/strict';
import { convert, UNITS } from '../src/convert.mjs';

const ok = (t, category, value, from, to, result) =>
  t.test(`${category} ${JSON.stringify(value)} ${from} to ${to} is ${result}`, () => {
    assert.deepEqual(convert(category, value, from, to), { result });
  });

const refused = (t, category, value, from, to, message) =>
  t.test(`${category} ${JSON.stringify(value)} ${from} to ${to} says ${message}`, () => {
    const r = convert(category, value, from, to);
    assert.deepEqual(r, { message });
    assert.equal('result' in r, false);
  });

test('AC-4 Length converts between units using the international definitions', async (t) => {
  const rows = [
    ['1', 'mi', 'km', '1.60934'],
    ['1', 'ft', 'cm', '30.48'],
    ['1', 'in', 'mm', '25.4'],
    ['1', 'yd', 'm', '0.9144'],
    ['1', 'km', 'm', '1000'],
    ['100', 'cm', 'm', '1'],
    ['1', 'm', 'mm', '1000'],
  ];
  for (const [v, f, to, r] of rows) await ok(t, 'length', v, f, to, r);
});

test('AC-5 Weight converts between units using the international definitions', async (t) => {
  const rows = [
    ['1', 'kg', 'lb', '2.20462'],
    ['1', 'st', 'kg', '6.35029'],
    ['1', 'lb', 'oz', '16'],
    ['1', 'oz', 'g', '28.3495'],
    ['1', 'g', 'mg', '1000'],
    ['1', 'st', 'lb', '14'],
  ];
  for (const [v, f, to, r] of rows) await ok(t, 'weight', v, f, to, r);
});

test('AC-6 Temperature converts with the Celsius, Fahrenheit and Kelvin formulas', async (t) => {
  const rows = [
    ['100', 'C', 'F', '212'],
    ['0', 'C', 'K', '273.15'],
    ['-40', 'F', 'C', '-40'],
    ['32', 'F', 'K', '273.15'],
    ['0', 'K', 'C', '-273.15'],
    ['5', 'C', 'C', '5'],
  ];
  for (const [v, f, to, r] of rows) await ok(t, 'temperature', v, f, to, r);
});

test('AC-8 Results are rounded to 6 significant digits with trailing zeros removed', async (t) => {
  const rows = [
    ['length', '1', 'in', 'mm', '25.4'],
    ['length', '1', 'm', 'ft', '3.28084'],
    ['length', '1', 'mi', 'm', '1609.34'],
    ['weight', '1', 'mg', 'st', '1.57473e-7'],
    ['length', '3', 'm', 'm', '3'],
  ];
  for (const [c, v, f, to, r] of rows) await ok(t, c, v, f, to, r);
});

test('AC-9 Empty or whitespace-only input asks for a number', async (t) => {
  for (const input of ['', '  ', '\t ']) {
    await refused(t, 'length', input, 'm', 'ft', 'Enter a number');
  }
});

test('AC-10 Input that is not a finite decimal number is refused', async (t) => {
  for (const v of ['abc', '12abc', '1,5', 'Infinity', 'NaN', '1.2.3', '-']) {
    await refused(t, 'length', v, 'm', 'ft', 'Enter a valid number');
  }
});

test('AC-11 Plain decimal forms are accepted', async (t) => {
  // The feature table uses length; -3.5 would be refused as a negative length, so it runs in temperature.
  await ok(t, 'length', '12', 'm', 'm', '12');
  await ok(t, 'temperature', '-3.5', 'C', 'C', '-3.5');
  await ok(t, 'length', '.5', 'm', 'm', '0.5');
  await ok(t, 'length', '1e3', 'm', 'm', '1000');
});

test('AC-12 Negative length and weight are refused', async (t) => {
  const rows = [
    ['length', '-1', 'm', 'ft'],
    ['length', '-0.001', 'km', 'mi'],
    ['weight', '-1', 'kg', 'lb'],
    ['weight', '-5', 'st', 'g'],
  ];
  for (const [c, v, f, to] of rows) await refused(t, c, v, f, to, 'Length and weight cannot be negative');
});

test('AC-13 Zero length and weight convert to zero', async (t) => {
  for (const [c, f, to] of [['length', 'm', 'ft'], ['weight', 'kg', 'lb']]) {
    await ok(t, c, '0', f, to, '0');
  }
});

test('AC-14 A temperature below absolute zero is refused', async (t) => {
  for (const [v, f] of [['-0.01', 'K'], ['-273.16', 'C'], ['-459.68', 'F'], ['-500', 'C']]) {
    await refused(t, 'temperature', v, f, 'C', 'Below absolute zero');
  }
});

test('AC-15 Exactly absolute zero converts', async (t) => {
  const rows = [
    ['0', 'K', 'C', '-273.15'],
    ['-273.15', 'C', 'K', '0'],
    ['-459.67', 'F', 'K', '0'],
  ];
  for (const [v, f, to, r] of rows) await ok(t, 'temperature', v, f, to, r);
});

test('AC-16 An input above 1e15 in absolute value is refused as too large', async (t) => {
  const rows = [
    ['length', '1000000000000001', 'm', 'ft'],
    ['length', '1e16', 'km', 'mi'],
    ['weight', '2e15', 'kg', 'lb'],
    ['temperature', '-2e15', 'C', 'F'],
  ];
  for (const [c, v, f, to] of rows) await refused(t, c, v, f, to, 'Number too large');
});

test('AC-17 An input of exactly 1e15 is accepted', () => {
  const r = convert('length', '1e15', 'm', 'm');
  assert.deepEqual(r, { result: '1e+15' });
  assert.equal('message' in r, false);
});

test('AC-19 The conversion module runs in Node with no browser', () => {
  assert.equal(typeof globalThis.window, 'undefined');
  assert.equal(typeof globalThis.document, 'undefined');
  assert.equal(typeof convert, 'function');
  assert.deepEqual(convert('length', '1', 'm', 'ft'), { result: '3.28084' });
  assert.deepEqual(convert('length', 'abc', 'm', 'ft'), { message: 'Enter a valid number' });
  assert.deepEqual(UNITS, {
    length: ['mm', 'cm', 'm', 'km', 'in', 'ft', 'yd', 'mi'],
    weight: ['mg', 'g', 'kg', 'oz', 'lb', 'st'],
    temperature: ['C', 'F', 'K'],
  });
});

test('AC-4 Units outside the category are refused, never converted or thrown', async (t) => {
  // Review F4: the page is the only thing keeping units in their category; the module must refuse on its own.
  const rows = [
    ['length', '1', 'C', 'm'],
    ['length', '1', 'kg', 'm'],
    ['temperature', '5', 'm', 'ft'],
    ['volume', '1', 'l', 'ml'],
  ];
  for (const [c, v, f, to] of rows) await refused(t, c, v, f, to, 'Choose units from the same category');
});

test('AC-8 Small temperatures keep their 6 significant digits', async (t) => {
  // Review F5: rounding kelvin to 9 decimals lost the digits of small results.
  await ok(t, 'temperature', '0.00000001234', 'C', 'C', '1.234e-8');
  await ok(t, 'temperature', '0.0000000001234', 'C', 'C', '1.234e-10');
});

test('AC-14 A temperature a hair below absolute zero is refused', async (t) => {
  // Review F5: the old rounding let inputs up to 5e-10 K below absolute zero through.
  await refused(t, 'temperature', '-0.0000000004', 'K', 'K', 'Below absolute zero');
  await refused(t, 'temperature', '-459.6700000001', 'F', 'C', 'Below absolute zero');
});
