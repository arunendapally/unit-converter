// Feature unit-converter, task T2: structure checks on the page files, read as text (no DOM library).
// AC-1, AC-2, AC-3, AC-20, AC-22, AC-24, AC-26, AC-27, AC-28.
//
// Contract for the builder:
//   index.html has <html lang="en">, a non-empty <title>, <select id="category"> with options
//   Length, Weight, Temperature (values length, weight, temperature; Length selected),
//   <select id="from"> and <select id="to"> whose initial options are the length units, with m selected
//   in from and ft selected in to, <input id="value"> empty, each control with <label for="...">,
//   <output id="result" aria-live="polite"> whose initial text is "Enter a number",
//   <meta name="build" content="dev">, and <script type="module" src="src/app.mjs">.
//   src/app.mjs imports { UNITS, convert } from './convert.mjs' and builds the unit options from UNITS.
//
// Data: read-only file reads. Nothing is created, so there is nothing to tear down.

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const path = (p) => fileURLToPath(new URL(p, root));
const read = (p) => readFileSync(path(p), 'utf8');
const size = (p) => statSync(path(p)).size;

const importsFromConvert = (src, name) =>
  new RegExp(`import\\s*\\{[^}]*\\b${name}\\b[^}]*\\}\\s*from\\s*['"]\\./convert\\.mjs['"]`).test(src);

const tag = (html, name, id) => {
  const m = html.match(new RegExp(`<${name}\\b[^>]*\\bid="${id}"[^>]*>`, 'i'));
  assert.ok(m, `<${name} id="${id}"> not found`);
  return m[0];
};
const block = (html, name, id) => {
  const m = html.match(new RegExp(`<${name}\\b[^>]*\\bid="${id}"[^>]*>([\\s\\S]*?)</${name}>`, 'i'));
  assert.ok(m, `<${name} id="${id}"> block not found`);
  return m[1];
};
const options = (inner) =>
  [...inner.matchAll(/<option\b([^>]*)>([\s\S]*?)<\/option>/gi)].map((m) => {
    const text = m[2].trim();
    const v = m[1].match(/\bvalue="([^"]*)"/i);
    return { text, value: v ? v[1] : text, selected: /\bselected\b/i.test(m[1]) };
  });

const LENGTH = ['mm', 'cm', 'm', 'km', 'in', 'ft', 'yd', 'mi'];
const WEIGHT = ['mg', 'g', 'kg', 'oz', 'lb', 'st'];
const TEMPERATURE = ['C', 'F', 'K'];

test('AC-1 The page offers exactly three categories', () => {
  const opts = options(block(read('index.html'), 'select', 'category'));
  assert.deepEqual(opts.map((o) => o.text), ['Length', 'Weight', 'Temperature']);
  assert.deepEqual(opts.map((o) => o.value), ['length', 'weight', 'temperature']);
});

test('AC-2 Each category limits both unit lists to its own units', async (t) => {
  const { UNITS } = await import('../src/convert.mjs');
  const app = read('src/app.mjs');
  assert.ok(importsFromConvert(app, 'UNITS'), "app.mjs must import UNITS from './convert.mjs'");
  assert.ok(importsFromConvert(app, 'convert'), "app.mjs must import convert from './convert.mjs'");
  assert.ok(app.split('UNITS').length > 2, 'app.mjs must use UNITS beyond the import');
  assert.deepEqual(Object.keys(UNITS), ['length', 'weight', 'temperature']);
  for (const [category, units] of [['length', LENGTH], ['weight', WEIGHT], ['temperature', TEMPERATURE]]) {
    await t.test(`${category} units`, () => assert.deepEqual(UNITS[category], units));
  }
  // The initial Length lists in the HTML match the Length units for both controls.
  const html = read('index.html');
  for (const id of ['from', 'to']) {
    assert.deepEqual(options(block(html, 'select', id)).map((o) => o.text), LENGTH);
  }
});

test('AC-3 The page opens on Length from m to ft with an empty input', () => {
  const html = read('index.html');
  const selected = (id) => options(block(html, 'select', id)).filter((o) => o.selected).map((o) => o.value);
  assert.deepEqual(selected('category'), ['length']);
  assert.deepEqual(selected('from'), ['m']);
  assert.deepEqual(selected('to'), ['ft']);
  assert.doesNotMatch(tag(html, 'input', 'value'), /\svalue="[^"]+"/i);
  assert.equal(block(html, 'output', 'result').replace(/<[^>]*>/g, '').trim(), 'Enter a number');
  assert.match(html, /<meta\s+name="build"\s+content="dev"\s*\/?>/i);
});

test('AC-20 The page calls the same exported function the tests call', () => {
  assert.ok(importsFromConvert(read('src/app.mjs'), 'convert'));
  assert.match(read('index.html'), /<script\s+type="module"\s+src="src\/app\.mjs"\s*><\/script>/i);
});

test('AC-22 Every control is native and labelled, and the page declares language and title', () => {
  const html = read('index.html');
  assert.match(html, /<html\b[^>]*\blang="en"/i);
  const title = html.match(/<title>([\s\S]*?)<\/title>/i);
  assert.ok(title && title[1].trim().length > 0, 'non-empty title');
  tag(html, 'select', 'category');
  tag(html, 'select', 'from');
  tag(html, 'select', 'to');
  tag(html, 'input', 'value');
  for (const id of ['category', 'from', 'to', 'value']) {
    const m = html.match(new RegExp(`<label\\b[^>]*\\bfor="${id}"[^>]*>([\\s\\S]*?)</label>`, 'i'));
    assert.ok(m, `label for ${id}`);
    assert.ok(m[1].replace(/<[^>]*>/g, '').trim().length > 0, `label text for ${id}`);
  }
});

test('AC-24 The result and messages sit in a polite live region', () => {
  assert.match(tag(read('index.html'), 'output', 'result'), /\baria-live="polite"/i);
});

test('AC-26 The page references only same-origin files', () => {
  for (const f of ['index.html', 'src/app.mjs', 'style.css']) {
    assert.doesNotMatch(read(f), /https?:\/\//i, `${f} must not contain http:// or https://`);
  }
  assert.doesNotMatch(read('index.html'), /(?:src|href)\s*=\s*["']\s*\/\//i, 'no protocol-relative URLs');
});

test('AC-27 The page source never uses storage or network APIs', async (t) => {
  const apis = ['document.cookie', 'localStorage', 'sessionStorage', 'indexedDB', 'fetch(', 'XMLHttpRequest', 'sendBeacon'];
  for (const api of apis) {
    await t.test(api, () => {
      for (const f of ['src/app.mjs', 'src/convert.mjs', 'index.html']) {
        assert.equal(read(f).includes(api), false, `${f} must not contain ${api}`);
      }
    });
  }
});

test('AC-28 The whole page is under 50 KB', () => {
  const total = ['index.html', 'style.css', 'src/app.mjs', 'src/convert.mjs'].reduce((n, f) => n + size(f), 0);
  assert.ok(total < 50 * 1024, `total ${total} bytes`);
});
