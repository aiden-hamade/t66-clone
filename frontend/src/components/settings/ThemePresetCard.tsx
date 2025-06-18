import type { ThemePreset } from '../../types/theme'

interface ThemePresetCardProps {
  theme: ThemePreset
  onApply: (theme: ThemePreset) => void
}

export function ThemePresetCard({ theme, onApply }: ThemePresetCardProps) {
  return (
    <div
      className="bg-theme-modal hover:bg-theme-dropdown-hover border border-theme-modal rounded-xl p-6 cursor-pointer transition-all duration-300 hover:scale-105 group"
      onClick={() => onApply(theme)}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-theme-primary group-hover:text-theme-accent transition-colors duration-300">
          {theme.name}
        </h3>
        <div className="flex gap-2">
          {theme.preview.map((color, colorIndex) => (
            <div
              key={colorIndex}
              className="w-4 h-4 rounded-full border border-theme-modal"
              style={{ backgroundColor: color }}
            ></div>
          ))}
        </div>
      </div>
              <p className="text-theme-secondary group-hover:text-theme-primary text-sm transition-colors duration-300">
        {theme.description}
      </p>
      <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <span className="text-theme-accent text-sm font-medium">Click to apply →</span>
      </div>
    </div>
  )
} 
