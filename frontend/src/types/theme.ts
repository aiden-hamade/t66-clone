export interface ThemeProperty {
  mode: 'color' | 'gradient'
  color: string
  gradient: {
    type: 'linear' | 'radial'
    direction: string
    colors: string[]
  }
}

export interface ThemeProperties {
  // Core theme properties
  background: ThemeProperty
  textPrimary: ThemeProperty
  textSecondary: ThemeProperty
  surface: ThemeProperty
  border: ThemeProperty
  accent: ThemeProperty
  muted: ThemeProperty
  cardBackground: ThemeProperty
  hoverSurface: ThemeProperty
  subtitle: ThemeProperty
  
  // Chat-specific properties
  chatUserBubble: ThemeProperty
  chatAssistantBubble: ThemeProperty
  chatAssistantText: ThemeProperty
  chatInputBackground: ThemeProperty
  chatInputBorder: ThemeProperty
  chatHeaderBackground: ThemeProperty
  sidebarActiveChat: ThemeProperty
  sidebarHoverChat: ThemeProperty
  buttonPrimary: ThemeProperty
  buttonPrimaryText: ThemeProperty
  buttonSecondary: ThemeProperty
  buttonSecondaryText: ThemeProperty
  
  // UI element properties
  modalBackground: ThemeProperty
  modalBorder: ThemeProperty
  dropdownBackground: ThemeProperty
  dropdownHover: ThemeProperty
  inputBackground: ThemeProperty
  inputBorder: ThemeProperty
  inputText: ThemeProperty
  linkColor: ThemeProperty
  errorColor: ThemeProperty
  successColor: ThemeProperty
  warningColor: ThemeProperty
  
  // Code syntax highlighting
  codeBackground: ThemeProperty
  codeKeyword: ThemeProperty
  codeString: ThemeProperty
  codeNumber: ThemeProperty
  codeComment: ThemeProperty
  codeFunction: ThemeProperty
  codeVariable: ThemeProperty
}

export interface ThemePreset {
  name: string
  description: string
  preview: string[]
  properties: ThemeProperties
}

export interface GradientDirection {
  value: string
  label: string
}

export const gradientDirections: GradientDirection[] = [
  { value: '0deg', label: 'Top to Bottom' },
  { value: '90deg', label: 'Left to Right' },
  { value: '180deg', label: 'Bottom to Top' },
  { value: '270deg', label: 'Right to Left' },
  { value: '45deg', label: 'Top-Left to Bottom-Right' },
  { value: '135deg', label: 'Top-Right to Bottom-Left' },
  { value: '225deg', label: 'Bottom-Right to Top-Left' },
  { value: '315deg', label: 'Bottom-Left to Top-Right' },
]

export const propertyLabels: Record<keyof ThemeProperties, string> = {
  // Core theme properties
  background: 'Background',
  textPrimary: 'Primary Text',
  textSecondary: 'Secondary Text',
  surface: 'Surface',
  border: 'Border',
  accent: 'Accent',
  muted: 'Muted Text',
  cardBackground: 'Card Background',
  hoverSurface: 'Hover Surface',
  subtitle: 'Subtitle Text',
  
  // Chat-specific properties
  chatUserBubble: 'User Message Bubble',
  chatAssistantBubble: 'Assistant Message Bubble',
  chatAssistantText: 'Assistant Text',
  chatInputBackground: 'Chat Input Background',
  chatInputBorder: 'Chat Input Border',
  chatHeaderBackground: 'Chat Header Background',
  sidebarActiveChat: 'Active Chat Background',
  sidebarHoverChat: 'Chat Hover Background',
  buttonPrimary: 'Primary Button',
  buttonPrimaryText: 'Primary Button Text',
  buttonSecondary: 'Secondary Button',
  buttonSecondaryText: 'Secondary Button Text',
  
  // UI element properties
  modalBackground: 'Modal Background',
  modalBorder: 'Modal Border',
  dropdownBackground: 'Dropdown Background',
  dropdownHover: 'Dropdown Hover',
  inputBackground: 'Input Background',
  inputBorder: 'Input Border',
  inputText: 'Input Text',
  linkColor: 'Link Color',
  errorColor: 'Error Color',
  successColor: 'Success Color',
  warningColor: 'Warning Color',
  
  // Code syntax highlighting
  codeBackground: 'Code Background',
  codeKeyword: 'Code Keywords',
  codeString: 'Code Strings',
  codeNumber: 'Code Numbers',
  codeComment: 'Code Comments',
  codeFunction: 'Code Functions',
  codeVariable: 'Code Variables',
} 