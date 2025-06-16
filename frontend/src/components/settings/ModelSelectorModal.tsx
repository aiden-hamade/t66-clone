import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Check, Zap, Brain, Star } from 'lucide-react'
import { useState } from 'react'

interface Model {
  id: string
  name: string
  provider: string
  description: string
  contextLength: number
  pricing?: {
    input: number
    output: number
  }
  capabilities: string[]
  popular?: boolean
  recommended?: boolean
}

interface ModelSelectorModalProps {
  isOpen: boolean
  onClose: () => void
  selectedModel: string
  onModelSelect: (modelId: string) => void
}

const MODELS: Model[] = [
  // OpenAI Models
  {
    id: 'openai/gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    description: 'Most advanced GPT-4 model with vision capabilities',
    contextLength: 128000,
    pricing: { input: 0.005, output: 0.015 },
    capabilities: ['text', 'vision', 'function_calling'],
    recommended: true,
  },
  {
    id: 'openai/gpt-4.1-nano',
    name: 'GPT-4.1 Nano',
    provider: 'OpenAI',
    description: 'Compact and efficient GPT-4.1 model',
    contextLength: 128000,
    pricing: { input: 0.001, output: 0.003 },
    capabilities: ['text', 'function_calling'],
    popular: true,
  },
]

export function ModelSelectorModal({ isOpen, onClose, selectedModel, onModelSelect }: ModelSelectorModalProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProvider, setSelectedProvider] = useState<string>('all')

  const providers = ['all', ...Array.from(new Set(MODELS.map(m => m.provider)))]
  
  const filteredModels = MODELS.filter(model => {
    const matchesSearch = model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         model.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesProvider = selectedProvider === 'all' || model.provider === selectedProvider
    return matchesSearch && matchesProvider
  })

  const handleModelSelect = (modelId: string) => {
    onModelSelect(modelId)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Select Model" size="xl">
      <div className="p-6">
        {/* Search and Filter */}
        <div className="flex gap-4 mb-6">
          <input
            type="text"
            placeholder="Search models..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 p-2 border border-border rounded-md bg-background"
          />
          <select
            value={selectedProvider}
            onChange={(e) => setSelectedProvider(e.target.value)}
            className="p-2 border border-border rounded-md bg-background"
          >
            {providers.map(provider => (
              <option key={provider} value={provider}>
                {provider === 'all' ? 'All Providers' : provider}
              </option>
            ))}
          </select>
        </div>

        {/* Models Grid */}
        <div className="grid gap-3 max-h-96 overflow-y-auto">
          {filteredModels.map((model) => (
            <div
              key={model.id}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedModel === model.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-accent hover:bg-accent/50'
              }`}
              onClick={() => handleModelSelect(model.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium">{model.name}</h3>
                    {model.recommended && (
                      <span className="flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                        <Star size={12} />
                        Recommended
                      </span>
                    )}
                    {model.popular && (
                      <span className="flex items-center gap-1 text-xs bg-orange-500/10 text-orange-500 px-2 py-1 rounded-full">
                        <Zap size={12} />
                        Popular
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{model.description}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{model.provider}</span>
                    <span>{model.contextLength.toLocaleString()} tokens</span>
                    {model.pricing && (
                      <span>${model.pricing.input}/${model.pricing.output} per 1K tokens</span>
                    )}
                  </div>
                  <div className="flex gap-1 mt-2">
                    {model.capabilities.map(cap => (
                      <span key={cap} className="text-xs bg-muted px-2 py-1 rounded-full">
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>
                {selectedModel === model.id && (
                  <Check size={20} className="text-primary flex-shrink-0" />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-4 border-t border-border mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  )
} 