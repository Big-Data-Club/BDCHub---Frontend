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
