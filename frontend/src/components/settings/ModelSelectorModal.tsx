import React, { useState } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Check, Zap, Star, Search, Brain, DollarSign, Layers } from 'lucide-react'
import openAILogo from '../../assets/openai.svg';
import anthropicLogo from '../../assets/claude-color.svg';
import googleLogo from '../../assets/google-color.svg';
import deepseekLogo from '../../assets/deepseek-color.svg';
import metaLogo from '../../assets/meta-color.svg';
import xaiLogo from '../../assets/xai.svg';
import qwenLogo from '../../assets/qwen-color.svg';

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
  badges?: string[]
  popular?: boolean
  recommended?: boolean
  free?: boolean
  reasoning?: boolean
}

interface ModelSelectorModalProps {
  isOpen: boolean
  onClose: () => void
  selectedModel: string
  onModelSelect: (modelId: string) => void
}

interface Provider {
  name: string;
  color: string;
  textColor: string;
  logo: React.ReactNode;
  count: number;
}

// Provider configurations with authentic brand colors and logos
const getProviderConfig = (providerName: string): Provider => {
  const configs: Record<string, Omit<Provider, 'count'>> = {
    'OpenAI': {
      name: 'OpenAI',
      color: '#FFFFFF', // Use white background for black logo
      textColor: 'var(--color-text-primary)',
      logo: (
        <img src={openAILogo} alt="OpenAI Logo" className="w-6 h-6" />
      )
    },
    'Anthropic': {
      name: 'Anthropic',
      color: '#D4A574',
      textColor: 'var(--color-text-primary)',
      logo: (
        <img src={anthropicLogo} alt="Anthropic Logo" className="w-5 h-5" />
      )
    },
    'Google': {
      name: 'Google',
      color: '#FFFFFF', // Use white background for color logo
      textColor: 'var(--color-text-primary)', // Use brand blue for text
      logo: (
        <img src={googleLogo} alt="Google Logo" className="w-5 h-5" />
      )
    },
    'DeepSeek': {
      name: 'DeepSeek',
      color: '#1E40AF',
      textColor: 'var(--color-text-primary)',
      logo: (
        <img src={deepseekLogo} alt="DeepSeek Logo" className="w-5 h-5" />
      )
    },
    'Meta': {
      name: 'Meta',
      color: '#FFFFFF', // Use white background for color logo
      textColor: 'var(--color-text-primary)', // Use brand blue for text
      logo: (
        <img src={metaLogo} alt="Meta Logo" className="w-6 h-6" />
      )
    },
    'xAI': {
      name: 'xAI',
      color: '#000000',
      textColor: 'var(--color-text-primary)', // Use theme color for readability
      logo: (
        <img src={xaiLogo} alt="xAI Logo" className="w-4 h-4 invert" />
      )
    },
    'Qwen': {
      name: 'Qwen',
      color: '#FF6B35',
      textColor: 'var(--color-text-primary)',
      logo: (
        <img src={qwenLogo} alt="Qwen Logo" className="w-5 h-5" />
      )
    }
  };

  return {
    ...configs[providerName] || {
      name: providerName,
      color: '#6B7280',
      textColor: '#6B7280',
      logo: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
          <circle cx="12" cy="12" r="10"/>
        </svg>
      )
    },
    count: 0
  };
};

// Helper function to get capability titles
const getCapabilityTitle = (capability: string): string => {
  switch (capability) {
    case '🧠':
      return 'Reasoning';
    case '🌐':
      return 'Web Search';
    case '👁️':
      return 'Vision Supported';
    case '📄':
      return 'PDF Upload';
    case '🎤':
      return 'Voice';
    default:
      return 'Capability';
  }
};

// Helper function to determine if a capability should be shown as a text badge
const shouldShowAsTextBadge = (capability: string): boolean => {
  return capability === '🧠' || capability === '👁️';
};

// Helper function to get text badge content
const getTextBadgeContent = (capability: string): string => {
  switch (capability) {
    case '🧠':
      return 'Reasoning';
    case '👁️':
      return 'Vision Supported';
    default:
      return capability;
  }
};

