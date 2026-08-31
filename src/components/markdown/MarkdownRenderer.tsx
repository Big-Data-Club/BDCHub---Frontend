/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { Check, Copy, ZoomIn, X, ZoomOut } from 'lucide-react';

import { cn } from "@/lib/utils";

interface MarkdownRendererProps {
  content: string;
  className?: string;
  variant?: 'default' | 'chat' | 'chat-user';
}

/**
 * Accept both Markdown math ($...$, $$...$$) and the standard LaTeX
 * delimiters produced by many AI tools (\\(...\\), \\[...\\]).  Code fences are
 * deliberately left untouched so that examples containing LaTeX stay literal.
 */
function normalizeMathDelimiters(markdown: string) {
  return markdown
    .split(/(```[\s\S]*?```)/g)
    .map((part, index) => {
      if (index % 2 === 1) return part;
      return part
        .replace(/\\\[\s*([\s\S]*?)\s*\\\]/g, (_, math) => `\n\n$$\n${math}\n$$\n\n`)
        .replace(/\\\(([\s\S]*?)\\\)/g, (_, math) => `$${math}$`);
    })
    .join('');
}

/** Strip HTML comments (speaker-notes, etc.) that shouldn't be visible. */
function stripHtmlComments(markdown: string) {
  return markdown.replace(/<!--[\s\S]*?-->/g, '');
}

function copyText(text: string) {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text);

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  textarea.remove();
  return Promise.resolve();
}

// ─── Mermaid Block ────────────────────────────────────────────────────────────

let mermaidInitialized = false;

