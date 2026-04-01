'use client'
// components/space-weather/hero/TransitPath.tsx
import { memo } from 'react'
import type { JourneyStage, SpaceWeatherState, AuroraLikelihood } from '@/lib/space-weather/hero/types'
import { AURORA_LIKELIHOOD_LABELS } from '@/lib/space-weather/hero/types'

interface Props {
  activeStages: JourneyStage[]
  state: SpaceWeatherState
  intensity: number
  transitProgress: number
  auroraLikelihood: AuroraLikelihood
}

/** Each waypoint gets a unique active color so they're visually distinct */
const WAYPOINTS: { id: JourneyStage; icon: string; label: string; desc: string; activeColor: string; pct: number }[] = [
  { id: 'sun',           icon: '☀️', label: 'Slunce',       desc: '',                              activeColor: '#ffa500', pct: 0   },
  { id: 'transit',       icon: '🌀', label: 'Tranzit',      desc: 'CME v meziplanetárním prostoru', activeColor: '#ffc842', pct: 30  },
  { id: 'l1',            icon: '🛰️', label: 'L1 sonda',     desc: 'DSCOVR/ACE měří sluneční vítr', activeColor: '#00d4ff', pct: 60  },
  { id: 'magnetosphere', icon: '🧲', label: 'Magnetosféra', desc: 'Geomagnetická aktivita',        activeColor: '#a855f7', pct: 80  },
  { id: 'earth',         icon: '🌍', label: 'ČR 50°N',      desc: '',                              activeColor: '#00ffaa', pct: 100 },
]

/** Short reason why a stage is lit up */
function stageReason(id: JourneyStage, state: SpaceWeatherState): string | null {
  switch (id) {
    case 'sun':
      if (state === 'SOLAR_EVENT_DETECTED' || state === 'EARTH_DIRECTED_CME' || state === 'IN_TRANSIT') return 'Erupce'
      return null
    case 'transit':
      if (state === 'IN_TRANSIT') return 'CME letí k Zemi'
      if (state === 'EARTH_DIRECTED_CME') return 'CME detekováno'
      return null
    case 'l1':
      return 'Zvýšený vítr/Bz'
    case 'magnetosphere':
      if (state === 'AURORA_LIKELY_CZ' || state === 'AURORA_POSSIBLE_CZ') return 'Bouře!'
      if (state === 'MAGNETOSPHERE_ACTIVE') return 'Aktivní'
      return 'KP zvýšené'
    case 'earth':
      if (state === 'AURORA_LIKELY_CZ') return 'Záře viditelná!'
      if (state === 'AURORA_POSSIBLE_CZ') return 'Možná záře'
      return null
  }
}

