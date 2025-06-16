import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Send, MessageSquare, Settings, User, Moon, Sun, Plus, MoreVertical, Trash2, ChevronDown, Edit2, LogOut, Info, Copy } from 'lucide-react'
import './App.css'

// Components
import { Button } from './components/ui/Button'
import { Modal } from './components/ui/Modal'
import { Dropdown, DropdownItem } from './components/ui/Dropdown'
import { MarkdownRenderer } from './components/ui/MarkdownRenderer'
import { SettingsModal } from './components/settings/SettingsModal'
import { ModelSelectorModal } from './components/settings/ModelSelectorModal'
import { ProtectedRoute } from './components/auth/ProtectedRoute'

// Stores
import { useAuthStore } from './stores/authStore'
import { useChatStore } from './stores/chatStore'
import { useThemeStore } from './stores/themeStore'

// Utils
import { estimateTokenCount } from './lib/openrouter'

// Types
import type { ChatSettings } from './types'

function App() {
  const [selectedModel, setSelectedModel] = useState('openai/gpt-4o')
  const [showSettings, setShowSettings] = useState(false)
  const [showModelSelector, setShowModelSelector] = useState(false)
  const [renamingChat, setRenamingChat] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')

  // Auth store
  const { user, signOut: authSignOut, setUser: setAuthUser } = useAuthStore()
  
  // Theme store
  const { initializeTheme, setUser: setThemeUser } = useThemeStore()

  // Chat store
  const {
    chats,
    activeChat,
    currentMessage,
    isLoading,
    isStreaming,
    error,
    showContinuePrompt,
    continueMessageId,
    setActiveChat,
    setCurrentMessage,
    setUser,
    loadUserChats,
    createNewChat,
    splitChat,
    updateChatTitle,
    deleteChat,
    sendMessage,
    continueMessage,
    setShowContinuePrompt,
    setContinueMessageId,
    clearError
  } = useChatStore()

  const currentChatData = chats.find(chat => chat.id === activeChat)

  // Calculate token counts
  const currentMessageTokens = estimateTokenCount(currentMessage)
  const totalTokensUsed = currentChatData?.messages.reduce((total, msg) => {
    return total + estimateTokenCount(msg.content)
  }, 0) || 0

  // Initialize theme on app start
  useEffect(() => {
    initializeTheme()
  }, [initializeTheme])

  // Load user chats when user changes and sync user to chat store and theme store
  useEffect(() => {
    setUser(user) // Sync user to chat store
    setThemeUser(user) // Sync user to theme store
    if (user?.id) {
      loadUserChats(user.id)
    }
  }, [user, setUser, setThemeUser, loadUserChats])

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || !user?.id || isStreaming) return

    try {
      clearError()
      
      // Create new chat if none exists
      if (!activeChat) {
        const defaultSettings: ChatSettings = {
          model: selectedModel,
          temperature: 0.7,
          maxTokens: 4000,
          provider: 'openrouter'
        }
        
        await createNewChat(user.id, 'New Chat', defaultSettings)
      }
      
      await sendMessage(user.id, currentMessage, true)
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const handleCreateNewChat = () => {
    // Just clear the current chat selection
    // The actual chat will be created when the first message is sent
    setActiveChat(null)
  }

  const handleDeleteChat = async (chatId: string) => {
    try {
      await deleteChat(chatId)
    } catch (error) {
      console.error('Error deleting chat:', error)
    }
  }

  const handleSplitChat = async (chatId: string) => {
    if (!user?.id) return
    
    try {
      await splitChat(user.id, chatId)
    } catch (error) {
      console.error('Error splitting chat:', error)
    }
  }

  const startRenaming = (chatId: string) => {
    const chat = chats.find(c => c.id === chatId)
    if (chat) {
      setRenamingChat(chatId)
      setRenameValue(chat.title)
    }
  }

  const finishRenaming = async () => {
    if (renamingChat && renameValue.trim()) {
      try {
        await updateChatTitle(renamingChat, renameValue.trim())
      } catch (error) {
        console.error('Error updating chat title:', error)
      }
    }
    setRenamingChat(null)
    setRenameValue('')
  }

  const cancelRenaming = () => {
    setRenamingChat(null)
    setRenameValue('')
  }

  const handleSignOut = async () => {
    try {
      await authSignOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const getModelName = (modelId: string) => {
    const modelNames: Record<string, string> = {
      'openai/gpt-4o': 'GPT-4o',
      'openai/gpt-4.1-nano': 'GPT-4.1 Nano',
    }
    return modelNames[modelId] || modelId
  }

  return (
    <Router>
      <ProtectedRoute>
        <div className="min-h-screen bg-theme-background">
          <div className="flex h-screen bg-theme-background text-theme-primary">
                          {/* Sidebar */}
              <div className="w-64 bg-theme-surface border-r border-theme flex flex-col">
                              {/* Header */}
                <div className="p-4 border-b border-theme">
                  <div className="flex items-center justify-between">
                    <h1 className="text-xl font-bold text-theme-accent">T66</h1>
                  </div>
                  <p className="text-sm text-theme-secondary mt-1">AI Chat Application</p>
              </div>

              {/* New Chat Button */}
              <div className="p-4">
                <Button
                  onClick={handleCreateNewChat}
                  className="w-full flex items-center gap-2"
                >
                  <Plus size={18} />
                  New Chat
                </Button>
              </div>

              {/* Chat List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {chats.map(chat => (
                  <div
                    key={chat.id}
                    className={`group relative flex items-center p-3 rounded-lg transition-colors ${
                      activeChat === chat.id 
                        ? 'bg-theme-sidebar-active text-theme-primary' 
                        : 'hover:bg-theme-sidebar-hover'
                    }`}
                  >
                    {renamingChat === chat.id ? (
                      <div className="flex-1 flex items-center gap-2">
                        <MessageSquare size={16} />
                        <input
                          type="text"
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              finishRenaming()
                            } else if (e.key === 'Escape') {
                              cancelRenaming()
                            }
                          }}
                          onBlur={finishRenaming}
                          className="flex-1 px-2 py-1 text-sm bg-theme-input border border-theme-input text-theme-input rounded focus:outline-none focus:ring-1 focus:ring-theme-accent"
                          autoFocus
                        />
                      </div>
                    ) : (
                      <button
                        onClick={() => setActiveChat(chat.id)}
                        className="flex-1 text-left min-w-0"
                      >
                        <div className="flex items-center gap-2">
                          <MessageSquare size={16} />
                          <span className="truncate">{chat.title}</span>
                        </div>
                        <p className="text-xs text-theme-secondary mt-1">
                          {chat.messages.length} messages
                        </p>
                      </button>
                    )}
                    
                    {/* Three-dot menu */}
                    {renamingChat !== chat.id && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Dropdown
                          trigger={
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <MoreVertical size={14} />
                            </Button>
                          }
                        >
                          <DropdownItem onClick={() => startRenaming(chat.id)}>
                            <div className="flex items-center gap-2">
                              <Edit2 size={14} />
                              Rename Chat
                            </div>
                          </DropdownItem>
                          <DropdownItem onClick={() => handleSplitChat(chat.id)}>
                            <div className="flex items-center gap-2">
                              <Copy size={14} />
                              Split Chat
                            </div>
                          </DropdownItem>
                          <DropdownItem 
                            onClick={() => handleDeleteChat(chat.id)}
                            variant="destructive"
                          >
                            <div className="flex items-center gap-2">
                              <Trash2 size={14} />
                              Delete Chat
                            </div>
                          </DropdownItem>
                        </Dropdown>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* User Section */}
              <div className="p-4 border-t border-theme">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-theme-button-primary rounded-full flex items-center justify-center">
                    <User size={16} className="text-theme-button-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-theme-primary">{user?.name || 'User'}</p>
                    <p className="text-xs text-theme-secondary">{user?.email || 'No email'}</p>
                  </div>
                  <Dropdown
                    trigger={
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Settings size={16} />
                      </Button>
                    }
                  >
                    <DropdownItem onClick={() => setShowSettings(true)}>
                      <div className="flex items-center gap-2">
                        <Settings size={14} />
                        Settings
                      </div>
                    </DropdownItem>
                    <DropdownItem onClick={handleSignOut} variant="destructive">
                      <div className="flex items-center gap-2">
                        <LogOut size={14} />
                        Sign Out
                      </div>
                    </DropdownItem>
                  </Dropdown>
                </div>
              </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b border-theme bg-theme-chat-header">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-theme-primary">{currentChatData?.title || 'New Chat'}</h2>
                    <p className="text-sm text-theme-secondary">
                      {currentChatData?.messages.length || 0} messages
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowModelSelector(true)}
                      className="flex items-center gap-2"
                    >
                      <span className="text-xs">{getModelName(selectedModel)}</span>
                      <ChevronDown size={14} />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {currentChatData?.messages.map(message => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] p-4 rounded-lg message-enter ${
                        message.role === 'user'
                          ? 'bg-theme-chat-user text-theme-button-primary'
                          : 'bg-theme-chat-assistant border border-theme'
                      }`}
                    >
                      {message.role === 'user' ? (
                        <p className="text-sm">{message.content}</p>
                      ) : (
                        <MarkdownRenderer content={message.content} />
                      )}
                      <p className="text-xs opacity-70 mt-2 flex items-center gap-2">
                        <span>{message.timestamp instanceof Date ? message.timestamp.toLocaleTimeString() : new Date(message.timestamp).toLocaleTimeString()}</span>
                        {message.role === 'assistant' && message.metadata?.model && (
                          <span className="text-theme-secondary">
                            • Generated by {getModelName(message.metadata.model)}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                ))}
                
                {/* Show typing indicator when streaming */}
                {isStreaming && (
                  <div className="flex justify-start">
                    <div className="max-w-[70%] p-4 rounded-lg bg-theme-chat-assistant border border-theme">
                      <div className="flex items-center gap-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-theme-accent rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-theme-accent rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-theme-accent rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                        <span className="text-sm text-theme-secondary">AI is typing...</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Show continue prompt if token limit reached */}
                {showContinuePrompt && continueMessageId && (
                  <div className="bg-theme-button-secondary border border-theme text-theme-accent px-4 py-3 rounded-lg text-sm">
                    The {getModelName(currentChatData?.settings.model || 'AI')} reached its response token limit. Would you like to{' '}
                    <button
                      onClick={() => continueMessage(user?.id || '')}
                      className="underline hover:no-underline font-medium text-theme-link"
                      disabled={isStreaming}
                    >
                      continue
                    </button>
                    ?
                  </div>
                )}

                {/* Show error if any */}
                {error && (
                  <div className="bg-theme-button-secondary border border-theme text-theme-error px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-theme bg-theme-chat-header">
                <div className="flex gap-2">
                  <div className="flex items-center gap-2">
                    <div className="relative group">
                      <Button variant="ghost" size="icon" className="h-12 w-12">
                        <Info size={18} />
                      </Button>
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-theme-modal border border-theme-modal rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                        <div className="text-xs text-theme-primary">
                          <div>Total tokens used: {totalTokensUsed.toLocaleString()}</div>
                          <div>Current input: {currentMessageTokens} tokens</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                    placeholder="Type your message..."
                    className="flex-1 p-3 rounded-lg bg-theme-chat-input border border-theme-chat-input text-theme-input focus:outline-none focus:ring-2 focus:ring-theme-accent"
                    disabled={isStreaming}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!currentMessage.trim() || isStreaming}
                    size="icon"
                    className="h-12 w-12 bg-theme-button-primary text-theme-button-primary hover:opacity-90"
                  >
                    <Send size={18} />
                  </Button>
                </div>
                <p className="text-xs text-theme-secondary mt-2 text-center">
                  T66 can make mistakes. Consider checking important information.
                </p>
              </div>
            </div>
          </div>

          {/* Modals */}
          <SettingsModal
            isOpen={showSettings}
            onClose={() => setShowSettings(false)}
            user={user}
            onUserUpdate={(updatedUser) => {
              setAuthUser(updatedUser)
              setUser(updatedUser)
              setThemeUser(updatedUser)
            }}
          />

          <ModelSelectorModal
            isOpen={showModelSelector}
            onClose={() => setShowModelSelector(false)}
            selectedModel={selectedModel}
            onModelSelect={setSelectedModel}
          />
        </div>
      </ProtectedRoute>
    </Router>
  )
}

export default App
