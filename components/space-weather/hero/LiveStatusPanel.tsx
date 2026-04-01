'use client'
// components/space-weather/hero/LiveStatusPanel.tsx

import { useMemo } from 'react'
import type { AggregatedData, SolarWindPoint, KpPoint } from '@/lib/noaa'
import { deriveSpaceWeatherState } from '@/lib/space-weather/hero/deriveSpaceWeatherState'
import { AURORA_LIKELIHOOD_LABELS } from '@/lib/space-weather/hero/types'
import { formatCzDateTime } from '@/lib/space-weather/formatters'
import { getMoonInfo } from '@/lib/astronomy'
import { StageBadge } from './StageBadge'

interface Props {
  data: AggregatedData | null | undefined
}

/** Analyze how long Bz has been continuously southward (negative), allowing brief interruptions */
function analyzeBzDuration(history: SolarWindPoint[]): {
  minutesSouth: number
  sustainedEnough: 'none' | 'weak' | 'moderate' | 'strong'
  label: string
  color: string
} {
  if (history.length < 2) return { minutesSouth: 0, sustainedEnough: 'none', label: 'Nedostatek dat', color: '#64748b' }

  // Walk backwards through history, count minutes where Bz < 0
  // Allow up to 5-min positive gaps (Bz oscillates)
  let totalNegMinutes = 0
  let gapMinutes = 0
  const maxGap = 5 // allow 5-min positive interruption

  for (let i = history.length - 1; i >= 0; i--) {
    const bz = history[i].bz
    if (bz < 0) {
      totalNegMinutes += 1
      gapMinutes = 0 // reset gap
    } else {
      gapMinutes += 1
      if (gapMinutes > maxGap) break // continuous period ended
      totalNegMinutes += 1 // count brief interruption as part of the period
    }
  }

  // Thresholds for CZ aurora (50°N):
  // - Weak photo chance: ~20+ min of Bz < 0 (with Kp 4+)
  // - Moderate: ~45+ min sustained southward
  // - Strong: ~90+ min sustained deep southward
  let sustainedEnough: 'none' | 'weak' | 'moderate' | 'strong' = 'none'
  let label = ''
  let color = '#64748b'

  if (totalNegMinutes >= 90) {
    sustainedEnough = 'strong'
    label = `${totalNegMinutes} min ⚡ silná aktivace`
    color = '#ef4444'
  } else if (totalNegMinutes >= 45) {
    sustainedEnough = 'moderate'
    label = `${totalNegMinutes} min — dobrá aktivace`
    color = '#ffa500'
  } else if (totalNegMinutes >= 20) {
    sustainedEnough = 'weak'
    label = `${totalNegMinutes} min — začíná se`
    color = '#48c7ff'
  } else if (totalNegMinutes > 0) {
    label = `${totalNegMinutes} min — krátce`
    color = '#64748b'
  } else {
    label = 'Bz v plusu'
    color = '#22c55e'
  }

  return { minutesSouth: totalNegMinutes, sustainedEnough, label, color }
}

