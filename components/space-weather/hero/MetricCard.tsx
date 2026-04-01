'use client'
// components/space-weather/hero/MetricCard.tsx
import { memo } from 'react'

interface Props {
  label: string
  sublabel?: string
  value: string
  emphasis?: boolean
  unit?: string
}

export const MetricCard = memo(function MetricCard({ label, sublabel, value, emphasis, unit }: Props) {
  return (
    <div className="px-3 py-2 min-w-[76px]">
      <div className="text-[11px] font-mono tracking-wider text-slate-300 uppercase leading-tight">{label}</div>
      <div className={`font-mono text-lg font-bold leading-snug ${emphasis ? 'text-aurora-green' : 'text-slate-100'}`}>
        {value}
        {unit && <span className="text-[11px] text-slate-300 ml-0.5">{unit}</span>}
      </div>
    </div>
  )
})
