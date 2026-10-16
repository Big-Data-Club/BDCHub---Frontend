// UI smoke against a local Next server with a synthetic NextAuth session.
// Usage: FARM_SMOKE_SECRET=<local test secret> FARM_SMOKE_URL=http://localhost:3217
// PLAYWRIGHT_BROWSERS_PATH=/tmp/bdc-farm-playwright node tests/knowledge-farm/smoke.cjs
const { chromium } = require('@playwright/test');
const { encode } = require('next-auth/jwt');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
(async () => {
  const base = process.env.FARM_SMOKE_URL || 'http://localhost:3217';
  const secret = process.env.FARM_SMOKE_SECRET;
  assert(secret, 'Set a dedicated local FARM_SMOKE_SECRET, never a production secret');
  const catalog = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../../farm-service/internal/farm/catalog.json'), 'utf8'));
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  try {
    const context = await browser.newContext();
    const session = await encode({ secret, token: {
      sub: '41', name: 'Farm UI Test', email: 'farm-ui@example.invalid', role: 'ROLE_USER',
      accessToken: 'synthetic-ui-token', accessTokenExpires: Date.now() + 3600000,
    }, maxAge: 3600 });
    await context.addCookies([{ name: '__Secure-bdc.session-token.v2', value: session, domain: new URL(base).hostname, path: "/", secure: true, httpOnly: true, sameSite: 'Lax' }]);
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const view = {
      state: { earned: 0, daily_earned: 0, reward_day: '2026-10-17', plots: catalog.map((c, i) => ({
        id: i + 1, kind: c.kind, ready_at: new Date(Date.now() - 1000).toISOString(),
        rest_until: '2000-01-01T00:00:00Z', retry_at: '2000-01-01T00:00:00Z', harvests: 0,
      })) }, catalog, server_time: new Date().toISOString(), pending_events: 0, daily_limit: 100, reward: 5,
    };
    await page.route('**/apiv1/**', route => route.fulfill({ json: route.request().url().includes('/users/41') ? {
      id: 41, name: 'Farm UI Test', email: 'farm-ui@example.invalid', role: 'ROLE_USER', totalScore: 0,
    } : [] }));
    await page.route('**/lmsapiv1/**', route => route.fulfill({ json: { data: [] } }));
    await page.route('**/api/ai/agents/notifications', route => route.fulfill({ json: { notifications: [] } }));
    await page.route('**/api/farm{,/**}', async route => {
      const url = route.request().url();
      if (url.endsWith("/score")) return route.fulfill({ json: { total_score: 100 + view.state.earned } });
      const id = Number(url.match(/plots\/(\d+)/)?.[1] || 1);
      const plot = view.state.plots[id - 1];
      if (url.endsWith('/challenge')) {
        const kind = route.request().postDataJSON().kind;
        plot.challenge = { id: 'test-challenge', expires_at: new Date(Date.now() + 600000).toISOString(),
          question: kind === 'quiz' ? { id: 'test-quiz', kind, prompt: 'Lúa thu hoạch được sản phẩm nào?', options: ['Thóc', 'Trứng'] }
            : { id: 'test-card', kind, prompt: 'Điền sản phẩm thu từ lúa.' } };
      }
      if (url.endsWith('/answer')) {
        delete plot.challenge; plot.ready_at = null; plot.harvests++;
        view.state.earned += 5; view.state.daily_earned += 5;
        return route.fulfill({ json: { correct: true, awarded: 5, explanation: 'Lúa tạo ra thóc.', event_id: 'test-event' } });
      }
      view.server_time = new Date().toISOString();
      return route.fulfill({ json: view });
    });
    await page.setViewportSize({ width: 1440, height: 1100 });
    await page.goto(`${base}/knowledge-farm`, { waitUntil: 'networkidle' });
    await page.getByRole('heading', { name: 'Nông trại kiến thức', exact: true }).waitFor();
    await page.getByRole('heading', { name: 'Ngoài đời thực', exact: true }).waitFor();
    assert.equal(await page.getByRole('button', { name: /Đã thu hoạch/ }).count(), 6);
    assert.equal(await page.locator('aside a[href="/knowledge-farm"]').count(), 1);
    await page.getByRole('button', { name: 'Trả lời để thu hoạch', exact: true }).click();
    await page.getByRole('radio', { name: 'Thóc' }).check();
    await page.getByRole('dialog').getByRole('button', { name: 'Trả lời để thu hoạch', exact: true }).click();
    await page.getByText('Thu hoạch thành công! +5 điểm', { exact: true }).waitFor();
    await page.getByRole('button', { name: /Gà mái.*Đã thu hoạch/ }).click();
    await page.getByRole('heading', { name: 'Quy trình chăm sóc cơ bản' }).waitFor();
    await page.getByRole('combobox').selectOption('flashcard');
    await page.getByRole('button', { name: 'Trả lời để thu hoạch', exact: true }).click();
    await page.getByRole('textbox', { name: 'Câu trả lời của bạn' }).fill('thóc');
    await page.getByRole('dialog').getByRole('button', { name: 'Trả lời để thu hoạch', exact: true }).click();
    await page.getByText('Thu hoạch thành công! +5 điểm', { exact: true }).waitFor();
    await page.screenshot({ path: '/tmp/knowledge-farm-desktop.png', fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 });
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), 'mobile horizontal overflow');
    await page.screenshot({ path: '/tmp/knowledge-farm-mobile.png', fullPage: true });
    await page.evaluate(() => { document.documentElement.classList.remove('dark'); document.documentElement.classList.add('light'); });
    await page.getByRole('heading', { name: 'Ngoài đời thực', exact: true }).scrollIntoViewIfNeeded();
    assert(await page.getByRole('heading', { name: 'Ngoài đời thực', exact: true }).isVisible());
    await page.screenshot({ path: '/tmp/knowledge-farm-mobile-light.png', fullPage: true });
    await page.getByRole('button', { name: 'Open menu' }).click();
    await page.getByRole('link', { name: 'Nông trại kiến thức', exact: true }).waitFor();
    assert.deepEqual(errors, []);
    console.log('PASS: desktop/mobile, species guide, quiz harvest, flashcard harvest, no page errors');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