export function LiveStatusPanel({ data }: Props) {
  const hero = useMemo(() => deriveSpaceWeatherState(data), [data])
  const auroraInfo = AURORA_LIKELIHOOD_LABELS[hero.auroraLikelihood]
  const bzAnalysis = useMemo(() => analyzeBzDuration(data?.solarWindHistory ?? []), [data?.solarWindHistory])
  const moon = useMemo(() => getMoonInfo(), [])

  // KP: 3h average from history
  const kpHistory = data?.kpHistory ?? []
  const kp3hAvg = useMemo(() => {
    const recent = kpHistory.filter(p => p.source !== 'predicted').slice(-6)
    if (recent.length === 0) return null
    return recent.reduce((s, p) => s + p.kp_index, 0) / recent.length
  }, [kpHistory])

  // KP: next predicted
  const kpPredicted = useMemo(() => {
    const pred = kpHistory.filter(p => p.source === 'predicted')
    return pred.length > 0 ? pred[0].kp_index : null
  }, [kpHistory])

  // L1 travel time estimate
  const l1TravelMin = useMemo(() => {
    const speed = hero.swSpeed ?? 400
    return Math.round(1_500_000 / speed / 60)
  }, [hero.swSpeed])

  // L1 values (latest from solarWindHistory = L1 data)
  const swHistory = data?.solarWindHistory ?? []
  const l1Latest = swHistory.length > 0 ? swHistory[swHistory.length - 1] : null
  // "Earth" values estimate = data from ~l1TravelMin ago
  const earthIdx = Math.max(0, swHistory.length - 1 - l1TravelMin)
  const earthData = swHistory.length > l1TravelMin ? swHistory[earthIdx] : null

  const nowCz = new Date().toLocaleTimeString('cs-CZ', {
    timeZone: 'Europe/Prague', hour: '2-digit', minute: '2-digit',
  })



  return (
    <div className="bg-[#04101e] border-b border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-5">
        {/* Top row: Badge + LIVE time */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
          <div className="flex items-center gap-3">
          </div>
          <time className="text-[11px] font-mono text-slate-400 flex items-center gap-2">
            {nowCz} SEČ
            <span className="flex items-center gap-1 text-green-400 font-semibold">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_6px_#4ade80] animate-pulse" />
              LIVE
            </span>
          </time>
        </div>

        {/* Main layout: hero numbers + metrics grid */}
        <div className="flex items-start gap-6 md:gap-8">
          {/* KP — primary indicator */}
          <div className="text-center shrink-0">
            <div className="text-[10px] font-mono tracking-[3px] text-slate-400 uppercase mb-1">KP index</div>
            <div
              className={`font-display text-5xl md:text-6xl font-black leading-none tracking-tight
                ${hero.kp >= 7 ? 'text-aurora-pink' : hero.kp >= 5 ? 'text-aurora-purple' : hero.kp >= 4 ? 'text-aurora-green' : hero.kp >= 2 ? 'text-aurora-teal' : 'text-slate-200'}`}
              style={hero.kp >= 4 ? { textShadow: `0 0 24px ${hero.kp >= 7 ? 'rgba(255,61,154,0.4)' : hero.kp >= 5 ? 'rgba(168,85,247,0.35)' : 'rgba(0,255,170,0.3)'}` } : undefined}
            >
              {hero.kp.toFixed(1)}
            </div>
            {hero.gScale > 0 && (
              <div className="mt-1 text-sm font-mono font-bold text-aurora-pink">G{hero.gScale}</div>
            )}
            {/* Aurora color dots — real colors visible at this KP */}
            {hero.kp >= 4 && (
              <div className="flex items-center justify-center gap-1 mt-1.5" title={
                hero.kp >= 7 ? 'Zelená + fialová + růžová záře okem'
                : hero.kp >= 6 ? 'Zelená + fialové paprsky'
                : hero.kp >= 5 ? 'Zelený oblouk + nádech fialové'
                : 'Zelený zásvit (foto)'
              }>
                {/* Green — always present from KP 4+ */}
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#00ffaa', boxShadow: '0 0 6px rgba(0,255,170,0.5)' }} />
                {/* Purple — from KP 5+ */}
                {hero.kp >= 5 && (
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#a855f7', boxShadow: '0 0 6px rgba(168,85,247,0.5)' }} />
                )}
                {/* Pink/red — from KP 7+ */}
                {hero.kp >= 7 && (
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#ff3d9a', boxShadow: '0 0 6px rgba(255,61,154,0.5)' }} />
                )}
                <span className="text-[9px] font-mono text-slate-500 ml-0.5">
                  {hero.kp >= 5 ? 'okem' : 'foto'}
                </span>
              </div>
            )}
            <div className="flex gap-2 justify-center mt-1.5">
              {kp3hAvg != null && (
                <span className="text-[11px] font-mono text-slate-400" title="3-hodinový průměr">
                  3h: <span className="text-slate-200 font-semibold">{kp3hAvg.toFixed(1)}</span>
                </span>
              )}
              {kpPredicted != null && (
                <span className="text-[11px] font-mono text-slate-500" title="Předpověď">
                  →<span className="text-aurora-teal/70 font-semibold">{kpPredicted.toFixed(1)}</span>
                </span>
              )}
            </div>
          </div>

          {/* HPI — Hemispheric Power */}
          {hero.hpiCurrent != null && (
            <div className="text-center shrink-0">
              <div className="text-[10px] font-mono tracking-[3px] text-slate-400 uppercase mb-1">HPI</div>
              <div
                className={`font-display text-3xl md:text-4xl font-black leading-none tracking-tight
                  ${hero.hpiCurrent >= 100 ? 'text-aurora-green' : hero.hpiCurrent >= 50 ? 'text-aurora-green' : hero.hpiCurrent >= 20 ? 'text-aurora-teal' : 'text-slate-200'}`}
                style={hero.hpiCurrent >= 50 ? { textShadow: `0 0 20px rgba(0,255,170,0.25)` } : undefined}
              >
                {Math.round(hero.hpiCurrent)}
              </div>
              <div className="text-[10px] font-mono text-slate-400 mt-0.5">GW</div>
              <div className="text-[10px] font-mono mt-1" style={{
                color: hero.hpiCurrent >= 100 ? '#00ffaa' : hero.hpiCurrent >= 50 ? '#00ffaa' : hero.hpiCurrent >= 20 ? '#00d4ff' : '#64748b'
              }}>
                {hero.hpiCurrent >= 100 ? '⚡ Bouře' : hero.hpiCurrent >= 50 ? '🔥 Aktivní' : hero.hpiCurrent >= 20 ? '~ Mírný' : '😴 Klid'}
              </div>
            </div>
          )}

          {/* Vertical divider */}
          <div className="hidden md:block w-px self-stretch bg-white/[0.08] my-1" />

          {/* Metrics — two groups filling remaining width */}
          <div className="flex-1 min-w-0 space-y-4">
            {/* Group 1: Sonda L1 — sluneční vítr */}
            <div>
              <div className="text-[9px] font-mono tracking-[2px] text-slate-500 uppercase mb-2">Sonda L1 — sluneční vítr</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-3">
                {/* Bz — magnetické pole */}
                <div>
                  <div className="text-[10px] font-mono text-slate-500 mb-0.5">Mag. pole (Bz)</div>
                  <div className={`font-mono text-xl font-bold leading-tight ${(hero.bz ?? 0) < -5 ? 'text-aurora-green' : (hero.bz ?? 0) < 0 ? 'text-aurora-teal' : 'text-slate-400'}`}>
                    {hero.bz != null ? hero.bz.toFixed(1) : '–'}
                    <span className="text-[10px] text-slate-400 ml-0.5">nT</span>
                  </div>
                  <div className="mt-1 flex items-center gap-1.5">
                    <div className="w-12 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${Math.min(bzAnalysis.minutesSouth / 90 * 100, 100)}%`,
                          backgroundColor: bzAnalysis.color,
                        }}
                      />
                    </div>
                    <span className="text-[10px] font-mono" style={{ color: bzAnalysis.color }}>
                      {bzAnalysis.minutesSouth > 0 ? `${bzAnalysis.minutesSouth}′` : '+'}
                    </span>
                  </div>
                </div>
                {/* Rychlost větru */}
                <div>
                  <div className="text-[10px] font-mono text-slate-500 mb-0.5">Rychlost</div>
                  <div className={`font-mono text-xl font-bold leading-tight ${(hero.swSpeed ?? 0) > 500 ? 'text-aurora-green' : 'text-slate-100'}`}>
                    {hero.swSpeed != null ? Math.round(hero.swSpeed).toString() : '–'}
                    <span className="text-[10px] text-slate-400 ml-0.5">km/s</span>
                  </div>
                  {earthData && (
                    <div className="text-[10px] font-mono text-slate-500 mt-0.5">🌍 ~{Math.round(earthData.speed)} km/s</div>
                  )}
                </div>
                {/* Hustota */}
                <div>
                  <div className="text-[10px] font-mono text-slate-500 mb-0.5">Hustota</div>
                  <div className={`font-mono text-xl font-bold leading-tight ${(hero.swDensity ?? 0) > 10 ? 'text-aurora-green' : 'text-slate-100'}`}>
                    {hero.swDensity != null ? hero.swDensity.toFixed(1) : '–'}
                    <span className="text-[10px] text-slate-400 ml-0.5">cm⁻³</span>
                  </div>
                </div>
                {/* Celkové pole Bt */}
                {data?.solarWind?.bt != null ? (
                  <div>
                    <div className="text-[10px] font-mono text-slate-500 mb-0.5">Celkové pole (Bt)</div>
                    <div className="font-mono text-xl font-bold leading-tight text-slate-100">
                      {data.solarWind.bt.toFixed(1)}
                      <span className="text-[10px] text-slate-400 ml-0.5">nT</span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="text-[10px] font-mono text-slate-500 mb-0.5">L1 → Země</div>
                    <div className="font-mono text-lg font-bold text-aurora-teal/80 leading-tight">
                      ~{l1TravelMin}<span className="text-[10px] text-slate-400 ml-1">min</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Group 2: Magnetosféra + události */}
            <div>
              <div className="text-[9px] font-mono tracking-[2px] text-slate-500 uppercase mb-2">Magnetosféra a události</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-3">
                {/* Dst — bouřový index */}
                {hero.dstCurrent != null && hero.dstCurrent !== 0 && (
                  <div>
                    <div className="text-[10px] font-mono text-slate-500 mb-0.5">Bouřový index (Dst)</div>
                    <div className={`font-mono text-xl font-bold leading-tight ${hero.dstCurrent < -100 ? 'text-aurora-green' : hero.dstCurrent < -50 ? 'text-aurora-green' : hero.dstCurrent < -30 ? 'text-aurora-teal' : 'text-slate-100'}`}>
                      {hero.dstCurrent}
                      <span className="text-[10px] text-slate-400 ml-0.5">nT</span>
                    </div>
                    <div className="text-[10px] font-mono mt-0.5" style={{
                      color: hero.dstCurrent < -100 ? '#00ffaa' : hero.dstCurrent < -50 ? '#00ffaa' : hero.dstCurrent < -30 ? '#00d4ff' : '#64748b'
                    }}>
                      {hero.dstCurrent < -100 ? 'Silná bouře' : hero.dstCurrent < -50 ? 'Střední bouře' : hero.dstCurrent < -30 ? 'Neklid' : 'Klid'}
                    </div>
                  </div>
                )}
                {/* Dynamický tlak */}
                {hero.swDensity != null && hero.swSpeed != null && (() => {
                  const dp = hero.swDensity * (hero.swSpeed * hero.swSpeed) * 1.6726e-6
                  return dp > 3 ? (
                    <div>
                      <div className="text-[10px] font-mono text-slate-500 mb-0.5">Dyn. tlak</div>
                      <div className={`font-mono text-xl font-bold leading-tight ${dp > 10 ? 'text-aurora-green' : dp > 4 ? 'text-aurora-teal' : 'text-slate-100'}`}>
                        {dp.toFixed(1)}
                        <span className="text-[10px] text-slate-400 ml-0.5">nPa</span>
                      </div>
                    </div>
                  ) : null
                })()}
                {/* L1 → Země (shown here if Bt was shown above) */}
                {data?.solarWind?.bt != null && (
                  <div>
                    <div className="text-[10px] font-mono text-slate-500 mb-0.5">Zpoždění L1 → Země</div>
                    <div className="font-mono text-lg font-bold text-aurora-teal/80 leading-tight">
                      ~{l1TravelMin}<span className="text-[10px] text-slate-400 ml-1">min</span>
                    </div>
                  </div>
                )}
                {/* Poslední erupce */}
                {hero.latestFlareClass && (
                  <div>
                    <div className="text-[10px] font-mono text-slate-500 mb-0.5">Poslední erupce</div>
                    <div className={`font-mono text-xl font-bold leading-tight ${hero.latestFlareClass.startsWith('X') || hero.latestFlareClass.startsWith('M') ? 'text-aurora-green' : 'text-slate-100'}`}>
                      {hero.latestFlareClass}
                    </div>
                  </div>
                )}
                {/* Příjezd CME */}
                {hero.predictedArrival && (
                  <div>
                    <div className="text-[10px] font-mono text-slate-500 mb-0.5">Příjezd CME</div>
                    <div className="font-mono text-lg font-bold text-aurora-green leading-tight">
                      {formatCzDateTime(hero.predictedArrival)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Status badges */}
        <div className="flex flex-wrap items-center gap-3 mt-5">
          {/* CZ Aurora likelihood badge */}
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border"
            style={{ borderColor: `${auroraInfo.color}30`, backgroundColor: `${auroraInfo.color}08` }}
          >
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: auroraInfo.color, boxShadow: `0 0 10px ${auroraInfo.color}70` }} />
            <span className="text-xs font-mono font-bold" style={{ color: auroraInfo.color }}>
              🇨🇿 {auroraInfo.label}
            </span>
          </div>

          {/* Magnetosphere state badge */}
          {(() => {
            const bz = hero.bz ?? 0
            const isSouth = bz < -5 && bzAnalysis.minutesSouth >= 20
            const isLocked = bz > 2
            if (isSouth) return (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border" style={{ borderColor: 'rgba(0,255,170,0.2)', backgroundColor: 'rgba(0,255,170,0.05)' }}>
                <span className="text-xs font-mono font-semibold text-aurora-green">🔓 Magnetosféra otevřená</span>
              </div>
            )
            if (isLocked) return (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border" style={{ borderColor: 'rgba(250,204,21,0.2)', backgroundColor: 'rgba(250,204,21,0.05)' }}>
                <span className="text-xs font-mono font-semibold text-yellow-400/80">🔒 Magnetosféra uzamčená</span>
              </div>
            )
            return (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border" style={{ borderColor: 'rgba(100,116,139,0.2)', backgroundColor: 'rgba(100,116,139,0.05)' }}>
                <span className="text-xs font-mono font-semibold text-slate-400">🛡️ Magnetosféra reaguje</span>
              </div>
            )
          })()}

          {/* Moon phase badge */}
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border"
            style={{
              borderColor: moon.illumination > 0.5 ? 'rgba(250,204,21,0.2)' : 'rgba(100,116,139,0.2)',
              backgroundColor: moon.illumination > 0.5 ? 'rgba(250,204,21,0.05)' : 'rgba(100,116,139,0.05)',
            }}
          >
            <span className="text-sm">{moon.icon}</span>
            <span className={`text-xs font-mono font-semibold ${moon.illumination > 0.5 ? 'text-yellow-400/80' : 'text-slate-400'}`}>
              {Math.round(moon.illumination * 100)}%
            </span>
            {moon.illumination > 0.6 && (
              <span className="text-[11px] font-mono text-yellow-500/60">⚠ svit</span>
            )}
          </div>

          {/* Bz duration badge */}
          {bzAnalysis.minutesSouth > 0 && (
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border"
              style={{ borderColor: `${bzAnalysis.color}30`, backgroundColor: `${bzAnalysis.color}08` }}
            >
              <span className="text-xs font-mono font-semibold" style={{ color: bzAnalysis.color }}>
                ⏱ Bz−: {bzAnalysis.label}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
