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

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({
  content,
  className = '',
}: MarkdownRendererProps) {
  return (
    <div className={`prose prose-sm dark:prose-invert max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          // Custom Heading Components
          h1: ({ ...props }) => (
            <h1 className="text-3xl font-bold mt-8 mb-4 first:mt-0 text-gray-900 dark:text-white" {...props} />
          ),
          h2: ({ ...props }) => (
            <h2 className="text-2xl font-bold mt-6 mb-3 text-gray-800 dark:text-gray-100 border-b border-gray-100 dark:border-gray-800 pb-2" {...props} />
          ),
          h3: ({ ...props }) => (
            <h3 className="text-xl font-bold mt-5 mb-2 text-gray-800 dark:text-gray-100" {...props} />
          ),

          // Paragraph Styling
          p: ({ ...props }) => (
            <p className="leading-relaxed mb-4 text-gray-600 dark:text-gray-300" {...props} />
          ),

          // Lists
          ul: ({ ...props }) => (
            <ul className="list-disc list-outside mb-4 pl-5 space-y-1.5 text-gray-600 dark:text-gray-300" {...props} />
          ),
          ol: ({ ...props }) => (
            <ol className="list-decimal list-outside mb-4 pl-5 space-y-1.5 text-gray-600 dark:text-gray-300" {...props} />
          ),
          li: ({ ...props }) => (
            <li className="pl-1" {...props} />
          ),

          // Code Blocks and Inline Code
          code: ({ inline, className, children, ...props }: any) => {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <div className="relative group my-6">
                <div className="absolute top-0 right-0 px-3 py-1 text-[10px] uppercase font-bold text-gray-500 bg-gray-800/10 dark:bg-gray-200/10 rounded-bl-lg">
                  {match[1]}
                </div>
                <SyntaxHighlighter
                  style={vscDarkPlus}
                  language={match[1]}
                  PreTag="div"
                  className="rounded-xl overflow-hidden !bg-gray-950 !m-0 !p-4 shadow-lg text-sm"
                  {...props}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              </div>
            ) : (
              <code className="bg-gray-100 dark:bg-gray-800/50 px-1.5 py-0.5 rounded text-sm font-mono text-red-500 dark:text-red-400 font-medium" {...props}>
                {children}
              </code>
            );
          },

          // Blockquotes
          blockquote: ({ ...props }) => (
            <blockquote className="border-l-4 border-blue-500/50 pl-4 py-1 italic text-gray-500 dark:text-gray-400 bg-blue-50/20 dark:bg-blue-900/10 my-6 rounded-r-md" {...props} />
          ),

          // Tables
          table: ({ ...props }) => (
            <div className="overflow-x-auto my-6 rounded-lg ring-1 ring-gray-100 dark:ring-gray-800">
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
            <div className="my-8 flex flex-col items-center">
              <img
                src={src}
                alt={alt}
                className="max-w-full h-auto rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300 ring-1 ring-black/[0.05]"
                loading="lazy"
                {...props}
              />
              {alt && <span className="text-[11px] text-gray-400 mt-2 italic">{alt}</span>}
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
            <hr className="my-10 border-gray-100 dark:border-gray-800" {...props} />
          ),
        }}
      >
        {content || '*Không có nội dung*'}
      </ReactMarkdown>
    </div>
  );
}
