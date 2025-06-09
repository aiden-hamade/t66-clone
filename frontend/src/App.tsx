import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Send, MessageSquare, Settings, User, Moon, Sun, Plus, MoreVertical, Trash2, ChevronDown } from 'lucide-react'
import './App.css'

// Components
import { Button } from './components/ui/Button'
import { Modal } from './components/ui/Modal'
import { Dropdown, DropdownItem } from './components/ui/Dropdown'
import { MarkdownRenderer } from './components/ui/MarkdownRenderer'
import { SettingsModal } from './components/settings/SettingsModal'
import { ModelSelectorModal } from './components/settings/ModelSelectorModal'

// Types
interface Message {
  id: string
  content: string
  role: 'user' | 'assistant' | 'system'
  timestamp: Date
}

interface Chat {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
}

function App() {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('dark')
  const [currentMessage, setCurrentMessage] = useState('')
  const [selectedModel, setSelectedModel] = useState('gpt-4o')
  const [chats, setChats] = useState<Chat[]>([
    {
      id: '1',
      title: 'Welcome to T66',
      messages: [
        {
          id: '1',
          content: 'Hello! Welcome to **T66**, your open-source AI chat application. I can help you with:\n\n- **Markdown formatting** with code blocks\n- Mathematical equations\n- Programming questions\n- General conversations\n\nHere\'s some code:\n\n```typescript\nfunction greet(name: string): string {\n  return `Hello, ${name}!`;\n}\n```\n\nHow can I help you today?',
          role: 'assistant',
          timestamp: new Date()
        }
      ],
      createdAt: new Date()
    }
  ])
  const [activeChat, setActiveChat] = useState<string>('1')
  const [showSettings, setShowSettings] = useState(false)
  const [showModelSelector, setShowModelSelector] = useState(false)

  const currentChatData = chats.find(chat => chat.id === activeChat)

  // Theme management
  useEffect(() => {
    const applyTheme = (newTheme: 'light' | 'dark' | 'system') => {
      const root = document.documentElement
      
      if (newTheme === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        root.classList.toggle('dark', prefersDark)
      } else {
        root.classList.toggle('dark', newTheme === 'dark')
      }
    }

    applyTheme(theme)

    // Listen for system theme changes if using system theme
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = () => applyTheme('system')
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
  }, [theme])

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme)
  }

  const sendMessage = () => {
    if (!currentMessage.trim() || !activeChat) return

    const newMessage: Message = {
      id: Date.now().toString(),
      content: currentMessage,
      role: 'user',
      timestamp: new Date()
    }

    // Add user message
    setChats(prev => prev.map(chat => 
      chat.id === activeChat 
        ? { ...chat, messages: [...chat.messages, newMessage] }
        : chat
    ))

    setCurrentMessage('')

    // Simulate AI response with markdown
    setTimeout(() => {
      const responses = [
        `Thanks for your message! Here's a **formatted response** with some features:

## Code Example
\`\`\`python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

print([fibonacci(i) for i in range(10)])
\`\`\`

## Features
- ✅ **Markdown support**
- ✅ Code highlighting
- ✅ Multiple AI models
- ✅ Theme switching

> This is a demo response from T66. In the full version, this would be powered by your chosen AI model: **${getModelName(selectedModel)}**`,

        `I understand you're testing the **${getModelName(selectedModel)}** model. Here's what I can help with:

### 🧠 Capabilities
1. **Text Generation** - Creative writing, essays, summaries
2. **Code Assistance** - Programming help in any language
3. **Analysis** - Data interpretation, problem-solving
4. **Math & Science** - Equations, explanations, calculations

### 📊 Example Table
| Model | Provider | Context Length |
|-------|----------|----------------|
| GPT-4o | OpenAI | 128K tokens |
| Claude 3.5 | Anthropic | 200K tokens |
| Gemini Pro | Google | 32K tokens |

*This is a **demo response**. The actual model integration would provide real AI responses.*`
      ]

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: responses[Math.floor(Math.random() * responses.length)],
        role: 'assistant',
        timestamp: new Date()
      }

      setChats(prev => prev.map(chat => 
        chat.id === activeChat 
          ? { ...chat, messages: [...chat.messages, aiResponse] }
          : chat
      ))
    }, 1000)
  }

  const createNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: `Chat ${chats.length + 1}`,
      messages: [],
      createdAt: new Date()
    }
    setChats(prev => [...prev, newChat])
    setActiveChat(newChat.id)
  }

  const deleteChat = (chatId: string) => {
    if (chats.length <= 1) return // Don't delete the last chat
    
    setChats(prev => prev.filter(chat => chat.id !== chatId))
    
    // If we deleted the active chat, switch to another one
    if (activeChat === chatId) {
      const remainingChats = chats.filter(chat => chat.id !== chatId)
      if (remainingChats.length > 0) {
        setActiveChat(remainingChats[0].id)
      }
    }
  }

  const getModelName = (modelId: string) => {
    const modelNames: Record<string, string> = {
      'gpt-4o': 'GPT-4o',
      'gpt-4-turbo': 'GPT-4 Turbo',
      'claude-3-5-sonnet': 'Claude 3.5 Sonnet',
      'gemini-pro': 'Gemini Pro',
      'command-r-plus': 'Command R+',
    }
    return modelNames[modelId] || modelId
  }

  return (
    <Router>
      <div className="min-h-screen">
        <div className="flex h-screen bg-background text-foreground">
          {/* Sidebar */}
          <div className="w-64 bg-card border-r border-border flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold text-primary">T66</h1>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleThemeChange(theme === 'dark' ? 'light' : 'dark')}
                  className="h-8 w-8"
                >
                  {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-1">AI Chat Application</p>
            </div>

            {/* New Chat Button */}
            <div className="p-4">
              <Button
                onClick={createNewChat}
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
                      ? 'bg-accent text-accent-foreground' 
                      : 'hover:bg-accent/50'
                  }`}
                >
                  <button
                    onClick={() => setActiveChat(chat.id)}
                    className="flex-1 text-left min-w-0"
                  >
                    <div className="flex items-center gap-2">
                      <MessageSquare size={16} />
                      <span className="truncate">{chat.title}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {chat.messages.length} messages
                    </p>
                  </button>
                  
                  {/* Three-dot menu */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Dropdown
                      trigger={
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <MoreVertical size={14} />
                        </Button>
                      }
                    >
                      <DropdownItem 
                        onClick={() => deleteChat(chat.id)}
                        variant="destructive"
                      >
                        <div className="flex items-center gap-2">
                          <Trash2 size={14} />
                          Delete Chat
                        </div>
                      </DropdownItem>
                    </Dropdown>
                  </div>
                </div>
              ))}
            </div>

            {/* User Section */}
            <div className="p-4 border-t border-border">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <User size={16} className="text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Demo User</p>
                  <p className="text-xs text-muted-foreground">All Features Free</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => setShowSettings(true)}
                >
                  <Settings size={16} />
                </Button>
              </div>
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b border-border bg-card">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">{currentChatData?.title}</h2>
                  <p className="text-sm text-muted-foreground">
                    {currentChatData?.messages.length} messages
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
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-card border border-border'
                    }`}
                  >
                    {message.role === 'user' ? (
                      <p className="text-sm">{message.content}</p>
                    ) : (
                      <MarkdownRenderer content={message.content} />
                    )}
                    <p className="text-xs opacity-70 mt-2">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-border bg-card">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 p-3 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <Button
                  onClick={sendMessage}
                  disabled={!currentMessage.trim()}
                  size="icon"
                  className="h-12 w-12"
                >
                  <Send size={18} />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                T66 can make mistakes. Consider checking important information.
              </p>
            </div>
          </div>
        </div>

        {/* Modals */}
        <SettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          theme={theme}
          onThemeChange={handleThemeChange}
        />

        <ModelSelectorModal
          isOpen={showModelSelector}
          onClose={() => setShowModelSelector(false)}
          selectedModel={selectedModel}
          onModelSelect={setSelectedModel}
        />
      </div>
    </Router>
  )
}

export default App
