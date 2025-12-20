import React from 'react'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SearchBarProps {
  placeholder?: string
  onSearch: (value: string) => void
  className?: string
}

export function SearchBar({ placeholder = 'Search...', onSearch, className }: SearchBarProps) {
  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        type="text"
        placeholder={placeholder}
        onChange={(e) => onSearch(e.target.value)}
        className="flex h-12 w-full rounded-xl  bg-[rgb(60,66,82)] pl-11 pr-4 text-sm text-foreground transition-all duration-200 placeholder:text-muted-foreground hover:border-primary/50  outline-none"
      />
    </div>
  )
}
