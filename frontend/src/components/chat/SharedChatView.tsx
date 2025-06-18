import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogIn, Users, Copy, Check, ArrowLeft, FileText } from 'lucide-react'
import { Button } from '../ui/Button'
import { MarkdownRenderer } from '../ui/MarkdownRenderer'
import { useAuthStore } from '../../stores/authStore'
import { getSharedChat, addCollaboratorToChat } from '../../lib/firestore'
import type { Chat } from '../../types'

interface SharedChatViewProps {}

export const SharedChatView: React.FC<SharedChatViewProps> = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  
  // Get share ID from URL query parameter
  // Handle format: /chats?share_1234567890_abcdef123
  const rawSearch = window.location.search.substring(1) // Remove the '?' 
  const shareId = rawSearch.replace(/['"`]/g, '') // Remove any quotes that might be in the URL
  
  // Debug logging
  console.log('SharedChatView Debug:')
  console.log('- Full URL:', window.location.href)
  console.log('- Search params:', window.location.search)
  console.log('- Raw search (no ?):', rawSearch)
  console.log('- Cleaned shareId:', shareId)
  
  const [chat, setChat] = useState<Chat | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [inviteEmail, setInviteEmail] = useState('')
  const [showInvite, setShowInvite] = useState(false)
  const [copied, setCopied] = useState(false)

    // Load shared chat
  useEffect(() => {
    const loadSharedChat = async () => {
      if (!shareId) return

      try {
        setLoading(true)
        console.log('Attempting to load shared chat with shareId:', shareId)
        const sharedChat = await getSharedChat(shareId)
        console.log('getSharedChat result:', sharedChat)
        
        if (!sharedChat) {
          console.log('No shared chat found for shareId:', shareId)
          setError('Chat not found or no longer shared')
          return
        }
        
        console.log('Successfully loaded shared chat:', sharedChat.title)
        setChat(sharedChat)
      } catch (err) {
        console.error('Error loading shared chat:', err)
        setError('Failed to load shared chat')
      } finally {
        setLoading(false)
      }
    }
    
    loadSharedChat()
  }, [shareId, user])

  const handleInviteCollaborator = async () => {
    if (!chat || !user || !inviteEmail.trim()) return
    
    try {
      await addCollaboratorToChat(chat.id, inviteEmail.trim())
      setInviteEmail('')
      setShowInvite(false)
      // Refresh chat to get updated collaborators
      const updatedChat = await getSharedChat(shareId!)
      if (updatedChat) setChat(updatedChat)
    } catch (err) {
      console.error('Error inviting collaborator:', err)
    }
  }

  const copyShareLink = () => {
    const shareUrl = `${window.location.origin}/chats?${shareId}`
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSignIn = () => {
    // Navigate to login page or trigger auth modal
    navigate('/login')
  }

  const isCollaborator = user && chat && (chat.user === user.id || chat.collaborators?.includes(user.id))
  const isOwner = user && chat && chat.user === user.id
  const canEdit = isCollaborator

  if (loading) {
    return (
      <div className="min-h-screen bg-theme-background flex items-center justify-center">
        <div className="text-theme-primary">Loading shared chat...</div>
      </div>
    )
  }

  if (error || !chat) {
    return (
      <div className="min-h-screen bg-theme-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-theme-error mb-4">{error || 'Chat not found'}</div>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-theme-background">
      <div className="flex h-screen">
        {/* Sidebar - only show for chat owner */}
        {isOwner && (
          <div className="w-80 bg-theme-sidebar border-r border-theme flex flex-col">
            <div className="p-4 border-b border-theme">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-theme-primary">Your Chats</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/')}
                  className="text-theme-secondary hover:text-theme-primary"
                >
                  <ArrowLeft size={16} />
                  Back to App
                </Button>
              </div>
            </div>
            <div className="flex-1 p-4">
              <p className="text-sm text-theme-secondary">
                You're viewing a shared version of your chat. Click "Back to App" to return to the full interface.
              </p>
            </div>
          </div>
        )}
        
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-theme bg-theme-chat-header">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-theme-primary">{chat.title}</h1>
              <p className="text-sm text-theme-secondary">
                Shared chat • {chat.messages.length} messages
                {chat.collaborators && chat.collaborators.length > 0 && ` • ${chat.collaborators.length + 1} collaborators`}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              {canEdit && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowInvite(!showInvite)}
                  >
                    <Users size={16} />
                    Invite
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyShareLink}
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    {copied ? 'Copied!' : 'Share'}
                  </Button>
                </>
              )}
              
              {!user && (
                <Button onClick={handleSignIn}>
                  <LogIn size={16} />
                  Sign In
                </Button>
              )}
            </div>
          </div>
          
          {/* Invite Section */}
          {showInvite && canEdit && (
            <div className="mt-4 p-3 bg-theme-surface rounded-lg border border-theme">
              <div className="flex gap-2">
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="Enter email to invite..."
                  className="flex-1 px-3 py-2 text-sm bg-theme-input border border-theme-input text-theme-input rounded focus:outline-none focus:ring-2 focus:ring-theme-accent"
                />
                <Button size="sm" onClick={handleInviteCollaborator}>
                  Invite
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {chat.messages.map(message => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] p-4 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-theme-chat-user text-theme-button-primary'
                    : 'bg-theme-chat-assistant border border-theme'
                }`}
              >
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
                <p className="text-xs text-theme-secondary mt-2">
                  {message.timestamp instanceof Date 
                    ? message.timestamp.toLocaleTimeString() 
                    : new Date(message.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-theme bg-theme-chat-header">
          <div className="text-center p-4 bg-theme-surface rounded-lg border border-theme">
            <p className="text-theme-secondary mb-3">
              {user 
                ? (canEdit ? 'Real-time collaboration coming soon!' : 'You need to be invited to collaborate on this chat')
                : 'Sign in to continue this chat'
              }
            </p>
            {!user && (
              <Button onClick={handleSignIn}>
                <LogIn size={16} />
                Sign In to Continue
              </Button>
            )}
          </div>
        </div>
        </div>
      </div>
    </div>
  )
} 