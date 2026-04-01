// lib/space-weather/sourceClassifier.ts
// ═══════════════════════════════════════════════════════════════════════════
// Klasifikace zdroje slunečního větru (CME vs koronální díra/CIR/HSS)
// + detekce rázových vln + rozpoznávací znamení příchodu polární záře pro ČR
// ═══════════════════════════════════════════════════════════════════════════
//
// Pro ČR (50°N) je klíčové rozlišit ZDROJ, protože:
// - CME: hladká rotace Bz, sustain southward → KP 6-9 → silná záře
// - CIR/HSS: Alfvénické oscilace Bz, krátké dip → KP 4-6 → krátké záblesky
// - CME sheath: turbulentní Bz, extrémní hustota → KP 5-7 → záře 30-60 min
// - Rázová vlna: předchází CME, okamžitý skok → SSC → záře za 15-60 min

import type { SolarWindPoint, AggregatedData } from '@/lib/noaa'
import type { DonkiData, DonkiCME } from '@/lib/space-weather/nasa'

// ── TYPES ──────────────────────────────────────────────────────────────────

/** Zdroj slunečního větru */
export type SolarWindSourceType =
  | 'CME'           // koronální výron — magnetický oblak
  | 'CME_SHEATH'    // komprimovaná oblast před CME
  | 'CIR_HSS'       // korotující interakční region / vysokorychlostní proud z koronální díry
  | 'AMBIENT'       // klidný okolní vítr
  | 'MIXED'         // překryv CME + CIR nebo nejasná klasifikace

/** Rázová vlna detekována v datech */
export type ShockType =
  | 'INTERPLANETARY' // IP shock — skok rychlosti, hustoty, Bt najednou
  | 'CIR_BOUNDARY'   // CIR interface — pozvolnější, ale stále skok
  | 'NONE'

/** Znamení příchodu / zesílení polární záře pro ČR */
export type AuroraPrecursorType =
  | 'SHOCK_ARRIVAL'          // rázová vlna detekována na L1
  | 'BZ_SUSTAINED_SOUTH'    // Bz stabilně jižní >30 min
  | 'BZ_DEEP_SOUTH'         // Bz < -15 nT
  | 'BZ_RAPID_DROP'         // rychlý pokles Bz >5 nT za 5 min
  | 'DENSITY_COMPRESSION'   // hustota >20 p/cm³ — tlaková událost
  | 'SPEED_JUMP'            // skok rychlosti >80 km/s za 10 min
  | 'BT_SURGE'              // Bt skok >10 nT — magnetické pole zesílilo
  | 'HPI_EXPANDING'         // HPI >80 GW — ovál se rozšiřuje k 50°N
  | 'DST_DROPPING'          // Dst klesá >15 nT/h — ring current
  | 'PRESSURE_PULSE'        // dynamický tlak spike (hustota × rychlost²)
  | 'TEMPERATURE_DROP'      // teplota klesá — magnetický oblak (CME)
  | 'ALFVENIC_BZ'           // rychlé oscilace Bz — typické pro HSS

/** Precursor s podrobnostmi */
export interface AuroraPrecursor {
  type: AuroraPrecursorType
  /** Síla znamení 0–1 */
  strength: number
  /** Český popis */
  description: string
  /** Doporučení pro pozorovatele */
  recommendation: string
  /** Kolik minut před dopadem na Zemi (odhad z L1 delay) */
  leadTimeMinutes: number | null
}

/** Detekce rázové vlny */
export interface ShockDetection {
  type: ShockType
  /** Síla šoku 0–1 */
  strength: number
  /** Kdy detekována (ISO timestamp) */
  detectedAt: string | null
  /** Skok rychlosti (km/s) */
  speedJump: number
  /** Skok hustoty (násobek) */
  densityJump: number
  /** Skok Bt (nT) */
  btJump: number
  /** Český popis */
  description: string
}

/** Kompletní klasifikace situace */
export interface SourceClassification {
  /** Primární zdroj */
  source: SolarWindSourceType
  /** Spolehlivost klasifikace 0–1 */
  confidence: number
  /** Český popis zdroje */
  sourceLabel: string
  /** Detailní český popis podmínek */
  sourceDescription: string

  /** Detekce rázové vlny */
  shock: ShockDetection

  /** Aktivní precursory (seřazené od nejsilnějšího) */
  precursors: AuroraPrecursor[]

  /** Předpověď speciální pro typ zdroje */
  prediction: SourcePrediction

  /** Indikátory použité pro klasifikaci */
  indicators: SourceIndicators
}

/** Předpověď odvozená od typu zdroje */
export interface SourcePrediction {
  /** Pravděpodobný rozsah KP (min-max) */
  kpRange: [number, number]
  /** Očekávané trvání zvýšené aktivity (hodiny) */
  durationHours: [number, number]
  /** Pravděpodobnost, že Bz bude sustain southward (%) */
  bzSustainProb: number
  /** Šance na foto záři z ČR (%) */
  czPhotoProb: number
  /** Šance na okem viditelnou záři z ČR (%) */
  czEyeProb: number
  /** Český popis předpovědi */
  forecastText: string
}

/** Diagnostické indikátory pro rozhodovací logiku */
export interface SourceIndicators {
  /** Poměr rychlost/hustota — CME má nižší hustotu při vysoké rychlosti */
  speedDensityRatio: number
  /** Variabilita Bz (std dev) — HSS má vysokou, CME magnetic cloud nízkou */
  bzVariability: number
  /** Gradient rychlosti (km/s za minutu) — CIR roste pomalu, CME skokem */
  speedGradient: number
  /** Poměr teploty k očekávané (protonová anomálie) */
  temperatureRatio: number
  /** Je detekován magnetický oblak? (nízká beta, rotace Bz, nízká teplota) */
  magneticCloudSignature: boolean
  /** Alfvénicita — korelace Bz oscilací s rychlostí (HSS typicky vysoká) */
  alfvenicity: number
  /** Jsou DONKI CME data konzistentní s daty L1? */
  donkiConsistent: boolean
}

