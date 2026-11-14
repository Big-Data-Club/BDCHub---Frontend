# DutyLog project landing

Public route: `/projects/dutylog`. Listed in the BDC home page's Projects section.

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

Figma and Behance URLs are configured in `content.ts`. Behance remains a visible
“Sắp công bố” status until a real project URL is supplied. The Figma URL is the
Figma Make link supplied by the team; it is not described as a verified editable
Figma Design deliverable. Publishing Behance and checking public Figma permissions
remain required before submitting Assignment 2.

Product narrative and business model come from DutyLog Assignment 1: a club pilot,
student members and duty staff, no current revenue, benefits still to validate.
The embedded existing app also exposes v2 booking screens; the page does not claim
those are part of the original F1–F7 MVP or that demo actions prove production readiness.