function MermaidBlock({ chart, compact }: { chart: string; compact: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [zoomed, setZoomed] = useState(false);
  const idRef = useRef(`mermaid-${Math.random().toString(36).slice(2)}`);

  useEffect(() => {
    let cancelled = false;

    async function render() {
      try {
        const mermaid = (await import('mermaid')).default;

        if (!mermaidInitialized) {
          mermaid.initialize({
            startOnLoad: false,
            theme: 'dark',
            themeVariables: {
              background: '#030712',
              primaryColor: '#1e40af',
              primaryTextColor: '#e2e8f0',
              lineColor: '#475569',
              secondaryColor: '#1e3a5f',
              tertiaryColor: '#0f172a',
            },
            fontFamily: 'ui-monospace, SFMono-Regular, monospace',
          });
          mermaidInitialized = true;
        }

        const { svg: rendered } = await mermaid.render(idRef.current, chart.trim());
        if (!cancelled) setSvg(rendered);
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      }
    }

    render();
    return () => { cancelled = true; };
  }, [chart]);

  const openZoom = useCallback(() => setZoomed(true), []);
  const closeZoom = useCallback(() => setZoomed(false), []);

  if (error) {
    return (
      <div className={cn("relative my-4 rounded-xl overflow-hidden border border-red-500/30 bg-red-950/20")}>
        <div className="px-4 py-2 text-xs font-semibold text-red-400 border-b border-red-500/20 bg-red-950/40">
          ⚠ Mermaid parse error
        </div>
        <pre className="p-4 text-xs text-red-300 whitespace-pre-wrap font-mono overflow-x-auto">{error}</pre>
        <pre className="px-4 pb-4 text-xs text-slate-500 whitespace-pre-wrap font-mono overflow-x-auto">{chart}</pre>
      </div>
    );
  }

  if (!svg) {
    return (
      <div className={cn("flex items-center justify-center my-4 rounded-xl bg-slate-950/60 border border-slate-800", compact ? "h-16" : "h-24")}>
        <span className="text-xs text-slate-500 animate-pulse">Rendering diagram…</span>
      </div>
    );
  }

  return (
    <>
      {/* Inline diagram */}
      <div className={cn("relative group my-4 rounded-xl overflow-hidden bg-slate-950/80 border border-slate-800 shadow-lg", compact ? "p-2" : "p-4")}>
        <div
          ref={containerRef}
          className="flex justify-center items-center overflow-x-auto"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
        {/* Zoom button */}
        <button
          type="button"
          onClick={openZoom}
          className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-semibold text-slate-400 bg-slate-800/80 hover:bg-slate-700 hover:text-white transition-colors opacity-0 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          aria-label="Phóng to sơ đồ"
        >
          <ZoomIn className="h-3.5 w-3.5" />
          Zoom
        </button>
      </div>

      {/* Full-screen zoom modal */}
      {zoomed && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={closeZoom}
        >
          <div
            className="relative max-w-[95vw] max-h-[90vh] overflow-auto rounded-2xl bg-slate-950 border border-slate-700 shadow-2xl p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeZoom}
              className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-slate-400 bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              aria-label="Đóng zoom"
            >
              <X className="h-3.5 w-3.5" />
              Đóng
            </button>
            <div
              className="flex justify-center items-start"
              style={{ minWidth: '400px' }}
              dangerouslySetInnerHTML={{ __html: svg }}
            />
            <div className="mt-3 text-center text-xs text-slate-600">Nhấp ra ngoài hoặc nút Đóng để thoát</div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Code Block ───────────────────────────────────────────────────────────────

function CodeBlock({ code, language, compact }: { code: string; language: string; compact: boolean }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await copyText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard permission may be disabled by an embedded browser. The code
      // remains selectable, which is the safe fallback.
    }
  };

  return (
    <div className={cn("relative group", compact ? "my-3" : "my-6")}>
      <div className="absolute inset-x-0 top-0 z-10 flex h-9 items-center justify-between rounded-t-xl bg-slate-950/75 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400 opacity-100 backdrop-blur-sm sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
        <span>{language || 'text'}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-slate-200 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          aria-label="Sao chép mã nguồn"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? 'Đã chép' : 'Sao chép'}
        </button>
      </div>
      <SyntaxHighlighter
        style={vscDarkPlus}
        language={language || 'text'}
        PreTag="div"
        customStyle={{ color: '#e2e8f0', backgroundColor: '#030712' }}
        className={cn(
          "rounded-xl overflow-x-auto w-full max-w-full !m-0 shadow-lg font-mono text-slate-200 scrollbar-thin",
          compact ? "!p-3 pt-11 text-[11px] leading-normal" : "!p-4 pt-12 text-sm"
        )}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MarkdownRenderer({
  content,
  className = '',
  variant = 'default',
}: MarkdownRendererProps) {
  const isChat = variant === 'chat' || variant === 'chat-user';
  const isUserChat = variant === 'chat-user';

  const normalizedContent = stripHtmlComments(
    normalizeMathDelimiters(content || '')
  );

  return (
    <div
      className={cn(
        isChat
          ? cn("w-full text-sm leading-relaxed", isUserChat ? "text-white" : "text-slate-700 dark:text-slate-300")
          : "prose prose-sm dark:prose-invert max-w-none",
        "[&_.katex-display]:my-4 [&_.katex-display]:overflow-x-auto [&_.katex-display]:overflow-y-hidden [&_.katex-display]:py-2",
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          // ── Code fence (block) ──────────────────────────────────────────
          // react-markdown v10 passes fenced code as <code className="language-xxx">
          // nested inside a <pre>. We intercept at the <pre> level.
          pre: ({ children }: React.HTMLAttributes<HTMLPreElement>) => {
            // Find the <code> child element
            const childArray = React.Children.toArray(children);
            const codeChild = childArray.find(
              (c): c is React.ReactElement<{ className?: string; children?: React.ReactNode }> =>
                React.isValidElement(c) && c.type === 'code'
            );

            if (!codeChild) {
              // Fallback: render as plain pre
              return <pre>{children}</pre>;
            }

            const className = (codeChild.props.className as string) ?? '';
            const match = /language-([\w+#-]+)/.exec(className);
            const lang = match ? match[1] : '';

            // Extract raw text — children is either a string or an array of strings
            const rawChildren = codeChild.props.children;
            const raw = (
              Array.isArray(rawChildren)
                ? rawChildren.join('')
                : String(rawChildren ?? '')
            ).replace(/\n$/, '');

            // Render mermaid diagrams with the dedicated component
            if (lang === 'mermaid') {
              return <MermaidBlock chart={raw} compact={isChat} />;
            }

            return <CodeBlock code={raw} language={lang} compact={isChat} />;
          },

          // ── Inline code ────────────────────────────────────────────────
          // In react-markdown v10 the <code> renderer is only called for
          // *inline* code (fenced blocks are handled by <pre> above).
          code: ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => (
            <code
              className={cn(
                "rounded px-1.5 py-0.5 text-sm font-mono font-medium",
                isUserChat
                  ? "bg-white/15 text-white"
                  : "bg-gray-100 text-red-500 dark:bg-gray-800/50 dark:text-red-400"
              )}
              {...props}
            >
              {children}
            </code>
          ),

          // ── Headings ───────────────────────────────────────────────────
          h1: ({ ...props }) => (
            <h1
              className={cn(
                isUserChat ? "font-bold text-white" : "font-bold text-slate-900 dark:text-slate-50",
                isChat
                  ? "text-base mt-3 mb-1.5 first:mt-0"
                  : "text-3xl mt-8 mb-4 first:mt-0"
              )}
              {...props}
            />
          ),
          h2: ({ ...props }) => (
            <h2
              className={cn(
                isUserChat ? "font-bold text-white" : "font-bold text-slate-850 dark:text-slate-100",
                isChat
                  ? "text-sm mt-3 mb-1.5 font-bold"
                  : "text-2xl mt-6 mb-3 border-b border-gray-100 dark:border-gray-800 pb-2"
              )}
              {...props}
            />
          ),
          h3: ({ ...props }) => (
            <h3
              className={cn(
                isUserChat ? "font-bold text-white" : "font-bold text-slate-800 dark:text-slate-100",
                isChat
                  ? "text-sm mt-2 mb-1"
                  : "text-xl mt-5 mb-2"
              )}
              {...props}
            />
          ),

          // ── Paragraph ─────────────────────────────────────────────────
          p: ({ ...props }) => (
            <p
              className={cn(
                "leading-relaxed",
                isChat
                  ? cn("mb-2 last:mb-0", isUserChat ? "text-white" : "text-slate-700 dark:text-slate-300")
                  : "mb-4 text-gray-600 dark:text-gray-300"
              )}
              {...props}
            />
          ),

          // ── Lists ──────────────────────────────────────────────────────
          ul: ({ ...props }) => (
            <ul
              className={cn(
                "list-disc list-outside",
                isChat
                  ? cn("mb-2 pl-4 space-y-1", isUserChat ? "text-white" : "text-slate-700 dark:text-slate-300")
                  : "mb-4 pl-5 space-y-1.5 text-gray-600 dark:text-gray-300"
              )}
              {...props}
            />
          ),
          ol: ({ ...props }) => (
            <ol
              className={cn(
                "list-decimal list-outside",
                isChat
                  ? cn("mb-2 pl-4 space-y-1", isUserChat ? "text-white" : "text-slate-700 dark:text-slate-300")
                  : "mb-4 pl-5 space-y-1.5 text-gray-600 dark:text-gray-300"
              )}
              {...props}
            />
          ),
          li: ({ ...props }) => (
            <li className={isChat ? "pl-0.5" : "pl-1"} {...props} />
          ),

          // ── Blockquote ────────────────────────────────────────────────
          blockquote: ({ ...props }) => (
            <blockquote
              className={cn(
                "border-l-4 border-blue-500/50 italic bg-blue-50/20 dark:bg-blue-900/10 rounded-r-md",
                isChat
                  ? "pl-3 py-0.5 my-3 text-slate-500 dark:text-slate-400"
                  : "pl-4 py-1 my-6 text-gray-500 dark:text-gray-400"
              )}
              {...props}
            />
          ),

          // ── Tables ────────────────────────────────────────────────────
          table: ({ ...props }) => (
            <div
              className={cn(
                "overflow-x-auto rounded-lg ring-1",
                isChat
                  ? "my-3 ring-slate-100 dark:ring-slate-800"
                  : "my-6 ring-gray-100 dark:ring-gray-800"
              )}
            >
              <table className="w-full border-collapse" {...props} />
            </div>
          ),
          thead: ({ ...props }) => (
            <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800" {...props} />
          ),
          th: ({ ...props }) => (
            <th className="px-4 py-2.5 text-left text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-200" {...props} />
          ),
          td: ({ ...props }) => (
            <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 border-t border-gray-50 dark:border-gray-800" {...props} />
          ),

          // ── Images ────────────────────────────────────────────────────
          img: ({ src, alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => (
            <div className={isChat ? "my-4 flex flex-col items-center" : "my-8 flex flex-col items-center"}>
              <img
                src={src}
                alt={alt}
                className={cn(
                  "max-w-full h-auto rounded-xl shadow-md transition-shadow duration-300 ring-1 ring-black/[0.05] bg-white text-slate-900 dark:text-slate-900",
                  isChat ? "hover:shadow-lg" : "hover:shadow-2xl rounded-2xl"
                )}
                loading="lazy"
                {...props}
              />
            </div>
          ),

          // ── Links ─────────────────────────────────────────────────────
          a: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
            if (href?.startsWith('mention://')) {
              return (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-xs font-semibold bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 cursor-default select-none">
                  @{children}
                </span>
              );
            }
            return (
              <a
                href={href}
                className={cn(
                  "font-medium underline underline-offset-4 transition-all",
                  isUserChat
                    ? "text-white decoration-white/50 hover:decoration-white"
                    : "text-blue-600 decoration-blue-500/30 hover:decoration-blue-500 dark:text-blue-400"
                )}
                target="_blank"
                rel="noopener noreferrer"
                {...props}
              >
                {children}
              </a>
            );
          },

          // ── Horizontal Rule ───────────────────────────────────────────
          hr: ({ ...props }) => (
            <hr
              className={isChat ? "my-4 border-slate-100 dark:border-slate-800" : "my-10 border-gray-100 dark:border-gray-800"}
              {...props}
            />
          ),
        }}
      >
        {normalizedContent || '*Không có nội dung*'}
      </ReactMarkdown>
    </div>
  );
}
