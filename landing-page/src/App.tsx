import { useState, useEffect, useCallback } from 'react'
import { flushSync } from 'react-dom'
import wip from './assets/wip.webp'
import './App.css'

function App() {
  /* State Management */
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isThemesModalOpen, setIsThemesModalOpen] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  /* Default Style Properties - T3 Theme */
  const [styleProperties, setStyleProperties] = useState({
    background: {
      mode: 'color' as 'color' | 'gradient',
      color: '#241f29',
      gradient: {
        type: 'linear',
        direction: '135deg',
        colors: ['#241f29', '#1a1420'],
      },
    },
    textPrimary: {
      mode: 'color' as 'color' | 'gradient',
      color: '#ffffff',
      gradient: {
        type: 'linear',
        direction: '135deg',
        colors: ['#ffffff', '#f9fafb'],
      },
    },
    textSecondary: {
      mode: 'color' as 'color' | 'gradient',
      color: '#c9bcd7',
      gradient: {
        type: 'linear',
        direction: '135deg',
        colors: ['#c9bcd7', '#a996b7'],
      },
    },
    surface: {
      mode: 'gradient' as 'color' | 'gradient',
      color: '#1c141a',
      gradient: {
        type: 'linear',
        direction: '135deg',
        colors: ['#1c141a', '#0e090d'],
      },
    },
    border: {
      mode: 'color' as 'color' | 'gradient',
      color: 'rgba(157, 73, 212, 0.1)',
      gradient: {
        type: 'linear',
        direction: '135deg',
        colors: ['rgba(157, 73, 212, 0.15)', 'rgba(157, 73, 212, 0.05)'],
      },
    },
    accent: {
      mode: 'color' as 'color' | 'gradient',
      color: '#571a5b',
      gradient: {
        type: 'linear',
        direction: '135deg',
        colors: ['#571a5b', '#3d1242'],
      },
    },
    muted: {
      mode: 'color' as 'color' | 'gradient',
      color: '#94a3b8',
      gradient: {
        type: 'linear',
        direction: '135deg',
        colors: ['#94a3b8', '#64748b'],
      },
    },
    cardBackground: {
      mode: 'gradient' as 'color' | 'gradient',
      color: '#ffffff',
      gradient: {
        type: 'linear',
        direction: '135deg',
        colors: ['#ffffff', '#f0fdf4'],
      },
    },
    hoverSurface: {
      mode: 'color' as 'color' | 'gradient',
      color: 'rgba(189, 17, 192, 0.05)',
      gradient: {
        type: 'linear',
        direction: '135deg',
        colors: ['rgba(189, 17, 192, 0.08)', 'rgba(189, 17, 192, 0.02)'],
      },
    },
    subtitle: {
      mode: 'gradient' as 'color' | 'gradient',
      color: '#d47de1',
      gradient: {
        type: 'linear',
        direction: '135deg',
        colors: ['#d47de1', '#e078d0'],
      },
    },
  });

  /* Navigation Links */
  const links = [
    { title: 'Documentation', url: 'https://example.com/docs' },
    { title: 'GitHub Repo', url: 'https://github.com/aiden-hamade/t66-clone' },
    { title: 'Live Demo', url: 'https://example.com/demo' },
  ];

  /* Theme Presets */
  const themePresets = [
    {
      name: 'Cyberpunk',
      description: 'Neon purple and blue with dark backgrounds',
      preview: ['#0a0a0a', '#8b5cf6', '#3b82f6'],
      properties: {
        background: { mode: 'gradient', color: '#0a0a0a', gradient: { type: 'linear', direction: '135deg', colors: ['#0a0a0a', '#1a1a2e'] } },
        textPrimary: { mode: 'color', color: '#ffffff', gradient: { type: 'linear', direction: '135deg', colors: ['#ffffff', '#e0e7ff'] } },
        textSecondary: { mode: 'color', color: 'rgba(255, 255, 255, 0.8)', gradient: { type: 'linear', direction: '135deg', colors: ['rgba(255, 255, 255, 0.8)', 'rgba(255, 255, 255, 0.6)'] } },
        surface: { mode: 'gradient', color: 'rgba(255, 255, 255, 0.08)', gradient: { type: 'linear', direction: '135deg', colors: ['rgba(255, 255, 255, 0.12)', 'rgba(255, 255, 255, 0.06)'] } },
        border: { mode: 'gradient', color: 'rgba(255, 255, 255, 0.15)', gradient: { type: 'linear', direction: '135deg', colors: ['rgba(139, 92, 246, 0.3)', 'rgba(59, 130, 246, 0.2)'] } },
        accent: { mode: 'gradient', color: '#8b5cf6', gradient: { type: 'linear', direction: '135deg', colors: ['#8b5cf6', '#3b82f6'] } },
        muted: { mode: 'color', color: '#94a3b8', gradient: { type: 'linear', direction: '135deg', colors: ['#94a3b8', '#64748b'] } },
        cardBackground: { mode: 'gradient', color: '#ffffff', gradient: { type: 'linear', direction: '135deg', colors: ['#ffffff', '#f8fafc'] } },
        hoverSurface: { mode: 'gradient', color: 'rgba(255, 255, 255, 0.12)', gradient: { type: 'linear', direction: '135deg', colors: ['rgba(139, 92, 246, 0.2)', 'rgba(59, 130, 246, 0.15)'] } },
        subtitle: { mode: 'gradient', color: '#d37de1', gradient: { type: 'linear', direction: '135deg', colors: ['#d37de1', '#e179d1'] } },
      }
    },
    {
      name: 'Ocean Depths',
      description: 'Deep blues and teals with aquatic vibes',
      preview: ['#0f172a', '#0ea5e9', '#06b6d4'],
      properties: {
        background: { mode: 'gradient', color: '#0f172a', gradient: { type: 'linear', direction: '135deg', colors: ['#0f172a', '#1e293b'] } },
        textPrimary: { mode: 'color', color: '#ffffff', gradient: { type: 'linear', direction: '135deg', colors: ['#ffffff', '#e0f2fe'] } },
        textSecondary: { mode: 'color', color: 'rgba(255, 255, 255, 0.8)', gradient: { type: 'linear', direction: '135deg', colors: ['rgba(255, 255, 255, 0.8)', 'rgba(255, 255, 255, 0.6)'] } },
        surface: { mode: 'gradient', color: 'rgba(255, 255, 255, 0.08)', gradient: { type: 'linear', direction: '135deg', colors: ['rgba(14, 165, 233, 0.1)', 'rgba(6, 182, 212, 0.05)'] } },
        border: { mode: 'gradient', color: 'rgba(255, 255, 255, 0.15)', gradient: { type: 'linear', direction: '135deg', colors: ['rgba(14, 165, 233, 0.4)', 'rgba(6, 182, 212, 0.2)'] } },
        accent: { mode: 'gradient', color: '#0ea5e9', gradient: { type: 'linear', direction: '135deg', colors: ['#0ea5e9', '#06b6d4'] } },
        muted: { mode: 'color', color: '#94a3b8', gradient: { type: 'linear', direction: '135deg', colors: ['#94a3b8', '#64748b'] } },
        cardBackground: { mode: 'gradient', color: '#ffffff', gradient: { type: 'linear', direction: '135deg', colors: ['#ffffff', '#f0f9ff'] } },
        hoverSurface: { mode: 'gradient', color: 'rgba(255, 255, 255, 0.12)', gradient: { type: 'linear', direction: '135deg', colors: ['rgba(14, 165, 233, 0.15)', 'rgba(6, 182, 212, 0.1)'] } },
        subtitle: { mode: 'gradient', color: '#06b6d4', gradient: { type: 'linear', direction: '135deg', colors: ['#06b6d4', '#0891b2'] } },
      }
    },
    {
      name: 'Sunset Vibes',
      description: 'Warm oranges and reds with cozy atmosphere',
      preview: ['#1a1a1a', '#f97316', '#ef4444'],
      properties: {
        background: { mode: 'gradient', color: '#1a1a1a', gradient: { type: 'linear', direction: '135deg', colors: ['#1a1a1a', '#2d1b1b'] } },
        textPrimary: { mode: 'color', color: '#ffffff', gradient: { type: 'linear', direction: '135deg', colors: ['#ffffff', '#fef3c7'] } },
        textSecondary: { mode: 'color', color: 'rgba(255, 255, 255, 0.8)', gradient: { type: 'linear', direction: '135deg', colors: ['rgba(255, 255, 255, 0.8)', 'rgba(255, 255, 255, 0.6)'] } },
        surface: { mode: 'gradient', color: 'rgba(255, 255, 255, 0.08)', gradient: { type: 'linear', direction: '135deg', colors: ['rgba(249, 115, 22, 0.1)', 'rgba(239, 68, 68, 0.05)'] } },
        border: { mode: 'gradient', color: 'rgba(255, 255, 255, 0.15)', gradient: { type: 'linear', direction: '135deg', colors: ['rgba(249, 115, 22, 0.3)', 'rgba(239, 68, 68, 0.2)'] } },
        accent: { mode: 'gradient', color: '#f97316', gradient: { type: 'linear', direction: '135deg', colors: ['#f97316', '#ef4444'] } },
        muted: { mode: 'color', color: '#94a3b8', gradient: { type: 'linear', direction: '135deg', colors: ['#94a3b8', '#64748b'] } },
        cardBackground: { mode: 'gradient', color: '#ffffff', gradient: { type: 'linear', direction: '135deg', colors: ['#ffffff', '#fffbeb'] } },
        hoverSurface: { mode: 'gradient', color: 'rgba(255, 255, 255, 0.12)', gradient: { type: 'linear', direction: '135deg', colors: ['rgba(249, 115, 22, 0.15)', 'rgba(239, 68, 68, 0.1)'] } },
        subtitle: { mode: 'gradient', color: '#f97316', gradient: { type: 'linear', direction: '135deg', colors: ['#f97316', '#fb923c'] } },
      }
    },
    {
      name: 'Forest Green',
      description: 'Natural greens with earthy tones',
      preview: ['#0f1419', '#10b981', '#059669'],
      properties: {
        background: { mode: 'gradient', color: '#0f1419', gradient: { type: 'linear', direction: '135deg', colors: ['#0f1419', '#1b2e1b'] } },
        textPrimary: { mode: 'color', color: '#ffffff', gradient: { type: 'linear', direction: '135deg', colors: ['#ffffff', '#ecfdf5'] } },
        textSecondary: { mode: 'color', color: 'rgba(255, 255, 255, 0.8)', gradient: { type: 'linear', direction: '135deg', colors: ['rgba(255, 255, 255, 0.8)', 'rgba(255, 255, 255, 0.6)'] } },
        surface: { mode: 'gradient', color: 'rgba(255, 255, 255, 0.08)', gradient: { type: 'linear', direction: '135deg', colors: ['rgba(16, 185, 129, 0.1)', 'rgba(5, 150, 105, 0.05)'] } },
        border: { mode: 'gradient', color: 'rgba(255, 255, 255, 0.15)', gradient: { type: 'linear', direction: '135deg', colors: ['rgba(16, 185, 129, 0.3)', 'rgba(5, 150, 105, 0.2)'] } },
        accent: { mode: 'gradient', color: '#10b981', gradient: { type: 'linear', direction: '135deg', colors: ['#10b981', '#059669'] } },
        muted: { mode: 'color', color: '#94a3b8', gradient: { type: 'linear', direction: '135deg', colors: ['#94a3b8', '#64748b'] } },
        cardBackground: { mode: 'gradient', color: '#ffffff', gradient: { type: 'linear', direction: '135deg', colors: ['#ffffff', '#f0fdf4'] } },
        hoverSurface: { mode: 'gradient', color: 'rgba(255, 255, 255, 0.12)', gradient: { type: 'linear', direction: '135deg', colors: ['rgba(16, 185, 129, 0.15)', 'rgba(5, 150, 105, 0.1)'] } },
        subtitle: { mode: 'gradient', color: '#10b981', gradient: { type: 'linear', direction: '135deg', colors: ['#10b981', '#34d399'] } },
      }
    },
    {
      name: 'Royal Purple',
      description: 'Elegant purples with luxurious feel',
      preview: ['#1e1b4b', '#7c3aed', '#a855f7'],
      properties: {
        background: { mode: 'gradient', color: '#1e1b4b', gradient: { type: 'linear', direction: '135deg', colors: ['#1e1b4b', '#312e81'] } },
        textPrimary: { mode: 'color', color: '#ffffff', gradient: { type: 'linear', direction: '135deg', colors: ['#ffffff', '#f3e8ff'] } },
        textSecondary: { mode: 'color', color: 'rgba(255, 255, 255, 0.8)', gradient: { type: 'linear', direction: '135deg', colors: ['rgba(255, 255, 255, 0.8)', 'rgba(255, 255, 255, 0.6)'] } },
        surface: { mode: 'gradient', color: 'rgba(255, 255, 255, 0.08)', gradient: { type: 'linear', direction: '135deg', colors: ['rgba(124, 58, 237, 0.1)', 'rgba(168, 85, 247, 0.05)'] } },
        border: { mode: 'gradient', color: 'rgba(255, 255, 255, 0.15)', gradient: { type: 'linear', direction: '135deg', colors: ['rgba(124, 58, 237, 0.4)', 'rgba(168, 85, 247, 0.25)'] } },
        accent: { mode: 'gradient', color: '#7c3aed', gradient: { type: 'linear', direction: '135deg', colors: ['#7c3aed', '#a855f7'] } },
        muted: { mode: 'color', color: '#94a3b8', gradient: { type: 'linear', direction: '135deg', colors: ['#94a3b8', '#64748b'] } },
        cardBackground: { mode: 'gradient', color: '#ffffff', gradient: { type: 'linear', direction: '135deg', colors: ['#ffffff', '#faf5ff'] } },
        hoverSurface: { mode: 'gradient', color: 'rgba(255, 255, 255, 0.12)', gradient: { type: 'linear', direction: '135deg', colors: ['rgba(124, 58, 237, 0.2)', 'rgba(168, 85, 247, 0.15)'] } },
        subtitle: { mode: 'gradient', color: '#a855f7', gradient: { type: 'linear', direction: '135deg', colors: ['#a855f7', '#c084fc'] } },
      }
    },
    {
      name: 'Monochrome',
      description: 'Classic black and white with subtle grays',
      preview: ['#000000', '#6b7280', '#ffffff'],
      properties: {
        background: { mode: 'gradient', color: '#000000', gradient: { type: 'linear', direction: '135deg', colors: ['#000000', '#111827'] } },
        textPrimary: { mode: 'color', color: '#ffffff', gradient: { type: 'linear', direction: '135deg', colors: ['#ffffff', '#f9fafb'] } },
        textSecondary: { mode: 'color', color: 'rgba(255, 255, 255, 0.7)', gradient: { type: 'linear', direction: '135deg', colors: ['rgba(255, 255, 255, 0.7)', 'rgba(255, 255, 255, 0.5)'] } },
        surface: { mode: 'color', color: 'rgba(255, 255, 255, 0.05)', gradient: { type: 'linear', direction: '135deg', colors: ['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.03)'] } },
        border: { mode: 'color', color: 'rgba(255, 255, 255, 0.1)', gradient: { type: 'linear', direction: '135deg', colors: ['rgba(255, 255, 255, 0.15)', 'rgba(255, 255, 255, 0.05)'] } },
        accent: { mode: 'color', color: '#6b7280', gradient: { type: 'linear', direction: '135deg', colors: ['#6b7280', '#9ca3af'] } },
        muted: { mode: 'color', color: '#9ca3af', gradient: { type: 'linear', direction: '135deg', colors: ['#9ca3af', '#6b7280'] } },
        cardBackground: { mode: 'color', color: '#ffffff', gradient: { type: 'linear', direction: '135deg', colors: ['#ffffff', '#f9fafb'] } },
        hoverSurface: { mode: 'color', color: 'rgba(255, 255, 255, 0.08)', gradient: { type: 'linear', direction: '135deg', colors: ['rgba(255, 255, 255, 0.12)', 'rgba(255, 255, 255, 0.04)'] } },
        subtitle: { mode: 'gradient', color: '#6b7280', gradient: { type: 'linear', direction: '135deg', colors: ['#6b7280', '#9ca3af'] } },
      }
    },
    {
      name: 'T3 Theme',
      description: 'Official T3 Stack colors with elegant purple tones',
      preview: ['#241f29', '#571a5b', '#d47de1'],
      properties: {
        background: { mode: 'color', color: '#241f29', gradient: { type: 'linear', direction: '135deg', colors: ['#241f29', '#1a1420'] } },
        textPrimary: { mode: 'color', color: '#ffffff', gradient: { type: 'linear', direction: '135deg', colors: ['#ffffff', '#f9fafb'] } },
        textSecondary: { mode: 'color', color: '#c9bcd7', gradient: { type: 'linear', direction: '135deg', colors: ['#c9bcd7', '#a996b7'] } },
        surface: { mode: 'gradient', color: '#1c141a', gradient: { type: 'linear', direction: '135deg', colors: ['#1c141a', '#0e090d'] } },
        border: { mode: 'color', color: 'rgba(157, 73, 212, 0.1)', gradient: { type: 'linear', direction: '135deg', colors: ['rgba(157, 73, 212, 0.15)', 'rgba(157, 73, 212, 0.05)'] } },
        accent: { mode: 'color', color: '#571a5b', gradient: { type: 'linear', direction: '135deg', colors: ['#571a5b', '#3d1242'] } },
        muted: { mode: 'color', color: '#94a3b8', gradient: { type: 'linear', direction: '135deg', colors: ['#94a3b8', '#64748b'] } },
        cardBackground: { mode: 'gradient', color: '#ffffff', gradient: { type: 'linear', direction: '135deg', colors: ['#ffffff', '#f0fdf4'] } },
        hoverSurface: { mode: 'color', color: 'rgba(189, 17, 192, 0.05)', gradient: { type: 'linear', direction: '135deg', colors: ['rgba(189, 17, 192, 0.08)', 'rgba(189, 17, 192, 0.02)'] } },
        subtitle: { mode: 'gradient', color: '#d47de1', gradient: { type: 'linear', direction: '135deg', colors: ['#d47de1', '#e078d0'] } },
      }
    }
  ];

  /* CSS Variable Management */
  const updateCSSVariable = (property: string, value: string) => {
    console.log('Setting CSS variable:', property, 'to:', value);
    document.documentElement.style.setProperty(property, value);
    
    // Fix iOS over-scroll background by updating html and body background
    if (property === '--color-background') {
      document.documentElement.style.background = value;
      document.body.style.background = value;
    }
  };

  /* Property Labels for UI */
  const propertyLabels: { [key: string]: string } = {
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
  };

  /* Gradient Direction Options */
  const gradientDirections = [
    { value: '0deg', label: 'Top to Bottom' },
    { value: '90deg', label: 'Left to Right' },
    { value: '180deg', label: 'Bottom to Top' },
    { value: '270deg', label: 'Right to Left' },
    { value: '45deg', label: 'Top-Left to Bottom-Right' },
    { value: '135deg', label: 'Top-Right to Bottom-Left' },
    { value: '225deg', label: 'Bottom-Right to Top-Left' },
    { value: '315deg', label: 'Bottom-Left to Top-Right' },
  ];

  /* Utility Functions */
  const buildGradientCSS = (gradient: any) => {
    const { type, direction, colors } = gradient;
    let result;
    if (type === 'radial') {
      result = `radial-gradient(circle, ${colors.join(', ')})`;
    } else {
      result = `linear-gradient(${direction}, ${colors.join(', ')})`;
    }
    console.log('Building gradient CSS:', result, 'from:', gradient);
    return result;
  };



  const handleModeChange = (propertyKey: string, mode: 'color' | 'gradient') => {
    const newProperties = {
      ...styleProperties,
      [propertyKey]: {
        ...styleProperties[propertyKey as keyof typeof styleProperties],
        mode,
      },
    };
    setStyleProperties(newProperties);
    
    // Apply the new mode immediately
    const property = newProperties[propertyKey as keyof typeof styleProperties];
    const cssVariableMap: { [key: string]: string } = {
      background: '--color-background',
      textPrimary: '--color-text-primary',
      textSecondary: '--color-text-secondary',
      surface: '--color-surface',
      border: '--color-border',
      accent: '--color-accent',
      muted: '--color-muted',
      cardBackground: '--color-card-background',
      hoverSurface: '--color-hover-surface',
      subtitle: '--color-subtitle',
    };

    if (mode === 'color') {
      updateCSSVariable(cssVariableMap[propertyKey], property.color);
    } else {
      const gradientCSS = buildGradientCSS(property.gradient);
      updateCSSVariable(cssVariableMap[propertyKey], gradientCSS);
    }
  };

  const handleColorChange = useCallback((propertyKey: string, value: string) => {
    const currentProperty = styleProperties[propertyKey as keyof typeof styleProperties];
    const newProperties = {
      ...styleProperties,
      [propertyKey]: {
        ...currentProperty,
        color: value,
      },
    };
    
    // Force synchronous state update for immediate UI sync
    flushSync(() => {
      setStyleProperties(newProperties);
    });
    
    // Apply the new color to CSS
    if (currentProperty.mode === 'color') {
      const cssVariableMap: { [key: string]: string } = {
        background: '--color-background',
        textPrimary: '--color-text-primary',
        textSecondary: '--color-text-secondary',
        surface: '--color-surface',
        border: '--color-border',
        accent: '--color-accent',
        muted: '--color-muted',
        cardBackground: '--color-card-background',
        hoverSurface: '--color-hover-surface',
        subtitle: '--color-subtitle',
      };
      updateCSSVariable(cssVariableMap[propertyKey], value);
    }
  }, [styleProperties]);

  const handleGradientChange = (propertyKey: string, gradientProperty: string, value: any) => {
    const currentProperty = styleProperties[propertyKey as keyof typeof styleProperties];
    const newProperties = {
      ...styleProperties,
      [propertyKey]: {
        ...currentProperty,
        gradient: {
          ...currentProperty.gradient,
          [gradientProperty]: value,
        },
      },
    };
    setStyleProperties(newProperties);
    
    if (currentProperty.mode === 'gradient') {
      const cssVariableMap: { [key: string]: string } = {
        background: '--color-background',
        textPrimary: '--color-text-primary',
        textSecondary: '--color-text-secondary',
        surface: '--color-surface',
        border: '--color-border',
        accent: '--color-accent',
        muted: '--color-muted',
        cardBackground: '--color-card-background',
        hoverSurface: '--color-hover-surface',
        subtitle: '--color-subtitle',
      };
      
      const updatedGradient = {
        ...currentProperty.gradient,
        [gradientProperty]: value,
      };
      const gradientCSS = buildGradientCSS(updatedGradient);
      updateCSSVariable(cssVariableMap[propertyKey], gradientCSS);
    }
  };

  const handleGradientColorChange = (propertyKey: string, colorIndex: number, value: string) => {
    const currentProperty = styleProperties[propertyKey as keyof typeof styleProperties];
    const newColors = [...currentProperty.gradient.colors];
    newColors[colorIndex] = value;
    handleGradientChange(propertyKey, 'colors', newColors);
  };

  const applyTheme = (theme: any) => {
    setStyleProperties(theme.properties);
    
    // Apply all properties to CSS immediately
    Object.entries(theme.properties).forEach(([key, property]: [string, any]) => {
      const cssVariableMap: { [key: string]: string } = {
        background: '--color-background',
        textPrimary: '--color-text-primary',
        textSecondary: '--color-text-secondary',
        surface: '--color-surface',
        border: '--color-border',
        accent: '--color-accent',
        muted: '--color-muted',
        cardBackground: '--color-card-background',
        hoverSurface: '--color-hover-surface',
        subtitle: '--color-subtitle',
      };

      if (property.mode === 'color') {
        updateCSSVariable(cssVariableMap[key], property.color);
      } else {
        const gradientCSS = buildGradientCSS(property.gradient);
        updateCSSVariable(cssVariableMap[key], gradientCSS);
      }
    });
    
    setIsThemesModalOpen(false);
  };

  /* Effects */
  // Initialize CSS variables on component mount
  useEffect(() => {
    Object.entries(styleProperties).forEach(([key, property]) => {
      const cssVariableMap: { [key: string]: string } = {
        background: '--color-background',
        textPrimary: '--color-text-primary',
        textSecondary: '--color-text-secondary',
        surface: '--color-surface',
        border: '--color-border',
        accent: '--color-accent',
        muted: '--color-muted',
        cardBackground: '--color-card-background',
        hoverSurface: '--color-hover-surface',
        subtitle: '--color-subtitle',
      };

      if (property.mode === 'color') {
        updateCSSVariable(cssVariableMap[key], property.color);
      } else {
        const gradientCSS = buildGradientCSS(property.gradient);
        updateCSSVariable(cssVariableMap[key], gradientCSS);
      }
    });
  }, []);

  // Show notification after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowNotification(true);
    }, 5000); // 5 seconds

    return () => clearTimeout(timer);
  }, []);

  /* Event Handlers */
  const handleNotificationClick = () => {
    setShowNotification(false);
    setIsSidebarOpen(true);
  };

  return (
    <div className="min-h-screen bg-dynamic-background">
      <div className={`main-content ${isSidebarOpen ? 'shift' : ''}`}>
        <div className="container mx-auto px-4 py-16">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-dynamic-surface text-dynamic-secondary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <img src={wip} alt="Work in Progress" className="w-12 h-10" />
              Work in Progress
            </div>
            <h1 className="text-6xl md:text-7xl font-bold text-dynamic-primary mb-4 tracking-tight">T66-Chat</h1>
            <h2 className="text-3xl md:text-4xl font-bold text-dynamic-subtitle mb-6 tracking-tight">A T3 Chat Clone</h2>
            <p className="text-dynamic-primary">
              Welcome to T66-Chat, an LLM chat interface to be entered into the T3 Chat Cloneathon.<br />
              The name inspired by Palpatine's Order 66, where the clones were programmed to kill the Jedi.<br />
              Below are quick links to documentation, source code, and a live demo.
            </p>
          </div>

          {/* Navigation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16">
            {links.map((link) => (
              <a
                key={link.title}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-dynamic-surface hover:bg-dynamic-hover border border-dynamic rounded-xl p-8 text-center transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              >
                <div className="w-16 h-16 bg-dynamic-accent rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  {link.title === 'Documentation' ? (
                    <svg className="w-8 h-8 text-dynamic-primary" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
                      <polyline points="14,2 14,8 20,8"/>
                      <line x1="16" y1="13" x2="8" y2="13"/>
                      <line x1="16" y1="17" x2="8" y2="17"/>
                      <polyline points="10,9 9,9 8,9"/>
                    </svg>
                  ) : link.title === 'GitHub Repo' ? (
                    <svg className="w-8 h-8 text-dynamic-primary" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                  ) : (
                    <svg className="w-8 h-8 text-dynamic-primary" fill="currentColor" viewBox="0 0 24 24">
                      <polygon points="5 3 19 12 5 21 5 3"/>
                    </svg>
                  )}
                </div>
                <h2 className="text-2xl font-bold text-dynamic-primary mb-3 group-hover:text-dynamic-accent transition-colors duration-300">
                  {link.title}
                </h2>
                <p className="text-dynamic-secondary group-hover:text-dynamic-primary transition-colors duration-300">
                  Visit {link.title.toLowerCase()}
                </p>
              </a>
            ))}
          </div>

          {/* Work in Progress Notice */}
          <div className="mb-16">
            <div className="bg-dynamic-surface border border-dynamic rounded-xl p-8 w-2/3 mx-auto text-center">
              <h2 className="text-3xl font-semibold text-dynamic-primary mb-4">Stay Tuned!</h2>
              <p className="text-dynamic-secondary">
                This project is currently a work in progress. Check back soon for updates!
              </p>
            </div>
          </div>

          {/* About Section */}
          <div className="mb-16">
            <h2 className="text-4xl font-bold text-dynamic-primary text-center mb-8">About T66-Chat</h2>
            <div className="bg-dynamic-surface border border-dynamic rounded-xl p-8 max-w-4xl mx-auto mb-12">
              <p className="text-dynamic-secondary text-center text-lg leading-relaxed mb-8">
                Koby and Aiden met a while ago and have been friends ever since. When the opportunity came up to work on this T3 Chat Cloneathon, 
                Koby thought it would be super fun for them to finally collaborate on a project together. This is their first time working as a team!
              </p>
              <p className="text-dynamic-secondary text-center leading-relaxed">
                Koby is currently in high school and runs a few companies, while Aiden recently graduated college and just got a job. 
                Together, they're bringing their unique perspectives and skills to create something amazing.
              </p>
            </div>
            
            <h3 className="text-2xl font-semibold text-dynamic-primary text-center mb-8">Meet the Team</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
              <div className="bg-dynamic-surface hover:bg-dynamic-hover p-6 rounded-xl border border-dynamic transition-all duration-200 text-center">
                <div className="w-16 h-16 bg-dynamic-accent rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-dynamic-primary text-2xl font-bold">KP</span>
                </div>
                <h4 className="text-xl font-semibold text-dynamic-primary mb-1">Koby Pierce</h4>
                <p className="text-dynamic-accent text-sm">Lead Developer</p>
              </div>
              
              <div className="bg-dynamic-surface hover:bg-dynamic-hover p-6 rounded-xl border border-dynamic transition-all duration-200 text-center">
                <div className="w-16 h-16 bg-dynamic-accent rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-dynamic-primary text-2xl font-bold">AH</span>
                </div>
                <h4 className="text-xl font-semibold text-dynamic-primary mb-1">Aiden Hamade</h4>
                <p className="text-dynamic-accent text-sm">Lead Developer</p>
              </div>
            </div>
          </div>

          {/* All Announced Features Section */}
          <div className="mb-16">
            <h2 className="text-4xl font-bold text-dynamic-primary text-center mb-8">All Announced Features</h2>
            <p className="text-dynamic-secondary text-center mb-12 text-lg">From core functionality to advanced capabilities</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto mb-12">
              <div className="bg-dynamic-surface hover:bg-dynamic-hover p-8 rounded-xl border border-dynamic transition-all duration-200">
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 bg-dynamic-accent rounded-lg flex items-center justify-center mr-6">
                    <span className="text-dynamic-primary text-2xl font-bold">🤖</span>
                  </div>
                  <h3 className="text-2xl font-semibold text-dynamic-primary">Multiple LLMs</h3>
                </div>
                <p className="text-dynamic-secondary text-lg">Chat with OpenAI, Anthropic, Google, xAI, and other leading language models in one unified interface.</p>
              </div>
              
              <div className="bg-dynamic-surface hover:bg-dynamic-hover p-8 rounded-xl border border-dynamic transition-all duration-200">
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 bg-dynamic-accent rounded-lg flex items-center justify-center mr-6">
                    <span className="text-dynamic-primary text-2xl font-bold">🔐</span>
                  </div>
                  <h3 className="text-2xl font-semibold text-dynamic-primary">Auth & Sync</h3>
                </div>
                <p className="text-dynamic-secondary text-lg">Secure user authentication with seamless chat history synchronization across all your devices.</p>
              </div>
              
              <div className="bg-dynamic-surface hover:bg-dynamic-hover p-8 rounded-xl border border-dynamic transition-all duration-200">
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 bg-dynamic-accent rounded-lg flex items-center justify-center mr-6">
                    <span className="text-dynamic-primary text-2xl font-bold">🌐</span>
                  </div>
                  <h3 className="text-2xl font-semibold text-dynamic-primary">Browser Friendly</h3>
                </div>
                <p className="text-dynamic-secondary text-lg">Modern web application that works perfectly in any browser without installation or complex setup.</p>
              </div>
              
              <div className="bg-dynamic-surface hover:bg-dynamic-hover p-8 rounded-xl border border-dynamic transition-all duration-200">
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 bg-dynamic-accent rounded-lg flex items-center justify-center mr-6">
                    <span className="text-dynamic-primary text-2xl font-bold">⚡</span>
                  </div>
                  <h3 className="text-2xl font-semibold text-dynamic-primary">Easy to Try</h3>
                </div>
                <p className="text-dynamic-secondary text-lg">One-click Docker deployment with simple setup process. Get started in minutes, not hours.</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
              <div className="bg-dynamic-surface hover:bg-dynamic-hover p-6 rounded-xl border border-dynamic transition-all duration-200">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-dynamic-accent rounded-lg flex items-center justify-center mr-4">
                    <span className="text-dynamic-primary text-xl font-bold">📎</span>
                  </div>
                  <h3 className="text-xl font-semibold text-dynamic-primary">Attachment Support</h3>
                </div>
                <p className="text-dynamic-secondary">Upload and chat about images, PDFs, and documents with AI assistance for comprehensive file analysis.</p>
              </div>
              
              <div className="bg-dynamic-surface hover:bg-dynamic-hover p-6 rounded-xl border border-dynamic transition-all duration-200">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-dynamic-accent rounded-lg flex items-center justify-center mr-4">
                    <span className="text-dynamic-primary text-xl font-bold">🎨</span>
                  </div>
                  <h3 className="text-xl font-semibold text-dynamic-primary">Image Generation</h3>
                </div>
                <p className="text-dynamic-secondary">AI-powered image creation with DALL-E, Midjourney, and Stable Diffusion integration for creative projects.</p>
              </div>
              
              <div className="bg-dynamic-surface hover:bg-dynamic-hover p-6 rounded-xl border border-dynamic transition-all duration-200">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-dynamic-accent rounded-lg flex items-center justify-center mr-4">
                    <span className="text-dynamic-primary text-xl font-bold">💻</span>
                  </div>
                  <h3 className="text-xl font-semibold text-dynamic-primary">Syntax Highlighting</h3>
                </div>
                <p className="text-dynamic-secondary">Beautiful code formatting with 100+ programming language support and smart indentation.</p>
              </div>
              
              <div className="bg-dynamic-surface hover:bg-dynamic-hover p-6 rounded-xl border border-dynamic transition-all duration-200">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-dynamic-accent rounded-lg flex items-center justify-center mr-4">
                    <span className="text-dynamic-primary text-xl font-bold">🔄</span>
                  </div>
                  <h3 className="text-xl font-semibold text-dynamic-primary">Resumable Streams</h3>
                </div>
                <p className="text-dynamic-secondary">Continue conversations after page refresh seamlessly with intelligent stream recovery.</p>
              </div>
              
              <div className="bg-dynamic-surface hover:bg-dynamic-hover p-6 rounded-xl border border-dynamic transition-all duration-200">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-dynamic-accent rounded-lg flex items-center justify-center mr-4">
                    <span className="text-dynamic-primary text-xl font-bold">🌳</span>
                  </div>
                  <h3 className="text-xl font-semibold text-dynamic-primary">Chat Branching</h3>
                </div>
                <p className="text-dynamic-secondary">Explore alternative conversation paths and outcomes with tree-like chat structure.</p>
              </div>
              
              <div className="bg-dynamic-surface hover:bg-dynamic-hover p-6 rounded-xl border border-dynamic transition-all duration-200">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-dynamic-accent rounded-lg flex items-center justify-center mr-4">
                    <span className="text-dynamic-primary text-xl font-bold">📤</span>
                  </div>
                  <h3 className="text-xl font-semibold text-dynamic-primary">Chat Sharing</h3>
                </div>
                <p className="text-dynamic-secondary">Share conversations with others via public links with privacy controls.</p>
              </div>
              
              <div className="bg-dynamic-surface hover:bg-dynamic-hover p-6 rounded-xl border border-dynamic transition-all duration-200">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-dynamic-accent rounded-lg flex items-center justify-center mr-4">
                    <span className="text-dynamic-primary text-xl font-bold">🔍</span>
                  </div>
                  <h3 className="text-xl font-semibold text-dynamic-primary">Web Search</h3>
                </div>
                <p className="text-dynamic-secondary">Real-time web search integration for current information and fact-checking.</p>
              </div>
              
              <div className="bg-dynamic-surface hover:bg-dynamic-hover p-6 rounded-xl border border-dynamic transition-all duration-200">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-dynamic-accent rounded-lg flex items-center justify-center mr-4">
                    <span className="text-dynamic-primary text-xl font-bold">🔑</span>
                  </div>
                  <h3 className="text-xl font-semibold text-dynamic-primary">Bring Your Own Key</h3>
                </div>
                <p className="text-dynamic-secondary">Use your own API keys for all supported providers with secure key management.</p>
              </div>
              
              <div className="bg-dynamic-surface hover:bg-dynamic-hover p-6 rounded-xl border border-dynamic transition-all duration-200">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-dynamic-accent rounded-lg flex items-center justify-center mr-4">
                    <span className="text-dynamic-primary text-xl font-bold">📱</span>
                  </div>
                  <h3 className="text-xl font-semibold text-dynamic-primary">Mobile App</h3>
                </div>
                <p className="text-dynamic-secondary">Native-like mobile experience with offline support and app-like functionality.</p>
              </div>
            </div>
            
            <p className="text-dynamic-secondary text-center mt-8 text-lg">And more features going to be announced later in development</p>
          </div>

          {/* Style Editor Button */}
          <div className="text-center mb-8">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="bg-dynamic-accent hover:bg-dynamic-hover text-dynamic-primary px-6 py-3 rounded-xl font-semibold transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              Edit Style
            </button>
          </div>
        </div>
      </div>

      {/* Style Editor Sidebar */}
      <div className={`sidebar-container ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-bg shadow-2xl overflow-y-auto h-full w-full">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold sidebar-text-accent">Edit Styles</h2>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="sidebar-text-muted hover:sidebar-text-primary text-xl font-bold transition-colors duration-200"
              >
                ×
              </button>
            </div>
            
            <div className="mb-6">
              <button
                onClick={() => setIsThemesModalOpen(true)}
                className="w-full sidebar-text-accent sidebar-hover px-4 py-3 rounded-lg font-medium transition-colors duration-200 text-sm border sidebar-border"
              >
                🎨 Browse Themes
              </button>
            </div>
            
            {/* Style Property Controls */}
            <div className="space-y-4">
              {Object.entries(styleProperties).map(([key, property]) => (
                <div key={key} className="sidebar-surface p-4 rounded-lg sidebar-border border">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold sidebar-text-primary">
                      {propertyLabels[key]}
                    </h3>
                    <select
                      value={property.mode}
                      onChange={(e) => handleModeChange(key, e.target.value as 'color' | 'gradient')}
                      className="px-2 py-1 sidebar-input-bg sidebar-text-primary sidebar-border border rounded text-xs"
                    >
                      <option value="color">Color</option>
                      <option value="gradient">Gradient</option>
                    </select>
                  </div>
                  
                  {/* Color Input */}
                  {property.mode === 'color' && (
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={(() => {
                          if (property.color.includes('rgba')) {
                            // Extract RGB values from rgba string for color picker
                            const match = property.color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
                            if (match) {
                              const [, r, g, b] = match;
                              return `#${parseInt(r).toString(16).padStart(2, '0')}${parseInt(g).toString(16).padStart(2, '0')}${parseInt(b).toString(16).padStart(2, '0')}`;
                            }
                            return '#ffffff';
                          }
                          return property.color;
                        })()}
                        onChange={(e) => {
                          const newValue = e.target.value;
                          if (property.color.includes('rgba')) {
                            const opacity = key === 'textSecondary' ? '0.7' : 
                                          key === 'surface' || key === 'hoverSurface' ? '0.05' : 
                                          key === 'border' ? '0.1' : '1';
                            const rgb = newValue.substring(1).match(/.{2}/g)?.map(hex => parseInt(hex, 16));
                            if (rgb) {
                              const rgba = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${opacity})`;
                              handleColorChange(key, rgba);
                            }
                          } else {
                            handleColorChange(key, newValue);
                          }
                        }}
                        className="w-10 h-8 rounded sidebar-border border-2 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={property.color}
                        onChange={(e) => handleColorChange(key, e.target.value)}
                        className="flex-1 px-2 py-1 sidebar-input-bg sidebar-text-primary sidebar-border border rounded text-xs"
                        placeholder="Enter color value"
                      />
                    </div>
                  )}
                  
                  {/* Gradient Controls */}
                  {property.mode === 'gradient' && (
                    <div className="space-y-3">                      
                      {/* Preview */}
                      <div
                        className="w-full h-6 rounded sidebar-border border-2"
                        style={{ background: buildGradientCSS(property.gradient) }}
                      />
                      
                      {/* Gradient Type */}
                      <div>
                        <label className="block text-xs font-medium sidebar-text-secondary mb-1">
                          Type
                        </label>
                        <select
                          value={property.gradient.type}
                          onChange={(e) => handleGradientChange(key, 'type', e.target.value)}
                          className="w-full px-2 py-1 sidebar-input-bg sidebar-text-primary sidebar-border border rounded text-xs"
                        >
                          <option value="linear">Linear</option>
                          <option value="radial">Radial</option>
                        </select>
                      </div>
                      
                      {/* Direction (only for linear gradients) */}
                      {property.gradient.type === 'linear' && (
                        <div>
                          <label className="block text-xs font-medium sidebar-text-secondary mb-1">
                            Direction
                          </label>
                          <select
                            value={property.gradient.direction}
                            onChange={(e) => handleGradientChange(key, 'direction', e.target.value)}
                            className="w-full px-2 py-1 sidebar-input-bg sidebar-text-primary sidebar-border border rounded text-xs"
                          >
                            {gradientDirections.map((dir) => (
                              <option key={dir.value} value={dir.value}>
                                {dir.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                      
                      {/* Color Stops */}
                      {property.gradient.colors.map((color, colorIndex) => (
                        <div key={colorIndex}>
                          <label className="block text-xs font-medium sidebar-text-secondary mb-1">
                            Color {colorIndex + 1}
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={(() => {
                                if (color.includes('rgba')) {
                                  // Extract RGB values from rgba string for color picker
                                  const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
                                  if (match) {
                                    const [, r, g, b] = match;
                                    return `#${parseInt(r).toString(16).padStart(2, '0')}${parseInt(g).toString(16).padStart(2, '0')}${parseInt(b).toString(16).padStart(2, '0')}`;
                                  }
                                  return '#ffffff';
                                }
                                return color;
                              })()}
                              onChange={(e) => handleGradientColorChange(key, colorIndex, e.target.value)}
                              className="w-6 h-6 rounded sidebar-border border cursor-pointer"
                            />
                            <input
                              type="text"
                              value={color}
                              onChange={(e) => handleGradientColorChange(key, colorIndex, e.target.value)}
                              className="flex-1 px-1 py-1 sidebar-input-bg sidebar-text-primary sidebar-border border rounded text-xs"
                              placeholder="Color value"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="mt-6 text-center">
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="sidebar-text-accent sidebar-hover px-6 py-2 rounded-lg font-medium transition-colors duration-200 text-sm border sidebar-border"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Browse Themes Modal */}
      {isThemesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 backdrop-blur-sm"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.15)' }}
            onClick={() => setIsThemesModalOpen(false)}
          ></div>
          <div className="relative bg-dynamic-surface border border-dynamic rounded-xl p-8 max-w-6xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-dynamic-primary">Choose a Theme</h2>
              <button
                onClick={() => setIsThemesModalOpen(false)}
                className="text-dynamic-secondary hover:text-dynamic-primary text-2xl font-bold transition-colors duration-200"
              >
                ×
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {themePresets.map((theme, index) => (
                <div
                  key={index}
                  className="bg-dynamic-surface hover:bg-dynamic-hover border border-dynamic rounded-xl p-6 cursor-pointer transition-all duration-300 hover:scale-105 group"
                  onClick={() => applyTheme(theme)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-dynamic-primary group-hover:text-dynamic-accent transition-colors duration-300">
                      {theme.name}
                    </h3>
                    <div className="flex gap-2">
                      {theme.preview.map((color, colorIndex) => (
                        <div
                          key={colorIndex}
                          className="w-4 h-4 rounded-full border border-dynamic"
                          style={{ backgroundColor: color }}
                        ></div>
                      ))}
                    </div>
                  </div>
                  <p className="text-dynamic-secondary group-hover:text-dynamic-primary text-sm transition-colors duration-300">
                    {theme.description}
                  </p>
                  <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-dynamic-accent text-sm font-medium">Click to apply →</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
                  </div>
        )}

      {/* Notification Popup */}
      {showNotification && (
        <div className="fixed bottom-6 right-6 z-40 animate-slide-in-right">
          <div className="bg-dynamic-surface border border-dynamic rounded-xl p-4 shadow-2xl max-w-sm">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-dynamic-accent rounded-full flex items-center justify-center">
                  <span className="text-dynamic-primary text-lg">🎨</span>
                </div>
                <div>
                  <h4 className="text-dynamic-primary font-semibold text-sm">Customize Your Experience</h4>
                </div>
              </div>
              <button
                onClick={() => setShowNotification(false)}
                className="text-dynamic-secondary hover:text-dynamic-primary transition-colors duration-200 text-lg font-bold ml-2"
              >
                ×
              </button>
            </div>
            <p className="text-dynamic-secondary text-sm mb-3 ml-13">
              Don't like the colors? Edit them here!
            </p>
            <button
              onClick={handleNotificationClick}
              className="w-full bg-dynamic-accent hover:bg-dynamic-hover text-dynamic-primary px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm hover:scale-105"
            >
              Open Style Editor →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;