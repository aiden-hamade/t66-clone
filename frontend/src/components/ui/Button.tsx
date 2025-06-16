import { cn } from '../../lib/utils'
import { forwardRef, type ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          {
            'bg-theme-button-primary text-theme-button-primary hover:opacity-90': variant === 'default',
            'bg-theme-error text-theme-button-primary hover:opacity-90': variant === 'destructive',
            'border border-theme-input bg-theme-input hover:bg-theme-dropdown-hover text-theme-input': variant === 'outline',
            'bg-theme-button-secondary text-theme-button-secondary hover:opacity-80': variant === 'secondary',
            'hover:bg-theme-dropdown-hover text-theme-primary': variant === 'ghost',
            'text-theme-link underline-offset-4 hover:underline': variant === 'link',
          },
          {
            'h-10 px-4 py-2': size === 'default',
            'h-9 rounded-md px-3': size === 'sm',
            'h-11 rounded-md px-8': size === 'lg',
            'h-10 w-10': size === 'icon',
          },
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'

export { Button } 