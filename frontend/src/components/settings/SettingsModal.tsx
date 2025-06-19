import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Eye, EyeOff, User as UserIcon, Palette, Settings as SettingsIcon, Info, Key } from 'lucide-react'
import { useState } from 'react'
import { updateUserProfile } from '../../lib/auth'
import { useThemeStore } from '../../stores/themeStore'
import { ThemeModal } from './ThemeModal'
import type { User } from '../../types'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  user: User | null
  onUserUpdate: (user: User) => void
}

export function SettingsModal({ isOpen, onClose, user, onUserUpdate }: SettingsModalProps) {
  const { isThemeModalOpen, setThemeModalOpen } = useThemeStore()
  const [showOpenRouterApiKey, setShowOpenRouterApiKey] = useState(false)
  const [showOpenAIApiKey, setShowOpenAIApiKey] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    openRouterApiKey: user?.openRouterApiKey || '',
    openaiApiKey: user?.openaiApiKey || ''
  })
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    if (!user) return
    
    try {
      setIsSaving(true)
      await updateUserProfile(user.id, {
        name: editForm.name,
        openRouterApiKey: editForm.openRouterApiKey,
        openaiApiKey: editForm.openaiApiKey
      })
      
      // Update the user object and notify parent
      const updatedUser = {
        ...user,
        name: editForm.name,
        openRouterApiKey: editForm.openRouterApiKey,
        openaiApiKey: editForm.openaiApiKey
      }
      onUserUpdate(updatedUser)
      setIsEditing(false)
    } catch (error) {
      alert('Failed to update profile. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setEditForm({
      name: user?.name || '',
      openRouterApiKey: user?.openRouterApiKey || '',
      openaiApiKey: user?.openaiApiKey || ''
    })
    setIsEditing(false)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Settings" size="xl">
      <div className="bg-theme-modal">
        {/* Header Section */}
        <div className="px-8 py-6 border-b border-theme-modal">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-theme-accent rounded-lg flex items-center justify-center">
              <SettingsIcon size={20} className="text-theme-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-theme-primary">Settings</h1>
              <p className="text-sm text-theme-secondary">Manage your account and preferences</p>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            
            {/* Left Column */}
            <div className="space-y-8">
              
            {/* Profile Section */}
              <div className="bg-theme-surface rounded-xl p-6 border border-theme-modal">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-theme-accent rounded-lg flex items-center justify-center">
                      <UserIcon size={16} className="text-theme-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-theme-primary">Profile</h3>
                  </div>
                {!isEditing && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2"
                  >
                      <UserIcon size={14} />
                      Edit Profile
                  </Button>
                )}
              </div>
              
                <div className="space-y-6">
                {/* Profile Picture */}
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-theme-button-primary rounded-full flex items-center justify-center">
                    {user?.avatar ? (
                        <img src={user.avatar} alt="Profile" className="w-16 h-16 rounded-full object-cover" />
                    ) : (
                        <UserIcon size={24} className="text-theme-button-primary" />
                    )}
                  </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-theme-primary">{user?.name || 'Anonymous User'}</h4>
                      <p className="text-sm text-theme-secondary">{user?.email || 'No email provided'}</p>
                    </div>
                </div>

                  {/* Name Field */}
                <div>
                    <label className="block text-sm font-medium text-theme-primary mb-2">Display Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full p-3 rounded-lg border border-theme-input bg-theme-input text-theme-input focus:ring-2 focus:ring-theme-accent focus:border-transparent"
                        placeholder="Enter your display name"
                    />
                  ) : (
                      <div className="p-3 bg-theme-input rounded-lg border border-theme-input">
                        <span className="text-theme-primary">{user?.name || 'Not set'}</span>
                      </div>
                    )}
                  </div>

                  {/* Email Field (Read-only) */}
                  <div>
                    <label className="block text-sm font-medium text-theme-primary mb-2">Email Address</label>
                    <div className="p-3 bg-theme-input rounded-lg border border-theme-input opacity-60">
                      <span className="text-theme-secondary">{user?.email || 'No email configured'}</span>
                    </div>
                    <p className="text-xs text-theme-secondary mt-1">Email cannot be changed</p>
                  </div>
                </div>
              </div>

              {/* Appearance Section */}
              <div className="bg-theme-surface rounded-xl p-6 border border-theme-modal">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-theme-accent rounded-lg flex items-center justify-center">
                    <Palette size={16} className="text-theme-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-theme-primary">Appearance</h3>
                </div>

                <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-theme-primary mb-2">Theme Customization</label>
                    <p className="text-sm text-theme-secondary mb-4">
                      Personalize your chat interface with beautiful themes and custom colors
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => setThemeModalOpen(true)}
                      className="flex items-center gap-2 w-full justify-center"
                    >
                      <Palette size={16} />
                      Open Theme Editor
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-8">

            {/* API Configuration Section */}
              <div className="bg-theme-surface rounded-xl p-6 border border-theme-modal">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-theme-accent rounded-lg flex items-center justify-center">
                    <Key size={16} className="text-theme-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-theme-primary">API Configuration</h3>
                </div>
                
                <div className="space-y-4">
            <div>
                    <label className="block text-sm font-medium text-theme-primary mb-2">OpenRouter API Key</label>
                    <p className="text-sm text-theme-secondary mb-4">
                  Required for AI functionality. Get your key from{' '}
                      <a 
                        href="https://openrouter.ai/keys" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                      >
                    openrouter.ai/keys
                  </a>
                </p>
                    
                {isEditing ? (
                  <div className="relative">
                    <input
                      type={showOpenRouterApiKey ? 'text' : 'password'}
                      value={editForm.openRouterApiKey}
                      onChange={(e) => setEditForm(prev => ({ ...prev, openRouterApiKey: e.target.value }))}
                          className="w-full p-3 pr-12 text-sm rounded-lg border border-theme-input bg-theme-input text-theme-input focus:ring-2 focus:ring-theme-accent focus:border-transparent font-mono"
                      placeholder="sk-or-v1-..."
                    />
                    <button
                      type="button"
                      onClick={() => setShowOpenRouterApiKey(!showOpenRouterApiKey)}
                          className="absolute h-full flex items-center right-3 top-1/2 transform -translate-y-1/2 text-theme-secondary hover:text-theme-primary transition-colors"
                    >
                          {showOpenRouterApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                ) : (
                      <div className="bg-theme-input rounded-lg border border-theme-input p-3 min-h-[3rem]">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex-1 min-w-0 flex items-center">
                            <span className="text-sm text-theme-primary font-mono break-all truncate">
                      {user?.openRouterApiKey ? 
                        (showOpenRouterApiKey ? user.openRouterApiKey : '••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••') 
                        : 'Not configured'
                      }
                    </span>
                          </div>
                    {user?.openRouterApiKey && (
                      <button
                        onClick={() => setShowOpenRouterApiKey(!showOpenRouterApiKey)}
                              className="flex items-center justify-center h-6 w-6 text-theme-secondary hover:text-theme-primary transition-colors"
                      >
                              {showOpenRouterApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {!user?.openRouterApiKey && (
                      <div className="mt-3 p-3 bg-theme-button-secondary rounded-lg border border-theme-accent">
                        <p className="text-sm text-theme-accent">
                          ⚠️ API key required for AI functionality
                        </p>
                      </div>
                    )}
                  </div>

                  {/* OpenAI API Key */}
                  <div>
                    <label className="block text-sm font-medium text-theme-primary mb-2">OpenAI API Key</label>
                    <p className="text-sm text-theme-secondary mb-4">
                      For Voice Mode and Image Generation. Get your key from{' '}
                      <a 
                        href="https://platform.openai.com/api-keys" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                      >
                        platform.openai.com/api-keys
                      </a>
                    </p>
                    
                    {isEditing ? (
                      <div className="relative">
                        <input
                          type={showOpenAIApiKey ? 'text' : 'password'}
                          value={editForm.openaiApiKey}
                          onChange={(e) => setEditForm(prev => ({ ...prev, openaiApiKey: e.target.value }))}
                          className="w-full h-12 p-3 pr-12 text-sm rounded-lg border border-theme-input bg-theme-input text-theme-input focus:ring-2 focus:ring-theme-accent focus:border-transparent font-mono"
                          placeholder="sk-..."
                        />
                        <button
                          type="button"
                          onClick={() => setShowOpenAIApiKey(!showOpenAIApiKey)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-theme-secondary hover:text-theme-primary transition-colors"
                        >
                          {showOpenAIApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    ) : (
                      <div className="bg-theme-input rounded-lg border border-theme-input p-3 min-h-[3rem]">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex-1 min-w-0 flex items-center">
                            <span className="text-sm text-theme-primary font-mono break-all truncate">
                              {user?.openaiApiKey ? 
                                (showOpenAIApiKey ? user.openaiApiKey : '••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••') 
                                : 'Not configured'
                              }
                            </span>
                          </div>
                          {user?.openaiApiKey && (
                            <button
                              onClick={() => setShowOpenAIApiKey(!showOpenAIApiKey)}
                              className="flex items-center justify-center h-6 w-6 text-theme-secondary hover:text-theme-primary transition-colors"
                            >
                              {showOpenAIApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* About Section */}
              <div className="bg-theme-surface rounded-xl p-6 border border-theme-modal">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-theme-accent rounded-lg flex items-center justify-center">
                    <Info size={16} className="text-theme-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-theme-primary">About</h3>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-theme-secondary">Application</span>
                    <span className="text-sm font-medium text-theme-primary">T66 Chat</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-theme-secondary">Version</span>
                    <span className="text-sm font-medium text-theme-primary">0.2.1</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-theme-secondary">Built for</span>
                    <span className="text-sm font-medium text-theme-primary">T3 Chat Cloneathon</span>
                  </div>
                  <div className="pt-3 border-t border-theme-modal">
                    <p className="text-xs text-theme-secondary">
                      A modern AI chat interface with multiple LLM support and beautiful theming.
                    </p>
                  </div>
              </div>
            </div>
          </div>
        </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-8 border-t border-theme-modal mt-8">
            {isEditing ? (
              <>
            <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                  Cancel Changes
            </Button>
                <Button onClick={handleSave} disabled={isSaving} className="min-w-[120px]">
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
              </>
            ) : (
            <Button variant="outline" onClick={onClose}>
                Close Settings
            </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Theme Modal */}
      <ThemeModal
        isOpen={isThemeModalOpen}
        onClose={() => setThemeModalOpen(false)}
      />
    </Modal>
  )
} 
