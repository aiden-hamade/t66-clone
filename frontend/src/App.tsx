import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import t66_logo from './assets/t66-chat-logo.svg'
import { MessageSquare, Settings, User, Plus, MoreVertical, Trash2, ChevronDown, Edit2, LogOut, Info, Copy, GitBranch, Folder, FolderPlus, ChevronRight, Share2, Paperclip, X, FileText, Globe, Mic, Volume2, Edit3 } from 'lucide-react'
import './App.css'

// Components
import { Button } from './components/ui/Button'
import { ThinkingIndicator } from './components/ui/ThinkingIndicator'
import { Dropdown, DropdownItem } from './components/ui/Dropdown'
import { MarkdownRenderer } from './components/ui/MarkdownRenderer'
import { SettingsModal } from './components/settings/SettingsModal'
import { ModelSelectorModal } from './components/settings/ModelSelectorModal'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { SharedChatView } from './components/chat/SharedChatView'
import { VoiceModeButton, type InputMode } from './components/ui/VoiceModeButton'
import { ShareModal } from './components/ui/ShareModal'
import { EditMessageModal } from './components/ui/EditMessageModal'

// Stores
import { useAuthStore } from './stores/authStore'
import { useChatStore } from './stores/chatStore'
import { useThemeStore } from './stores/themeStore'
import systemPromptTemplate from './assets/system_prompt.txt?raw'

// Utils
import { estimateTokenCount } from './lib/openrouter'
import { isVoiceModeSupported } from './lib/openai'

// Types
import type { ChatSettings } from './types'