// ── HELPER FUNCTIONS ───────────────────────────────────────────────────────

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(n, max))
}

function stdDev(values: number[]): number {
  if (values.length < 2) return 0
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  const sqDiffs = values.map(v => (v - mean) ** 2)
  return Math.sqrt(sqDiffs.reduce((a, b) => a + b, 0) / (values.length - 1))
}

/** L1 → Earth travel time in minutes based on solar wind speed */
function l1DelayMinutes(speed: number): number {
  const v = Math.max(speed, 300) // floor at 300 km/s
  return Math.round(1_500_000 / v / 60)
}

// ── SHOCK DETECTION ────────────────────────────────────────────────────────

/**
 * Detekce rázové vlny v datech slunečního větru.
 *
 * IP shock = simultánní skok:
 *   - rychlost >80 km/s za ≤10 min
 *   - hustota >3× za ≤10 min
 *   - Bt >5 nT za ≤10 min
 *
 * CIR boundary = pozvolnější:
 *   - rychlost roste >40 km/s za ≤30 min
 *   - hustota spike >2× ale méně prudký
 */
export function detectShock(history: SolarWindPoint[]): ShockDetection {
  const none: ShockDetection = {
    type: 'NONE',
    strength: 0,
    detectedAt: null,
    speedJump: 0,
    densityJump: 0,
    btJump: 0,
    description: 'Žádná rázová vlna nezjištěna.',
  }

  if (history.length < 10) return none

  // Zkontroluj posledních 30 minut dat (30 bodů při 1-min vzorkování)
  const window = history.slice(-30)

  // Pro IP shock: hledej prudký skok v okně 10 minut
  for (let i = 10; i < window.length; i++) {
    const before = window.slice(Math.max(0, i - 10), i)
    const after = window.slice(i, Math.min(window.length, i + 3))

    if (before.length < 5 || after.length < 2) continue

    const avgSpeedBefore = before.reduce((s, p) => s + p.speed, 0) / before.length
    const avgSpeedAfter = after.reduce((s, p) => s + p.speed, 0) / after.length
    const avgDensityBefore = before.reduce((s, p) => s + p.density, 0) / before.length
    const avgDensityAfter = after.reduce((s, p) => s + p.density, 0) / after.length
    const avgBtBefore = before.reduce((s, p) => s + p.bt, 0) / before.length
    const avgBtAfter = after.reduce((s, p) => s + p.bt, 0) / after.length

    const speedJump = avgSpeedAfter - avgSpeedBefore
    const densityRatio = avgDensityBefore > 0 ? avgDensityAfter / avgDensityBefore : 1
    const btJump = avgBtAfter - avgBtBefore

    // IP shock: simultánní skoky ve všech parametrech
    if (speedJump > 80 && densityRatio > 2.5 && btJump > 5) {
      const strength = clamp(
        (speedJump / 200) * 0.4 + (densityRatio / 5) * 0.3 + (btJump / 15) * 0.3,
        0, 1,
      )
      return {
        type: 'INTERPLANETARY',
        strength,
        detectedAt: window[i].time_tag,
        speedJump: Math.round(speedJump),
        densityJump: Math.round(densityRatio * 10) / 10,
        btJump: Math.round(btJump * 10) / 10,
        description: `Interplanetární rázová vlna! Rychlost +${Math.round(speedJump)} km/s, hustota ×${densityRatio.toFixed(1)}, Bt +${btJump.toFixed(1)} nT. CME sheath pravděpodobně dorazil na L1.`,
      }
    }

    // CIR boundary: menší skoky, ale stále důležité
    if (speedJump > 40 && densityRatio > 1.8 && btJump > 3) {
      const strength = clamp(
        (speedJump / 150) * 0.4 + (densityRatio / 4) * 0.3 + (btJump / 10) * 0.3,
        0, 1,
      )
      return {
        type: 'CIR_BOUNDARY',
        strength,
        detectedAt: window[i].time_tag,
        speedJump: Math.round(speedJump),
        densityJump: Math.round(densityRatio * 10) / 10,
        btJump: Math.round(btJump * 10) / 10,
        description: `CIR rozhraní detekováno. Rychlost +${Math.round(speedJump)} km/s, hustota ×${densityRatio.toFixed(1)}. Koronální díra vysílá proud — krátkodobé šance na záři.`,
      }
    }
  }

  return none
}

// ── SOURCE CLASSIFICATION ──────────────────────────────────────────────────

/**
 * Hlavní klasifikátor zdroje slunečního větru.
 *
 * Rozlišuje CME, CME sheath, CIR/HSS a ambient vítr na základě:
 * 1. In-situ L1 dat (rychlost, hustota, teplota, Bz, Bt)
 * 2. NASA DONKI kontextu (byly nedávné CME? koronální díry?)
 * 3. Časových vzorů (náhlý skok vs. pozvolný nárůst)
 * 4. Magnetických signatur (rotace Bz, Alfvénicita)
 */
