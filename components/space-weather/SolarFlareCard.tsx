'use client'
// components/space-weather/SolarFlareCard.tsx

import type { DonkiFlare } from '@/lib/space-weather/nasa'
import { formatUtcDateTime, formatActiveRegion } from '@/lib/space-weather/formatters'
import { DataBadge } from './DataBadge'
import { EmptyState } from './EmptyState'
import clsx from 'clsx'

interface Props {
  flares: DonkiFlare[]
}

const FLARE_STYLES: Record<string, { badge: string; ring: string }> = {
  X: { badge: 'danger',  ring: 'border-red-500/30' },
  M: { badge: 'warning', ring: 'border-orange-500/20' },
  C: { badge: 'accent',  ring: 'border-yellow-500/15' },
}

function getFlareStyle(classType: string) {
  const letter = classType.charAt(0).toUpperCase()
  return FLARE_STYLES[letter] ?? { badge: 'default' as const, ring: 'border-white/[0.08]' }
}

export function SolarFlareCard({ flares }: Props) {
  if (flares.length === 0) {
    return <EmptyState icon="⚡" message="Žádné sluneční erupce za posledních 14 dní" />
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {flares.slice(0, 12).map(flare => {
        const style = getFlareStyle(flare.classType)
        return (
          <div
            key={flare.id}
            className={clsx('bg-[#04101e]/90 border rounded-xl p-4', style.ring)}
          >
            <div className="flex items-center justify-between mb-2">
              <DataBadge
                label="⚡"
                value={flare.classType}
                variant={style.badge as any}
              />
              <span className="text-[10px] font-mono text-slate-500">
                {formatUtcDateTime(flare.beginTime)}
              </span>
            </div>

            <div className="text-xs text-slate-400 space-y-1 mt-2">
              {flare.peakTime && (
                <div>
                  <span className="text-slate-600">Peak: </span>
                  {formatUtcDateTime(flare.peakTime)}
                </div>
              )}
              {flare.sourceLocation && (
                <div>
                  <span className="text-slate-600">Pozice: </span>{flare.sourceLocation}
                </div>
              )}
              {flare.activeRegionNum && (
                <div>
                  <span className="text-slate-600">Region: </span>{formatActiveRegion(flare.activeRegionNum)}
                </div>
              )}
            </div>

            {flare.link && (
              <a
                href={flare.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-2 text-[10px] font-mono text-aurora-teal/60 hover:text-aurora-teal transition-colors"
              >
                Detail →
              </a>
            )}
          </div>
        )
      })}
    </div>
  )
}
