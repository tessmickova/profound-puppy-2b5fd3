'use client'
// components/space-weather/hero/MoonVisual.tsx
// Small moon graphic showing current phase in the hero scene
import { memo, useMemo } from 'react'
import { getMoonInfo } from '@/lib/astronomy'

export const MoonVisual = memo(function MoonVisual() {
  const moon = useMemo(() => getMoonInfo(), [])

  // Moon phase shadow: we simulate the terminator with a clipping ellipse
  // age 0 = new (all shadow), age ~14.7 = full (no shadow)
  // illumination 0..1
  const ill = moon.illumination
  const age = moon.age
  const isWaxing = age < 14.77

  // Shadow ellipse horizontal offset: -1 (new) → +1 (full)
  // For waxing: shadow moves from left to right (shadow covers right side, then shrinks)
  // For waning: shadow covers left side
  const shadowCx = isWaxing ? 50 + (1 - ill) * 50 : 50 - (1 - ill) * 50
  const shadowRx = (1 - ill) * 55

  return (
    <div
      className="absolute z-20 pointer-events-none select-none"
      style={{ top: '15%', right: '18%' }}
      aria-label={`Měsíc: ${moon.phase}, ${Math.round(ill * 100)}% osvětlení`}
    >
      <svg viewBox="0 0 100 100" width="42" height="42" className="drop-shadow-[0_0_8px_rgba(200,200,180,0.3)]">
        <defs>
          <radialGradient id="moonSurf" cx="40%" cy="35%">
            <stop offset="0%" stopColor="#f0ead6" />
            <stop offset="50%" stopColor="#d4cbb0" />
            <stop offset="100%" stopColor="#a89e85" />
          </radialGradient>
          <clipPath id="moonClip">
            <circle cx="50" cy="50" r="40" />
          </clipPath>
        </defs>

        {/* Moon surface */}
        <circle cx="50" cy="50" r="40" fill="url(#moonSurf)" />

        {/* Subtle craters */}
        <g clipPath="url(#moonClip)" opacity="0.12">
          <circle cx="38" cy="42" r="8" fill="#8a7f6a" />
          <circle cx="62" cy="55" r="6" fill="#8a7f6a" />
          <circle cx="45" cy="65" r="5" fill="#8a7f6a" />
          <circle cx="58" cy="38" r="4" fill="#8a7f6a" />
        </g>

        {/* Shadow overlay for phase */}
        {ill < 0.98 && (
          <ellipse
            cx={shadowCx}
            cy="50"
            rx={shadowRx}
            ry="42"
            fill="rgba(3,8,16,0.92)"
            clipPath="url(#moonClip)"
          />
        )}

        {/* Subtle glow ring for bright moon */}
        {ill > 0.4 && (
          <circle
            cx="50" cy="50" r="42"
            fill="none"
            stroke={`rgba(240,234,214,${ill * 0.15})`}
            strokeWidth="2"
          />
        )}
      </svg>

      {/* Phase label */}
      <div className="text-[9px] font-mono text-slate-500 text-center mt-0.5 whitespace-nowrap">
        {moon.icon} {Math.round(ill * 100)}%
      </div>
    </div>
  )
})
