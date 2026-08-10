'use client'
// components/KpCarousel.tsx — 3-day forecast: Basic/Advanced mode with sighting reports
import { useMemo, useState, useCallback } from 'react'
import { deriveVisibility, VISIBILITY_INFO } from '@/lib/noaa'
import type { ForecastDay, VisibilityInput } from '@/lib/noaa'
import type { CmeEvent, SolarWindPoint } from '@/lib/noaa'
import { getSunPosition, getMoonInfo } from '@/lib/astronomy'
import { calculateExpertScore } from '@/lib/space-weather/expertScore'
import type { GeoPosition } from '@/lib/hooks/useGeolocation'
import clsx from 'clsx'

interface Props {
  forecast: ForecastDay[]
  currentKp: number
  bz?: number | null
  swSpeed?: number | null
  swDensity?: number | null
  hpiCurrent?: number | null
  cme?: CmeEvent[]
  swHistory?: SolarWindPoint[]
  isAdvanced?: boolean
  position?: GeoPosition | null
}

/** CZ-specific assessment for a given KP value */
function czAssessment(kp: number): { text: string; color: string } {
  if (kp >= 7) return { text: 'Záře viditelná po celé ČR!', color: '#ff3d9a' }
  if (kp >= 6) return { text: 'Jasný oblouk na obzoru ČR', color: '#a855f7' }
  if (kp >= 5) return { text: 'Záře na obzoru — tmavé místo!', color: '#a855f7' }
  if (kp >= 4) return { text: 'Fotografická šance z tmavého místa', color: '#00ffaa' }
  if (kp >= 3) return { text: 'Jen při souběhu ideálních podmínek', color: '#4a6080' }
  return { text: 'Záře z ČR nepozorovatelná', color: '#334155' }
}

function formatPeriodTime(isoTime: string): string {
  const d = new Date(isoTime)
  const h = d.toLocaleTimeString('cs-CZ', { timeZone: 'Europe/Prague', hour: '2-digit', minute: '2-digit' })
  const endD = new Date(d.getTime() + 3 * 3600_000)
  const hEnd = endD.toLocaleTimeString('cs-CZ', { timeZone: 'Europe/Prague', hour: '2-digit', minute: '2-digit' })
  return `${h}–${hEnd}`
}

/** Expanded night range: 19:00–06:00 CZ for more intervals */
function isNightPeriod(isoTime: string): boolean {
  const d = new Date(isoTime)
  const czHour = parseInt(d.toLocaleTimeString('cs-CZ', { timeZone: 'Europe/Prague', hour: '2-digit', hour12: false }))
  return czHour >= 19 || czHour < 6
}

function kpColor(kp: number): string {
  if (kp >= 7) return '#ff3d9a'
  if (kp >= 6) return '#a855f7'
  if (kp >= 5) return '#a855f7'
  if (kp >= 4) return '#00ffaa'
  if (kp >= 2) return '#4a6080'
  return '#334155'
}

/** Derive visibility for a specific forecast period time */
function visForPeriod(kp: number, periodTime: string, env: { bz?: number | null; swSpeed?: number | null; hpi?: number | null; hasCmeImpact?: boolean }) {
  const t = new Date(periodTime)
  // Use mid-window time (1.5h into the 3h period)
  const mid = new Date(t.getTime() + 1.5 * 3600_000)
  const sun = getSunPosition(mid, 50.08, 14.44)
  const moon = getMoonInfo(mid)
  return deriveVisibility({
    kp,
    hpi: env.hpi,
    bz: env.bz,
    swSpeed: env.swSpeed,
    hasCmeImpact: env.hasCmeImpact,
    darkness: sun.darkness,
    moonIllumination: moon.illumination,
  })
}