export function classifySource(data: AggregatedData): SourceClassification {
  const sw = data.solarWind
  const history = data.solarWindHistory ?? []
  const donki = data.donki

  // Default ambient
  let source: SolarWindSourceType = 'AMBIENT'
  let confidence = 0.8
  let sourceLabel = 'Klidný vítr'
  let sourceDescription = 'Standardní okolní sluneční vítr bez výrazných anomálií.'

  // ── Compute indicators ─────────────────────────────────────────────────

  const indicators = computeIndicators(history, sw, donki)
  const shock = detectShock(history)

  // ── Scoring pro každý typ zdroje ────────────────────────────────────────

  const cmeScore = scoreCME(indicators, shock, donki, sw)
  const sheathScore = scoreSheath(indicators, shock, sw)
  const cirScore = scoreCIR(indicators, shock, sw, history)
  const ambientScore = scoreAmbient(indicators, sw)

  // Najdi nejlepší shodu
  const scores = [
    { type: 'CME' as const, score: cmeScore },
    { type: 'CME_SHEATH' as const, score: sheathScore },
    { type: 'CIR_HSS' as const, score: cirScore },
    { type: 'AMBIENT' as const, score: ambientScore },
  ].sort((a, b) => b.score - a.score)

  const best = scores[0]
  const second = scores[1]

  // Pokud jsou dvě skóre blízko, je to MIXED
  if (best.score > 0 && second.score > 0 && best.score - second.score < 0.15) {
    source = 'MIXED'
    confidence = 0.4
    sourceLabel = 'Smíšený zdroj'
    sourceDescription = `Podmínky odpovídají kombinaci ${typeLabel(best.type)} + ${typeLabel(second.type)}.`
  } else {
    source = best.type
    confidence = clamp(best.score, 0, 1)
    sourceLabel = typeLabel(source)
    sourceDescription = typeDescription(source, indicators, sw)
  }

  // ── Precursors ──────────────────────────────────────────────────────────

  const precursors = detectPrecursors(history, sw, data, shock, source, indicators)

  // ── Prediction ──────────────────────────────────────────────────────────

  const prediction = derivePrediction(source, indicators, sw, data, shock)

  return {
    source,
    confidence,
    sourceLabel,
    sourceDescription,
    shock,
    precursors,
    prediction,
    indicators,
  }
}

// ── INDICATOR COMPUTATION ──────────────────────────────────────────────────

function computeIndicators(
  history: SolarWindPoint[],
  sw: SolarWindPoint | null,
  donki: DonkiData | null,
): SourceIndicators {
  const recent = history.slice(-30) // posledních 30 minut
  const speed = sw?.speed ?? 400
  const density = sw?.density ?? 5
  const temperature = sw?.temperature ?? 50000

  // Speed/density ratio — CME magnetic cloud: vysoká rychlost, nízká hustota
  const speedDensityRatio = density > 0 ? speed / density : speed / 5

  // Bz variabilita — HSS: vysoká oscilace; CME MC: hladká rotace
  const bzValues = recent.map(p => p.bz)
  const bzVariability = stdDev(bzValues)

  // Speed gradient — CIR: pozvolný nárůst; CME: prudký skok
  let speedGradient = 0
  if (recent.length >= 10) {
    const first5 = recent.slice(0, 5).reduce((s, p) => s + p.speed, 0) / 5
    const last5 = recent.slice(-5).reduce((s, p) => s + p.speed, 0) / 5
    speedGradient = (last5 - first5) / recent.length // km/s per minute
  }

  // Temperature ratio — CME MC: anomálně nízká teplota
  // Očekávaná teplota pro danou rychlost: T_exp ≈ (speed/442)^3.5 × 10^4.5
  const expectedTemp = Math.pow(speed / 442, 3.5) * Math.pow(10, 4.5)
  const temperatureRatio = expectedTemp > 0 ? temperature / expectedTemp : 1

  // Magnetic cloud signature: nízká teplota + nízká variabilita Bz + vysoké Bt
  const bt = sw?.bt ?? 5
  const magneticCloudSignature =
    temperatureRatio < 0.5 &&   // anomálně studené plazma
    bzVariability < 3 &&         // smooth Bz rotation
    bt > 10                      // elevated total field

  // Alfvénicita — korelace Bz oscilací s rychlostí (typické pro HSS)
  let alfvenicity = 0
  if (recent.length >= 10) {
    const bzDiffs = recent.slice(1).map((p, i) => p.bz - recent[i].bz)
    const speedDiffs = recent.slice(1).map((p, i) => p.speed - recent[i].speed)
    // Simple correlation — Alfvénické vlny mají korelované fluktuace
    const absBzChange = bzDiffs.reduce((s, d) => s + Math.abs(d), 0) / bzDiffs.length
    const absSpeedChange = speedDiffs.reduce((s, d) => s + Math.abs(d), 0) / speedDiffs.length
    if (absBzChange > 1 && absSpeedChange > 5) {
      alfvenicity = clamp(absBzChange / 5, 0, 1)
    }
  }

  // DONKI consistency — je aktuální vítr konzistentní s předpovězeným CME?
  let donkiConsistent = false
  if (donki) {
    const recentArrivals = donki.arrivals.filter(a => {
      const arrTime = new Date(a.arrivalTime).getTime()
      const now = Date.now()
      return Math.abs(arrTime - now) < 12 * 3600_000 // ±12 hodin od předpovědi
    })
    if (recentArrivals.length > 0 && speed > 450) {
      donkiConsistent = true
    }
  }

  return {
    speedDensityRatio,
    bzVariability,
    speedGradient,
    temperatureRatio,
    magneticCloudSignature,
    alfvenicity,
    donkiConsistent,
  }
}

// ── SOURCE SCORING ─────────────────────────────────────────────────────────

