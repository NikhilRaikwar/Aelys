"use client"

import Script from 'next/script'

const themeScript = `
(function() {
  function getThemePreference() {
    if (typeof localStorage !== 'undefined' && localStorage.getItem('aelys-theme')) {
      return localStorage.getItem('aelys-theme')
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  
  function setTheme(theme) {
    const resolvedTheme = theme === 'system' 
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : theme
      
    const root = document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(resolvedTheme)
    root.style.colorScheme = resolvedTheme
    
    // Set data attribute for CSS targeting
    root.setAttribute('data-theme', resolvedTheme)
  }
  
  // Apply theme immediately to prevent FOUC
  const theme = getThemePreference()
  setTheme(theme)
  
  // Listen for system theme changes
  if (theme === 'system') {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', (e) => {
      const storedTheme = localStorage.getItem('aelys-theme')
      if (storedTheme === 'system') {
        setTheme('system')
      }
    })
  }
})()
`

interface ThemeScriptProps {
  nonce?: string
}

export function ThemeScript({ nonce }: ThemeScriptProps) {
  return (
    <Script
      id="theme-script"
      strategy="beforeInteractive"
      nonce={nonce}
      dangerouslySetInnerHTML={{
        __html: themeScript,
      }}
    />
  )
}

// Alternative implementation for apps that prefer inline scripts
export function InlineThemeScript({ nonce }: ThemeScriptProps) {
  return (
    <script
      nonce={nonce}
      dangerouslySetInnerHTML={{
        __html: themeScript,
      }}
    />
  )
}

// Default export
export default ThemeScript
