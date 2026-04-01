'use client'
// lib/hooks/usePreferences.ts — Theme (dark/light) + font scale (normal/large)

import { useState, useCallback, useEffect } from 'react'

export type Theme = 'dark' | 'light'
export type FontScale = 'normal' | 'large'

const THEME_KEY = 'auroradog_theme'
const FONT_KEY = 'auroradog_fontscale'

export function usePreferences() {
  const [theme, setThemeRaw] = useState<Theme>('dark')
  const [fontScale, setFontScaleRaw] = useState<FontScale>('normal')

  // Hydrate from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return
    const t = localStorage.getItem(THEME_KEY)
    if (t === 'dark' || t === 'light') setThemeRaw(t)
    const f = localStorage.getItem(FONT_KEY)
    if (f === 'normal' || f === 'large') setFontScaleRaw(f)
  }, [])

  // Apply data attributes to <html> whenever they change
  useEffect(() => {
    const el = document.documentElement
    el.setAttribute('data-theme', theme)
    el.classList.toggle('dark', theme === 'dark')
  }, [theme])

  useEffect(() => {
    document.documentElement.setAttribute('data-fontscale', fontScale)
  }, [fontScale])

  const setTheme = useCallback((t: Theme) => {
    setThemeRaw(t)
    if (typeof window !== 'undefined') localStorage.setItem(THEME_KEY, t)
  }, [])

  const setFontScale = useCallback((f: FontScale) => {
    setFontScaleRaw(f)
    if (typeof window !== 'undefined') localStorage.setItem(FONT_KEY, f)
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }, [theme, setTheme])

  const toggleFontScale = useCallback(() => {
    setFontScale(fontScale === 'normal' ? 'large' : 'normal')
  }, [fontScale, setFontScale])

  return {
    theme, setTheme, toggleTheme,
    fontScale, setFontScale, toggleFontScale,
    isLight: theme === 'light',
    isLarge: fontScale === 'large',
  }
}
