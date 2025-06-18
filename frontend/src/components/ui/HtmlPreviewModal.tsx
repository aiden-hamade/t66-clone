import { useState, useEffect } from 'react'
import { X, Play, Code, Eye, RotateCcw } from 'lucide-react'
import { Button } from './Button'

interface HtmlPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  initialCode: string
}

export function HtmlPreviewModal({ isOpen, onClose, initialCode }: HtmlPreviewModalProps) {
  const [code, setCode] = useState(initialCode)
  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'split'>('split')
  const [previewKey, setPreviewKey] = useState(0)

  useEffect(() => {
    setCode(initialCode)
  }, [initialCode])

  useEffect(() => {
    const onEscape = (e: KeyboardEvent) => e.key === 'Escape' && onClose()

    if (isOpen) {
      document.addEventListener('keydown', onEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', onEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  const handleReset = () => {
    setCode(initialCode)
    setPreviewKey(prev => prev + 1)
  }

  const handleRunCode = () => {
    setPreviewKey(prev => prev + 1)
  }

  const createPreviewContent = () => {
    // Create a complete HTML document if the code doesn't already have html/body tags
    const hasHtmlTag = code.toLowerCase().includes('<html')
    const hasBodyTag = code.toLowerCase().includes('<body')
    
    if (hasHtmlTag) {
      return code
    }
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HTML Preview</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            margin: 20px; 
            line-height: 1.6;
        }
    </style>
</head>
<body>
${hasBodyTag ? code : code}
</body>
</html>`
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-theme-modal/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal panel */}
      <div className="relative bg-theme-modal border border-theme-modal rounded-lg shadow-xl w-full max-w-7xl mx-4 h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-theme-modal">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-theme-primary">HTML Preview</h2>
            <div className="flex items-center gap-2">
              <Button
                variant={activeTab === 'editor' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('editor')}
                className="flex items-center gap-2"
              >
                <Code size={14} />
                Editor
              </Button>
              <Button
                variant={activeTab === 'preview' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('preview')}
                className="flex items-center gap-2"
              >
                <Eye size={14} />
                Preview
              </Button>
              <Button
                variant={activeTab === 'split' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('split')}
                className="flex items-center gap-2"
              >
                <Code size={14} />
                <Eye size={14} />
                Split
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="flex items-center gap-2"
            >
              <RotateCcw size={14} />
              Reset
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleRunCode}
              className="flex items-center gap-2"
            >
              <Play size={14} />
              Run
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X size={16} />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Editor */}
          {(activeTab === 'editor' || activeTab === 'split') && (
            <div className={`${activeTab === 'split' ? 'w-1/2' : 'w-full'} flex flex-col border-r border-theme-modal`}>
              <div className="bg-theme-surface px-3 py-2 border-b border-theme-modal">
                <span className="text-xs font-medium text-theme-secondary">HTML Editor</span>
              </div>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="flex-1 p-4 bg-theme-input text-theme-input font-mono text-sm border-none outline-none resize-none"
                style={{
                  fontFamily: 'Monaco, Menlo, "Ubuntu Mono", Consolas, source-code-pro, monospace',
                  tabSize: 2
                }}
                placeholder="Enter your HTML code here..."
                spellCheck={false}
                onKeyDown={(e) => {
                  if (e.key === 'Tab') {
                    e.preventDefault()
                    const start = e.currentTarget.selectionStart
                    const end = e.currentTarget.selectionEnd
                    const newValue = code.substring(0, start) + '  ' + code.substring(end)
                    setCode(newValue)
                    setTimeout(() => {
                      e.currentTarget.selectionStart = e.currentTarget.selectionEnd = start + 2
                    }, 0)
                  }
                }}
              />
            </div>
          )}

          {/* Preview */}
          {(activeTab === 'preview' || activeTab === 'split') && (
            <div className={`${activeTab === 'split' ? 'w-1/2' : 'w-full'} flex flex-col`}>
              <div className="bg-theme-surface px-3 py-2 border-b border-theme-modal">
                <span className="text-xs font-medium text-theme-secondary">Live Preview</span>
              </div>
              <div className="flex-1 bg-white">
                <iframe
                  key={previewKey}
                  srcDoc={createPreviewContent()}
                  className="w-full h-full border-none"
                  sandbox="allow-scripts allow-same-origin allow-forms"
                  title="HTML Preview"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-theme-modal bg-theme-surface">
          <p className="text-xs text-theme-secondary">
            💡 Tip: Edit the HTML code on the left and click "Run" to see your changes in the preview. 
            The preview runs in a sandboxed environment for security.
          </p>
        </div>
      </div>
    </div>
  )
} 
