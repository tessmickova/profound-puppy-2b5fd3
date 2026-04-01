// lib/space-weather/expertScore.ts
// High-precision linear scoring engine for aurora visibility in CZ (50°N)
// Based on expert heliophysicist methodology — weighted, continuous, no hard thresholds

import type { SolarWindPoint } from '@/lib/noaa'
import { getMoonInfo, getSunPosition } from '@/lib/astronomy'
import type { SolarWindSourceType } from '@/lib/space-weather/sourceClassifier'

export interface ExpertScoreInput {
  kp: number
  bz: number | null
  bt?: number | null
  swSpeed: number | null
  swDensity: number | null
  solarWindHistory: SolarWindPoint[]
  hpiCurrent?: number | null
  dstCurrent?: number | null
  /** Zdroj slunečního větru — ovlivňuje váhy a bonusy */
  sourceType?: SolarWindSourceType | null
}

export interface ExpertScoreResult {
  /** 0–100 continuous probability */
  score: number
  /** Czech label explaining the score */
  label: string
  /** Detailed expert explanation of WHY */
  explanation: string
  /** Color for UI */
  color: string
  /** Individual factor scores (0–1) */
  factors: {
    bz: number
    speed: number
    density: number
    bt: number
    bzDuration: number
    kp: number
    hpi: number
    dst: number
  }
  /** Whether Bz is northward (positive) — hard block */
  bzNorthward: boolean
  /** Minutes of sustained southward Bz */
  bzSouthMinutes: number
  /** Trend — is score improving? */
  trend: 'rising' | 'stable' | 'falling'
  /** Atmospheric penalties applied */
  penalties: {
    moon: number
    daylight: number
  }
  /** L1→Earth delay estimate in minutes */
  l1DelayMinutes: number
  /** Typ zdroje zohledněný ve výpočtu */
  sourceType: SolarWindSourceType | null
  /** Modifikátor aplikovaný na základě typu zdroje */
  sourceModifier: number
}

// Weights based on expert methodology
const WEIGHTS = {
  bz:         0.26,  // Bz is king — most important single factor
  speed:      0.15,  // Speed gives strength
  density:    0.10,  // Density gives mass / pressure events
  bt:         0.07,  // Total field energy
  bzDuration: 0.15,  // Sustained southward Bz is critical for mid-latitude aurora
  kp:         0.12,  // Kp provides integrated view
  hpi:        0.08,  // Hemispheric power — auroral oval expansion
  dst:        0.07,  // Dst — storm intensity from ground magnetometers
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(n, max))
}

/** Linearly interpolate a value within a range to 0–1 */
function normalize(value: number, min: number, max: number): number {
  return clamp((value - min) / (max - min), 0, 1)
}

/** Calculate how many minutes Bz has been southward allowing brief interruptions */
function analyzeBzSouthward(history: SolarWindPoint[]): { minutes: number; avgBz: number } {
  if (history.length < 2) return { minutes: 0, avgBz: 0 }

  let totalMinutes = 0
  let gapMinutes = 0
  let bzSum = 0
  let bzCount = 0
  const maxGap = 5

  for (let i = history.length - 1; i >= 0; i--) {
    const bz = history[i].bz
    if (bz < 0) {
      totalMinutes += 1
      gapMinutes = 0
      bzSum += bz
      bzCount++
    } else {
      gapMinutes += 1
      if (gapMinutes > maxGap) break
      totalMinutes += 1
    }
  }

  return { minutes: totalMinutes, avgBz: bzCount > 0 ? bzSum / bzCount : 0 }
}

/** Detect Bz trend over the last few minutes */
function detectBzTrend(history: SolarWindPoint[]): 'rising' | 'stable' | 'falling' {
  if (history.length < 4) return 'stable'
  const recent = history.slice(-4)
  const diffs = recent.slice(1).map((p, i) => p.bz - recent[i].bz)
  const avgDiff = diffs.reduce((a, b) => a + b, 0) / diffs.length
  if (avgDiff < -0.5) return 'falling' // Bz dropping = better for aurora
  if (avgDiff > 0.5) return 'rising'   // Bz rising = worse
  return 'stable'
}

