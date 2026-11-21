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

Run against a local Next server:

```sh
BDCHUB_SMOKE_URL=http://127.0.0.1:3221 node tests/bdchub-project/smoke.mjs
```

The test exercises publication, curriculum propagation, actual student navigation,
quiz grading, contextual chat/citations, graph, reset and 360/390/768px layouts.
It intercepts and fails any live LMS/AI/Workspace API request from the showcase.
