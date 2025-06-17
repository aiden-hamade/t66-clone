// Core Types
export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  verified: boolean
  plan: 'free' | 'pro' | 'enterprise'
  openRouterApiKey?: string
  selectedTheme?: string // Theme preset name (e.g., 'T3 Theme', 'Cyberpunk')
  customTheme?: any // Custom theme properties if user has customized
  createdAt: Date
  updatedAt: Date
}

export interface Message {
  id: string
  content: string
  role: 'user' | 'assistant' | 'system'
  timestamp: Date
  attachments?: Attachment[]
  metadata?: MessageMetadata
}

export interface MessageMetadata {
  model?: string
  tokens?: number
  cost?: number
  processingTime?: number
  error?: string
  webSearchUsed?: boolean
  webSearchResults?: Array<{
    url: string
    title: string
    content?: string
  }>
}

export interface Chat {
  id: string
  title: string
  messages: Message[]
  settings: ChatSettings
  user: string
  shared?: boolean
  shareId?: string
  isSplit?: boolean
  splitFromChatId?: string // ID of the original chat this was split from
  folderId?: string | null // ID of the folder this chat belongs to
  collaborators?: string[] // Array of user IDs who can collaborate on this chat
  createdAt: Date
  updatedAt: Date
}

export interface ChatSettings {
  model: string
  temperature: number
  maxTokens?: number
  systemMessage?: string
  provider: AIProvider
}

export interface Attachment {
  id: string
  filename: string
  size: number
  type: string
  url: string
  createdAt: Date | string
}

// AI Provider Types
export type AIProvider = 'openai' | 'anthropic' | 'google' | 'cohere' | 'openrouter' | 'huggingface'

export interface AIModel {
  id: string
  name: string
  provider: AIProvider
  description: string
  contextLength: number
  pricing?: {
    input: number
    output: number
  }
  capabilities: ModelCapability[]
}

export type ModelCapability = 'text' | 'vision' | 'function_calling' | 'code' | 'reasoning'

export interface AIProviderConfig {
  provider: AIProvider
  apiKey: string
  baseUrl?: string
  models: AIModel[]
  enabled: boolean
}

// Settings Types
export interface UserSettings {
  defaultModel: string
  defaultProvider: AIProvider
  apiKeys: Record<AIProvider, string>
  preferences: UserPreferences
}

export interface UserPreferences {
  sendOnEnter: boolean
  showTokenCount: boolean
  enableNotifications: boolean
  autoSave: boolean
  codeHighlighting: boolean
  fontSize: 'small' | 'medium' | 'large'
}

// API Types
export interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface ChatCompletionRequest {
  model: string
  messages: Message[]
  temperature?: number
  maxTokens?: number
  stream?: boolean
  functions?: Function[]
}

export interface ChatCompletionResponse {
  id: string
  object: string
  created: number
  model: string
  choices: ChatChoice[]
  usage?: TokenUsage
}

export interface ChatChoice {
  index: number
  message?: Message
  delta?: Partial<Message>
  finishReason?: string
}

export interface TokenUsage {
  promptTokens: number
  completionTokens: number
  totalTokens: number
}

// Function Calling Types
export interface Function {
  name: string
  description: string
  parameters: {
    type: string
    properties: Record<string, any>
    required?: string[]
  }
}

export interface FunctionCall {
  name: string
  arguments: string
}

// Search Types
export interface SearchResult {
  title: string
  url: string
  snippet: string
  source: string
  published?: string
}

export interface WebSearchRequest {
  query: string
  numResults?: number
  includeImages?: boolean
}

export interface WebSearchResponse {
  query: string
  results: SearchResult[]
  searchTime: number
}

// Image Generation Types
export interface ImageGenerationRequest {
  prompt: string
  model: string
  size?: string
  quality?: string
  n?: number
}

export interface ImageGenerationResponse {
  created: number
  data: GeneratedImage[]
}

export interface GeneratedImage {
  url: string
  revisedPrompt?: string
}

// Error Types
export interface AppError {
  code: string
  message: string
  details?: any
}

// Store Types (for Zustand)
export interface ChatStore {
  chats: Chat[]
  activeChat: string | null
  currentMessage: string
  isLoading: boolean
  error: string | null
  
  // Actions
  setChats: (chats: Chat[]) => void
  addChat: (chat: Chat) => void
  updateChat: (id: string, updates: Partial<Chat>) => void
  deleteChat: (id: string) => void
  setActiveChat: (id: string) => void
  setCurrentMessage: (message: string) => void
  sendMessage: (content: string) => Promise<void>
  clearError: () => void
}

export interface UserStore {
  user: User | null
  settings: UserSettings
  isAuthenticated: boolean
  isLoading: boolean
  
  // Actions
  setUser: (user: User | null) => void
  updateSettings: (settings: Partial<UserSettings>) => void
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  register: (email: string, password: string, name: string) => Promise<void>
}

// Component Props Types
export interface ButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  className?: string
}

export interface InputProps {
  type?: string
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  disabled?: boolean
  className?: string
}

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export interface ChatFolder {
  id: string
  name: string
  color?: string
  user: string
  isExpanded?: boolean
  createdAt: Date
  updatedAt: Date
} 