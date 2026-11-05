# Workspace verification

Run `pnpm test:workspace`, `pnpm lint:workspace`, `pnpm exec tsc --noEmit` and
`pnpm build` in this frontend repository. Tests validate the BFF trust boundary,
notebook conversion, AI context checks, formula rendering and data transformations.

For browser integration, start the sibling workspace service against a dedicated
database **named `workspace_test`**, and Next on `http://localhost:3100` with the
same generated `JWT_SECRET`. Use a randomly generated `NEXTAUTH_SECRET`,
`NEXTAUTH_URL=http://localhost:3100`, `WORKSPACE_SERVICE_URL=http://127.0.0.1:8088`
and `WORKSPACE_ALLOWED_ORIGINS=http://localhost:3100`.

Keep the local runtime configuration JSON and artifacts outside the repository.
Set `WORKSPACE_TEST_CONFIG` to that JSON, then run `node
tests/workspace/prepare-browser.mjs`. The browser script reads the resulting
`browser-sessions.json` from `WORKSPACE_TEST_ARTIFACTS`. It uses the normal signed
NextAuth/access-token paths, not an application auth bypass. Do not point it at a
shared or production environment.

Install Python Playwright in an isolated environment. `browser-e2e.py` launches
an owned headless browser and tests actual BFF/REST/WebSocket flows. On Windows it
uses the installed Edge executable; set `PLAYWRIGHT_CHROMIUM_EXECUTABLE` to choose
another installed Chromium. Elsewhere use Playwright's installed Chromium.

Other BDC services are needed to verify live AI, legacy notebook, Tasks and LMS
source links end to end. Core Workspace tests do not claim live AI-provider or
production-network verification.
