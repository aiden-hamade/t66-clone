import { cn } from '../../lib/utils'
import { type ReactNode, useState, useRef, useEffect, cloneElement, isValidElement } from 'react'

interface DropdownProps {
  trigger: ReactNode
  children: ReactNode
  align?: 'left' | 'right'
  forceTop?: boolean
}

interface DropdownItemProps {
  children: ReactNode
  onClick?: () => void
  variant?: 'default' | 'destructive'
  className?: string
  onClose?: () => void
}

export function Dropdown({ trigger, children, align = 'right', forceTop }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>('bottom')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      // If forceTop is true, always position above
      if (forceTop) {
        setDropdownPosition('top')
        return
      }
      
      const triggerRect = triggerRef.current.getBoundingClientRect()
      const viewportHeight = window.innerHeight
      const spaceBelow = viewportHeight - triggerRect.bottom
      const spaceAbove = triggerRect.top
      
      // Estimate dropdown height (reduced for better positioning)
      const estimatedDropdownHeight = 80
      
      // Be more aggressive about positioning upward, especially in bottom 1/3 of screen
      const isInBottomThird = triggerRect.bottom > (viewportHeight * 0.67)
      
      // Position above if:
      // 1. We're in the bottom third of the screen AND there's enough space above, OR
      // 2. There's not enough space below but enough space above
      if (
        (isInBottomThird && spaceAbove > estimatedDropdownHeight) ||
        (spaceBelow < estimatedDropdownHeight && spaceAbove > estimatedDropdownHeight)
      ) {
        setDropdownPosition('top')
      } else {
        setDropdownPosition('bottom')
      }
    }
  }, [isOpen, forceTop])

  return (
    <div className="relative" ref={dropdownRef}>
      <div ref={triggerRef} onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>
      
      {isOpen && (
        <div
          className={cn(
            'absolute min-w-[160px] bg-theme-dropdown border border-theme-modal rounded-md shadow-lg z-[100]',
            dropdownPosition === 'bottom' ? 'top-full mt-1' : 'bottom-full mb-3',
            align === 'right' ? 'right-0' : 'left-0'
          )}
        >
          <div className="py-1">
            {isValidElement(children) 
              ? cloneElement(children as any, { onClose: () => setIsOpen(false) })
              : Array.isArray(children)
                ? children.map((child, index) => 
                    isValidElement(child) 
                      ? cloneElement(child as any, { key: index, onClose: () => setIsOpen(false) })
                      : child
                  )
                : children
            }
          </div>
        </div>
      )}
    </div>
  )
}

export function DropdownItem({ children, onClick, variant = 'default', className, onClose }: DropdownItemProps) {
  return (
    <button
      className={cn(
        'w-full text-left px-3 py-2 text-sm text-theme-primary hover:bg-theme-dropdown-hover transition-colors',
        {
          'text-theme-primary': variant === 'default',
          'text-theme-error hover:bg-theme-button-secondary': variant === 'destructive',
        },
        className
      )}
      onClick={() => {
        onClick?.()
        onClose?.()
      }}
    >
      {children}
    </button>
  )
} 