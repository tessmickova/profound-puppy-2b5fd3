'use client'
// components/VisibilityScale.tsx — Multi-factor visibility scale with label-width bars + night windows
import { useMemo } from 'react'
import { VISIBILITY_INFO, deriveVisibility } from '@/lib/noaa'
import type { VisibilityLevel, VisibilityInput, ForecastDay } from '@/lib/noaa'
import { getSunTimes, getSunPosition, getMoonInfo } from '@/lib/astronomy'

interface Props {
  currentKp: number
  forecast?: ForecastDay[]
  hpi?: number | null
  bz?: number | null
  swSpeed?: number | null
  hasCmeImpact?: boolean
}

const ALL_LEVELS: VisibilityLevel[] = ['none', 'photo_weak', 'photo_medium', 'photo_strong', 'eye_weak', 'eye_strong']

/** Build 2-hour observation windows from sunset to sunrise */
function buildNightWindows(now: Date): { label: string; startH: number; endH: number; time: Date }[] {
  const sunTimes = getSunTimes(now, 50.08, 14.44) // Prague default
  const sunset = sunTimes.sunset
  const sunrise = sunTimes.sunrise

  if (!sunset || !sunrise) return []

  const astroDusk = sunTimes.astronomicalDusk
  const darkStart = astroDusk ?? sunset

  const windows: { label: string; startH: number; endH: number; time: Date }[] = []
  const fmt = (d: Date) => d.toLocaleTimeString('cs-CZ', { timeZone: 'Europe/Prague', hour: '2-digit', minute: '2-digit' })

  let cursor = new Date(darkStart)
  cursor.setMinutes(0, 0, 0)
  if (cursor < darkStart) cursor.setHours(cursor.getHours() + 1)

  const end = new Date(sunrise)
  if (end < cursor) end.setDate(end.getDate() + 1)

  let i = 0
  while (cursor < end && i < 6) {
    const windowEnd = new Date(cursor.getTime() + 2 * 3600_000)
    const actualEnd = windowEnd > end ? end : windowEnd
    windows.push({
      label: `${fmt(cursor)}–${fmt(actualEnd)}`,
      startH: cursor.getHours(),
      endH: actualEnd.getHours(),
      time: new Date(cursor.getTime() + 3600_000), // mid-window
    })
    cursor = windowEnd
    i++
  }

  return windows
}

/** Estimate KP for a given window based on current + forecast trend */
function estimateForWindow(currentKp: number, windowIdx: number, forecast?: ForecastDay[]): number {
  const todayMax = forecast?.[0]?.kpMax ?? currentKp
  const tomorrowMax = forecast?.[1]?.kpMax ?? todayMax
  const weight = Math.min(0.2 + windowIdx * 0.15, 0.7)
  const target = windowIdx >= 3 ? tomorrowMax : todayMax
  return Math.round((currentKp * (1 - weight) + target * weight) * 10) / 10
}

export function VisibilityScale({ currentKp, forecast, hpi, bz, swSpeed, hasCmeImpact }: Props) {
  const now = useMemo(() => new Date(), [])
  const moon = useMemo(() => getMoonInfo(now), [now])
  const sun = useMemo(() => getSunPosition(now, 50.08, 14.44), [now])

  const currentVis = deriveVisibility({
    kp: currentKp, hpi, bz, swSpeed, hasCmeImpact,
    darkness: sun.darkness, moonIllumination: moon.illumination,
  })
  const info = VISIBILITY_INFO[currentVis]
  const currentIdx = ALL_LEVELS.indexOf(currentVis)

  const windows = useMemo(() => buildNightWindows(now), [now])

  return (
    <div className="bg-[#04101e]/90 border border-white/8 rounded-2xl p-4 transition-all duration-700">
      {/* Current status */}
      <div className="flex items-center gap-3 mb-3">
        <span className="text-2xl shrink-0">{info.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-display text-base font-bold" style={{ color: info.color }}>
              {info.label}
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              KP {currentKp.toFixed(1)}
            </span>
          </div>
          <p className="text-[11px] text-slate-300 leading-snug mt-0.5">{info.desc}</p>
        </div>
      </div>

      {/* All levels as label-width bars */}
      <div className="space-y-1 mb-3">
        {ALL_LEVELS.map((lvl, idx) => {
          const li = VISIBILITY_INFO[lvl]
          const isActive = idx <= currentIdx && idx > 0
          const isCurrent = lvl === currentVis
          return (
            <div key={lvl} className="flex items-center gap-2">
              <span className="text-[10px] w-4 text-center shrink-0">{li.icon}</span>
              <div
                className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold whitespace-nowrap transition-all"
                style={{
                  backgroundColor: isActive || isCurrent ? `${li.color}20` : 'rgba(255,255,255,0.03)',
                  color: isActive || isCurrent ? li.color : '#4a6080',
                  border: isCurrent ? `1px solid ${li.color}50` : '1px solid transparent',
                  boxShadow: isCurrent ? `0 0 8px ${li.color}30` : 'none',
                }}
              >
                {li.label}
              </div>
            </div>
          )
        })}
      </div>

      {/* Night windows */}
      <div className="hidden sm:block">
        <div className="text-[10px] font-mono tracking-wider text-slate-500 uppercase mb-1">🌙 Dnes v noci</div>
        {windows.length === 0 ? (
          <div className="text-[11px] text-slate-500 italic">—</div>
        ) : (
          <div className="space-y-1">
            {windows.slice(0, 4).map((w, idx) => {
              const estKp = estimateForWindow(currentKp, idx, forecast)
              const wSun = getSunPosition(w.time, 50.08, 14.44)
              const wMoon = getMoonInfo(w.time)
              const vis = deriveVisibility({
                kp: estKp, hpi, bz, swSpeed, hasCmeImpact,
                darkness: wSun.darkness, moonIllumination: wMoon.illumination,
              })
              const si = VISIBILITY_INFO[vis]
              return (
                <div key={w.label} className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono text-slate-500 w-[80px] shrink-0">{w.label}</span>
                  <span
                    className="inline-flex items-center px-1.5 py-0.5 rounded-sm text-[10px] font-mono font-semibold whitespace-nowrap"
                    style={{ backgroundColor: `${si.color}18`, color: si.color }}
                  >
                    {si.label}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
