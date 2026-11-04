// Feature unit-converter, task T4: tests for scripts/probe.mjs (AC-21, AC-29).
// The probe is what Release runs against the public URL and what the scheduled workflow runs daily.
// Here it runs against local servers, so the gate needs no network.
import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { probe } from '../scripts/probe.mjs';

const serve = (status, body) => new Promise((resolve) => {
  const server = http.createServer((req, res) => { res.writeHead(status, { 'content-type': 'text/html' }); res.end(body); });
  server.listen(0, '127.0.0.1', () => resolve(server));
});
const page = (sha) => `<!doctype html><html><head><meta name="build" content="${sha}"></head><body><select id="category"></select><output id="result"></output></body></html>`;
const at = (server) => `http://127.0.0.1:${server.address().port}/`;

test('AC-21 The live page responds and carries the deployed commit sha', async () => {
  const server = await serve(200, page('39d7b3e0123456789abcdef0123456789abcdef0'));
  try {
    const r = await probe(at(server), '39d7b3e0123456789abcdef0123456789abcdef0');
    assert.deepEqual(r, { ok: true, live: '39d7b3e0123456789abcdef0123456789abcdef0', problems: [] });
  } finally { server.close(); }
});

test('AC-29 The scheduled probe fails visibly when the page is unhealthy', async (t) => {
  const cases = [
    ['down', 503, page('39d7b3e'), '39d7b3e', /HTTP 503/],
    ['missing its build meta', 200, '<html><body><select id="category"></select><output id="result"></output></body></html>', '39d7b3e', /build meta/],
    ['serving an old build', 200, page('aaaaaaa'), '39d7b3e', /serves aaaaaaa, expected 39d7b3e/],
    ['missing the converter', 200, '<html><head><meta name="build" content="39d7b3e"></head><body></body></html>', '39d7b3e', /converter/],
  ];
  for (const [state, status, body, sha, why] of cases) {
    await t.test(state, async () => {
      const server = await serve(status, body);
      try {
        const r = await probe(at(server), sha);
        assert.equal(r.ok, false);
        assert.match(r.problems.join('; '), why);
      } finally { server.close(); }
    });
  }
  await t.test('unreachable', async () => {
    const r = await probe('http://127.0.0.1:9/', '39d7b3e');
    assert.equal(r.ok, false);
    assert.match(r.problems.join('; '), /unreachable/);
  });
});
