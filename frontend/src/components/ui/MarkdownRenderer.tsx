import ReactMarkdown from 'react-markdown'
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
    <div className="relative group">
              <pre className="bg-theme-code rounded-lg p-4 overflow-x-auto">
          <div className="flex items-center justify-between mb-2 text-xs text-theme-secondary">
          <span>{language || 'code'}</span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-1 rounded hover:bg-theme-dropdown-hover transition-colors opacity-0 group-hover:opacity-100"
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
        <code className={className} {...props}>
          {children}
        </code>
      </pre>
    </div>
  )
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div className={cn('prose prose-sm dark:prose-invert max-w-none', className)}>
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
              <code className="bg-theme-code px-1.5 py-0.5 rounded text-sm" {...props}>
                {children}
              </code>
            )
          },
          // Custom table styling
          table: ({ children, ...props }) => (
            <div className="overflow-x-auto">
              <table className="border-collapse border border-theme w-full" {...props}>
                {children}
              </table>
            </div>
          ),
          th: ({ children, ...props }) => (
            <th className="border border-theme px-3 py-2 bg-theme-surface font-medium text-theme-primary" {...props}>
              {children}
            </th>
          ),
          td: ({ children, ...props }) => (
            <td className="border border-theme px-3 py-2 text-theme-primary" {...props}>
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
            <blockquote className="border-l-4 border-theme pl-4 italic" {...props}>
              {children}
            </blockquote>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
} 