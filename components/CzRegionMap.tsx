'use client'
// components/CzRegionMap.tsx — Minimalist SVG map of Czech Republic with real region shapes
import { useState, useMemo } from 'react'
import { CZ_LOCATIONS, type CzLocation } from '@/lib/astronomy'
import clsx from 'clsx'

interface Props {
  selectedRegion: string | null
  onSelectRegion: (region: string) => void
  selectedLocation: CzLocation
  onSelectLocation: (loc: CzLocation) => void
}

function bortleColor(bortle: number): string {
  if (bortle <= 3) return '#00ffaa'
  if (bortle <= 4) return '#22c55e'
  if (bortle <= 5) return '#84cc16'
  if (bortle <= 6) return '#eab308'
  if (bortle <= 7) return '#f97316'
  return '#ef4444'
}

// Simplified SVG paths for Czech Republic regions — viewbox 0 0 500 280
const REGION_PATHS: { name: string; d: string; lx: number; ly: number }[] = [
  { name: 'Karlovarský',       d: 'M28,82 L48,60 75,52 88,68 82,95 65,108 42,105Z', lx: 58, ly: 82 },
  { name: 'Ústecký',           d: 'M75,52 L105,32 140,24 165,30 170,52 148,72 120,80 88,68Z', lx: 125, ly: 52 },
  { name: 'Liberecký',         d: 'M165,30 L195,18 230,22 248,38 240,60 215,68 190,62 170,52Z', lx: 208, ly: 42 },
  { name: 'Královéhradecký',   d: 'M248,38 L280,28 318,35 330,55 315,78 285,85 260,80 240,60Z', lx: 285, ly: 58 },
  { name: 'Pardubický',        d: 'M260,80 L285,85 315,78 340,95 338,120 310,128 275,118 255,100Z', lx: 298, ly: 102 },
  { name: 'Plzeňský',          d: 'M42,105 L65,108 82,95 120,80 148,72 155,98 148,130 120,155 85,168 55,158 30,138Z', lx: 95, ly: 125 },
  { name: 'Středočeský',       d: 'M148,72 L170,52 190,62 215,68 240,60 260,80 255,100 275,118 258,140 230,148 195,145 165,148 148,130 155,98Z', lx: 200, ly: 108 },
  { name: 'Vysočina',          d: 'M195,145 L230,148 258,140 275,155 285,178 268,198 235,205 205,195 180,178 165,148Z', lx: 225, ly: 175 },
  { name: 'Jihočeský',         d: 'M55,158 L85,168 120,155 148,130 165,148 180,178 175,210 152,238 115,248 72,240 45,215 38,185Z', lx: 112, ly: 200 },
  { name: 'Olomoucký',         d: 'M310,128 L338,120 365,108 392,115 400,138 388,162 360,168 335,160 315,148Z', lx: 355, ly: 140 },
  { name: 'Moravskoslezský',   d: 'M365,108 L392,85 425,72 460,78 472,100 462,128 435,145 400,138 392,115Z', lx: 430, ly: 108 },
  { name: 'Zlínský',           d: 'M360,168 L388,162 400,138 435,145 448,168 440,195 412,210 382,200 362,188Z', lx: 405, ly: 180 },
  { name: 'Jihomoravský',      d: 'M268,198 L285,178 315,148 335,160 360,168 362,188 382,200 378,228 348,248 310,252 278,238 258,218Z', lx: 320, ly: 212 },
]

