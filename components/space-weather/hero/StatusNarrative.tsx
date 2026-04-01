'use client'
// components/space-weather/hero/StatusNarrative.tsx
import { memo } from 'react'
import type { HeroData } from '@/lib/space-weather/hero/types'

interface Props {
  hero: HeroData
}

export const StatusNarrative = memo(function StatusNarrative({ hero }: Props) {
  const { now, next, forCz } = hero.narrative
  const highlight = hero.auroraLikelihood !== 'none'

  return (
    <div className="space-y-2">
      <p className="text-base leading-relaxed text-slate-100">{now}</p>
      <p className="text-sm leading-relaxed text-slate-300">{next}</p>
      {highlight && (
        <p className="text-sm leading-relaxed text-aurora-green font-bold">{forCz}</p>
      )}
    </div>
  )
})