/** Skóre pro CME (magnetický oblak) */
function scoreCME(
  ind: SourceIndicators,
  shock: ShockDetection,
  donki: DonkiData | null,
  sw: SolarWindPoint | null,
): number {
  let score = 0

  // Magnetický oblak je nejsilnější znamení CME
  if (ind.magneticCloudSignature) score += 0.35

  // Nízká teplota (protonová anomálie)
  if (ind.temperatureRatio < 0.5) score += 0.15
  else if (ind.temperatureRatio < 0.7) score += 0.08

  // Nízká Bz variabilita (smooth rotation)
  if (ind.bzVariability < 2) score += 0.12
  else if (ind.bzVariability < 4) score += 0.06

  // Vysoké Bt (silné magnetické pole oblaku)
  const bt = sw?.bt ?? 0
  if (bt > 15) score += 0.12
  else if (bt > 10) score += 0.06

  // DONKI CME předpověď odpovídá
  if (ind.donkiConsistent) score += 0.15

  // Nedávná IP shock = pravděpodobně CME
  if (shock.type === 'INTERPLANETARY') score += 0.10

  // Speed/density ratio — CME MC má vyšší (nízká hustota, vysoká rychlost)
  if (ind.speedDensityRatio > 80) score += 0.05

  return clamp(score, 0, 1)
}

/** Skóre pro CME sheath (komprimovaná oblast před CME) */
function scoreSheath(
  ind: SourceIndicators,
  shock: ShockDetection,
  sw: SolarWindPoint | null,
): number {
  let score = 0

  // Sheath = vysoká hustota + vysoká rychlost + turbulentní Bz
  const density = sw?.density ?? 0
  const speed = sw?.speed ?? 0

  // Extrémně vysoká hustota
  if (density > 25) score += 0.25
  else if (density > 15) score += 0.15
  else if (density > 10) score += 0.05

  // Rychlý vítr
  if (speed > 600) score += 0.15
  else if (speed > 500) score += 0.08

  // Vysoká Bz variabilita (turbulence)
  if (ind.bzVariability > 5) score += 0.20
  else if (ind.bzVariability > 3) score += 0.10

  // IP shock právě detekován = sheath
  if (shock.type === 'INTERPLANETARY') score += 0.20

  // Teplota je normální nebo zvýšená (ne snížená jako v MC)
  if (ind.temperatureRatio > 0.8) score += 0.10

  // Nízká alfvénicita (sheath není Alfvénický)
  if (ind.alfvenicity < 0.3) score += 0.05

  return clamp(score, 0, 1)
}

/** Skóre pro CIR/HSS (koronální díra) */
function scoreCIR(
  ind: SourceIndicators,
  shock: ShockDetection,
  sw: SolarWindPoint | null,
  history: SolarWindPoint[],
): number {
  let score = 0

  const speed = sw?.speed ?? 0
  const density = sw?.density ?? 0

  // Pozvolný nárůst rychlosti (CIR ramp)
  if (ind.speedGradient > 0.5 && ind.speedGradient < 5) score += 0.20
  else if (ind.speedGradient > 0.2 && ind.speedGradient < 8) score += 0.10

  // Vysoká Bz oscilace (Alfvénické vlny typické pro HSS)
  if (ind.alfvenicity > 0.5) score += 0.20
  else if (ind.alfvenicity > 0.3) score += 0.10

  // Vysoká rychlost + nízká hustota = HSS proper
  if (speed > 550 && density < 8) score += 0.15
  else if (speed > 450 && density < 10) score += 0.08

  // CIR boundary shock (méně prudký)
  if (shock.type === 'CIR_BOUNDARY') score += 0.15

  // Zvýšená teplota (proton heating v HSS)
  if (ind.temperatureRatio > 1.3) score += 0.10
  else if (ind.temperatureRatio > 1.0) score += 0.05

  // Bz variabilita střední až vysoká
  if (ind.bzVariability > 3 && ind.bzVariability < 8) score += 0.10

  // Žádný earthward CME v DONKI = pravděpodobně CH
  // (absence CME zvyšuje pravděpodobnost CH)

  return clamp(score, 0, 1)
}

/** Skóre pro ambient vítr */
function scoreAmbient(
  ind: SourceIndicators,
  sw: SolarWindPoint | null,
): number {
  const speed = sw?.speed ?? 400
  const density = sw?.density ?? 5
  const bt = sw?.bt ?? 3

  let score = 0.5 // base score — ambient is default

  // Nízká rychlost
  if (speed < 400) score += 0.20
  else if (speed < 450) score += 0.10
  else score -= 0.25

  // Normální hustota
  if (density > 2 && density < 10) score += 0.10
  else score -= 0.10

  // Nízké Bt
  if (bt < 6) score += 0.10
  else score -= 0.15

  // Nízká variabilita všeho
  if (ind.bzVariability < 2) score += 0.05
  if (Math.abs(ind.speedGradient) < 0.3) score += 0.05

  return clamp(score, 0, 1)
}

// ── PRECURSOR DETECTION ────────────────────────────────────────────────────

/**
 * Detekce rozpoznávacích znamení polární záře pro ČR (50°N).
 *
 * Pro 50°N je každý parametr kriticky důležitý:
 * - Bz musí být stabilně jižní alespoň 30 min → záře dosáhne 50°N
 * - Rázová vlna = signál pro pozorovatele: 15-60 min do dopadu
 * - Hustota > 20 = tlaková událost → substorm → záře i při nižším KP
 * - HPI > 80 GW = ovál se blíží k 50°N
 */
