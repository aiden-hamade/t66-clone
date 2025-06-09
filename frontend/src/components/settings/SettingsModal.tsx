import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Moon, Sun, Monitor } from 'lucide-react'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  theme: 'light' | 'dark' | 'system'
  onThemeChange: (theme: 'light' | 'dark' | 'system') => void
}

export function SettingsModal({ isOpen, onClose, theme, onThemeChange }: SettingsModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Settings" size="lg">
      <div className="p-6 space-y-6">
        {/* Appearance Section */}
        <div>
          <h3 className="text-lg font-medium mb-4">Appearance</h3>
          <div className="space-y-3">
            <label className="text-sm font-medium">Theme</label>
            <div className="flex gap-2">
              <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onThemeChange('light')}
                className="flex items-center gap-2"
              >
                <Sun size={16} />
                Light
              </Button>
              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onThemeChange('dark')}
                className="flex items-center gap-2"
              >
                <Moon size={16} />
                Dark
              </Button>
              <Button
                variant={theme === 'system' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onThemeChange('system')}
                className="flex items-center gap-2"
              >
                <Monitor size={16} />
                System
              </Button>
            </div>
          </div>
        </div>

        {/* User Info Section */}
        <div>
          <h3 className="text-lg font-medium mb-4">Account</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <span className="text-sm">Plan</span>
              <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded-full">
                Free (All Features Included)
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm">User</span>
              <span className="text-sm text-muted-foreground">Demo User</span>
            </div>
          </div>
        </div>

        {/* Preferences Section */}
        <div>
          <h3 className="text-lg font-medium mb-4">Preferences</h3>
          <div className="space-y-3">
            <label className="flex items-center justify-between">
              <span className="text-sm">Send message on Enter</span>
              <input type="checkbox" defaultChecked className="rounded" />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm">Show token count</span>
              <input type="checkbox" defaultChecked className="rounded" />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm">Code highlighting</span>
              <input type="checkbox" defaultChecked className="rounded" />
            </label>
          </div>
        </div>

        {/* About Section */}
        <div>
          <h3 className="text-lg font-medium mb-4">About</h3>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>T66 - Open Source AI Chat Application</p>
            <p>Built for the T3 Chat Cloneathon</p>
            <p>Version 0.1.0</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-4 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  )
} 