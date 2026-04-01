'use client'
// components/ViewModeSwitch.tsx — Basic/Advanced toggle switch in the nav
import clsx from 'clsx'
import type { ViewMode } from '@/lib/hooks/useViewMode'

interface Props {
  mode: ViewMode
  onToggle: () => void
}

export function ViewModeSwitch({ mode, onToggle }: Props) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-0 rounded-lg border border-white/[0.08] bg-white/[0.03] p-0.5 transition-colors hover:border-white/[0.15]"
      title={mode === 'basic' ? 'Přepnout na pokročilý režim' : 'Přepnout na základní režim'}
    >
      <span
        className={clsx(
          'px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wide transition-all duration-300',
          mode === 'basic'
            ? 'bg-aurora-teal/15 text-aurora-teal border border-aurora-teal/30'
            : 'text-slate-400 border border-transparent'
        )}
      >
        Základní
      </span>
      <span
        className={clsx(
          'px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wide transition-all duration-300',
          mode === 'advanced'
            ? 'bg-aurora-pink/15 text-aurora-pink border border-aurora-pink/30'
            : 'text-slate-400 border border-transparent'
        )}
      >
        Pokročilé
      </span>
    </button>
  )
}
