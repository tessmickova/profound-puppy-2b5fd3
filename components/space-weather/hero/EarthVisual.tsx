'use client'
// components/space-weather/hero/EarthVisual.tsx
import { memo } from 'react'

interface Props {
  intensity: number
  auroraActive: boolean
  magnetosphereActive: boolean
}

export const EarthVisual = memo(function EarthVisual({ intensity, auroraActive, magnetosphereActive }: Props) {
  const auroraOpacity = auroraActive ? 0.4 + intensity * 0.5 : 0
  const atmosphereGlow = 0.15 + intensity * 0.25
  const magShellOpacity = magnetosphereActive ? 0.08 + intensity * 0.15 : 0.03

  return (
    <div
      className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-[45%] pointer-events-none select-none w-[38vh] h-[38vh] min-w-[180px] min-h-[180px] max-w-[420px] max-h-[420px] md:w-[48vh] md:h-[48vh] md:min-w-[280px] md:min-h-[280px] md:max-w-[520px] md:max-h-[520px]"
      role="img"
      aria-label="Země s aurorálním oválem"
    >
      {/* Magnetosphere shell */}
      <div
        className="absolute -inset-[15%] rounded-full transition-opacity duration-[2000ms]"
        style={{
          background: `radial-gradient(ellipse 60% 75% at 45% 50%, rgba(80,160,255,${magShellOpacity}) 0%, rgba(60,120,255,${magShellOpacity * 0.5}) 50%, transparent 100%)`,
        }}
      />

      {/* Magnetosphere boundary — visible edge that deforms on CME impact */}
      <svg
        viewBox="0 0 200 200"
        className="absolute -inset-[18%] w-[136%] h-[136%] pointer-events-none"
        style={{ opacity: 0.12 + (magnetosphereActive ? intensity * 0.35 : 0) }}
      >
        <defs>
          <radialGradient id="magBoundary" cx="45%" cy="50%">
            <stop offset="70%" stopColor="transparent" />
            <stop offset="88%" stopColor={magnetosphereActive ? 'rgba(100,180,255,0.6)' : 'rgba(100,180,255,0.2)'} />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
        {/* Asymmetric magnetosphere shape — compressed on sun-side (left), stretched on tail-side (right) */}
        <ellipse
          cx={magnetosphereActive ? '105' : '100'}
          cy="100"
          rx={magnetosphereActive ? '82' : '90'}
          ry="95"
          fill="none"
          stroke={magnetosphereActive ? 'rgba(100,160,255,0.45)' : 'rgba(100,160,255,0.15)'}
          strokeWidth={magnetosphereActive ? '1.5' : '0.8'}
          strokeDasharray={magnetosphereActive ? '3 2' : '5 4'}
          className="transition-all duration-[3000ms]"
        />
        {/* Impact glow on sun-facing side */}
        {magnetosphereActive && (
          <ellipse
            cx="18" cy="100" rx="8" ry="40"
            fill={`rgba(100,200,255,${0.1 + intensity * 0.2})`}
            className="animate-pulse"
          />
        )}
      </svg>

      {/* Auroral oval */}
      {auroraActive && (
        <div
          className="absolute -inset-[5%] rounded-full"
          style={{
            background: `conic-gradient(from 180deg at 50% 22%, rgba(0,255,170,${auroraOpacity}) 0deg, rgba(0,255,120,${auroraOpacity * 0.8}) 30deg, rgba(100,0,200,${auroraOpacity * 0.6}) 60deg, rgba(168,85,247,${auroraOpacity * 0.4}) 90deg, transparent 130deg, transparent 230deg, rgba(0,200,120,${auroraOpacity * 0.5}) 270deg, rgba(0,255,170,${auroraOpacity * 0.7}) 320deg, rgba(0,255,170,${auroraOpacity}) 360deg)`,
            filter: 'blur(4px)',
            animation: 'aurora-pulse 4s ease-in-out infinite',
          }}
        />
      )}

      {/* Earth SVG */}
      <svg
        viewBox="0 0 200 200"
        className="relative w-full h-full drop-shadow-[0_0_20px_rgba(50,130,220,0.25)]"
        style={{ animation: 'earth-spin 90s linear infinite' }}
      >
        <defs>
          <radialGradient id="eg" cx="38%" cy="35%">
            <stop offset="0%" stopColor="#6bb5e8" />
            <stop offset="35%" stopColor="#2d8cc7" />
            <stop offset="70%" stopColor="#1a5f9c" />
            <stop offset="100%" stopColor="#0a2d54" />
          </radialGradient>
          <radialGradient id="atmo" cx="38%" cy="35%">
            <stop offset="80%" stopColor="transparent" />
            <stop offset="92%" stopColor={`rgba(100,180,255,${atmosphereGlow})`} />
            <stop offset="100%" stopColor={`rgba(60,140,255,${atmosphereGlow * 0.3})`} />
          </radialGradient>
          <clipPath id="ec">
            <circle cx="100" cy="100" r="72" />
          </clipPath>
          <radialGradient id="nightShadow" cx="75%" cy="50%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="50%" stopColor="rgba(0,0,20,0.2)" />
            <stop offset="100%" stopColor="rgba(0,0,20,0.6)" />
          </radialGradient>
        </defs>

        <circle cx="100" cy="100" r="72" fill="url(#eg)" />

        <g clipPath="url(#ec)" opacity="0.75">
          <path d="M102 52 L108 48 L115 50 L120 56 L118 64 L114 60 L108 62 L100 70 L96 66 L92 58 L96 54 Z" fill="#3a8847" />
          <path d="M106 38 L110 34 L114 42 L110 48 L106 44 Z" fill="#4a9e56" />
          <path d="M88 50 L92 47 L94 52 L90 54 Z" fill="#3a8847" />
          <path d="M86 62 L94 58 L98 64 L92 70 L86 68 Z" fill="#4a9e56" />
          <path d="M98 72 L106 68 L114 72 L118 82 L116 100 L108 110 L100 106 L94 96 L90 84 Z" fill="#5aad6a" />
          <path d="M120 64 L128 60 L134 68 L130 76 L122 74 L118 68 Z" fill="#5aad6a" />
          <path d="M60 30 L72 26 L78 32 L76 40 L66 42 L60 36 Z" fill="#e8e8e8" />
          <ellipse cx="100" cy="32" rx="30" ry="6" fill="rgba(255,255,255,0.35)" />
          <ellipse cx="100" cy="168" rx="35" ry="5" fill="rgba(255,255,255,0.25)" />
          <circle cx="108" cy="56" r="2.5" fill="#00ffaa" opacity="0.9">
            <animate attributeName="opacity" values="0.9;0.5;0.9" dur="3s" repeatCount="indefinite" />
          </circle>
        </g>

        <g clipPath="url(#ec)" opacity="0.15">
          <ellipse cx="80" cy="60" rx="25" ry="4" fill="white" transform="rotate(-10 80 60)" />
          <ellipse cx="120" cy="90" rx="20" ry="3" fill="white" transform="rotate(15 120 90)" />
          <ellipse cx="95" cy="120" rx="18" ry="3" fill="white" transform="rotate(-5 95 120)" />
        </g>

        <circle cx="100" cy="100" r="72" fill="url(#nightShadow)" />
        <circle cx="100" cy="100" r="72" fill="url(#atmo)" />
        <circle cx="100" cy="100" r="72" fill="none" stroke="rgba(100,200,255,0.15)" strokeWidth="1" />
        <circle cx="82" cy="78" r="15" fill="rgba(255,255,255,0.06)" />
      </svg>
    </div>
  )
})
