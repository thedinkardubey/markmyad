import React, { useEffect } from 'react'
import { CheckCircle2, XCircle, AlertCircle, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ToastProps {
  message: string
  type: 'success' | 'error' | 'info'
  onClose: () => void
}

export function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000)
    return () => clearTimeout(timer)
  }, [onClose])

  const icons = {
    success: <CheckCircle2 className="h-5 w-5" />,
    error: <XCircle className="h-5 w-5" />,
    info: <AlertCircle className="h-5 w-5" />,
  }

  const styles = {
    success: 'bg-success/10 border-success/30 text-success',
    error: 'bg-destructive/10 border-destructive/30 text-destructive',
    info: 'bg-primary/10 border-primary/30 text-primary',
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
      <div
        className={cn(
          'flex items-start gap-3 min-w-[320px] max-w-md p-4 rounded-2xl border-2 shadow-xl backdrop-blur-sm',
          styles[type]
        )}
      >
        <div className="flex-shrink-0 mt-0.5">{icons[type]}</div>
        <p className="flex-1 text-sm font-medium leading-relaxed">{message}</p>
        <button
          onClick={onClose}
          className="flex-shrink-0 rounded-lg p-1 hover:bg-black/5 transition-colors outline-none"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
