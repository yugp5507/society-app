'use client'

import { useEffect, useState } from 'react'

export type ToastType = 'error' | 'success' | 'warning' | 'info'

interface ToastProps {
  message: string
  type: ToastType
  onClose: () => void
}

export function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000)
    return () => clearTimeout(timer)
  }, [onClose])

  const colors = {
    error: 'bg-red-500',
    success: 'bg-green-500', 
    warning: 'bg-amber-500',
    info: 'bg-blue-500',
  }

  const icons = {
    error: '❌',
    success: '✅',
    warning: '⚠️',
    info: 'ℹ️',
  }

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 99999,
      minWidth: '300px',
      maxWidth: '400px',
    }}
    className={`${colors[type]} text-white px-4 py-3 
      rounded-lg shadow-2xl flex items-center gap-3
      animate-slide-in`}>
      <span className="text-xl">{icons[type]}</span>
      <span className="text-sm font-medium flex-1">
        {message}
      </span>
      <button 
        onClick={onClose}
        className="text-white/80 hover:text-white 
          text-lg font-bold ml-2">
        ×
      </button>
    </div>
  )
}

export function useToast() {
  const [toast, setToast] = useState<{
    message: string
    type: ToastType
  } | null>(null)

  const showToast = (message: string, type: ToastType = 'info') => {
    setToast({ message, type })
  }

  const hideToast = () => setToast(null)

  return { toast, showToast, hideToast }
}
