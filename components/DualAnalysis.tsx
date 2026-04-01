'use client'
// components/DualAnalysis.tsx — Unified aurora status: visibility + expert score + conditions checklist + live log
// Merges former DualAnalysis + AuroraChecklist into a single panel
import { useMemo, useEffect, useState, useRef } from 'react'
import type { CmeEvent, SolarWindPoint, ForecastDay } from '@/lib/noaa'
import { deriveVisibility, VISIBILITY_INFO } from '@/lib/noaa'
import type { VisibilityLevel } from '@/lib/noaa'
import { calculateExpertScore } from '@/lib/space-weather/expertScore'
import { getMoonInfo, getSunPosition } from '@/lib/astronomy'
import { HuskyLogo } from '@/components/HuskyLogo'
import clsx from 'clsx'

// ── Status log (localStorage, 48h) ─────────────────────────────────────────
interface StatusLogEntry {
  ts: number
  score: number
  label: string
  explanation: string
  vis: string
  source: 'l1' | 'earth'
  earthScore?: number
  earthVis?: string
}

const STATUS_LOG_KEY = 'auroradog_status_log'
const TWO_DAYS_MS = 2 * 24 * 3600_000

function loadStatusLog(): StatusLogEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STATUS_LOG_KEY)
    if (!raw) return []
    const entries: StatusLogEntry[] = JSON.parse(raw)
    const cutoff = Date.now() - TWO_DAYS_MS
    return entries.filter(e => e.ts >= cutoff)
  } catch { return [] }
}

function saveStatusLog(entries: StatusLogEntry[]) {
  try {
    const cutoff = Date.now() - TWO_DAYS_MS
    const trimmed = entries.filter(e => e.ts >= cutoff).slice(-100)
    localStorage.setItem(STATUS_LOG_KEY, JSON.stringify(trimmed))
  } catch {}
}

function fmtLogTime(ts: number): string {
  return new Date(ts).toLocaleString('cs-CZ', {
    timeZone: 'Europe/Prague',
    day: 'numeric', month: 'short',
    hour: '2-digit', minute: '2-digit',
  })
}

// ── Effective KP (mirrors deriveVisibility + contribution tracking) ─────────

interface KpContribution { label: string; value: number }

function computeEffectiveKp(
  kp: number, bz: number | null, swSpeed: number | null,
  hpi: number | null, hasCmeImpact: boolean,
): { effectiveKp: number; contributions: KpContribution[] } {
  // Conservative boosts — KP already integrates most effects.
  // Small nudges for real-time L1 data, capped at +1.5 total.
  const c: KpContribution[] = [{ label: 'KP', value: kp }]
  let boost = 0

  const h = hpi ?? 0
  if (h >= 150)      { const v = 0.5;  boost += v; c.push({ label: 'HPI', value: v }) }
  else if (h >= 100) { const v = 0.3;  boost += v; c.push({ label: 'HPI', value: v }) }
  else if (h >= 50)  { const v = 0.1;  boost += v; c.push({ label: 'HPI', value: v }) }

  const b = bz ?? 0
  if (b < -20)      { const v = 0.5;  boost += v; c.push({ label: 'Bz', value: v }) }
  else if (b < -10) { const v = 0.3;  boost += v; c.push({ label: 'Bz', value: v }) }
  else if (b < -5)  { const v = 0.15; boost += v; c.push({ label: 'Bz', value: v }) }
  if (b >= 5)       { const v = -3.0; boost += v; c.push({ label: 'Bz↑', value: v }) }
  else if (b > 2)   { const v = -2.0; boost += v; c.push({ label: 'Bz↑', value: v }) }
  else if (b > 0)   { const v = -0.5; boost += v; c.push({ label: 'Bz↑', value: v }) }

  if (hasCmeImpact)  { const v = 0.3; boost += v; c.push({ label: 'CME', value: v }) }

  const s = swSpeed ?? 0
  if (s > 700)      { const v = 0.3;  boost += v; c.push({ label: 'Vítr', value: v }) }
  else if (s > 500) { const v = 0.15; boost += v; c.push({ label: 'Vítr', value: v }) }

  const clampedBoost = boost >= 0 ? Math.min(boost, 1.5) : Math.max(boost, -4.0)
  let eff = kp + clampedBoost
  // Hard ceiling: solidly northward Bz = magnetosphere closed
  if (b >= 5) eff = Math.min(eff, 2.0)
  else if (b > 2) eff = Math.min(eff, 4.0)
  return { effectiveKp: eff, contributions: c }
}

// ── L1 → Earth delay ────────────────────────────────────────────────────────

function l1Delay(speed: number | null): number {
  return Math.round(1_500_000 / Math.max(speed ?? 400, 200) / 60)
}

function getEarthSolarWind(history: SolarWindPoint[], delayMin: number): SolarWindPoint | null {
  if (!history.length) return null
  const earthTime = Date.now() - delayMin * 60_000
  let best: SolarWindPoint | null = null
  let bestDiff = Infinity
  for (const p of history) {
    const diff = Math.abs(new Date(p.time_tag).getTime() - earthTime)
    if (diff < bestDiff) { bestDiff = diff; best = p }
  }
  return bestDiff < 30 * 60_000 ? best : null
}

// ── Helpers ─────────────────────────────────────────────────────────────────

type MStatus = 'green' | 'orange' | 'gray'

function sColor(s: MStatus) { return s === 'green' ? '#00ffaa' : s === 'orange' ? '#ffa500' : '#4a6080' }

const ALL_LEVELS: VisibilityLevel[] = ['none', 'photo_weak', 'photo_medium', 'photo_strong', 'eye_weak', 'eye_strong']

const LEVEL_EFF_KP: Record<VisibilityLevel, number> = {
  none: 0, photo_weak: 4.5, photo_medium: 6.0, photo_strong: 7.0, eye_weak: 7.5, eye_strong: 9.0,
}

