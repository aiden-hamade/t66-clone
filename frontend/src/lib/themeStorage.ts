import type { ThemeProperties } from '../types/theme'
import { updateUserProfile } from './auth'

const THEME_STORAGE_KEY = 'app-theme-properties'

// Save theme to both localStorage (for immediate access) and Firestore (for persistence)
export const saveThemeToStorage = async (theme: ThemeProperties, userId?: string, themeName?: string): Promise<void> => {
  try {
    // Always save to localStorage for immediate access
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(theme))
    console.log('Theme saved to localStorage')
    
    // If user is logged in, also save to Firestore
    if (userId) {
      console.log('Saving theme to Firestore for user:', userId, 'Theme name:', themeName)
      await updateUserProfile(userId, {
        selectedTheme: themeName || 'Custom',
        customTheme: theme
      })
      console.log('Theme saved to Firestore successfully')
    } else {
      console.log('No user ID provided, skipping Firestore save')
    }
  } catch (error) {
    console.error('Failed to save theme:', error)
  }
}

// Load theme from localStorage first, then Firestore if available
export const loadThemeFromStorage = (): ThemeProperties | null => {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored) as ThemeProperties
    }
  } catch (error) {
    console.error('Failed to load theme from localStorage:', error)
  }
  return null
}

// Load theme from user profile (Firestore)
export const loadThemeFromUser = (user: any): ThemeProperties | null => {
  try {
    console.log('Loading theme from user:', user?.id, 'Selected theme:', user?.selectedTheme, 'Has custom theme:', !!user?.customTheme)
    if (user?.customTheme) {
      console.log('Found custom theme in user profile, loading it')
      // Save to localStorage for immediate access
      localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(user.customTheme))
      return user.customTheme as ThemeProperties
    } else {
      console.log('No custom theme found in user profile')
    }
  } catch (error) {
    console.error('Failed to load theme from user profile:', error)
  }
  return null
}

// Clear theme from storage
export const clearThemeFromStorage = (): void => {
  try {
    localStorage.removeItem(THEME_STORAGE_KEY)
  } catch (error) {
    console.error('Failed to clear theme from localStorage:', error)
  }
} 