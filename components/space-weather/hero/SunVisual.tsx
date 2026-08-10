'use client'
// components/space-weather/hero/SunVisual.tsx
import { memo } from 'react'

interface Props {
  intensity: number
  hasRecentEvent: boolean
}

export const SunVisual = memo(function SunVisual({ intensity, hasRecentEvent }: Props) {
  const coronaOpacity = 0.35 + intensity * 0.55
  const coronaScale   = 1.15 + intensity * 0.2
  const eruptionGlow  = hasRecentEvent ? 0.5 + intensity * 0.5 : 0
  const coreTemp      = Math.round(255 - intensity * 30)

  const coronaDur = hasRecentEvent ? '3s' : '6s'
  const innerDur  = hasRecentEvent ? '2.5s' : '5s'

  return (
    <div
      className="absolute left-0 top-1/2 -translate-y-1/2 translate-x-[-55%] pointer-events-none select-none w-[55vh] h-[55vh] min-w-[260px] min-h-[260px] max-w-[600px] max-h-[600px] md:w-[70vh] md:h-[70vh] md:min-w-[400px] md:min-h-[400px] md:max-w-[800px] md:max-h-[800px]"
      role="img"
      aria-label="Slunce"
    >
      {/* Outer corona haze */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle at 60% 50%, rgba(255,200,60,${coronaOpacity * 0.2}) 35%, rgba(255,160,30,${coronaOpacity * 0.12}) 50%, rgba(255,100,0,${coronaOpacity * 0.05}) 65%, transparent 80%)`,
          transform: `scale(${coronaScale})`,
          animation: `sun-pulse-outer ${coronaDur} ease-in-out infinite`,
        }}
      />

      {/* Inner corona */}
      <div
        className="absolute inset-[5%] rounded-full"
        style={{
          background: `radial-gradient(circle at 55% 48%, rgba(255,220,100,${coronaOpacity * 0.5}) 20%, rgba(255,180,50,${coronaOpacity * 0.35}) 40%, rgba(255,140,20,${coronaOpacity * 0.15}) 60%, transparent 78%)`,
          animation: `sun-pulse-inner ${innerDur} ease-in-out infinite`,
        }}
      />

      {/* Photosphere */}
      <div
        className="absolute inset-[15%] rounded-full"
        style={{
          background: `radial-gradient(circle at 48% 45%, rgb(${coreTemp},${coreTemp - 20},200) 0%, rgb(255,210,80) 15%, rgb(255,190,50) 35%, rgb(255,160,30) 55%, rgb(240,120,10) 75%, rgb(200,80,0) 100%)`,
        }}
      />

      {/* Granulation (desktop only) */}
      <div
        className="absolute inset-[16%] rounded-full hidden md:block"
        style={{
          background: 'radial-gradient(circle 8px at 40% 30%, rgba(255,255,200,0.25) 0%, transparent 100%), radial-gradient(circle 6px at 55% 55%, rgba(255,255,180,0.2) 0%, transparent 100%), radial-gradient(circle 10px at 65% 35%, rgba(255,255,200,0.15) 0%, transparent 100%), radial-gradient(circle 7px at 35% 60%, rgba(255,255,190,0.2) 0%, transparent 100%), radial-gradient(circle 5px at 50% 45%, rgba(255,240,160,0.3) 0%, transparent 100%)',
          mixBlendMode: 'overlay',
          animation: 'sun-granulate 12s ease-in-out infinite',
        }}
      />

      {/* Limb darkening */}
      <div
        className="absolute inset-[15%] rounded-full"
        style={{
          background: 'radial-gradient(circle at 48% 45%, transparent 40%, rgba(180,80,0,0.3) 75%, rgba(120,40,0,0.5) 100%)',
        }}
      />

      {/* Eruption glow */}
      {eruptionGlow > 0 && (
        <div
          className="absolute inset-[8%] rounded-full"
          style={{
            background: `radial-gradient(ellipse 30% 60% at 72% 30%, rgba(255,100,0,${eruptionGlow * 0.6}) 0%, rgba(255,60,0,${eruptionGlow * 0.3}) 50%, transparent 100%), radial-gradient(ellipse 20% 40% at 68% 65%, rgba(255,180,50,${eruptionGlow * 0.4}) 0%, transparent 100%)`,
            animation: 'sun-erupt 2s ease-in-out infinite',
          }}
        />
      )}

      {/* Specular highlight */}
      <div
        className="absolute inset-[18%] rounded-full"
        style={{
          background: 'radial-gradient(circle at 42% 38%, rgba(255,255,240,0.35) 0%, transparent 30%)',
        }}
      />
    </div>
  )
})
