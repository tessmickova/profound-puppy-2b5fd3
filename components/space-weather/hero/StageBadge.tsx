'use client'
// components/space-weather/hero/StageBadge.tsx
import { memo } from 'react'
import type { SpaceWeatherState } from '@/lib/space-weather/hero/types'

interface Props {
  state: SpaceWeatherState
}

const STATE_CONFIG: Record<SpaceWeatherState, { label: string; color: string; bg: string; border: string }> = {
  QUIET:                  { label: 'Klidno',                      color: 'text-slate-300',  bg: 'bg-slate-500/10',     border: 'border-slate-500/20' },
  SOLAR_EVENT_DETECTED:   { label: 'Sluneční aktivita',           color: 'text-yellow-300', bg: 'bg-yellow-500/10',    border: 'border-yellow-500/20' },
  EARTH_DIRECTED_CME:     { label: 'CME směrem k Zemi',           color: 'text-orange-300', bg: 'bg-orange-500/10',    border: 'border-orange-500/20' },
  CORONAL_HOLE_STREAM:    { label: 'Koronální díra (HSS)',        color: 'text-cyan-300',   bg: 'bg-cyan-500/10',      border: 'border-cyan-500/20' },
  IN_TRANSIT:             { label: 'CME na cestě k Zemi',         color: 'text-orange-300', bg: 'bg-orange-500/10',    border: 'border-orange-500/20' },
  L1_IMPACT_IMMINENT:     { label: 'L1 měří zvýšenou aktivitu',   color: 'text-aurora-teal',bg: 'bg-aurora-teal/10',   border: 'border-aurora-teal/20' },
  MAGNETOSPHERE_ACTIVE:   { label: 'Geomagnetická aktivita',     color: 'text-aurora-teal',bg: 'bg-aurora-teal/10',   border: 'border-aurora-teal/20' },
  AURORA_POSSIBLE_CZ:     { label: 'Záře možná v ČR',             color: 'text-aurora-green',bg:'bg-aurora-green/10',  border: 'border-aurora-green/20' },
  AURORA_LIKELY_CZ:       { label: 'Záře pravděpodobná v ČR!',    color: 'text-aurora-pink', bg: 'bg-aurora-pink/10',  border: 'border-aurora-pink/20' },
}

export const StageBadge = memo(function StageBadge({ state }: Props) {
  const cfg = STATE_CONFIG[state]
  return (
    <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono font-semibold tracking-wide border backdrop-blur-xs ${cfg.color} ${cfg.bg} ${cfg.border}`}>
      {(state === 'AURORA_LIKELY_CZ' || state === 'AURORA_POSSIBLE_CZ') && (
        <span className="w-1.5 h-1.5 rounded-full bg-aurora-green shadow-[0_0_6px_#00ffaa] animate-pulse" />
      )}
      {cfg.label}
    </span>
  )
})
