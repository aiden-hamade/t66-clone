import { cn } from '../../lib/utils'
import { type ReactNode, useState, useRef, useEffect } from 'react'

interface DropdownProps {
  trigger: ReactNode
  children: ReactNode
  align?: 'left' | 'right'
}

interface DropdownItemProps {
  children: ReactNode
  onClick?: () => void
  variant?: 'default' | 'destructive'
  className?: string
}

export function Dropdown({ trigger, children, align = 'right' }: DropdownProps) {
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
      const triggerRect = triggerRef.current.getBoundingClientRect()
      const viewportHeight = window.innerHeight
      const spaceBelow = viewportHeight - triggerRect.bottom
      const spaceAbove = triggerRect.top
      
      // Estimate dropdown height (you can adjust this value)
      const estimatedDropdownHeight = 120
      
      // Position above if there's not enough space below but enough space above
      if (spaceBelow < estimatedDropdownHeight && spaceAbove > estimatedDropdownHeight) {
        setDropdownPosition('top')
      } else {
        setDropdownPosition('bottom')
      }
    }
  }, [isOpen])

  return (
    <div className="relative" ref={dropdownRef}>
      <div ref={triggerRef} onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>
      
      {isOpen && (
        <div
          className={cn(
            'absolute min-w-[160px] bg-theme-dropdown border border-theme-modal rounded-md shadow-lg z-50',
            dropdownPosition === 'bottom' ? 'top-full mt-1' : 'bottom-full mb-1',
            align === 'right' ? 'right-0' : 'left-0'
          )}
        >
          <div className="py-1">
            {children}
          </div>
        </div>
      )}
    </div>
  )
}

export function DropdownItem({ children, onClick, variant = 'default', className }: DropdownItemProps) {
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
      onClick={onClick}
    >
      {children}
    </button>
  )
} 