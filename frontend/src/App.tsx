import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Send, MessageSquare, Settings, User, Moon, Sun, Plus } from 'lucide-react'
import './App.css'

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
  const [isDark, setIsDark] = useState(true)
  const [currentMessage, setCurrentMessage] = useState('')
  const [chats, setChats] = useState<Chat[]>([
    {
      id: '1',
      title: 'Welcome to T66',
      messages: [
        {
          id: '1',
          content: 'Hello! Welcome to T66, your open-source AI chat application. How can I help you today?',
          role: 'assistant',
          timestamp: new Date()
        }
      ],
      createdAt: new Date()
    }
  ])
  const [activeChat, setActiveChat] = useState<string>('1')

  const currentChatData = chats.find(chat => chat.id === activeChat)

  const toggleTheme = () => {
    setIsDark(!isDark)
    document.documentElement.classList.toggle('dark')
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

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: `Thanks for your message: "${currentMessage}". This is a demo response from T66. In the full version, this would be powered by your chosen AI model!`,
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

  return (
    <Router>
      <div className={`min-h-screen ${isDark ? 'dark' : ''}`}>
        <div className="flex h-screen bg-background text-foreground">
          {/* Sidebar */}
          <div className="w-64 bg-card border-r border-border flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold text-primary">T66</h1>
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg hover:bg-accent transition-colors"
                >
                  {isDark ? <Sun size={18} /> : <Moon size={18} />}
                </button>
              </div>
              <p className="text-sm text-muted-foreground mt-1">AI Chat Application</p>
            </div>

            {/* New Chat Button */}
            <div className="p-4">
              <button
                onClick={createNewChat}
                className="w-full flex items-center gap-2 p-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Plus size={18} />
                New Chat
              </button>
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {chats.map(chat => (
                <button
                  key={chat.id}
                  onClick={() => setActiveChat(chat.id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    activeChat === chat.id 
                      ? 'bg-accent text-accent-foreground' 
                      : 'hover:bg-accent/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <MessageSquare size={16} />
                    <span className="truncate">{chat.title}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {chat.messages.length} messages
                  </p>
                </button>
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
                  <p className="text-xs text-muted-foreground">Free Plan</p>
                </div>
                <button className="p-2 rounded-lg hover:bg-accent transition-colors">
                  <Settings size={16} />
                </button>
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
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                    GPT-4 (Demo)
                  </span>
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
                    <p className="text-sm">{message.content}</p>
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
                <button
                  onClick={sendMessage}
                  disabled={!currentMessage.trim()}
                  className="p-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send size={18} />
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                T66 can make mistakes. Consider checking important information.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Router>
  )
}

export default App
