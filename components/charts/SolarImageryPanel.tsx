'use client'
// components/charts/SolarImageryPanel.tsx
// Grid panel with all solar imagery animation sources side by side

import { ImageSequencePlayer, SOLAR_SOURCES } from './ImageSequencePlayer'

export function SolarImageryPanel() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {SOLAR_SOURCES.map(source => (
        <div key={source.id} className="bg-[#04101e]/90 border border-white/[0.08] rounded-2xl p-3">
          <div className="text-[10px] font-mono tracking-[2px] text-aurora-purple/80 uppercase mb-2 flex items-center gap-1.5">
            {source.icon} {source.label}
          </div>
          <ImageSequencePlayer source={source} />
        </div>
      ))}
    </div>
  )
}