function App() {
  const [selectedModel, setSelectedModel] = useState('anthropic/claude-3.5-sonnet')
  const [showSettings, setShowSettings] = useState(false)
  const [showModelSelector, setShowModelSelector] = useState(false)
  const [renamingChat, setRenamingChat] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [creatingFolder, setCreatingFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [attachments, setAttachments] = useState<File[]>([])
  const [systemPrompt, setSystemPrompt] = useState('')
  const [webSearchEnabled, setWebSearchEnabled] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingMessage, setEditingMessage] = useState<{id: string, content: string, model: string} | null>(null)
  const [shareUrl, setShareUrl] = useState('')

  // Auth store
  const { user, signOut: authSignOut, setUser: setAuthUser } = useAuthStore()
  
  // Theme store
  const { initializeTheme, setUser: setThemeUser } = useThemeStore()

  // Chat store
  const {
    chats,
    folders,
    activeChat,
    currentMessage,
    isStreaming,
    isSearching,
    isThinking,
    thinkingSummary,
    error,
    showContinuePrompt,
    continueMessageId,
    inputMode,
    isRecording,
    isTranscribing,
    isSynthesizing,
    isPlayingAudio,
    autoPlayResponses,
    setActiveChat,
    setCurrentMessage,
    setUser,
    loadUserChats,
    loadUserFolders,
    createNewChat,
    createNewFolder,
    deleteChatFolder,
    toggleFolderExpanded,
    moveChatToFolderAction,
    splitChat,
    updateChatTitle,
    deleteChat,
    sendMessage,
    continueMessage,
    clearError,
    getChatById,
    stopStreaming,
    setInputMode,
    startRecording,
    stopRecordingAndTranscribe,
    synthesizeAndPlayResponse,
    cleanupAudioRecorder,
    editMessage,
    regenerateFromMessage
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

  useEffect(() => {
    const date = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    const newPrompt = systemPromptTemplate
      .replace('{current_date}', date)
      .replace('{selectedModel}', selectedModel)
    setSystemPrompt(newPrompt)
  }, [selectedModel])

  // Load user chats and folders when user changes and sync user to chat store and theme store
  useEffect(() => {
    setUser(user) // Sync user to chat store
    setThemeUser(user) // Sync user to theme store
    if (user?.id) {
      loadUserChats(user.id)
      loadUserFolders(user.id)
    }
  }, [user, setUser, setThemeUser, loadUserChats, loadUserFolders])

  // Cleanup audio recorder on unmount
  useEffect(() => {
    return () => {
      cleanupAudioRecorder()
    }
  }, [cleanupAudioRecorder])

  // Auto-switch to text mode if current model doesn't support voice mode
  useEffect(() => {
    if (inputMode === 'voice' && !isVoiceModeSupported(selectedModel)) {
      console.log(`Model ${selectedModel} does not support voice mode, switching to text mode`)
      setInputMode('text')
    }
  }, [selectedModel, inputMode, setInputMode])

  // Auto-play responses when enabled and in voice mode
  useEffect(() => {
    if (autoPlayResponses && inputMode === 'voice' && currentChatData?.messages) {
      const lastMessage = currentChatData.messages[currentChatData.messages.length - 1]
      if (lastMessage?.role === 'assistant' && lastMessage.content && !isStreaming && !isSynthesizing && !isPlayingAudio) {
        synthesizeAndPlayResponse(lastMessage.content)
      }
    }
  }, [autoPlayResponses, inputMode, currentChatData?.messages, isStreaming, isSynthesizing, isPlayingAudio, synthesizeAndPlayResponse])

  const handleSendMessage = async () => {
    if ((!currentMessage.trim() && attachments.length === 0) || !user?.id || isStreaming) return

    try {
      clearError()
      
      // Create new chat if none exists
      if (!activeChat) {
        const defaultSettings: ChatSettings = {
          model: selectedModel,
          temperature: 0.7,
          maxTokens: 4000,
          provider: 'openrouter',
          systemMessage: systemPrompt,
        }
        
        await createNewChat(user.id, 'New Chat', defaultSettings)
      }
      
      // Convert attachments to base64
      const processedAttachments = await Promise.all(
        attachments.map(async (file) => {
          const base64 = await convertFileToBase64(file)
          return {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            filename: file.name,
            size: file.size,
            type: file.type,
            url: base64,
            createdAt: new Date()
          }
        })
      )
      
      // Clear attachments before sending to prevent them from being sent again
      setAttachments([])
      
      await sendMessage(user.id, currentMessage, true, processedAttachments, webSearchEnabled, selectedModel, systemPrompt)
    } catch (error) {
      console.error('Error sending message:', error)
      // Don't clear attachments on error so user can retry
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

  const handleCreateFolder = async () => {
    if (!user?.id || !newFolderName.trim()) return
    
    try {
      await createNewFolder(user.id, newFolderName.trim())
      setCreatingFolder(false)
      setNewFolderName('')
    } catch (error) {
      console.error('Error creating folder:', error)
    }
  }

  const handleDeleteFolder = async (folderId: string) => {
    try {
      await deleteChatFolder(folderId)
    } catch (error) {
      console.error('Error deleting folder:', error)
    }
  }

  const handleToggleFolder = async (folderId: string) => {
    try {
      await toggleFolderExpanded(folderId)
    } catch (error) {
      console.error('Error toggling folder:', error)
    }
  }

  const handleMoveChatToFolder = async (chatId: string, folderId: string | null) => {
    try {
      await moveChatToFolderAction(chatId, folderId)
    } catch (error) {
      console.error('Error moving chat to folder:', error)
    }
  }

  const handleDragStart = (e: React.DragEvent, chatId: string) => {
    e.dataTransfer.setData('text/plain', chatId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = async (e: React.DragEvent, folderId: string | null) => {
    e.preventDefault()
    const chatId = e.dataTransfer.getData('text/plain')
    if (chatId) {
      await handleMoveChatToFolder(chatId, folderId)
    }
  }

  const getModelName = (modelId: string) => {
    const modelNames: Record<string, string> = {
      'google/gemini-2.5-pro-preview': 'Gemini 2.5 Pro',
      'deepseek/deepseek-r1-0528': 'DeepSeek R1',
      'anthropic/claude-sonnet-4': 'Claude Sonnet 4',
      'anthropic/claude-3.5-sonnet': 'Claude 3.5 Sonnet',
      'openai/gpt-4o': 'GPT-4o',
      'openai/gpt-4.1-nano': 'GPT-4.1 Nano',
    }
    return modelNames[modelId] || modelId
  }

  const handleShareChat = async () => {
    if (!currentChatData || !user?.id) return
    
    try {
      const { shareChat } = await import('./lib/firestore')
      const shareId = await shareChat(currentChatData.id)
      const shareUrl = `${window.location.origin}/chats?${shareId}`
      
      setShareUrl(shareUrl)
      setShowShareModal(true)
    } catch (error) {
      console.error('Error sharing chat:', error)
      alert('Failed to create share link')
    }
  }

  const validateAndAddFiles = (files: File[]) => {
    const validFiles = files.filter(file => {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
      const maxSize = 10 * 1024 * 1024 // 10MB
      return validTypes.includes(file.type) && file.size <= maxSize
    })
    
    if (validFiles.length !== files.length) {
      alert('Some files were skipped. Only images (JPG, PNG, GIF, WebP) and PDFs under 10MB are supported.')
    }
    
    setAttachments(prev => [...prev, ...validFiles])
    return validFiles
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    validateAndAddFiles(files)
    // Clear the input
    event.target.value = ''
  }

  const handlePaste = (event: React.ClipboardEvent) => {
    const items = Array.from(event.clipboardData.items)
    const files: File[] = []
    
    items.forEach(item => {
      if (item.kind === 'file') {
        const file = item.getAsFile()
        if (file) {
          files.push(file)
        }
      }
    })
    
    if (files.length > 0) {
      event.preventDefault()
      validateAndAddFiles(files)
    }
  }

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  // Voice mode handlers
  const handleModeChange = (mode: InputMode) => {
    // Check if voice mode is supported for current model
    if (mode === 'voice' && !isVoiceModeSupported(selectedModel)) {
      alert(`Voice mode is not supported for ${getModelName(selectedModel)}. Please select a non-reasoning model to use voice mode.`)
      return
    }
    
    setInputMode(mode)
    
    // Auto-start recording when switching to voice mode
    if (mode === 'voice') {
      console.log('🎤 Auto-starting recording in voice mode...')
      setTimeout(() => {
        console.log('🎤 Triggering auto-start recording')
        handleStartRecording()
      }, 200) // Small delay to ensure mode change is processed
    }
  }

  const handleStartRecording = async () => {
    console.log('🎤 handleStartRecording called')
    if (!user?.openaiApiKey) {
      alert('OpenAI API key is required for voice mode. Please add your key in Settings.')
      return
    }
    
    try {
      console.log('🎤 Calling startRecording from chat store')
      await startRecording()
      console.log('🎤 startRecording completed')
    } catch (error) {
      console.error('Error starting recording:', error)
    }
  }

  const handleStopRecording = async () => {
    try {
      await stopRecordingAndTranscribe()
    } catch (error) {
      console.error('Error stopping recording:', error)
    }
  }

  const handleEditMessage = (messageId: string, content: string, model: string) => {
    setEditingMessage({ id: messageId, content, model })
    setShowEditModal(true)
  }

  const handleSaveEditedMessage = async (newContent: string, newModel: string) => {
    if (!editingMessage) return
    
    try {
      await editMessage(editingMessage.id, newContent, newModel)
      setShowEditModal(false)
      setEditingMessage(null)
    } catch (error) {
      console.error('Error saving edited message:', error)
    }
  }

  const handleRegenerateMessage = async (newContent: string, newModel: string) => {
    if (!editingMessage) return
    
    try {
      await regenerateFromMessage(editingMessage.id, newContent, newModel)
      setShowEditModal(false)
      setEditingMessage(null)
    } catch (error) {
      console.error('Error regenerating message:', error)
    }
  }



  return (
    <Router>
      <Routes>
        <Route path="/chats" element={<SharedChatView />} />
        <Route path="/*" element={
      <ProtectedRoute>
        <div className="min-h-screen bg-theme-background">
          <div className="flex h-screen bg-theme-background text-theme-primary">
                          {/* Sidebar */}
              <div className="w-64 bg-theme-surface border-r border-theme flex flex-col">
                              {/* Header */}
              <div className="p-3 border-b border-theme">
                <div className="flex flex-col items-center">
                  <img
                    src={t66_logo}
                    className="h-8 w-auto mb-1"
                  />
                  <p className="text-xs text-theme-secondary text-center">A T3 Chat Clone</p>
                  </div>
              </div>

              {/* New Chat Button */}
              <div className="p-3">
                <Button
                  onClick={handleCreateNewChat}
                  className="w-full flex items-center gap-2 text-sm py-2"
                >
                  <Plus size={16} />
                  New Chat
                </Button>
              </div>

              {/* Chat List */}
              <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-1">
                {/* Create Folder Button */}
                <div className="mb-2">
                  {creatingFolder ? (
                    <div className="flex items-center gap-2 p-2 bg-theme-surface rounded-md border border-theme">
                      <FolderPlus size={14} className="text-theme-secondary" />
                      <input
                        type="text"
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleCreateFolder()
                          } else if (e.key === 'Escape') {
                            setCreatingFolder(false)
                            setNewFolderName('')
                          }
                        }}
                        onBlur={() => {
                          if (newFolderName.trim()) {
                            handleCreateFolder()
                          } else {
                            setCreatingFolder(false)
                          }
                        }}
                        placeholder="Folder name..."
                        className="flex-1 px-2 py-1 text-xs bg-theme-input border border-theme-input text-theme-input rounded focus:outline-none focus:ring-1 focus:ring-theme-accent"
                        autoFocus
                      />
                    </div>
                  ) : (
                    <button
                      onClick={() => setCreatingFolder(true)}
                      className="w-full flex items-center gap-2 p-2 text-xs text-theme-secondary hover:text-theme-primary hover:bg-theme-hover-surface rounded-md transition-colors"
                    >
                      <FolderPlus size={14} />
                      Create Folder
                    </button>
                  )}
                </div>

                {/* Folders */}
                {folders.map(folder => {
                  const folderChats = chats.filter(chat => chat.folderId === folder.id)
                  return (
                    <div key={folder.id} className="mb-2">
                      {/* Folder Header */}
                      <div 
                        className="flex items-center gap-1 p-2 hover:bg-theme-hover-surface rounded-md group transition-colors border-2 border-transparent hover:border-theme-accent/20"
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, folder.id)}
                      >
                        <button
                          onClick={() => handleToggleFolder(folder.id)}
                          className="flex items-center gap-1 flex-1 text-left"
                        >
                          <ChevronRight 
                            size={12} 
                            className={`text-theme-secondary transition-transform ${folder.isExpanded ? 'rotate-90' : ''}`} 
                          />
                          <Folder size={14} className="text-theme-secondary" />
                          <span className="text-xs font-medium text-theme-primary truncate">
                            {folder.name}
                          </span>
                          <span className="text-xs text-theme-secondary opacity-75">
                            ({folderChats.length})
                          </span>
                        </button>
                        
                        {/* Folder Menu */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <Dropdown
                            trigger={
                              <Button variant="ghost" size="icon" className="h-5 w-5 hover:bg-theme-hover-surface">
                                <MoreVertical size={10} />
                              </Button>
                            }
                          >
                            <DropdownItem onClick={() => handleDeleteFolder(folder.id)} variant="destructive">
                              <div className="flex items-center gap-2">
                                <Trash2 size={12} />
                                <span className="text-xs">Delete Folder</span>
                              </div>
                            </DropdownItem>
                          </Dropdown>
                        </div>
                      </div>

                      {/* Folder Chats */}
                      {folder.isExpanded && (
                        <div className="ml-4 space-y-1">
                          {folderChats.map(chat => (
                  <div
                    key={chat.id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, chat.id)}
                              className={`group relative flex items-center p-2 rounded-md transition-all duration-200 cursor-move ${
                      activeChat === chat.id 
                                  ? 'bg-theme-sidebar-active text-theme-primary shadow-sm' 
                        : 'hover:bg-theme-sidebar-hover'
                    }`}
                  >
                    {renamingChat === chat.id ? (
                      <div className="flex-1 flex items-center gap-2">
                                  {chat.isSplit ? (
                                    <GitBranch size={14} className="text-theme-secondary flex-shrink-0" />
                                  ) : (
                                    <MessageSquare size={14} className="text-theme-secondary flex-shrink-0" />
                                  )}
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
                                    className="flex-1 px-2 py-1 text-xs bg-theme-input border border-theme-input text-theme-input rounded focus:outline-none focus:ring-1 focus:ring-theme-accent"
                          autoFocus
                        />
                      </div>
                    ) : (
                      <button
                        onClick={() => setActiveChat(chat.id)}
                                  className="flex-1 text-left min-w-0 flex items-start gap-2"
                                >
                                  {chat.isSplit ? (
                                    <GitBranch size={14} className="text-theme-secondary flex-shrink-0 mt-0.5" />
                                  ) : (
                                    <MessageSquare size={14} className="text-theme-secondary flex-shrink-0 mt-0.5" />
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <div className="text-xs font-medium text-theme-primary truncate leading-tight">
                                      {chat.title}
                                    </div>
                                    <div className="text-xs text-theme-secondary mt-0.5 opacity-75">
                                      {chat.messages.length} message{chat.messages.length !== 1 ? 's' : ''}
                                    </div>
                                  </div>
                                </button>
                              )}
                              
                              {/* Chat Menu */}
                              {renamingChat !== chat.id && (
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity ml-1">
                                  <Dropdown
                                    trigger={
                                      <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-theme-hover-surface">
                                        <MoreVertical size={12} />
                                      </Button>
                                    }
                                  >
                                    <DropdownItem onClick={() => startRenaming(chat.id)}>
                                      <div className="flex items-center gap-2">
                                        <Edit2 size={12} />
                                        <span className="text-xs">Rename</span>
                                      </div>
                                    </DropdownItem>
                                    <DropdownItem onClick={() => handleSplitChat(chat.id)}>
                                      <div className="flex items-center gap-2">
                                        <Copy size={12} />
                                        <span className="text-xs">Split Chat</span>
                                      </div>
                                    </DropdownItem>
                                    <DropdownItem 
                                      onClick={() => handleDeleteChat(chat.id)}
                                      variant="destructive"
                      >
                        <div className="flex items-center gap-2">
                                        <Trash2 size={12} />
                                        <span className="text-xs">Delete</span>
                                      </div>
                                    </DropdownItem>
                                  </Dropdown>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}

                {/* Unfiled Chats Drop Zone */}
                <div 
                  className="mb-2 p-2 rounded-md border-2 border-dashed border-transparent hover:border-theme-accent/30 transition-colors"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, null)}
                >
                                     <div className="text-xs text-theme-secondary opacity-75 mb-1">All Chats</div>
                  
                  {/* Unfiled Chats */}
                  {chats.filter(chat => !chat.folderId).map(chat => (
                    <div
                      key={chat.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, chat.id)}
                      className={`group relative flex items-center p-2 rounded-md transition-all duration-200 cursor-move ${
                        activeChat === chat.id 
                          ? 'bg-theme-sidebar-active text-theme-primary shadow-sm' 
                          : 'hover:bg-theme-sidebar-hover'
                      }`}
                    >
                      {renamingChat === chat.id ? (
                        <div className="flex-1 flex items-center gap-2">
                          {chat.isSplit ? (
                            <GitBranch size={14} className="text-theme-secondary flex-shrink-0" />
                          ) : (
                            <MessageSquare size={14} className="text-theme-secondary flex-shrink-0" />
                          )}
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
                            className="flex-1 px-2 py-1 text-xs bg-theme-input border border-theme-input text-theme-input rounded focus:outline-none focus:ring-1 focus:ring-theme-accent"
                            autoFocus
                          />
                        </div>
                      ) : (
                        <button
                          onClick={() => setActiveChat(chat.id)}
                          className="flex-1 text-left min-w-0 flex items-start gap-2"
                        >
                          {chat.isSplit ? (
                            <GitBranch size={14} className="text-theme-secondary flex-shrink-0 mt-0.5" />
                          ) : (
                            <MessageSquare size={14} className="text-theme-secondary flex-shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium text-theme-primary truncate leading-tight">
                              {chat.title}
                            </div>
                            <div className="text-xs text-theme-secondary mt-0.5 opacity-75">
                              {chat.messages.length} message{chat.messages.length !== 1 ? 's' : ''}
                            </div>
                          </div>
                      </button>
                    )}
                    
                      {/* Chat Menu */}
                    {renamingChat !== chat.id && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity ml-1">
                        <Dropdown
                          trigger={
                              <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-theme-hover-surface">
                                <MoreVertical size={12} />
                            </Button>
                          }
                        >
                          <DropdownItem onClick={() => startRenaming(chat.id)}>
                            <div className="flex items-center gap-2">
                                <Edit2 size={12} />
                                <span className="text-xs">Rename</span>
                            </div>
                          </DropdownItem>
                          <DropdownItem onClick={() => handleSplitChat(chat.id)}>
                            <div className="flex items-center gap-2">
                                <Copy size={12} />
                                <span className="text-xs">Split Chat</span>
                            </div>
                          </DropdownItem>
                          <DropdownItem 
                            onClick={() => handleDeleteChat(chat.id)}
                            variant="destructive"
                          >
                            <div className="flex items-center gap-2">
                                <Trash2 size={12} />
                                <span className="text-xs">Delete</span>
                            </div>
                          </DropdownItem>
                        </Dropdown>
                      </div>
                    )}
                  </div>
                ))}
                </div>
              </div>

              {/* User Section */}
              <div className="p-3 border-t border-theme">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-theme-button-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <User size={14} className="text-theme-button-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-theme-primary truncate">{user?.name || 'User'}</p>
                    <p className="text-xs text-theme-secondary truncate opacity-75">{user?.email || 'No email'}</p>
                  </div>
                  <Dropdown
                    trigger={
                      <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-theme-hover-surface flex-shrink-0">
                        <Settings size={14} />
                      </Button>
                    }
                    forceTop={true}
                  >
                    <DropdownItem onClick={() => setShowSettings(true)}>
                      <div className="flex items-center gap-2">
                        <Settings size={12} />
                        <span className="text-xs">Settings</span>
                      </div>
                    </DropdownItem>
                    <DropdownItem onClick={handleSignOut} variant="destructive">
                      <div className="flex items-center gap-2">
                        <LogOut size={12} />
                        <span className="text-xs">Sign Out</span>
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
                    {currentChatData && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleShareChat}
                        className="flex items-center gap-2"
                      >
                        <Share2 size={14} />
                        <span className="text-xs">Share</span>
                      </Button>
                    )}
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

              {/* Status Indicators - Above Chat */}
              {(isSearching && webSearchEnabled) || isTranscribing || isSynthesizing ? (
                <div className="bg-theme-surface/95 backdrop-blur-sm border-b border-theme py-3 px-4">
                  <div className="flex items-center justify-center">
                    <div className="flex items-center gap-3">
                      {/* Web Search Indicator */}
                      {isSearching && webSearchEnabled && (
                        <>
                          <div className="relative">
                            <div className="w-6 h-6 border-2 border-theme-accent/30 border-t-theme-accent rounded-full animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Globe size={12} className="text-theme-accent animate-pulse" />
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-theme-accent">Searching Web</span>
                            <div className="flex space-x-1">
                              <div className="w-1 h-1 bg-theme-accent rounded-full animate-bounce"></div>
                              <div className="w-1 h-1 bg-theme-accent rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                              <div className="w-1 h-1 bg-theme-accent rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                            </div>
                          </div>
                        </>
                      )}
                      
                      {/* Transcription Indicator */}
                      {isTranscribing && (
                        <>
                          <div className="relative">
                            <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Mic size={12} className="text-blue-500 animate-pulse" />
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-blue-500">Transcribing Audio</span>
                            <div className="flex space-x-1">
                              <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"></div>
                              <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                              <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                            </div>
                          </div>
                        </>
                      )}
                      
                      {/* Speech Synthesis Indicator */}
                      {isSynthesizing && (
                        <>
                          <div className="relative">
                            <div className="w-6 h-6 border-2 border-green-500/30 border-t-green-500 rounded-full animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Volume2 size={12} className="text-green-500 animate-pulse" />
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-green-500">Generating Speech</span>
                            <div className="flex space-x-1">
                              <div className="w-1 h-1 bg-green-500 rounded-full animate-bounce"></div>
                              <div className="w-1 h-1 bg-green-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                              <div className="w-1 h-1 bg-green-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {currentChatData?.messages.map(message => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} group`}
                  >
                    <div
                      className={`max-w-[70%] p-4 rounded-lg message-enter relative ${
                        message.role === 'user'
                          ? 'bg-theme-chat-user text-theme-button-primary'
                          : 'bg-theme-chat-assistant border border-theme'
                      }`}
                    >
                      {/* Message Content */}
                      {message.role === 'user' ? (
                        <div>
                          {message.content && <p className="text-sm">{message.content}</p>}
                          {/* Display attachments */}
                          {message.attachments && message.attachments.length > 0 && (
                            <div className="mt-2 space-y-2">
                              {message.attachments.map((attachment, index) => (
                                <div key={index} className="border border-theme-modal rounded-lg overflow-hidden">
                                  {attachment.type.startsWith('image/') ? (
                                    <img 
                                      src={attachment.url} 
                                      alt={attachment.filename}
                                      className="max-w-full h-auto max-h-64 object-contain"
                                    />
                                  ) : (
                                    <div className="p-3 flex items-center gap-2 bg-theme-surface">
                                      <FileText size={20} className="text-theme-secondary" />
                                      <div>
                                        <p className="text-sm font-medium text-theme-primary">{attachment.filename}</p>
                                        <p className="text-xs text-theme-secondary">
                                          {(attachment.size / 1024 / 1024).toFixed(2)} MB
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <MarkdownRenderer content={message.content} />
                      )}

                      <p className="text-xs mt-2 flex items-center gap-2">
                        <span className="text-theme-secondary">{message.timestamp instanceof Date ? message.timestamp.toLocaleTimeString() : new Date(message.timestamp).toLocaleTimeString()}</span>
                        {message.role === 'assistant' && message.metadata?.model && (
                          <span className="text-theme-secondary">
                            • Generated by {getModelName(message.metadata.model)}
                          </span>
                        )}
                        {message.role === 'assistant' && message.metadata?.webSearchUsed && (
                          <span className="relative group inline-block ml-1">
                            {/* Larger hover area with padding */}
                            <span className="text-theme-secondary hover:text-theme-accent transition-colors cursor-pointer underline decoration-dotted px-1 py-1">
                              • Used Web Search
                            </span>
                            {/* Invisible bridge to prevent tooltip from disappearing */}
                            <div className="absolute bottom-0 left-0 w-full h-4 pointer-events-none group-hover:pointer-events-auto"></div>
                            {/* Tooltip */}
                            <div className="absolute bottom-full left-0 mb-1 px-3 py-2 bg-theme-modal border border-theme-modal rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none group-hover:pointer-events-auto z-[9999] min-w-max max-w-xs">
                              <div className="text-xs text-theme-primary">
                                <div className="font-medium mb-2">🌐 Web Search Sources</div>
                                {message.metadata?.webSearchResults && message.metadata.webSearchResults.length > 0 ? (
                                  <div className="space-y-1 max-h-32 overflow-y-auto">
                                    {message.metadata.webSearchResults.map((result, index) => (
                                      <div key={index} className="text-left">
                                        <a 
                                          href={result.url} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className="text-theme-accent hover:underline block truncate"
                                        >
                                          {result.title || new URL(result.url).hostname}
                                        </a>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-theme-secondary">
                                    No sources available
                                  </div>
                                )}
                              </div>
                            </div>
                          </span>
                        )}
                      </p>
                    </div>
                    
                    {/* Edit button below user messages */}
                    {message.role === 'user' && (
                      <div className="flex justify-end mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-theme-secondary hover:text-theme-primary hover:bg-theme-hover-surface"
                          onClick={() => handleEditMessage(message.id, message.content, message.metadata?.model || selectedModel)}
                        >
                          <Edit3 size={12} />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Thinking Indicator as a message */}
                {isThinking && (
                  <div className="flex justify-start">
                    <div className="max-w-[70%]">
                      <ThinkingIndicator 
                        isThinking={isThinking} 
                        thinkingSummary={thinkingSummary}
                        className="mb-0"
                      />
                    </div>
                  </div>
                )}

                {/* Show continue prompt if token limit reached */}
                {showContinuePrompt && continueMessageId && (
                  <div className="bg-theme-button-secondary border border-theme text-theme-accent px-4 py-3 rounded-lg text-sm">
                    The {getModelName(currentChatData?.settings.model || 'AI')} reached its response token limit. Would you like to{' '}
                    <button
                      onClick={() => continueMessage()}
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
                {/* Attachment Preview */}
                {attachments.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {attachments.map((file, index) => (
                      <div key={index} className="relative bg-theme-surface border border-theme rounded-lg overflow-hidden">
                        {file.type.startsWith('image/') ? (
                          <div className="relative">
                            <img 
                              src={URL.createObjectURL(file)} 
                              alt={file.name}
                              className="w-20 h-20 object-cover"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button
                                onClick={() => removeAttachment(index)}
                                className="text-white hover:text-red-400 transition-colors"
                              >
                                <X size={16} />
                              </button>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 truncate">
                              {file.name}
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 p-2 w-32">
                            <FileText size={16} className="text-theme-secondary" />
                            <div className="flex-1 min-w-0">
                              <span className="text-xs text-theme-primary truncate block">
                                {file.name}
                              </span>
                              <span className="text-xs text-theme-secondary">
                                {(file.size / 1024 / 1024).toFixed(1)}MB
                              </span>
                            </div>
                            <button
                              onClick={() => removeAttachment(index)}
                              className="text-theme-secondary hover:text-theme-error transition-colors"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="flex gap-2">
                  <div className="flex items-center gap-2">
                    <div className="relative group">
                      <Button variant="ghost" size="icon" className="h-12 w-12">
                        <Info size={18} />
                      </Button>
                      {/* Larger invisible hover area */}
                      <div className="absolute bottom-0 left-0 w-full h-full -mb-4 -ml-2 -mr-2 group-hover:pointer-events-auto pointer-events-none"></div>
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 
                bg-black border border-theme-border rounded-lg shadow-lg shadow-black/20 
                hidden group-hover:block transition-all duration-200 pointer-events-none 
                whitespace-nowrap z-[999]">
                        <div className="text-xs text-theme-primary">
                          <div className="font-medium mb-1">📊 Token Usage</div>
                          <div className="text-theme-secondary mb-1">Total tokens used: <span className="text-theme-primary font-medium">{totalTokensUsed.toLocaleString()}</span></div>
                          <div className="text-theme-secondary">Current input: <span className="text-theme-primary font-medium">{currentMessageTokens} tokens</span></div>
                          {currentChatData?.isSplit && currentChatData?.splitFromChatId && (
                            <>
                              <div className="border-t border-theme-modal mt-2 pt-2">
                                <div className="font-medium mb-1">🌿 Split Chat Info</div>
                                <div className="text-theme-secondary mb-2">
                                  Split from: <span className="text-theme-primary font-medium">{getChatById(currentChatData.splitFromChatId)?.title || 'Unknown'}</span>
                                </div>
                                <button 
                                  className="w-full text-left px-2 py-1 text-theme-accent hover:bg-theme-hover-surface rounded transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveChat(currentChatData.splitFromChatId!);
                                  }}
                                >
                                  → Go to original chat
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* File Attachment Button */}
                    <div className="relative">
                      <input
                        type="file"
                        id="file-input"
                        multiple
                        accept="image/*,.pdf"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-12 w-12"
                        onClick={() => document.getElementById('file-input')?.click()}
                        disabled={isStreaming}
                      >
                        <Paperclip size={18} />
                      </Button>
                    </div>
                    
                    {/* Web Search Toggle Button */}
                    <div className="relative group">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className={`h-12 w-12 transition-colors ${
                          webSearchEnabled 
                            ? 'bg-theme-accent text-theme-button-primary' 
                            : 'text-theme-secondary hover:text-theme-primary'
                        }`}
                        onClick={() => setWebSearchEnabled(!webSearchEnabled)}
                        disabled={isStreaming}
                      >
                        <Globe size={18} />
                      </Button>
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 
                bg-black border border-theme-border rounded-lg shadow-lg shadow-black/20 
                hidden group-hover:block transition-all duration-200 pointer-events-none 
                whitespace-nowrap z-[999]">
                        <div className="text-xs text-theme-primary">
                          {webSearchEnabled ? '🌐 Web search enabled' : '🌐 Enable web search'}
                        </div>
                        <div className="text-theme-secondary text-xs mt-1">
                          {webSearchEnabled ? 'AI will search the web for current information' : 'Click to enable real-time web search'}
                        </div>
                      </div>
                    </div>
                  </div>
                  <textarea
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                    onPaste={handlePaste}
                    placeholder="Type your message or paste images/PDFs..."
                    className="flex-1 p-3 rounded-lg bg-theme-chat-input border border-theme-chat-input text-theme-input focus:outline-none focus:ring-2 focus:ring-theme-accent resize-none min-h-[48px] max-h-32"
                    disabled={isStreaming || (inputMode === 'voice' && (isRecording || isTranscribing))}
                    rows={1}
                    style={{
                      height: 'auto',
                      minHeight: '48px'
                    }}
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement
                      target.style.height = 'auto'
                      target.style.height = Math.min(target.scrollHeight, 128) + 'px'
                    }}
                  />
                  <VoiceModeButton
                    mode={inputMode}
                    onModeChange={handleModeChange}
                    onSend={handleSendMessage}
                    onStartRecording={handleStartRecording}
                    onStopRecording={handleStopRecording}
                    isRecording={isRecording}
                    isDisabled={isStreaming || isTranscribing || isSynthesizing}
                    canSendMessage={!!(currentMessage.trim() || attachments.length > 0)}
                  />
                </div>
                {isStreaming && (
                  <div className="mt-2 text-center">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={stopStreaming}
                      className="gap-2"
                    >
                      <div className="w-4 h-4 border-2 rounded-sm border-current"></div>
                      Stop Generating
                    </Button>
                  </div>
                )}
                
                
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

          {/* Share Modal */}
          <ShareModal
            isOpen={showShareModal}
            onClose={() => setShowShareModal(false)}
            shareUrl={shareUrl}
            title="Share Chat"
            description="Share this conversation with others. They'll be able to view the chat but not edit it."
          />

          {/* Edit Message Modal */}
          <EditMessageModal
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false)
              setEditingMessage(null)
            }}
            originalMessage={editingMessage?.content || ''}
            currentModel={editingMessage?.model || selectedModel}
            onSave={handleSaveEditedMessage}
            onRegenerate={handleRegenerateMessage}
          />
        </div>
      </ProtectedRoute>
        } />
      </Routes>
    </Router>
  )
}

export default App
