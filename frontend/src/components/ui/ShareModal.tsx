import { useState } from 'react'
import { Modal } from './Modal'
import { Button } from './Button'
import { Copy, Check, Share2, Link } from 'lucide-react'

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  shareUrl: string
  title?: string
  description?: string
}

export function ShareModal({ isOpen, onClose, shareUrl, title = "Share Chat", description }: ShareModalProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="w-12 h-12 bg-theme-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Share2 className="w-6 h-6 text-theme-accent" />
          </div>
          <h3 className="text-lg font-semibold text-theme-primary mb-2">Share this chat</h3>
          {description && (
            <p className="text-sm text-theme-secondary">{description}</p>
          )}
        </div>

        {/* Share URL */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-theme-primary">
            Share link
          </label>
          <div className="flex items-center gap-2 p-3 bg-theme-surface border border-theme-input rounded-lg">
            <Link className="w-4 h-4 text-theme-secondary flex-shrink-0" />
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="flex-1 bg-transparent text-theme-secondary text-sm outline-none select-all"
            />
          </div>
        </div>

        {/* Copy Button */}
        <Button
          onClick={handleCopy}
          className="w-full"
          variant="default"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-2" />
              Copy link
            </>
          )}
        </Button>

        {/* Info */}
        <div className="text-xs text-theme-secondary bg-theme-surface p-3 rounded-lg">
          <div className="flex items-start gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
            </div>
            <div>
              <p className="font-medium mb-1">Anyone with this link can view the chat</p>
              <p>The shared chat is read-only and doesn't include your personal information.</p>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <div className="flex justify-end pt-2">
          <Button variant="ghost" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </Modal>
  )
} 
