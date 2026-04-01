'use client'
// components/AuroralOvalMap.tsx — Full CZ map with auroral oval + community sighting pins
import { useState, useEffect, useMemo, useCallback } from 'react'
import type { AuroralOvalPoint } from '@/lib/noaa'
import type { GeoPosition } from '@/lib/hooks/useGeolocation'
import clsx from 'clsx'

interface SightingPin {
  lat: number
  lon: number
  type: 'seen' | 'photo'
  created_at: string
  night_date: string
}

interface Props {
  auroralOval: AuroralOvalPoint[]
  position: GeoPosition | null
  kp: number
  bz: number | null
}

// CZ bounding box for SVG coordinate mapping
const CZ_BOUNDS = { minLat: 48.55, maxLat: 51.06, minLon: 12.09, maxLon: 18.86 }
const SVG_W = 500
const SVG_H = 280

function geoToSvg(lat: number, lon: number): { x: number; y: number } {
  const x = ((lon - CZ_BOUNDS.minLon) / (CZ_BOUNDS.maxLon - CZ_BOUNDS.minLon)) * SVG_W
  const y = ((CZ_BOUNDS.maxLat - lat) / (CZ_BOUNDS.maxLat - CZ_BOUNDS.minLat)) * SVG_H
  return { x, y }
}

