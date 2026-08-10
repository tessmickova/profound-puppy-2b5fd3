'use client'
// components/space-weather/CMEArrivalCard.tsx

import type { DonkiCMEArrival } from '@/lib/space-weather/nasa'
import { formatUtcDateTime } from '@/lib/space-weather/formatters'
import { EmptyState } from './EmptyState'

interface Props {
  arrivals: DonkiCMEArrival[]
}

export function CMEArrivalCard({ arrivals }: Props) {
  if (arrivals.length === 0) {
    return <EmptyState icon="🌍" message="Žádná predikce dopadu na Zemi" />
  }

  const latest = arrivals[0]

  return (
    <div className="bg-[#04101e]/90 border border-orange-500/20 rounded-xl p-4 shadow-[0_0_15px_rgba(255,165,0,0.04)]">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">🌍</span>
        <span className="font-display text-xs font-bold text-orange-400">Predikce dopadu na Zemi</span>
      </div>

      <div className="space-y-3">
        {arrivals.slice(0, 3).map(arr => (
          <div key={arr.activityID} className="bg-white/2 rounded-lg p-3">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-xs font-mono text-slate-300 font-semibold">
                {formatUtcDateTime(arr.arrivalTime)}
              </span>
            </div>
            <div className="text-[10px] font-mono text-slate-500">
              {arr.activityID}
            </div>
            {arr.note && (
              <div className="text-[11px] text-slate-500 mt-1 line-clamp-2">{arr.note}</div>
            )}
          </div>
        ))}
      </div>

      {arrivals.length > 3 && (
        <div className="text-[10px] font-mono text-slate-600 mt-2 text-center">
          + {arrivals.length - 3} dalších predikcí
        </div>
      )}
    </div>
  )
}