/** Estimate the solar wind travel time from L1 to Earth */
function l1Delay(speed: number | null): number {
  const v = speed ?? 400
  // L1 distance ~1.5 million km
  return Math.round(1_500_000 / v / 60)
}

export function calculateExpertScore(
  input: ExpertScoreInput,
  lat = 50.08, // Prague default
  lon = 14.44,
  /** When true, skip daylight penalty — shows "tonight potential" regardless of current time */
  nightIndependent = false,
): ExpertScoreResult {
  const { kp, bz, bt, swSpeed, swDensity, solarWindHistory, hpiCurrent, dstCurrent, sourceType } = input

  const bzVal = bz ?? 0
  const btVal = bt ?? Math.abs(bzVal) // fallback: approximate Bt from Bz
  const speedVal = swSpeed ?? 350
  const densityVal = swDensity ?? 5
  const hpiVal = hpiCurrent ?? 0
  const dstVal = dstCurrent ?? 0

  // ── Factor scores (0–1 each, linear interpolation) ──

  // ── Factor scores (0–1) — wider ranges calibrated for 50°N CZ reality ──
  // Bz: 0 at Bz=0, 1.0 at Bz=-30 nT. Positive Bz = 0
  const bzScore = bzVal < 0 ? normalize(-bzVal, 0, 30) : 0

  // Speed: 0 at 400, 1.0 at 1000 km/s
  const speedScore = normalize(speedVal, 400, 1000)

  // Density: 0 at 5, 1.0 at 50 p/cm³
  const densityScore = normalize(densityVal, 5, 50)

  // Bt: 0 at 8, 1.0 at 40 nT
  const btScore = normalize(btVal, 8, 40)

  // Kp: 0 at kp=2, 1.0 at kp=9 (below 2 is irrelevant for CZ)
  const kpScore = normalize(kp, 2, 9)

  // Bz duration: how long has Bz been southward
  const bzAnalysis = analyzeBzSouthward(solarWindHistory)
  // 0 at 0min, 1.0 at 120 min (50°N needs longer energy loading)
  const bzDurationScore = normalize(bzAnalysis.minutes, 0, 120)

  // HPI: 0 at 30 GW, 1.0 at 300 GW (auroral oval expansion to mid-latitudes)
  const hpiScore = normalize(hpiVal, 30, 300)

  // Dst: 0 at -20 nT, 1.0 at -300 nT (storm strength from ground magnetometers)
  const dstScore = dstVal < -20 ? normalize(-dstVal, 20, 300) : 0

  // ── Weighted raw score ──
  let rawScore = (
    bzScore       * WEIGHTS.bz +
    speedScore    * WEIGHTS.speed +
    densityScore  * WEIGHTS.density +
    btScore       * WEIGHTS.bt +
    bzDurationScore * WEIGHTS.bzDuration +
    kpScore       * WEIGHTS.kp +
    hpiScore      * WEIGHTS.hpi +
    dstScore      * WEIGHTS.dst
  ) * 100

  // ── Bonus for rapid Bz drop (dynamics) ──
  if (solarWindHistory.length >= 3) {
    const last3 = solarWindHistory.slice(-3)
    const bzDrop = last3[0].bz - last3[last3.length - 1].bz
    if (bzDrop > 4) rawScore += 2 // rapid drop bonus (conservative)
  }

  // ── Pressure event detection ──
  // Sudden density spike can trigger substorm
  if (densityVal > 25 && speedVal > 500) {
    rawScore += 3 // pressure event bonus (conservative)
  }

  // ── Source type modifier for CZ (50°N) ──────────────────────────────────
  // Pro ČR je klíčové, zda Bz vydrží jižní (CME) nebo osciluje (CIR/HSS).
  // CME magnetický oblak: hladká rotace Bz → sustain south → bonus
  // CIR/HSS: Alfvénicke oscilace → Bz nedrzí → penalta na bzDuration efekt
  // CME sheath: turbulentní, ale intenzivní → mírný bonus za hustotu
  let sourceModifier = 0
  if (sourceType === 'CME') {
    // CME magnetický oblak — nejlepší zdroj pro ČR
    // Bz v oblaku rotuje pomalu → sustain south vyšší pravděpodobnost
    sourceModifier = +4
    // Pokud je Bz už jižní a trvá, extra bonus (potvrzení, že oblak rotuje správně)
    if (bzVal < -8 && bzDurationScore > 0.3) sourceModifier += 2
  } else if (sourceType === 'CME_SHEATH') {
    // Sheath — turbulentní Bz, ale hustota způsobí tlakovou událost
    sourceModifier = +2
    if (densityVal > 20) sourceModifier += 1
  } else if (sourceType === 'CIR_HSS') {
    // CIR/HSS — Alfvénicke oscilace Bz = špatná news pro 50°N
    // Bz se neustále točí → sustain south je nepravděpodobný
    sourceModifier = -5
    // Pokud ale proud je extrémně rychlý, může i HSS dát šanci
    if (speedVal > 650) sourceModifier += 2
  }
  rawScore += sourceModifier

  // ── Critical block: Bz northward = magnetosphere locked ──
  const bzNorthward = bzVal > 0
  if (bzNorthward) {
    // Don't zero out — residual energy from prior loading dissipates slowly
    rawScore *= 0.4 // severe reduction
  }

  // ── Atmospheric penalties ──
  const now = new Date()
  const moon = getMoonInfo(now)
  const sun = getSunPosition(now, lat, lon)

  let moonPenalty = 0
  if (moon.illumination > 0.5) {
    // strong moonlight reduces visibility significantly
    moonPenalty = moon.illumination * 25 // up to 25% penalty at full moon
  }

  let daylightPenalty = 0
  if (!nightIndependent && sun.darkness < 0.8) {
    // Not dark enough — twilight/daytime kills visibility
    daylightPenalty = (1 - sun.darkness) * 60 // up to 60% penalty in daylight
  }

  const finalScore = clamp(rawScore - moonPenalty - daylightPenalty, 0, 100)

  // ── Trend detection ──
  const trend = detectBzTrend(solarWindHistory)

  // ── Expert label & explanation ──
  const { label, explanation, color } = interpretScore(finalScore, bzVal, speedVal, densityVal, bzAnalysis.minutes, bzNorthward, moonPenalty, daylightPenalty, trend, hpiVal, dstVal, sourceType ?? null)

  return {
    score: Math.round(finalScore * 10) / 10,
    label,
    explanation,
    color,
    factors: {
      bz: bzScore,
      speed: speedScore,
      density: densityScore,
      bt: btScore,
      bzDuration: bzDurationScore,
      kp: kpScore,
      hpi: hpiScore,
      dst: dstScore,
    },
    bzNorthward,
    bzSouthMinutes: bzAnalysis.minutes,
    trend,
    penalties: { moon: moonPenalty, daylight: daylightPenalty },
    l1DelayMinutes: l1Delay(swSpeed),
    sourceType: sourceType ?? null,
    sourceModifier,
  }
}