// ── Checklist items ─────────────────────────────────────────────────────────

interface CheckItem {
  id: string; label: string; value: string
  met: boolean; partial: boolean
  note: string; advNote: string
  status: MStatus
}

function buildChecklist(
  kp: number, bz: number | null, swSpeed: number | null,
  swDensity: number | null, hpi: number | null, bzMinutes: number,
): CheckItem[] {
  const b = bz ?? 0, s = swSpeed ?? 0, d = swDensity ?? 0, h = hpi ?? 0
  return [
    {
      id: 'bz', label: 'Bz záporné', value: bz !== null ? `${b.toFixed(1)} nT` : '—',
      met: b < -5, partial: b < 0 && b >= -5,
      status: b < -5 ? 'green' : b < 0 ? 'orange' : 'gray',
      note: b < -5 ? 'Magnetosféra otevřená — vítr proniká.'
        : b < 0 ? 'Mírně záporné — potřeba pod −5 nT.'
        : b > 0 ? 'Kladné Bz — magnetosféra zamčená.' : '—',
      advNote: b < -5
        ? `Bz ${b.toFixed(1)} nT. Jižní IMF otevírá magnetopauzu. ${b < -10 ? 'Ideální pro 50°N.' : 'Dostačující pro foto.'}`
        : b < 0 ? `Bz ${b.toFixed(1)} nT. Pod −5 nT prahem pro efektivní reconnexe.`
        : b > 0 ? `Bz ${b.toFixed(1)} nT (severní). IMF nepropojuje — žádný transfer.` : 'Data nedostupná.',
    },
    {
      id: 'bzDur', label: 'Délka záporného Bz', value: bzMinutes > 0 ? `${bzMinutes} min` : '0 min',
      met: bzMinutes >= 30, partial: bzMinutes >= 10 && bzMinutes < 30,
      status: bzMinutes >= 30 ? 'green' : bzMinutes >= 10 ? 'orange' : 'gray',
      note: bzMinutes >= 30 ? `${bzMinutes} min — dobrá aktivace.`
        : bzMinutes >= 10 ? `${bzMinutes} min — rozbíhá se, 30+ min ideál.`
        : 'Nedostatečná doba. Potřebujeme 30+ min.',
      advNote: bzMinutes >= 30
        ? `Southward ${bzMinutes} min. Dostatečný energy loading pro substorm na 50°N.`
        : bzMinutes >= 10 ? `${bzMinutes} min. Potřeba 20–30 min pro substorm cycle na mid-latitudes.`
        : 'Min. 20–30 min jižního Bz potřeba pro energy loading.',
    },
    {
      id: 'speed', label: 'Rychlost větru', value: s > 0 ? `${Math.round(s)} km/s` : '—',
      met: s >= 500, partial: s >= 350 && s < 500,
      status: s >= 500 ? 'green' : s >= 350 ? 'orange' : 'gray',
      note: s >= 500 ? `${Math.round(s)} km/s — silný tlak.${s >= 700 ? ' Extrémní!' : ''}`
        : s >= 350 ? `${Math.round(s)} km/s — průměrný. 500+ km/s ideál.`
        : s > 0 ? `${Math.round(s)} km/s — slabý vítr.` : '—',
      advNote: s >= 500
        ? `Vsw ${Math.round(s)} km/s. Dyn. tlak ∝ ρ·v². ${s >= 700 ? 'CME sheath / CH HSS.' : 'Dobrá komprese.'}`
        : s >= 350 ? `Vsw ${Math.round(s)} km/s. Foto možné při Bz < −10 nT.`
        : s > 0 ? `Vsw ${Math.round(s)} km/s. Klidný vítr.` : 'Rychlost nedostupná.',
    },
    {
      id: 'density', label: 'Hustota protonů', value: d > 0 ? `${d.toFixed(1)} p/cm³` : '—',
      met: d >= 10, partial: d >= 5 && d < 10,
      status: d >= 10 ? 'green' : d >= 5 ? 'orange' : 'gray',
      note: d >= 10 ? `${d.toFixed(1)} p/cm³ — hustý.${d >= 20 ? ' Tlak. událost!' : ''}`
        : d >= 5 ? `${d.toFixed(1)} p/cm³ — normální.`
        : d > 0 ? `${d.toFixed(1)} p/cm³ — řídký.` : '—',
      advNote: d >= 10
        ? `n = ${d.toFixed(1)}. ${d >= 20 ? 'Density spike → komprese → substorm.' : 'Zvýšená interakce.'}`
        : d >= 5 ? `n = ${d.toFixed(1)}. Normální (3–8).`
        : d > 0 ? `n = ${d.toFixed(1)}. Řídký sluneční vítr.` : 'Hustota nedostupná.',
    },
    {
      id: 'hpi', label: 'Hemispheric Power', value: h > 0 ? `${Math.round(h)} GW` : '—',
      met: h >= 50, partial: h >= 20 && h < 50,
      status: h >= 50 ? 'green' : h >= 20 ? 'orange' : 'gray',
      note: h >= 50 ? `${Math.round(h)} GW — ovál se rozpíná.${h >= 100 ? ' Dosahuje 50°N!' : ''}`
        : h >= 20 ? `${Math.round(h)} GW — aktivita na severu.`
        : 'Pod 20 GW — klid.',
      advNote: h >= 50
        ? `HP(N) ${Math.round(h)} GW. ${h >= 100 ? 'Ovál na 55–50°N, vizuální záře reálná.' : 'Ovál v subpolárních šířkách.'}`
        : h >= 20 ? `HP(N) ${Math.round(h)} GW. KP 3–4, ovál 60–65°N.`
        : `HP(N) ${Math.round(h)} GW. Ovál u pólu (70°N+).`,
    },
    {
      id: 'kp', label: 'KP index', value: kp.toFixed(1),
      met: kp >= 5, partial: kp >= 4 && kp < 5,
      status: kp >= 5 ? 'green' : kp >= 4 ? 'orange' : 'gray',
      note: kp >= 5 ? `KP ${kp.toFixed(1)} — silná aktivita.${kp >= 7 ? ' Záře okem z tmavého místa!' : ' Foto šance!'}`
        : kp >= 4 ? `KP ${kp.toFixed(1)} — mírná. Pro ČR potřeba 5+ (foto) / 7+ (okem).`
        : `KP ${kp.toFixed(1)} — klidno.`,
      advNote: kp >= 5
        ? `KP ${kp.toFixed(1)}. ${kp >= 7 ? 'G3 bouře, záře okem 50°N.' : 'G1–G2, foto záře sev. horizont.'}`
        : kp >= 4 ? `KP ${kp.toFixed(1)}. Zvýšená aktivita, ovál na hranici 50°N.`
        : `KP ${kp.toFixed(1)}. Klid, ovál na polárních šířkách.`,
    },
  ]
}

