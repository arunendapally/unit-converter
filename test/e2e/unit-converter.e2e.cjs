// Feature unit-converter: browser checks for AC-7, AC-18, AC-23 and AC-25, and the review findings F2 and F3.
// Not part of the gate (the gate runs test/*.test.mjs with no browser and no dependencies). Run it in Verify
// and after any change to index.html, style.css or src/app.mjs, with Playwright and Chromium installed:
//   node test/e2e/unit-converter.e2e.cjs
// It serves this folder on a free local port, drives Chromium, prints pass or FAIL per check, and exits 1 on any FAIL.
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const root = path.join(__dirname, '..', '..');
const types = { '.html': 'text/html', '.mjs': 'text/javascript', '.css': 'text/css' };
const server = http.createServer((req, res) => {
  const u = req.url.split('?')[0];
  const f = path.join(root, u === '/' ? 'index.html' : u);
  fs.readFile(f, (e, b) => {
    if (e) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'content-type': types[path.extname(f)] || 'text/plain', 'cache-control': 'no-store' });
    res.end(b);
  });
});

const results = [];
const check = (ac, name, ok, seen) => results.push({ ok, line: `${ok ? 'pass' : 'FAIL'} ${ac} ${name}: ${seen}` });

server.listen(0, async () => {
  const url = `http://127.0.0.1:${server.address().port}/`;
  const browser = await chromium.launch();
  const errors = [];
  const open = async (options) => {
    const page = await browser.newPage(options);
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(url);
    return page;
  };
  try {
    const page = await open();
    const result = () => page.locator('#result').textContent();
    let r;

    // AC-7: every control updates the result with no button press.
    await page.fill('#value', '1');
    r = await result(); check('AC-7', 'value', r === '3.28084 ft', r);
    await page.selectOption('#to', 'cm');
    r = await result(); check('AC-7', 'to unit', r === '100 cm', r);
    await page.selectOption('#from', 'km');
    r = await result(); check('AC-7', 'from unit', r === '100000 cm', r);
    await page.selectOption('#category', 'temperature');
    r = await result(); check('AC-7', 'category (1 C to F)', r === '33.8 F', r);

    // AC-18: a stale result goes the moment the input turns invalid.
    await page.selectOption('#category', 'length');
    await page.fill('#value', '2');
    const before = await result();
    await page.fill('#value', '2x');
    r = await result(); check('AC-18', 'stale result removed', before === '0.2 cm' && r === 'Enter a valid number', `${before} then ${r}`);

    // AC-23: keyboard only, in order, with a visible focus indicator.
    const kb = await open();
    const order = [];
    const visible = [];
    for (let i = 0; i < 4; i += 1) {
      await kb.keyboard.press('Tab');
      const info = await kb.evaluate(() => {
        const e = document.activeElement;
        const s = getComputedStyle(e);
        return { id: e.id, shown: (s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0) || s.boxShadow !== 'none' };
      });
      order.push(info.id);
      visible.push(info.shown);
    }
    check('AC-23', 'tab order', order.join() === 'category,value,from,to', order.join());
    check('AC-23', 'visible focus on every control', visible.every(Boolean), visible.join());
    await kb.focus('#category');
    await kb.keyboard.press('ArrowDown');
    await kb.keyboard.press('Tab');
    await kb.keyboard.type('10');
    r = await kb.locator('#result').textContent();
    check('AC-23', 'convert by keyboard (10 mg to g)', r === '0.01 g', r);

    // AC-25: 320 CSS pixels wide, no horizontal scroll, everything usable.
    const narrow = await open({ viewport: { width: 320, height: 640 } });
    await narrow.fill('#value', '5');
    await narrow.selectOption('#to', 'mi');
    const w = await narrow.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
    check('AC-25', 'no horizontal scroll', w[0] <= w[1], `scrollWidth ${w[0]}, clientWidth ${w[1]}`);
    const inside = await narrow.evaluate(() => ['category', 'value', 'from', 'to', 'result']
      .map((id) => document.getElementById(id).getBoundingClientRect())
      .every((b) => b.left >= 0 && b.right <= 320 && b.width > 0));
    check('AC-25', 'controls and result inside 320 px', inside, String(inside));
    r = await narrow.locator('#result').textContent();
    check('AC-25', 'converts at 320 px (5 m to mi)', r === '0.00310686 mi', r);

    // F3: after Back, the restored category and its unit lists agree, and typing converts.
    const back = await open();
    await back.selectOption('#category', 'temperature');
    await back.fill('#value', '5');
    await back.goto(`${url}missing.html`);
    await back.goBack();
    const units = await back.evaluate(() => [...document.getElementById('from').options].map((o) => o.value).join());
    await back.fill('#value', '7');
    r = await back.locator('#result').textContent();
    const category = await back.inputValue('#category');
    check('F3', 'Back keeps category and units together', category !== 'temperature' || (units === 'C,F,K' && /^[\d.-]+ [CFK]$/.test(r)), `${category}, units ${units}, result ${r}`);

    check('F2', 'no page errors', errors.length === 0, errors.join(' | ') || 'none');
  } catch (e) {
    check('-', 'script ran to the end', false, e.message);
  } finally {
    await browser.close();
    server.close();
  }
  for (const { line } of results) console.log(line);
  process.exitCode = results.every((x) => x.ok) ? 0 : 1;
});
