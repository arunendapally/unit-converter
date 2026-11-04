// Probe the live page (AC-21, AC-29): HTTP 200, the converter's controls, and a build meta naming the
// expected commit. Prints "Live: <sha>" and exits 1 on any problem, so a scheduled workflow run fails
// visibly and GitHub emails the owner.
//   node scripts/probe.mjs <url> <expected sha, exactly as the page writes it>
import { pathToFileURL } from 'node:url';

export async function probe(url, expected) {
  let res;
  try {
    res = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(10000) });
  } catch (e) {
    return { ok: false, live: null, problems: [`${url} is unreachable (${e.cause?.code ?? e.message})`] };
  }
  const html = await res.text();
  const problems = [];
  if (res.status !== 200) problems.push(`HTTP ${res.status}`);
  if (!/id="category"/.test(html) || !/<output\b[^>]*id="result"/.test(html)) problems.push('the page does not hold the converter');
  const live = html.match(/<meta name="build" content="([0-9a-f]{7,40})">/)?.[1] ?? null;
  if (!live) problems.push('no build meta with a commit sha');
  if (!expected) problems.push('no expected sha given');
  else if (live && live !== expected) problems.push(`serves ${live}, expected ${expected}`);
  return { ok: problems.length === 0, live, problems };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [url, expected] = process.argv.slice(2);
  const r = await probe(url, expected);
  console.log(`Live: ${r.live ?? 'unknown'}`);
  for (const p of r.problems) console.log(`FAIL ${p}`);
  console.log(r.ok ? 'pass' : 'fail');
  process.exitCode = r.ok ? 0 : 1;
}
