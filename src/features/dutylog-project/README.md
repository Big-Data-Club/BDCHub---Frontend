# DutyLog project landing

Public route: `/projects/dutylog`. DutyLog is currently excluded from the BDC homepage.

The phone embeds `/dutylog-demo/index.html`, a static Expo export of the **actual
DutyLog React Native screens**, not HTML copies. The frontend needs no new dependencies.
Its API and camera are replaced at build time by `dutylog/mobile/demo/metro.config.cjs`.
All people, IDs, attendance and reservations are synthetic and kept only in memory.
The demo does not ask for camera access, log in or contact a backend. Its CSP blocks
network connections. Reset or reload restores the sample session.

Rebuild after changing DutyLog screens (from CoreApplication):

```sh
node dutylog/scripts/build-product-demo.mjs
```

Requires existing dependencies in `dutylog/mobile/node_modules`. Commit the generated
`frontend/public/dutylog-demo/` assets with the landing changes, so a frontend-only
deployment can serve the demo. `sources.json` records hashes of the source inputs.
Demo adapters do not change the production mobile entry point or API clients.

Figma Design, embed and Behance URLs are configured in `content.ts` using the
links supplied by the team. `DesignDemo` initially offers the Figma design and
loads its responsive iframe only after the viewer clicks **Tải bản thiết kế**.
The file is a Design embed, not a claimed interactive Prototype link. A direct
Figma link remains available beside it. **Ứng dụng mẫu** lazily loads the existing
phone demo; switching modes unmounts the previous iframe.

The smoke test mocks external Figma content to check embed URL, fullscreen,
deferred loading and switching, then exercises the real local application demo.
It checks the supplied Behance link but does not verify external sharing rights.

Product narrative and business model come from DutyLog Assignment 1: a club pilot,
student members and duty staff, no current revenue, benefits still to validate.
The embedded existing app also exposes v2 booking screens; the page does not claim
those are part of the original F1–F7 MVP or that demo actions prove production readiness.