export function KpCarousel({ forecast, currentKp, bz, swSpeed, swDensity, hpiCurrent, cme, swHistory, isAdvanced = true, position }: Props) {
  // Live expert score for today's card
  const liveExpert = useMemo(() => calculateExpertScore({
    kp: currentKp,
    bz: bz ?? null,
    swSpeed: swSpeed ?? null,
    swDensity: swDensity ?? null,
    solarWindHistory: swHistory ?? [],
  }), [currentKp, bz, swSpeed, swDensity, swHistory])

  // Sighting report state
  const [reported, setReported] = useState<Record<string, { seen?: boolean; photo?: boolean }>>({})
  const [sending, setSending] = useState(false)

  const reportSighting = useCallback(async (nightDate: string, type: 'seen' | 'photo') => {
    if (sending) return
    setSending(true)
    try {
      const fp = getFingerprint()
      const res = await fetch('/api/sightings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          kp: currentKp,
          bz,
          fingerprint: fp,
          lat: position?.lat ?? null,
          lon: position?.lon ?? null,
        }),
      })
      if (res.ok) {
        setReported(prev => ({ ...prev, [nightDate]: { ...prev[nightDate], [type]: true } }))
        if (typeof window !== 'undefined') {
          const key = `sighting_${nightDate}`
          const stored = JSON.parse(localStorage.getItem(key) ?? '{}')
          stored[type] = true
          localStorage.setItem(key, JSON.stringify(stored))
        }
      }
    } catch { /* silent */ }
    setSending(false)
  }, [currentKp, bz, position, sending])

  if (!forecast.length) return null

  // Basic mode: labels are Dnes / Zítra / Pozítří with dates
  const dayLabels = ['Dnes', 'Zítra', 'Pozítří']

  return (
    <div>
      <div className="text-xs font-mono tracking-[2px] text-slate-500 uppercase mb-3 flex items-center gap-2">
        🔮 Předpověď 3 noci <span className="flex-1 h-px bg-white/5" />
      </div>

      {/* Day cards — intervals always visible */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {forecast.map((day, i) => {
          const nightPeriods = (day.periods ?? []).filter(p => isNightPeriod(p.time))
          const nightMax = nightPeriods.length > 0 ? Math.max(...nightPeriods.map(p => p.kp)) : 0
          const hasCmeImpact = cme?.some(c => c.earthImpact) ?? false
          const visEnv = { bz, swSpeed, hpi: hpiCurrent, hasCmeImpact }
          const bestPeriod = nightPeriods.length > 0
            ? nightPeriods.reduce((best, p) => p.kp > best.kp ? p : best, nightPeriods[0])
            : null
          const vis = bestPeriod
            ? visForPeriod(nightMax, bestPeriod.time, visEnv)
            : deriveVisibility({ kp: nightMax, ...visEnv })
          const info = VISIBILITY_INFO[vis]
          const cz = czAssessment(nightMax)
          const isToday = i === 0
          const rep = reported[day.date] ?? {}

          // In basic mode: split night periods into before/after midnight
          const beforeMidnight = nightPeriods.filter(p => {
            const h = parseInt(new Date(p.time).toLocaleTimeString('cs-CZ', { timeZone: 'Europe/Prague', hour: '2-digit', hour12: false }))
            return h >= 19
          })
          const afterMidnight = nightPeriods.filter(p => {
            const h = parseInt(new Date(p.time).toLocaleTimeString('cs-CZ', { timeZone: 'Europe/Prague', hour: '2-digit', hour12: false }))
            return h < 6
          })

          // Date formatting for basic mode
          const dateObj = new Date(day.date)
          const dateFormatted = dateObj.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'numeric' })
          const nextDayDate = new Date(dateObj)
          nextDayDate.setDate(nextDayDate.getDate() + 1)
          const nextDayFormatted = nextDayDate.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'numeric' })

          return (
            <div
              key={day.date}
              className="rounded-xl p-4 transition-all"
              style={{
                background: `linear-gradient(135deg, ${info.color}08 0%, transparent 100%)`,
                border: `1px solid ${isToday ? info.color + '25' : 'rgba(255,255,255,0.05)'}`,
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                {isAdvanced ? (
                  <span className="text-xs font-mono text-slate-300">
                    {isToday ? '🌙 Dnes v noci' : new Date(day.date).toLocaleDateString('cs-CZ', { weekday: 'long', day: 'numeric', month: 'numeric' })}
                  </span>
                ) : (
                  <div>
                    <span className="font-display text-lg font-black text-slate-100">
                      {dayLabels[i] ?? ''}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 ml-2">{dateFormatted}</span>
                  </div>
                )}
                <span className="text-xl">{info.icon}</span>
              </div>

              {isAdvanced ? (
                /* Advanced: show KP number */
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-display font-bold text-2xl" style={{ color: info.color }}>
                    KP {nightMax}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">noc max</span>
                </div>
              ) : (
                /* Basic: no raw KP, just the CZ assessment prominently */
                null
              )}

              <p className="text-xs leading-snug font-medium mb-2" style={{ color: cz.color }}>
                🇨🇿 {cz.text}
              </p>

              {/* Live status on today's card */}
              {isToday && (
                <div className="mb-2 pt-2 border-t border-white/6">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="flex items-center gap-1 text-[10px] font-mono text-slate-400">
                      <span className="w-1 h-1 rounded-full bg-red-500 animate-pulse" />
                      LIVE
                    </span>
                    {liveExpert.bzSouthMinutes > 0 && !liveExpert.bzNorthward && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-sm bg-green-500/8 text-green-400">
                        Bz jižní {liveExpert.bzSouthMinutes} min
                      </span>
                    )}
                    {liveExpert.bzNorthward && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-sm bg-yellow-500/8 text-yellow-400">
                        🔒 Bz sever
                      </span>
                    )}
                    {liveExpert.penalties.daylight > 10 && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-sm bg-orange-500/8 text-orange-400">
                        ☀️ −{Math.round(liveExpert.penalties.daylight)}%
                      </span>
                    )}
                    {liveExpert.penalties.moon > 5 && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-sm bg-yellow-500/8 text-yellow-400">
                        🌙 −{Math.round(liveExpert.penalties.moon)}%
                      </span>
                    )}
                    {cme?.some(c => c.earthImpact) && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-sm bg-orange-500/8 text-orange-400">
                        🌊 CME
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* G-storm probabilities — advanced only */}
              {isAdvanced && (
                <div className="flex gap-2 mb-3">
                  {[
                    { label: 'G1', pct: day.kpMinor, color: 'bg-aurora-green' },
                    { label: 'G2', pct: day.kpModerate, color: 'bg-aurora-purple' },
                    { label: 'G3', pct: day.kpSevere, color: 'bg-aurora-pink' },
                  ].map(g => (
                    <div key={g.label} className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-slate-500">{g.label}</span>
                        <span className="text-[10px] font-mono text-slate-400">{g.pct}%</span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className={clsx('h-full rounded-full', g.color)}
                          style={{ width: `${Math.min(g.pct, 100)}%`, opacity: g.pct > 0 ? 1 : 0.2 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ─── Night intervals ─── */}
              <div className="pt-2 border-t border-white/6">
                {isAdvanced ? (
                  /* Advanced: compact intervals with visibility labels */
                  <>
                    <div className="text-[10px] font-mono tracking-wider text-slate-500 uppercase mb-1.5">
                      🌙 Noční intervaly
                    </div>
                    {nightPeriods.length > 0 ? (
                      <div className="space-y-1">
                        {nightPeriods.map((period, pi) => {
                          const pVis = visForPeriod(period.kp, period.time, visEnv)
                          const pInfo = VISIBILITY_INFO[pVis]
                          return (
                            <div key={pi} className="flex items-center gap-1.5">
                              <span className="text-[10px] font-mono w-22 shrink-0 text-slate-400">
                                {formatPeriodTime(period.time)}
                              </span>
                              <span
                                className="inline-flex items-center px-1.5 py-0.5 rounded-sm text-[10px] font-mono font-semibold whitespace-nowrap"
                                style={{ backgroundColor: `${pInfo.color}18`, color: pInfo.color }}
                              >
                                {pInfo.label}
                              </span>
                              {period.observed && (
                                <span className="text-[9px] text-green-400/60 shrink-0" title="Naměřená hodnota">✓</span>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-600 italic">Žádné noční periody.</p>
                    )}
                  </>
                ) : (
                  /* Basic: split before/after midnight with visibility labels */
                  <div className="space-y-2">
                    {beforeMidnight.length > 0 && (
                      <div>
                        <div className="text-[10px] font-mono text-slate-400 mb-1">
                          🌆 Večer {dateFormatted} <span className="text-slate-500">(do půlnoci)</span>
                        </div>
                        <div className="space-y-1">
                          {beforeMidnight.map((period, pi) => {
                            const pVis = visForPeriod(period.kp, period.time, visEnv)
                            const pInfo = VISIBILITY_INFO[pVis]
                            return (
                              <div key={pi} className="flex items-center gap-1.5">
                                <span className="text-[11px] font-mono w-22 shrink-0 text-slate-300 font-semibold">
                                  {formatPeriodTime(period.time)}
                                </span>
                                <span
                                  className="inline-flex items-center px-1.5 py-0.5 rounded-sm text-[10px] font-mono font-semibold whitespace-nowrap"
                                  style={{ backgroundColor: `${pInfo.color}18`, color: pInfo.color }}
                                >
                                  {pInfo.label}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                    {afterMidnight.length > 0 && (
                      <div>
                        <div className="text-[10px] font-mono text-slate-400 mb-1">
                          🌃 Noc {nextDayFormatted} <span className="text-slate-500">(po půlnoci)</span>
                        </div>
                        <div className="space-y-1">
                          {afterMidnight.map((period, pi) => {
                            const pVis = visForPeriod(period.kp, period.time, visEnv)
                            const pInfo = VISIBILITY_INFO[pVis]
                            return (
                              <div key={pi} className="flex items-center gap-1.5">
                                <span className="text-[11px] font-mono w-22 shrink-0 text-slate-300 font-semibold">
                                  {formatPeriodTime(period.time)}
                                </span>
                                <span
                                  className="inline-flex items-center px-1.5 py-0.5 rounded-sm text-[10px] font-mono font-semibold whitespace-nowrap"
                                  style={{ backgroundColor: `${pInfo.color}18`, color: pInfo.color }}
                                >
                                  {pInfo.label}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                    {nightPeriods.length === 0 && (
                      <p className="text-[10px] text-slate-600 italic">Žádné noční periody.</p>
                    )}
                  </div>
                )}
              </div>

              {/* L1 probe tip — shown when any aurora chance exists */}
              {nightMax >= 3 && (
                <div className="mt-2 px-2.5 py-2 rounded-lg bg-aurora-teal/6 border border-aurora-teal/10">
                  <p className="text-[10px] text-aurora-teal/80 leading-snug">
                    📡 Sleduj sondu L1, která ti dá náskok 15–60 min před tím, než se záře objeví na obloze.
                  </p>
                </div>
              )}

              {/* Sighting report buttons — on each card */}
              <div className="pt-2 mt-2 border-t border-white/6 flex gap-1.5">
                <button
                  onClick={() => reportSighting(day.date, 'seen')}
                  disabled={rep.seen || sending}
                  className={clsx(
                    'flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all border',
                    rep.seen
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 cursor-default'
                      : 'bg-white/4 border-white/8 text-slate-400 hover:bg-emerald-500/10 hover:border-emerald-500/20 hover:text-emerald-400',
                  )}
                >
                  👁️ {rep.seen ? '✓' : 'Viděl/a'}
                </button>
                <button
                  onClick={() => reportSighting(day.date, 'photo')}
                  disabled={rep.photo || sending}
                  className={clsx(
                    'flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all border',
                    rep.photo
                      ? 'bg-violet-500/10 border-violet-500/30 text-violet-400 cursor-default'
                      : 'bg-white/4 border-white/8 text-slate-400 hover:bg-violet-500/10 hover:border-violet-500/20 hover:text-violet-400',
                  )}
                >
                  📸 {rep.photo ? '✓' : 'Fotil/a'}
                </button>
              </div>
            </div>
          )
        })}
      </div>
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
