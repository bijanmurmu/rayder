"use client"

import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Github, Sun, Moon } from "lucide-react"

interface NavbarProps {
  isDarkMode: boolean
  isMetric: boolean
  onToggleDarkMode: () => void
  onToggleUnits: () => void
}

export default function Navbar({ isDarkMode, isMetric, onToggleDarkMode, onToggleUnits }: NavbarProps) {
  const handleGithubClick = () => {
    window.open("https://github.com/bijanmurmu/Rayder", "_blank", "noopener,noreferrer")
  }

  return (
    <nav className="w-full bg-black/20 backdrop-blur-md border-b border-white/10 px-4 py-3 mb-4">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        {/* Left side - App name */}
        <div className="flex items-center">
          <h1 className="text-xl font-bold text-white">Rayder</h1>
        </div>

        {/* Right side - Controls and GitHub */}
        <div className="flex items-center gap-3">
          {/* Theme toggle - only on mobile */}
          <Button
            variant="outline"
            size="icon"
            onClick={onToggleDarkMode}
            className="md:hidden bg-white/20 border-none text-white hover:bg-white/30 h-8 w-8"
            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDarkMode ? <Sun className="h-3 w-3" /> : <Moon className="h-3 w-3" />}
          </Button>

          {/* Unit toggle - only on mobile */}
          <div className="md:hidden flex items-center space-x-1">
            <Label htmlFor="navbar-unit-toggle" className="text-white text-xs">
              °C
            </Label>
            <Switch
              id="navbar-unit-toggle"
              checked={!isMetric}
              onCheckedChange={onToggleUnits}
              aria-label="Temperature unit toggle"
              className="scale-75"
            />
            <Label htmlFor="navbar-unit-toggle" className="text-white text-xs">
              °F
            </Label>
          </div>

          {/* GitHub icon */}
          <Button
            variant="outline"
            size="icon"
            onClick={handleGithubClick}
            className="bg-white/20 border-none text-white hover:bg-white/30 h-8 w-8"
            aria-label="View GitHub repository"
          >
            <Github className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </nav>
  )
}
