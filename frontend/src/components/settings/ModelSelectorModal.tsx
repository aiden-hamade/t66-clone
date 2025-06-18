import React, { useState } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Check, Zap, Star, Search, Brain, Code, Eye, Calculator, DollarSign, Layers } from 'lucide-react'

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
  logo: React.ReactNode;
  count: number;
}

// Provider configurations with authentic brand colors and logos
const getProviderConfig = (providerName: string): Provider => {
  const configs: Record<string, Omit<Provider, 'count'>> = {
    'OpenAI': {
      name: 'OpenAI',
      color: '#000000', // Updated to black based on new 2024 branding
      logo: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="white">
          <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"/>
        </svg>
      )
    },
    'Anthropic': {
      name: 'Anthropic',
      color: '#D4A574', // Anthropic's beige brand color
      logo: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
          <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z"/>
          <path d="M8 10h8l-4 8-4-8z" fill="white"/>
        </svg>
      )
    },
    'Google': {
      name: 'Google',
      color: '#4285F4', // Google's official blue
      logo: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
      )
    },
    'DeepSeek': {
      name: 'DeepSeek',
      color: '#1E40AF', // Deep blue from research
      logo: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
          <circle cx="12" cy="12" r="10"/>
          <path d="M8 8l8 8M16 8l-8 8" stroke="white" strokeWidth="2"/>
        </svg>
      )
    },
    'Meta': {
      name: 'Meta',
      color: '#0866FF', // Meta's official blue
      logo: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
        </svg>
      )
    },
    'xAI': {
      name: 'xAI',
      color: '#000000', // Black brand color
      logo: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      )
    },
    'Qwen': {
      name: 'Qwen',
      color: '#FF6B35', // Orange color from research
      logo: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
          <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z"/>
          <circle cx="12" cy="12" r="4" fill="white"/>
        </svg>
      )
    }
  };

  return {
    ...configs[providerName] || {
      name: providerName,
      color: '#6B7280',
      logo: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
          <circle cx="12" cy="12" r="10"/>
        </svg>
      )
    },
    count: 0
  };
};

// Helper function to check if a model is a reasoning model that should show thinking UI
const isReasoningModel = (modelId: string): boolean => {
  const reasoningModels = [
    'openai/o3',
    'openai/o3-pro',
    'openai/o4-mini',
    'anthropic/claude-3.7-sonnet:thinking',
    'deepseek/deepseek-r1',
    'deepseek/deepseek-r1-0528',
    'deepseek/deepseek-r1-distill-qwen-7b',
    'deepseek/deepseek-r1-distill-llama-8b',
    'qwen/qwq-32b',
    'google/gemini-2.5-flash-preview-05-20:thinking'
  ];
  
  return reasoningModels.includes(modelId);
};

// Helper function to get badge styles
const getBadgeStyles = (badge: string): string => {
  switch (badge) {
    case 'Free':
      return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
    case 'Popular':
      return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300';
    case 'Recommended':
      return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
    case 'Reasoning':
      return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300';
    default:
      return 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300';
  }
};

// Helper function to get capability titles
const getCapabilityTitle = (capability: string): string => {
  switch (capability) {
    case '🧠':
      return 'Reasoning';
    case '🌐':
      return 'Web Search';
    case '👁️':
      return 'Image Upload';
    case '📄':
      return 'PDF Upload';
    case '🎤':
      return 'Voice';
    default:
      return 'Capability';
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
            <span className="font-medium" style={{ color: providerInfo.name === 'OpenAI' ? 'var(--color-text-primary)' : providerInfo.color }}>
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
            {model.capabilities.slice(0, 6).map(cap => (
              <div key={cap} title={getCapabilityTitle(cap)} className="flex items-center gap-1 text-xs bg-theme-button-secondary text-theme-secondary px-2 py-1 rounded-full">
                {cap}
              </div>
            ))}
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