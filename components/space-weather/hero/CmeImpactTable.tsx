'use client'
// components/space-weather/hero/CmeImpactTable.tsx

import { useMemo } from 'react'
import type { AggregatedData } from '@/lib/noaa'
import type { DonkiCME, DonkiCMEArrival } from '@/lib/space-weather/nasa'

interface Props {
  data: AggregatedData | null | undefined
}

interface ImpactRow {
  id: string
  label: string
  arrivalStart: Date | null
  arrivalEnd: Date | null
  speed: number | null
  type: string | null
  probability: number
  strength: AuroraStrength
}

type AuroraStrength = 'eye-everywhere' | 'eye-dark' | 'photo-good' | 'photo' | 'unlikely'

const STRENGTH_META: Record<AuroraStrength, { dot: string; label: string }> = {
  'eye-everywhere': { dot: '#a855f7', label: 'Všude okem' },
  'eye-dark':       { dot: '#ff3d9a', label: 'Okem ve tmě' },
  'photo-good':     { dot: '#ffa500', label: 'Dobře foťák' },
  'photo':          { dot: '#88ff44', label: 'Foťákem' },
  'unlikely':       { dot: '#4a6080', label: 'Nepravděpodobná' },
}

function estimateStrength(speed: number | null, type: string | null): AuroraStrength {
  const s = speed ?? 0
  const isEarthDirected = type === 'S' || type === 'C'
  if (s >= 1000 && isEarthDirected) return 'eye-everywhere'
  if (s >= 700 && isEarthDirected) return 'eye-dark'
  if (s >= 500 && isEarthDirected) return 'photo-good'
  if (isEarthDirected) return 'photo'
  return 'unlikely'
}

function estimateProbability(cme: DonkiCME): number {
  const type = cme.analysis?.type
  const speed = cme.analysis?.speed ?? 0
  const halfAngle = cme.analysis?.halfAngle ?? 0

  if (type === 'S') {
    const base = 70
    const speedBonus = Math.min(speed / 2000, 1) * 15
    const angleBonus = Math.min(halfAngle / 180, 1) * 15
    return Math.round(Math.min(base + speedBonus + angleBonus, 95))
  }
  if (type === 'C') {
    const base = 35
    const speedBonus = Math.min(speed / 2000, 1) * 20
    const angleBonus = Math.min(halfAngle / 120, 1) * 20
    return Math.round(Math.min(base + speedBonus + angleBonus, 75))
  }
  return Math.round(Math.max(5, Math.min(halfAngle / 3, 20)))
}

function arrivalWindow(arrival: DonkiCMEArrival | null, speed: number | null): { start: Date | null; end: Date | null } {
  if (!arrival) return { start: null, end: null }
  const t = new Date(arrival.arrivalTime)
  const margin = (speed ?? 0) >= 700 ? 6 : 12
  return {
    start: new Date(t.getTime() - margin * 3600_000),
    end: new Date(t.getTime() + margin * 3600_000),
  }
}

function fmtCz(d: Date): string {
  return d.toLocaleString('cs-CZ', {
    timeZone: 'Europe/Prague',
    day: 'numeric', month: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function buildRows(data: AggregatedData | null | undefined): ImpactRow[] {
  if (!data?.donki) return []
  const { cmes, arrivals } = data.donki
  const now = Date.now()
  const rows: ImpactRow[] = []

  const arrivalsByLinked = new Map<string, DonkiCMEArrival>()
  for (const a of arrivals) {
    for (const linkedId of a.linkedEventIds) {
      arrivalsByLinked.set(linkedId, a)
    }
    arrivalsByLinked.set(a.activityID, a)
  }

  for (const cme of cmes) {
    const arrival = arrivalsByLinked.get(cme.activityID) ?? null
    const speed = cme.analysis?.speed ?? null
    const type = cme.analysis?.type ?? null
    const isEarthDirected = type === 'S' || type === 'C'

    if (arrival) {
      const arrTime = new Date(arrival.arrivalTime).getTime()
      if (arrTime < now - 24 * 3600_000) continue
    }

    if (!isEarthDirected && !arrival) continue

    const window = arrivalWindow(arrival, speed)
    const prob = estimateProbability(cme)
    const strength = estimateStrength(speed, type)

    if (prob < 10 && !isEarthDirected) continue

    const startDate = new Date(cme.startTime)
    rows.push({
      id: cme.activityID,
      label: `CME ${startDate.getDate()}.${startDate.getMonth() + 1}. ${speed ? Math.round(speed) + ' km/s' : ''}`,
      arrivalStart: window.start,
      arrivalEnd: window.end,
      speed,
      type,
      probability: prob,
      strength,
    })
  }

  rows.sort((a, b) => b.probability - a.probability)
  return rows.slice(0, 5)
}

export function CmeImpactTable({ data }: Props) {
  const rows = useMemo(() => buildRows(data), [data])

  if (rows.length === 0) return null

  return (
    <div className="absolute top-3 right-3 md:right-5 z-30 w-[220px] md:w-[240px]">
      <div className="bg-[#04101e]/80 backdrop-blur-md border border-white/[0.08] rounded-lg overflow-hidden shadow-[0_2px_16px_rgba(0,0,0,0.4)]">
        <div className="px-2.5 py-1.5 border-b border-white/[0.05] flex items-center gap-1.5">
          <span className="text-[9px] font-mono tracking-[1.5px] uppercase text-aurora-teal/70">
            🎯 Předpověď dopadů
          </span>
          <span className="ml-auto text-[9px] font-mono text-slate-500">{rows.length}×</span>
        </div>

        <div className="max-h-[160px] overflow-y-auto">
          {rows.map(row => {
            const sm = STRENGTH_META[row.strength]
            return (
              <div key={row.id} className="px-2.5 py-1.5 flex items-center gap-2 border-b border-white/[0.03] last:border-0">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: sm.dot, boxShadow: `0 0 4px ${sm.dot}50` }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-mono font-semibold text-slate-200 truncate">{row.label}</span>
                    <span className="ml-auto text-[9px] font-mono font-bold text-aurora-teal shrink-0">{row.probability}%</span>
                  </div>
                  <div className="text-[9px] font-mono text-slate-500 leading-tight mt-0.5">
                    <span className="text-slate-500/70">dopad: </span>
                    {row.arrivalStart && row.arrivalEnd ? (
                      <span className="text-slate-300">{fmtCz(row.arrivalStart)} – {fmtCz(row.arrivalEnd)}</span>
                    ) : <span className="text-slate-500">neurčen</span>}
                  </div>
                  <div className="text-[9px] font-mono mt-0.5" style={{ color: sm.dot }}>
                    {sm.label}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
