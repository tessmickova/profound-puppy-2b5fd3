'use client'
// components/charts/ImageSequencePlayer.tsx
// Reusable image sequence animation player for any solar imagery source

import { useState, useEffect, useRef, useCallback } from 'react'
import clsx from 'clsx'

interface FrameData {
  frames: string[]
  count: number
  latest: string | null
  fetchedAt: string
}

export interface SourceConfig {
  id: string
  label: string
  icon: string
  alt: string
  /** Parse human-readable timestamp from frame URL */
  parseTime: (url: string) => string | null
  /** Source docs URL */
  sourceUrl: string
  sourceLabel: string
  /** Play speed in ms between frames */
  interval?: number
}

const REFRESH_MS = 15 * 60 * 1000
const DEFAULT_INTERVAL = 100

/** YYYYMMDD_HHMM format (LASCO-C3, CCOR1) */
function parseSwpcTime(url: string): string | null {
  const m = url.match(/(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})/)
  if (!m) return null
  const [, y, mo, d, h, mi] = m
  return `${d}.${mo}.${y} ${h}:${mi} UTC`
}

/** ENLIL: enlil_com2_NNNNN_YYYYMMDDTHHMMSS */
function parseEnlilTime(url: string): string | null {
  const m = url.match(/enlil_com2_\d+_(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})/)
  if (!m) return null
  const [, y, mo, d, h, mi] = m
  return `${d}.${mo}.${y} ${h}:${mi} UTC`
}

/** SUVI: YYYYDDDHHMMSS (Julian day of year) */
function parseSuviTime(url: string): string | null {
  const m = url.match(/(\d{4})(\d{3})(\d{2})(\d{2})(\d{2})\d_GOES/)
  if (!m) return null
  const [, y, doy, h, mi] = m
  const date = new Date(Number(y), 0, Number(doy))
  const dd = String(date.getDate()).padStart(2, '0')
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  return `${dd}.${mm}.${y} ${h}:${mi} UTC`
}

export const SOLAR_SOURCES: SourceConfig[] = [
  {
    id: 'enlil',
    label: 'ENLIL',
    icon: '🌀',
    alt: 'WSA-ENLIL model — šíření slunečního větru',
    parseTime: parseEnlilTime,
    sourceUrl: 'https://www.swpc.noaa.gov/products/wsa-enlil-solar-wind-prediction',
    sourceLabel: 'NOAA SWPC',
  },
  {
    id: 'lasco-c3',
    label: 'LASCO C3',
    icon: '🔭',
    alt: 'SOHO LASCO C3 — koronograf vnější koróny',
    parseTime: parseSwpcTime,
    sourceUrl: 'https://www.swpc.noaa.gov/products/lasco-coronagraph',
    sourceLabel: 'SOHO/LASCO',
  },
  {
    id: 'ccor1',
    label: 'CCOR-1',
    icon: '📡',
    alt: 'GOES CCOR-1 — kompaktní koronograf',
    parseTime: parseSwpcTime,
    sourceUrl: 'https://www.swpc.noaa.gov/products/goes-compact-coronagraph-ccor',
    sourceLabel: 'GOES/CCOR',
  },
  {
    id: 'suvi-fe195',
    label: 'SUVI 195',
    icon: '☀️',
    alt: 'GOES-19 SUVI Fe195 — EUV obraz Slunce',
    parseTime: parseSuviTime,
    sourceUrl: 'https://www.swpc.noaa.gov/products/goes-solar-ultraviolet-imager-suvi',
    sourceLabel: 'GOES-19/SUVI',
    interval: 60,
  },
]

