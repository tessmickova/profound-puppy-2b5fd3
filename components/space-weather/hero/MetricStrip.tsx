'use client'
// components/space-weather/hero/MetricStrip.tsx
import { memo } from 'react'
import type { HeroData } from '@/lib/space-weather/hero/types'
import { AURORA_LIKELIHOOD_LABELS } from '@/lib/space-weather/hero/types'
import { formatCzDateTime } from '@/lib/space-weather/formatters'
import { MetricCard } from './MetricCard'

interface Props {
  hero: HeroData
}

export const MetricStrip = memo(function MetricStrip({ hero }: Props) {
  const auroraInfo = AURORA_LIKELIHOOD_LABELS[hero.auroraLikelihood]

  return (
    <div className="flex flex-wrap items-center gap-0 divide-x divide-white/8">
      <MetricCard label="KP" value={hero.kp.toFixed(1)} emphasis={hero.kp >= 4} />
      {hero.gScale > 0 && <MetricCard label="G-skala" value={`G${hero.gScale}`} emphasis />}
      <MetricCard label="Bz" value={hero.bz != null ? hero.bz.toFixed(1) : '-'} unit="nT" emphasis={(hero.bz ?? 0) < -5} />
      <MetricCard label="Vitr" value={hero.swSpeed != null ? Math.round(hero.swSpeed).toString() : '-'} unit="km/s" emphasis={(hero.swSpeed ?? 0) > 500} />
      <MetricCard label="Hustota" value={hero.swDensity != null ? hero.swDensity.toFixed(1) : '-'} unit="/cm3" emphasis={(hero.swDensity ?? 0) > 10} />
      {hero.latestFlareClass && (
        <MetricCard label="Erupce" value={hero.latestFlareClass} emphasis={hero.latestFlareClass.startsWith('X') || hero.latestFlareClass.startsWith('M')} />
      )}
      {hero.latestCmeSpeed != null && (
        <MetricCard label="CME" value={Math.round(hero.latestCmeSpeed).toString()} unit="km/s" emphasis={hero.latestCmeSpeed > 500} />
      )}
      {hero.predictedArrival && (
        <MetricCard label="Dopad" value={formatCzDateTime(hero.predictedArrival)} emphasis />
      )}
      <div className="px-3 py-2">
        <div className="text-[11px] font-mono tracking-wider text-slate-300 uppercase leading-tight">Záře ČR</div>
        <div className="font-mono text-lg font-bold leading-snug" style={{ color: auroraInfo.color }}>
          {auroraInfo.label}
        </div>
      </div>
    </div>
  )
})
