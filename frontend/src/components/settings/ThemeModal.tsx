import { useState, useCallback } from 'react'
import { flushSync } from 'react-dom'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { ThemePresetCard } from './ThemePresetCard'
import { useThemeStore } from '../../stores/themeStore'
import { themePresets } from '../../config/themePresets'
import type { ThemeProperties, ThemeProperty } from '../../types/theme'
import { propertyLabels, gradientDirections } from '../../types/theme'

interface ThemeModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ThemeModal({ isOpen, onClose }: ThemeModalProps) {
  const { currentTheme, setThemeProperty, applyTheme, resetToDefault } = useThemeStore()
  const [activeTab, setActiveTab] = useState<'presets' | 'custom'>('presets')

  const handleModeChange = (propertyKey: keyof ThemeProperties, mode: 'color' | 'gradient') => {
    const currentProperty = currentTheme[propertyKey]
    const newProperty: ThemeProperty = {
      ...currentProperty,
      mode,
    }
    setThemeProperty(propertyKey, newProperty)
  }

  const handleColorChange = useCallback((propertyKey: keyof ThemeProperties, value: string) => {
    const currentProperty = currentTheme[propertyKey]
    const newProperty: ThemeProperty = {
      ...currentProperty,
      color: value,
    }
    
    // Force synchronous state update for immediate UI sync
    flushSync(() => {
      setThemeProperty(propertyKey, newProperty)
    })
  }, [currentTheme, setThemeProperty])

  const handleGradientChange = (propertyKey: keyof ThemeProperties, gradientProperty: string, value: any) => {
    const currentProperty = currentTheme[propertyKey]
    const newProperty: ThemeProperty = {
      ...currentProperty,
      gradient: {
        ...currentProperty.gradient,
        [gradientProperty]: value,
      },
    }
    setThemeProperty(propertyKey, newProperty)
  }

  const handleGradientColorChange = (propertyKey: keyof ThemeProperties, colorIndex: number, value: string) => {
    const currentProperty = currentTheme[propertyKey]
    const newColors = [...currentProperty.gradient.colors]
    newColors[colorIndex] = value
    handleGradientChange(propertyKey, 'colors', newColors)
  }

