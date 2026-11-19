# BDC homepage

Only `/` uses this composition. Shared navigation, event pages, project detail
pages and tenant websites retain their own layouts. `clubData.json` remains the
source for activities, projects and publications.

Visual references: [Hallmark Studio](https://www.usehallmark.com/themes/studio/)
for editorial typography and the page grid, and
[Outcrowd's incident management concept](https://dribbble.com/shots/26742281-Website-for-an-Incident-Management-Platform)
for subtle blue light accents. Implementation is original CSS and React; no
theme runtime, copied source or new dependency is included.

The five research areas and four club values live in `content.ts`. The direct
affiliation is HPC Lab (`https://hpcc.hcmut.edu.vn/`), with HCMUT retained as its
parent in homepage structured data.

Content components render on the server. The shared `AmbientEffects` accepts server-rendered
children and only enhances their DOM. The pointer glow coalesces events into one
pending animation frame, with no idle loop or React state updates. Eighteen CSS
stars animate only while the hero is visible and the document is active.
IntersectionObserver reveals each below-fold element once. Without JavaScript
or IntersectionObserver content remains visible. Reduced motion disables effects;
coarse pointers do not register pointer handlers. Effects, listeners and pending
frames are cleaned up on unmount or preference changes.

Pointer movement stamps stationary light marks into a pool of 12 elements.
Each mark fades naturally over 700 ms, including after pointer leave.
Sampling is bounded by distance (22 px), time (48 ms) and one pending animation
frame. Web Animations only animate opacity and scale; no idle frame loop runs.
Active animations are cancelled on unmount, reduced motion or hidden tabs.

The hero has no large thumbnail. All seven activities use the existing dataset,
with local WebP photos for every event. The original Google image sources were
retained as the input when optimizing the other five event photos; no replacement
imagery was invented. Images below the fold load lazily. DutyLog is
temporarily excluded from the homepage, retained in the dataset and available at
`/projects/dutylog`. Its existing interactive demo remains on that page, which
shares the ambient effect component and editorial visual direction.

The homepage header shares its paper/navy surface. Five research areas appear
directly beneath the wordmark, including Artificial Intelligence written in full.
Shared navigation retains its existing styling on other routes.

Checks:

```sh
pnpm exec eslint src/components/home/editorial 'src/app/(landing)/page.tsx'
pnpm exec tsc --noEmit
# Against a local Next dev or production server:
LANDING_SMOKE_URL=http://127.0.0.1:3219 node tests/home-landing/smoke.mjs
```

Screenshots default to `/tmp/bdc-home-landing`; override with `LANDING_SCREENSHOTS`.
`PLAYWRIGHT_CHROMIUM_EXECUTABLE` can select an existing browser installation.
These checks do not measure production bundle size, field Core Web Vitals or
performance on a physical low-end device.
