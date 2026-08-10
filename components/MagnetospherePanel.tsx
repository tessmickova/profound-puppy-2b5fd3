'use client'
// components/MagnetospherePanel.tsx — Compact magnetosphere status info panel
import type { SolarWindPoint } from '@/lib/noaa'
import clsx from 'clsx'

interface Props {
  bz: number | null
  bt: number | null
  speed: number | null
  density: number | null
  temperature: number | null
  history: SolarWindPoint[]
}

function statusFromBz(bz: number | null): { label: string; color: string; bg: string } {
  if (bz == null) return { label: 'Neznámý', color: 'text-slate-400', bg: 'bg-slate-500/10' }
  if (bz < -10) return { label: 'Otevřená', color: 'text-aurora-green', bg: 'bg-aurora-green/10' }
  if (bz < -5)  return { label: 'Narušená', color: 'text-aurora-teal', bg: 'bg-aurora-teal/10' }
  if (bz < 0)   return { label: 'Mírně otevřená', color: 'text-yellow-400', bg: 'bg-yellow-500/10' }
  return { label: 'Uzavřená', color: 'text-slate-400', bg: 'bg-slate-500/10' }
}

function pressureStatus(density: number | null, speed: number | null): { label: string; color: string } | null {
  if (density == null || speed == null) return null
  const dynamicPressure = density * (speed * speed) * 1.6726e-6 // nPa approximation
  if (dynamicPressure > 10) return { label: `⚡ Vysoký tlak (${dynamicPressure.toFixed(1)} nPa)`, color: 'text-aurora-green' }
  if (dynamicPressure > 4)  return { label: `Zvýšený tlak (${dynamicPressure.toFixed(1)} nPa)`, color: 'text-aurora-teal' }
  return { label: `${dynamicPressure.toFixed(1)} nPa`, color: 'text-slate-300' }
}

function l1Delay(speed: number | null): string {
  const v = speed ?? 400
  const mins = Math.round(1_500_000 / v / 60)
  return `~${mins} min`
}

function Metric({ label, value, unit, color }: { label: string; value: string; unit?: string; color?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <span className="text-[10px] font-mono tracking-wider text-slate-400 uppercase whitespace-nowrap">{label}</span>
      <span className={clsx('font-mono text-sm font-semibold tabular-nums', color ?? 'text-slate-200')}>
        {value}{unit && <span className="text-[10px] ml-0.5 text-slate-400">{unit}</span>}
      </span>
    </div>
  )
}

export function MagnetospherePanel({ bz, bt, speed, density, temperature, history }: Props) {
  const magStatus = statusFromBz(bz)
  const pressure = pressureStatus(density, speed)

  // Compute Bz southward minutes from history
  let bzSouthMinutes = 0
  let gapMinutes = 0
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].bz < 0) {
      bzSouthMinutes += 1
      gapMinutes = 0
    } else {
      gapMinutes += 1
      if (gapMinutes > 5) break
      bzSouthMinutes += 1
    }
  }

  const bzColor = bz == null ? undefined : bz < -10 ? 'text-aurora-green' : bz < -5 ? 'text-aurora-teal' : bz < 0 ? 'text-yellow-300' : 'text-slate-400'
  const speedColor = speed == null ? undefined : speed > 600 ? 'text-aurora-green' : speed > 450 ? 'text-aurora-teal' : undefined
  const densityColor = density == null ? undefined : density > 20 ? 'text-aurora-green' : density > 10 ? 'text-aurora-teal' : undefined

  return (
    <div className="bg-[#04101e]/90 border border-white/8 rounded-2xl p-4 mt-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-mono tracking-[2px] text-slate-400 uppercase flex items-center gap-2">
          🛡️ Magnetosféra
        </h3>
        <div className={clsx('text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border', magStatus.color, magStatus.bg, 'border-current/20')}>
          {magStatus.label}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2">
        <Metric label="Bz" value={bz != null ? bz.toFixed(1) : '—'} unit="nT" color={bzColor} />
        <Metric label="Bt" value={bt != null ? bt.toFixed(1) : '—'} unit="nT" />
        <Metric label="Rychlost" value={speed != null ? Math.round(speed).toString() : '—'} unit="km/s" color={speedColor} />
        <Metric label="Hustota" value={density != null ? density.toFixed(1) : '—'} unit="/cm³" color={densityColor} />
        <Metric label="L1→Země" value={l1Delay(speed)} />
        <Metric label="Bz jih" value={bzSouthMinutes > 0 ? `${bzSouthMinutes} min` : '—'} color={bzSouthMinutes >= 45 ? 'text-aurora-green' : bzSouthMinutes >= 20 ? 'text-aurora-teal' : undefined} />
      </div>

      {pressure && (
        <div className={clsx('mt-2 text-[11px] font-mono', pressure.color)}>
          💨 Dynamický tlak: {pressure.label}
        </div>
      )}
    </div>
  )
}