export function ImageSequencePlayer({ source }: { source: SourceConfig }) {
  const [data, setData] = useState<FrameData | null>(null)
  const [error, setError] = useState(false)
  const [frameIdx, setFrameIdx] = useState(0)
  const [playing, setPlaying] = useState(true)
  const [newUpdate, setNewUpdate] = useState(false)
  const lastLatestRef = useRef<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const prefetchedRef = useRef<Set<string>>(new Set())

  const interval = source.interval ?? DEFAULT_INTERVAL

  const fetchFrames = useCallback(async () => {
    try {
      const res = await fetch(`/api/solar-imagery?source=${source.id}`)
      if (!res.ok) throw new Error(`${res.status}`)
      const json: FrameData = await res.json()
      if (!json.frames?.length) return

      if (lastLatestRef.current && json.latest !== lastLatestRef.current) {
        setNewUpdate(true)
      }
      lastLatestRef.current = json.latest

      setData(json)
      setError(false)

      // Prefetch images
      for (const url of json.frames) {
        if (!prefetchedRef.current.has(url)) {
          const img = new Image()
          img.src = url
          prefetchedRef.current.add(url)
        }
      }
    } catch {
      setError(true)
    }
  }, [source.id])

  // Reset state when source changes
  useEffect(() => {
    setData(null)
    setError(false)
    setFrameIdx(0)
    setPlaying(true)
    setNewUpdate(false)
    lastLatestRef.current = null
    prefetchedRef.current = new Set()
    fetchFrames()
  }, [source.id, fetchFrames])

  // 15-min refresh
  useEffect(() => {
    const id = setInterval(fetchFrames, REFRESH_MS)
    return () => clearInterval(id)
  }, [fetchFrames])

  // Animation loop
  useEffect(() => {
    if (!playing || !data?.frames.length) {
      if (timerRef.current) clearInterval(timerRef.current)
      timerRef.current = null
      return
    }

    timerRef.current = setInterval(() => {
      setFrameIdx(prev => (prev + 1) % data.frames.length)
    }, interval)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [playing, data?.frames.length, interval])

  useEffect(() => {
    if (data?.frames.length) {
      setFrameIdx(prev => Math.min(prev, data.frames.length - 1))
    }
  }, [data?.frames.length])

  const currentUrl = data?.frames[frameIdx]
  const timestamp = currentUrl ? source.parseTime(currentUrl) : null
  const total = data?.frames.length ?? 0

  if (error && !data) {
    return (
      <div className="text-xs font-mono text-slate-500 text-center py-8">
        {source.label} momentálně nedostupný
      </div>
    )
  }

  return (
    <>
      {/* New update badge */}
      {newUpdate && (
        <div className="flex justify-end mb-2">
          <button
            onClick={() => { setNewUpdate(false); setFrameIdx(0); setPlaying(true) }}
            className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-aurora-teal/15 border border-aurora-teal/30 text-aurora-teal animate-pulse"
          >
            ✨ Nová aktualizace
          </button>
        </div>
      )}

      {/* Frame display */}
      <div className="relative w-full aspect-square max-h-[360px] bg-[#030810] rounded-xl overflow-hidden">
        {currentUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={currentUrl}
            alt={source.alt}
            className="w-full h-full object-contain"
            draggable={false}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-xs font-mono text-slate-500">
            Načítání snímků…
          </div>
        )}

        {timestamp && (
          <div className="absolute top-2 left-2 text-[10px] font-mono text-white/70 bg-black/50 px-2 py-0.5 rounded-sm">
            {timestamp}
          </div>
        )}

        {total > 0 && (
          <div className="absolute top-2 right-2 text-[10px] font-mono text-white/50 bg-black/50 px-2 py-0.5 rounded-sm">
            {frameIdx + 1}/{total}
          </div>
        )}
      </div>

      {/* Controls */}
      {total > 0 && (
        <div className="mt-3 space-y-2">
          <input
            type="range"
            min={0}
            max={total - 1}
            value={frameIdx}
            onChange={e => { setFrameIdx(Number(e.target.value)); setPlaying(false) }}
            className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer
                       [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
                       [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-aurora-teal [&::-webkit-slider-thumb]:shadow-[0_0_6px_rgba(0,212,255,0.5)]"
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPlaying(p => !p)}
                className={clsx(
                  'px-3 py-1 rounded-md text-[11px] font-mono font-semibold transition-all border',
                  playing
                    ? 'bg-aurora-teal/15 border-aurora-teal/30 text-aurora-teal'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                )}
              >
                {playing ? '⏸ Pause' : '▶ Play'}
              </button>
              <button
                onClick={() => { setFrameIdx(0); setPlaying(true) }}
                className="px-2 py-1 rounded-md text-[10px] font-mono text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent transition-all"
              >
                ⏮ Restart
              </button>
            </div>
            <span className="text-[10px] font-mono text-slate-500">
              {timestamp ?? ''}
            </span>
          </div>
        </div>
      )}

      <p className="text-[10px] font-mono text-slate-400 mt-2">
        Zdroj:{' '}
        <a href={source.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-aurora-teal hover:underline">
          {source.sourceLabel}
        </a>
      </p>
    </>
  )
}
