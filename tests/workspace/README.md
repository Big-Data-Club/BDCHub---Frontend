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

`browser-fields.py` additionally verifies an initially empty field gallery in a
fresh test team space, two custom fields, real +/six-dot menus, URL cards,
persisted customization, parent/child links, field archive/restore, the standalone
handbook, and light/dark/mobile layouts. Generated accounts/artifacts stay in the
isolated test database and external artifact directory.

A frontend configuration regression also checks that development retains Next's
own chunk graph. A fixed `vendor` split chunk must not be applied in development:
with extracted editor styles it can make a CSS asset load as a script. The
production Turbopack build is verified separately from the native dev server.

When checking the built Docker frontend, set `WORKSPACE_TEST_PRODUCTION=1`.
Fixtures use the production secure-cookie name and an explicit signed-cookie
header for the loopback HTTP test transport. This still exercises normal
NextAuth validation; no product auth bypass is enabled. Keep its API and database
on a separate test Docker network, never the main Workspace database.

`browser-chrome.py` covers staying in the gallery after field creation, tooltip
contrast, removed quick actions, sidebar resize/collapse/keyboard/persistence,
cross-field workspace tabs, edited metadata, named page-view history and animated
guide scrolling. It supports the same native/production fixture modes. Tests do
not infer a successful save from a success label that the product no longer shows.

`browser-recycle.py` checks the wide bounded color submenu, trash icons, child-page
Move to Trash, removed captions/row buttons/footer, shared page/field Recycle Bin,
restore, permanent deletion and cancellation, gallery legacy-page search and
mobile layouts. Destructive fixture actions target only freshly created resources
in the isolated workspace_test database. Viewer names now appear for authorized
page readers without an opt-in checkbox, per the explicit product change.

`browser-layout.py` reproduces the mobile submenu clipping case and verifies the
final guide instructions on the built frontend. The submenu honors the actual
menu engine available-height variable, rather than only the window height.

`browser-media.py` checks pointer movement of legacy children, pageLink blocks and
images, centered direct caption editing, expand/zoom, crop output dimensions,
hierarchical heading navigation, uploaded cover saving and reload persistence.
It also captures light, dark and 390 px layouts. Use the same isolated sessions,
API and PostgreSQL setup described above; it creates only fresh fixture pages.
Production mode additionally verifies undo/redo after moving an image.

`browser-library.py` verifies cross-space aggregation, server pagination, nested
expansion, property filtering with AND/OR, column visibility/reorder persistence,
private-source redaction, truthful visits, favorites and new-page creation. It
uses the same isolated API/NextAuth fixtures and checks both themes and a 390 px
viewport. Unit cases cover preference recovery, mandatory columns and incomplete
filter drafts. The library BFF accepts only its two declared catalog routes.

Library navigation checks return to the exact editor/field after changing views
and reloading. Direct/gallery entry returns to the most recently visited
accessible page. Return destinations accept only internal Workspace editors.
