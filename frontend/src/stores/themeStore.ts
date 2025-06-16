import { create } from 'zustand'
import type { ThemeProperties, ThemeProperty, ThemePreset } from '../types/theme'
import { themePresets } from '../config/themePresets'
import { saveThemeToStorage, loadThemeFromStorage, loadThemeFromUser } from '../lib/themeStorage'

interface ThemeStore {
  // State
  currentTheme: ThemeProperties
  isThemeModalOpen: boolean
  currentUser: any | null
  
  // Actions
  setThemeProperty: (key: keyof ThemeProperties, property: ThemeProperty) => void
  applyTheme: (theme: ThemePreset) => void
  resetToDefault: () => void
  setThemeModalOpen: (open: boolean) => void
  updateCSSVariables: () => void
  initializeTheme: () => void
  setUser: (user: any | null) => void
  loadUserTheme: (user: any) => void
}

// Default theme (T3 Theme)
const defaultTheme = themePresets[0].properties

// CSS Variable mapping
const cssVariableMap: Record<keyof ThemeProperties, string> = {
  // Core theme properties
  background: '--theme-background',
  textPrimary: '--theme-text-primary',
  textSecondary: '--theme-text-secondary',
  surface: '--theme-surface',
  border: '--theme-border',
  accent: '--theme-accent',
  muted: '--theme-muted',
  cardBackground: '--theme-card-background',
  hoverSurface: '--theme-hover-surface',
  subtitle: '--theme-subtitle',
  
  // Chat-specific properties
  chatUserBubble: '--theme-chat-user-bubble',
  chatAssistantBubble: '--theme-chat-assistant-bubble',
  chatInputBackground: '--theme-chat-input-background',
  chatInputBorder: '--theme-chat-input-border',
  chatHeaderBackground: '--theme-chat-header-background',
  sidebarActiveChat: '--theme-sidebar-active-chat',
  sidebarHoverChat: '--theme-sidebar-hover-chat',
  buttonPrimary: '--theme-button-primary',
  buttonPrimaryText: '--theme-button-primary-text',
  buttonSecondary: '--theme-button-secondary',
  buttonSecondaryText: '--theme-button-secondary-text',
  
  // UI element properties
  modalBackground: '--theme-modal-background',
  modalBorder: '--theme-modal-border',
  dropdownBackground: '--theme-dropdown-background',
  dropdownHover: '--theme-dropdown-hover',
  inputBackground: '--theme-input-background',
  inputBorder: '--theme-input-border',
  inputText: '--theme-input-text',
  linkColor: '--theme-link-color',
  errorColor: '--theme-error-color',
  successColor: '--theme-success-color',
  warningColor: '--theme-warning-color',
  
  // Code syntax highlighting
  codeBackground: '--theme-code-background',
  codeKeyword: '--theme-code-keyword',
  codeString: '--theme-code-string',
  codeNumber: '--theme-code-number',
  codeComment: '--theme-code-comment',
  codeFunction: '--theme-code-function',
  codeVariable: '--theme-code-variable',
}

// Utility function to build gradient CSS
const buildGradientCSS = (gradient: ThemeProperty['gradient']): string => {
  const { type, direction, colors } = gradient
  if (type === 'radial') {
    return `radial-gradient(circle, ${colors.join(', ')})`
  } else {
    return `linear-gradient(${direction}, ${colors.join(', ')})`
  }
}

// Utility function to update CSS variable
const updateCSSVariable = (property: string, value: string): void => {
  document.documentElement.style.setProperty(property, value)
  
  // Fix iOS over-scroll background by updating html and body background
  if (property === '--theme-background') {
    document.documentElement.style.background = value
    document.body.style.background = value
  }
}

