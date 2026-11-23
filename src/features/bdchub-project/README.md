# BDC Hub public project showcase

`/projects/bdchub` introduces the product through its course management,
student learning, knowledge graph and AI Cowork experiences. Legacy
`/instructions` routes redirect here. Landing copy stays focused on product
value; a single demo label identifies the local preview.

The showcase reuses production components, not screenshots or a separate UI kit:

- `CourseTableRow` / `CourseMobileCard` for course management.
- `SidebarSection`, `CourseLearningSidebar`, `PrevNextButtons`,
  `QuizQuestionCard` and `MarkdownRenderer` for curriculum and learning.
- `KnowledgeGraph` for the canvas graph, with optional read-only fixture mode.
- `AgentInputBar`, `ChatModeSelector` and `AgentMessageItem` for AI Cowork.

Only controllers and synthetic fixtures are specific to the public showcase.
They own publication, curriculum additions, lesson selection, completion and
quiz responses locally. The actual student sidebar uses its existing context
contract, supplied by a local fixture provider. No production course IDs,
credentials or user records are exported. Chat replies and citations are bounded
scripts, not model inference; public chat hides persistence/feedback actions.

The graph's optional read-only mode disables job polling, chunk requests and
all write handlers/toolbars. Existing authenticated graph behavior defaults to
unchanged. The canvas loads only when selected and unmounts when leaving;
read-only animation has bounded physics ticks and no perpetual particles.
Student and chat chunks load on first selection and retain state until reset.
No dependencies were added.

`PlatformOverview` is a server-rendered, conceptual architecture overview, with
an original SVG schematic and local SVG logos. It groups product capabilities,
not individual network routes or deployment guarantees. PostgreSQL, Redis,
Qdrant/Neo4j and Kafka labels follow the repository's Compose/configuration;
availability depends on the deployed environment. It adds no client state,
diagram engine, remote fonts or runtime icon CDN requests.
Small screens scroll the diagram within a keyboard-focusable region to preserve
readable labels. Browser checks at 1440/768/390px verify no text/text or text/icon
overlap and no horizontal page overflow.

Design references:

- [Developer Icons](https://github.com/xandemon/developer-icons): selected SVGs
  under `public/projects/bdchub/tech/`; MIT notice retained alongside assets.
- [Diagram Design](https://github.com/cathrynlavery/diagram-design): architecture
  skill used for tier grouping, visual hierarchy and restrained connectors,
  adapted to the existing BDC Hub palette, fonts and responsive components.
- [ByteByteGo blueprint](https://bytebytego.com/guides/system-design-blueprint-the-ultimate-guide/):
  reference for separating APIs, caches, storage and background queues. No
  ByteByteGo illustration is copied or bundled.

Run against a local Next server:

```sh
BDCHUB_SMOKE_URL=http://127.0.0.1:3221 node tests/bdchub-project/smoke.mjs
```

The test exercises publication, curriculum propagation, actual student navigation,
quiz grading, contextual chat/citations, graph, reset and 360/390/768px layouts.
It intercepts and fails any live LMS/AI/Workspace API request from the showcase.
