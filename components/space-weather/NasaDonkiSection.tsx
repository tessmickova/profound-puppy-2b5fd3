'use client'
// components/space-weather/NasaDonkiSection.tsx

import type { DonkiData } from '@/lib/space-weather/nasa'
import { formatSpeed, formatKp, formatUtcDateTime } from '@/lib/space-weather/formatters'
import { SectionHeader } from './SectionHeader'
import { CMEList } from './CMEList'
import { CMEArrivalCard } from './CMEArrivalCard'
import { SolarFlareCard } from './SolarFlareCard'
import { GeomagneticStormCard } from './GeomagneticStormCard'
import { DataBadge } from './DataBadge'

interface Props {
  donki: DonkiData | null
}

export function NasaDonkiSection({ donki }: Props) {
  if (!donki) {
    return (
      <div className="mt-8">
        <SectionHeader icon="🛰️" title="NASA DONKI — Space Weather" />
        <div className="bg-[#04101e]/90 border border-white/[0.08] rounded-xl p-6 text-center text-slate-500 text-sm">
          NASA DONKI data dočasně nedostupná.
        </div>
      </div>
    )
  }

  const latestCme   = donki.cmes[0] ?? null
  const latestFlare = donki.flares[0] ?? null
  const latestStorm = donki.storms[0] ?? null
  const latestArr   = donki.arrivals[0] ?? null

  return (
    <div className="mt-8 space-y-6">
      {/* Section header */}
      <SectionHeader
        icon="🛰️"
        title="NASA DONKI — Space Weather"
        subtitle="CME, sluneční erupce, predikce dopadů a geomagnetické bouře (14 dní)"
      />

      {/* Summary strip */}
      <div className="flex flex-wrap gap-2">
        {latestCme?.analysis?.speed != null && (
          <DataBadge
            label="CME"
            value={formatSpeed(latestCme.analysis.speed)}
            variant={latestCme.analysis.speed > 1000 ? 'danger' : latestCme.analysis.speed > 500 ? 'warning' : 'accent'}
          />
        )}
        {latestFlare && (
          <DataBadge
            label="Erupce"
            value={latestFlare.classType}
            variant={latestFlare.classType.startsWith('X') ? 'danger' : latestFlare.classType.startsWith('M') ? 'warning' : 'default'}
          />
        )}
        {latestArr && (
          <DataBadge label="Dopad" value={formatUtcDateTime(latestArr.arrivalTime)} variant="warning" />
        )}
        {latestStorm?.maxKp != null && (
          <DataBadge label="Bouře" value={formatKp(latestStorm.maxKp)} variant={latestStorm.maxKp >= 7 ? 'danger' : 'warning'} />
        )}
        {!latestCme && !latestFlare && !latestArr && !latestStorm && (
          <span className="text-xs text-slate-500 font-mono">Žádné významné události</span>
        )}
      </div>

      {/* Grid: arrivals + storms side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="text-[10px] font-mono tracking-[3px] text-aurora-purple/60 uppercase mb-3 flex items-center gap-3">
            🌍 Predikce dopadů CME <span className="flex-1 h-px bg-white/5" />
            <span className="text-slate-600">{donki.arrivals.length}</span>
          </div>
          <CMEArrivalCard arrivals={donki.arrivals} />
        </div>
        <div>
          <div className="text-[10px] font-mono tracking-[3px] text-aurora-purple/60 uppercase mb-3 flex items-center gap-3">
            🧲 Geomagnetické bouře <span className="flex-1 h-px bg-white/5" />
            <span className="text-slate-600">{donki.storms.length}</span>
          </div>
          <GeomagneticStormCard storms={donki.storms} />
        </div>
      </div>

      {/* Solar flares */}
      <div>
        <div className="text-[10px] font-mono tracking-[3px] text-aurora-purple/60 uppercase mb-3 flex items-center gap-3">
          ⚡ Sluneční erupce (NASA DONKI) <span className="flex-1 h-px bg-white/5" />
          <span className="text-slate-600">{donki.flares.length} událostí</span>
        </div>
        <SolarFlareCard flares={donki.flares} />
      </div>

      {/* CME list */}
      <div>
        <div className="text-[10px] font-mono tracking-[3px] text-aurora-purple/60 uppercase mb-3 flex items-center gap-3">
          🌊 CME události (NASA DONKI) <span className="flex-1 h-px bg-white/5" />
          <span className="text-slate-600">{donki.cmes.length} událostí</span>
        </div>
        <CMEList cmes={donki.cmes} />
      </div>

      {/* Source */}
      <div className="text-right">
        <span className="text-[9px] font-mono text-slate-600">
          Zdroj: NASA DONKI · api.nasa.gov
        </span>
      </div>
    </div>
  )
}
