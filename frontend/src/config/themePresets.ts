import type { ThemePreset, ThemeProperties } from '../types/theme'

// Helper function to create complete theme properties
const createThemeProperties = (base: Partial<ThemeProperties>): ThemeProperties => {
  const defaults: ThemeProperties = {
    // Core theme properties
    background: { mode: 'color', color: '#000000', gradient: { type: 'linear', direction: '135deg', colors: ['#000000', '#111111'] } },
    textPrimary: { mode: 'color', color: '#ffffff', gradient: { type: 'linear', direction: '135deg', colors: ['#ffffff', '#f9fafb'] } },
    textSecondary: { mode: 'color', color: 'rgba(255, 255, 255, 0.7)', gradient: { type: 'linear', direction: '135deg', colors: ['rgba(255, 255, 255, 0.7)', 'rgba(255, 255, 255, 0.5)'] } },
    surface: { mode: 'color', color: 'rgba(255, 255, 255, 0.05)', gradient: { type: 'linear', direction: '135deg', colors: ['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.03)'] } },
    border: { mode: 'color', color: 'rgba(255, 255, 255, 0.1)', gradient: { type: 'linear', direction: '135deg', colors: ['rgba(255, 255, 255, 0.15)', 'rgba(255, 255, 255, 0.05)'] } },
    accent: { mode: 'color', color: '#6b7280', gradient: { type: 'linear', direction: '135deg', colors: ['#6b7280', '#9ca3af'] } },
    muted: { mode: 'color', color: '#9ca3af', gradient: { type: 'linear', direction: '135deg', colors: ['#9ca3af', '#6b7280'] } },
    cardBackground: { mode: 'color', color: 'rgba(255, 255, 255, 0.05)', gradient: { type: 'linear', direction: '135deg', colors: ['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.03)'] } },
    hoverSurface: { mode: 'color', color: 'rgba(255, 255, 255, 0.08)', gradient: { type: 'linear', direction: '135deg', colors: ['rgba(255, 255, 255, 0.12)', 'rgba(255, 255, 255, 0.04)'] } },
    subtitle: { mode: 'color', color: '#6b7280', gradient: { type: 'linear', direction: '135deg', colors: ['#6b7280', '#9ca3af'] } },
    
    // Chat-specific properties
    chatUserBubble: { mode: 'color', color: '#3b82f6', gradient: { type: 'linear', direction: '135deg', colors: ['#3b82f6', '#2563eb'] } },
    chatAssistantBubble: { mode: 'color', color: 'rgba(255, 255, 255, 0.05)', gradient: { type: 'linear', direction: '135deg', colors: ['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.03)'] } },
    chatInputBackground: { mode: 'color', color: 'rgba(255, 255, 255, 0.05)', gradient: { type: 'linear', direction: '135deg', colors: ['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.03)'] } },
    chatInputBorder: { mode: 'color', color: 'rgba(255, 255, 255, 0.1)', gradient: { type: 'linear', direction: '135deg', colors: ['rgba(255, 255, 255, 0.15)', 'rgba(255, 255, 255, 0.05)'] } },
    chatHeaderBackground: { mode: 'color', color: 'rgba(255, 255, 255, 0.05)', gradient: { type: 'linear', direction: '135deg', colors: ['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.03)'] } },
    sidebarActiveChat: { mode: 'color', color: 'rgba(59, 130, 246, 0.2)', gradient: { type: 'linear', direction: '135deg', colors: ['rgba(59, 130, 246, 0.3)', 'rgba(59, 130, 246, 0.1)'] } },
    sidebarHoverChat: { mode: 'color', color: 'rgba(255, 255, 255, 0.08)', gradient: { type: 'linear', direction: '135deg', colors: ['rgba(255, 255, 255, 0.12)', 'rgba(255, 255, 255, 0.04)'] } },
    buttonPrimary: { mode: 'color', color: '#3b82f6', gradient: { type: 'linear', direction: '135deg', colors: ['#3b82f6', '#2563eb'] } },
    buttonPrimaryText: { mode: 'color', color: '#ffffff', gradient: { type: 'linear', direction: '135deg', colors: ['#ffffff', '#f9fafb'] } },
    buttonSecondary: { mode: 'color', color: 'rgba(255, 255, 255, 0.1)', gradient: { type: 'linear', direction: '135deg', colors: ['rgba(255, 255, 255, 0.15)', 'rgba(255, 255, 255, 0.05)'] } },
    buttonSecondaryText: { mode: 'color', color: 'rgba(255, 255, 255, 0.7)', gradient: { type: 'linear', direction: '135deg', colors: ['rgba(255, 255, 255, 0.7)', 'rgba(255, 255, 255, 0.5)'] } },
    
    // UI element properties
    modalBackground: { mode: 'color', color: 'rgba(255, 255, 255, 0.05)', gradient: { type: 'linear', direction: '135deg', colors: ['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.03)'] } },
    modalBorder: { mode: 'color', color: 'rgba(255, 255, 255, 0.1)', gradient: { type: 'linear', direction: '135deg', colors: ['rgba(255, 255, 255, 0.15)', 'rgba(255, 255, 255, 0.05)'] } },
    dropdownBackground: { mode: 'color', color: 'rgba(255, 255, 255, 0.05)', gradient: { type: 'linear', direction: '135deg', colors: ['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.03)'] } },
    dropdownHover: { mode: 'color', color: 'rgba(255, 255, 255, 0.08)', gradient: { type: 'linear', direction: '135deg', colors: ['rgba(255, 255, 255, 0.12)', 'rgba(255, 255, 255, 0.04)'] } },
    inputBackground: { mode: 'color', color: 'rgba(255, 255, 255, 0.05)', gradient: { type: 'linear', direction: '135deg', colors: ['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.03)'] } },
    inputBorder: { mode: 'color', color: 'rgba(255, 255, 255, 0.1)', gradient: { type: 'linear', direction: '135deg', colors: ['rgba(255, 255, 255, 0.15)', 'rgba(255, 255, 255, 0.05)'] } },
    inputText: { mode: 'color', color: '#ffffff', gradient: { type: 'linear', direction: '135deg', colors: ['#ffffff', '#f9fafb'] } },
    linkColor: { mode: 'color', color: '#3b82f6', gradient: { type: 'linear', direction: '135deg', colors: ['#3b82f6', '#2563eb'] } },
    errorColor: { mode: 'color', color: '#ef4444', gradient: { type: 'linear', direction: '135deg', colors: ['#ef4444', '#dc2626'] } },
    successColor: { mode: 'color', color: '#10b981', gradient: { type: 'linear', direction: '135deg', colors: ['#10b981', '#059669'] } },
    warningColor: { mode: 'color', color: '#f59e0b', gradient: { type: 'linear', direction: '135deg', colors: ['#f59e0b', '#d97706'] } },
    
    // Code syntax highlighting
    codeBackground: { mode: 'color', color: 'rgba(0, 0, 0, 0.5)', gradient: { type: 'linear', direction: '135deg', colors: ['rgba(0, 0, 0, 0.5)', 'rgba(0, 0, 0, 0.3)'] } },
    codeKeyword: { mode: 'color', color: '#a855f7', gradient: { type: 'linear', direction: '135deg', colors: ['#a855f7', '#9333ea'] } },
    codeString: { mode: 'color', color: '#10b981', gradient: { type: 'linear', direction: '135deg', colors: ['#10b981', '#059669'] } },
    codeNumber: { mode: 'color', color: '#3b82f6', gradient: { type: 'linear', direction: '135deg', colors: ['#3b82f6', '#2563eb'] } },
    codeComment: { mode: 'color', color: '#6b7280', gradient: { type: 'linear', direction: '135deg', colors: ['#6b7280', '#4b5563'] } },
    codeFunction: { mode: 'color', color: '#f59e0b', gradient: { type: 'linear', direction: '135deg', colors: ['#f59e0b', '#d97706'] } },
    codeVariable: { mode: 'color', color: '#ef4444', gradient: { type: 'linear', direction: '135deg', colors: ['#ef4444', '#dc2626'] } },
  }
  
  return { ...defaults, ...base }
}