const MODELS: Model[] = [
  // OpenAI Models
  {
    id: 'openai/o3',
    name: 'o3',
    provider: 'OpenAI',
    description: 'Latest reasoning model with advanced problem-solving capabilities',
    contextLength: 200000,
    pricing: { input: 2.00, output: 8.00 },
    capabilities: ['🧠', '🔬', '💻'],
    badges: ['Reasoning', 'Popular'],
  },
  {
    id: 'openai/o3-pro',
    name: 'o3 Pro',
    provider: 'OpenAI',
    description: 'Most powerful reasoning model for complex scientific and mathematical problems',
    contextLength: 200000,
    pricing: { input: 20.00, output: 80.00 },
    capabilities: ['🧠'],
    badges: ['Reasoning'],
  },
  {
    id: 'openai/o4-mini',
    name: 'o4 mini',
    provider: 'OpenAI',
    description: 'Compact reasoning model optimized for efficiency and speed',
    contextLength: 200000,
    pricing: { input: 1.10, output: 4.40 },
    capabilities: ['🧠'],
    badges: ['Reasoning'],
  },
  {
    id: 'openai/gpt-4.5-preview',
    name: 'GPT 4.5',
    provider: 'OpenAI',
    description: 'Next-generation multimodal model with enhanced capabilities',
    contextLength: 128000,
    pricing: { input: 75.00, output: 150.00 },
    capabilities: ['🧠', '👁️', '📄', '🎤', '🌐'],
    badges: ['Recommended'],
  },
  {
    id: 'openai/gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    description: 'Advanced multimodal model with vision, audio, and text capabilities',
    contextLength: 128000,
    pricing: { input: 2.50, output: 10.00 },
    capabilities: ['🧠', '👁️', '🎤', '📄', '🌐'],
    badges: ['Popular'],
  },
  {
    id: 'openai/gpt-4.1',
    name: 'GPT-4.1',
    provider: 'OpenAI',
    description: 'Enhanced model with improved reasoning and extended context',
    contextLength: 1047576,
    pricing: { input: 2.00, output: 8.00 },
    capabilities: ['🧠', '👁️', '📄', '🌐'],
    badges: [],
  },
  {
    id: 'openai/gpt-4.1-mini',
    name: 'GPT-4.1 Mini',
    provider: 'OpenAI',
    description: 'Efficient version of GPT-4.1 with balanced performance and cost',
    contextLength: 1047576,
    pricing: { input: 0.40, output: 1.60 },
    capabilities: ['🧠', '👁️'],
    badges: [],
  },
  {
    id: 'openai/gpt-4.1-nano',
    name: 'GPT-4.1 Nano',
    provider: 'OpenAI',
    description: 'Ultra-efficient model for high-volume applications',
    contextLength: 1047576,
    pricing: { input: 0.10, output: 0.40 },
    capabilities: ['🧠'],
    badges: [],
  },

  // Anthropic Models
  {
    id: 'anthropic/claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    description: 'Most intelligent model with best-in-class analysis and coding capabilities',
    contextLength: 200000,
    pricing: { input: 3.00, output: 15.00 },
    capabilities: ['🧠', '👁️', '📄'],
    badges: ['Popular', 'Recommended'],
  },
  {
    id: 'anthropic/claude-3.7-sonnet',
    name: 'Claude 3.7 Sonnet',
    provider: 'Anthropic',
    description: 'Enhanced Sonnet model with improved reasoning and analysis',
    contextLength: 200000,
    pricing: { input: 3.00, output: 15.00 },
    capabilities: ['🧠', '👁️', '📄'],
    badges: [],
  },
  {
    id: 'anthropic/claude-3.7-sonnet:thinking',
    name: 'Claude 3.7 Sonnet Reasoning',
    provider: 'Anthropic',
    description: 'Claude 3.7 with advanced reasoning and thinking capabilities',
    contextLength: 200000,
    pricing: { input: 3.00, output: 15.00 },
    capabilities: ['🧠', '👁️', '📄'],
    badges: ['Reasoning'],
  },
  {
    id: 'anthropic/claude-opus-4',
    name: 'Claude 4 Opus',
    provider: 'Anthropic',
    description: 'Most powerful Claude model for highly complex tasks',
    contextLength: 200000,
    pricing: { input: 15.00, output: 75.00 },
    capabilities: ['🧠', '👁️', '📄'],
    badges: [],
  },
  {
    id: 'anthropic/claude-sonnet-4',
    name: 'Claude 4 Sonnet',
    provider: 'Anthropic',
    description: 'Next-generation Claude model with enhanced capabilities',
    contextLength: 200000,
    pricing: { input: 3.00, output: 15.00 },
    capabilities: ['🧠', '👁️', '📄'],
    badges: [],
  },

  // Meta Models
  {
    id: 'meta-llama/llama-3.3-70b-instruct',
    name: 'Llama 3.3 70B Instruct',
    provider: 'Meta',
    description: 'Latest open-source model with improved capabilities',
    contextLength: 131072,
    pricing: { input: 0.00, output: 0.00 },
    capabilities: ['🧠', '👁️'],
    badges: ['Free'],
  },
  {
    id: 'meta-llama/llama-4-scout',
    name: 'Llama 4 Scout',
    provider: 'Meta',
    description: 'Next-generation Llama model with enhanced understanding',
    contextLength: 1048576,
    pricing: { input: 0.08, output: 0.30 },
    capabilities: ['🧠', '👁️', '📄'],
    badges: [],
  },
  {
    id: 'meta-llama/llama-4-maverick',
    name: 'Llama 4 Maverick',
    provider: 'Meta',
    description: 'Advanced Llama 4 variant with superior performance',
    contextLength: 1048576,
    pricing: { input: 0.15, output: 0.60 },
    capabilities: ['🧠', '👁️', '📄'],
    badges: [],
  },

  // DeepSeek Models
  {
    id: 'deepseek/deepseek-v3-base:free',
    name: 'DeepSeek V3 Base',
    provider: 'DeepSeek',
    description: 'Latest open-source model with exceptional capabilities',
    contextLength: 163840,
    pricing: { input: 0.00, output: 0.00 },
    capabilities: ['🧠', '👁️'],
    badges: ['Free', 'Popular'],
  },
  {
    id: 'deepseek/deepseek-r1',
    name: 'DeepSeek R1',
    provider: 'DeepSeek',
    description: 'Advanced reasoning model with strong problem-solving abilities',
    contextLength: 128000,
    pricing: { input: 0.45, output: 2.15 },
    capabilities: ['🧠'],
    badges: ['Reasoning'],
  },
  {
    id: 'deepseek/deepseek-r1-0528',
    name: 'DeepSeek R1 0528',
    provider: 'DeepSeek',
    description: 'Enhanced version of DeepSeek R1 with improved reasoning',
    contextLength: 128000,
    pricing: { input: 0.50, output: 2.15 },
    capabilities: ['🧠'],
    badges: ['Reasoning'],
  },
  {
    id: 'deepseek/deepseek-r1-distill-qwen-7b',
    name: 'DeepSeek R1 Qwen Distilled',
    provider: 'DeepSeek',
    description: 'Distilled reasoning model based on Qwen architecture',
    contextLength: 131072,
    pricing: { input: 0.10, output: 0.20 },
    capabilities: ['🧠'],
    badges: [],
  },
  {
    id: 'deepseek/deepseek-r1-distill-llama-8b',
    name: 'DeepSeek R1 Llama Distilled',
    provider: 'DeepSeek',
    description: 'Efficient distilled reasoning model based on Llama',
    contextLength: 32000,
    pricing: { input: 0.04, output: 0.04 },
    capabilities: ['🧠'],
    badges: [],
  },

  // xAI Models
  {
    id: 'x-ai/grok-3-beta',
    name: 'Grok 3',
    provider: 'xAI',
    description: 'Advanced AI with personality and real-time knowledge',
    contextLength: 131072,
    pricing: { input: 3.00, output: 15.00 },
    capabilities: ['🧠', '🌐'],
    badges: [],
  },
  {
    id: 'x-ai/grok-3-mini-beta',
    name: 'Grok 3 Mini',
    provider: 'xAI',
    description: 'Compact version of Grok 3 with efficient performance',
    contextLength: 131072,
    pricing: { input: 0.30, output: 0.50 },
    capabilities: ['🧠', '🌐'],
    badges: [],
  },

  // Qwen Models
  {
    id: 'qwen/qwq-32b',
    name: 'Qwen QwQ-32B',
    provider: 'Qwen',
    description: 'Reasoning-focused model with question-answering capabilities',
    contextLength: 131072,
    pricing: { input: 0.15, output: 0.20 },
    capabilities: ['🧠'],
    badges: [],
  },
  {
    id: 'qwen/qwen2.5-vl-32b-instruct',
    name: 'Qwen 2.5 VL 32B Instruct',
    provider: 'Qwen',
    description: 'Vision-language model with multimodal understanding',
    contextLength: 128000,
    pricing: { input: 0.90, output: 0.90 },
    capabilities: ['🧠', '👁️', '📄'],
    badges: [],
  },

  // Google Models
  {
    id: 'google/gemini-2.5-flash-lite-preview-06-17',
    name: 'Gemini 2.5 Flash Lite',
    provider: 'Google',
    description: 'Lightweight version of Gemini 2.5 Flash for efficient processing',
    contextLength: 1048576,
    pricing: { input: 0.10, output: 0.40 },
    capabilities: ['🧠', '👁️', '🎤', '📄'],
    badges: [],
  },
  {
    id: 'google/gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'Google',
    description: 'Fast, efficient multimodal model with enhanced capabilities',
    contextLength: 1048576,
    pricing: { input: 0.30, output: 2.50 },
    capabilities: ['🧠', '👁️', '🎤', '📄'],
    badges: ['Popular'],
  },
  {
    id: 'google/gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'Google',
    description: 'Advanced model with massive context and superior performance',
    contextLength: 1048576,
    pricing: { input: 1.25, output: 10.00 },
    capabilities: ['🧠', '👁️', '🎤', '📄'],
    badges: ['Recommended'],
  },
  {
    id: 'google/gemini-2.5-flash-preview-05-20:thinking',
    name: 'Gemini 2.5 Flash Thinking',
    provider: 'Google',
    description: 'Gemini 2.5 Flash with advanced reasoning and thinking capabilities',
    contextLength: 1048576,
    pricing: { input: 0.15, output: 3.50 },
    capabilities: ['🧠', '👁️', '📄'],
    badges: ['Reasoning'],
  },
];

