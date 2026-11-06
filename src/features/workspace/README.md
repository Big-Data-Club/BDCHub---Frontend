# Workspace frontend

Authenticated routes live under `src/app/(workspace)/workspace`. The dedicated
layout keeps the BDC icon rail and provides a separate page tree/editor shell.
`WorkspaceClient` coordinates navigation, panels and dialogs; data access goes
through `api/workspaceService.ts`, and request/state logic lives in hooks.
Inspector sections and database layouts are independent components.

`WorkspaceProvider` implements Yjs transport, durable ACK tracking, reconnect and
per-account/page/generation IndexedDB recovery. Server ticket/access checks must
finish before recovered changes are merged. Permission and generation changes
lock stale sessions. Do not replace this with local optimistic “saved” labels.
Awareness is throttled separately from document updates.

The editor schema adds page references and inline/block math to BlockNote.
Its image spec retains the standard image properties and adds an inline centered
caption, resize handles, expand/zoom and a client-side crop dialog. Crops upload a
new private attachment and keep the original available to undo/history. A stale
crop cannot replace an image changed by another editor. PNG/JPEG/WebP are accepted.
The right outline derives nested entries from document headings and tracks the
scrolling page. Pointer moves and native handle drops move the existing block in
one transaction; a legacy child link outside the document becomes a pageLink on
its first drop. Creating children remains available through /page and the insert
menu; the redundant header child button is removed.
Page covers may reference a private uploaded attachment via cover_image_id. The
server validates its binding and image MIME before accepting the page patch.
Markdown parsing and export preserve equation source. The guide is also rendered
at `/workspace/guide`; opening it inside Workspace keeps the live editor mounted.
The 65 authored formula examples are checked with the same KaTeX settings used in
the UI.

The BFF forwards only its NextAuth access token and validates mutation origins,
allowed paths and body sizes. AI context and legacy notebook conversion require
server-side resource checks. Tasks remain canonical in Auth and are filtered by
their original creator/assignee/admin permissions before the browser receives a
minimal preview. `SaveToWorkspaceButton` is reusable for explicit user saves from
other BDC features.

Metadata drafts keep the version from when editing began. A conflict must keep
the draft and let the user explicitly retry or discard it. Database schema/view
drafts must not silently adopt newer versions received by background polling.

Run `pnpm test:workspace`, `pnpm lint:workspace`, `pnpm exec tsc --noEmit`, and
`pnpm build`. See `tests/workspace/README.md` for isolated browser verification.
The main repository's `docs/features/WORKSPACE.md` and `workspace-service/README.md`
define the complete feature and service contracts.
