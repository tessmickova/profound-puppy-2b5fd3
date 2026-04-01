'use client'
// components/space-weather/hero/SpaceWeatherHero.tsx

import { useMemo } from 'react'
import type { AggregatedData } from '@/lib/noaa'
import { deriveSpaceWeatherState } from '@/lib/space-weather/hero/deriveSpaceWeatherState'
import { SunVisual } from './SunVisual'
import { EarthVisual } from './EarthVisual'
import { CmeParticles } from './CmeParticles'
import { TransitPath } from './TransitPath'
import { StageBadge } from './StageBadge'
import { MoonVisual } from './MoonVisual'
import { HeroSkeleton } from './HeroSkeleton'

interface Props {
  data: AggregatedData | null | undefined
  isLoading: boolean
}

export function SpaceWeatherHero({ data, isLoading }: Props) {
  const hero = useMemo(() => deriveSpaceWeatherState(data), [data])

  if (isLoading && !data) {
    return <HeroSkeleton />
  }

  return (
    <section
      className="relative w-full h-[50vh] min-h-[380px] max-h-[620px] overflow-hidden bg-[#030810]"
      aria-label="Vizualizace cesty CME od Slunce k Zemi"
    >
      {/* Deep space background with subtle stars */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 120% 80% at 25% 50%, rgba(255,180,50,0.03) 0%, transparent 50%),
            radial-gradient(ellipse 80% 60% at 80% 50%, rgba(50,100,200,0.03) 0%, transparent 50%),
            radial-gradient(1px 1px at 10% 20%, rgba(255,255,255,0.15) 50%, transparent 50%),
            radial-gradient(1px 1px at 30% 70%, rgba(255,255,255,0.1) 50%, transparent 50%),
            radial-gradient(1px 1px at 50% 15%, rgba(255,255,255,0.12) 50%, transparent 50%),
            radial-gradient(1px 1px at 70% 45%, rgba(255,255,255,0.08) 50%, transparent 50%),
            radial-gradient(1px 1px at 85% 80%, rgba(255,255,255,0.1) 50%, transparent 50%),
            radial-gradient(1px 1px at 45% 90%, rgba(255,255,255,0.07) 50%, transparent 50%)`,
        }}
      />

      {/* Sun — left side */}
      <SunVisual
        intensity={hero.intensity}
        hasRecentEvent={hero.activeStages.includes('sun')}
      />

      {/* Earth — right side */}
      <EarthVisual
        intensity={hero.intensity}
        auroraActive={hero.auroraLikelihood !== 'none' && hero.auroraLikelihood !== 'unlikely'}
        magnetosphereActive={hero.activeStages.includes('magnetosphere')}
      />

      {/* CME particles in transit */}
      <CmeParticles
        state={hero.state}
        intensity={hero.intensity}
        transitProgress={hero.transitProgress}
      />

      {/* Transit path — MAIN visual, unobscured */}
      <TransitPath
        activeStages={hero.activeStages}
        state={hero.state}
        intensity={hero.intensity}
        transitProgress={hero.transitProgress}
        auroraLikelihood={hero.auroraLikelihood}
      />

      {/* Moon — near Earth */}
      <MoonVisual />

      {/* Subtle bottom fade — thin, doesn't cover transit path */}
      <div className="absolute bottom-0 left-0 right-0 h-8 z-10
                      bg-gradient-to-t from-[#030810] to-transparent pointer-events-none" />
    </section>
  )
}
