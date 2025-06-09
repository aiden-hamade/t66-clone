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
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    description: 'Most advanced GPT-4 model with vision capabilities',
    contextLength: 128000,
    pricing: { input: 0.005, output: 0.015 },
    capabilities: ['text', 'vision', 'function_calling'],
    recommended: true,
  },
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'OpenAI',
    description: 'Fast and capable GPT-4 model',
    contextLength: 128000,
    pricing: { input: 0.01, output: 0.03 },
    capabilities: ['text', 'vision', 'function_calling'],
    popular: true,
  },
  {
    id: 'gpt-4',
    name: 'GPT-4',
    provider: 'OpenAI',
    description: 'Original GPT-4 model',
    contextLength: 8192,
    pricing: { input: 0.03, output: 0.06 },
    capabilities: ['text', 'function_calling'],
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    provider: 'OpenAI',
    description: 'Fast and economical model',
    contextLength: 16385,
    pricing: { input: 0.0005, output: 0.0015 },
    capabilities: ['text', 'function_calling'],
  },
  
  // Anthropic Models
  {
    id: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    description: 'Most intelligent Claude model',
    contextLength: 200000,
    pricing: { input: 0.003, output: 0.015 },
    capabilities: ['text', 'vision', 'function_calling'],
    recommended: true,
  },
  {
    id: 'claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'Anthropic',
    description: 'Most powerful Claude model for complex tasks',
    contextLength: 200000,
    pricing: { input: 0.015, output: 0.075 },
    capabilities: ['text', 'vision'],
  },
  {
    id: 'claude-3-sonnet',
    name: 'Claude 3 Sonnet',
    provider: 'Anthropic',
    description: 'Balanced performance and speed',
    contextLength: 200000,
    pricing: { input: 0.003, output: 0.015 },
    capabilities: ['text', 'vision'],
  },
  {
    id: 'claude-3-haiku',
    name: 'Claude 3 Haiku',
    provider: 'Anthropic',
    description: 'Fastest Claude model',
    contextLength: 200000,
    pricing: { input: 0.00025, output: 0.00125 },
    capabilities: ['text', 'vision'],
  },

  // Google Models
  {
    id: 'gemini-pro',
    name: 'Gemini Pro',
    provider: 'Google',
    description: 'Google\'s most capable model',
    contextLength: 32768,
    pricing: { input: 0.0005, output: 0.0015 },
    capabilities: ['text', 'vision', 'function_calling'],
    popular: true,
  },
  {
    id: 'gemini-flash',
    name: 'Gemini Flash',
    provider: 'Google',
    description: 'Fast and efficient model',
    contextLength: 32768,
    pricing: { input: 0.000075, output: 0.0003 },
    capabilities: ['text', 'vision'],
  },

  // Other Models
  {
    id: 'command-r-plus',
    name: 'Command R+',
    provider: 'Cohere',
    description: 'Advanced reasoning and tool use',
    contextLength: 128000,
    pricing: { input: 0.003, output: 0.015 },
    capabilities: ['text', 'function_calling'],
  },
  {
    id: 'llama-3-70b',
    name: 'Llama 3 70B',
    provider: 'Meta',
    description: 'Open source powerhouse',
    contextLength: 8192,
    pricing: { input: 0.0009, output: 0.0009 },
    capabilities: ['text'],
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