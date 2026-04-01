// lib/space-weather/hero/deriveSpaceWeatherState.ts

import type { AggregatedData } from '@/lib/noaa'
import type { DonkiData } from '@/lib/space-weather/nasa'
import type {
  SpaceWeatherState,
  JourneyStage,
  HeroData,
  AuroraLikelihood,
} from './types'
import { kpToGScale } from './types'
import { getCurrentStory } from './getCurrentStory'
import { calculateExpertScore } from '@/lib/space-weather/expertScore'
import { classifySource } from '@/lib/space-weather/sourceClassifier'
import type { SourceClassification } from '@/lib/space-weather/sourceClassifier'

export function deriveSpaceWeatherState(
  data: AggregatedData | null | undefined,
): HeroData {
  // Defaults for missing data
  const kp        = data?.kpCurrent ?? 0
  const bz        = data?.solarWind?.bz ?? null
  const swSpeed   = data?.solarWind?.speed ?? null
  const swDensity = data?.solarWind?.density ?? null
  const donki     = data?.donki ?? null
  const hpiCurrent = data?.hpiCurrent ?? null
  const dstCurrent = data?.dstCurrent ?? null

  // Latest events from DONKI
  const latestFlare     = donki?.flares?.[0] ?? null
  // Use the first earth-directed CME (type S or C) for narrative, not just any CME
  const latestCme       = donki?.cmes?.find(c =>
    c.analysis?.type === 'S' || c.analysis?.type === 'C'
  ) ?? donki?.cmes?.[0] ?? null
  const latestArrival   = donki?.arrivals?.[0] ?? null
  const latestStorm     = donki?.storms?.[0] ?? null

  const latestFlareClass = latestFlare?.classType ?? null
  const latestCmeSpeed   = latestCme?.analysis?.speed ?? null
  const predictedArrival = latestArrival?.arrivalTime ?? null

  // ── Klasifikace zdroje slunečního větru (CME vs koronální díra vs ambient) ──
  let sourceClassification: SourceClassification | null = null
  if (data) {
    try {
      sourceClassification = classifySource(data)
    } catch {
      // graceful fallback — classification is supplementary
    }
  }

  // Determine aurora likelihood for CZ using the full expert scoring engine
  // Uses all parameters: Bz, speed, density, Bt, bzDuration, KP, HPI, Dst + source type
  const expertResult = calculateExpertScore({
    kp,
    bz,
    bt: data?.solarWind?.bt ?? null,
    swSpeed,
    swDensity,
    solarWindHistory: data?.solarWindHistory ?? [],
    hpiCurrent,
    dstCurrent,
    sourceType: sourceClassification?.source ?? null,
  }, 50.08, 14.44, true) // nightIndependent=true — likelihood should not depend on daytime
  const auroraLikelihood = expertScoreToLikelihood(expertResult.score, expertResult.bzNorthward)

  // Determine the primary state
  const state = deriveState(kp, bz, swSpeed, donki, auroraLikelihood, sourceClassification)

  // Determine which journey stages are "active"
  const activeStages = deriveActiveStages(state, kp, bz, swSpeed, donki)

  // Overall intensity 0..1
  const intensity = deriveIntensity(kp, bz, swSpeed)

  // CME transit progress 0..1
  const transitProgress = deriveTransitProgress(state, donki)

  const gScale = kpToGScale(kp)

  const narrative = getCurrentStory(state, {
    kp, bz, swSpeed, latestFlareClass, latestCmeSpeed, predictedArrival, auroraLikelihood, gScale,
  })

  return {
    state,
    activeStages,
    intensity,
    kp,
    bz,
    swSpeed,
    swDensity,
    gScale,
    hpiCurrent,
    dstCurrent,
    latestFlareClass,
    latestCmeSpeed,
    predictedArrival,
    auroraLikelihood,
    transitProgress,
    sourceClassification,
    shock: sourceClassification?.shock ?? null,
    precursors: sourceClassification?.precursors ?? [],
    sourcePrediction: sourceClassification?.prediction ?? null,
    narrative,
  }
}

/**
 * Map expert score (0–100) to aurora likelihood level for CZ (50°N).
 * The expert score already integrates all parameters: Bz (26%), speed (15%),
 * bzDuration (15%), KP (12%), density (10%), HPI (8%), Bt (7%), Dst (7%).
 * nightIndependent score is used — likelihood reflects geophysical conditions only.
 */
function expertScoreToLikelihood(score: number, bzNorthward: boolean): AuroraLikelihood {
  // If Bz is firmly northward, magnetosphere is locked — very low chance
  if (bzNorthward && score < 20) return 'none'

  if (score >= 55) return 'very_likely'  // strong multi-factor conditions
  if (score >= 40) return 'likely'       // good combination of factors
  if (score >= 25) return 'possible'     // moderate — some factors aligning
  if (score >= 12) return 'unlikely'     // weak signals, early activation
  return 'none'
}

