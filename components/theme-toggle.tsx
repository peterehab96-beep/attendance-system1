"use client"

import { Moon, Sun, Monitor, Palette } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export function ThemeToggle({ showToast = false }: { showToast?: boolean }) {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isRotating, setIsRotating] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="sm" className="w-10 h-10 p-0 touch-button">
        <div className="w-5 h-5 loading-skeleton rounded" />
      </Button>
    )
  }

  const getThemeIcon = () => {
    const iconClass = `w-5 h-5 transition-all duration-500 ${
      isRotating ? "animate-rotate" : ""
    }`
    
    switch (resolvedTheme) {
      case "dark":
        return <Moon className={`${iconClass} text-blue-400`} />
      case "light":
        return <Sun className={`${iconClass} text-yellow-500`} />
      default:
        return <Monitor className={`${iconClass} text-purple-500`} />
    }
  }

  const handleThemeChange = (newTheme: string) => {
    setIsRotating(true)
    setTheme(newTheme)
    
    if (showToast) {
      const themeNames = {
        light: "Light Mode",
        dark: "Dark Mode",
        system: "System Theme"
      }
      toast.success(`Switched to ${themeNames[newTheme as keyof typeof themeNames]}`, {
        icon: newTheme === "light" ? "☀️" : newTheme === "dark" ? "🌙" : "💻",
        duration: 2000,
      })
    }
    
    setTimeout(() => setIsRotating(false), 500)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="w-10 h-10 p-0 hover:bg-accent hover:scale-105 transition-all duration-200 touch-button relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          {getThemeIcon()}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44 p-2">
        <div className="flex items-center gap-2 px-2 py-1 mb-2 text-sm font-medium text-muted-foreground">
          <Palette className="w-4 h-4" />
          <span>Theme</span>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => handleThemeChange("light")}
          className={`flex items-center gap-3 cursor-pointer transition-all duration-200 hover:bg-accent/50 ${
            theme === "light" ? "bg-accent text-accent-foreground" : ""
          }`}
        >
          <Sun className="w-4 h-4 text-yellow-500" />
          <div className="flex flex-col">
            <span className="font-medium">Light</span>
            <span className="text-xs text-muted-foreground">Bright and clean</span>
          </div>
          {theme === "light" && (
            <div className="ml-auto w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleThemeChange("dark")}
          className={`flex items-center gap-3 cursor-pointer transition-all duration-200 hover:bg-accent/50 ${
            theme === "dark" ? "bg-accent text-accent-foreground" : ""
          }`}
        >
          <Moon className="w-4 h-4 text-blue-400" />
          <div className="flex flex-col">
            <span className="font-medium">Dark</span>
            <span className="text-xs text-muted-foreground">Easy on the eyes</span>
          </div>
          {theme === "dark" && (
            <div className="ml-auto w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleThemeChange("system")}
          className={`flex items-center gap-3 cursor-pointer transition-all duration-200 hover:bg-accent/50 ${
            theme === "system" ? "bg-accent text-accent-foreground" : ""
          }`}
        >
          <Monitor className="w-4 h-4 text-purple-500" />
          <div className="flex flex-col">
            <span className="font-medium">System</span>
            <span className="text-xs text-muted-foreground">Match device</span>
          </div>
          {theme === "system" && (
            <div className="ml-auto w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
