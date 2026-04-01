'use client'
// components/WidgetMenu.tsx — Dropdown to add/remove dashboard widgets + width control
import { useState, useRef, useEffect } from 'react'
import { ALL_WIDGETS, type WidgetId, type WidgetWidth } from '@/lib/hooks/useDashboardWidgets'
import clsx from 'clsx'

interface Props {
  activeWidgets: WidgetId[]
  onToggle: (id: WidgetId) => void
  onToggleWidth: (id: WidgetId) => void
  getWidth: (id: WidgetId) => WidgetWidth
}

export function WidgetMenu({ activeWidgets, onToggle, onToggleWidth, getWidth }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold border border-white/[0.08] text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all"
        title="Upravit widgety na dashboardu"
      >
        ⚙️ Widgety
        <span className={clsx('text-[9px] transition-transform', open && 'rotate-180')}>▼</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-72 bg-[#0a1929] border border-white/10 rounded-xl shadow-2xl z-50 py-2 max-h-[400px] overflow-y-auto">
          <div className="px-3 py-1.5 text-[10px] font-mono text-slate-500 uppercase tracking-wider border-b border-white/[0.06]">
            Zobrazené prvky
          </div>
          {ALL_WIDGETS.map(w => {
            const active = activeWidgets.includes(w.id)
            const width = getWidth(w.id)
            return (
              <div
                key={w.id}
                className={clsx(
                  'flex items-center gap-2 px-3 py-2 transition-colors',
                  w.alwaysVisible
                    ? 'opacity-40'
                    : 'hover:bg-white/[0.04]',
                )}
              >
                {/* Checkbox na zobrazení */}
                <button
                  onClick={() => { if (!w.alwaysVisible) onToggle(w.id) }}
                  disabled={w.alwaysVisible}
                  className={clsx('cursor-pointer', w.alwaysVisible && 'cursor-not-allowed')}
                >
                  <div
                    className={clsx(
                      'w-4 h-4 rounded border-2 flex items-center justify-center transition-all',
                      active
                        ? 'border-aurora-teal bg-aurora-teal/20'
                        : 'border-slate-600 bg-transparent'
                    )}
                  >
                    {active && <span className="text-[9px] text-aurora-teal font-bold">✓</span>}
                  </div>
                </button>

                <span className="text-sm">{w.icon}</span>
                <span className="flex-1 text-xs text-slate-200 truncate">{w.label}</span>

                {/* Přepínat šířku: 50% / 100% */}
                {active && !w.alwaysFull && (
                  <button
                    onClick={() => onToggleWidth(w.id)}
                    className={clsx(
                      'px-1.5 py-0.5 rounded text-[9px] font-mono border transition-all',
                      width === 'full'
                        ? 'border-aurora-teal/30 text-aurora-teal bg-aurora-teal/10'
                        : 'border-purple-400/30 text-purple-400 bg-purple-400/10'
                    )}
                    title={width === 'full' ? 'Přepnout na 50 % šířky' : 'Přepnout na 100 % šířky'}
                  >
                    {width === 'full' ? '100%' : '50%'}
                  </button>
                )}
                {active && w.alwaysFull && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono border border-white/[0.06] text-slate-600">
                    100%
                  </span>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