export function CzRegionMap({ selectedRegion, onSelectRegion, selectedLocation, onSelectLocation }: Props) {
  const regionData = useMemo(() =>
    REGION_PATHS.map(r => {
      const locs = CZ_LOCATIONS.filter(l => l.region === r.name)
      const bestBortle = locs.length > 0 ? Math.min(...locs.map(l => l.bortle)) : 9
      return { ...r, locs, bestBortle }
    }),
    []
  )

  const selectedLocs = useMemo(
    () => selectedRegion ? CZ_LOCATIONS.filter(l => l.region === selectedRegion) : [],
    [selectedRegion]
  )

  const cities = useMemo(() => selectedLocs.filter(l => l.isCity), [selectedLocs])
  const nature = useMemo(() => selectedLocs.filter(l => !l.isCity), [selectedLocs])

  const handleRegionClick = (name: string) => {
    onSelectRegion(name)
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start">
      {/* SVG Map — compact */}
      <div className="w-full sm:w-52 shrink-0">
        <svg viewBox="15 10 470 255" className="w-full h-auto" style={{ maxHeight: 150 }}>
          <defs>
            <filter id="rglow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          {regionData.map(r => {
            const isSel = selectedRegion === r.name
            const fc = bortleColor(r.bestBortle)
            return (
              <g key={r.name} className="cursor-pointer" onClick={() => handleRegionClick(r.name)}>
                <path
                  d={r.d}
                  fill={isSel ? `${fc}22` : `${fc}08`}
                  stroke="transparent"
                  strokeWidth={0}
                  className="transition-all duration-300 hover:fill-[rgba(0,212,255,0.10)]"
                  filter={isSel ? 'url(#rglow)' : undefined}
                />
                {/* Subtle glow outline only on selected */}
                {isSel && (
                  <path
                    d={r.d}
                    fill="none"
                    stroke={fc}
                    strokeWidth={1.2}
                    strokeOpacity={0.35}
                    filter="url(#rglow)"
                  />
                )}
                <text
                  x={r.lx} y={r.ly}
                  textAnchor="middle" dominantBaseline="middle"
                  fill={isSel ? fc : 'rgba(255,255,255,0.25)'}
                  fontSize={isSel ? 8 : 6}
                  fontFamily="monospace"
                  fontWeight={isSel ? 700 : 400}
                  className="pointer-events-none select-none"
                >
                  {r.name.length > 10 ? r.name.slice(0, 7) + '…' : r.name}
                </text>
              </g>
            )
          })}
          {/* Outer country outline */}
          <path
            d="M28,82 L48,60 75,52 105,32 140,24 165,30 195,18 230,22 248,38 280,28 318,35 330,55 365,108 392,85 425,72 460,78 472,100 462,128 448,168 440,195 412,210 382,200 378,228 348,248 310,252 278,238 258,218 268,198 235,205 205,195 180,178 175,210 152,238 115,248 72,240 45,215 38,185 30,138 28,82Z"
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
        </svg>
        <div className="flex items-center justify-center gap-2 mt-1 text-[9px] font-mono text-slate-500">
          <span className="flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-sm bg-[#00ffaa]" />tmavá</span>
          <span className="flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-sm bg-[#eab308]" />střed</span>
          <span className="flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-sm bg-[#f97316]" />světlá</span>
        </div>
      </div>

      {/* Drill-down panel */}
      <div className="flex-1 min-w-0">
        {!selectedRegion ? (
          <div className="text-xs text-slate-400 italic py-4">← Vyberte kraj na mapce</div>
        ) : (
          <div>
            <div className="text-sm font-display font-bold text-slate-100 mb-2">
              {selectedRegion}
              <span className="ml-2 text-[10px] font-mono text-slate-400 font-normal">{selectedLocs.length} lokací</span>
            </div>

            {cities.length > 0 && (
              <div className="mb-2">
                <div className="text-[9px] font-mono text-slate-500 uppercase tracking-wider mb-1">🏙️ Obce</div>
                <div className="flex flex-wrap gap-1">
                  {cities.map(loc => (
                    <button
                      key={loc.name}
                      onClick={() => onSelectLocation(loc)}
                      className={clsx(
                        'px-2 py-0.5 rounded-md text-[10px] font-medium transition-all border',
                        selectedLocation.name === loc.name
                          ? 'bg-aurora-teal/10 border-aurora-teal/30 text-aurora-teal'
                          : 'border-white/[0.06] text-slate-300 hover:bg-white/5'
                      )}
                    >
                      {loc.name}
                      <span className="ml-1 text-[9px] opacity-40">B{loc.bortle}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {nature.length > 0 && (
              <div className="mb-2">
                <div className="text-[9px] font-mono text-slate-500 uppercase tracking-wider mb-1">🌲 Tmavá místa & pohoří</div>
                <div className="flex flex-wrap gap-1">
                  {nature.map(loc => (
                    <button
                      key={loc.name}
                      onClick={() => onSelectLocation(loc)}
                      className={clsx(
                        'px-2 py-0.5 rounded-md text-[10px] font-medium transition-all border',
                        selectedLocation.name === loc.name
                          ? 'bg-green-500/10 border-green-500/30 text-green-400'
                          : 'border-white/[0.06] text-slate-300 hover:bg-white/5'
                      )}
                    >
                      {loc.name}
                      <span className="ml-1 text-[9px] opacity-40">B{loc.bortle}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedLocation.region === selectedRegion && (
              <div className="mt-2 pt-2 border-t border-white/[0.06]">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs">{selectedLocation.isCity ? '🏙️' : '🌲'}</span>
                  <span className="text-xs font-bold text-slate-100">{selectedLocation.name}</span>
                  <div className="w-2 h-2 rounded-full ml-auto" style={{ backgroundColor: bortleColor(selectedLocation.bortle) }} />
                </div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px]">
                  <span className="text-slate-400">Bortle</span>
                  <span className="font-mono font-semibold" style={{ color: bortleColor(selectedLocation.bortle) }}>{selectedLocation.bortle}/9</span>
                  <span className="text-slate-400">Sv. znečištění</span>
                  <span className="text-slate-200">{selectedLocation.lightPollution}</span>
                  <span className="text-slate-400">Sever volný</span>
                  <span className="text-slate-200">{Math.round((1 - selectedLocation.northHorizonBlock) * 100)}%</span>
                  <span className="text-slate-400">Poloha</span>
                  <span className="text-slate-300 font-mono">{selectedLocation.lat.toFixed(2)}°N {selectedLocation.lon.toFixed(2)}°E</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
