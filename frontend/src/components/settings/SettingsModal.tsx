import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Moon, Sun, Monitor, Eye, EyeOff, Upload, User as UserIcon } from 'lucide-react'
import { useState } from 'react'
import { updateUserProfile } from '../../lib/auth'
import type { User } from '../../types'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  theme: 'light' | 'dark' | 'system'
  onThemeChange: (theme: 'light' | 'dark' | 'system') => void
  user: User | null
  onUserUpdate: (user: User) => void
}

export function SettingsModal({ isOpen, onClose, theme, onThemeChange, user, onUserUpdate }: SettingsModalProps) {
  const [showApiKey, setShowApiKey] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    openRouterApiKey: user?.openRouterApiKey || ''
  })
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    if (!user) return
    
    try {
      setIsSaving(true)
      await updateUserProfile(user.id, {
        name: editForm.name,
        openRouterApiKey: editForm.openRouterApiKey
      })
      
      // Update the user object and notify parent
      const updatedUser = {
        ...user,
        name: editForm.name,
        openRouterApiKey: editForm.openRouterApiKey
      }
      onUserUpdate(updatedUser)
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Failed to update profile. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setEditForm({
      name: user?.name || '',
      openRouterApiKey: user?.openRouterApiKey || ''
    })
    setIsEditing(false)
  }
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Settings" size="lg">
      <div className="p-6">
        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            {/* Appearance Section */}
            <div>
              <h3 className="text-lg font-medium mb-3">Appearance</h3>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Theme</label>
                <div className="flex gap-2">
                  <Button
                    variant={theme === 'light' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onThemeChange('light')}
                    className="flex items-center gap-1.5 text-xs"
                  >
                    <Sun size={14} />
                    Light
                  </Button>
                  <Button
                    variant={theme === 'dark' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onThemeChange('dark')}
                    className="flex items-center gap-1.5 text-xs"
                  >
                    <Moon size={14} />
                    Dark
                  </Button>
                  <Button
                    variant={theme === 'system' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onThemeChange('system')}
                    className="flex items-center gap-1.5 text-xs"
                  >
                    <Monitor size={14} />
                    System
                  </Button>
                </div>
              </div>
            </div>

            {/* About Section */}
            <div>
              <h3 className="text-lg font-medium mb-3">About</h3>
              <div className="text-sm text-muted-foreground space-y-1">
                <p className="font-medium text-foreground">T66 - AI Chat Application</p>
                <p>Built for the T3 Chat Cloneathon</p>
                <p>Version 0.1.0</p>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Profile Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-medium">Profile</h3>
                {!isEditing && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1.5 text-xs"
                  >
                    <UserIcon size={12} />
                    Edit
                  </Button>
                )}
              </div>
              
              <div className="space-y-3">
                {/* Profile Picture */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                    {user?.avatar ? (
                      <img src={user.avatar} alt="Profile" className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <UserIcon size={20} className="text-primary-foreground" />
                    )}
                  </div>
                  {isEditing && (
                    <Button variant="outline" size="sm" className="flex items-center gap-1.5 text-xs">
                      <Upload size={12} />
                      Change
                    </Button>
                  )}
                </div>

                {/* Name */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full mt-1 p-2 text-sm rounded-md border border-border bg-background"
                      placeholder="Enter your name"
                    />
                  ) : (
                    <p className="text-sm text-foreground mt-1">
                      {user?.name || 'No name set'}
                    </p>
                  )}
                </div>

                {/* Email (read-only) */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="text-sm text-foreground mt-1">
                    {user?.email || 'No email'}
                  </p>
                </div>
              </div>
            </div>

            {/* API Configuration Section */}
            <div>
              <h3 className="text-lg font-medium mb-3">API Configuration</h3>
              <div>
                <label className="text-sm font-medium text-muted-foreground">OpenRouter API Key</label>
                <p className="text-xs text-muted-foreground mb-2">
                  Required for AI functionality. Get your key from{' '}
                  <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    openrouter.ai/keys
                  </a>
                </p>
                {isEditing ? (
                  <div className="relative">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      value={editForm.openRouterApiKey}
                      onChange={(e) => setEditForm(prev => ({ ...prev, openRouterApiKey: e.target.value }))}
                      className="w-full p-2 pr-10 text-sm rounded-md border border-border bg-background"
                      placeholder="sk-or-v1-..."
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showApiKey ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-foreground font-mono">
                      {user?.openRouterApiKey ? 
                        (showApiKey ? user.openRouterApiKey : '••••••••••••••••••••••••••••••••••••••••••••••••••••') 
                        : 'Not configured'
                      }
                    </span>
                    {user?.openRouterApiKey && (
                      <button
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        {showApiKey ? <EyeOff size={12} /> : <Eye size={12} />}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Edit Actions */}
        {isEditing && (
          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        )}

        {/* Action Buttons */}
        {!isEditing && (
          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        )}
      </div>
    </Modal>
  )
} 