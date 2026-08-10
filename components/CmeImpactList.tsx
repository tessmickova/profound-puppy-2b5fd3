'use client'
// components/CmeImpactList.tsx
// User-friendly aurora verdict + educational guide + collapsible tech details
import { useMemo, useEffect, useState, useRef } from 'react'
import type { AggregatedData, SolarRegion } from '@/lib/noaa'
import type { DonkiCME, DonkiCMEArrival } from '@/lib/space-weather/nasa'
import { deriveSpaceWeatherState } from '@/lib/space-weather/hero/deriveSpaceWeatherState'
import type {
  AuroraPrecursor,
  ShockDetection,
  SourceClassification,
  SolarWindSourceType,
  SourcePrediction,
} from '@/lib/space-weather/sourceClassifier'

interface Props {
  data: AggregatedData | null | undefined
}

interface CmeRow {
  id: string
  eruptionDate: string
  eruptionTs: number
  speed: number | null
  type: string | null
  halfAngle: number | null
  gScale: number
  arrivalTs: number | null
  arrivalWindow: string
  impactProb: number
  horizonProb: number
  overheadProb: number
  isNext: boolean
  travelProgress: number   // 0–1, jak daleko je CME na cestě
  hoursElapsed: number
  hoursRemaining: number | null
  flareClass: string | null
  sourceRegion: string | null       // e.g. "S27E18"
  activeRegionNum: number | null    // e.g. 4405
  magClass: string | null           // e.g. "BGD" (Beta-Gamma-Delta)
}

// ── Live log entry stored in localStorage ───────────────────────────────────
interface LogEntry {
  ts: number       // timestamp ms
  state: string    // SpaceWeatherState
  now: string      // narrative.now
  next: string     // narrative.next
  forCz: string    // narrative.forCz
}

const LOG_KEY = 'auroradog_cme_log'
const TWO_DAYS_MS = 2 * 24 * 3600_000

function loadLog(): LogEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(LOG_KEY)
    if (!raw) return []
    const entries: LogEntry[] = JSON.parse(raw)
    const cutoff = Date.now() - TWO_DAYS_MS
    return entries.filter(e => e.ts >= cutoff)
  } catch { return [] }
}

function saveLog(entries: LogEntry[]) {
  try {
    const cutoff = Date.now() - TWO_DAYS_MS
    const trimmed = entries.filter(e => e.ts >= cutoff).slice(-50)
    localStorage.setItem(LOG_KEY, JSON.stringify(trimmed))
  } catch { /* quota exceeded — ignore */ }
}

