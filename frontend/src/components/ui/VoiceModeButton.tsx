import { useState } from 'react'
import { Send, Mic, Square, StopCircle } from 'lucide-react'
import { Button } from './Button'

export type InputMode = 'text' | 'voice'

interface VoiceModeButtonProps {
  mode: InputMode
  onModeChange: (mode: InputMode) => void
  onSend: () => void
  onStartRecording: () => void
  onStopRecording: () => void
  isRecording: boolean
  isDisabled: boolean
  canSendMessage: boolean
}

export function VoiceModeButton({
  mode,
  onModeChange,
  onSend,
  onStartRecording,
  onStopRecording,
  isRecording,
  isDisabled,
  canSendMessage
}: VoiceModeButtonProps) {
  const [isHovered, setIsHovered] = useState(false)

  const handleTextModeClick = () => {
    if (mode !== 'text') {
      onModeChange('text')
    } else if (canSendMessage) {
      // We're already in text mode and have a message to send - send it!
      onSend()
    }
    // If no message to send, do nothing (but allow hover effects)
  }

  const handleVoiceModeClick = () => {
    if (mode !== 'voice') {
      onModeChange('voice')
    } else if (mode === 'voice') {
      if (isRecording) {
        onStopRecording()
      } else {
        onStartRecording()
      }
    }
  }

  return (
    <div
      className="relative flex items-center gap-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Mode Selector - Shows on hover when not recording */}
      {isHovered && !isRecording && (
        <>
          {/* Invisible bridge to prevent dropdown from disappearing */}
          <div className="absolute bottom-full right-0 w-full h-6 pointer-events-auto" />
          
          <div 
            className="absolute bottom-full right-0 mb-2 flex gap-1 bg-theme-modal border border-theme-modal rounded-lg p-1 shadow-lg z-50"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Text Mode Button */}
            <Button
              variant={mode === 'text' ? 'default' : 'ghost'}
              size="icon"
              className={`h-10 w-10 ${
                mode === 'text' 
                  ? 'bg-theme-button-primary text-theme-button-primary' 
                  : 'text-theme-secondary hover:text-theme-primary hover:bg-theme-hover-surface'
              }`}
              onClick={handleTextModeClick}
              disabled={isDisabled}
            >
              <Send size={16} />
            </Button>
            
            {/* Voice Mode Button */}
            <Button
              variant={mode === 'voice' ? 'default' : 'ghost'}
              size="icon"
              className={`h-10 w-10 ${
                mode === 'voice' 
                  ? 'bg-theme-button-primary text-theme-button-primary' 
                  : 'text-theme-secondary hover:text-theme-primary hover:bg-theme-hover-surface'
              }`}
              onClick={handleVoiceModeClick}
              disabled={isDisabled}
            >
              <Mic size={16} />
            </Button>
          </div>
        </>
      )}

      {/* End Message Button - Shows when recording */}
      {mode === 'voice' && isRecording && (
        <Button
          onClick={onStopRecording}
          disabled={isDisabled}
          size="sm"
          className="bg-orange-500 text-white hover:bg-orange-600 px-3 py-2 text-sm font-medium"
        >
          <StopCircle size={16} className="mr-1" />
          End Message
        </Button>
      )}

      {/* Main Button - with extended hover area */}
      <div className="relative">
        <Button
          onClick={() => {
            if (mode === 'text' && canSendMessage) {
              onSend()
            } else if (mode === 'text' && !canSendMessage) {
              // Do nothing if no message to send
            } else {
              handleVoiceModeClick()
            }
          }}
          disabled={isDisabled}
          size="icon"
          className={`h-12 w-12 transition-all duration-200 ${
            mode === 'text'
              ? !canSendMessage
                ? 'bg-theme-button-secondary text-theme-secondary cursor-not-allowed opacity-50'
                : 'bg-theme-button-primary text-theme-button-primary hover:opacity-90'
              : isRecording
              ? 'bg-red-500 text-white hover:bg-red-600 animate-pulse'
              : 'bg-theme-accent text-theme-button-primary hover:opacity-90'
          }`}
        >
          {mode === 'text' ? (
            <Send size={18} />
          ) : isRecording ? (
            <Square size={18} />
          ) : (
            <Mic size={18} />
          )}
        </Button>
        
        {/* Extended hover area for better UX - only when not recording */}
        {!isRecording && (
          <div 
            className="absolute inset-0 -m-2 pointer-events-auto"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={(e) => {
              // Forward clicks on the overlay to the main button logic so they aren't swallowed
              e.stopPropagation()
              if (mode === 'text') {
                if (canSendMessage) {
                  onSend()
                }
              } else {
                handleVoiceModeClick()
              }
            }}
          />
        )}
      </div>
    </div>
  )
}
