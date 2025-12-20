import React from 'react'
import { LogOut, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'

interface NavbarProps {
  onLogout: () => void
  userEmail: string
}

export function Navbar({ onLogout, userEmail }: NavbarProps) {
  return (
    <nav className="sticky top-0 z-40 w-full border-b border-border/40 dark:border-[#4c566a] bg-background/95 dark:bg-[#2e3440]/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:supports-[backdrop-filter]:bg-[#2e3440]/60">
      <div className="max-w-[1600px] mx-auto px-6 sm:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-600 shadow-lg">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                AccessFlow
              </h1>
              <p className="text-xs text-muted-foreground dark:text-[#d8dee9]/70">RBAC Manager</p>
            </div>
          </div>

          {/* User Info & Actions */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right mr-2">
              <p className="text-sm font-medium text-foreground dark:text-[#eceff4]">{userEmail}</p>
              <p className="text-xs text-muted-foreground dark:text-[#d8dee9]/60">Administrator</p>
            </div>
            
            <ThemeToggle />
            
            <Button
              variant="outline"
              size="sm"
              onClick={onLogout}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
