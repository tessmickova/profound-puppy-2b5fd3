'use client'
// components/space-weather/CMEList.tsx

import type { DonkiCME } from '@/lib/space-weather/nasa'
import { CMECard } from './CMECard'
import { EmptyState } from './EmptyState'

interface Props {
  cmes: DonkiCME[]
}

export function CMEList({ cmes }: Props) {
  if (cmes.length === 0) {
    return <EmptyState icon="🌊" message="Žádné CME události za posledních 14 dní" />
  }

  return (
    <div className="space-y-3">
      {cmes.map((cme, i) => (
        <CMECard key={cme.activityID} cme={cme} highlight={i === 0} />
      ))}
    </div>
  )
}
