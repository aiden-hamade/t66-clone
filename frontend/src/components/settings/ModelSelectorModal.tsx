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
  // Google Models
  {
    id: 'google/gemini-2.5-pro-preview',
    name: 'Gemini 2.5 Pro',
    provider: 'Google',
    description: 'State-of-the-art AI model with advanced reasoning and thinking capabilities',
    contextLength: 1048576,
    pricing: { input: 1.25, output: 10.0 },
    capabilities: ['text', 'vision', 'reasoning', 'thinking'],
    recommended: true,
  },
  // DeepSeek Models
  {
    id: 'deepseek/deepseek-r1-0528',
    name: 'DeepSeek R1',
    provider: 'DeepSeek',
    description: 'Advanced reasoning model with chain-of-thought capabilities, performance on par with OpenAI o1',
    contextLength: 128000,
    pricing: { input: 0.45, output: 2.15 },
    capabilities: ['text', 'reasoning', 'thinking', 'math', 'coding'],
    popular: true,
  },
  // Anthropic Models
  {
    id: 'anthropic/claude-sonnet-4',
    name: 'Claude Sonnet 4',
    provider: 'Anthropic',
    description: 'Latest Claude model with exceptional reasoning and coding capabilities',
    contextLength: 200000,
    pricing: { input: 3.0, output: 15.0 },
    capabilities: ['text', 'vision', 'reasoning', 'coding'],
    recommended: true,
  },
  {
    id: 'anthropic/claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    description: 'Excellent for coding, data science, and visual processing tasks',
    contextLength: 200000,
    pricing: { input: 3.0, output: 15.0 },
    capabilities: ['text', 'vision', 'coding', 'data_science'],
    popular: true,
  },
  // OpenAI Models
  {
    id: 'openai/gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    description: 'Most advanced GPT-4 model with vision capabilities',
    contextLength: 128000,
    pricing: { input: 5.0, output: 15.0 },
    capabilities: ['text', 'vision', 'function_calling'],
  },
  {
    id: 'openai/gpt-4.1-nano',
    name: 'GPT-4.1 Nano',
    provider: 'OpenAI',
    description: 'Compact and efficient GPT-4.1 model',
    contextLength: 128000,
    pricing: { input: 1.0, output: 3.0 },
    capabilities: ['text', 'function_calling'],
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
            className="flex-1 p-2 border border-theme-input rounded-md bg-theme-input text-theme-input"
          />
          <select
            value={selectedProvider}
            onChange={(e) => setSelectedProvider(e.target.value)}
            className="p-2 border border-theme-input rounded-md bg-theme-input text-theme-input"
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
                  ? 'border-theme-accent bg-theme-button-secondary'
                  : 'border-theme-modal hover:border-theme-accent hover:bg-theme-dropdown-hover'
              }`}
              onClick={() => handleModelSelect(model.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-theme-primary">{model.name}</h3>
                    {model.recommended && (
                      <span className="flex items-center gap-1 text-xs bg-theme-button-secondary text-theme-accent px-2 py-1 rounded-full">
                        <Star size={12} />
                        Recommended
                      </span>
                    )}
                    {model.popular && (
                      <span className="flex items-center gap-1 text-xs bg-theme-button-secondary text-theme-warning px-2 py-1 rounded-full">
                        <Zap size={12} />
                        Popular
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-theme-secondary mb-2">{model.description}</p>
                  <div className="flex items-center gap-4 text-xs text-theme-secondary">
                    <span>{model.provider}</span>
                    <span>{model.contextLength.toLocaleString()} tokens</span>
                    {model.pricing && (
                      <span>${model.pricing.input}/${model.pricing.output} per 1M tokens</span>
                    )}
                  </div>
                  <div className="flex gap-1 mt-2">
                    {model.capabilities.map(cap => (
                      <span key={cap} className="text-xs bg-theme-button-secondary text-theme-secondary px-2 py-1 rounded-full">
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>
                {selectedModel === model.id && (
                  <Check size={20} className="text-theme-accent flex-shrink-0" />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-4 border-t border-theme-modal mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  )
} 