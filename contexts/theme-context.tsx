"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'

export type Theme = 'light' | 'dark' | 'system'

interface ThemeContextType {
  theme: Theme
  actualTheme: 'light' | 'dark'
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  isLoading: boolean
  error: string | null
}

interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
  attribute?: string
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'aelys-theme',
  attribute = 'class',
  enableSystem = true,
  disableTransitionOnChange = false,
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme)
  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('dark')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Get system theme preference
  const getSystemTheme = useCallback((): 'light' | 'dark' => {
    if (typeof window === 'undefined') return 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }, [])

  // Apply theme to DOM
  const applyTheme = useCallback((newTheme: 'light' | 'dark') => {
    try {
      const root = window.document.documentElement
      
      if (disableTransitionOnChange) {
        const css = document.createElement('style')
        css.appendChild(
          document.createTextNode(
            '*,*::before,*::after{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}'
          )
        )
        document.head.appendChild(css)

        const _ = window.getComputedStyle(document.body)
        
        requestAnimationFrame(() => {
          document.head.removeChild(css)
        })
      }

      if (attribute === 'class') {
        root.classList.remove('light', 'dark')
        root.classList.add(newTheme)
      } else {
        root.setAttribute(attribute, newTheme)
      }

      // Update CSS custom properties for smooth transitions
      root.style.colorScheme = newTheme

      setActualTheme(newTheme)
      setError(null)
    } catch (err) {
      setError('Failed to apply theme')
      console.error('Theme application error:', err)
    }
  }, [attribute, disableTransitionOnChange])

  // Set theme with persistence
  const setTheme = useCallback((newTheme: Theme) => {
    try {
      setThemeState(newTheme)
      
      if (typeof window !== 'undefined') {
        localStorage.setItem(storageKey, newTheme)
      }

      const resolvedTheme = newTheme === 'system' ? getSystemTheme() : newTheme
      applyTheme(resolvedTheme)
    } catch (err) {
      setError('Failed to save theme preference')
      console.error('Theme setting error:', err)
    }
  }, [storageKey, getSystemTheme, applyTheme])

  // Toggle between light and dark (skips system)
  const toggleTheme = useCallback(() => {
    const newTheme = actualTheme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
  }, [actualTheme, setTheme])

  // Initialize theme on mount
  useEffect(() => {
    const initializeTheme = () => {
      try {
        let initialTheme = defaultTheme

        // Get stored theme preference
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem(storageKey)
          if (stored && ['light', 'dark', 'system'].includes(stored)) {
            initialTheme = stored as Theme
          }
        }

        setThemeState(initialTheme)

        // Resolve actual theme
        const resolvedTheme = initialTheme === 'system' ? getSystemTheme() : initialTheme
        applyTheme(resolvedTheme)
        
        setIsLoading(false)
      } catch (err) {
        setError('Failed to initialize theme')
        console.error('Theme initialization error:', err)
        setIsLoading(false)
      }
    }

    initializeTheme()
  }, [defaultTheme, storageKey, getSystemTheme, applyTheme])

  // Listen for system theme changes
  useEffect(() => {
    if (!enableSystem || theme !== 'system') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleChange = (e: MediaQueryListEvent) => {
      if (theme === 'system') {
        applyTheme(e.matches ? 'dark' : 'light')
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme, enableSystem, applyTheme])

  // Prevent flash of unstyled content
  useEffect(() => {
    const root = window.document.documentElement
    root.style.setProperty('--theme-transition', 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)')
  }, [])

  const value: ThemeContextType = {
    theme,
    actualTheme,
    setTheme,
    toggleTheme,
    isLoading,
    error,
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

// Higher-order component for theme-aware components
export function withTheme<P extends object>(Component: React.ComponentType<P>) {
  return function ThemedComponent(props: P) {
    const theme = useTheme()
    return <Component {...props} theme={theme} />
  }
}

// Theme detection hook for server-side rendering
export function useIsomorphicTheme() {
  const [mounted, setMounted] = useState(false)
  const theme = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return { ...theme, actualTheme: 'dark' as const }
  }

  return theme
}