export const TransitPath = memo(function TransitPath({ activeStages, state, intensity, transitProgress, auroraLikelihood }: Props) {
  const furthestIdx = WAYPOINTS.reduce((max, w, i) =>
    activeStages.includes(w.id) ? i : max, -1
  )
  const progressPct = furthestIdx >= 0 ? WAYPOINTS[furthestIdx].pct : 0
  const cmePct = transitProgress * 100
  const likeInfo = AURORA_LIKELIHOOD_LABELS[auroraLikelihood]
  const showCme = state !== 'QUIET' && state !== 'SOLAR_EVENT_DETECTED' && transitProgress > 0

  return (
    <div className="absolute inset-x-0 bottom-8 pointer-events-none z-20" role="img" aria-label="Cesta sluneční události od Slunce k Zemi">
      {/* Desktop */}
      <div className="hidden md:block relative h-44 mx-[10%]">
        {/* Background line */}
        <div className="absolute top-10 left-0 right-0 h-[3px] bg-white/[0.10] rounded-full" />

        {/* Segmented active progress — each segment gets its waypoint color */}
        {WAYPOINTS.map((w, i) => {
          if (i === 0) return null
          const prev = WAYPOINTS[i - 1]
          const isSegActive = activeStages.includes(w.id) || activeStages.includes(prev.id)
          if (!isSegActive || progressPct < prev.pct) return null
          const segEnd = Math.min(w.pct, progressPct)
          return (
            <div
              key={`seg-${w.id}`}
              className="absolute top-10 h-[3px] rounded-full transition-all duration-[2000ms] ease-out"
              style={{
                left: `${prev.pct}%`,
                width: `${segEnd - prev.pct}%`,
                backgroundColor: w.activeColor,
                boxShadow: `0 0 10px ${w.activeColor}60`,
                opacity: 0.85,
              }}
            />
          )
        })}

        {/* CME marker */}
        {showCme && (
          <div
            className="absolute -translate-x-1/2 flex flex-col items-center transition-all duration-[2000ms] ease-out"
            style={{ left: `${cmePct}%`, top: '0px' }}
          >
            <div className="relative">
              <div className="w-6 h-6 rounded-full bg-amber-400 border-2 border-amber-300/80" style={{ boxShadow: '0 0 20px rgba(255,180,50,0.7)' }} />
              <div className="absolute inset-[-5px] w-[34px] h-[34px] rounded-full animate-pulse" style={{ background: 'radial-gradient(circle, rgba(255,200,50,0.4) 0%, transparent 70%)' }} />
            </div>
            <span className="text-[10px] font-mono font-bold text-amber-300 mt-1 whitespace-nowrap drop-shadow-[0_0_4px_rgba(255,200,50,0.5)]">CME</span>
          </div>
        )}

        {/* Waypoint nodes — each with distinct color when active */}
        {WAYPOINTS.map((w) => {
          const isActive = activeStages.includes(w.id)
          const reason = isActive ? stageReason(w.id, state) : null
          return (
            <div
              key={w.id}
              className="absolute -translate-x-1/2 flex flex-col items-center"
              style={{ left: `${w.pct}%` }}
            >
              <div className="relative flex flex-col items-center">
                <span className={`text-lg transition-all duration-1000 ${isActive ? 'opacity-100 scale-110' : 'opacity-35 grayscale'}`}>
                  {w.icon}
                </span>
                <div
                  className="w-3.5 h-3.5 rounded-full transition-all duration-1000 mt-0.5"
                  style={{
                    backgroundColor: isActive ? w.activeColor : '#1a2536',
                    border: `2px solid ${isActive ? w.activeColor : 'rgba(255,255,255,0.12)'}`,
                    boxShadow: isActive ? `0 0 14px ${w.activeColor}90` : 'none',
                    transform: isActive ? 'scale(1.2)' : 'scale(1)',
                  }}
                />
              </div>
              <span
                className="text-[10px] font-mono mt-1.5 whitespace-nowrap font-bold transition-colors duration-1000"
                style={{ color: isActive ? w.activeColor : '#64748b' }}
              >
                {w.label}
              </span>
              {/* Short description — always visible but dimmed */}
              {w.desc && (
                <span className={`text-[9px] font-mono whitespace-nowrap text-center leading-snug ${isActive ? 'text-slate-300/80' : 'text-slate-600/40'}`}>
                  {w.desc}
                </span>
              )}
              {/* Reason tag — only when active, in the waypoint's color */}
              {reason && (
                <span
                  className="text-[9px] font-mono font-semibold mt-0.5 px-1.5 py-0.5 rounded-full whitespace-nowrap"
                  style={{ color: w.activeColor, backgroundColor: `${w.activeColor}15`, border: `1px solid ${w.activeColor}30` }}
                >
                  {reason}
                </span>
              )}
            </div>
          )
        })}

        {/* CZ Visibility badge — top right */}
        <div className="absolute right-0 -top-3 flex items-center gap-2 bg-[#030810]/70 backdrop-blur-sm rounded-full px-3 py-1 border border-white/[0.08]">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: likeInfo.color, boxShadow: `0 0 10px ${likeInfo.color}70` }} />
          <span className="text-[10px] font-mono font-bold whitespace-nowrap" style={{ color: likeInfo.color }}>
            🇨🇿 {likeInfo.label}
          </span>
        </div>
      </div>

      {/* Mobile */}
      <div className="md:hidden px-4 pb-2">
        <div className="flex items-center justify-end gap-1.5 mb-1">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: likeInfo.color, boxShadow: `0 0 6px ${likeInfo.color}60` }} />
          <span className="text-[9px] font-mono font-bold" style={{ color: likeInfo.color }}>🇨🇿 {likeInfo.label}</span>
        </div>
        <div className="relative">
          <div className="absolute top-[7px] left-0 right-0 h-[2px] bg-white/10 rounded-full" />
          <div className="absolute top-[7px] left-0 h-[2px] rounded-full transition-all duration-[2000ms]" style={{ width: `${progressPct}%`, background: 'linear-gradient(90deg, rgba(255,200,50,0.7), rgba(0,212,255,0.7))', boxShadow: '0 0 6px rgba(0,212,255,0.2)' }} />
          {showCme && (
            <div className="absolute -translate-x-1/2 top-[2px]" style={{ left: `${cmePct}%` }}>
              <div className="w-3 h-3 rounded-full bg-amber-400" style={{ boxShadow: '0 0 8px rgba(255,180,50,0.5)' }} />
            </div>
          )}
          <div className="flex items-start justify-between relative">
            {WAYPOINTS.map(w => {
              const isActive = activeStages.includes(w.id)
              return (
                <div key={w.id} className="flex flex-col items-center flex-1">
                  <div
                    className="w-3 h-3 rounded-full transition-all duration-1000"
                    style={{
                      backgroundColor: isActive ? w.activeColor : 'rgba(255,255,255,0.1)',
                      boxShadow: isActive ? `0 0 6px ${w.activeColor}50` : 'none',
                    }}
                  />
                  <span className={`text-[9px] font-mono mt-1 ${isActive ? '' : 'text-slate-500'}`} style={isActive ? { color: w.activeColor } : undefined}>
                    {w.icon}
                  </span>
                  <span className="text-[9px] font-mono font-semibold" style={{ color: isActive ? w.activeColor : '#64748b' }}>
                    {w.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
})