export const useThemeStore = create<ThemeStore>((set, get) => ({
  currentTheme: defaultTheme,
  isThemeModalOpen: false,
  currentUser: null,

  setThemeProperty: (key, property) => {
    const { currentTheme, currentUser } = get()
    const newTheme = {
      ...currentTheme,
      [key]: property,
    }
    
    set({ currentTheme: newTheme })
    
    // Update CSS variable immediately
    const cssVar = cssVariableMap[key]
    if (property.mode === 'color') {
      updateCSSVariable(cssVar, property.color)
    } else {
      const gradientCSS = buildGradientCSS(property.gradient)
      updateCSSVariable(cssVar, gradientCSS)
    }
    
    // Save to storage (async) - don't await to keep store method synchronous
    saveThemeToStorage(newTheme, currentUser?.id, 'Custom').catch(error => {
      console.error('Failed to save theme:', error)
    })
  },

  applyTheme: (theme) => {
    const { currentUser } = get()
    set({ currentTheme: theme.properties })
    
    // Apply all properties to CSS immediately
    Object.entries(theme.properties).forEach(([key, property]) => {
      const cssVar = cssVariableMap[key as keyof ThemeProperties]
      if (property.mode === 'color') {
        updateCSSVariable(cssVar, property.color)
      } else {
        const gradientCSS = buildGradientCSS(property.gradient)
        updateCSSVariable(cssVar, gradientCSS)
      }
    })
    
    // Save to storage (async) - don't await to keep store method synchronous
    saveThemeToStorage(theme.properties, currentUser?.id, theme.name).catch(error => {
      console.error('Failed to save theme:', error)
    })
  },

  resetToDefault: () => {
    const { currentUser } = get()
    set({ currentTheme: defaultTheme })
    
    // Apply default theme to CSS
    Object.entries(defaultTheme).forEach(([key, property]) => {
      const cssVar = cssVariableMap[key as keyof ThemeProperties]
      if (property.mode === 'color') {
        updateCSSVariable(cssVar, property.color)
      } else {
        const gradientCSS = buildGradientCSS(property.gradient)
        updateCSSVariable(cssVar, gradientCSS)
      }
    })
    
    // Save to storage (async) - don't await to keep store method synchronous
    saveThemeToStorage(defaultTheme, currentUser?.id, 'T3 Theme').catch(error => {
      console.error('Failed to save theme:', error)
    })
  },

  setThemeModalOpen: (open) => {
    set({ isThemeModalOpen: open })
  },

  updateCSSVariables: () => {
    const { currentTheme } = get()
    
    Object.entries(currentTheme).forEach(([key, property]) => {
      const cssVar = cssVariableMap[key as keyof ThemeProperties]
      if (property.mode === 'color') {
        updateCSSVariable(cssVar, property.color)
      } else {
        const gradientCSS = buildGradientCSS(property.gradient)
        updateCSSVariable(cssVar, gradientCSS)
      }
    })
  },

  initializeTheme: () => {
    // Load theme from storage or use default
    const storedTheme = loadThemeFromStorage()
    const themeToUse = storedTheme || defaultTheme
    
    set({ currentTheme: themeToUse })
    
    // Apply theme to CSS
    Object.entries(themeToUse).forEach(([key, property]) => {
      const cssVar = cssVariableMap[key as keyof ThemeProperties]
      if (property.mode === 'color') {
        updateCSSVariable(cssVar, property.color)
      } else {
        const gradientCSS = buildGradientCSS(property.gradient)
        updateCSSVariable(cssVar, gradientCSS)
      }
    })
  },

  setUser: (user) => {
    console.log('Theme store: Setting user', user?.id, user?.name)
    set({ currentUser: user })
    
    // Load user's theme if available
    if (user) {
      console.log('Theme store: Loading theme for user', user.id)
      const userTheme = loadThemeFromUser(user)
      if (userTheme) {
        console.log('Theme store: Found user theme, applying it')
        set({ currentTheme: userTheme })
        
        // Apply theme to CSS
        Object.entries(userTheme).forEach(([key, property]) => {
          const cssVar = cssVariableMap[key as keyof ThemeProperties]
          if (property.mode === 'color') {
            updateCSSVariable(cssVar, property.color)
          } else {
            const gradientCSS = buildGradientCSS(property.gradient)
            updateCSSVariable(cssVar, gradientCSS)
          }
        })
      } else {
        console.log('Theme store: No user theme found')
      }
    } else {
      console.log('Theme store: No user provided')
    }
  },

  loadUserTheme: (user) => {
    const userTheme = loadThemeFromUser(user)
    if (userTheme) {
      set({ currentTheme: userTheme })
      
      // Apply theme to CSS
      Object.entries(userTheme).forEach(([key, property]) => {
        const cssVar = cssVariableMap[key as keyof ThemeProperties]
        if (property.mode === 'color') {
          updateCSSVariable(cssVar, property.color)
        } else {
          const gradientCSS = buildGradientCSS(property.gradient)
          updateCSSVariable(cssVar, gradientCSS)
        }
      })
    }
  },
})) 