"use client";

import ReactMarkdown from "react-markdown";

interface InterpretationMarkdownProps {
  text: string;
  className?: string;
}

/**
 * Renders LLM interpretation: supports **bold**, *italic*, and line breaks.
 * Receipt-style typography (mono, narrow column).
 */
export function InterpretationMarkdown({
  text,
  className = "",
}: InterpretationMarkdownProps) {
  return (
    <div className={`text-left ${className}`}>
      <ReactMarkdown
        components={{
          p: ({ children }) => (
            <p className="mb-2 whitespace-pre-wrap last:mb-0">{children}</p>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-ink">{children}</strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,
          ul: ({ children }) => (
            <ul className="mb-2 list-inside list-disc space-y-1">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-2 list-inside list-decimal space-y-1">{children}</ol>
          ),
          li: ({ children }) => <li className="whitespace-pre-wrap">{children}</li>,
        }}
      >
        {text.trim()}
      </ReactMarkdown>
    </div>
  );
}