function interpretScore(
  score: number,
  bz: number,
  speed: number,
  density: number,
  bzMinutes: number,
  bzNorthward: boolean,
  moonPenalty: number,
  daylightPenalty: number,
  trend: string,
  hpi: number,
  dst: number,
  sourceType: SolarWindSourceType | null,
): { label: string; explanation: string; color: string } {
  // Build nuanced explanation
  const parts: string[] = []

  // ── Identifikace zdroje (první informace) ──
  if (sourceType === 'CME') {
    parts.push('Zdroj: magnetický oblak CME — nejlepší scénář pro ČR')
  } else if (sourceType === 'CME_SHEATH') {
    parts.push('Zdroj: sheath před CME — turbulentní, ale intenzivní')
  } else if (sourceType === 'CIR_HSS') {
    parts.push('Zdroj: koronální díra (CIR/HSS) — oscilující Bz, krátká okna')
  } else if (sourceType === 'MIXED') {
    parts.push('Zdroj: smíšené podmínky (CME + koronální díra)')
  }

  if (bzNorthward) {
    parts.push('Bz je severní (kladné) — magnetosféra je „zamčená"')
  } else if (bz < -15) {
    parts.push(`Bz je extrémně jižní (${bz.toFixed(1)} nT) — ideální pro záři`)
  } else if (bz < -8) {
    parts.push(`Bz je silně jižní (${bz.toFixed(1)} nT) — otevřená magnetosféra`)
  } else if (bz < -5) {
    parts.push(`Bz mírně jižní (${bz.toFixed(1)} nT)`)
  }

  if (bzMinutes >= 45) {
    parts.push(`pole stabilně jižní ${bzMinutes} min — dobrá aktivace`)
  } else if (bzMinutes >= 20) {
    parts.push(`Bz jižní ${bzMinutes} min — rozbíhá se`)
  }

  if (speed > 700) {
    parts.push(`vítr extrémně rychlý (${Math.round(speed)} km/s)`)
  } else if (speed > 500) {
    parts.push(`rychlý vítr (${Math.round(speed)} km/s)`)
  }

  if (density > 20) {
    parts.push(`vysoká hustota (${density.toFixed(1)}/cm³) — tlaková událost`)
  }

  if (hpi >= 100) {
    parts.push(`HPI ${Math.round(hpi)} GW — ovál sahá k 50°N`)
  } else if (hpi >= 50) {
    parts.push(`HPI ${Math.round(hpi)} GW — ovál se rozšiřuje`)
  }

  if (dst < -100) {
    parts.push(`Dst ${dst} nT — silná geomagnetická bouře`)
  } else if (dst < -50) {
    parts.push(`Dst ${dst} nT — střední bouře`)
  } else if (dst < -30) {
    parts.push(`Dst ${dst} nT — mírný neklid`)
  }

  if (daylightPenalty > 20) {
    parts.push('je příliš světlo — astronomická tma potřebná')
  } else if (moonPenalty > 10) {
    parts.push('měsíc snižuje viditelnost slabých jevů')
  }

  if (trend === 'falling' && bz < 0) {
    parts.push('Bz klesá — podmínky se zlepšují')
  } else if (trend === 'rising' && bz < 0) {
    parts.push('Bz stoupá — podmínky se mohou zhoršit')
  }

  const explanation = parts.join('. ') + (parts.length > 0 ? '.' : 'Klidné podmínky.')

  if (score >= 70) {
    return {
      label: 'Extrémní bouře — záře pravděpodobně okem z ČR!',
      explanation,
      color: '#a855f7',
    }
  }
  if (score >= 55) {
    return {
      label: 'Silná aktivita — fotografická šance z tmavého místa',
      explanation,
      color: '#ff3d9a',
    }
  }
  if (score >= 40) {
    return {
      label: 'Zvýšená aktivita — šance na foto z tmavých míst',
      explanation,
      color: '#ffa500',
    }
  }
  if (score >= 25) {
    return {
      label: 'Neklid — sledujte, záře zatím nepravděpodobná',
      explanation,
      color: '#48c7ff',
    }
  }
  if (score >= 10) {
    return {
      label: 'Slabá aktivita — bez šance pro ČR',
      explanation,
      color: '#4a6080',
    }
  }
  return {
    label: 'Klid — magnetosféra spí',
    explanation,
    color: '#334155',
  }
}
