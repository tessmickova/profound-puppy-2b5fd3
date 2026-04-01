'use client'
// components/charts/HuxtChart.tsx
// ENLIL timeline — time-series graph of predicted solar wind parameters at Earth's position

const ENLIL_TIMELINE_URL = 'https://services.swpc.noaa.gov/images/animations/enlil/latest-timeline.jpg'

export function HuxtChart() {
  return (
    <div className="bg-[#04101e]/90 border border-white/[0.08] rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs font-mono tracking-[2px] text-aurora-teal/80 uppercase flex items-center gap-2">
          📈 ENLIL graf — dopad na Zemi
        </div>
      </div>

      <div className="relative w-full aspect-[2/1] max-h-[240px] bg-[#030810] rounded-xl overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={ENLIL_TIMELINE_URL}
          alt="Graf předpovědi rychlosti a hustoty slunečního větru na pozici Země v čase"
          className="w-full h-full object-contain"
        />
      </div>

      <p className="text-[10px] font-mono text-slate-400 mt-2">
        Graf ukazuje předpovězený <span className="text-aurora-teal">dopad na Zemi</span> — hustota a rychlost v čase.
        Vysoké špičky = příchod materiálu z CME.
      </p>
    </div>
  )
}
