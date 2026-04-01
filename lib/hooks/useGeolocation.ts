'use client'
// lib/hooks/useGeolocation.ts — Shared geolocation hook with auto-detect
import { useState, useEffect, useCallback } from 'react'

export interface GeoPosition {
  lat: number
  lon: number
  accuracy: number
}

const STORAGE_KEY = 'auroradog_geo'

export function useGeolocation(autoDetect = true) {
  const [position, setPosition] = useState<GeoPosition | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Restore cached position on mount
  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as GeoPosition
        if (parsed.lat && parsed.lon) setPosition(parsed)
      } catch { /* ignore */ }
    }
  }, [])

  // Auto-detect on first load if no cached position
  useEffect(() => {
    if (!autoDetect || position || typeof window === 'undefined') return
    if (!navigator.geolocation) return
    detect()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoDetect])

  const detect = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolokace není k dispozici')
      return
    }
    setLoading(true)
    setError(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const geo: GeoPosition = {
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        }
        setPosition(geo)
        setLoading(false)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(geo))
      },
      (err) => {
        setError(err.message)
        setLoading(false)
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    )
  }, [])

  return { position, loading, error, detect }
}
