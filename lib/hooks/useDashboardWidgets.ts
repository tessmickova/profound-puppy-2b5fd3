'use client'
// lib/hooks/useDashboardWidgets.ts — Configurable dashboard widget management with width control
import { useState, useCallback, useEffect } from 'react'

export type WidgetId =
  | 'hero'
  | 'statusPanel'
  | 'dualAnalysis'
  | 'cmeImpacts'
  | 'forecast'
  | 'cloudRadar'
  | 'auroralMap'
  | 'observing'
  | 'sightings'
  | 'newsFeed'
  | 'charts'
  | 'enlil'
  | 'substorms'

export type WidgetWidth = 'full' | 'half'

export interface WidgetDef {
  id: WidgetId
  label: string
  icon: string
  basicDefault: boolean   // visible in basic mode by default
  advancedDefault: boolean // visible in advanced mode by default
  alwaysVisible?: boolean  // can't be removed (hero, statusPanel)
  alwaysFull?: boolean     // always 100% width (hero, statusPanel, charts)
  defaultWidth: WidgetWidth
}

export const ALL_WIDGETS: WidgetDef[] = [
  { id: 'hero',          label: 'Hero vizualizace',     icon: '🌌', basicDefault: true,  advancedDefault: true, alwaysVisible: true, alwaysFull: true, defaultWidth: 'full' },
  { id: 'statusPanel',   label: 'Stavový panel',        icon: '📊', basicDefault: true,  advancedDefault: true, alwaysVisible: true, alwaysFull: true, defaultWidth: 'full' },
  { id: 'dualAnalysis',  label: 'Aurora stav',          icon: '🎯', basicDefault: true,  advancedDefault: true, defaultWidth: 'full' },
  { id: 'cmeImpacts',    label: 'CME směřující k Zemi', icon: '🌊', basicDefault: false, advancedDefault: true, defaultWidth: 'half' },
  { id: 'forecast',      label: 'Předpověď 3 noci',     icon: '🔮', basicDefault: true,  advancedDefault: true, defaultWidth: 'full' },
  { id: 'cloudRadar',    label: 'Radar oblačnosti',     icon: '☁️', basicDefault: false, advancedDefault: false, defaultWidth: 'half' },
  { id: 'auroralMap',    label: 'Mapa ČR + aurorální ovál', icon: '🗺️', basicDefault: false, advancedDefault: false, defaultWidth: 'half' },
  { id: 'observing',     label: 'Podmínky pozorování',  icon: '🔭', basicDefault: true,  advancedDefault: true, defaultWidth: 'full' },
  { id: 'sightings',     label: 'Hlášení komunity',     icon: '👁️', basicDefault: true,  advancedDefault: true, defaultWidth: 'half' },
  { id: 'newsFeed',      label: 'Zprávy expertů',       icon: '📰', basicDefault: true,  advancedDefault: true, defaultWidth: 'half' },
  { id: 'charts',        label: 'Živé grafy',           icon: '📈', basicDefault: false, advancedDefault: true, alwaysFull: true, defaultWidth: 'full' },
  { id: 'enlil',         label: 'Solární snímky',        icon: '🌀', basicDefault: false, advancedDefault: true, defaultWidth: 'full' },
  { id: 'substorms',     label: 'Substormy & magnetometry', icon: '⚡', basicDefault: false, advancedDefault: true, defaultWidth: 'full' },
]

const STORAGE_KEY = 'auroradog_widgets'
const WIDTHS_STORAGE_KEY = 'auroradog_widget_widths'

export function useDashboardWidgets(isAdvanced: boolean) {
  const [customWidgets, setCustomWidgets] = useState<Record<string, WidgetId[]> | null>(null)
  const [widgetWidths, setWidgetWidths] = useState<Record<WidgetId, WidgetWidth> | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try { setCustomWidgets(JSON.parse(stored)) } catch { /* ignore */ }
    }
    const storedWidths = localStorage.getItem(WIDTHS_STORAGE_KEY)
    if (storedWidths) {
      try { setWidgetWidths(JSON.parse(storedWidths)) } catch { /* ignore */ }
    }
  }, [])

  const modeKey = isAdvanced ? 'advanced' : 'basic'

  const activeWidgets: WidgetId[] = customWidgets?.[modeKey]
    ?? ALL_WIDGETS.filter(w => isAdvanced ? w.advancedDefault : w.basicDefault).map(w => w.id)

  const isVisible = useCallback((id: WidgetId) => activeWidgets.includes(id), [activeWidgets])

  const getWidth = useCallback((id: WidgetId): WidgetWidth => {
    const def = ALL_WIDGETS.find(w => w.id === id)
    if (def?.alwaysFull) return 'full'
    return widgetWidths?.[id] ?? def?.defaultWidth ?? 'full'
  }, [widgetWidths])

  const toggleWidth = useCallback((id: WidgetId) => {
    const def = ALL_WIDGETS.find(w => w.id === id)
    if (def?.alwaysFull) return

    const current: Record<string, WidgetWidth> = widgetWidths ?? {}
    const currentWidth = current[id] ?? def?.defaultWidth ?? 'full'
    const newWidth: WidgetWidth = currentWidth === 'full' ? 'half' : 'full'
    const updated: Record<WidgetId, WidgetWidth> = { ...current, [id]: newWidth } as Record<WidgetId, WidgetWidth>
    setWidgetWidths(updated)
    localStorage.setItem(WIDTHS_STORAGE_KEY, JSON.stringify(updated))
  }, [widgetWidths])

  const toggleWidget = useCallback((id: WidgetId) => {
    const def = ALL_WIDGETS.find(w => w.id === id)
    if (def?.alwaysVisible) return

    const current = customWidgets ?? {
      basic: ALL_WIDGETS.filter(w => w.basicDefault).map(w => w.id),
      advanced: ALL_WIDGETS.filter(w => w.advancedDefault).map(w => w.id),
    }
    const list = current[modeKey] ?? []
    const newList = list.includes(id) ? list.filter(w => w !== id) : [...list, id]
    const updated = { ...current, [modeKey]: newList }
    setCustomWidgets(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  }, [customWidgets, modeKey])

  const availableToAdd = ALL_WIDGETS.filter(w => !w.alwaysVisible && !activeWidgets.includes(w.id))
  const removable = ALL_WIDGETS.filter(w => !w.alwaysVisible && activeWidgets.includes(w.id))

  return { activeWidgets, isVisible, toggleWidget, toggleWidth, getWidth, availableToAdd, removable }
}
