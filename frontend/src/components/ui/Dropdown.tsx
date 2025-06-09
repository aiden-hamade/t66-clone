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
  const dropdownRef = useRef<HTMLDivElement>(null)

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

  return (
    <div className="relative" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>
      
      {isOpen && (
        <div
          className={cn(
            'absolute top-full mt-1 min-w-[160px] bg-card border border-border rounded-md shadow-lg z-50',
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
        'w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors',
        {
          'text-foreground': variant === 'default',
          'text-destructive hover:bg-destructive/10': variant === 'destructive',
        },
        className
      )}
      onClick={onClick}
    >
      {children}
    </button>
  )
} 