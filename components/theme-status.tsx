'use client'

import { useTheme } from '../contexts/theme-context'

export function ThemeStatus() {
  const { theme, resolvedTheme } = useTheme()
  
  return (
    <div className="fixed bottom-4 right-4 bg-background/80 backdrop-blur-sm border rounded-lg p-2 text-xs font-mono z-50">
      <div>Theme: {theme}</div>
      <div>Resolved: {resolvedTheme}</div>
    </div>
  )
}
