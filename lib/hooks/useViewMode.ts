'use client'
// lib/hooks/useViewMode.ts — Basic/Advanced view mode toggle
import { useState, useCallback, useEffect } from 'react'

export type ViewMode = 'basic' | 'advanced'

const STORAGE_KEY = 'auroradog_view_mode'

export function useViewMode() {
  const [mode, setModeRaw] = useState<ViewMode>('basic')

  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'basic' || stored === 'advanced') setModeRaw(stored)
  }, [])

  const setMode = useCallback((m: ViewMode) => {
    setModeRaw(m)
    if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, m)
  }, [])

  const toggle = useCallback(() => {
    setMode(mode === 'basic' ? 'advanced' : 'basic')
  }, [mode, setMode])

  return { mode, setMode, toggle, isAdvanced: mode === 'advanced' }
}
