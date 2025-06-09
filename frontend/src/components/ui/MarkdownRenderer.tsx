import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '../../lib/utils'

interface MarkdownRendererProps {
  content: string
  className?: string
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div className={cn('prose prose-sm dark:prose-invert max-w-none', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Custom code block styling
          code: ({ node, inline, className, children, ...props }: any) => {
            const match = /language-(\w+)/.exec(className || '')
            return !inline ? (
              <pre className="bg-muted rounded-lg p-4 overflow-x-auto">
                <code className={className} {...props}>
                  {children}
                </code>
              </pre>
            ) : (
              <code className="bg-muted px-1.5 py-0.5 rounded text-sm" {...props}>
                {children}
              </code>
            )
          },
          // Custom table styling
          table: ({ children, ...props }) => (
            <div className="overflow-x-auto">
              <table className="border-collapse border border-border w-full" {...props}>
                {children}
              </table>
            </div>
          ),
          th: ({ children, ...props }) => (
            <th className="border border-border px-3 py-2 bg-muted font-medium" {...props}>
              {children}
            </th>
          ),
          td: ({ children, ...props }) => (
            <td className="border border-border px-3 py-2" {...props}>
              {children}
            </td>
          ),
          // Custom link styling
          a: ({ children, ...props }) => (
            <a className="text-primary hover:underline" target="_blank" rel="noopener noreferrer" {...props}>
              {children}
            </a>
          ),
          // Custom blockquote styling
          blockquote: ({ children, ...props }) => (
            <blockquote className="border-l-4 border-primary pl-4 italic" {...props}>
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