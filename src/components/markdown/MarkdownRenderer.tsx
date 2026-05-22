/* eslint-disable @next/next/no-img-element */
"use client";

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

import { cn } from "@/lib/utils";

interface MarkdownRendererProps {
  content: string;
  className?: string;
  variant?: 'default' | 'chat';
}

export default function MarkdownRenderer({
  content,
  className = '',
  variant = 'default',
}: MarkdownRendererProps) {
  const isChat = variant === 'chat';

  return (
    <div
      className={cn(
        isChat
          ? "w-full text-slate-700 dark:text-slate-300 text-sm leading-relaxed"
          : "prose prose-sm dark:prose-invert max-w-none",
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
                "font-bold text-slate-900 dark:text-slate-50",
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
                "font-bold text-slate-850 dark:text-slate-100",
                isChat
                  ? "text-sm mt-2.5 mb-1 pb-0.5 border-b border-slate-100 dark:border-slate-800/50"
                  : "text-2xl mt-6 mb-3 border-b border-gray-100 dark:border-gray-800 pb-2"
              )}
              {...props}
            />
          ),
          h3: ({ ...props }) => (
            <h3
              className={cn(
                "font-bold text-slate-800 dark:text-slate-100",
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
                  ? "mb-2 last:mb-0 text-slate-700 dark:text-slate-300"
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
                  ? "mb-2 pl-4 space-y-1 text-slate-700 dark:text-slate-300"
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
                  ? "mb-2 pl-4 space-y-1 text-slate-700 dark:text-slate-300"
                  : "mb-4 pl-5 space-y-1.5 text-gray-600 dark:text-gray-300"
              )}
              {...props}
            />
          ),
          li: ({ ...props }) => (
            <li className={isChat ? "pl-0.5" : "pl-1"} {...props} />
          ),

          // Code Blocks — handled at the `pre` level (react-markdown v10 removed
          // the `inline` prop from `code`; `pre` only wraps fenced blocks, never
          // inline code, so this is the correct v10 detection pattern).
          pre: ({ children }: any) => {
            // Extract the inner <code> element rendered by react-markdown
            const codeEl = React.Children.toArray(children).find(
              (child: any) => child?.type === 'code' || child?.props?.className?.startsWith('language-')
            ) as React.ReactElement<any> | undefined;

            const className = codeEl?.props?.className ?? '';
            const match = /language-(\w+)/.exec(className);
            const lang = match ? match[1] : '';
            const raw = String(codeEl?.props?.children ?? '').replace(/\n$/, '');

            return (
              <div className={cn("relative group", isChat ? "my-3" : "my-6")}>
                {lang && (
                  <div className="absolute top-0 right-0 px-2 py-0.5 text-[9px] uppercase font-bold text-gray-500 bg-gray-800/10 dark:bg-gray-200/10 rounded-bl-lg z-10">
                    {lang}
                  </div>
                )}
                <SyntaxHighlighter
                  style={vscDarkPlus}
                  language={lang || 'text'}
                  PreTag="div"
                  className={cn(
                    "rounded-xl overflow-hidden !bg-gray-950 !m-0 shadow-lg font-mono",
                    isChat ? "!p-3 text-[11px] leading-normal" : "!p-4 text-sm"
                  )}
                >
                  {raw}
                </SyntaxHighlighter>
              </div>
            );
          },

          // Inline Code — `code` is now exclusively for inline spans in v10
          code: ({ children, ...props }: any) => (
            <code
              className="bg-gray-100 dark:bg-gray-800/50 px-1.5 py-0.5 rounded text-sm font-mono text-red-500 dark:text-red-400 font-medium"
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
                  "max-w-full h-auto rounded-xl shadow-md transition-shadow duration-300 ring-1 ring-black/[0.05]",
                  isChat ? "hover:shadow-lg" : "hover:shadow-2xl rounded-2xl"
                )}
                loading="lazy"
                {...props}
              />
              {alt && <span className="text-[10px] text-gray-400 mt-1.5 italic">{alt}</span>}
            </div>
          ),

          // Links
          a: ({ href, children, ...props }: any) => (
            <a
              href={href}
              className="text-blue-600 dark:text-blue-400 font-medium underline underline-offset-4 decoration-blue-500/30 hover:decoration-blue-500 transition-all"
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            >
              {children}
            </a>
          ),

          // Horizontal Lines
          hr: ({ ...props }) => (
            <hr className={isChat ? "my-4 border-slate-100 dark:border-slate-800" : "my-10 border-gray-100 dark:border-gray-800"} {...props} />
          ),
        }}
      >
        {content || '*Không có nội dung*'}
      </ReactMarkdown>
    </div>
  );
}
