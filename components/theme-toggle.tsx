"use client"

import * as React from "react"
import { Moon, Sun, Monitor, Palette, Check } from "lucide-react"
import { useTheme, type Theme } from "@/contexts/theme-context"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface ThemeToggleProps {
  variant?: "default" | "compact" | "dropdown"
  size?: "sm" | "default" | "lg"
  className?: string
  showLabel?: boolean
  align?: "start" | "center" | "end"
}

const themeOptions: Array<{
  value: Theme
  label: string
  icon: React.ComponentType<{ className?: string }>
  description: string
}> = [
  {
    value: "light",
    label: "Light",
    icon: Sun,
    description: "Light theme for better visibility in bright environments",
  },
  {
    value: "dark",
    label: "Dark",
    icon: Moon,
    description: "Dark theme for reduced eye strain in low-light conditions",
  },
  {
    value: "system",
    label: "System",
    icon: Monitor,
    description: "Automatically match your system's theme preference",
  },
]

export function ThemeToggle({
  variant = "default",
  size = "default",
  className,
  showLabel = false,
  align = "end",
}: ThemeToggleProps) {
  const { theme, actualTheme, setTheme, toggleTheme, isLoading } = useTheme()

  const currentOption = themeOptions.find((option) => option.value === theme)
  const CurrentIcon = currentOption?.icon || Sun

  // Simple toggle button (switches between light/dark only)
  if (variant === "compact") {
    return (
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size={size}
              onClick={toggleTheme}
              disabled={isLoading}
              className={cn(
                "relative overflow-hidden transition-all duration-300",
                "hover:bg-accent hover:text-accent-foreground",
                "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                isLoading && "opacity-50 cursor-not-allowed",
                className
              )}
              aria-label={`Switch to ${actualTheme === 'light' ? 'dark' : 'light'} mode`}
            >
              <div className="relative">
                <Sun
                  className={cn(
                    "h-4 w-4 transition-all duration-500 transform",
                    actualTheme === "dark" ? "scale-0 rotate-90" : "scale-100 rotate-0"
                  )}
                />
                <Moon
                  className={cn(
                    "absolute h-4 w-4 transition-all duration-500 transform top-0 left-0",
                    actualTheme === "dark" ? "scale-100 rotate-0" : "scale-0 -rotate-90"
                  )}
                />
              </div>
              {showLabel && (
                <span className="ml-2 text-sm font-medium">
                  {actualTheme === 'light' ? 'Light' : 'Dark'}
                </span>
              )}
              {isLoading && (
                <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground" />
                </div>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" align={align}>
            <p>Toggle theme ({actualTheme === 'light' ? 'Switch to dark' : 'Switch to light'})</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  // Full dropdown with all theme options
  return (
    <DropdownMenu>
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size={size}
                disabled={isLoading}
                className={cn(
                  "relative overflow-hidden transition-all duration-300",
                  "hover:bg-accent hover:text-accent-foreground",
                  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  "data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
                  isLoading && "opacity-50 cursor-not-allowed",
                  className
                )}
                aria-label="Select theme"
              >
                <div className="relative">
                  <CurrentIcon className="h-4 w-4 transition-transform duration-300" />
                </div>
                {showLabel && (
                  <span className="ml-2 text-sm font-medium">
                    {currentOption?.label || 'Theme'}
                  </span>
                )}
                {isLoading && (
                  <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground" />
                  </div>
                )}
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom" align={align}>
            <p>Current theme: {currentOption?.label || 'Unknown'}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DropdownMenuContent 
        align={align} 
        className="w-56 p-2"
        side="top"
        sideOffset={8}
      >
        <DropdownMenuLabel className="flex items-center gap-2 px-2 py-1.5">
          <Palette className="h-4 w-4" />
          <span className="text-sm font-medium">Theme Settings</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {themeOptions.map((option) => {
          const Icon = option.icon
          const isSelected = theme === option.value
          
          return (
            <DropdownMenuItem
              key={option.value}
              onClick={() => setTheme(option.value)}
              className={cn(
                "flex items-center gap-3 px-2 py-2.5 cursor-pointer rounded-md",
                "transition-all duration-200",
                "hover:bg-accent hover:text-accent-foreground",
                "focus:bg-accent focus:text-accent-foreground",
                isSelected && "bg-accent/50 text-accent-foreground"
              )}
              disabled={isLoading}
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-md bg-muted/50">
                <Icon className={cn(
                  "h-4 w-4 transition-colors duration-200",
                  isSelected && "text-primary"
                )} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium truncate">
                    {option.label}
                  </span>
                  {isSelected && (
                    <Check className="h-4 w-4 text-primary shrink-0 ml-2" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                  {option.description}
                </p>
              </div>
            </DropdownMenuItem>
          )
        })}
        
        <DropdownMenuSeparator />
        <div className="px-2 py-1.5">
          <p className="text-xs text-muted-foreground">
            Currently using: <span className="font-medium text-foreground">
              {actualTheme === 'light' ? 'Light mode' : 'Dark mode'}
            </span>
          </p>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Hook for theme-aware styling
export function useThemeAwareStyle() {
  const { actualTheme } = useTheme()
  
  return {
    isDark: actualTheme === 'dark',
    isLight: actualTheme === 'light',
    themeClass: actualTheme,
    getThemeValue: <T>(lightValue: T, darkValue: T): T => 
      actualTheme === 'light' ? lightValue : darkValue,
  }
}

// Component for theme-aware animations
export function ThemeAwareSpline({ 
  lightScene, 
  darkScene, 
  ...props 
}: {
  lightScene: string
  darkScene: string
  [key: string]: any
}) {
  const { actualTheme } = useTheme()
  const scene = actualTheme === 'light' ? lightScene : darkScene
  
  return <spline-viewer url={scene} {...props} />
}
