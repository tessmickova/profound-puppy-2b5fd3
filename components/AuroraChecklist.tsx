'use client'
// components/AuroraChecklist.tsx — Expert aurora conditions panel with L1/Earth toggle
// Two-column layout: big metric numbers + visibility outcome & checklist
// Toggle between L1 probe (future) and Earth (current) data views
import { useMemo, useState } from 'react'
import { calculateExpertScore } from '@/lib/space-weather/expertScore'
import type { ExpertScoreResult } from '@/lib/space-weather/expertScore'
import { deriveVisibility, VISIBILITY_INFO } from '@/lib/noaa'
import type { VisibilityLevel, SolarWindPoint, CmeEvent } from '@/lib/noaa'
import { getMoonInfo, getSunPosition } from '@/lib/astronomy'
import clsx from 'clsx'

interface Props {
  kp: number
  bz?: number | null
  swSpeed?: number | null
  swDensity?: number | null
  hpiCurrent?: number | null
  cme?: CmeEvent[]
  swHistory?: SolarWindPoint[]
  isAdvanced?: boolean
}

// ── Effective KP (mirrors deriveVisibility exactly) + contribution tracking ──

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

// ── L1 → Earth delay ─────────────────────────────────────────────────────────

function l1Delay(speed: number | null): number {
  return Math.round(1_500_000 / Math.max(speed ?? 400, 200) / 60)
}

// ── Find delayed solar wind (what's at Earth now, from L1 history) ───────────
// L1 data has travel time to Earth. To see what's AT Earth now, we look back
// in history by the delay amount. E.g. at 500 km/s, delay ~50 min,
// so data measured 50 min ago at L1 ≈ what's impacting Earth right now.

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

// ── Helpers ──────────────────────────────────────────────────────────────────

type MStatus = 'green' | 'orange' | 'gray'

function sColor(s: MStatus) { return s === 'green' ? '#00ffaa' : s === 'orange' ? '#ffa500' : '#4a6080' }
function sBg(s: MStatus) { return s === 'green' ? 'rgba(0,255,170,0.08)' : s === 'orange' ? 'rgba(255,165,0,0.06)' : 'rgba(255,255,255,0.02)' }

const ALL_LEVELS: VisibilityLevel[] = ['none', 'photo_weak', 'photo_medium', 'photo_strong', 'eye_weak', 'eye_strong']

const LEVEL_EFF_KP: Record<VisibilityLevel, number> = {
  none: 0, photo_weak: 3.5, photo_medium: 4.5, photo_strong: 5.5, eye_weak: 6.5, eye_strong: 8.0,
}

// ── Combination guide ────────────────────────────────────────────────────────

const LEVEL_COMBOS: { level: VisibilityLevel; combos: string[] }[] = [
  { level: 'photo_weak', combos: [
    'KP 4 + astronomická tma',
    'KP 3 + Bz < −5 nT',
    'KP 3 + vítr > 500 km/s',
    'KP 2 + Bz < −10 + vítr > 500',
    'KP 3 + HPI ≥ 50 GW',
  ]},
  { level: 'photo_medium', combos: [
    'KP 5 + tma',
    'KP 4 + Bz < −5 nT',
    'KP 4 + vítr > 500 km/s',
    'KP 3 + Bz < −10 + vítr > 500',
    'KP 3 + Bz < −10 + HPI ≥ 50',
  ]},
  { level: 'photo_strong', combos: [
    'KP 6 + tma',
    'KP 5 + Bz < −5 nT',
    'KP 4 + Bz < −10 + vítr > 500',
    'KP 4 + Bz < −15 nT',
    'KP 3 + Bz < −15 + vítr > 500 + HPI ≥ 50',
  ]},
  { level: 'eye_weak', combos: [
    'KP 7 + tma',
    'KP 6 + Bz < −5 nT',
    'KP 5 + Bz < −15 nT',
    'KP 5 + Bz < −10 + vítr > 500',
    'KP 4 + Bz < −15 + vítr > 700 + HPI ≥ 50',
  ]},
  { level: 'eye_strong', combos: [
    'KP 8+',
    'KP 7 + Bz < −10 nT',
    'KP 6 + Bz < −15 + vítr > 500',
    'KP 5 + Bz < −15 + vítr > 700 + HPI ≥ 100',
  ]},
]

// ── Compact checklist items ──────────────────────────────────────────────────

