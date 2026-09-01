import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import MarkdownRenderer from '@/components/markdown/MarkdownRenderer';

const SHOWCASE = [
  '# BDC Markdown regression showcase',
  '',
  'Đoạn văn có **chữ đậm**, *chữ nghiêng*, ~~nội dung cũ~~, `inline_code()`,',
  '[liên kết nội bộ](#lists), và công thức inline \\(P:D = C/(B-1)\\).',
  '',
  '## Lists',
  '',
  '• Bullet do AI thường sinh',
  '• Bullet thứ hai',
  '',
  '1) Bước một',
  '2) Bước hai',
  '',
  '- Mục cha',
  '  - Mục con cấp 1',
  '    - Mục con cấp 2 với nhiều dòng để kiểm tra khoảng cách và marker.',
  '- [x] Đã hoàn thành',
  '- [ ] Chưa hoàn thành',
  '',
  '> Ghi chú quan trọng có thể chứa **Markdown**, `code`, và danh sách:',
  '> 1. Một',
  '> 2. Hai',
  '',
  '## Code',
  '',
  '```python',
  'def kv_cache_bytes(tokens: int, bytes_per_token: int = 128 * 1024) -> int:',
  '    """Return KV-cache footprint."""',
  '    return tokens * bytes_per_token',
  '',
  'print(kv_cache_bytes(4096))',
  '```',
  '',
  'Fence không khai báo ngôn ngữ vẫn phải là block code:',
  '',
  '```',
  '<!-- this comment must stay literal -->',
  '\\(this_is_code_not_math\\)',
  '```',
  '',
  '## Table and math',
  '',
  '| Model | FLOP/byte | Kết luận |',
  '| :-- | --: | :-- |',
  '| A100 | 153 | Ridge point |',
  '| H100 | 295 | Compute-rich |',
  '',
  '$$',
  '\\sum_{i=1}^{N} i = \\frac{N(N+1)}{2}',
  '$$',
  '',
  '## Mermaid',
  '',
  '```mermaid',
  'flowchart LR',
  '  A[Lesson evidence] --> B[Question bank]',
  '  B --> C[Complete quiz]',
  '```',
].join('\n');

const meta: Meta<typeof MarkdownRenderer> = {
  title: 'Foundation/Markdown/Renderer',
  component: MarkdownRenderer,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof MarkdownRenderer>;

export const FullDocument: Story = {
  render: () => (
    <main className="min-h-screen bg-white p-8 dark:bg-[#07111F] sm:p-12">
      <article className="mx-auto max-w-4xl">
        <MarkdownRenderer content={SHOWCASE} />
      </article>
    </main>
  ),
};

export const CompactChat: Story = {
  render: () => (
    <div className="max-w-xl p-6">
      <MarkdownRenderer content={SHOWCASE} variant="chat" />
    </div>
  ),
};
