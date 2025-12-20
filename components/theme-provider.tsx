'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import type { ThemeProviderProps } from 'next-themes'

/**
 * Theme provider using next-themes
 * - Wraps the entire app
 * - Handles system preference detection
 * - Persists user choice to localStorage
 * - No custom logic needed - next-themes handles everything
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
