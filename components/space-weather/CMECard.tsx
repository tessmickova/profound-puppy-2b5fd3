'use client'
// components/space-weather/CMECard.tsx

import type { DonkiCME } from '@/lib/space-weather/nasa'
import { formatUtcDateTime, formatActiveRegion, formatSpeed, formatLatLon, truncateText } from '@/lib/space-weather/formatters'
import { DataBadge } from './DataBadge'

interface Props {
  cme: DonkiCME
  highlight?: boolean
}

export function CMECard({ cme, highlight = false }: Props) {
  const a = cme.analysis
  return (
    <div className={`bg-[#04101e]/90 border rounded-xl p-4 ${
      highlight
        ? 'border-aurora-teal/30 shadow-[0_0_20px_rgba(0,212,255,0.06)]'
        : 'border-white/8'
    }`}>
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">🌊</span>
          <span className="font-display text-xs font-bold text-slate-200">
            {highlight ? 'Nejnovější CME' : cme.activityID.split('-').slice(0, 3).join('-')}
          </span>
        </div>
        <span className="text-[10px] font-mono text-slate-500 shrink-0">
          {formatUtcDateTime(cme.startTime)}
        </span>
      </div>

      {/* Badges row */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {a?.speed != null && (
          <DataBadge label="⚡" value={formatSpeed(a.speed)} variant={a.speed > 1000 ? 'danger' : a.speed > 500 ? 'warning' : 'accent'} />
        )}
        {cme.sourceLocation && (
          <DataBadge label="📍" value={cme.sourceLocation} />
        )}
        {cme.activeRegionNum && (
          <DataBadge label="🎯" value={formatActiveRegion(cme.activeRegionNum)} />
        )}
        {a?.type && (
          <DataBadge label="Type" value={a.type} />
        )}
      </div>

      <div className="text-xs text-slate-400 space-y-1">
        {a && (a.latitude != null || a.longitude != null) && (
          <div>
            <span className="text-slate-600">Směr: </span>
            {formatLatLon(a.latitude, a.longitude)}
          </div>
        )}
        {a?.halfAngle != null && (
          <div>
            <span className="text-slate-600">Úhel: </span>{a.halfAngle}°
          </div>
        )}
        {cme.instruments.length > 0 && (
          <div>
            <span className="text-slate-600">Přístroje: </span>
            {cme.instruments.join(', ')}
          </div>
        )}
        {cme.note && (
          <div className="text-slate-500 text-[11px] mt-2 leading-relaxed">
            {truncateText(cme.note, 150)}
          </div>
        )}
      </div>

      {cme.link && (
        <a
          href={cme.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-3 text-[10px] font-mono text-aurora-teal/60 hover:text-aurora-teal transition-colors"
        >
          NASA analýza →
        </a>
      )}
    </div>
  )
}
