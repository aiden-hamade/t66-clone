import { useState, useEffect } from 'react'
import { Brain, Lightbulb, Zap } from 'lucide-react'

interface ThinkingIndicatorProps {
  isThinking: boolean
  thinkingSummary?: string
  className?: string
}

export function ThinkingIndicator({ isThinking, thinkingSummary, className = '' }: ThinkingIndicatorProps) {
  const [dots, setDots] = useState('')
  const [currentSummary, setCurrentSummary] = useState('')
  const [summaryIndex, setSummaryIndex] = useState(0)

  // Animate dots
  useEffect(() => {
    if (!isThinking) return

    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === '...') return ''
        return prev + '.'
      })
    }, 500)

    return () => clearInterval(interval)
  }, [isThinking])

  // Animate thinking summary
  useEffect(() => {
    if (!thinkingSummary || !isThinking) {
      setCurrentSummary('')
      setSummaryIndex(0)
      return
    }

    const interval = setInterval(() => {
      setSummaryIndex(prev => {
        if (prev >= thinkingSummary.length) {
          return thinkingSummary.length
        }
        return prev + 1
      })
    }, 30) // Typing speed

    return () => clearInterval(interval)
  }, [thinkingSummary, isThinking])

  useEffect(() => {
    if (thinkingSummary) {
      setCurrentSummary(thinkingSummary.slice(0, summaryIndex))
    }
  }, [summaryIndex, thinkingSummary])

  if (!isThinking) return null

  return (
    <div className={`bg-theme-chat-assistant border border-theme rounded-lg p-4 ${className}`}>
      <div className="flex items-center gap-3">
        {/* Animated thinking icon */}
        <div className="relative">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center animate-pulse">
            <Brain size={16} className="text-white" />
          </div>
          {/* Floating thought bubbles */}
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
          <div className="absolute -top-2 right-1 w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="absolute -top-3 right-3 w-1 h-1 bg-purple-300 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-transparent bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text">
              Thinking{dots}
            </span>
            <div className="flex space-x-1">
              <div className="w-1 h-1 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
              <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-1 h-1 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
          
          {/* Thinking summary with typewriter effect */}
          {currentSummary && (
            <div className="text-xs text-theme-secondary leading-relaxed">
              <div className="flex items-start gap-2">
                <Lightbulb size={12} className="text-yellow-500 flex-shrink-0 mt-0.5" />
                <span className="font-mono">
                  {currentSummary}
                  {summaryIndex < (thinkingSummary?.length || 0) && (
                    <span className="animate-pulse">|</span>
                  )}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Energy indicator */}
        <div className="flex flex-col items-center gap-1">
          <Zap size={14} className="text-yellow-500 animate-pulse" />
          <div className="text-xs text-theme-secondary font-mono">AI</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-3 w-full bg-theme-input rounded-full h-1 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-pulse"></div>
      </div>
    </div>
  )
} 