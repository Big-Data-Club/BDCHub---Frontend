/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { Check, Copy } from 'lucide-react';

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

export default function MarkdownRenderer({
  content,
  className = '',
  variant = 'default',
}: MarkdownRendererProps) {
  const isChat = variant === 'chat' || variant === 'chat-user';
  const isUserChat = variant === 'chat-user';
  const normalizedContent = normalizeMathDelimiters(content || '');

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
          // Custom Heading Components
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

          // Paragraph Styling
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

          // Lists
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

          pre: ({ children }: any) => {
            const childrenArray = React.Children.toArray(children);
            const codeEl = childrenArray.find(
              (child: any) => 
                child && typeof child === 'object' && (
                  child.type === 'code' ||
                  child.props?.className?.startsWith('language-') ||
                  (typeof child.type === 'function' && child.type.name === 'code') ||
                  (child.props && 'children' in child.props)
                )
            ) as React.ReactElement<any> | undefined 
            || (childrenArray[0] as React.ReactElement<any> | undefined);

            const className = codeEl?.props?.className ?? '';
            const match = /language-([\w+-]+)/.exec(className);
            const lang = match ? match[1] : '';
            const raw = String(codeEl?.props?.children ?? '').replace(/\n$/, '');

            return <CodeBlock code={raw} language={lang} compact={isChat} />;
          },

          // Inline Code - `code` is now exclusively for inline spans in v10
          code: ({ children, ...props }: any) => (
            <code
              className={cn("rounded px-1.5 py-0.5 text-sm font-mono font-medium", isUserChat ? "bg-white/15 text-white" : "bg-gray-100 text-red-500 dark:bg-gray-800/50 dark:text-red-400")}
              {...props}
            >
              {children}
            </code>
          ),

          // Blockquotes
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

          // Tables
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

          // Images
          img: ({ src, alt, ...props }: any) => (
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

          // Links - with special handling for @mention:// protocol
          a: ({ href, children, ...props }: any) => {
            // Render @mentions as styled badges
            if (href?.startsWith('mention://')) {
              return (
                <span
                  className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-xs font-semibold bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 cursor-default select-none"
                >
                  @{children}
                </span>
              );
            }
            return (
              <a
                href={href}
                className={cn("font-medium underline underline-offset-4 transition-all", isUserChat ? "text-white decoration-white/50 hover:decoration-white" : "text-blue-600 decoration-blue-500/30 hover:decoration-blue-500 dark:text-blue-400")}
                target="_blank"
                rel="noopener noreferrer"
                {...props}
              >
                {children}
              </a>
            );
          },

          // Horizontal Lines
          hr: ({ ...props }) => (
            <hr className={isChat ? "my-4 border-slate-100 dark:border-slate-800" : "my-10 border-gray-100 dark:border-gray-800"} {...props} />
          ),
        }}
      >
        {normalizedContent || '*Không có nội dung*'}
      </ReactMarkdown>
    </div>
  );
}