function detectPrecursors(
  history: SolarWindPoint[],
  sw: SolarWindPoint | null,
  data: AggregatedData,
  shock: ShockDetection,
  source: SolarWindSourceType,
  indicators: SourceIndicators,
): AuroraPrecursor[] {
  const precursors: AuroraPrecursor[] = []
  const speed = sw?.speed ?? 400
  const bz = sw?.bz ?? 0
  const bt = sw?.bt ?? 5
  const density = sw?.density ?? 5
  const temperature = sw?.temperature ?? 50000
  const hpi = data.hpiCurrent ?? 0
  const dst = data.dstCurrent ?? 0
  const delay = l1DelayMinutes(speed)

  // ── 1. SHOCK_ARRIVAL ──
  if (shock.type !== 'NONE') {
    precursors.push({
      type: 'SHOCK_ARRIVAL',
      strength: shock.strength,
      description: shock.type === 'INTERPLANETARY'
        ? `Rázová vlna detekována na L1! Rychlost +${shock.speedJump} km/s. ${source === 'CME' || source === 'CME_SHEATH' ? 'CME dorazilo.' : 'CIR rozhraní.'}`
        : `CIR rozhraní na L1. Koronální díra vysílá rychlý proud.`,
      recommendation: shock.type === 'INTERPLANETARY'
        ? `Záře možná za ${delay}–${delay + 30} min! Sledujte severní obzor z tmavého místa.`
        : `Krátkodobá šance na záři za ${delay}–${delay + 45} min. Alfvénické oscilace Bz může přinést krátké okno.`,
      leadTimeMinutes: delay,
    })
  }

  // ── 2. BZ_SUSTAINED_SOUTH ──
  // Pro ČR kriticky důležité — potřebujeme Bz jižní min. 30 min
  const bzSouthMinutes = countBzSouthMinutes(history)
  if (bzSouthMinutes >= 30) {
    const strength = clamp(bzSouthMinutes / 120, 0.3, 1)
    precursors.push({
      type: 'BZ_SUSTAINED_SOUTH',
      strength,
      description: `Bz stabilně jižní ${bzSouthMinutes} min — magnetosféra se otevírá pro 50°N.${
        source === 'CME' ? ' Magnetický oblak CME drží Bz jižní.' :
        source === 'CIR_HSS' ? ' Pozor: HSS Bz osciluje, může se zvrátit.' : ''
      }`,
      recommendation: bzSouthMinutes >= 60
        ? 'Silná aktivace magnetosféry. Vysoká šance na záři z tmavého místa!'
        : 'Magnetosféra se nabíjí energií. Sledujte — pokud Bz vydrží jižní, záře za 30-60 min.',
      leadTimeMinutes: Math.max(0, delay - 10),
    })
  }

  // ── 3. BZ_DEEP_SOUTH ──
  if (bz < -15) {
    precursors.push({
      type: 'BZ_DEEP_SOUTH',
      strength: clamp(-bz / 30, 0.5, 1),
      description: `Bz extrémně jižní (${bz.toFixed(1)} nT) — magnetosféra široce otevřená!${
        source === 'CME' ? ' CME magnetický oblak s ideální orientací.' : ''
      }`,
      recommendation: 'Extrémní podmínky — záře pravděpodobně viditelná i z okraje měst! Vyrazte ven!',
      leadTimeMinutes: delay,
    })
  } else if (bz < -10) {
    precursors.push({
      type: 'BZ_DEEP_SOUTH',
      strength: clamp(-bz / 25, 0.3, 0.8),
      description: `Bz silně jižní (${bz.toFixed(1)} nT) — dobrá aktivace pro 50°N.`,
      recommendation: 'Silné podmínky. Z tmavého místa s čistým severním horizontem šance na foto záři.',
      leadTimeMinutes: delay,
    })
  }

  // ── 4. BZ_RAPID_DROP ──
  if (history.length >= 5) {
    const recent5 = history.slice(-5)
    const bzDrop = recent5[0].bz - recent5[recent5.length - 1].bz
    if (bzDrop > 5) {
      precursors.push({
        type: 'BZ_RAPID_DROP',
        strength: clamp(bzDrop / 15, 0.3, 1),
        description: `Bz prudce klesá (−${bzDrop.toFixed(1)} nT za 5 min). ${
          source === 'CME_SHEATH' ? 'Typické pro sheath před CME.' :
          source === 'CME' ? 'Magnetický oblak rotuje do jižní orientace.' :
          'Může signalizovat příchod rázové vlny.'
        }`,
        recommendation: `Podmínky se rychle zlepšují! Záře za ${delay}–${delay + 20} min.`,
        leadTimeMinutes: delay,
      })
    }
  }

  // ── 5. DENSITY_COMPRESSION ──
  if (density > 20) {
    precursors.push({
      type: 'DENSITY_COMPRESSION',
      strength: clamp(density / 50, 0.3, 1),
      description: `Extrémní hustota ${density.toFixed(0)} p/cm³ — ${
        source === 'CME_SHEATH' ? 'CME sheath komprimuje sluneční vítr.' :
        source === 'CIR_HSS' ? 'CIR rozhraní s nahromaděnou hmotou.' :
        'tlaková událost může vyvolat substorm.'
      }`,
      recommendation: 'Tlaková událost → substorm pravděpodobný. Sledujte KP a severní obzor!',
      leadTimeMinutes: delay,
    })
  }

  // ── 6. SPEED_JUMP ──
  if (history.length >= 10) {
    const recent10 = history.slice(-10)
    const speedJump = recent10[recent10.length - 1].speed - recent10[0].speed
    if (speedJump > 80) {
      precursors.push({
        type: 'SPEED_JUMP',
        strength: clamp(speedJump / 200, 0.3, 1),
        description: `Rychlý nárůst rychlosti +${Math.round(speedJump)} km/s za 10 min. ${
          source === 'CME' || source === 'CME_SHEATH' ? 'CME dorazilo na L1!' :
          source === 'CIR_HSS' ? 'CIR rozhraní přechází.' :
          'Signál příchodu disturbance.'
        }`,
        recommendation: `${source === 'CME' || source === 'CME_SHEATH'
          ? `CME dopadne na Zemi za ~${delay} min. Nachystejte foťák!`
          : `Zvýšená aktivita za ~${delay} min.`}`,
        leadTimeMinutes: delay,
      })
    }
  }

  // ── 7. BT_SURGE ──
  if (bt > 15) {
    precursors.push({
      type: 'BT_SURGE',
      strength: clamp(bt / 30, 0.3, 1),
      description: `Celkové mag. pole Bt = ${bt.toFixed(1)} nT — ${
        source === 'CME' ? 'silný magnetický oblak.' :
        source === 'CME_SHEATH' ? 'komprimované pole ve sheathu.' :
        'výrazně zesílené meziplanetární pole.'
      }`,
      recommendation: bt > 25
        ? 'Extrémně silné pole — pokud Bz zůstane jižní, záře bude intenzivní!'
        : 'Silné pole — potenciál pro záři, pokud se Bz obrátí na jih.',
      leadTimeMinutes: delay,
    })
  }

  // ── 8. HPI_EXPANDING ──
  if (hpi > 80) {
    precursors.push({
      type: 'HPI_EXPANDING',
      strength: clamp(hpi / 200, 0.3, 1),
      description: `HPI ${Math.round(hpi)} GW — aurorální ovál se rozšiřuje ${
        hpi > 150 ? 'a dosahuje 50°N!' : 'směrem k 50°N.'
      }`,
      recommendation: hpi > 150
        ? 'Ovál dosahuje ČR! Záře viditelná ze severní poloviny oblohy.'
        : 'Ovál se blíží k ČR. Z tmavého místa sledujte severní horizont.',
      leadTimeMinutes: 0, // HPI je ground-truth, ne L1
    })
  }

  // ── 9. DST_DROPPING ──
  if (dst < -30) {
    // Odhadni rate of change z DST historie
    const dstHistory = data.dstHistory ?? []
    let dstRate = 0
    if (dstHistory.length >= 2) {
      const last = dstHistory[dstHistory.length - 1].dst
      const prev = dstHistory[Math.max(0, dstHistory.length - 4)].dst // ~1h ago
      dstRate = last - prev // nT/hour (negative = drop)
    }

    precursors.push({
      type: 'DST_DROPPING',
      strength: clamp(-dst / 150, 0.2, 1),
      description: `Dst ${dst} nT${dstRate < -15 ? ` (klesá ${Math.abs(Math.round(dstRate))} nT/h)` : ''} — ${
        dst < -100 ? 'silná geomagnetická bouře!' :
        dst < -50 ? 'střední geomagnetická bouře.' :
        'mírný geomagnetický neklid.'
      }`,
      recommendation: dst < -100
        ? 'Silná bouře potvrzena! Záře pravděpodobná z celé ČR.'
        : dst < -50
        ? 'Bouře probíhá. Šance na záři z tmavých míst.'
        : 'Neklid — sledujte vývoj.',
      leadTimeMinutes: 0, // Dst je ground-truth
    })
  }

  // ── 10. PRESSURE_PULSE ──
  // Dynamický tlak = hustota × rychlost² / 2 (v nPa)
  const dynPressure = density * 1.67e-6 * (speed * 1000) ** 2 / 2 / 1e-9 // nPa
  if (dynPressure > 10) {
    precursors.push({
      type: 'PRESSURE_PULSE',
      strength: clamp(dynPressure / 30, 0.3, 1),
      description: `Dynamický tlak ${dynPressure.toFixed(1)} nPa — ${
        dynPressure > 20 ? 'extrémní komprese magnetosféry!' :
        'zvýšená komprese magnetosféry.'
      }`,
      recommendation: 'Vysoký tlak může vyvolat substorm i při jinak klidných podmínkách.',
      leadTimeMinutes: delay,
    })
  }

  // ── 11. TEMPERATURE_DROP ──
  if (sw && sw.temperature > 0) {
    const expectedTemp = Math.pow(speed / 442, 3.5) * Math.pow(10, 4.5)
    const ratio = sw.temperature / expectedTemp
    if (ratio < 0.5) {
      precursors.push({
        type: 'TEMPERATURE_DROP',
        strength: clamp((0.5 - ratio) / 0.4, 0.3, 1),
        description: `Anomálně nízká protonová teplota (${Math.round(ratio * 100)}% očekávané) — signatura magnetického oblaku CME.`,
        recommendation: source === 'CME'
          ? 'Potvrzeno: nacházíme se uvnitř magnetického oblaku. Sledujte rotaci Bz!'
          : 'Možný magnetický oblak CME. Bz se může obrátit na jih.',
        leadTimeMinutes: 0,
      })
    }
  }

  // ── 12. ALFVENIC_BZ ──
  if (source === 'CIR_HSS' && indicators.alfvenicity > 0.4) {
    precursors.push({
      type: 'ALFVENIC_BZ',
      strength: indicators.alfvenicity,
      description: `Alfvénické oscilace Bz (variabilita ${indicators.bzVariability.toFixed(1)} nT) — typické pro koronální díru.`,
      recommendation: 'Bz osciluje — záře se může objevit na krátké okamžiky při jižních dip. Sledujte real-time!',
      leadTimeMinutes: delay,
    })
  }

  // Sort od nejsilnějšího
  return precursors.sort((a, b) => b.strength - a.strength)
}

