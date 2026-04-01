'use client'
// components/space-weather/hero/CmeParticles.tsx
import { memo } from 'react'
import type { SpaceWeatherState } from '@/lib/space-weather/hero/types'

interface Props {
  state: SpaceWeatherState
  intensity: number
  transitProgress: number
}

export const CmeParticles = memo(function CmeParticles({ state, intensity, transitProgress }: Props) {
  const isActive = state === 'IN_TRANSIT' || state === 'EARTH_DIRECTED_CME' ||
                   state === 'L1_IMPACT_IMMINENT' || state === 'MAGNETOSPHERE_ACTIVE'

  if (!isActive) return null

  const cloudLeft = 20 + transitProgress * 45
  const particleOpacity = 0.3 + intensity * 0.5
  const coreSize = 12 + intensity * 18

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {/* Main CME cloud */}
      <div
        className="absolute top-1/2"
        style={{
          left: `${cloudLeft}%`,
          width: `${coreSize * 3}px`,
          height: `${coreSize * 2.5}px`,
          transform: 'translate(-50%, -50%)',
          animation: 'cme-drift 8s ease-in-out infinite',
        }}
      >
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(ellipse at 40% 50%, rgba(255,200,60,${particleOpacity}) 0%, rgba(255,150,30,${particleOpacity * 0.6}) 30%, rgba(255,100,0,${particleOpacity * 0.3}) 60%, transparent 100%)`,
            filter: 'blur(2px)',
            animation: 'cme-pulse 2s ease-in-out infinite',
          }}
        />
        <div
          className="absolute top-[20%] bottom-[20%] rounded-full"
          style={{
            right: '50%',
            width: `${coreSize * 4}px`,
            background: `linear-gradient(90deg, transparent 0%, rgba(255,180,50,${particleOpacity * 0.15}) 40%, rgba(255,150,30,${particleOpacity * 0.3}) 100%)`,
            filter: 'blur(4px)',
          }}
        />
      </div>

      {/* Scattered particles */}
      {[
        { dx: -3, dy: -15, size: 4, delay: '0s' },
        { dx: 5,  dy: 12,  size: 3, delay: '0.5s' },
        { dx: -8, dy: 8,   size: 5, delay: '1s' },
        { dx: 10, dy: -10, size: 3, delay: '1.5s' },
        { dx: -2, dy: 20,  size: 4, delay: '0.3s' },
      ].map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `calc(${cloudLeft}% + ${p.dx}px)`,
            top: `calc(50% + ${p.dy}px)`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: `radial-gradient(circle, rgba(255,200,80,${particleOpacity * 0.6}) 0%, transparent 100%)`,
            animation: 'cme-twinkle 3s ease-in-out infinite',
            animationDelay: p.delay,
          }}
        />
      ))}

      {/* Shockwave during impact */}
      {(state === 'L1_IMPACT_IMMINENT' || state === 'MAGNETOSPHERE_ACTIVE') && (
        <div
          className="absolute top-1/2 -translate-y-1/2"
          style={{
            left: `${cloudLeft + 2}%`,
            width: '20px',
            height: '30px',
            borderRight: `2px solid rgba(255,200,60,${particleOpacity * 0.4})`,
            borderRadius: '0 50% 50% 0',
            filter: 'blur(1px)',
            animation: 'cme-shock-pulse 1.5s ease-in-out infinite',
          }}
        />
      )}
    </div>
  )
})