export function ModelSelectorModal({ isOpen, onClose, selectedModel, onModelSelect }: ModelSelectorModalProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProvider, setSelectedProvider] = useState<string>('all')

  const providers = ['all', ...Array.from(new Set(MODELS.map(m => m.provider)))]
  const modelsByProvider = providers.slice(1).reduce((acc, provider) => {
    acc[provider] = MODELS.filter(m => m.provider === provider)
    return acc
  }, {} as Record<string, Model[]>)
  
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
    <Modal isOpen={isOpen} onClose={onClose} title="Select AI Model" size="xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center border-b border-theme-modal pb-4">
          <h2 className="text-xl font-bold text-theme-primary mb-2">Choose the perfect AI model for your task</h2>
          <p className="text-theme-secondary">Compare capabilities, pricing, and performance</p>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-secondary" />
            <input
              type="text"
              placeholder="Search models by name or provider..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-theme-input rounded-lg bg-theme-input text-theme-input focus:ring-2 focus:ring-theme-accent focus:border-transparent"
            />
          </div>
          <select
            value={selectedProvider}
            onChange={(e) => setSelectedProvider(e.target.value)}
            className="px-4 py-2 border border-theme-input rounded-lg bg-theme-input text-theme-input focus:ring-2 focus:ring-theme-accent focus:border-transparent"
          >
            <option value="all">All Providers</option>
            {providers.slice(1).map(provider => (
              <option key={provider} value={provider}>{provider}</option>
            ))}
          </select>
        </div>

        {/* Models by Provider */}
        <div className="max-h-[70vh] overflow-y-auto space-y-6">
          {selectedProvider === 'all' ? (
            // Show by provider groups
            Object.entries(modelsByProvider).map(([provider, models]) => (
              <div key={provider} className="space-y-3">
                                 <div className="flex items-center gap-3 sticky top-0 bg-theme-modal py-2 z-10">
                   <div 
                     className="w-8 h-8 rounded-lg flex items-center justify-center"
                     style={{ backgroundColor: getProviderConfig(provider).color }}
                   >
                     {getProviderConfig(provider).logo}
                   </div>
                  <h3 className="text-lg font-semibold text-theme-primary">{provider}</h3>
                  <span className="text-sm text-theme-secondary">
                    {models.length} model{models.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="grid gap-3">
                  {models.filter(model => 
                    model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    model.description.toLowerCase().includes(searchTerm.toLowerCase())
                  ).map((model) => (
                    <ModelCard 
                      key={model.id} 
                      model={model} 
                      isSelected={selectedModel === model.id}
                      onSelect={() => handleModelSelect(model.id)}
                    />
                  ))}
                </div>
              </div>
            ))
          ) : (
            // Show filtered results
            <div className="grid gap-3">
              {filteredModels.map((model) => (
                <ModelCard 
                  key={model.id} 
                  model={model} 
                  isSelected={selectedModel === model.id}
                  onSelect={() => handleModelSelect(model.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-4 border-t border-theme-modal">
          <div className="text-sm text-theme-secondary">
            {filteredModels.length} model{filteredModels.length !== 1 ? 's' : ''} available
          </div>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  )
}

interface ModelCardProps {
  model: Model
  isSelected: boolean
  onSelect: () => void
}

function ModelCard({ model, isSelected, onSelect }: ModelCardProps) {
  const providerInfo = getProviderConfig(model.provider)
  
  return (
    <div
      className={`group relative p-4 border rounded-xl cursor-pointer transition-all duration-200 hover:shadow-lg ${
        isSelected
          ? 'border-theme-accent bg-theme-button-secondary shadow-md'
          : 'border-theme-modal hover:border-theme-accent hover:bg-theme-dropdown-hover'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-3">
          {/* Header */}
                     <div className="flex items-center gap-3">
             <div 
               className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
               style={{ backgroundColor: providerInfo.color }}
             >
               {providerInfo.logo}
             </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-theme-primary truncate">{model.name}</h3>
                {model.free && (
                  <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    <DollarSign size={10} />
                    Free
                  </span>
                )}
                {model.recommended && (
                  <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    <Star size={10} />
                    Recommended
                  </span>
                )}
                {model.popular && (
                  <span className="inline-flex items-center gap-1 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                    <Zap size={10} />
                    Popular
                  </span>
                )}
                {model.reasoning && (
                  <span className="inline-flex items-center gap-1 text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                    <Brain size={10} />
                    Reasoning
                  </span>
                )}
              </div>
              <p className="text-sm text-theme-secondary mt-1">{model.description}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-xs text-theme-secondary">
            <span className="font-medium" style={{ color: providerInfo.textColor }}>
              {model.provider}
            </span>
            <span className="flex items-center gap-1">
              <Layers size={12} />
              {model.contextLength.toLocaleString()} tokens
            </span>
            {model.pricing && (
              <span className="flex items-center gap-1">
                <DollarSign size={12} />
                ${model.pricing.input}/${model.pricing.output} per 1M
              </span>
            )}
          </div>

          {/* Capabilities */}
          <div className="flex flex-wrap gap-2">
            {model.capabilities.slice(0, 6).map(cap => {
              if (shouldShowAsTextBadge(cap)) {
                return (
                  <span 
                    key={cap}
                    className={`inline-flex items-center text-xs px-2 py-1 rounded-full font-medium ${
                      cap === '🧠' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {getTextBadgeContent(cap)}
                  </span>
                );
              }
              return (
                <div key={cap} title={getCapabilityTitle(cap)} className="flex items-center gap-1 text-xs bg-theme-button-secondary text-theme-secondary px-2 py-1 rounded-full">
                  {cap}
                </div>
              );
            })}
            {model.capabilities.length > 6 && (
              <span className="text-xs text-theme-secondary px-2 py-1">
                +{model.capabilities.length - 6} more
              </span>
            )}
          </div>
        </div>

        {/* Selection Indicator */}
        {isSelected && (
          <div className="absolute top-4 right-4">
            <div className="w-6 h-6 bg-theme-accent rounded-full flex items-center justify-center">
              <Check size={14} className="text-white" />
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 