  const buildGradientCSS = (gradient: ThemeProperty['gradient']) => {
    const { type, direction, colors } = gradient
    if (type === 'radial') {
      return `radial-gradient(circle, ${colors.join(', ')})`
    } else {
      return `linear-gradient(${direction}, ${colors.join(', ')})`
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Theme Customization" size="xl">
      <div className="p-6">
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === 'presets' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('presets')}
          >
            🎨 Theme Presets
          </Button>
          <Button
            variant={activeTab === 'custom' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('custom')}
          >
            ⚙️ Custom Editor
          </Button>
        </div>

        {/* Theme Presets Tab */}
        {activeTab === 'presets' && (
          <div>
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-theme-primary mb-2">Choose a Theme</h3>
              <p className="text-theme-secondary">Select from our curated collection of beautiful themes</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {themePresets.map((theme, index) => (
                <ThemePresetCard
                  key={index}
                  theme={theme}
                  onApply={(theme) => {
                    applyTheme(theme)
                    onClose()
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Custom Editor Tab */}
        {activeTab === 'custom' && (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-theme-primary mb-2">Custom Theme Editor</h3>
                <p className="text-theme-secondary">Fine-tune individual theme properties</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={resetToDefault}
              >
                Reset to Default
              </Button>
            </div>
            
            {/* Style Property Controls */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {Object.entries(currentTheme).map(([key, property]) => (
                <div key={key} className="bg-theme-modal p-4 rounded-lg border border-theme-modal">
                  <div className="flex items-center justify-between mb-3">
                                          <h4 className="text-sm font-semibold text-theme-primary">
                      {propertyLabels[key as keyof ThemeProperties]}
                    </h4>
                    <select
                      value={property.mode}
                      onChange={(e) => handleModeChange(key as keyof ThemeProperties, e.target.value as 'color' | 'gradient')}
                                              className="px-2 py-1 bg-theme-input text-theme-input border border-theme-input rounded text-xs"
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
                            const match = property.color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
                            if (match) {
                              const [, r, g, b] = match
                              return `#${parseInt(r).toString(16).padStart(2, '0')}${parseInt(g).toString(16).padStart(2, '0')}${parseInt(b).toString(16).padStart(2, '0')}`
                            }
                            return '#ffffff'
                          }
                          return property.color
                        })()}
                        onChange={(e) => {
                          const newValue = e.target.value
                          if (property.color.includes('rgba')) {
                            const opacity = key === 'textSecondary' ? '0.7' : 
                                          key === 'surface' || key === 'hoverSurface' ? '0.05' : 
                                          key === 'border' ? '0.1' : '1'
                            const rgb = newValue.substring(1).match(/.{2}/g)?.map(hex => parseInt(hex, 16))
                            if (rgb) {
                              const rgba = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${opacity})`
                              handleColorChange(key as keyof ThemeProperties, rgba)
                            }
                          } else {
                            handleColorChange(key as keyof ThemeProperties, newValue)
                          }
                        }}
                        className="w-10 h-8 rounded border-2 border-theme-input cursor-pointer"
                      />
                      <input
                        type="text"
                        value={property.color}
                        onChange={(e) => handleColorChange(key as keyof ThemeProperties, e.target.value)}
                                                  className="flex-1 px-2 py-1 bg-theme-input text-theme-input border border-theme-input rounded text-xs"
                        placeholder="Enter color value"
                      />
                    </div>
                  )}
                  
                  {/* Gradient Controls */}
                  {property.mode === 'gradient' && (
                    <div className="space-y-3">                      
                      {/* Preview */}
                      <div
                                                  className="w-full h-6 rounded border-2 border-theme-input"
                        style={{ background: buildGradientCSS(property.gradient) }}
                      />
                      
                      {/* Gradient Type */}
                      <div>
                        <label className="block text-xs font-medium text-theme-secondary mb-1">
                          Type
                        </label>
                        <select
                          value={property.gradient.type}
                          onChange={(e) => handleGradientChange(key as keyof ThemeProperties, 'type', e.target.value)}
                          className="w-full px-2 py-1 bg-theme-input text-theme-input border border-theme-input rounded text-xs"
                        >
                          <option value="linear">Linear</option>
                          <option value="radial">Radial</option>
                        </select>
                      </div>
                      
                      {/* Direction (only for linear gradients) */}
                      {property.gradient.type === 'linear' && (
                        <div>
                                                  <label className="block text-xs font-medium text-theme-secondary mb-1">
                          Direction
                        </label>
                        <select
                          value={property.gradient.direction}
                          onChange={(e) => handleGradientChange(key as keyof ThemeProperties, 'direction', e.target.value)}
                          className="w-full px-2 py-1 bg-theme-input text-theme-input border border-theme-input rounded text-xs"
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
                      {property.gradient.colors.map((color: string, colorIndex: number) => (
                        <div key={colorIndex}>
                          <label className="block text-xs font-medium text-theme-secondary mb-1">
                            Color {colorIndex + 1}
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={(() => {
                                if (color.includes('rgba')) {
                                  // Extract RGB values from rgba string for color picker
                                  const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
                                  if (match) {
                                    const [, r, g, b] = match
                                    return `#${parseInt(r).toString(16).padStart(2, '0')}${parseInt(g).toString(16).padStart(2, '0')}${parseInt(b).toString(16).padStart(2, '0')}`
                                  }
                                  return '#ffffff'
                                }
                                return color
                              })()}
                              onChange={(e) => handleGradientColorChange(key as keyof ThemeProperties, colorIndex, e.target.value)}
                              className="w-6 h-6 rounded border border-theme-modal cursor-pointer"
                            />
                            <input
                              type="text"
                              value={color}
                              onChange={(e) => handleGradientColorChange(key as keyof ThemeProperties, colorIndex, e.target.value)}
                              className="flex-1 px-1 py-1 bg-theme-input text-theme-input border border-theme-input rounded text-xs"
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
          </div>
        )}
        
        <div className="mt-6 flex justify-end">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  )
} 
