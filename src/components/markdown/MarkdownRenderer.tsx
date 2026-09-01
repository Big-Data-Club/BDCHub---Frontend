/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { PrismAsyncLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vs, vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { Check, Copy, WrapText, ZoomIn, X } from 'lucide-react';
import { useTheme } from 'next-themes';

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
function transformInlineCode(text: string, transform: (value: string) => string) {
  return text
    .split(/(`+[^`\n]*`+)/g)
    .map((part, index) => (index % 2 === 1 ? part : transform(part)))
    .join('');
}

/** Apply cleanup only to prose, never to fenced/inline code examples. */
function transformOutsideCode(markdown: string, transform: (value: string) => string) {
  const lines = markdown.replace(/\r\n?/g, '\n').split('\n');
  const output: string[] = [];
  let prose: string[] = [];
  let fenceChar = '';
  let fenceLength = 0;

  const flushProse = () => {
    if (!prose.length) return;
    output.push(transformInlineCode(prose.join('\n'), transform));
    prose = [];
  };

  for (const line of lines) {
    if (!fenceChar) {
      const opening = /^ {0,3}(`{3,}|~{3,})/.exec(line);
      if (opening) {
        flushProse();
        fenceChar = opening[1][0];
        fenceLength = opening[1].length;
        output.push(line);
      } else {
        prose.push(line);
      }
      continue;
    }

    output.push(line);
    const closing = new RegExp(`^ {0,3}${fenceChar}{${fenceLength},}\\s*$`);
    if (closing.test(line)) {
      fenceChar = '';
      fenceLength = 0;
    }
  }
  flushProse();
  return output.join('\n');
}

/** Normalize common AI-authored Markdown without mutating literal code. */
export function normalizeMarkdown(markdown: string) {
  return transformOutsideCode(markdown || '', (prose) => prose
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\\\[\s*([\s\S]*?)\s*\\\]/g, (_, math) => `\n\n$$\n${math}\n$$\n\n`)
    .replace(/\\\(([\s\S]*?)\\\)/g, (_, math) => `$${math}$`)
    .replace(/^(\s*)[•●▪]\s+/gm, '$1- ')
    .replace(/^(\s*)(\d+)\)\s+/gm, '$1$2. '));
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

function MermaidBlock({ chart, compact }: { chart: string; compact: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [zoomed, setZoomed] = useState(false);
  const idRef = useRef(`mermaid-${Math.random().toString(36).slice(2)}`);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  useEffect(() => {
    let cancelled = false;

    async function render() {
      try {
        const mermaid = (await import('mermaid')).default;

        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'strict',
          maxTextSize: 50000,
          maxEdges: 500,
          suppressErrorRendering: true,
          theme: 'base',
          themeVariables: isDark ? {
            darkMode: true,
            background: '#020617', primaryColor: '#1d4ed8', primaryTextColor: '#f8fafc',
            primaryBorderColor: '#60a5fa', lineColor: '#94a3b8', secondaryColor: '#172554',
            tertiaryColor: '#0f172a', textColor: '#e2e8f0', fontFamily: 'ui-sans-serif, system-ui, sans-serif',
          } : {
            darkMode: false,
            background: '#ffffff', primaryColor: '#dbeafe', primaryTextColor: '#0f172a',
            primaryBorderColor: '#3b82f6', lineColor: '#475569', secondaryColor: '#ede9fe',
            tertiaryColor: '#f8fafc', textColor: '#1e293b', fontFamily: 'ui-sans-serif, system-ui, sans-serif',
          },
        });

        const { svg: rendered } = await mermaid.render(idRef.current, chart.trim());
        if (!cancelled) setSvg(rendered);
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      }
    }

    render();
    return () => { cancelled = true; };
  }, [chart, isDark]);

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
      <div className={cn("relative group my-4 rounded-xl overflow-hidden bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 shadow-sm", compact ? "p-2" : "p-4")}>
        <div
          ref={containerRef}
          className="flex justify-center items-center overflow-x-auto [&_svg]:h-auto [&_svg]:max-w-none"
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

const LANGUAGE_ALIASES: Record<string, string> = {
  js: 'javascript', jsx: 'jsx', ts: 'typescript', tsx: 'tsx', py: 'python',
  sh: 'bash', shell: 'bash', zsh: 'bash', yml: 'yaml', md: 'markdown',
  plaintext: 'text', txt: 'text', 'c++': 'cpp', cs: 'csharp', dockerfile: 'docker',
};

