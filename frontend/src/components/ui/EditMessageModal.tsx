import React, { useState, useEffect } from 'react'
import { Modal } from './Modal'
import { Button } from './Button'
import { Edit3, RotateCcw, Settings } from 'lucide-react'
import { ModelSelectorModal } from '../settings/ModelSelectorModal'

interface EditMessageModalProps {
  isOpen: boolean
  onClose: () => void
  originalMessage: string
  currentModel: string
  onSave: (newMessage: string, newModel: string) => void
  onRegenerate: (newMessage: string, newModel: string) => void
}

export function EditMessageModal({ 
  isOpen, 
  onClose, 
  originalMessage, 
  currentModel,
  onSave,
  onRegenerate
}: EditMessageModalProps) {
  const [editedMessage, setEditedMessage] = useState(originalMessage)
  const [selectedModel, setSelectedModel] = useState(currentModel)
  const [showModelSelector, setShowModelSelector] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setEditedMessage(originalMessage)
      setSelectedModel(currentModel)
      setHasChanges(false)
    }
  }, [isOpen, originalMessage, currentModel])

  // Track changes
  useEffect(() => {
    setHasChanges(editedMessage !== originalMessage || selectedModel !== currentModel)
  }, [editedMessage, selectedModel, originalMessage, currentModel])

  const handleSave = () => {
    if (hasChanges) {
      onSave(editedMessage.trim(), selectedModel)
    }
    onClose()
  }

  const handleRegenerate = () => {
    if (editedMessage.trim()) {
      onRegenerate(editedMessage.trim(), selectedModel)
    }
    onClose()
  }

  const handleModelSelect = (modelId: string) => {
    setSelectedModel(modelId)
    setShowModelSelector(false)
  }

  // Get model display name
  const getModelDisplayName = (modelId: string) => {
    // Extract model name from ID for display
    const parts = modelId.split('-')
    if (parts.includes('gpt')) return 'GPT-4o'
    if (parts.includes('claude')) return 'Claude 3.5 Sonnet'
    if (parts.includes('gemini')) return 'Gemini 2.0 Flash'
    if (parts.includes('deepseek')) return 'DeepSeek V3'
    if (parts.includes('llama')) return 'Llama 3.3 70B'
    if (parts.includes('grok')) return 'Grok Beta'
    if (parts.includes('qwen')) return 'Qwen 2.5'
    return modelId
  }

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Edit Message" size="lg">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <div className="w-12 h-12 bg-theme-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Edit3 className="w-6 h-6 text-theme-accent" />
            </div>
            <h3 className="text-lg font-semibold text-theme-primary mb-2">Edit your message</h3>
            <p className="text-sm text-theme-secondary">
              Modify your message and optionally change the AI model to regenerate the response
            </p>
          </div>

          {/* Message Editor */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-theme-primary">
              Your message
            </label>
            <textarea
              value={editedMessage}
              onChange={(e) => setEditedMessage(e.target.value)}
              className="w-full h-32 p-3 bg-theme-input border border-theme-input rounded-lg text-theme-input placeholder-theme-secondary resize-none focus:ring-2 focus:ring-theme-accent focus:border-transparent"
              placeholder="Type your message here..."
            />
          </div>

          {/* Model Selector */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-theme-primary">
              AI Model
            </label>
            <button
              onClick={() => setShowModelSelector(true)}
              className="w-full flex items-center justify-between p-3 bg-theme-input border border-theme-input rounded-lg text-theme-input hover:bg-theme-surface transition-colors"
            >
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-theme-secondary" />
                <span>{getModelDisplayName(selectedModel)}</span>
              </div>
              <div className="text-xs text-theme-secondary">
                Click to change
              </div>
            </button>
          </div>

          {/* Changes indicator */}
          {hasChanges && (
            <div className="text-xs text-theme-accent bg-theme-accent/10 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-theme-accent" />
                <span>You have unsaved changes</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button variant="ghost" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              variant="outline" 
              onClick={handleSave}
              disabled={!editedMessage.trim()}
              className="flex-1"
            >
              Save Changes
            </Button>
            <Button 
              variant="default" 
              onClick={handleRegenerate}
              disabled={!editedMessage.trim()}
              className="flex-1"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Regenerate
            </Button>
          </div>

          {/* Help text */}
          <div className="text-xs text-theme-secondary bg-theme-surface p-3 rounded-lg">
            <p className="font-medium mb-1">What happens when you:</p>
            <ul className="space-y-1">
              <li>• <strong>Save Changes:</strong> Updates your message without regenerating the AI response</li>
              <li>• <strong>Regenerate:</strong> Updates your message and asks the AI to generate a new response</li>
            </ul>
          </div>
        </div>
      </Modal>

      {/* Model Selector Modal */}
      <ModelSelectorModal
        isOpen={showModelSelector}
        onClose={() => setShowModelSelector(false)}
        selectedModel={selectedModel}
        onModelSelect={handleModelSelect}
      />
    </>
  )
} 