interface CheckItem {
  id: string; label: string; value: string
  met: boolean; partial: boolean
  note: string; advNote: string
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
      note: bzMinutes >= 30 ? `${bzMinutes} min — dobrá aktivace.`
        : bzMinutes >= 10 ? `${bzMinutes} min — rozbíhá se, 30+ min ideál.`
        : 'Nedostatečná doba. Potřebujeme 30+ min.',
      advNote: bzMinutes >= 30
        ? `Southward ${bzMinutes} min (gap < 5 min tolerováno). Dostatečný energy loading pro substorm na 50°N.`
        : bzMinutes >= 10 ? `${bzMinutes} min. Potřeba 20–30 min pro substorm cycle na mid-latitudes.`
        : 'Min. 20–30 min jižního Bz potřeba pro energy loading. Mezery < 5 min tolerovatelné.',
    },
    {
      id: 'speed', label: 'Rychlost větru', value: s > 0 ? `${Math.round(s)} km/s` : '—',
      met: s >= 500, partial: s >= 350 && s < 500,
      note: s >= 500 ? `${Math.round(s)} km/s — silný tlak.${s >= 700 ? ' Extrémní!' : ''}`
        : s >= 350 ? `${Math.round(s)} km/s — průměrný. 500+ km/s ideál.`
        : s > 0 ? `${Math.round(s)} km/s — slabý vítr.` : '—',
      advNote: s >= 500
        ? `Vsw ${Math.round(s)} km/s. Dyn. tlak ∝ ρ·v². ${s >= 700 ? 'CME sheath / CH HSS.' : 'Dobrá komprese.'} Foto i při 400 km/s + Bz < −10.`
        : s >= 350 ? `Vsw ${Math.round(s)} km/s. Foto možné při Bz < −10 nT. Vizuální vyžaduje 500+.`
        : s > 0 ? `Vsw ${Math.round(s)} km/s. Klidný vítr, nízký dynamický tlak.` : 'Rychlost nedostupná.',
    },
    {
      id: 'density', label: 'Hustota protonů', value: d > 0 ? `${d.toFixed(1)} p/cm³` : '—',
      met: d >= 10, partial: d >= 5 && d < 10,
      note: d >= 10 ? `${d.toFixed(1)} p/cm³ — hustý.${d >= 20 ? ' Tlak. událost!' : ''}`
        : d >= 5 ? `${d.toFixed(1)} p/cm³ — normální.`
        : d > 0 ? `${d.toFixed(1)} p/cm³ — řídký.` : '—',
      advNote: d >= 10
        ? `n = ${d.toFixed(1)}. ${d >= 20 ? 'Density spike → komprese → substorm.' : 'Zvýšená interakce.'} Kritický součin: Bz × ρ × v².`
        : d >= 5 ? `n = ${d.toFixed(1)}. Normální (3–8). Násobitel, ne rozhodující faktor.`
        : d > 0 ? `n = ${d.toFixed(1)}. Řídký sluneční vítr.` : 'Hustota nedostupná.',
    },
    {
      id: 'hpi', label: 'Hemispheric Power', value: h > 0 ? `${Math.round(h)} GW` : '—',
      met: h >= 50, partial: h >= 20 && h < 50,
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
      met: kp >= 5, partial: kp >= 3 && kp < 5,
      note: kp >= 5 ? `KP ${kp.toFixed(1)} — silná aktivita.${kp >= 7 ? ' I z města!' : ' Okem z tmavého místa.'}`
        : kp >= 3 ? `KP ${kp.toFixed(1)} — mírná. Pro ČR potřeba 5+ (okem) / 4+ (foto).`
        : `KP ${kp.toFixed(1)} — klidno.`,
      advNote: kp >= 5
        ? `KP ${kp.toFixed(1)}. ${kp >= 7 ? 'G3 bouře, ovál 50°N.' : 'G1–G2, záře sev. horizont.'} 3h integrovaný index — Bz a vítr ukazují kam poroste.`
        : kp >= 3 ? `KP ${kp.toFixed(1)}. Zvýšená aktivita, ovál nedosahuje 50°N. Foto při KP 4 z Bortle ≤ 4.`
        : `KP ${kp.toFixed(1)}. Klid, ovál na polárních šířkách.`,
    },
  ]
}

// ── Narrative ────────────────────────────────────────────────────────────────

