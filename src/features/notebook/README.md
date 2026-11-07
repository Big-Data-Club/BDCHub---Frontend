# Shared learner notebook

The course right sidebar and coworker notebook use `NotebookBrowser` with the
existing notebook API/storage. Reading and editing are inline; no dialog at
z-50 can end up behind the coworker drawer. On course routes coworker's notebook
tab closes that drawer and reveals the course notebook. The course sidebar can
collapse and keeps its in-memory draft state; small screens use a focus-trapped
drawer above the coworker layer. Visibility preference is browser-local, notes
and highlight colors are server-persisted and user-owned.

Student TEXT lessons expose selection → color → Ghi chú. The draft contains the
exact quote, content ID, nearby text and UTF-16 offsets. Save uses the same
notebook record; comments can be omitted for a highlight-only entry. Learners
can change colors, remove a highlight while keeping the note, or delete both.
CSS Custom Highlight ranges avoid mutating React's lesson DOM. Older browsers
use range rectangles. Re-anchoring uses exact quoted text and nearby context;
missing/ambiguous text is never highlighted at an invented position. The note
retains its quote even after a lesson edit makes anchoring impossible.

The toolbar is only mounted by student TextRenderer. UI offsets/color/IDs are
not authority: Personalize validates annotation shape and notebook ownership;
LMS continues authorizing lesson access. Never put content IDs in `node_id`
(that field is a knowledge-node ID). Quotes and notebook comments never go in
localStorage. New normal/AI notes retain the course context when available.

Checks: `node --test tests/notebook-anchors.test.cjs`, frontend lint/type/build;
`personalize-service/tests/test_notebook_annotations.py` covers the additive
DuckDB migration and owner isolation; AI's notebook proxy test covers optional
metadata forwarding. Deploy Personalize, then AI HTTP, then frontend.