// ── Combination guide ────────────────────────────────────────────────────────

const LEVEL_COMBOS: { level: VisibilityLevel; combos: string[] }[] = [
  { level: 'photo_weak', combos: [
    'KP 5 + astronomická tma',
    'KP 4 + Bz < −10 + vítr > 500',
    'KP 4 + HPI ≥ 100 GW + Bz < −5',
  ]},
  { level: 'photo_medium', combos: [
    'KP 6 + tma',
    'KP 5 + Bz < −10 + vítr > 500',
    'KP 5 + Bz < −10 + HPI ≥ 100',
  ]},
  { level: 'photo_strong', combos: [
    'KP 7 + tma',
    'KP 6 + Bz < −10 + vítr > 500',
    'KP 6 + Bz < −10 + HPI ≥ 100',
  ]},
  { level: 'eye_weak', combos: [
    'KP 8 + tma',
    'KP 7 + Bz < −10 + vítr > 500',
    'KP 7 + HPI ≥ 100 + Bz < −5',
  ]},
  { level: 'eye_strong', combos: [
    'KP 9+',
    'KP 8 + Bz < −10 + vítr > 500',
    'KP 8 + Bz < −15 + HPI ≥ 150',
  ]},
]

// ═══════════════════════════════════════════════════════════════════════════════

interface Props {
  kp: number
  bz: number | null
  swSpeed: number | null
  swDensity?: number | null
  hpiCurrent?: number | null
  dstCurrent?: number | null
  cme: CmeEvent[]
  swHistory?: SolarWindPoint[]
  forecast?: ForecastDay[]
  isAdvanced?: boolean
}

