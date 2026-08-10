'use client'
// components/SolarTab.tsx
import type { SolarFlare, CmeEvent } from '@/lib/noaa'
import type { DonkiData } from '@/lib/space-weather/nasa'
import { NasaDonkiSection } from '@/components/space-weather/NasaDonkiSection'
import clsx from 'clsx'

interface Props {
  flares: SolarFlare[]
  cme: CmeEvent[]
  donki: DonkiData | null
}

const FLARE_COLORS: Record<string, string> = {
  X: 'text-red-400 bg-red-500/10 border-red-500/20',
  M: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
  C: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  B: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
  A: 'text-slate-400 bg-slate-500/10 border-slate-500/20',
}

function getFlareColor(classType: string) {
  const letter = classType.charAt(0).toUpperCase()
  return FLARE_COLORS[letter] ?? FLARE_COLORS.A
}

export function SolarTab({ flares, cme, donki }: Props) {
  return (
    <div className="mt-8 space-y-6">
      {/* NASA DONKI Section */}
      <NasaDonkiSection donki={donki} />

      {/* NOAA Solar Flares */}
      <div>
        <div className="text-[10px] font-mono tracking-[3px] text-aurora-purple/60 uppercase mb-3 flex items-center gap-3">
          ⚡ Sluneční erupce — NOAA (7 dní) <span className="flex-1 h-px bg-white/5" />
          <span className="text-slate-600">{flares.length} událostí</span>
        </div>

        {flares.length === 0 ? (
          <div className="bg-[#04101e]/90 border border-white/8 rounded-2xl p-6 text-center text-slate-500 text-sm">
            Žádné sluneční erupce za posledních 7 dní
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {flares.slice(0, 12).map(flare => (
              <div
                key={flare.flrID}
                className="bg-[#04101e]/90 border border-white/8 rounded-xl p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={clsx('px-2 py-0.5 rounded-lg text-xs font-display font-bold border', getFlareColor(flare.classType))}>
                    {flare.classType}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    {new Date(flare.beginTime).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
                <div className="text-xs text-slate-400 space-y-1">
                  <div>
                    <span className="text-slate-600">Začátek: </span>
                    {new Date(flare.beginTime).toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })} UTC
                  </div>
                  {flare.peakTime && (
                    <div>
                      <span className="text-slate-600">Peak: </span>
                      {new Date(flare.peakTime).toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })} UTC
                    </div>
                  )}
                  {flare.sourceLocation && (
                    <div>
                      <span className="text-slate-600">Pozice: </span>{flare.sourceLocation}
                    </div>
                  )}
                  {flare.activeRegionNum && (
                    <div>
                      <span className="text-slate-600">Region: </span>AR{flare.activeRegionNum}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CME Events */}
      <div>
        <div className="text-[10px] font-mono tracking-[3px] text-aurora-purple/60 uppercase mb-3 flex items-center gap-3">
          🌊 CME události — NOAA (7 dní) <span className="flex-1 h-px bg-white/5" />
          <span className="text-slate-600">{cme.length} událostí</span>
        </div>

        {cme.length === 0 ? (
          <div className="bg-[#04101e]/90 border border-white/8 rounded-2xl p-6 text-center text-slate-500 text-sm">
            Žádné CME události za posledních 7 dní
          </div>
        ) : (
          <div className="space-y-3">
            {cme.map(event => (
              <div
                key={event.activityID}
                className="bg-[#04101e]/90 border border-white/8 rounded-xl p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{event.earthImpact ? '🌍' : '🌊'}</span>
                    <span className="font-display text-xs font-bold text-slate-200">
                      {event.activityID.split('-').slice(0, 3).join('-')}
                    </span>
                    {event.earthImpact && (
                      <span className="px-2 py-0.5 rounded-lg text-[9px] font-bold bg-aurora-green/10 text-aurora-green border border-aurora-green/20">
                        EARTH-DIRECTED
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">
                    {new Date(event.startTime).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="text-xs text-slate-400 space-y-1">
                  {event.speed != null && (
                    <div>
                      <span className="text-slate-600">Rychlost: </span>
                      <span className={event.speed > 1000 ? 'text-aurora-pink font-semibold' : ''}>{event.speed} km/s</span>
                    </div>
                  )}
                  {event.note && (
                    <div className="text-slate-500 text-[11px] mt-1 line-clamp-2">{event.note}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
