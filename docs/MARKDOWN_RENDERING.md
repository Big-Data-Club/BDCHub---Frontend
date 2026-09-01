# Markdown rendering contract

BDC Hub uses one rendering pipeline for teacher authoring preview, teacher
content view, student content view, quiz content, Studio reports, micro-lessons,
forum posts, and chat messages:

```text
stored Markdown
  -> normalizeMarkdown (outside code only)
  -> react-markdown / CommonMark
  -> remark-gfm + remark-math
  -> rehype-katex
  -> shared React element renderers
```

`src/components/markdown/MarkdownRenderer.tsx` is the source of truth. Do not
introduce a second Markdown preview implementation or wrap it in another
Tailwind `prose` container; nested typography styles cause list and code layout
differences. `MarkdownEditor` intentionally uses edit-only mode and renders its
preview with the shared renderer.

## Supported authoring

- CommonMark headings, paragraphs, emphasis, links, quotes, fenced code, and
  ordered/unordered nested lists.
- GFM tables, task lists, autolinks, strikethrough, and footnotes.
- Inline `$...$` / `\(...\)` and display `$$...$$` / `\[...\]` math.
- Fenced Mermaid diagrams with ` ```mermaid `.
- Common AI list variants (`•`, `●`, `▪`, and `1)`) are normalized outside
  code blocks. Literal code, comments, and LaTeX examples are never rewritten.

Code blocks support language aliases, async syntax grammar loading, optional
line numbers, copy, long-line wrapping, and a plain-text fallback for unknown
languages. Tables and diagrams scroll horizontally on narrow screens.

## Safety and performance

- Raw HTML is not enabled; `react-markdown` remains safe by default.
- External links open with `noopener noreferrer`; relative and anchor links stay
  in the current tab.
- Mermaid uses strict security, bounded text/edge limits, and lazy loading.
- Syntax grammars use the async light Prism build and load on demand.
- Images are lazy-loaded and retain accessible alt text.

## Regression verification

`src/stories/markdown/MarkdownRenderer.stories.tsx` exercises the full contract
in document and compact-chat modes. Run:

```bash
npm run lint -- src/components/markdown/MarkdownRenderer.tsx
./node_modules/.bin/tsc --noEmit -p tsconfig.json
npm run build-storybook -- --quiet
```