const SUPPORTED_LANGUAGES = new Set([
  'bash', 'c', 'cpp', 'csharp', 'css', 'dart', 'diff', 'docker', 'go',
  'graphql', 'java', 'javascript', 'json', 'jsx', 'kotlin', 'latex', 'lua',
  'markdown', 'markup', 'php', 'python', 'r', 'ruby', 'rust', 'scala', 'sql',
  'swift', 'text', 'typescript', 'tsx', 'yaml',
]);

function normalizeLanguage(language: string) {
  const normalized = language.trim().toLowerCase();
  const aliased = LANGUAGE_ALIASES[normalized] ?? normalized;
  return SUPPORTED_LANGUAGES.has(aliased) ? aliased : 'text';
}

function CodeBlock({ code, language, compact }: { code: string; language: string; compact: boolean }) {
  const [copied, setCopied] = useState(false);
  const [wrapLongLines, setWrapLongLines] = useState(false);
  const { resolvedTheme } = useTheme();
  const normalizedLanguage = normalizeLanguage(language);
  const lineCount = code ? code.split('\n').length : 1;

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
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setWrapLongLines((current) => !current)}
            className={cn(
              "inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-slate-200 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400",
              wrapLongLines && "bg-white/10 text-white"
            )}
            aria-pressed={wrapLongLines}
            aria-label="Bật hoặc tắt xuống dòng mã nguồn"
            title="Xuống dòng mã dài"
          >
            <WrapText className="h-3.5 w-3.5" />
            Wrap
          </button>
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
      </div>
      <SyntaxHighlighter
        style={resolvedTheme === 'dark' ? vscDarkPlus : vs}
        language={normalizedLanguage}
        PreTag="div"
        showLineNumbers={!compact && lineCount >= 4}
        wrapLongLines={wrapLongLines}
        lineNumberStyle={{ minWidth: '2.5em', color: resolvedTheme === 'dark' ? '#64748b' : '#94a3b8' }}
        customStyle={{
          color: resolvedTheme === 'dark' ? '#e2e8f0' : '#1e293b',
          backgroundColor: resolvedTheme === 'dark' ? '#030712' : '#f8fafc',
          padding: compact ? '2.75rem 0.75rem 0.75rem' : '3rem 1rem 1rem',
        }}
        className={cn(
          "rounded-xl overflow-x-auto w-full max-w-full !m-0 border border-slate-200 dark:border-slate-800 shadow-sm font-mono scrollbar-thin",
          compact ? "text-[11px] leading-normal" : "text-sm"
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

  const normalizedContent = useMemo(() => normalizeMarkdown(content), [content]);

  return (
    <div
      className={cn(
        isChat
          ? cn("w-full text-sm leading-relaxed", isUserChat ? "text-white" : "text-slate-700 dark:text-slate-300")
          : "prose prose-sm dark:prose-invert max-w-none",
        "[&_.katex-display]:my-4 [&_.katex-display]:overflow-x-auto [&_.katex-display]:overflow-y-hidden [&_.katex-display]:py-2",
        "[&_li>p]:my-1 [&_li>ul]:mt-1 [&_li>ol]:mt-1 [&_li>ul]:mb-1 [&_li>ol]:mb-1",
        "[&_ul.contains-task-list]:list-none [&_ul.contains-task-list]:pl-1 [&_.task-list-item]:list-none",
        "[&_.footnotes]:mt-10 [&_.footnotes]:border-t [&_.footnotes]:border-slate-200 [&_.footnotes]:pt-4 dark:[&_.footnotes]:border-slate-700",
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[[remarkGfm, { singleTilde: false }], remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          // ── Code fence (block) + Inline code ──────────────────────────
          // react-markdown v10: when a custom `code` renderer is registered,
          // the children of the custom `pre` renderer will have type ===
          // [Function] (the custom renderer), not the string 'code'.
          // The reliable pattern is therefore to handle EVERYTHING in the
          // `code` renderer: if className contains 'language-*' it is a
          // fenced block; otherwise it is inline.
          // `pre` becomes a bare passthrough so it doesn't add an extra box.
          pre: ({ children }: React.HTMLAttributes<HTMLPreElement>) => <>{children}</>,

          code: ({ className, children, node, ...props }) => {
            const match = /language-([\w+#-]+)/.exec(className ?? '');
            const lang = match ? match[1].toLowerCase() : '';

            // Normalise children to a plain string for block-detection.
            const rawChildren = Array.isArray(children)
              ? (children as unknown[]).map(String).join('')
              : String(children ?? '');

            // react-markdown always appends a '\n' to fenced block children
            // (with or without a language tag) but never to inline code.
            // We use this to detect no-language fenced blocks.
            const spansMultipleSourceLines = Boolean(
              node?.position?.start?.line && node?.position?.end?.line
              && node.position.end.line > node.position.start.line
            );
            const isFencedBlock = Boolean(match) || rawChildren.endsWith('\n') || spansMultipleSourceLines;

            // Fenced code block — has a language- className OR trailing newline
            if (isFencedBlock) {
              const raw = rawChildren.replace(/\n$/, '');

              if (lang === 'mermaid') {
                return <MermaidBlock chart={raw} compact={isChat} />;
              }
              return <CodeBlock code={raw} language={lang} compact={isChat} />;
            }

            // Inline code
            return (
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
            );
          },

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
          h4: ({ ...props }) => (
            <h4
              className={cn(
                "font-bold",
                isUserChat ? "text-white" : "text-slate-800 dark:text-slate-100",
                isChat ? "text-sm mt-2 mb-1" : "text-lg mt-5 mb-2"
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
          ul: ({ className, ...props }) => (
            <ul
              className={cn(
                "list-disc list-outside",
                isChat
                  ? cn("mb-2 pl-4 space-y-1", isUserChat ? "text-white" : "text-slate-700 dark:text-slate-300")
                  : "mb-4 pl-6 space-y-1.5 text-gray-600 dark:text-gray-300",
                className
              )}
              {...props}
            />
          ),
          ol: ({ className, ...props }) => (
            <ol
              className={cn(
                "list-decimal list-outside",
                isChat
                  ? cn("mb-2 pl-4 space-y-1", isUserChat ? "text-white" : "text-slate-700 dark:text-slate-300")
                  : "mb-4 pl-6 space-y-1.5 text-gray-600 dark:text-gray-300",
                className
              )}
              {...props}
            />
          ),
          li: ({ className, ...props }) => (
            <li className={cn("marker:font-semibold marker:text-blue-500 dark:marker:text-cyan-400", isChat ? "pl-0.5" : "pl-1", className)} {...props} />
          ),
          input: ({ type, ...props }) => type === 'checkbox' ? (
            <input
              type="checkbox"
              className="mr-2 h-4 w-4 rounded border-slate-300 accent-blue-600 align-[-2px]"
              {...props}
            />
          ) : <input type={type} {...props} />,

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
                "max-w-full overflow-x-auto rounded-xl border",
                isChat
                  ? "my-3 border-slate-200 dark:border-slate-800"
                  : "my-6 border-slate-200 dark:border-slate-700"
              )}
            >
              <table className="m-0 w-full min-w-[36rem] border-collapse" {...props} />
            </div>
          ),
          thead: ({ ...props }) => (
            <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800" {...props} />
          ),
          th: ({ ...props }) => (
            <th className="px-4 py-2.5 text-left text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-200" {...props} />
          ),
          td: ({ ...props }) => (
            <td className="px-4 py-2.5 text-sm align-top text-gray-600 dark:text-gray-300 border-t border-gray-100 dark:border-gray-800" {...props} />
          ),
          tr: ({ className, ...props }) => (
            <tr className={cn("even:bg-slate-50/60 dark:even:bg-slate-900/30", className)} {...props} />
          ),

          // ── Images ────────────────────────────────────────────────────
          img: ({ src, alt, title, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => (
            <img
              src={src}
              alt={alt}
              title={title ?? alt}
              className={cn(
                "mx-auto block max-w-full h-auto rounded-xl shadow-md transition-shadow duration-300 ring-1 ring-black/[0.05] bg-white text-slate-900 dark:text-slate-900",
                isChat ? "my-4 hover:shadow-lg" : "my-8 hover:shadow-2xl rounded-2xl"
              )}
              loading="lazy"
              {...props}
            />
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
            const opensNewWindow = /^https?:\/\//i.test(href ?? '');
            return (
              <a
                href={href}
                className={cn(
                  "font-medium underline underline-offset-4 transition-all",
                  isUserChat
                    ? "text-white decoration-white/50 hover:decoration-white"
                    : "text-blue-600 decoration-blue-500/30 hover:decoration-blue-500 dark:text-blue-400"
                )}
                target={opensNewWindow ? "_blank" : undefined}
                rel={opensNewWindow ? "noopener noreferrer" : undefined}
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