function ovalColor(value: number): string {
  if (value >= 20) return 'rgba(168,85,247,0.6)'  // strong purple
  if (value >= 10) return 'rgba(0,255,170,0.4)'    // moderate green
  if (value >= 5)  return 'rgba(72,199,255,0.25)'  // weak teal
  return 'rgba(72,199,255,0.1)'
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'právě teď'
  if (mins < 60) return `před ${mins} min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `před ${hours} h`
  return `před ${Math.floor(hours / 24)} d`
}

// Simplified CZ country outline (same as CzRegionMap but just the border)
const CZ_OUTLINE = 'M28,82 L48,60 75,52 105,32 140,24 165,30 195,18 230,22 248,38 280,28 318,35 330,55 365,108 392,85 425,72 460,78 472,100 462,128 448,168 440,195 412,210 382,200 378,228 348,248 310,252 278,238 258,218 268,198 235,205 205,195 180,178 175,210 152,238 115,248 72,240 45,215 38,185 30,138 28,82Z'

// Region paths for reference lines
const REGION_PATHS: { name: string; d: string }[] = [
  { name: 'Karlovarský',       d: 'M28,82 L48,60 75,52 88,68 82,95 65,108 42,105Z' },
  { name: 'Ústecký',           d: 'M75,52 L105,32 140,24 165,30 170,52 148,72 120,80 88,68Z' },
  { name: 'Liberecký',         d: 'M165,30 L195,18 230,22 248,38 240,60 215,68 190,62 170,52Z' },
  { name: 'Královéhradecký',   d: 'M248,38 L280,28 318,35 330,55 315,78 285,85 260,80 240,60Z' },
  { name: 'Pardubický',        d: 'M260,80 L285,85 315,78 340,95 338,120 310,128 275,118 255,100Z' },
  { name: 'Plzeňský',          d: 'M42,105 L65,108 82,95 120,80 148,72 155,98 148,130 120,155 85,168 55,158 30,138Z' },
  { name: 'Středočeský',       d: 'M148,72 L170,52 190,62 215,68 240,60 260,80 255,100 275,118 258,140 230,148 195,145 165,148 148,130 155,98Z' },
  { name: 'Vysočina',          d: 'M195,145 L230,148 258,140 275,155 285,178 268,198 235,205 205,195 180,178 165,148Z' },
  { name: 'Jihočeský',         d: 'M55,158 L85,168 120,155 148,130 165,148 180,178 175,210 152,238 115,248 72,240 45,215 38,185Z' },
  { name: 'Olomoucký',         d: 'M310,128 L338,120 365,108 392,115 400,138 388,162 360,168 335,160 315,148Z' },
  { name: 'Moravskoslezský',   d: 'M365,108 L392,85 425,72 460,78 472,100 462,128 435,145 400,138 392,115Z' },
  { name: 'Zlínský',           d: 'M360,168 L388,162 400,138 435,145 448,168 440,195 412,210 382,200 362,188Z' },
  { name: 'Jihomoravský',      d: 'M268,198 L285,178 315,148 335,160 360,168 362,188 382,200 378,228 348,248 310,252 278,238 258,218Z' },
]

export function AuroralOvalMap({ auroralOval, position, kp, bz }: Props) {
  const [sightings, setSightings] = useState<SightingPin[]>([])
  const [hoveredPin, setHoveredPin] = useState<SightingPin | null>(null)
  const [reporting, setReporting] = useState(false)
  const [reportSent, setReportSent] = useState(false)

  // Fetch sightings with location
  useEffect(() => {
    fetch('/api/sightings?with_location=true')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setSightings(data.filter((s: any) => s.lat && s.lon))
      })
      .catch(() => {})
  }, [reportSent])

  // Report sighting with location
  const reportSighting = useCallback(async (type: 'seen' | 'photo') => {
    if (!position || reporting) return
    setReporting(true)
    try {
      const fp = getFingerprint()
      const res = await fetch('/api/sightings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          kp,
          bz,
          fingerprint: fp,
          lat: position.lat,
          lon: position.lon,
        }),
      })
      if (res.ok) setReportSent(prev => !prev)
    } catch { /* silent */ }
    setReporting(false)
  }, [position, kp, bz, reporting])

  // Map OVATION oval points to SVG
  const ovalPoints = useMemo(() =>
    auroralOval.map(p => ({
      ...geoToSvg(p.lat, p.lon),
      value: p.value,
    })),
    [auroralOval]
  )

  // Map sightings to SVG
  const sightingPins = useMemo(() =>
    sightings.map(s => ({
      ...s,
      ...geoToSvg(s.lat, s.lon),
    })),
    [sightings]
  )

  // User position on map
  const userPos = position ? geoToSvg(position.lat, position.lon) : null

  return (
    <div className="bg-[#04101e]/90 border border-white/[0.08] rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs font-mono tracking-[2px] text-slate-500 uppercase flex items-center gap-2">
          🗺️ Mapa ČR — Aurorální ovál a hlášení
          <span className="flex-1 h-px bg-white/5 ml-2" />
        </div>
      </div>

      {/* SVG Map */}
      <div className="relative">
        <svg viewBox="15 10 470 255" className="w-full h-auto bg-[#0a1929] rounded-xl border border-white/[0.06]" style={{ maxHeight: 400 }}>
          <defs>
            <filter id="ovalGlow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="6" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="pinGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Region borders — faint */}
          {REGION_PATHS.map(r => (
            <path key={r.name} d={r.d} fill="transparent" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
          ))}

          {/* Country outline */}
          <path d={CZ_OUTLINE} fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.12)" strokeWidth="1.2" strokeLinejoin="round" />

          {/* Auroral oval overlay — circles for each data point */}
          {ovalPoints.map((p, i) => (
            <circle
              key={`oval-${i}`}
              cx={p.x} cy={p.y} r={8}
              fill={ovalColor(p.value)}
              filter="url(#ovalGlow)"
              className="pointer-events-none"
            />
          ))}

          {/* Sighting pins */}
          {sightingPins.map((pin, i) => {
            const isHovered = hoveredPin === sightings[i]
            return (
              <g
                key={`pin-${i}`}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredPin(sightings[i])}
                onMouseLeave={() => setHoveredPin(null)}
              >
                <circle
                  cx={pin.x} cy={pin.y}
                  r={isHovered ? 6 : 4}
                  fill={pin.type === 'seen' ? '#4ade80' : '#a78bfa'}
                  stroke="white" strokeWidth={isHovered ? 1.5 : 0.5}
                  filter="url(#pinGlow)"
                  className="transition-all duration-200"
                />
                {pin.type === 'photo' && (
                  <text x={pin.x} y={pin.y + 1} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="5" className="pointer-events-none">
                    📸
                  </text>
                )}
              </g>
            )
          })}

          {/* User position */}
          {userPos && (
            <g>
              <circle cx={userPos.x} cy={userPos.y} r={6} fill="none" stroke="#00d4ff" strokeWidth="2" className="animate-pulse" />
              <circle cx={userPos.x} cy={userPos.y} r={3} fill="#00d4ff" />
            </g>
          )}
        </svg>

        {/* Tooltip for hovered pin */}
        {hoveredPin && (() => {
          const pos = geoToSvg(hoveredPin.lat, hoveredPin.lon)
          return (
            <div
              className="absolute bg-black/80 backdrop-blur-sm border border-white/10 rounded-lg px-3 py-2 z-20 pointer-events-none"
              style={{
                left: `${(pos.x / 470) * 100}%`,
                top: `${(pos.y / 255) * 100 - 12}%`,
                transform: 'translate(-50%, -100%)',
              }}
            >
              <div className="text-[11px] font-mono text-slate-200">
                {timeAgo(hoveredPin.created_at)} — {hoveredPin.type === 'seen' ? '👁️ pozorováno pouhým okem' : '📸 vyfotografováno'}
              </div>
            </div>
          )
        })()}
      </div>

      {/* Legend + report buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-3">
        <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-[rgba(72,199,255,0.3)]" /> Slabý ovál</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-[rgba(0,255,170,0.5)]" /> Střední</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-[rgba(168,85,247,0.7)]" /> Silný</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#4ade80]" /> Viděno</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#a78bfa]" /> Foto</span>
        </div>

        {position && (
          <div className="flex gap-2">
            <button
              onClick={() => reportSighting('seen')}
              disabled={reporting}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-50"
            >
              👁️ Vidím záři!
            </button>
            <button
              onClick={() => reportSighting('photo')}
              disabled={reporting}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border bg-violet-500/10 border-violet-500/20 text-violet-400 hover:bg-violet-500/20 disabled:opacity-50"
            >
              📸 Fotím záři!
            </button>
          </div>
        )}
      </div>

      <p className="text-[10px] text-slate-500 mt-2">
        Aurorální ovál: NOAA OVATION model (aktualizace ~30 min) • Hlášení komunity: klikněte na mapu nebo tlačítko pro nahlášení pozorování
      </p>
    </div>
  )
}

function getFingerprint(): string {
  if (typeof window === 'undefined') return 'ssr'
  const nav = window.navigator
  const raw = [nav.userAgent, nav.language, screen.width, screen.height, screen.colorDepth, Intl.DateTimeFormat().resolvedOptions().timeZone].join('|')
  let hash = 0
  for (let i = 0; i < raw.length; i++) hash = ((hash << 5) - hash + raw.charCodeAt(i)) | 0
  return `fp_${Math.abs(hash).toString(36)}_${raw.length}`
}