function fmtLogTime(ts: number): string {
  return new Date(ts).toLocaleString('cs-CZ', {
    timeZone: 'Europe/Prague',
    day: 'numeric', month: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

// ── CME table helpers ───────────────────────────────────────────────────────

function fmtCz(d: Date): string {
  return d.toLocaleString('cs-CZ', {
    timeZone: 'Europe/Prague',
    day: 'numeric', month: 'long',
    hour: '2-digit', minute: '2-digit',
  })
}

function estimateGScale(speed: number | null, type: string | null): number {
  const s = speed ?? 0
  const earthDir = type === 'S' || type === 'C'
  // Earth-directed: full G-scale
  if (earthDir) {
    if (s >= 1000) return 3
    if (s >= 700) return 2
    return 1
  }
  // Not confirmed earth-directed but fast → could still produce glancing blow
  if (s >= 1000) return 2
  if (s >= 700) return 1
  return 0
}

/** Impact probability: how likely the CME hits Earth */
function calcImpactProb(cme: DonkiCME): number {
  const type = cme.analysis?.type
  const speed = cme.analysis?.speed ?? 0
  const halfAngle = cme.analysis?.halfAngle ?? 0
  if (type === 'S') return Math.min(Math.round(70 + speed / 200 * 5 + halfAngle / 180 * 10), 95)
  if (type === 'C') return Math.min(Math.round(35 + halfAngle / 120 * 20 + speed / 500 * 10), 75)
  // For unanalyzed CMEs or type 'O' — lower prob but not zero
  if (halfAngle > 30) return Math.min(Math.round(15 + halfAngle / 120 * 15 + speed / 600 * 5), 40)
  return Math.round(Math.max(5, Math.min(halfAngle / 3, 20)))
}

/** CZ visibility probability for a given G-scale (50°N latitude) */
function czHorizonProb(g: number): number {
  if (g >= 3) return 85
  if (g >= 2) return 55
  return 20
}
function czOverheadProb(g: number): number {
  if (g >= 3) return 50
  if (g >= 2) return 15
  return 2
}

function buildRows(data: AggregatedData | null | undefined): CmeRow[] {
  if (!data?.donki) return []
  const { cmes, arrivals, flares } = data.donki
  const regions = data.solarRegions ?? []
  const now = Date.now()
  const rows: CmeRow[] = []

  // Build region lookup: AR number → latest magnetic classification
  const regionMap = new Map<number, SolarRegion>()
  for (const r of regions) regionMap.set(r.region, r)

  const arrivalMap = new Map<string, DonkiCMEArrival>()
  for (const a of arrivals) {
    for (const lid of a.linkedEventIds) arrivalMap.set(lid, a)
    arrivalMap.set(a.activityID, a)
  }

  // Map flares by linked CME
  const flareMap = new Map<string, string>()
  for (const cme of cmes) {
    // Match flare class from note — require digit to avoid false matches ("A type" → not a flare)
    const noteMatch = cme.note?.match(/([ABCMX]\d+\.?\d*)\s*(class|flare)?/i)
    if (noteMatch) flareMap.set(cme.activityID, noteMatch[1].toUpperCase())
  }

  for (const cme of cmes) {
    const type = cme.analysis?.type ?? null
    const speed = cme.analysis?.speed ?? null
    const halfAngle = cme.analysis?.halfAngle ?? null
    const earthDir = type === 'S' || type === 'C'

    // Check if linked to M/X-class flare via linkedEventIds or note
    const linkedFlareClass = flareMap.get(cme.activityID) ?? null
    let hasLinkedFlare = false
    if (cme.linkedEventIds?.length) {
      for (const lid of cme.linkedEventIds) {
        if (lid.includes('-FLR-')) {
          const matchedFlare = flares.find(f => f.id === lid)
          if (matchedFlare) {
            const cls = matchedFlare.classType?.charAt(0)
            if (cls === 'M' || cls === 'X') hasLinkedFlare = true
          }
        }
      }
    }
    if (linkedFlareClass && /^[MX]/i.test(linkedFlareClass)) hasLinkedFlare = true

    const g = estimateGScale(speed, type)

    // Include if: earth-directed, OR linked to strong flare, OR G >= 1, OR fast
    if (!earthDir && !hasLinkedFlare && g < 1 && (speed ?? 0) < 500) continue

    const eruptionTs = new Date(cme.startTime).getTime()
    const arrival = arrivalMap.get(cme.activityID) ?? null
    let arrivalTs: number | null = null

    if (arrival) {
      arrivalTs = new Date(arrival.arrivalTime).getTime()
      if (arrivalTs < now - 24 * 3600_000) continue
    }

    const margin = (speed ?? 0) >= 700 ? 6 : 12
    let windowStr = 'odhad nedostupný'
    if (arrivalTs) {
      windowStr = `${fmtCz(new Date(arrivalTs - margin * 3600_000))} – ${fmtCz(new Date(arrivalTs + margin * 3600_000))}`
    }

    const hoursElapsed = (now - eruptionTs) / 3600_000
    let hoursRemaining: number | null = null
    let travelProgress = 0

    if (arrivalTs) {
      const totalTravel = arrivalTs - eruptionTs
      const elapsed = now - eruptionTs
      travelProgress = Math.min(Math.max(elapsed / totalTravel, 0), 1)
      hoursRemaining = Math.max((arrivalTs - now) / 3600_000, 0)
    } else if (speed && speed > 0) {
      // Estimate: Sun-Earth ~150M km, speed in km/s
      const estimatedTotalHours = 150_000_000 / speed / 3600
      travelProgress = Math.min(hoursElapsed / estimatedTotalHours, 1)
      hoursRemaining = Math.max(estimatedTotalHours - hoursElapsed, 0)
    }

    // Try to find flare class — first from linkedEventIds, then note, then time proximity
    let flareClass = linkedFlareClass
    if (!flareClass && cme.linkedEventIds?.length) {
      for (const lid of cme.linkedEventIds) {
        if (lid.includes('-FLR-')) {
          const matchedFlare = flares.find(f => f.id === lid)
          if (matchedFlare) { flareClass = matchedFlare.classType; break }
        }
      }
    }
    if (!flareClass && flares.length > 0) {
      // Match flare within 2h of CME start
      const closest = flares.find(f => Math.abs(new Date(f.beginTime).getTime() - eruptionTs) < 7200_000)
      if (closest) flareClass = closest.classType
    }

    // Resolve active region info
    const arNum = cme.activeRegionNum ?? null
    const regionInfo = arNum ? regionMap.get(arNum) : null

    rows.push({
      id: cme.activityID,
      eruptionDate: fmtCz(new Date(cme.startTime)),
      eruptionTs,
      speed,
      type,
      halfAngle,
      gScale: hasLinkedFlare && g < 1 ? 1 : g,
      arrivalTs,
      arrivalWindow: windowStr,
      impactProb: calcImpactProb(cme),
      horizonProb: czHorizonProb(g),
      overheadProb: czOverheadProb(g),
      isNext: false,
      travelProgress,
      hoursElapsed: Math.round(hoursElapsed * 10) / 10,
      hoursRemaining: hoursRemaining != null ? Math.round(hoursRemaining * 10) / 10 : null,
      flareClass,
      sourceRegion: cme.sourceLocation,
      activeRegionNum: arNum,
      magClass: regionInfo?.magClass ?? null,
    })
  }

  rows.sort((a, b) => b.gScale - a.gScale || b.impactProb - a.impactProb)
  if (rows.length > 0) rows[0].isNext = true
  return rows.slice(0, 6)
}

const G_COLORS: Record<number, string> = { 0: '#3b6', 1: '#5b5', 2: '#fb0', 3: '#f70', 4: '#e33', 5: '#c00' }

// ── USER-FRIENDLY VERDICT ENGINE ────────────────────────────────────────────

type Verdict = 'storm' | 'good' | 'moderate' | 'low' | 'quiet'

interface VerdictInfo {
  level: Verdict
  headline: string
  subline: string
  decisive: string
  color: string
  glow: string
}

const VERDICT_STYLES: Record<Verdict, { color: string; glow: string; border: string; bg: string }> = {
  storm:    { color: '#00ffaa', glow: '0 0 40px rgba(0,255,170,0.15)', border: 'border-aurora-green/30', bg: 'from-aurora-green/6' },
  good:     { color: '#5bcc5b', glow: '0 0 30px rgba(91,204,91,0.10)', border: 'border-[#5bcc5b]/25', bg: 'from-[#5bcc5b]/4' },
  moderate: { color: '#ffa500', glow: '0 0 25px rgba(255,165,0,0.08)', border: 'border-[#ffa500]/20', bg: 'from-[#ffa500]/3' },
  low:      { color: '#48c7ff', glow: '0 0 20px rgba(72,199,255,0.06)', border: 'border-[#48c7ff]/15', bg: 'from-[#48c7ff]/2' },
  quiet:    { color: '#4a6080', glow: 'none', border: 'border-slate-700/20', bg: 'from-slate-800/2' },
}

function srcFriendly(s: SolarWindSourceType): string {
  switch (s) {
    case 'CME': return 'Koronální výron (CME)'
    case 'CME_SHEATH': return 'Čelo CME oblaku'
    case 'CIR_HSS': return 'Koronální díra'
    case 'MIXED': return 'Smíšená aktivita'
    case 'AMBIENT': return 'Klidný sluneční vítr'
  }
}

function deriveVerdict(
  source: SolarWindSourceType | null,
  kp: number,
  bz: number | null,
  prediction: SourcePrediction | null,
  shock: ShockDetection | null,
): VerdictInfo {
  const s = source ?? 'AMBIENT'
  const b = bz ?? 0

  // IP shock + southward Bz = immediate aurora potential
  if (shock?.type === 'INTERPLANETARY' && b < -5) {
    return {
      level: 'storm',
      headline: 'Rázová vlna dorazila — záře může být viditelná!',
      subline: `Kp ${kp} · Bz ${b.toFixed(0)} nT jižní · magnetosféra otevřená`,
      decisive: 'Podmínky pro záři v ČR jsou splněny právě teď. Pokud je jasná obloha a astronomická tma, vyrazte ven na místo s tmavým severním obzorem.',
      color: '#00ffaa', glow: '0 0 40px rgba(0,255,170,0.15)',
    }
  }

  // Strong conditions
  if (b < -10 && kp >= 5) {
    return {
      level: 'storm',
      headline: 'Výborné podmínky — záře dosahuje k ČR',
      subline: `Silně jižní pole (${b.toFixed(0)} nT) otevírá magnetosféru dokořán`,
      decisive: 'Magnetické pole je hluboko na jihu a bouře je dostatečně silná. Záře by měla být zachytitelná foťákem, při Kp 6+ i okem. Klíčové je teď počasí a tma.',
      color: '#00ffaa', glow: '0 0 40px rgba(0,255,170,0.15)',
    }
  }

  // Good
  if ((kp >= 5 && b < -5) || (kp >= 4 && b < -8) || ((prediction?.czEyeProb ?? 0) > 15 && s !== 'AMBIENT')) {
    return {
      level: 'good',
      headline: 'Dobrá šance na polární záři',
      subline: `${srcFriendly(s)} · Kp ${kp} · Bz ${b.toFixed(0)} nT`,
      decisive: b < -5
        ? 'Podmínky jsou příznivé. Bz je jižní a bouře sílí. Sledujte, zda vydrží — čím déle, tím lepší šance na vizuální záři.'
        : 'Podmínky se vyvíjejí slibně. Čekáme na prohloubení jižního Bz. Pokud klesne pod -10 nT, šance na viditelnou záři výrazně vzroste.',
      color: '#5bcc5b', glow: '0 0 30px rgba(91,204,91,0.10)',
    }
  }

  // Moderate — something active but not strong yet
  if (s !== 'AMBIENT' && (kp >= 3 || (prediction?.czPhotoProb ?? 0) > 15)) {
    return {
      level: 'moderate',
      headline: 'Zvýšená aktivita — sledujte vývoj',
      subline: `${srcFriendly(s)} ${s === 'CME' || s === 'CME_SHEATH' ? '— na cestě k Zemi' : '— aktivní'}`,
      decisive: deriveModeratePlan(s, b, kp, prediction),
      color: '#ffa500', glow: '0 0 25px rgba(255,165,0,0.08)',
    }
  }

  // Low — source active but weak
  if (s !== 'AMBIENT') {
    return {
      level: 'low',
      headline: 'Aktivita na Slunci — pro ČR zatím slabé',
      subline: `${srcFriendly(s)} · podmínky nedostatečné pro 50° šířky`,
      decisive: deriveModeratePlan(s, b, kp, prediction),
      color: '#48c7ff', glow: '0 0 20px rgba(72,199,255,0.06)',
    }
  }

  return {
    level: 'quiet',
    headline: 'Klidno — bez známek aktivity',
    subline: 'Sluneční vítr je v normálu, žádná bouře se neblíží',
    decisive: 'Žádný koronální výron ani proud z koronální díry aktuálně neovlivňuje magnetosféru Země. Záře v ČR dnes není pravděpodobná.',
    color: '#4a6080', glow: 'none',
  }
}

function deriveModeratePlan(s: SolarWindSourceType, bz: number, kp: number, p: SourcePrediction | null): string {
  if (s === 'CME' || s === 'CME_SHEATH') {
    if (bz > 0) return 'Magnetické pole je zatím severní — brána magnetosféry je zavřená. Klíčový moment nastane, až oblak dorazí a pole se otočí na jih. Tehdy se rozhodne, zda záře pronikne k ČR.'
    if (bz > -5) return 'Pole míří mírně k jihu, ale pro záři v ČR potřebujeme Bz pod -5 nT. Sledujte, zda klesne hlouběji — to otevře cestu pro záři.'
    return 'Bz je jižní ale bouře ještě nedosáhla plné síly. Při prohloubení pod -10 nT a Kp nad 5 vzroste šance na viditelnou záři výrazně.'
  }
  if (s === 'CIR_HSS') {
    return 'Vysokorychlostní proud z koronální díry kolísá. Záře se může objevit v krátkých oknech, kdy Bz skočí na jih. Obvykle slabší a kratší než u CME, ale stále zachytitelná foťákem.'
  }
  return 'Podmínky jsou smíšené. Pro záři v ČR je potřeba Kp alespoň 4 a jižní magnetické pole (Bz pod -5 nT). Sledujte dashboard — situace se může změnit rychle.'
}

// ── Factor assessment ───────────────────────────────────────────────────────

interface Factor {
  label: string
  status: 'good' | 'neutral' | 'bad'
  value: string
  detail: string
}

function assessFactors(
  source: SolarWindSourceType | null,
  kp: number,
  bz: number | null,
  prediction: SourcePrediction | null,
  shock: ShockDetection | null,
): Factor[] {
  const s = source ?? 'AMBIENT'
  const b = bz ?? 0
  const factors: Factor[] = []

  // 1. SOURCE
  factors.push({
    label: 'Co přichází',
    ...(s === 'CME' ? {
      status: 'good' as const, value: 'Koronální výron (CME)',
      detail: 'Nejsilnější typ — magnetický oblak může otevřít magnetosféru na hodiny.',
    } : s === 'CME_SHEATH' ? {
      status: 'good' as const, value: 'Čelo CME oblaku',
      detail: 'Turbulentní oblast před výronem — intenzivní ale krátké okno (30–120 min).',
    } : s === 'CIR_HSS' ? {
      status: 'neutral' as const, value: 'Koronální díra',
      detail: 'Rychlý vítr s kolísavým Bz — záře v krátkých záblescích.',
    } : s === 'MIXED' ? {
      status: 'neutral' as const, value: 'Smíšená aktivita',
      detail: 'Kombinace zdrojů — vývoj těžko předvídatelný.',
    } : {
      status: 'bad' as const, value: 'Nic zvláštního',
      detail: 'Normální sluneční vítr bez bouře.',
    }),
  })

  // 2. BZ DIRECTION
  factors.push({
    label: 'Magnetické pole (Bz)',
    ...(b < -10 ? {
      status: 'good' as const, value: `${b.toFixed(0)} nT — silně jižní`,
      detail: 'Brána magnetosféry je dokořán otevřená — energie proniká k Zemi.',
    } : b < -5 ? {
      status: 'good' as const, value: `${b.toFixed(0)} nT — jižní`,
      detail: 'Brána otevřená — částice ze Slunce vstupují do magnetosféry.',
    } : b < 0 ? {
      status: 'neutral' as const, value: `${b.toFixed(1)} nT — slabě jižní`,
      detail: 'Pootevřeno — pro záři v ČR potřebujeme pod -5 nT.',
    } : {
      status: 'bad' as const, value: `+${b.toFixed(1)} nT — severní`,
      detail: 'Brána magnetosféry zavřená — záře nemůže proniknout k ČR.',
    }),
  })

  // 3. KP INDEX
  factors.push({
    label: 'Síla bouře (Kp)',
    ...(kp >= 7 ? {
      status: 'good' as const, value: `Kp ${kp} — silná bouře (G${kp - 4})`,
      detail: 'Záře může být jasně viditelná okem, i vysoko na obloze!',
    } : kp >= 5 ? {
      status: 'good' as const, value: `Kp ${kp} — geomagnetická bouře (G${Math.max(1, kp - 4)})`,
      detail: 'Na foťákem i vizuálně z tmavého místa v ČR.',
    } : kp >= 4 ? {
      status: 'good' as const, value: `Kp ${kp} — zvýšená aktivita`,
      detail: 'Záře zachytitelná foťákem z tmavých míst v ČR.',
    } : kp >= 3 ? {
      status: 'neutral' as const, value: `Kp ${kp} — na hranici`,
      detail: 'Pro ČR na 50°N slabé — závisí na Bz a dalších faktorech.',
    } : {
      status: 'bad' as const, value: `Kp ${kp} — nízko`,
      detail: 'Záře je příliš daleko na severu — nedosáhne k 50°N.',
    }),
  })

  // 4. DURATION
  if (prediction && s !== 'AMBIENT') {
    const durMax = prediction.durationHours[1]
    factors.push({
      label: 'Očekávané trvání',
      ...(durMax >= 4 ? {
        status: 'good' as const,
        value: `${prediction.durationHours[0]}–${durMax} hodin`,
        detail: 'Dlouhé okno — víc času na pozorování a focení.',
      } : durMax >= 1.5 ? {
        status: 'neutral' as const,
        value: `${prediction.durationHours[0]}–${durMax} hodin`,
        detail: 'Střední doba — buďte připraveni, situace se mění rychle.',
      } : {
        status: 'bad' as const,
        value: durMax < 1
          ? `${Math.round(prediction.durationHours[0] * 60)}–${Math.round(durMax * 60)} minut`
          : `${prediction.durationHours[0]}–${durMax} h`,
        detail: 'Krátké okno — záře se může objevit jen na chvíli.',
      }),
    })
  }

  // 5. SHOCK
  if (shock && shock.type !== 'NONE') {
    factors.push({
      label: 'Rázová vlna',
      status: 'good' as const,
      value: shock.type === 'INTERPLANETARY' ? 'Detekována na L1!' : 'CIR rozhraní',
      detail: shock.type === 'INTERPLANETARY'
        ? 'Rázová vlna — předzvěst bouře. Záře může začít během desítek minut.'
        : 'Přechod do rychlého proudu — sledujte vývoj Bz.',
    })
  }

  return factors
}

function czTime(d: Date): string {
  return d.toLocaleString('cs-CZ', {
    timeZone: 'Europe/Prague',
    day: 'numeric', month: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

// ── MAIN COMPONENT ──────────────────────────────────────────────────────────

export function CmeImpactList({ data }: Props) {
  const rows = useMemo(() => buildRows(data), [data])
  const hero = useMemo(() => deriveSpaceWeatherState(data), [data])
  const [log, setLog] = useState<LogEntry[]>([])
  const [showTech, setShowTech] = useState(false)
  const [showGuide, setShowGuide] = useState(false)
  const lastStateRef = useRef<string>('')
  const logEndRef = useRef<HTMLDivElement>(null)

  const sourceClass = hero.sourceClassification
  const shock = hero.shock
  const precursors = hero.precursors ?? []
  const prediction = hero.sourcePrediction
  const sw = data?.solarWind
  const kp = data?.kpCurrent ?? 0
  const bz = sw?.bz ?? null
  const source = sourceClass?.source ?? null

  const verdict = useMemo(() => deriveVerdict(source, kp, bz, prediction, shock), [source, kp, bz, prediction, shock])
  const factors = useMemo(() => assessFactors(source, kp, bz, prediction, shock), [source, kp, bz, prediction, shock])
  const vstyle = VERDICT_STYLES[verdict.level]

  useEffect(() => { setLog(loadLog()) }, [])

  useEffect(() => {
    if (!hero.state) return
    const key = `${hero.state}|${hero.narrative.now.slice(0, 40)}`
    if (key === lastStateRef.current) return
    lastStateRef.current = key
    const entry: LogEntry = {
      ts: Date.now(), state: hero.state,
      now: hero.narrative.now, next: hero.narrative.next, forCz: hero.narrative.forCz,
    }
    setLog(prev => { const u = [...prev, entry]; saveLog(u); return u })
  }, [hero.state, hero.narrative.now])

  useEffect(() => { logEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [log.length])

  const hasContent = rows.length > 0 || (sourceClass && sourceClass.source !== 'AMBIENT') || precursors.length > 0
  if (!hasContent) return null

  return (
    <div className="space-y-3">
      {/* ═══════════════════════════════════════════════════════════
           VERDIKT — Hlavní karta s okamžitým přehledem
          ═══════════════════════════════════════════════════════════ */}
      <div
        className={`rounded-2xl border overflow-hidden ${vstyle.border}`}
        style={{ background: 'linear-gradient(180deg, rgba(4,16,30,0.97) 0%, rgba(4,16,30,0.92) 100%)', boxShadow: vstyle.glow }}
      >
        <div className="px-5 pt-5 pb-4">
          {/* Verdict dot + headline */}
          <div className="flex items-start gap-3.5">
            <div
              className="w-3.5 h-3.5 rounded-full shrink-0 mt-1"
              style={{ backgroundColor: vstyle.color, boxShadow: `0 0 12px ${vstyle.color}60` }}
            />
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-white leading-tight">
                {verdict.headline}
              </h2>
              <p className="text-xs text-slate-400 mt-1 font-mono">{verdict.subline}</p>
            </div>
          </div>

          {/* Decisive explanation */}
          <div className="mt-4 bg-white/3 rounded-xl px-4 py-3 border border-white/5">
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{verdict.decisive}</p>
          </div>

          {/* Quick probabilities (if prediction exists) */}
          {prediction && source !== 'AMBIENT' && source !== null && (
            <div className="mt-3 grid grid-cols-3 gap-2">
              <QuickProb label="Foťákem z ČR" value={prediction.czPhotoProb} />
              <QuickProb label="Okem z ČR" value={prediction.czEyeProb} />
              <QuickProb label="Bz vydrží na jihu" value={prediction.bzSustainProb} />
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
           ROZHODUJÍCÍ FAKTORY — Co určuje, jestli záři uvidíte
          ═══════════════════════════════════════════════════════════ */}
      {factors.length > 0 && source !== 'AMBIENT' && (
        <div className="rounded-2xl border border-white/8 overflow-hidden"
             style={{ background: 'linear-gradient(180deg, rgba(4,16,30,0.95) 0%, rgba(4,16,30,0.90) 100%)' }}>
          <div className="px-5 pt-4 pb-1.5">
            <h3 className="text-[11px] tracking-[1.5px] text-slate-500 uppercase">Co rozhoduje</h3>
          </div>
          <div className="px-4 pb-4 space-y-0.5">
            {factors.map((f, i) => (
              <FactorRow key={i} factor={f} />
            ))}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
           CME NA CESTĚ — Zjednodušené karty příchozích výronů
          ═══════════════════════════════════════════════════════════ */}
      {rows.length > 0 && (
        <div className="rounded-2xl border border-white/8 overflow-hidden"
             style={{ background: 'linear-gradient(180deg, rgba(4,16,30,0.95) 0%, rgba(4,16,30,0.90) 100%)' }}>
          <div className="px-5 pt-4 pb-2">
            <h3 className="text-[11px] tracking-[1.5px] text-slate-500 uppercase">
              Koronální výrony směřující k Zemi
            </h3>
          </div>
          <div className="px-4 pb-4 space-y-2">
            {rows.map(row => (
              <CmeCard key={row.id} row={row} />
            ))}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
           PRŮVODCE — Jak poznat, zda bude noc aktivní
          ═══════════════════════════════════════════════════════════ */}
      <div className="rounded-2xl border border-white/8 overflow-hidden"
           style={{ background: 'linear-gradient(180deg, rgba(4,16,30,0.95) 0%, rgba(4,16,30,0.90) 100%)' }}>
        <button
          onClick={() => setShowGuide(v => !v)}
          className="w-full px-5 py-3 flex items-center justify-between text-left hover:bg-white/2 transition-colors"
        >
          <span className="text-[11px] tracking-[1.5px] text-slate-500 uppercase">
            Podle čeho poznáte, zda noc bude aktivní?
          </span>
          <span className="text-[10px] text-slate-600 shrink-0 ml-2">{showGuide ? '▲' : '▼'}</span>
        </button>

        {showGuide && (
          <div className="px-5 pb-5 space-y-4 border-t border-white/4 pt-4">
            <GuideItem
              number="①"
              title="Magnetické pole musí být jižní (Bz záporné)"
              text={"Toto je ten nejdůležitější parametr. Bz udává směr meziplanetárního magnetického pole. Když je záporné (jižní směr), magnetosféra Země se otevře a nabité částice ze Slunce mohou proniknout dovnitř a rozsvítit polární záři. Bez jižního Bz nebude záře v ČR viditelná, i kdyby bouře byla sebevětší."}
              color="#00ffaa"
            />
            <GuideItem
              number="②"
              title="Kp index musí dosáhnout alespoň 4"
              text="Kp index (0–9) vyjadřuje sílu geomagnetické bouře. Česká republika leží na 50° severní šířky — záře musí být velmi silná, aby dosáhla tak daleko na jih. Kp 4 = zachytitelná foťákem z tmavých míst. Kp 5–6 = slabě viditelná okem. Kp 7+ = jasná vizuální záře."
              color="#5bcc5b"
            />
            <GuideItem
              number="③"
              title="Bz musí zůstat jižní dostatečně dlouho"
              text="Krátký skok Bz na jih (pod 30 minut) stačí na záblesk zachytitelný foťákem. Pro jasnou záři viditelnou okem potřebujete Bz pod -10 nT po dobu alespoň 1–2 hodiny. CME oblaky toto umí nejlépe — koronální díry spíše kolísají."
              color="#ffa500"
            />
            <GuideItem
              number="④"
              title="Typ zdroje určuje, co čekat"
              text="CME (koronální výron) = nejlepší scénář — magnetický oblak může držet jižní pole hodiny. Koronální díra = rychlý vítr s kolísavým Bz, záře se objeví jen v krátkých oknech. Sheath (čelo oblaku) = intenzivní ale krátký průlet (30–120 min)."
              color="#48c7ff"
            />
            <div className="bg-white/3 rounded-lg px-4 py-2.5 border border-white/5">
              <p className="text-[11px] text-slate-400 leading-relaxed">
                <span className="font-bold text-slate-300">Shrnutí: </span>
                Bz pod -5 nT + Kp ≥ 4 = šance na fotku. Bz pod -10 nT + Kp ≥ 6 = šance vidět okem. Jasná obloha a astronomická tma jsou samozřejmostí.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════
           TECHNICKÁ DATA — rozbalovací pro pokročilé
          ═══════════════════════════════════════════════════════════ */}
      {sourceClass && sourceClass.source !== 'AMBIENT' && (
        <div className="rounded-2xl border border-white/8 overflow-hidden"
             style={{ background: 'linear-gradient(180deg, rgba(4,16,30,0.95) 0%, rgba(4,16,30,0.90) 100%)' }}>
          <button
            onClick={() => setShowTech(v => !v)}
            className="w-full px-5 py-3 flex items-center justify-between text-left hover:bg-white/2 transition-colors"
          >
            <span className="text-[11px] tracking-[1.5px] text-slate-500 uppercase">
              Technická data (L1 parametry, klasifikace)
            </span>
            <span className="text-[10px] text-slate-600 shrink-0 ml-2">{showTech ? '▲' : '▼'}</span>
          </button>

          {showTech && (
            <div className="px-5 pb-4 border-t border-white/4 pt-3 font-mono text-[11px] space-y-4">
              {/* L1 Parameters */}
              <div>
                <p className="text-[9px] tracking-[1.5px] uppercase text-slate-500 mb-2">DSCOVR/ACE L1 — Real-time</p>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-x-3 gap-y-1.5">
                  <TechParam label="Bz (GSM)" value={sw?.bz != null ? `${sw.bz.toFixed(1)} nT` : '—'} />
                  <TechParam label="Bt" value={sw?.bt != null ? `${sw.bt.toFixed(1)} nT` : '—'} />
                  <TechParam label="Speed" value={sw?.speed != null ? `${Math.round(sw.speed)} km/s` : '—'} />
                  <TechParam label="Density" value={sw?.density != null ? `${sw.density.toFixed(1)} p/cm³` : '—'} />
                  <TechParam label="Temp" value={sw?.temperature ? `${Math.round(sw.temperature / 1000)} kK` : '—'} />
                  <TechParam label="Kp" value={`${kp}`} />
                </div>
              </div>

              {/* Classification */}
              <div>
                <p className="text-[9px] tracking-[1.5px] uppercase text-slate-500 mb-2">Klasifikace zdroje</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px]">
                  <span className="text-slate-500">Typ: <span className="text-slate-300 font-bold">{sourceClass.sourceLabel}</span></span>
                  <span className="text-slate-500">Jistota: <span className="text-slate-300">{Math.round(sourceClass.confidence * 100)}%</span></span>
                  <span className="text-slate-500">Bz σ: <span className="text-slate-300">{sourceClass.indicators.bzVariability.toFixed(1)} nT</span></span>
                  <span className="text-slate-500">Alfvénicita: <span className="text-slate-300">{(sourceClass.indicators.alfvenicity * 100).toFixed(0)}%</span></span>
                  <span className="text-slate-500">T ratio: <span className="text-slate-300">{sourceClass.indicators.temperatureRatio.toFixed(2)}</span></span>
                  <span className="text-slate-500">Mag. oblak: <span className="text-slate-300">{sourceClass.indicators.magneticCloudSignature ? 'Ano' : 'Ne'}</span></span>
                </div>
              </div>

              {/* Precursors (if any) */}
              {precursors.length > 0 && (
                <div>
                  <p className="text-[9px] tracking-[1.5px] uppercase text-slate-500 mb-2">
                    Aktivní signatury ({precursors.length})
                  </p>
                  <div className="space-y-1">
                    {precursors.slice(0, 6).map((p, i) => {
                      const sevColor = p.strength >= 0.7 ? '#f55' : p.strength >= 0.4 ? '#fb0' : '#48c7ff'
                      return (
                        <div key={`${p.type}-${i}`} className="flex items-baseline gap-2 text-[10px]">
                          <span className="font-bold w-8 shrink-0" style={{ color: sevColor }}>
                            {Math.round(p.strength * 100)}%
                          </span>
                          <span className="text-slate-400 flex-1">{p.description}</span>
                          {p.leadTimeMinutes != null && p.leadTimeMinutes > 0 && (
                            <span className="text-slate-600 shrink-0">T−{p.leadTimeMinutes}m</span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Shock details */}
              {shock && shock.type !== 'NONE' && (
                <div>
                  <p className="text-[9px] tracking-[1.5px] uppercase text-slate-500 mb-1">
                    {shock.type === 'INTERPLANETARY' ? 'IP Shock' : 'CIR Boundary'}
                  </p>
                  <div className="flex gap-4 text-[10px]">
                    <span className="text-slate-500">ΔV: <span className="text-slate-300">+{shock.speedJump} km/s</span></span>
                    <span className="text-slate-500">Δn: <span className="text-slate-300">×{shock.densityJump}</span></span>
                    <span className="text-slate-500">ΔBt: <span className="text-slate-300">+{shock.btJump} nT</span></span>
                    <span className="text-slate-500">Síla: <span className="text-slate-300">{(shock.strength * 10).toFixed(1)}/10</span></span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
           LOG — Historie hlášení
          ═══════════════════════════════════════════════════════════ */}
      {log.length > 0 && (
        <div className="rounded-2xl border border-white/8 overflow-hidden"
             style={{ background: 'linear-gradient(180deg, rgba(4,16,30,0.95) 0%, rgba(4,16,30,0.90) 100%)' }}>
          <div className="px-5 pt-3 pb-1">
            <span className="text-[9px] tracking-[1.5px] text-slate-600 uppercase">Historie (48h)</span>
          </div>
          <div className="max-h-[100px] overflow-y-auto px-5 pb-2.5 scrollbar-thin">
            {log.slice(-30).map((entry, i) => (
              <div key={`${entry.ts}-${i}`} className="flex gap-2 py-[2px] border-b border-white/2 last:border-0">
                <span className="text-[9px] text-slate-600 shrink-0 w-[78px] tabular-nums font-mono">{fmtLogTime(entry.ts)}</span>
                <span className="text-[10px] text-slate-400 flex-1 truncate">{entry.now}</span>
              </div>
            ))}
            <div ref={logEndRef} />
          </div>
        </div>
      )}
    </div>
  )
}

// ── Sub-components ──────────────────────────────────────────────────────────

/** Quick probability bar for the verdict card */
function QuickProb({ label, value }: { label: string; value: number }) {
  const color = value >= 50 ? '#00ffaa' : value >= 20 ? '#5bcc5b' : value >= 5 ? '#ffa500' : '#4a6080'
  return (
    <div className="bg-white/3 rounded-lg px-3 py-2 border border-white/4 text-center">
      <p className="text-[9px] text-slate-500 mb-0.5">{label}</p>
      <p className="text-lg font-bold tabular-nums" style={{ color }}>{value}%</p>
    </div>
  )
}

/** Single factor row with traffic-light dot */
function FactorRow({ factor }: { factor: Factor }) {
  const dotColor = factor.status === 'good' ? '#00ffaa' : factor.status === 'neutral' ? '#ffa500' : '#ff4444'
  return (
    <div className="flex items-start gap-3 px-2 py-2.5 rounded-lg hover:bg-white/2 transition-colors">
      <div
        className="w-2.5 h-2.5 rounded-full shrink-0 mt-1"
        style={{ backgroundColor: dotColor, boxShadow: `0 0 8px ${dotColor}40` }}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-[11px] text-slate-500">{factor.label}:</span>
          <span className="text-xs font-bold text-slate-200">{factor.value}</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">{factor.detail}</p>
      </div>
    </div>
  )
}

/** Format magnetic classification to Greek symbols */
function fmtMagClass(mag: string): string {
  const map: Record<string, string> = {
    A: 'α', B: 'β', BG: 'βγ', BGD: 'βγδ', G: 'γ', GD: 'γδ', D: 'δ',
  }
  return map[mag] ?? mag
}

/** Color for magnetic classification — more complex = more dangerous */
function magClassColor(mag: string | null): string {
  if (!mag) return '#4a6080'
  if (mag === 'BGD' || mag === 'GD') return '#e33'       // most dangerous
  if (mag === 'BG' || mag === 'G' || mag === 'D') return '#fb0'
  if (mag === 'B') return '#5b5'
  return '#4a6080'                                         // A or unknown
}

/** Color for flare class */
function flareClassColor(cls: string | null): string {
  if (!cls) return '#4a6080'
  const c = cls.charAt(0)
  if (c === 'X') return '#e33'
  if (c === 'M') return '#fb0'
  if (c === 'C') return '#5b5'
  return '#4a6080'
}

/** Compact graphical CME card with transit progress */
function CmeCard({ row }: { row: CmeRow }) {
  const gc = G_COLORS[row.gScale] ?? '#4a6080'
  const isArrived = row.travelProgress >= 1
  const speedLabel = row.speed
    ? row.speed >= 1000 ? 'extrémní' : row.speed >= 700 ? 'rychlý' : row.speed >= 400 ? 'střední' : 'pomalý'
    : null

  const fmtHours = (h: number): string => {
    if (h < 1) return `${Math.round(h * 60)} min`
    if (h < 24) return `${Math.floor(h)}h ${Math.round((h % 1) * 60)}m`
    const d = Math.floor(h / 24)
    const rem = Math.round(h % 24)
    return `${d}d ${rem}h`
  }

  const fcc = flareClassColor(row.flareClass)
  const mcc = magClassColor(row.magClass)

  return (
    <div className={`rounded-xl border transition-all ${
      row.isNext
        ? 'border-white/12 bg-white/3'
        : 'border-white/6 bg-white/1.5'
    }`}>
      {/* Top row: G-scale + flare badge + eruption info + probabilities */}
      <div className="px-3.5 pt-3 pb-2 flex items-start gap-3">
        {/* G-scale + flare class badges stacked */}
        <div className="shrink-0 flex flex-col items-center gap-1">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm border"
            style={{ color: gc, borderColor: `${gc}40`, backgroundColor: `${gc}12` }}
          >
            G{row.gScale}
          </div>
          {row.flareClass && (
            <div
              className="px-1.5 py-0.5 rounded-sm border text-[10px] font-bold font-mono leading-none"
              style={{ color: fcc, borderColor: `${fcc}40`, backgroundColor: `${fcc}12` }}
              title={`Třída erupce: ${row.flareClass}`}
            >
              {row.flareClass}
            </div>
          )}
        </div>

        {/* Info block */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            {row.isNext && (
              <span className="text-[9px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded-sm" style={{ color: gc, backgroundColor: `${gc}15` }}>
                ▶ DALŠÍ
              </span>
            )}
            {isArrived ? (
              <span className="text-[9px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded-sm bg-aurora-green/10 text-aurora-green">
                DORAZILO
              </span>
            ) : row.hoursRemaining != null && row.hoursRemaining < 6 ? (
              <span className="text-[9px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded-sm bg-[#ffa500]/10 text-[#ffa500]">
                BLÍŽÍ SE
              </span>
            ) : null}
            {/* Magnetic classification badge */}
            {row.magClass && (
              <span
                className="text-[9px] font-bold px-1.5 py-0.5 rounded-sm border"
                style={{ color: mcc, borderColor: `${mcc}35`, backgroundColor: `${mcc}10` }}
                title={`Magnetická klasifikace: ${row.magClass} (${fmtMagClass(row.magClass)})`}
              >
                {fmtMagClass(row.magClass)}
              </span>
            )}
          </div>
          {/* Source region + eruption time + speed */}
          <div className="flex items-baseline gap-2 mt-1 text-[10px] font-mono text-slate-400 flex-wrap">
            <span title="Datum a čas erupce na Slunci (SEČ/SELČ)">
              <span className="text-slate-600 text-[9px] uppercase mr-0.5">Erupce:</span>
              {row.eruptionDate}
            </span>
            {row.activeRegionNum && (
              <span className="text-slate-500" title={`Aktivní oblast AR${row.activeRegionNum}${row.sourceRegion ? ` (${row.sourceRegion})` : ''}`}>
                AR{row.activeRegionNum}
              </span>
            )}
            {row.speed && (
              <span
                className="text-slate-300"
                title={`Rychlost CME: ${Math.round(row.speed)} km/s — ${speedLabel}`}
              >
                {Math.round(row.speed)} km/s
                <span className="text-slate-500 text-[9px] ml-0.5">({speedLabel})</span>
              </span>
            )}
          </div>
        </div>

        {/* Probability column */}
        <div className="shrink-0 flex gap-2">
          <div className="text-center" title={`Pravděpodobnost zásahu Země: ${row.impactProb}%${row.arrivalTs ? '' : ' (odhad bez přesných dat)'}`}>
            <p className="text-[9px] text-slate-600 uppercase">Zásah Země</p>
            <p className="text-base font-bold tabular-nums" style={{ color: row.impactProb > 60 ? '#5bcc5b' : row.impactProb > 30 ? '#ffa500' : '#4a6080' }}>
              {row.impactProb}%
            </p>
          </div>
          <div className="text-center" title={`Šance na záři v ČR foťákem: ${row.horizonProb}% • okem: ${row.overheadProb}%`}>
            <p className="text-[9px] text-slate-600 uppercase">Záře v ČR</p>
            <p className="text-sm font-bold tabular-nums" style={{ color: row.horizonProb > 40 ? '#5bcc5b' : '#64748b' }}>
              {row.horizonProb}%
            </p>
          </div>
        </div>
      </div>

      {/* Transit progress bar: Sun ────────── Earth */}
      <div className="px-3.5 pb-2.5">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px]" title="Slunce">☀️</span>
          <div className="flex-1 h-2.5 rounded-full bg-white/4 border border-white/6 relative overflow-hidden">
            {/* Progress fill */}
            <div
              className="absolute inset-y-0 left-0 rounded-full transition-all duration-1000"
              style={{
                width: `${Math.max(row.travelProgress * 100, 2)}%`,
                background: isArrived
                  ? `linear-gradient(90deg, ${gc}60, ${gc})`
                  : `linear-gradient(90deg, ${gc}30, ${gc}90)`,
              }}
            />
            {/* CME head dot */}
            {!isArrived && (
              <div
                className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
                style={{
                  left: `calc(${Math.max(row.travelProgress * 100, 2)}% - 4px)`,
                  backgroundColor: gc,
                  boxShadow: `0 0 6px ${gc}80`,
                }}
              />
            )}
          </div>
          <span className="text-[10px]" title="Země">🌍</span>
        </div>

        {/* Time info below bar */}
        <div className="flex items-center justify-between mt-1">
          <span className="text-[9px] font-mono text-slate-500">
            <span className="text-slate-600">Na cestě:</span> {fmtHours(row.hoursElapsed)}
          </span>
          {row.hoursRemaining != null && !isArrived ? (
            <span
              className="text-[9px] font-mono font-bold"
              style={{ color: row.hoursRemaining < 6 ? '#ffa500' : '#48c7ff' }}
              title={row.arrivalTs
                ? `Odhadovaný dopad na Zemi: ${fmtCz(new Date(row.arrivalTs))} (±${(row.speed ?? 0) >= 700 ? '6' : '12'}h)`
                : `Odhad na základě rychlosti ${row.speed} km/s — přesnost nízká`}
            >
              <span className="text-slate-500 font-normal">Dorazí za:</span> ~{fmtHours(row.hoursRemaining)}
              {!row.arrivalTs && <span className="text-slate-600 ml-0.5" title="Odhad pouze z rychlosti, NASA analýza nedostupná">⚠️</span>}
            </span>
          ) : isArrived ? (
            <span className="text-[9px] font-mono font-bold text-aurora-green">
              ✓ Dorazilo k Zemi
            </span>
          ) : (
            <span className="text-[9px] font-mono text-slate-600" title="NASA DONKI nemá odhad příjezdu pro tento CME">
              Příjezd neurčen ⚠️
            </span>
          )}
        </div>

        {/* Arrival window */}
        {row.arrivalTs && !isArrived && (
          <p className="text-[9px] font-mono text-slate-500 mt-0.5" title="Časové okno dopadu na Zemi dle NASA DONKI modelu WSA-ENLIL (středoevropský čas)">
            <span className="text-slate-600">Okno dopadu:</span> {row.arrivalWindow}
          </p>
        )}
      </div>
    </div>
  )
}

/** Educational guide item */
function GuideItem({
  number, title, text, color,
}: {
  number: string
  title: string
  text: string
  color: string
}) {
  return (
    <div className="flex gap-3">
      <span className="text-base shrink-0 mt-px" style={{ color }}>{number}</span>
      <div>
        <p className="text-xs font-bold text-slate-200 mb-1">{title}</p>
        <p className="text-[11px] text-slate-400 leading-relaxed">{text}</p>
      </div>
    </div>
  )
}

/** Tech param cell (for collapsible section) */
function TechParam({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-[9px] text-slate-500 uppercase tracking-wider block">{label}</span>
      <span className="text-xs font-bold text-slate-300 tabular-nums">{value}</span>
    </div>
  )
}
