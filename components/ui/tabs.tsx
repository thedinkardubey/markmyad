import * as React from 'react'
import { cn } from '@/lib/utils'

interface TabsProps {
  children: React.ReactNode
  className?: string
}

export function Tabs({ children, className }: TabsProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {children}
    </div>
  )
}

interface TabsListProps {
  children: React.ReactNode
  className?: string
}

export function TabsList({ children, className }: TabsListProps) {
  return (
    <div className={cn(
      'inline-flex h-12 items-center justify-center rounded-2xl bg-muted/50 p-1.5 text-muted-foreground backdrop-blur-sm',
      className
    )}>
      {children}
    </div>
  )
}

interface TabsTriggerProps {
  children: React.ReactNode
  active?: boolean
  onClick?: () => void
  className?: string
}

export function TabsTrigger({ children, active, onClick, className }: TabsTriggerProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-xl px-5 py-2.5 text-sm font-medium ring-offset-background transition-all duration-200 outline-none disabled:pointer-events-none disabled:opacity-50',
        active
          ? 'bg-background text-foreground shadow-sm'
          : 'text-muted-foreground hover:text-foreground hover:bg-background/50',
        className
      )}
    >
      {children}
    </button>
  )
}

interface TabsContentProps {
  children: React.ReactNode
  className?: string
}

export function TabsContent({ children, className }: TabsContentProps) {
  return (
    <div className={cn('mt-6 animate-slide-up', className)}>
      {children}
    </div>
  )
}