function deriveState(
  kp: number,
  bz: number | null,
  swSpeed: number | null,
  donki: DonkiData | null,
  aurora: AuroraLikelihood,
  classification: SourceClassification | null,
): SpaceWeatherState {
  // Highest priority first
  if (aurora === 'very_likely') return 'AURORA_LIKELY_CZ'
  if (aurora === 'likely' || aurora === 'possible') return 'AURORA_POSSIBLE_CZ'

  if (kp >= 5 || (kp >= 4 && (bz ?? 0) < -5)) return 'MAGNETOSPHERE_ACTIVE'

  // Check if L1 is measuring elevated conditions
  if ((swSpeed ?? 0) > 450 && (bz ?? 0) < -3) return 'L1_IMPACT_IMMINENT'

  // Check for CME in transit (arrival predicted but not yet)
  const arrival = donki?.arrivals?.[0]
  if (arrival) {
    const arrTime = new Date(arrival.arrivalTime).getTime()
    const now = Date.now()
    if (arrTime > now && arrTime - now < 48 * 3600_000) return 'IN_TRANSIT'
  }

  // Earth-directed CME detected
  const earthCme = donki?.cmes?.find(c =>
    c.analysis?.type === 'S' || c.analysis?.type === 'C'
  )
  if (earthCme) return 'EARTH_DIRECTED_CME'

  // Koronální díra / CIR / HSS detekovaná na L1
  if (classification?.source === 'CIR_HSS') {
    return 'CORONAL_HOLE_STREAM'
  }

  // Any recent solar event
  const hasRecentFlare = (donki?.flares?.length ?? 0) > 0
  const hasRecentCme   = (donki?.cmes?.length ?? 0) > 0
  if (hasRecentFlare || hasRecentCme) return 'SOLAR_EVENT_DETECTED'

  return 'QUIET'
}

function deriveActiveStages(
  state: SpaceWeatherState,
  kp: number,
  bz: number | null,
  swSpeed: number | null,
  donki: DonkiData | null,
): JourneyStage[] {
  const stages: JourneyStage[] = []

  // Sun is "active" if recent solar events
  if ((donki?.flares?.length ?? 0) > 0 || (donki?.cmes?.length ?? 0) > 0) {
    stages.push('sun')
  }

  // Transit active if CME in flight
  if (state === 'IN_TRANSIT' || state === 'EARTH_DIRECTED_CME') {
    stages.push('transit')
  }

  // L1 active if elevated solar wind
  if ((swSpeed ?? 0) > 400 || (bz ?? 0) < -2) {
    stages.push('l1')
  }

  // Magnetosphere active
  if (kp >= 4 || state === 'MAGNETOSPHERE_ACTIVE' || state === 'AURORA_POSSIBLE_CZ' || state === 'AURORA_LIKELY_CZ') {
    stages.push('magnetosphere')
  }

  // Earth/CZ stage
  if (state === 'AURORA_POSSIBLE_CZ' || state === 'AURORA_LIKELY_CZ') {
    stages.push('earth')
  }

  return stages
}

function deriveIntensity(kp: number, bz: number | null, swSpeed: number | null): number {
  // Combine Kp (0-9), Bz (positive bad=good for aurora when negative), swSpeed
  const kpNorm = Math.min(kp / 9, 1)
  const bzNorm = Math.min(Math.max(-(bz ?? 0) / 20, 0), 1)
  const swNorm = Math.min(Math.max(((swSpeed ?? 300) - 300) / 700, 0), 1)
  return Math.min((kpNorm * 0.5 + bzNorm * 0.3 + swNorm * 0.2), 1)
}

/** Estimate how far a CME has traveled from Sun to Earth (0..1) based on state + timing */
function deriveTransitProgress(state: SpaceWeatherState, donki: DonkiData | null): number {
  if (state === 'MAGNETOSPHERE_ACTIVE' || state === 'AURORA_POSSIBLE_CZ' || state === 'AURORA_LIKELY_CZ') return 1
  if (state === 'L1_IMPACT_IMMINENT') return 0.9

  const arrival = donki?.arrivals?.[0]
  const cme = donki?.cmes?.[0]

  if (arrival && cme) {
    const startTime = new Date(cme.startTime).getTime()
    const arrTime   = new Date(arrival.arrivalTime).getTime()
    const now       = Date.now()
    const total     = arrTime - startTime
    if (total > 0) {
      return Math.max(0, Math.min((now - startTime) / total, 1))
    }
  }

  if (state === 'IN_TRANSIT') return 0.5
  if (state === 'EARTH_DIRECTED_CME') return 0.15
  if (state === 'SOLAR_EVENT_DETECTED') return 0.05
  return 0
}
