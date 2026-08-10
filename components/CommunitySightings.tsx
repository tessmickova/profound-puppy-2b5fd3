'use client'
// components/CommunitySightings.tsx — Community sighting reports: 4-day cards with per-day reporting
import { useState, useEffect, useCallback, useMemo } from 'react'
import clsx from 'clsx'

interface NightSummary {
  night_date: string
  seen_count: number
  photo_count: number
}

interface Props {
  kp: number
  bz: number | null
}

/** Simple browser fingerprint — not tracking, just preventing duplicate clicks */
function getFingerprint(): string {
  if (typeof window === 'undefined') return 'ssr'
  const nav = window.navigator
  const raw = [
    nav.userAgent,
    nav.language,
    screen.width,
    screen.height,
    screen.colorDepth,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
  ].join('|')
  let hash = 0
  for (let i = 0; i < raw.length; i++) {
    hash = ((hash << 5) - hash + raw.charCodeAt(i)) | 0
  }
  return `fp_${Math.abs(hash).toString(36)}_${raw.length}`
}

/** Get tonight's date string (CZ timezone logic) */
function getTonightDate(): string {
  const now = new Date()
  const czStr = now.toLocaleString('en-CA', { timeZone: 'Europe/Prague', hour12: false })
  const [datePart, timePart] = czStr.split(', ')
  const hour = parseInt(timePart.split(':')[0])
  if (hour < 6) {
    const d = new Date(datePart)
    d.setDate(d.getDate() - 1)
    return d.toISOString().slice(0, 10)
  }
  return datePart
}

export function CommunitySightings({ kp, bz }: Props) {
  const [nights, setNights] = useState<NightSummary[]>([])
  const [reported, setReported] = useState<Record<string, { seen?: boolean; photo?: boolean }>>({})
  const [sending, setSending] = useState(false)
  const tonight = useMemo(() => getTonightDate(), [])

  // Fetch sighting data
  useEffect(() => {
    fetch('/api/sightings')
      .then(r => r.json())
      .then((data: NightSummary[]) => {
        if (Array.isArray(data)) setNights(data)
      })
      .catch(() => {})
  }, [])

  // Check localStorage for already-reported (all recent nights)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const rep: Record<string, { seen?: boolean; photo?: boolean }> = {}
    for (let i = 0; i < 4; i++) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().slice(0, 10)
      const key = `sighting_${dateStr}`
      const stored = localStorage.getItem(key)
      if (stored) {
        try { rep[dateStr] = JSON.parse(stored) } catch { /* ignore */ }
      }
    }
    setReported(rep)
  }, [])

  const report = useCallback(async (nightDate: string, type: 'seen' | 'photo') => {
    setSending(true)
    try {
      const res = await fetch('/api/sightings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          kp,
          bz,
          fingerprint: getFingerprint(),
        }),
      })
      if (res.ok) {
        // Update reported state
        setReported(prev => ({
          ...prev,
          [nightDate]: { ...prev[nightDate], [type]: true },
        }))
        // Store in localStorage
        const key = `sighting_${nightDate}`
        const stored = JSON.parse(localStorage.getItem(key) ?? '{}')
        stored[type] = true
        localStorage.setItem(key, JSON.stringify(stored))
        // Update local counts
        setNights(prev => {
          const existing = prev.find(n => n.night_date === nightDate)
          if (existing) {
            return prev.map(n =>
              n.night_date === nightDate
                ? { ...n, [type === 'seen' ? 'seen_count' : 'photo_count']: (type === 'seen' ? n.seen_count : n.photo_count) + 1 }
                : n
            )
          }
          return [{ night_date: nightDate, seen_count: type === 'seen' ? 1 : 0, photo_count: type === 'photo' ? 1 : 0 }, ...prev]
        })
      }
    } catch { /* silent */ }
    setSending(false)
  }, [kp, bz])

  // Build 4-day cards (tonight + 3 previous nights)
  const cards = useMemo(() => {
    const days: { date: string; label: string; isTonight: boolean; data: NightSummary | null }[] = []
    for (let i = 0; i < 4; i++) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().slice(0, 10)
      const data = nights.find(n => n.night_date === dateStr) ?? null
      const isTonight = dateStr === tonight
      days.push({
        date: dateStr,
        label: isTonight
          ? 'Dnes v noci'
          : d.toLocaleDateString('cs-CZ', { weekday: 'short', day: 'numeric', month: 'numeric' }),
        isTonight,
        data,
      })
    }
    return days
  }, [nights, tonight])

  return (
    <div className="bg-[#04101e]/90 border border-white/8 rounded-2xl p-4">
      <div className="text-xs font-mono tracking-[2px] text-slate-500 uppercase mb-4 flex items-center gap-2">
        👁️ Hlášení komunity <span className="flex-1 h-px bg-white/5" />
      </div>

      {/* 4-day cards grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {cards.map(day => {
          const seenCount = day.data?.seen_count ?? 0
          const photoCount = day.data?.photo_count ?? 0
          const total = seenCount + photoCount
          const rep = reported[day.date] ?? {}

          return (
            <div
              key={day.date}
              className={clsx(
                'rounded-xl p-3 transition-colors',
                day.isTonight
                  ? 'border-2 border-aurora-teal/30 bg-aurora-teal/4'
                  : 'border border-white/6 bg-white/2',
              )}
            >
              {/* Date label */}
              <div className={clsx(
                'text-[11px] font-mono font-bold mb-2',
                day.isTonight ? 'text-aurora-teal' : 'text-slate-400',
              )}>
                {day.isTonight && <span className="inline-block w-1.5 h-1.5 rounded-full bg-aurora-teal shadow-[0_0_6px_#00d4ff] animate-pulse mr-1.5 align-middle" />}
                {day.label}
              </div>

              {/* Counts */}
              <div className="flex items-center gap-2 mb-2.5">
                <span className="text-[11px]" title={`${seenCount}× viděl`}>
                  👁️ <span className="font-mono font-bold text-emerald-400">{seenCount}</span>
                </span>
                <span className="text-[11px]" title={`${photoCount}× foto`}>
                  📸 <span className="font-mono font-bold text-violet-400">{photoCount}</span>
                </span>
                {total === 0 && <span className="text-[10px] text-slate-600 italic">žádná</span>}
              </div>

              {/* Report buttons — inside each card */}
              <div className="flex flex-col gap-1.5">
                <button
                  onClick={() => report(day.date, 'seen')}
                  disabled={rep.seen || sending}
                  className={clsx(
                    'flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all border',
                    rep.seen
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 cursor-default'
                      : 'bg-white/4 border-white/8 text-slate-400 hover:bg-emerald-500/10 hover:border-emerald-500/20 hover:text-emerald-400',
                  )}
                >
                  👁️ {rep.seen ? 'Hlášeno ✓' : 'Viděl/a jsem'}
                </button>
                <button
                  onClick={() => report(day.date, 'photo')}
                  disabled={rep.photo || sending}
                  className={clsx(
                    'flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all border',
                    rep.photo
                      ? 'bg-violet-500/10 border-violet-500/30 text-violet-400 cursor-default'
                      : 'bg-white/4 border-white/8 text-slate-400 hover:bg-violet-500/10 hover:border-violet-500/20 hover:text-violet-400',
                  )}
                >
                  📸 {rep.photo ? 'Hlášeno ✓' : 'Vyfotil/a jsem'}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <p className="text-[10px] text-slate-600 mt-3">
        Klikněte na tlačítko u příslušné noci. Jeden hlas na noc na zařízení. Data zůstávají viditelná 90 dní.
      </p>
    </div>
  )
}
