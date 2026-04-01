'use client'
// components/space-weather/GeomagneticStormCard.tsx

import type { DonkiGST } from '@/lib/space-weather/nasa'
import { formatUtcDateTime, formatKp } from '@/lib/space-weather/formatters'
import { DataBadge } from './DataBadge'
import { EmptyState } from './EmptyState'
import clsx from 'clsx'

interface Props {
  storms: DonkiGST[]
}

function kpVariant(kp: number | null): 'default' | 'accent' | 'aurora' | 'aurora-purple' | 'aurora-strong' {
  if (kp == null) return 'default'
  if (kp >= 7) return 'aurora-strong'
  if (kp >= 5) return 'aurora-purple'
  return 'aurora'
}

export function GeomagneticStormCard({ storms }: Props) {
  if (storms.length === 0) {
    return <EmptyState icon="🧲" message="Žádné geomagnetické bouře za posledních 14 dní" />
  }

  return (
    <div className="space-y-3">
      {storms.slice(0, 5).map(storm => (
        <div
          key={storm.id}
          className={clsx(
            'bg-[#04101e]/90 border rounded-xl p-4',
            storm.maxKp != null && storm.maxKp >= 7 ? 'border-aurora-pink/30' :
            storm.maxKp != null && storm.maxKp >= 5 ? 'border-aurora-purple/25' :
            'border-white/[0.08]'
          )}
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">🧲</span>
              <span className="font-display text-xs font-bold text-slate-200">
                Geomagnetická bouře
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-500">
              {formatUtcDateTime(storm.startTime)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {storm.maxKp != null && (
              <DataBadge label="Max" value={formatKp(storm.maxKp)} variant={kpVariant(storm.maxKp)} />
            )}
            {storm.link && (
              <a
                href={storm.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-mono text-aurora-teal/60 hover:text-aurora-teal transition-colors ml-auto"
              >
                Detail →
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
