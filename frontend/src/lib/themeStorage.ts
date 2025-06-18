import type { ThemeProperties } from '../types/theme'
import { updateUserProfile } from './auth'

const THEME_STORAGE_KEY = 'app-theme-properties'

// Save theme to both localStorage (for immediate access) and Firestore (for persistence)
export const saveThemeToStorage = async (theme: ThemeProperties, userId?: string, themeName?: string): Promise<void> => {
  try {
    // Always save to localStorage for immediate access
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(theme))
    
    // If user is logged in, also save to Firestore
    if (userId) {
      await updateUserProfile(userId, {
        selectedTheme: themeName || 'Custom',
        customTheme: theme
      })
    } else {
    }
  } catch (error) {
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
  }
  return null
}

// Load theme from user profile (Firestore)
export const loadThemeFromUser = (user: any): ThemeProperties | null => {
  try {
    if (user?.customTheme) {
      // Save to localStorage for immediate access
      localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(user.customTheme))
      return user.customTheme as ThemeProperties
    } else {
    }
  } catch (error) {
  }
  return null
}

// Clear theme from storage
export const clearThemeFromStorage = (): void => {
  try {
    localStorage.removeItem(THEME_STORAGE_KEY)
  } catch (error) {
  }
} 