export function DualAnalysis({ kp, bz, swSpeed, swDensity, hpiCurrent, dstCurrent, cme, swHistory, isAdvanced = false }: Props) {
  const [view, setView] = useState<'l1' | 'earth'>('l1')
  const [showCombos, setShowCombos] = useState(false)
  const [logView, setLogView] = useState<'both' | 'l1' | 'earth'>('both')

  const history = swHistory ?? []
  const hasCmeImpact = cme?.some(c => c.earthImpact) ?? false
  const delayMin = l1Delay(swSpeed ?? null)

  const now = useMemo(() => new Date(), [])
  const moon = useMemo(() => getMoonInfo(now), [now])
  const sun = useMemo(() => getSunPosition(now, 50.08, 14.44), [now])

  const latestSw = history.length > 0 ? history[history.length - 1] : null
  const bt = latestSw?.bt ?? (bz != null ? Math.abs(bz) : null)

  const earthSw = useMemo(() => getEarthSolarWind(history, delayMin), [history, delayMin])

  const expert = useMemo(() => calculateExpertScore({
    kp, bz: bz ?? null, bt, swSpeed: swSpeed ?? null, swDensity: swDensity ?? null,
    solarWindHistory: history, hpiCurrent: hpiCurrent ?? null, dstCurrent: dstCurrent ?? null,
  }), [kp, bz, bt, swSpeed, swDensity, history, hpiCurrent, dstCurrent])

  // Earth-delayed expert score (what's actually happening at Earth now)
  const earthBt = earthSw?.bt ?? (earthSw?.bz != null ? Math.abs(earthSw.bz) : null)
  const earthExpert = useMemo(() => {
    if (!earthSw) return null
    const earthHistory = history.slice(0, Math.max(0, history.length - delayMin))
    return calculateExpertScore({
      kp, bz: earthSw.bz, bt: earthBt, swSpeed: earthSw.speed, swDensity: earthSw.density,
      solarWindHistory: earthHistory, hpiCurrent: hpiCurrent ?? null, dstCurrent: dstCurrent ?? null,
    })
  }, [kp, earthSw, earthBt, history, delayMin, hpiCurrent, dstCurrent])

  // Effective KP for each view
  const l1Eff = useMemo(
    () => computeEffectiveKp(kp, bz ?? null, swSpeed ?? null, hpiCurrent ?? null, hasCmeImpact),
    [kp, bz, swSpeed, hpiCurrent, hasCmeImpact],
  )
  const earthEff = useMemo(
    () => computeEffectiveKp(kp, earthSw?.bz ?? null, earthSw?.speed ?? null, hpiCurrent ?? null, hasCmeImpact),
    [kp, earthSw, hpiCurrent, hasCmeImpact],
  )
  const activeEff = view === 'l1' ? l1Eff : earthEff

  // Visibility for each view
  const l1Vis = deriveVisibility({
    kp, hpi: hpiCurrent, bz, swSpeed, hasCmeImpact,
    darkness: sun.darkness, moonIllumination: moon.illumination,
  })
  const earthVis = deriveVisibility({
    kp, hpi: hpiCurrent, bz: earthSw?.bz ?? null, swSpeed: earthSw?.speed ?? null,
    hasCmeImpact, darkness: sun.darkness, moonIllumination: moon.illumination,
  })
  const activeVis = view === 'l1' ? l1Vis : earthVis
  const visInfo = VISIBILITY_INFO[activeVis]
  const visIdx = ALL_LEVELS.indexOf(activeVis)

  // Checklist depends on view
  const checklist = useMemo(() => {
    if (view === 'l1') return buildChecklist(kp, bz ?? null, swSpeed ?? null, swDensity ?? null, hpiCurrent ?? null, expert.bzSouthMinutes)
    return buildChecklist(kp, earthSw?.bz ?? null, earthSw?.speed ?? null, earthSw?.density ?? null, hpiCurrent ?? null, expert.bzSouthMinutes)
  }, [view, kp, bz, swSpeed, swDensity, hpiCurrent, earthSw, expert])

  const metCount = checklist.filter(c => c.met).length
  const effKpPct = Math.min(activeEff.effectiveKp / 10, 1) * 100

  // ── Live status log ──
  const [statusLog, setStatusLog] = useState<StatusLogEntry[]>([])
  const lastLogKey = useRef<string>('')
  const logEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setStatusLog(loadStatusLog()) }, [])

  // Log only on meaningful change: visibility level or score bucket
  useEffect(() => {
    const scoreBucket = Math.floor(expert.score / 10) * 10
    const earthScoreBucket = earthExpert ? Math.floor(earthExpert.score / 10) * 10 : -1
    const key = `${l1Vis}|${scoreBucket}|${earthVis}|${earthScoreBucket}`
    if (key === lastLogKey.current) return
    lastLogKey.current = key

    const entry: StatusLogEntry = {
      ts: Date.now(),
      score: Math.round(expert.score),
      label: expert.label,
      explanation: expert.explanation,
      vis: VISIBILITY_INFO[l1Vis].label,
      source: 'l1',
      earthScore: earthExpert ? Math.round(earthExpert.score) : undefined,
      earthVis: VISIBILITY_INFO[earthVis].label,
    }
    setStatusLog(prev => {
      const updated = [...prev, entry]
      saveStatusLog(updated)
      return updated
    })
  }, [l1Vis, earthVis, expert.score, expert.label, expert.explanation, earthExpert])

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [statusLog.length])

  // ── Aurora narrative (left column) — basic: friendly / advanced: factual ──
  const auroraNarrative = useMemo(() => {
    const b = view === 'l1' ? (bz ?? 0) : (earthSw?.bz ?? 0)
    const s = view === 'l1' ? (swSpeed ?? 0) : (earthSw?.speed ?? 0)
    const bzMin = expert.bzSouthMinutes
    const h = hpiCurrent ?? 0
    const dst = dstCurrent ?? 0
    const adv = isAdvanced

    let now = ''
    let next = ''
    let forCz = ''

    // Dst recovers slowly (hours) — don't treat residual Dst as active storm
    // unless current conditions (KP or Bz) confirm ongoing activity
    const dstStorm = dst <= -50 && (kp >= 4 || b < -5)
    const stormActive = kp >= 5 || dstStorm
    const stormRecovery = dst <= -50 && !stormActive
    const moderateActivity = kp >= 4 || (b < -5 && bzMin >= 20)
    const lightActivity = kp >= 3 || b < -5
    const magnetosphereOpen = b < -5 && bzMin >= 10
    const magnetosphereLocked = b > 2

    if (stormRecovery) {
      // Dst still negative from earlier storm, but current conditions don't sustain it
      if (adv) {
        now = `Dst ${dst} nT — zotavování po bouři (KP ${kp.toFixed(1)}).`
        if (magnetosphereLocked)
          now += ` Bz kladné (${b.toFixed(1)} nT) — magnetosféra se uzavírá, přísun energie ustává.`
        else if (b < 0)
          now += ` Bz slabě záporné — reziduální aktivita může přetrvávat.`
        next = 'Dst se bude postupně vracet k normálu. Pokud Bz znovu klesne, aktivita může obnovit.'
        forCz = 'Hlavní fáze bouře skončila. Záře z ČR aktuálně nepravděpodobná, sledujte případný obrat Bz.'
      } else {
        now = 'Bouře odeznívá — magnetické pole Země se zklidňuje.'
        if (magnetosphereLocked)
          now += ' Podmínky na L1 už nepodporují další záři.'
        next = 'Záře může krátce oživit, pokud se změní orientace meziplanetárního pole. Situaci sledujte.'
        forCz = 'Záře z České republiky momentálně není očekávána.'
      }
    } else if (stormActive) {
      if (adv) {
        const gLabel = kp >= 8 ? 'extrémní' : kp >= 7 ? 'silná' : kp >= 6 ? 'významná' : 'střední'
        now = `Probíhá ${gLabel} geomagnetická bouře (KP ${kp.toFixed(1)}${dst <= -50 ? `, Dst ${dst} nT` : ''}).`
        if (h >= 100) now += ` HP(N) dosahuje ${Math.round(h)} GW — ovál expandoval k ~50°N.`
        else if (h >= 50) now += ` HP(N) ${Math.round(h)} GW — ovál se posouvá k nižším šířkám.`
        if (b < -10)
          next = `Bz ${b.toFixed(0)} nT (jižní ${bzMin} min) — magnetopauza otevřená, podmínky pro substorm přetrvávají. Intenzita může kolísat.`
        else if (b < -5)
          next = `Bz záporné (${b.toFixed(0)} nT) — aktivita pravděpodobně přetrvá. Nelze vyloučit další zesílení při dalším poklesu Bz.`
        else
          next = 'Bz se vrací k neutrálním hodnotám — intenzita záře pravděpodobně klesne, ale nelze vyloučit další pulzy aktivity.'
        forCz = kp >= 7
          ? 'Vizuální záře okem z ČR je za těchto podmínek pravděpodobná. Tmavé místo, severní horizont, daleko od města.'
          : 'Fotografická záře z tmavých lokalit ČR je reálná. Výsledek závisí na oblačnosti a světelném znečištění.'
      } else {
        now = kp >= 7
          ? 'Probíhá silná magnetická bouře a polární záře je viditelná na neobvykle nízkých zeměpisných šířkách.'
          : 'Magnetická bouře rozsvítila polární záři — pás záře se rozšiřuje směrem od pólu k nižším šířkám.'
        if (h >= 100) now += ' Záře aktuálně dosahuje zeměpisné šířky České republiky.'
        if (b < -5)
          next = 'Podmínky jsou příznivé a záře může přetrvávat ještě několik hodin.'
        else
          next = 'Bouře postupně slábne, ale stále může dojít k dalším zesílením.'
        forCz = kp >= 7
          ? 'Z tmavého místa s volným výhledem na sever je šance záři spatřit pouhým okem.'
          : 'Z tmavého místa bez světelného znečištění je reálná šance záři zachytit fotoaparátem (expozice 10–25 s, směr sever).'
      }
    } else if (moderateActivity) {
      if (adv) {
        now = `Zvýšená geomagnetická aktivita (KP ${kp.toFixed(1)}).`
        if (magnetosphereOpen)
          now += ` IMF Bz ${b.toFixed(0)} nT jižní orientace ${bzMin} min — reconnexe na magnetopauze probíhá.`
        if (h >= 50) now += ` HP(N) ${Math.round(h)} GW — ovál se rozšiřuje.`
        if (dst <= -30) now += ` Dst ${dst} nT indikuje probíhající ring current injection.`
        if (b < -5 && bzMin >= 30)
          next = 'Stabilní jižní Bz udržuje energy loading. Při nárůstu KP nad 5 se zvyšuje pravděpodobnost záře z ČR.'
        else if (b < -5)
          next = `Bz záporné ${bzMin} min — pro substorm na mid-latitudes je třeba 20–30 min. Sledujte KP a HP(N).`
        else
          next = 'Efektivita závisí na orientaci Bz. Při obratu do jižní stačí desítky minut k rozvoji aktivity.'
        forCz = kp >= 4
          ? 'Fotografická záře z tmavých lokalit ČR je za příznivých podmínek možná. Závisí na tmě a horizontu.'
          : 'Ovál zatím nedosahuje 50°N. Situace se může změnit při dalším poklesu Bz nebo nárůstu KP.'
      } else {
        now = 'Geomagnetická aktivita je zvýšená — sluneční vítr působí na magnetické pole Země silněji než obvykle.'
        if (magnetosphereOpen)
          now += ' Magnetické pole se otevřelo a nabité částice začínají pronikat do atmosféry.'
        if (b < -5 && bzMin >= 30)
          next = 'Podmínky se vyvíjejí příznivě. Pokud aktivita dále poroste, šance na záři z ČR se zvyšuje.'
        else
          next = 'Zatím nelze říct, zda to bude stačit na záři viditelnou z ČR. Situace se může změnit v řádu desítek minut.'
        forCz = kp >= 4
          ? 'Z tmavého místa s volným severním horizontem je možné záři zachytit fotoaparátem.'
          : 'Záře prozatím svítí na vyšších zeměpisných šířkách. Sledujte vývoj.'
      }
    } else if (lightActivity) {
      if (adv) {
        now = `Mírná aktivita (KP ${kp.toFixed(1)}).`
        if (b < -5) now += ` Bz ${b.toFixed(0)} nT — magnetosféra reaguje, ale aktivita je pod prahem pro 50°N.`
        else if (b < 0) now += ` Bz slabě záporné (${b.toFixed(1)} nT) — pod prahem −5 nT pro efektivní reconnexe.`
        if (h >= 20) now += ` HP(N) ${Math.round(h)} GW — ovál aktivní na vyšších šířkách.`
        next = 'Pro záři z ČR je třeba KP ≥ 5 nebo Bz pod −10 nT po dobu 30+ min. Aktuálně pod prahem.'
        forCz = 'Záře z ČR je za současných podmínek nepravděpodobná.'
      } else {
        now = 'Polární záře je aktivní na vyšších zeměpisných šířkách, ale prozatím slabá.'
        if (b < -5)
          now += ' Magnetické pole Země se lehce otevírá, ale aktivita zatím nestačí pro naše šířky.'
        next = 'Pro záři viditelnou z ČR by musela aktivita výrazně zesílit. Situace se ale může změnit.'
        forCz = 'Záře z České republiky zatím není očekávána.'
      }
    } else {
      if (adv) {
        if (magnetosphereLocked) {
          now = `Magnetosféra uzavřená — IMF Bz kladné (${b.toFixed(1)} nT). Žádný transfer energie.`
          next = 'Změna možná při obratu Bz. Sledujte L1 data.'
        } else {
          now = `Geomagnetické pole klidné (KP ${kp.toFixed(1)}).`
          if (h > 0) now += ` HP(N) ${Math.round(h)} GW — ovál v polárních oblastech.`
          next = 'Změna podmínek při dopadu CME nebo CIR/HSS.'
        }
        forCz = 'Záře z ČR aktuálně nereálná.'
      } else {
        if (magnetosphereLocked) {
          now = 'Magnetické pole Země je uzavřené a sluneční vítr po něm klouže bez účinku.'
          next = 'Polární záře může vzniknout, jakmile se změní orientace meziplanetárního pole. Sledujte vývoj.'
        } else {
          now = 'Geomagnetická aktivita je nízká. Polární záře svítí jen v blízkosti polárního kruhu.'
          next = 'Podmínky se mohou změnit při příchodu koronálního výronu nebo rychlého proudu slunečního větru.'
        }
        forCz = 'Polární záře z České republiky není aktuálně očekávána.'
      }
    }

    // ── Darkness override ──
    if (sun.darkness < 0.5 && forCz) {
      forCz = adv
        ? 'Den — viditelnost záře vyloučena. Podmínky přehodnoťte po astronomickém soumraku.'
        : 'Teď je světlo. Záři uvidíte jen za tmy — zkontrolujte podmínky po setmění.'
    }

    return { now, next, forCz }
  }, [view, kp, bz, earthSw, swSpeed, expert.bzSouthMinutes, hpiCurrent, dstCurrent, sun.darkness, isAdvanced])

  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(0,255,170,0.03) 0%, #04101e 30%, #04101e 70%, rgba(0,212,255,0.02) 100%)',
        borderColor: 'rgba(0,255,170,0.15)',
      }}
    >
      {/* ─── Header ─── */}
      <div className="flex items-center justify-between px-5 py-2 border-b border-emerald-500/10 bg-emerald-500/[0.04]">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_#4ade80] animate-pulse" />
          <span className="text-[10px] font-mono font-bold tracking-widest text-green-400 uppercase">Podmínky pro záři</span>
        </div>
        <div className="flex rounded-lg overflow-hidden border border-white/[0.08] text-[9px] font-mono">
          <button
            onClick={() => setView('l1')}
            className={clsx(
              'px-2.5 py-1 transition-all flex items-center gap-1',
              view === 'l1' ? 'bg-[#00d4ff]/15 text-[#00d4ff]' : 'text-slate-500 hover:text-slate-300',
            )}
          >
            📡 L1
            {view === 'l1' && <span className="text-[9px] opacity-70">~{delayMin}m</span>}
          </button>
          <button
            onClick={() => setView('earth')}
            className={clsx(
              'px-2.5 py-1 transition-all border-l border-white/[0.08] flex items-center gap-1',
              view === 'earth' ? 'bg-[#00ffaa]/10 text-[#00ffaa]' : 'text-slate-500 hover:text-slate-300',
            )}
          >
            🌍 Země
          </button>
        </div>
      </div>

      {/* ─── GO PHOTOGRAPH alert (top, prominent when active) ─── */}
      {/* Gate on expert score: don't show "go shoot" if expert says conditions are bad */}
      {earthVis !== 'none' && earthVis !== 'photo_weak' && sun.darkness >= 0.8 && (earthExpert?.score ?? expert.score) >= 15 && (() => {
        const eInfo = VISIBILITY_INFO[earthVis]
        const isEye = earthVis.startsWith('eye')
        return (
          <div
            className="mx-5 mt-3 px-4 py-3 rounded-xl border animate-pulse"
            style={{
              borderColor: eInfo.color + '60',
              background: `linear-gradient(135deg, ${eInfo.color}12, transparent 80%)`,
            }}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{isEye ? '👁️' : '📷'}</span>
              <span className="font-display font-black text-sm tracking-wide" style={{ color: eInfo.color }}>
                {isEye ? 'JDI VEN! Záře viditelná okem!' : 'JDI FOTIT! Záře zachytitelná kamerou!'}
              </span>
              <span className="ml-auto text-[10px] font-mono text-slate-400">
                Země: <span className="font-bold" style={{ color: eInfo.color }}>{eInfo.label}</span> · skóre {earthExpert?.score ?? '–'}
              </span>
            </div>
          </div>
        )
      })()}

      {/* ─── Main content: 3 column layout ─── */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-0">

        {/* LEFT: Visibility + Score + Effective KP */}
        <div className="p-5 pb-4">
          {/* Vis + gauge row */}
          <div className="flex items-start gap-5">
            {/* Visibility info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2.5 mb-2">
                <span className="text-3xl leading-none">{visInfo.icon}</span>
                <div>
                  <span className="font-display text-xl font-black tracking-wide leading-none block" style={{ color: visInfo.color }}>
                    {visInfo.label}
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded" style={{ color: visInfo.color, background: `${visInfo.color}12` }}>
                      KP {kp.toFixed(1)}
                    </span>
                    {expert.trend !== 'stable' && (
                      <span className={clsx(
                        'text-[10px] font-mono px-1.5 py-0.5 rounded',
                        expert.trend === 'falling' ? 'text-green-400 bg-green-500/8' : 'text-orange-400 bg-orange-500/8'
                      )}>
                        {expert.trend === 'falling' ? '↓ Bz zlepšení' : '↑ Bz zhoršení'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-slate-300/80 leading-snug mb-3">{visInfo.desc}</p>

              {/* Level dots */}
              <div className="flex items-center gap-2">
                {ALL_LEVELS.map((lvl, idx) => {
                  const li = VISIBILITY_INFO[lvl]
                  const active = idx <= visIdx && idx > 0
                  const current = lvl === activeVis
                  return (
                    <div key={lvl} className="flex flex-col items-center gap-0.5" title={li.label}>
                      <div
                        className="w-2.5 h-2.5 rounded-full transition-all duration-500"
                        style={{
                          backgroundColor: active || current ? li.color : '#1e293b',
                          border: `1.5px solid ${active || current ? li.color : '#334155'}`,
                          boxShadow: current ? `0 0 8px ${li.color}60` : 'none',
                          transform: current ? 'scale(1.3)' : 'scale(1)',
                        }}
                      />
                      {current && (
                        <span className="text-[9px] font-mono" style={{ color: li.color }}>●</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Score gauge */}
            <div className="flex flex-col items-center justify-center shrink-0">
              <div className="relative w-[72px] h-[72px]">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="6" />
                  <circle
                    cx="50" cy="50" r="42" fill="none"
                    stroke={expert.color}
                    strokeWidth="6" strokeLinecap="round"
                    strokeDasharray={`${expert.score * 2.64} 264`}
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-display text-xl font-black leading-none" style={{ color: expert.color }}>
                    {expert.score}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 mt-1.5">
                <HuskyLogo size={11} glow={false} />
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">Skóre</span>
              </div>
            </div>
          </div>

          {/* L1 vs Earth comparison */}
          {l1Vis !== earthVis && (
            <div className="mt-3">
              <div className="text-[9px] font-mono px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.05] inline-flex items-center gap-1.5">
                <span className="text-slate-500">🌍 Země:</span>
                <span className="font-bold" style={{ color: VISIBILITY_INFO[earthVis].color }}>{VISIBILITY_INFO[earthVis].label}</span>
                <span className="text-slate-600 mx-0.5">→</span>
                <span className="text-slate-500">📡 L1 (za ~{delayMin} min):</span>
                <span className="font-bold" style={{ color: VISIBILITY_INFO[l1Vis].color }}>{VISIBILITY_INFO[l1Vis].label}</span>
              </div>
            </div>
          )}

          {/* Effective KP bar */}
          <div className="mt-3 rounded-xl bg-white/[0.02] border border-white/[0.05] p-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">Efektivní KP</span>
              <span className="text-sm font-display font-black" style={{ color: visInfo.color }}>
                {activeEff.effectiveKp.toFixed(1)}
              </span>
            </div>
            <div className="relative h-2.5 bg-white/[0.04] rounded-full mb-2">
              <div
                className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
                style={{
                  width: `${effKpPct}%`,
                  background: `linear-gradient(90deg, #334155, ${visInfo.color})`,
                  boxShadow: `0 0 8px ${visInfo.color}40`,
                }}
              />
              {[3.5, 4.5, 5.5, 6.5, 8.0].map(t => (
                <div key={t} className="absolute top-0 bottom-0 w-px bg-white/15" style={{ left: `${(t / 10) * 100}%` }} />
              ))}
            </div>
            {activeEff.contributions.length > 1 && (
              <div className="flex flex-wrap gap-1">
                {activeEff.contributions.map((c, i) => (
                  <span key={i} className="text-[9px] font-mono px-1.5 py-0.5 rounded" style={{
                    backgroundColor: c.value > 0 ? 'rgba(0,255,170,0.08)' : c.value < 0 ? 'rgba(255,61,154,0.08)' : 'rgba(255,255,255,0.04)',
                    color: c.value > 0 ? '#00ffaa' : c.value < 0 ? '#ff3d9a' : '#64748b',
                  }}>
                    {c.label} {c.value >= 0 ? '+' : ''}{c.value.toFixed(1)}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Aurora situation narrative */}
          <div className="mt-3">
            <p className="text-xs leading-relaxed text-slate-200">{auroraNarrative.now}</p>
            <p className="text-[11px] leading-relaxed text-slate-400 mt-1">{auroraNarrative.next}</p>
            {auroraNarrative.forCz && (
              <p className="text-[11px] leading-relaxed text-aurora-green/80 font-semibold mt-1">{auroraNarrative.forCz}</p>
            )}
          </div>
        </div>

        {/* DIVIDER */}
        <div className="hidden md:block w-px bg-gradient-to-b from-transparent via-white/[0.08] to-transparent my-4" />

        {/* RIGHT: Checklist + expert explanation */}
        <div className="p-5 pb-4 border-t md:border-t-0 border-white/[0.05]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-[2px]">🎯 Checklist podmínek</span>
            <span
              className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: metCount >= 5 ? 'rgba(0,255,170,0.12)' : metCount >= 3 ? 'rgba(255,165,0,0.12)' : 'rgba(100,116,139,0.1)',
                color: metCount >= 5 ? '#00ffaa' : metCount >= 3 ? '#ffa500' : '#64748b',
              }}
            >
              {metCount}/{checklist.length}
            </span>
          </div>
          <div className="space-y-2">
            {checklist.map(item => (
              <div key={item.id} className="flex items-start gap-2.5 group">
                <div
                  className="w-4 h-4 rounded-full border-[1.5px] flex items-center justify-center shrink-0 mt-0.5 transition-all duration-500"
                  style={{
                    borderColor: item.met ? '#00ffaa' : item.partial ? '#ffa500' : '#334155',
                    backgroundColor: item.met ? 'rgba(0,255,170,0.15)' : 'transparent',
                    boxShadow: item.met ? '0 0 6px rgba(0,255,170,0.3)' : 'none',
                  }}
                >
                  {item.met && (
                    <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5L4.5 7.5L8 3" stroke="#00ffaa" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                  {item.partial && !item.met && <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-slate-300">{item.label}</span>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded" style={{
                      backgroundColor: item.met ? 'rgba(0,255,170,0.1)' : item.partial ? 'rgba(255,165,0,0.08)' : 'rgba(100,116,139,0.08)',
                      color: sColor(item.status),
                    }}>
                      {item.value}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-snug mt-0.5">
                    {isAdvanced ? item.advNote : item.note}
                  </p>
                </div>
              </div>
            ))}
          </div>


        </div>
      </div>

      {/* ─── Combination guide (full width, expandable) ─── */}
      <div className="px-5 border-t border-white/[0.04]">
        <button
          onClick={() => setShowCombos(!showCombos)}
          className="w-full text-[9px] font-mono text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-2 py-2.5"
        >
          <span className="flex-1 h-px bg-white/[0.04]" />
          {showCombos ? '▾' : '▸'} Jaké kombinace stačí na záři?
          <span className="flex-1 h-px bg-white/[0.04]" />
        </button>
        {showCombos && (
          <div className="pb-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
            {LEVEL_COMBOS.map(lc => {
              const info = VISIBILITY_INFO[lc.level]
              const threshold = LEVEL_EFF_KP[lc.level]
              const reached = activeEff.effectiveKp >= threshold
              return (
                <div key={lc.level} className="rounded-lg p-2.5 transition-all" style={{
                  background: reached ? `${info.color}08` : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${reached ? info.color + '25' : 'rgba(255,255,255,0.04)'}`,
                }}>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="text-sm">{info.icon}</span>
                    <span className="text-[10px] font-bold" style={{ color: reached ? info.color : '#64748b' }}>{info.label}</span>
                  </div>
                  <div className="space-y-0.5">
                    {lc.combos.map((combo, i) => (
                      <div key={i} className="text-[9px] text-slate-500 flex items-start gap-1">
                        <span className="text-slate-600 shrink-0">•</span>
                        <span>{combo}</span>
                      </div>
                    ))}
                  </div>
                  <span className="text-[9px] font-mono text-slate-600 mt-1 block">ef.KP ≥ {threshold}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ─── Live log (48h) ─── */}
      {statusLog.length > 0 && (
        <div className="border-t border-white/[0.05]">
          <div className="px-5 pt-2.5 pb-1.5 flex items-center justify-between">
            <span className="text-[9px] font-mono tracking-[2px] text-slate-500 uppercase">📋 Vývoj situace (48h)</span>
            <div className="flex rounded-lg overflow-hidden border border-white/[0.08] text-[9px] font-mono">
              <button
                onClick={() => setLogView('both')}
                className={clsx('px-2 py-0.5', logView === 'both' ? 'bg-white/10 text-slate-200' : 'text-slate-500')}
              >Oba</button>
              <button
                onClick={() => setLogView('l1')}
                className={clsx('px-2 py-0.5 border-l border-white/[0.08]', logView === 'l1' ? 'bg-[#00d4ff]/15 text-[#00d4ff]' : 'text-slate-500')}
              >📡 L1</button>
              <button
                onClick={() => setLogView('earth')}
                className={clsx('px-2 py-0.5 border-l border-white/[0.08]', logView === 'earth' ? 'bg-[#00ffaa]/10 text-[#00ffaa]' : 'text-slate-500')}
              >🌍 Země</button>
            </div>
          </div>
          <div className="max-h-[180px] overflow-y-auto px-5 pb-3 scrollbar-thin">
            {statusLog.slice(-50).map((entry, i, arr) => {
              const showL1 = logView === 'both' || logView === 'l1'
              const showEarth = (logView === 'both' || logView === 'earth') && entry.earthScore != null
              if (!showL1 && !showEarth) return null
              const isCurrent = i === arr.length - 1
              const isRecent = i >= arr.length - 4 && !isCurrent
              // Detect important changes vs previous entry
              const prev = i > 0 ? arr[i - 1] : null
              const scoreDelta = prev ? entry.score - prev.score : 0
              const visChanged = prev ? entry.vis !== prev.vis : false
              const hasImportantChange = isRecent && (Math.abs(scoreDelta) >= 10 || visChanged)
              return (
                <div
                  key={`${entry.ts}-${i}`}
                  className={clsx(
                    'flex gap-3 py-1 border-b last:border-0',
                    isCurrent
                      ? 'border-aurora-teal/20 bg-aurora-teal/[0.04] rounded -mx-2 px-2 py-1.5'
                      : 'border-white/[0.03]'
                  )}
                >
                  <span className={clsx('text-[9px] font-mono shrink-0 w-[82px]', isCurrent ? 'text-aurora-teal' : 'text-slate-500')}>
                    {isCurrent ? '▶ ' : ''}{fmtLogTime(entry.ts)}
                  </span>
                  <div className="min-w-0 flex-1 flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-4">
                    {showL1 && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] text-[#00d4ff]/60 font-mono">📡</span>
                        <span className={clsx('text-[10px] font-mono font-bold w-5 text-right', isCurrent && 'text-[11px]')} style={{ color: entry.score >= 40 ? '#ffa500' : entry.score >= 25 ? '#48c7ff' : '#4a6080' }}>
                          {entry.score}
                        </span>
                        <span className={clsx('text-[9px]', isCurrent ? 'text-slate-200 font-semibold' : 'text-slate-400')}>{entry.vis}</span>
                        {hasImportantChange && scoreDelta !== 0 && (
                          <span className={clsx('text-[9px] font-mono font-bold', scoreDelta > 0 ? 'text-aurora-green' : 'text-slate-500')}>
                            {scoreDelta > 0 ? `+${scoreDelta}` : scoreDelta}
                          </span>
                        )}
                      </div>
                    )}
                    {showEarth && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] text-[#00ffaa]/60 font-mono">🌍</span>
                        <span className={clsx('text-[10px] font-mono font-bold w-5 text-right', isCurrent && 'text-[11px]')} style={{ color: (entry.earthScore ?? 0) >= 40 ? '#ffa500' : (entry.earthScore ?? 0) >= 25 ? '#48c7ff' : '#4a6080' }}>
                          {entry.earthScore}
                        </span>
                        <span className={clsx('text-[9px]', isCurrent ? 'text-slate-200 font-semibold' : 'text-slate-400')}>{entry.earthVis}</span>
                      </div>
                    )}
                    <p className={clsx(
                      'leading-tight flex-1',
                      isCurrent
                        ? 'text-[10px] text-slate-200'
                        : hasImportantChange
                          ? 'text-[9px] text-slate-300 font-medium'
                          : 'text-[9px] text-slate-500 truncate'
                    )}>
                      {entry.explanation}
                    </p>
                  </div>
                </div>
              )
            })}
            <div ref={logEndRef} />
          </div>
        </div>
      )}
    </div>
  )
}