export const themePresets: ThemePreset[] = [
  {
    name: 'T3 Theme',
    description: 'Official T3 Stack colors with elegant purple tones',
    preview: ['#241f29', '#571a5b', '#d47de1'],
    properties: createThemeProperties({
      background: { mode: 'color', color: '#241f29', gradient: { type: 'linear', direction: '135deg', colors: ['#241f29', '#1a1420'] } },
      textPrimary: { mode: 'color', color: '#ffffff', gradient: { type: 'linear', direction: '135deg', colors: ['#ffffff', '#f9fafb'] } },
      textSecondary: { mode: 'color', color: '#c9bcd7', gradient: { type: 'linear', direction: '135deg', colors: ['#c9bcd7', '#a996b7'] } },
      surface: { mode: 'gradient', color: '#1c141a', gradient: { type: 'linear', direction: '135deg', colors: ['#1c141a', '#0e090d'] } },
      border: { mode: 'color', color: 'rgba(157, 73, 212, 0.1)', gradient: { type: 'linear', direction: '135deg', colors: ['rgba(157, 73, 212, 0.15)', 'rgba(157, 73, 212, 0.05)'] } },
      accent: { mode: 'color', color: '#571a5b', gradient: { type: 'linear', direction: '135deg', colors: ['#571a5b', '#3d1242'] } },
      muted: { mode: 'color', color: '#94a3b8', gradient: { type: 'linear', direction: '135deg', colors: ['#94a3b8', '#64748b'] } },
      cardBackground: { mode: 'gradient', color: '#2a1f2e', gradient: { type: 'linear', direction: '135deg', colors: ['#2a1f2e', '#1f1823'] } },
      hoverSurface: { mode: 'color', color: 'rgba(189, 17, 192, 0.05)', gradient: { type: 'linear', direction: '135deg', colors: ['rgba(189, 17, 192, 0.08)', 'rgba(189, 17, 192, 0.02)'] } },
      subtitle: { mode: 'gradient', color: '#d47de1', gradient: { type: 'linear', direction: '135deg', colors: ['#d47de1', '#e078d0'] } },
      chatUserBubble: { mode: 'gradient', color: '#571a5b', gradient: { type: 'linear', direction: '135deg', colors: ['#571a5b', '#7c2d91'] } },
      chatAssistantBubble: { mode: 'gradient', color: '#2a1f2e', gradient: { type: 'linear', direction: '135deg', colors: ['#2a1f2e', '#1f1823'] } },
      chatInputBackground: { mode: 'color', color: '#2a1f2e', gradient: { type: 'linear', direction: '135deg', colors: ['#2a1f2e', '#1f1823'] } },
      chatInputBorder: { mode: 'color', color: 'rgba(157, 73, 212, 0.2)', gradient: { type: 'linear', direction: '135deg', colors: ['rgba(157, 73, 212, 0.3)', 'rgba(157, 73, 212, 0.1)'] } },
      chatHeaderBackground: { mode: 'gradient', color: '#2a1f2e', gradient: { type: 'linear', direction: '135deg', colors: ['#2a1f2e', '#1f1823'] } },
      sidebarActiveChat: { mode: 'gradient', color: '#571a5b', gradient: { type: 'linear', direction: '135deg', colors: ['rgba(87, 26, 91, 0.3)', 'rgba(87, 26, 91, 0.1)'] } },
      sidebarHoverChat: { mode: 'color', color: 'rgba(189, 17, 192, 0.1)', gradient: { type: 'linear', direction: '135deg', colors: ['rgba(189, 17, 192, 0.15)', 'rgba(189, 17, 192, 0.05)'] } },
      buttonPrimary: { mode: 'gradient', color: '#571a5b', gradient: { type: 'linear', direction: '135deg', colors: ['#571a5b', '#7c2d91'] } },
      buttonPrimaryText: { mode: 'color', color: '#ffffff', gradient: { type: 'linear', direction: '135deg', colors: ['#ffffff', '#f9fafb'] } },
      buttonSecondary: { mode: 'color', color: 'rgba(157, 73, 212, 0.1)', gradient: { type: 'linear', direction: '135deg', colors: ['rgba(157, 73, 212, 0.15)', 'rgba(157, 73, 212, 0.05)'] } },
      buttonSecondaryText: { mode: 'color', color: '#c9bcd7', gradient: { type: 'linear', direction: '135deg', colors: ['#c9bcd7', '#a996b7'] } },
      modalBackground: { mode: 'gradient', color: '#2a1f2e', gradient: { type: 'linear', direction: '135deg', colors: ['#2a1f2e', '#1f1823'] } },
      modalBorder: { mode: 'color', color: 'rgba(157, 73, 212, 0.2)', gradient: { type: 'linear', direction: '135deg', colors: ['rgba(157, 73, 212, 0.3)', 'rgba(157, 73, 212, 0.1)'] } },
      dropdownBackground: { mode: 'gradient', color: '#2a1f2e', gradient: { type: 'linear', direction: '135deg', colors: ['#2a1f2e', '#1f1823'] } },
      dropdownHover: { mode: 'color', color: 'rgba(189, 17, 192, 0.1)', gradient: { type: 'linear', direction: '135deg', colors: ['rgba(189, 17, 192, 0.15)', 'rgba(189, 17, 192, 0.05)'] } },
      inputBackground: { mode: 'color', color: '#2a1f2e', gradient: { type: 'linear', direction: '135deg', colors: ['#2a1f2e', '#1f1823'] } },
      inputBorder: { mode: 'color', color: 'rgba(157, 73, 212, 0.2)', gradient: { type: 'linear', direction: '135deg', colors: ['rgba(157, 73, 212, 0.3)', 'rgba(157, 73, 212, 0.1)'] } },
      inputText: { mode: 'color', color: '#ffffff', gradient: { type: 'linear', direction: '135deg', colors: ['#ffffff', '#f9fafb'] } },
      linkColor: { mode: 'gradient', color: '#d47de1', gradient: { type: 'linear', direction: '135deg', colors: ['#d47de1', '#e078d0'] } },
      codeBackground: { mode: 'color', color: '#1a1420', gradient: { type: 'linear', direction: '135deg', colors: ['#1a1420', '#0f0b13'] } },
      codeKeyword: { mode: 'color', color: '#d47de1', gradient: { type: 'linear', direction: '135deg', colors: ['#d47de1', '#e078d0'] } },
    })
  },
  {
    name: 'Cyberpunk',
    description: 'Neon purple and blue with dark backgrounds',
    preview: ['#0a0a0a', '#8b5cf6', '#3b82f6'],
    properties: createThemeProperties({
      background: { mode: 'gradient', color: '#0a0a0a', gradient: { type: 'linear', direction: '135deg', colors: ['#0a0a0a', '#1a1a2e'] } },
      surface: { mode: 'gradient', color: 'rgba(255, 255, 255, 0.08)', gradient: { type: 'linear', direction: '135deg', colors: ['rgba(255, 255, 255, 0.12)', 'rgba(255, 255, 255, 0.06)'] } },
      border: { mode: 'gradient', color: 'rgba(255, 255, 255, 0.15)', gradient: { type: 'linear', direction: '135deg', colors: ['rgba(139, 92, 246, 0.3)', 'rgba(59, 130, 246, 0.2)'] } },
      accent: { mode: 'gradient', color: '#8b5cf6', gradient: { type: 'linear', direction: '135deg', colors: ['#8b5cf6', '#3b82f6'] } },
      chatUserBubble: { mode: 'gradient', color: '#8b5cf6', gradient: { type: 'linear', direction: '135deg', colors: ['#8b5cf6', '#3b82f6'] } },
      buttonPrimary: { mode: 'gradient', color: '#8b5cf6', gradient: { type: 'linear', direction: '135deg', colors: ['#8b5cf6', '#3b82f6'] } },
      sidebarActiveChat: { mode: 'gradient', color: 'rgba(139, 92, 246, 0.2)', gradient: { type: 'linear', direction: '135deg', colors: ['rgba(139, 92, 246, 0.3)', 'rgba(59, 130, 246, 0.2)'] } },
      linkColor: { mode: 'gradient', color: '#8b5cf6', gradient: { type: 'linear', direction: '135deg', colors: ['#8b5cf6', '#3b82f6'] } },
    })
  },
  {
    name: 'Ocean Depths',
    description: 'Deep blues and teals with aquatic vibes',
    preview: ['#0f172a', '#0ea5e9', '#06b6d4'],
    properties: createThemeProperties({
      background: { mode: 'gradient', color: '#0f172a', gradient: { type: 'linear', direction: '135deg', colors: ['#0f172a', '#1e293b'] } },
      surface: { mode: 'gradient', color: 'rgba(255, 255, 255, 0.08)', gradient: { type: 'linear', direction: '135deg', colors: ['rgba(14, 165, 233, 0.1)', 'rgba(6, 182, 212, 0.05)'] } },
      border: { mode: 'gradient', color: 'rgba(255, 255, 255, 0.15)', gradient: { type: 'linear', direction: '135deg', colors: ['rgba(14, 165, 233, 0.4)', 'rgba(6, 182, 212, 0.2)'] } },
      accent: { mode: 'gradient', color: '#0ea5e9', gradient: { type: 'linear', direction: '135deg', colors: ['#0ea5e9', '#06b6d4'] } },
      chatUserBubble: { mode: 'gradient', color: '#0ea5e9', gradient: { type: 'linear', direction: '135deg', colors: ['#0ea5e9', '#06b6d4'] } },
      buttonPrimary: { mode: 'gradient', color: '#0ea5e9', gradient: { type: 'linear', direction: '135deg', colors: ['#0ea5e9', '#06b6d4'] } },
      sidebarActiveChat: { mode: 'gradient', color: 'rgba(14, 165, 233, 0.2)', gradient: { type: 'linear', direction: '135deg', colors: ['rgba(14, 165, 233, 0.3)', 'rgba(6, 182, 212, 0.2)'] } },
      linkColor: { mode: 'gradient', color: '#06b6d4', gradient: { type: 'linear', direction: '135deg', colors: ['#06b6d4', '#0891b2'] } },
    })
  },
  {
    name: 'Sunset Vibes',
    description: 'Warm oranges and reds with cozy atmosphere',
    preview: ['#1a1a1a', '#f97316', '#ef4444'],
    properties: createThemeProperties({
      background: { mode: 'gradient', color: '#1a1a1a', gradient: { type: 'linear', direction: '135deg', colors: ['#1a1a1a', '#2d1b1b'] } },
      surface: { mode: 'gradient', color: 'rgba(255, 255, 255, 0.08)', gradient: { type: 'linear', direction: '135deg', colors: ['rgba(249, 115, 22, 0.1)', 'rgba(239, 68, 68, 0.05)'] } },
      border: { mode: 'gradient', color: 'rgba(255, 255, 255, 0.15)', gradient: { type: 'linear', direction: '135deg', colors: ['rgba(249, 115, 22, 0.3)', 'rgba(239, 68, 68, 0.2)'] } },
      accent: { mode: 'gradient', color: '#f97316', gradient: { type: 'linear', direction: '135deg', colors: ['#f97316', '#ef4444'] } },
      chatUserBubble: { mode: 'gradient', color: '#f97316', gradient: { type: 'linear', direction: '135deg', colors: ['#f97316', '#ef4444'] } },
      buttonPrimary: { mode: 'gradient', color: '#f97316', gradient: { type: 'linear', direction: '135deg', colors: ['#f97316', '#ef4444'] } },
      sidebarActiveChat: { mode: 'gradient', color: 'rgba(249, 115, 22, 0.2)', gradient: { type: 'linear', direction: '135deg', colors: ['rgba(249, 115, 22, 0.3)', 'rgba(239, 68, 68, 0.2)'] } },
      linkColor: { mode: 'gradient', color: '#f97316', gradient: { type: 'linear', direction: '135deg', colors: ['#f97316', '#fb923c'] } },
    })
  },
  {
    name: 'Forest Green',
    description: 'Natural greens with earthy tones',
    preview: ['#0f1419', '#10b981', '#059669'],
    properties: createThemeProperties({
      background: { mode: 'gradient', color: '#0f1419', gradient: { type: 'linear', direction: '135deg', colors: ['#0f1419', '#1b2e1b'] } },
      surface: { mode: 'gradient', color: 'rgba(255, 255, 255, 0.08)', gradient: { type: 'linear', direction: '135deg', colors: ['rgba(16, 185, 129, 0.1)', 'rgba(5, 150, 105, 0.05)'] } },
      border: { mode: 'gradient', color: 'rgba(255, 255, 255, 0.15)', gradient: { type: 'linear', direction: '135deg', colors: ['rgba(16, 185, 129, 0.3)', 'rgba(5, 150, 105, 0.2)'] } },
      accent: { mode: 'gradient', color: '#10b981', gradient: { type: 'linear', direction: '135deg', colors: ['#10b981', '#059669'] } },
      chatUserBubble: { mode: 'gradient', color: '#10b981', gradient: { type: 'linear', direction: '135deg', colors: ['#10b981', '#059669'] } },
      buttonPrimary: { mode: 'gradient', color: '#10b981', gradient: { type: 'linear', direction: '135deg', colors: ['#10b981', '#059669'] } },
      sidebarActiveChat: { mode: 'gradient', color: 'rgba(16, 185, 129, 0.2)', gradient: { type: 'linear', direction: '135deg', colors: ['rgba(16, 185, 129, 0.3)', 'rgba(5, 150, 105, 0.2)'] } },
      linkColor: { mode: 'gradient', color: '#10b981', gradient: { type: 'linear', direction: '135deg', colors: ['#10b981', '#34d399'] } },
    })
  },
  {
    name: 'Royal Purple',
    description: 'Elegant purples with luxurious feel',
    preview: ['#1e1b4b', '#7c3aed', '#a855f7'],
    properties: createThemeProperties({
      background: { mode: 'gradient', color: '#1e1b4b', gradient: { type: 'linear', direction: '135deg', colors: ['#1e1b4b', '#312e81'] } },
      surface: { mode: 'gradient', color: 'rgba(255, 255, 255, 0.08)', gradient: { type: 'linear', direction: '135deg', colors: ['rgba(124, 58, 237, 0.1)', 'rgba(168, 85, 247, 0.05)'] } },
      border: { mode: 'gradient', color: 'rgba(255, 255, 255, 0.15)', gradient: { type: 'linear', direction: '135deg', colors: ['rgba(124, 58, 237, 0.4)', 'rgba(168, 85, 247, 0.25)'] } },
      accent: { mode: 'gradient', color: '#7c3aed', gradient: { type: 'linear', direction: '135deg', colors: ['#7c3aed', '#a855f7'] } },
      chatUserBubble: { mode: 'gradient', color: '#7c3aed', gradient: { type: 'linear', direction: '135deg', colors: ['#7c3aed', '#a855f7'] } },
      buttonPrimary: { mode: 'gradient', color: '#7c3aed', gradient: { type: 'linear', direction: '135deg', colors: ['#7c3aed', '#a855f7'] } },
      sidebarActiveChat: { mode: 'gradient', color: 'rgba(124, 58, 237, 0.2)', gradient: { type: 'linear', direction: '135deg', colors: ['rgba(124, 58, 237, 0.3)', 'rgba(168, 85, 247, 0.2)'] } },
      linkColor: { mode: 'gradient', color: '#a855f7', gradient: { type: 'linear', direction: '135deg', colors: ['#a855f7', '#c084fc'] } },
    })
  },
  {
    name: 'Monochrome',
    description: 'Classic black and white with subtle grays',
    preview: ['#000000', '#6b7280', '#ffffff'],
    properties: createThemeProperties({
      background: { mode: 'gradient', color: '#000000', gradient: { type: 'linear', direction: '135deg', colors: ['#000000', '#111827'] } },
      textSecondary: { mode: 'color', color: 'rgba(255, 255, 255, 0.7)', gradient: { type: 'linear', direction: '135deg', colors: ['rgba(255, 255, 255, 0.7)', 'rgba(255, 255, 255, 0.5)'] } },
      surface: { mode: 'color', color: 'rgba(255, 255, 255, 0.05)', gradient: { type: 'linear', direction: '135deg', colors: ['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.03)'] } },
      border: { mode: 'color', color: 'rgba(255, 255, 255, 0.1)', gradient: { type: 'linear', direction: '135deg', colors: ['rgba(255, 255, 255, 0.15)', 'rgba(255, 255, 255, 0.05)'] } },
      accent: { mode: 'color', color: '#6b7280', gradient: { type: 'linear', direction: '135deg', colors: ['#6b7280', '#9ca3af'] } },
      muted: { mode: 'color', color: '#9ca3af', gradient: { type: 'linear', direction: '135deg', colors: ['#9ca3af', '#6b7280'] } },
      cardBackground: { mode: 'color', color: 'rgba(255, 255, 255, 0.05)', gradient: { type: 'linear', direction: '135deg', colors: ['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.03)'] } },
      hoverSurface: { mode: 'color', color: 'rgba(255, 255, 255, 0.08)', gradient: { type: 'linear', direction: '135deg', colors: ['rgba(255, 255, 255, 0.12)', 'rgba(255, 255, 255, 0.04)'] } },
      subtitle: { mode: 'gradient', color: '#6b7280', gradient: { type: 'linear', direction: '135deg', colors: ['#6b7280', '#9ca3af'] } },
      chatUserBubble: { mode: 'color', color: '#6b7280', gradient: { type: 'linear', direction: '135deg', colors: ['#6b7280', '#9ca3af'] } },
      buttonPrimary: { mode: 'color', color: '#6b7280', gradient: { type: 'linear', direction: '135deg', colors: ['#6b7280', '#9ca3af'] } },
      sidebarActiveChat: { mode: 'color', color: 'rgba(107, 114, 128, 0.2)', gradient: { type: 'linear', direction: '135deg', colors: ['rgba(107, 114, 128, 0.3)', 'rgba(107, 114, 128, 0.1)'] } },
      linkColor: { mode: 'color', color: '#6b7280', gradient: { type: 'linear', direction: '135deg', colors: ['#6b7280', '#9ca3af'] } },
    })
  }
] 