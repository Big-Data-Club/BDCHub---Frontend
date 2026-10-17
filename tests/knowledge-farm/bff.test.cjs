const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const { NextRequest, NextResponse } = require('next/server');
const filename = path.resolve(__dirname, '../../src/app/api/farm/[[...path]]/route.ts');
const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
function handler(session, fetcher) {
  const mod = { exports: {} };
  const load = name => {
    if (name === 'next-auth') return { getServerSession: async () => session };
    if (name === 'next/server') return { NextResponse };
    if (name.includes('authOptions')) return { authOptions: {} };
    throw new Error(`Unexpected dependency ${name}`);
  };
  new Function('require', 'module', 'exports', 'fetch', 'process', code)(load, mod, mod.exports, fetcher,
    { env: { NEXTAUTH_URL: 'http://localhost:3217', FARM_SERVICE_URL: 'http://farm-test:8087' } });
  return mod.exports;
}
const context = path => ({ params: Promise.resolve({ path }) });
const request = (method, path, body, origin = 'http://localhost:3217') => new NextRequest(`http://localhost:3217/api/farm/${path}`, {
  method, headers: { Origin: origin, 'Content-Type': 'application/json' }, body,
});
test('BFF rejects missing/failed session before upstream', async () => {
  for (const session of [null, {}, { accessToken: 'test', error: 'RefreshAccessTokenError' }]) {
    const api = handler(session, () => { throw new Error('must not fetch'); });
    assert.equal((await api.GET(request('GET', ''), context([]))).status, 401);
  }
});
test('BFF rejects cross-origin writes, arbitrary paths and oversized streamed bodies', async () => {
  const api = handler({ accessToken: 'test' }, () => { throw new Error('must not fetch'); });
  assert.equal((await api.POST(request('POST', 'plots/1/care', '{}', 'https://other.example'), context(['plots','1','care']))).status, 403);
  assert.equal((await api.GET(request('GET', 'admin'), context(['admin']))).status, 404);
  assert.equal((await api.POST(request('POST', 'plots/7/care', '{}'), context(['plots','7','care']))).status, 404);
  assert.equal((await api.POST(request('POST', 'plots/1/care', 'x'.repeat(4097)), context(['plots','1','care']))).status, 413);
});
test('BFF forwards session access token and preserves backend validation status', async () => {
  let upstream;
  const api = handler({ accessToken: 'server-session-token' }, async (url, options) => {
    upstream = { url, options };
    return new Response(JSON.stringify({ error: 'Not ready' }), { status: 409 });
  });
  const result = await api.POST(request('POST', 'plots/1/challenge', '{"kind":"quiz"}'), context(['plots','1','challenge']));
  assert.equal(result.status, 409);
  assert.equal(result.headers.get('Cache-Control'), 'no-store');
  assert.equal(upstream.url, 'http://farm-test:8087/api/v1/farm/plots/1/challenge');
  assert.equal(upstream.options.headers.Authorization, 'Bearer server-session-token');
  assert.equal(upstream.options.body, '{"kind":"quiz"}');
  assert.equal(upstream.options.redirect, 'error');
});
test('BFF returns an actionable error when farm is unavailable', async () => {
  const api = handler({ accessToken: 'test' }, async () => { throw new Error('offline'); });
  assert.equal((await api.GET(request('GET', ''), context([]))).status, 503);
});

test('score endpoint reads only session user and returns only canonical score', async () => {
  let upstream;
  const api = handler({ accessToken: 'test', user: { id: 41 } }, async url => {
    upstream = url;
    return new Response(JSON.stringify({ id: 41, totalScore: 105, email: 'private@example.invalid' }));
  });
  const result = await api.GET(request('GET', 'score?user_id=42'), context(['score']));
  assert.equal(upstream, 'http://backend:8080/api/users/41');
  assert.deepEqual(await result.json(), { total_score: 105 });
});

test('BFF allows only authenticated game actions on the Farm service', async () => {
  const seen = [];
  const api = handler({ accessToken: 'test' }, async (url, options) => {
    seen.push({url, options}); return new Response('{}', {status: 200});
  });
  assert.equal((await api.GET(request('GET', 'game/state'), context(['game','state']))).status, 200);
  for (const action of ['place','action','challenge','move','shop','sell','craft','catch','eat','aid','remove','rename']) {
    assert.equal((await api.POST(request('POST', `game/${action}`, '{}'), context(['game',action]))).status, 200);
  }
  assert(seen.every(item=>item.url.startsWith('http://farm-test:8087/api/v1/farm/game/')));
  assert.equal((await api.POST(request('POST','game/action','{}','https://other.example'),context(['game','action']))).status,403);
  assert.equal((await api.POST(request('POST','game/admin','{}'),context(['game','admin']))).status,404);
});