/** Spočítej minuty souvislého jižního Bz s tolerancí 5 min mezer */
function countBzSouthMinutes(history: SolarWindPoint[]): number {
  if (history.length < 2) return 0
  let minutes = 0
  let gap = 0
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].bz < 0) {
      minutes += 1
      gap = 0
    } else {
      gap += 1
      if (gap > 5) break
      minutes += 1
    }
  }
  return minutes
}

// ── PREDICTION BASED ON SOURCE TYPE ────────────────────────────────────────

/**
 * Předpověď specifická pro typ zdroje.
 *
 * Klíčové rozdíly pro ČR:
 * - CME: sustain Bz → KP 5-9, záře 2-12h, foto 60-80%, oko 10-40%
 * - CME sheath: turbulentní Bz → KP 4-7, záře 0.5-2h, foto 30-50%
 * - CIR/HSS: oscilující Bz → KP 3-6, záblesky, foto 15-35%, oko 2-8%
 * - Ambient: KP 0-2, žádná záře
 */
function derivePrediction(
  source: SolarWindSourceType,
  ind: SourceIndicators,
  sw: SolarWindPoint | null,
  data: AggregatedData,
  shock: ShockDetection,
): SourcePrediction {
  const speed = sw?.speed ?? 400
  const bz = sw?.bz ?? 0
  const bt = sw?.bt ?? 5
  const density = sw?.density ?? 5
  const kp = data.kpCurrent

  switch (source) {
    case 'CME': {
      // CME magnetický oblak — nejlepší scénář pro ČR
      // Hladká rotace Bz může držet south hours
      const bzStrong = bz < -10
      const speedFast = speed > 600

      let kpMin = bzStrong ? 5 : 4
      let kpMax = speedFast && bzStrong ? 9 : bzStrong ? 7 : 6
      if (bt > 20) kpMax = Math.min(kpMax + 1, 9)

      const durationMin = 2
      const durationMax = bzStrong ? 12 : 6

      const bzSustainProb = ind.magneticCloudSignature ? 75 : 50

      // Pro ČR: foto záře pravděpodobná od KP 4, okem od KP 5-6
      const czPhotoProb = clamp(
        (bzStrong ? 70 : 40) + (speed > 700 ? 15 : 0) + (bt > 15 ? 10 : 0) - (bz > 0 ? 40 : 0),
        5, 95,
      )
      const czEyeProb = clamp(
        (bzStrong && speedFast ? 35 : bzStrong ? 15 : 5) + (bt > 20 ? 10 : 0) - (bz > 0 ? 30 : 0),
        0, 60,
      )

      return {
        kpRange: [kpMin, kpMax],
        durationHours: [durationMin, durationMax],
        bzSustainProb,
        czPhotoProb,
        czEyeProb,
        forecastText: buildCMEForecast(bz, speed, bt, density, kpMax, bzSustainProb, czPhotoProb, czEyeProb),
      }
    }

    case 'CME_SHEATH': {
      // Sheath — turbulentní, ale intenzivní; krátké okno
      const kpMin = density > 20 ? 5 : 4
      const kpMax = density > 30 && speed > 600 ? 7 : 6

      const czPhotoProb = clamp(
        30 + (density > 25 ? 15 : 0) + (speed > 600 ? 10 : 0) - (bz > 0 ? 25 : 0),
        5, 70,
      )
      const czEyeProb = clamp(
        8 + (density > 30 ? 10 : 0) - (bz > 0 ? 15 : 0),
        0, 30,
      )

      return {
        kpRange: [kpMin, kpMax],
        durationHours: [0.5, 2],
        bzSustainProb: 25, // sheath Bz je turbulentní
        czPhotoProb,
        czEyeProb,
        forecastText: `CME sheath: turbulentní podmínky s extrémní hustotou (${density.toFixed(0)} p/cm³). ` +
          `KP může dosáhnout ${kpMax}. Bz je chaotický — krátké okno pro záři. ` +
          `Za sheathem může přijít magnetický oblak s lepšími podmínkami. ` +
          `Foto šance ${czPhotoProb}%, okem ${czEyeProb}%.`,
      }
    }

    case 'CIR_HSS': {
      // CIR/HSS — recurrentní, pozvolný, oscilující
      const isHSS = speed > 550 && density < 8
      const isCIR = !isHSS && speed > 400

      const kpMin = isCIR ? 3 : 2
      const kpMax = ind.alfvenicity > 0.5 ? 6 : isCIR ? 5 : 4

      const czPhotoProb = clamp(
        (isCIR ? 20 : 10) + (ind.alfvenicity > 0.5 ? 10 : 0) + (speed > 600 ? 5 : 0) - (bz > 0 ? 15 : 0),
        2, 45,
      )
      const czEyeProb = clamp(
        (kpMax >= 6 ? 8 : 2) - (bz > 0 ? 5 : 0),
        0, 15,
      )

      const forecastText = isHSS
        ? `Vysokorychlostní proud z koronální díry (${Math.round(speed)} km/s). ` +
          `Alfvénické oscilace Bz — záře se může objevit v krátkých záblescích při jižních dip. ` +
          `KP ${kpMin}–${kpMax}. Trvání zvýšené aktivity 1–3 dny. ` +
          `Foto šance ${czPhotoProb}% (krátká okna), okem ${czEyeProb}%.`
        : `CIR rozhraní — rozmezí pomalého a rychlého proudu. ` +
          `Hustota ${density.toFixed(0)} p/cm³ na rozhraní může vyvolat substorm. ` +
          `KP ${kpMin}–${kpMax}. Foto šance ${czPhotoProb}%, okem ${czEyeProb}%.`

      return {
        kpRange: [kpMin, kpMax],
        durationHours: [12, 72], // HSS trvají dlouho
        bzSustainProb: 15, // Alfvénické Bz osciluje
        czPhotoProb,
        czEyeProb,
        forecastText,
      }
    }

    case 'MIXED': {
      // Přebytek obou zdrojů
      const kpMin = 3
      const kpMax = Math.min(Math.max(kp + 2, 5), 8)
      const czPhotoProb = clamp(30 + (bz < -8 ? 15 : 0) + (speed > 600 ? 10 : 0), 10, 65)
      const czEyeProb = clamp(5 + (bz < -15 ? 10 : 0), 0, 25)

      return {
        kpRange: [kpMin, kpMax],
        durationHours: [2, 24],
        bzSustainProb: 40,
        czPhotoProb,
        czEyeProb,
        forecastText: `Smíšené podmínky — překryv CME a koronálního proudu. ` +
          `KP ${kpMin}–${kpMax}. Bz orientace rozhodne — sledujte real-time data. ` +
          `Foto šance ${czPhotoProb}%, okem ${czEyeProb}%.`,
      }
    }

    default: { // AMBIENT
      return {
        kpRange: [0, 2],
        durationHours: [0, 0],
        bzSustainProb: 5,
        czPhotoProb: 0,
        czEyeProb: 0,
        forecastText: 'Klidný sluneční vítr bez výrazné aktivity. Záře z ČR nepravděpodobná.',
      }
    }
  }
}