function generateNarrative(
  kp: number, bz: number | null, swSpeed: number | null, hpi: number | null,
  expert: ExpertScoreResult, isAdvanced: boolean, delayMin: number,
  earthBz: number | null,
): string {
  const score = expert.score
  const bzVal = bz ?? 0
  const eBz = earthBz ?? bzVal
  const now = new Date()
  const hour = parseInt(now.toLocaleTimeString('cs-CZ', { timeZone: 'Europe/Prague', hour: '2-digit', hour12: false }))
  const sun = getSunPosition(now, 50.08, 14.44)
  const isDark = sun.darkness >= 0.8
  const isEvening = hour >= 17 && hour < 22
  const isNight = hour >= 22 || hour < 5
  const isMorning = hour >= 5 && hour < 10

  let time: string
  if (isDark && isNight) time = 'Je noc a tma — ideální okno pro pozorování.'
  else if (isDark && isEvening) time = 'Nastala astronomická tma — pozorování je možné.'
  else if (isEvening) time = 'Blíží se večer — čekejte na úplnou tmu.'
  else if (isMorning) time = 'Je ráno — okno pro pozorování se zavírá.'
  else time = 'Je den — záři nyní nelze pozorovat. Sledujte vývoj pro dnešní noc.'

  const geo = 'Záře přichází od severu — nejdříve Krkonoše, Jizerky a tmavá místa (Šumava, Brdy). Střed a jih ČR potřebují o stupeň silnější aktivitu.'

  const l1Improving = bzVal < eBz - 2
  const l1Worsening = bzVal > eBz + 2

  if (isAdvanced) {
    const p: string[] = [time]
    if (score >= 60) {
      p.push(`Expertní skóre ${score.toFixed(0)}/100 — vysoká pravděpodobnost záře nad ČR. ${expert.explanation}`)
      p.push(geo)
      p.push('Vyrazte na tmavé místo s volným severním horizontem.')
    } else if (score >= 35) {
      p.push(`Expertní skóre ${score.toFixed(0)}/100 — střední šance. ${expert.explanation}`)
      p.push(geo)
      p.push('Situace se může rychle změnit — sledujte L1 data.')
    } else if (score >= 15) {
      p.push(`Expertní skóre ${score.toFixed(0)}/100 — malá šance. ${expert.explanation}`)
      if (expert.trend === 'falling') p.push('Trend: Bz klesá — podmínky se mohou zlepšit.')
      else p.push('Pro záři na 50°N chybí klíčové faktory.')
    } else {
      p.push(`Expertní skóre ${score.toFixed(0)}/100 — nepravděpodobná. ${expert.explanation}`)
      p.push('Bez příjezdu CME nebo obratu Bz se nezmění.')
    }
    if (l1Improving) p.push(`L1 ukazuje zlepšení — silnější záporné Bz dorazí na Zemi za ~${delayMin} min.`)
    else if (l1Worsening) p.push(`L1 indikuje zhoršení — Bz se otáčí k severu. Dopad za ~${delayMin} min.`)
    p.push(`Zpoždění L1 → Země: ~${delayMin} min.`)
    return p.join(' ')
  }

  if (score >= 60) {
    return `${time} Šance na polární záři je poměrně vysoká! ${bzVal < -8 ? 'Magnetické pole je otočené správně' : 'Podmínky jsou příznivé'}. ${isDark ? 'Vyrazte ven — z tmavého místa koukejte na sever.' : 'Až se setmí, sledujte severní obzor.'} ${l1Improving ? `Na L1 sondě se navíc ukazuje zlepšení — za ~${delayMin} min dorazí. ` : ''}${geo}`
  }
  if (score >= 35) {
    return `${time} Je střední šance na záři. ${bzVal < -5 ? 'Magnetické pole je nakloněné správně, ale' : 'Podmínky se vyvíjejí, ale'} pro jistotu potřebujeme víc. ${isDark ? 'Foťte severní obzor — kamera zachytí víc než oko.' : 'Sledujte vývoj.'} ${l1Improving ? `Dobrá zpráva: L1 ukazuje zlepšení, dorazí za ~${delayMin} min. ` : ''}${geo}`
  }
  if (score >= 15) {
    return `${time} Šance je malá, ale ne nulová. ${l1Improving ? `L1 ukazuje zlepšení — za ~${delayMin} min by se podmínky mohly zlepšit.` : expert.trend === 'falling' ? 'Podmínky se mohou zlepšit.' : 'Chybí hlavní ingredience.'} ${geo}`
  }
  return `${time} Záře nad Českem je nepravděpodobná. Magnetosféra je v klidu. ${geo} Změnit to může příjezd CME nebo obrat magnetického pole.`
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export function AuroraChecklist({ kp, bz, swSpeed, swDensity, hpiCurrent, cme, swHistory, isAdvanced = false }: Props) {
  const [view, setView] = useState<'l1' | 'earth'>('l1')
  const [showCombos, setShowCombos] = useState(false)

  const history = swHistory ?? []
  const hasCmeImpact = cme?.some(c => c.earthImpact) ?? false
  const latestSw = history.length > 0 ? history[history.length - 1] : null
  const bt = latestSw?.bt ?? (bz != null ? Math.abs(bz) : null)
  const delayMin = l1Delay(swSpeed ?? null)

  const earthSw = useMemo(() => getEarthSolarWind(history, delayMin), [history, delayMin])

  const expert = useMemo(() => calculateExpertScore({
    kp, bz: bz ?? null, bt, swSpeed: swSpeed ?? null, swDensity: swDensity ?? null,
    solarWindHistory: history,
  }), [kp, bz, bt, swSpeed, swDensity, history])

  const now = useMemo(() => new Date(), [])
  const moon = useMemo(() => getMoonInfo(now), [now])
  const sun = useMemo(() => getSunPosition(now, 50.08, 14.44), [now])

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

  const narrative = useMemo(
    () => generateNarrative(kp, bz ?? null, swSpeed ?? null, hpiCurrent ?? null, expert, isAdvanced, delayMin, earthSw?.bz ?? null),
    [kp, bz, swSpeed, hpiCurrent, expert, isAdvanced, delayMin, earthSw],
  )

  const metCount = checklist.filter(c => c.met).length
  const effKpPct = Math.min(activeEff.effectiveKp / 10, 1) * 100

  // ── Metric card definitions ──

  type MCard = { id: string; label: string; value: string; unit: string; status: MStatus; sub?: string }

  const l1Metrics: MCard[] = [
    { id: 'bz', label: 'Bz', value: bz != null ? bz.toFixed(1) : '—', unit: 'nT',
      status: (bz ?? 0) < -5 ? 'green' : (bz ?? 0) < 0 ? 'orange' : 'gray',
      sub: (bz ?? 0) < 0 ? 'jižní ✓' : 'severní ✗' },
    { id: 'bt', label: 'Bt', value: bt != null ? bt.toFixed(1) : '—', unit: 'nT',
      status: (bt ?? 0) > 10 ? 'green' : (bt ?? 0) > 5 ? 'orange' : 'gray' },
    { id: 'speed', label: 'Vítr', value: swSpeed != null ? Math.round(swSpeed).toString() : '—', unit: 'km/s',
      status: (swSpeed ?? 0) >= 500 ? 'green' : (swSpeed ?? 0) >= 350 ? 'orange' : 'gray' },
    { id: 'density', label: 'Hustota', value: swDensity != null ? swDensity.toFixed(1) : '—', unit: 'p/cm³',
      status: (swDensity ?? 0) >= 10 ? 'green' : (swDensity ?? 0) >= 5 ? 'orange' : 'gray' },
    { id: 'hpi', label: 'HPI', value: hpiCurrent != null ? Math.round(hpiCurrent).toString() : '—', unit: 'GW',
      status: (hpiCurrent ?? 0) >= 50 ? 'green' : (hpiCurrent ?? 0) >= 20 ? 'orange' : 'gray' },
    { id: 'delay', label: '⏱ Dopad', value: `~${delayMin}`, unit: 'min',
      status: 'gray', sub: 'L1 → Země' },
  ]

  const earthMetrics: MCard[] = [
    { id: 'kp', label: 'KP', value: kp.toFixed(1), unit: '',
      status: kp >= 5 ? 'green' : kp >= 3 ? 'orange' : 'gray',
      sub: kp >= 5 ? 'bouře' : kp >= 3 ? 'zvýšený' : 'klid' },
    { id: 'hpi', label: 'HPI', value: hpiCurrent != null ? Math.round(hpiCurrent).toString() : '—', unit: 'GW',
      status: (hpiCurrent ?? 0) >= 50 ? 'green' : (hpiCurrent ?? 0) >= 20 ? 'orange' : 'gray' },
    { id: 'ebz', label: 'Bz (Země)', value: earthSw ? earthSw.bz.toFixed(1) : '—', unit: 'nT',
      status: (earthSw?.bz ?? 0) < -5 ? 'green' : (earthSw?.bz ?? 0) < 0 ? 'orange' : 'gray' },
    { id: 'espeed', label: 'Vítr (Země)', value: earthSw ? Math.round(earthSw.speed).toString() : '—', unit: 'km/s',
      status: (earthSw?.speed ?? 0) >= 500 ? 'green' : (earthSw?.speed ?? 0) >= 350 ? 'orange' : 'gray' },
    { id: 'dark', label: 'Tma', value: sun.darkness >= 0.8 ? '✓' : sun.darkness >= 0.3 ? '◐' : '☀',
      unit: sun.darkness >= 0.8 ? 'tma' : sun.darkness >= 0.3 ? 'soumrak' : 'den',
      status: sun.darkness >= 0.8 ? 'green' : sun.darkness >= 0.3 ? 'orange' : 'gray' },
    { id: 'moon', label: 'Měsíc', value: `${Math.round(moon.illumination * 100)}`, unit: '%',
      status: moon.illumination <= 0.3 ? 'green' : moon.illumination <= 0.6 ? 'orange' : 'gray',
      sub: moon.illumination <= 0.3 ? 'neruší' : moon.illumination <= 0.6 ? 'mírný' : 'ruší' },
  ]

  const metrics = view === 'l1' ? l1Metrics : earthMetrics

  // ═══ RENDER ═══════════════════════════════════════════════════════════════

  return (
    <div className="bg-[#04101e]/90 border border-white/8 rounded-2xl overflow-hidden">
      {/* ─── Header + Toggle ─── */}
      <div className="px-4 pt-4 pb-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="text-xs font-mono tracking-[2px] text-slate-500 uppercase flex items-center gap-2">
          🎯 Podmínky pro záři nad ČR
        </div>
        <div className="flex rounded-lg overflow-hidden border border-white/8 text-[10px] font-mono">
          <button
            onClick={() => setView('l1')}
            className={clsx(
              'px-3 py-1.5 transition-all flex items-center gap-1',
              view === 'l1' ? 'bg-aurora-teal/15 text-aurora-teal' : 'text-slate-500 hover:text-slate-300',
            )}
          >
            📡 L1 sonda
            {view === 'l1' && <span className="text-[9px] opacity-70">~{delayMin} min</span>}
          </button>
          <button
            onClick={() => setView('earth')}
            className={clsx(
              'px-3 py-1.5 transition-all border-l border-white/8 flex items-center gap-1',
              view === 'earth' ? 'bg-aurora-green/10 text-aurora-green' : 'text-slate-500 hover:text-slate-300',
            )}
          >
            🌍 Na Zemi
          </button>
        </div>
      </div>

      {/* View context */}
      <div className="px-4 pb-3">
        <p className="text-[10px] font-mono text-slate-500">
          {view === 'l1'
            ? `Data ze sondy DSCOVR (L1) — dorazí na magnetosféru za ~${delayMin} min`
            : 'Aktuální stav — KP a HPI měřené na Zemi + vítr, který už dorazil'}
        </p>
      </div>

      <div className="px-4 pb-4">
        {/* ─── 2-column: Metrics | Result + Checklist ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* ═══ LEFT: Metric grid + Effective KP ═══ */}
          <div className="space-y-3">
            {/* 3×2 big number cards */}
            <div className="grid grid-cols-3 gap-2">
              {metrics.map(m => (
                <div
                  key={m.id}
                  className="rounded-xl p-2.5 text-center transition-all duration-500"
                  style={{ background: sBg(m.status), border: `1px solid ${sColor(m.status)}15` }}
                >
                  <div className="text-[9px] font-mono text-slate-500 uppercase tracking-wider mb-0.5">{m.label}</div>
                  <div className="flex items-baseline justify-center gap-0.5">
                    <span
                      className="text-xl sm:text-2xl font-display font-black tabular-nums leading-none"
                      style={{ color: sColor(m.status) }}
                    >
                      {m.value}
                    </span>
                    {m.unit && <span className="text-[9px] font-mono text-slate-500">{m.unit}</span>}
                  </div>
                  {m.sub && (
                    <div className="text-[9px] font-mono mt-0.5" style={{ color: sColor(m.status) + 'aa' }}>
                      {m.sub}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Effective KP bar */}
            <div className="rounded-xl bg-white/2 border border-white/6 p-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">Efektivní KP</span>
                <span className="text-sm font-display font-black" style={{ color: visInfo.color }}>
                  {activeEff.effectiveKp.toFixed(1)}
                </span>
              </div>

              {/* Scale bar */}
              <div className="relative h-2.5 bg-white/4 rounded-full mb-2">
                <div
                  className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
                  style={{
                    width: `${effKpPct}%`,
                    background: `linear-gradient(90deg, #334155, ${visInfo.color})`,
                    boxShadow: `0 0 8px ${visInfo.color}40`,
                  }}
                />
                {/* Threshold lines */}
                {[3.5, 4.5, 5.5, 6.5, 8.0].map(t => (
                  <div key={t} className="absolute top-0 bottom-0 w-px bg-white/20" style={{ left: `${(t / 10) * 100}%` }} />
                ))}
              </div>

              {/* Labels under bar */}
              <div className="relative h-4 text-[9px] font-mono">
                {[
                  { kp: 3.5, label: '📷', sub: 'slabě' },
                  { kp: 4.5, label: '📷', sub: 'středně' },
                  { kp: 5.5, label: '📷', sub: 'silně' },
                  { kp: 6.5, label: '👁️', sub: 'slabě' },
                  { kp: 8.0, label: '✨', sub: 'silně' },
                ].map(t => (
                  <span key={t.kp} className="absolute -translate-x-1/2 text-center leading-tight" style={{ left: `${(t.kp / 10) * 100}%` }}>
                    <span className="text-[9px]">{t.label}</span>
                    <br />
                    <span className="text-slate-600">{t.sub}</span>
                  </span>
                ))}
              </div>

              {/* Contribution chips */}
              {activeEff.contributions.length > 1 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {activeEff.contributions.map((c, i) => (
                    <span
                      key={i}
                      className="text-[9px] font-mono px-1.5 py-0.5 rounded-sm"
                      style={{
                        backgroundColor: c.value > 0 ? 'rgba(0,255,170,0.08)' : c.value < 0 ? 'rgba(255,61,154,0.08)' : 'rgba(255,255,255,0.04)',
                        color: c.value > 0 ? '#00ffaa' : c.value < 0 ? '#ff3d9a' : '#64748b',
                      }}
                    >
                      {c.label} {c.value >= 0 ? '+' : ''}{c.value.toFixed(1)}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ═══ RIGHT: Visibility outcome + compact checklist ═══ */}
          <div className="space-y-3">
            {/* Visibility banner */}
            <div
              className="rounded-xl p-4 text-center transition-all duration-500"
              style={{ background: `linear-gradient(135deg, ${visInfo.color}10, transparent)`, border: `1px solid ${visInfo.color}25` }}
            >
              <span className="text-3xl block mb-1">{visInfo.icon}</span>
              <div className="font-display text-lg font-black" style={{ color: visInfo.color }}>{visInfo.label}</div>
              <p className="text-[10px] text-slate-400 mt-1 leading-snug max-w-xs mx-auto">{visInfo.desc}</p>

              {/* Level dots */}
              <div className="flex items-center justify-center gap-1.5 mt-3">
                {ALL_LEVELS.map((lvl, idx) => {
                  const li = VISIBILITY_INFO[lvl]
                  const active = idx <= visIdx && idx > 0
                  const current = lvl === activeVis
                  return (
                    <div key={lvl} className="flex flex-col items-center" title={li.label}>
                      <div
                        className="w-2.5 h-2.5 rounded-full transition-all duration-500"
                        style={{
                          backgroundColor: active || current ? li.color : '#1e293b',
                          border: `1.5px solid ${active || current ? li.color : '#334155'}`,
                          boxShadow: current ? `0 0 8px ${li.color}60` : 'none',
                          transform: current ? 'scale(1.4)' : 'scale(1)',
                        }}
                      />
                      <span className="text-[9px] font-mono mt-0.5" style={{ color: active || current ? li.color : '#334155' }}>
                        {li.icon}
                      </span>
                    </div>
                  )
                })}
              </div>

              {/* L1 vs Earth comparison when different */}
              {l1Vis !== earthVis && (
                <div className="mt-2.5 text-[9px] font-mono px-2.5 py-1.5 rounded-lg bg-white/4 border border-white/6 inline-block">
                  {view === 'l1' ? (
                    <>
                      <span className="text-slate-500">Na Zemi: </span>
                      <span style={{ color: VISIBILITY_INFO[earthVis].color }}>{VISIBILITY_INFO[earthVis].label}</span>
                      <span className="text-slate-600"> → </span>
                      <span className="text-slate-500">L1 (za ~{delayMin} min): </span>
                      <span style={{ color: VISIBILITY_INFO[l1Vis].color }}>{VISIBILITY_INFO[l1Vis].label}</span>
                    </>
                  ) : (
                    <>
                      <span className="text-slate-500">Na Zemi: </span>
                      <span style={{ color: VISIBILITY_INFO[earthVis].color }}>{VISIBILITY_INFO[earthVis].label}</span>
                      <span className="text-slate-600"> | </span>
                      <span className="text-slate-500">Přijde z L1: </span>
                      <span style={{ color: VISIBILITY_INFO[l1Vis].color }}>{VISIBILITY_INFO[l1Vis].label}</span>
                      <span className="text-slate-600"> (~{delayMin} min)</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Compact checklist */}
            <div className="rounded-xl bg-white/2 border border-white/6 p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">Checklist</span>
                <span
                  className="text-[9px] font-mono px-1.5 py-0.5 rounded-full"
                  style={{
                    backgroundColor: metCount >= 5 ? 'rgba(0,255,170,0.12)' : metCount >= 3 ? 'rgba(255,165,0,0.12)' : 'rgba(100,116,139,0.1)',
                    color: metCount >= 5 ? '#00ffaa' : metCount >= 3 ? '#ffa500' : '#64748b',
                  }}
                >
                  {metCount}/{checklist.length}
                </span>
              </div>

              <div className="space-y-1.5">
                {checklist.map(item => (
                  <div key={item.id} className="flex items-start gap-2">
                    <div
                      className="w-4 h-4 rounded-full border-[1.5px] flex items-center justify-center shrink-0 mt-px transition-all duration-500"
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
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-semibold text-slate-300">{item.label}</span>
                        <span
                          className="text-[9px] font-mono font-bold px-1 py-0.5 rounded-sm"
                          style={{
                            backgroundColor: item.met ? 'rgba(0,255,170,0.1)' : item.partial ? 'rgba(255,165,0,0.08)' : 'rgba(100,116,139,0.08)',
                            color: item.met ? '#00ffaa' : item.partial ? '#ffa500' : '#64748b',
                          }}
                        >
                          {item.value}
                        </span>
                      </div>
                      <p className="text-[9px] text-slate-500 leading-snug mt-0.5">
                        {isAdvanced ? item.advNote : item.note}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ─── Combination reference (expandable) ─── */}
        <div className="mt-3">
          <button
            onClick={() => setShowCombos(!showCombos)}
            className="w-full text-[9px] font-mono text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-2 py-1"
          >
            <span className="flex-1 h-px bg-white/4" />
            {showCombos ? '▾' : '▸'} Jaké kombinace stačí na záři?
            <span className="flex-1 h-px bg-white/4" />
          </button>

          {showCombos && (
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {LEVEL_COMBOS.map(lc => {
                const info = VISIBILITY_INFO[lc.level]
                const threshold = LEVEL_EFF_KP[lc.level]
                const reached = activeEff.effectiveKp >= threshold
                return (
                  <div
                    key={lc.level}
                    className="rounded-lg p-2.5 transition-all"
                    style={{
                      background: reached ? `${info.color}08` : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${reached ? info.color + '25' : 'rgba(255,255,255,0.04)'}`,
                    }}
                  >
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="text-sm">{info.icon}</span>
                      <span className="text-[10px] font-bold" style={{ color: reached ? info.color : '#64748b' }}>
                        {info.label}
                      </span>
                      <span className="text-[9px] font-mono text-slate-600 ml-auto">ef.KP ≥ {threshold}</span>
                    </div>
                    <div className="space-y-0.5">
                      {lc.combos.map((combo, i) => (
                        <div key={i} className="text-[9px] text-slate-500 flex items-start gap-1">
                          <span className="text-slate-600 shrink-0">•</span>
                          <span>{combo}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* ─── Narrative ─── */}
        <div className="mt-3 pt-3 border-t border-white/6">
          <div className="text-[9px] font-mono tracking-wider text-slate-500 uppercase mb-1.5">
            📡 {isAdvanced ? 'Expertní hodnocení' : 'Aktuální situace'}
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">{narrative}</p>
        </div>
      </div>
    </div>
  )
}
