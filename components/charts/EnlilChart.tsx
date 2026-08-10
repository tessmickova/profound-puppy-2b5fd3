'use client'
// components/charts/EnlilChart.tsx
// WSA-ENLIL Solar Wind Prediction — animated model from NOAA SWPC

import { useState } from 'react'

// NOAA SWPC publishes animated GIFs of the ENLIL model
const ENLIL_DENSITY_GIF = 'https://services.swpc.noaa.gov/images/animations/enlil/latest.gif'
const ENLIL_VELOCITY_GIF = 'https://services.swpc.noaa.gov/images/animations/enlil/latest-velocity.gif'

type View = 'density' | 'velocity'

export function EnlilChart() {
  const [view, setView] = useState<View>('density')

  return (
    <div className="bg-[#04101e]/90 border border-white/8 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs font-mono tracking-[2px] text-aurora-purple/80 uppercase flex items-center gap-2">
          🌀 WSA-ENLIL animace
        </div>
        <div className="flex gap-1">
          <TabBtn active={view === 'density'} onClick={() => setView('density')}>Hustota</TabBtn>
          <TabBtn active={view === 'velocity'} onClick={() => setView('velocity')}>Rychlost</TabBtn>
        </div>
      </div>

      <div className="relative w-full aspect-square max-h-[320px] bg-[#030810] rounded-xl overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={view}
          src={view === 'density' ? ENLIL_DENSITY_GIF : ENLIL_VELOCITY_GIF}
          alt={view === 'density'
            ? 'WSA-ENLIL animace šíření hustoty slunečního větru'
            : 'WSA-ENLIL animace šíření rychlosti slunečního větru'}
          className="w-full h-full object-contain"
        />
      </div>

      <p className="text-[10px] font-mono text-slate-400 mt-2">
        Zdroj: <a href="https://www.swpc.noaa.gov/products/wsa-enlil-solar-wind-prediction" target="_blank" rel="noopener noreferrer" className="text-aurora-teal hover:underline">NOAA SWPC</a> — animace modelu šíření slunečního větru a CME meziplanetárním prostorem
      </p>
    </div>
  )
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-semibold transition-all ${
        active
          ? 'bg-aurora-purple/15 text-aurora-purple border border-aurora-purple/30'
          : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
      }`}
    >
      {children}
    </button>
  )
}
