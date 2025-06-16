import ReactMarkdown from 'react-markdown'
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

import remarkGfm from 'remark-gfm'
import { cn, copyToClipboard } from '../../lib/utils'
import { Copy, Check } from 'lucide-react'
import { useState } from 'react'

interface MarkdownRendererProps {
  content: string
  className?: string
}

function CodeBlock({ children, className, ...props }: any) {
  const [copied, setCopied] = useState(false)
  const match = /language-(\w+)/.exec(className || '')
  const language = match ? match[1] : ''
  const code = String(children).replace(/\n$/, '')

  const handleCopy = async () => {
    try {
      await copyToClipboard(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy code:', error)
    }
  }

return (
    <div className="relative group my-4">
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1 px-2">
        <span>{language || 'code'}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-1 rounded hover:bg-background transition-colors opacity-0 group-hover:opacity-100"
        >
          {copied ? (
            <>
              <Check size={12} />
              Copied!
            </>
          ) : (
            <>
              <Copy size={12} />
              Copy
            </>
          )}
        </button>
      </div>

      <SyntaxHighlighter
        language={language}
        style={oneDark}
        PreTag="div"
        customStyle={{
          borderRadius: '0.5rem',
          fontSize: '0.875rem',
          overflowX: 'auto'
        }}
        {...props}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  )
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div className={cn('prose prose-sm dark:prose-invert max-w-none text-theme-chat-assistant', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Custom code block styling with copy button
          code: ({ node, inline, className, children, ...props }: any) => {
            return !inline ? (
              <CodeBlock className={className} {...props}>
                {children}
              </CodeBlock>
            ) : (
              <code className="bg-theme-code px-1.5 py-0.5 rounded text-sm text-theme-chat-assistant" {...props}>
                {children}
              </code>
            )
          },
          // Ensure all paragraph text uses theme color
          p: ({ children, ...props }) => (
            <p className="text-theme-chat-assistant" {...props}>
              {children}
            </p>
          ),
          // Ensure headings use theme color
          h1: ({ children, ...props }) => (
            <h1 className="text-theme-chat-assistant" {...props}>
              {children}
            </h1>
          ),
          h2: ({ children, ...props }) => (
            <h2 className="text-theme-chat-assistant" {...props}>
              {children}
            </h2>
          ),
          h3: ({ children, ...props }) => (
            <h3 className="text-theme-chat-assistant" {...props}>
              {children}
            </h3>
          ),
          h4: ({ children, ...props }) => (
            <h4 className="text-theme-chat-assistant" {...props}>
              {children}
            </h4>
          ),
          h5: ({ children, ...props }) => (
            <h5 className="text-theme-chat-assistant" {...props}>
              {children}
            </h5>
          ),
          h6: ({ children, ...props }) => (
            <h6 className="text-theme-chat-assistant" {...props}>
              {children}
            </h6>
          ),
          // Ensure list items use theme color
          li: ({ children, ...props }) => (
            <li className="text-theme-chat-assistant" {...props}>
              {children}
            </li>
          ),
          // Custom table styling
          table: ({ children, ...props }) => (
            <div className="overflow-x-auto">
              <table className="border-collapse border border-theme w-full" {...props}>
                {children}
              </table>
            </div>
          ),
          th: ({ children, ...props }) => (
            <th className="border border-theme px-3 py-2 bg-theme-surface font-medium text-theme-chat-assistant" {...props}>
              {children}
            </th>
          ),
          td: ({ children, ...props }) => (
            <td className="border border-theme px-3 py-2 text-theme-chat-assistant" {...props}>
              {children}
            </td>
          ),
          // Custom link styling
          a: ({ children, ...props }) => (
            <a className="text-theme-link hover:underline" target="_blank" rel="noopener noreferrer" {...props}>
              {children}
            </a>
          ),
          // Custom blockquote styling
          blockquote: ({ children, ...props }) => (
            <blockquote className="border-l-4 border-theme pl-4 italic text-theme-chat-assistant" {...props}>
              {children}
            </blockquote>
          ),
          // Ensure strong text uses theme color
          strong: ({ children, ...props }) => (
            <strong className="text-theme-chat-assistant font-bold" {...props}>
              {children}
            </strong>
          ),
          // Ensure emphasis text uses theme color
          em: ({ children, ...props }) => (
            <em className="text-theme-chat-assistant italic" {...props}>
              {children}
            </em>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
} 