function buildCMEForecast(
  bz: number, speed: number, bt: number, density: number,
  kpMax: number, bzSustainProb: number, czPhotoProb: number, czEyeProb: number,
): string {
  const parts: string[] = []

  parts.push(`Magnetický oblak CME${speed > 700 ? ' rychlostí ' + Math.round(speed) + ' km/s' : ''}.`)

  if (bz < -15) {
    parts.push(`Bz extrémně jižní (${bz.toFixed(1)} nT) — ideální orientace!`)
  } else if (bz < -8) {
    parts.push(`Bz silně jižní (${bz.toFixed(1)} nT) — magnetosféra otevřená.`)
  } else if (bz < 0) {
    parts.push(`Bz mírně jižní (${bz.toFixed(1)} nT) — aktivace probíhá.`)
  } else {
    parts.push(`Bz je severní (${bz.toFixed(1)} nT) — magnetosféra zavřená. Oblak může rotovat!`)
  }

  if (bt > 20) parts.push(`Silné magnetické pole oblaku (Bt ${bt.toFixed(0)} nT).`)

  parts.push(`KP může dosáhnout ${kpMax}. Šance na sustain jižního Bz ${bzSustainProb}%.`)
  parts.push(`Foto záře z ČR ${czPhotoProb}%, okem ${czEyeProb}%.`)

  if (kpMax >= 7) {
    parts.push('Extrémní bouře — záře může být viditelná i z okraje měst!')
  } else if (kpMax >= 5) {
    parts.push('Z tmavého místa s čistým severním horizontem šance na pozorování.')
  }

  return parts.join(' ')
}

