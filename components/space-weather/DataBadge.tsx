'use client'
// components/space-weather/DataBadge.tsx

import clsx from 'clsx'

interface Props {
  label: string
  value: string
  variant?: 'default' | 'accent' | 'warning' | 'danger' | 'aurora' | 'aurora-purple' | 'aurora-strong'
}

const VARIANTS: Record<string, string> = {
  default: 'bg-slate-500/10 text-slate-300 border-slate-500/20',
  accent:  'bg-aurora-teal/10 text-aurora-teal border-aurora-teal/20',
  warning: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  danger:  'bg-red-500/10 text-red-400 border-red-500/20',
  aurora:  'bg-aurora-green/10 text-aurora-green border-aurora-green/20',
  'aurora-purple': 'bg-aurora-purple/10 text-aurora-purple border-aurora-purple/20',
  'aurora-strong': 'bg-aurora-pink/10 text-aurora-pink border-aurora-pink/20',
}

export function DataBadge({ label, value, variant = 'default' }: Props) {
  return (
    <span className={clsx('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono border', VARIANTS[variant])}>
      <span className="text-slate-500 text-[9px] uppercase tracking-wider">{label}</span>
      <span className="font-semibold">{value}</span>
    </span>
  )
}