// ── LABELS ─────────────────────────────────────────────────────────────────

function typeLabel(type: SolarWindSourceType): string {
  switch (type) {
    case 'CME':         return 'CME — magnetický oblak'
    case 'CME_SHEATH':  return 'CME sheath — rázová vlna'
    case 'CIR_HSS':     return 'Koronální díra (CIR/HSS)'
    case 'MIXED':       return 'Smíšený zdroj'
    case 'AMBIENT':     return 'Klidný vítr'
  }
}

function typeDescription(
  type: SolarWindSourceType,
  ind: SourceIndicators,
  sw: SolarWindPoint | null,
): string {
  const speed = sw?.speed ?? 400
  const density = sw?.density ?? 5

  switch (type) {
    case 'CME':
      return `Detekován magnetický oblak CME. ${
        ind.magneticCloudSignature ? 'Potvrzeno: nízká teplota, hladká rotace Bz, silné pole.' :
        'In-situ data odpovídají CME profilu.'
      } Bz může zůstat jižní hodiny → silná šance pro ČR.`

    case 'CME_SHEATH':
      return `Komprimovaná oblast před CME (sheath). Extrémní hustota (${density.toFixed(0)} p/cm³), ` +
        `turbulentní Bz. Krátké, ale intenzivní okno. Za sheathem může přijít magnetický oblak.`

    case 'CIR_HSS':
      return speed > 550
        ? `Vysokorychlostní proud z koronální díry (${Math.round(speed)} km/s). ` +
          `Alfvénické oscilace Bz — krátké záblesky záře při jižních dip. Recurrentní zdroj (~27 dní).`
        : `CIR rozhraní — kontakt pomalého a rychlého slunečního proudu. ` +
          `Hustota nahromaděna na rozhraní. Krátkodobé šance na záři.`

    case 'MIXED':
      return `Podmínky odpovídají kombinaci více zdrojů (CME + koronální díra). ` +
        `Zvýšená nejistota předpovědi.`

    case 'AMBIENT':
      return `Standardní okolní sluneční vítr. Rychlost ${Math.round(speed)} km/s, ` +
        `hustota ${density.toFixed(1)} p/cm³. Žádné znamení aktivity.`
  }
}

// SourceIndicators is already exported as part of the interface declaration above
