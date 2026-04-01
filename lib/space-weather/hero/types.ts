// lib/space-weather/hero/types.ts

import type { SourceClassification, SolarWindSourceType, ShockDetection, AuroraPrecursor, SourcePrediction } from '@/lib/space-weather/sourceClassifier'

export type SpaceWeatherState =
  | 'QUIET'
  | 'SOLAR_EVENT_DETECTED'
  | 'EARTH_DIRECTED_CME'
  | 'CORONAL_HOLE_STREAM'    // Nový stav: koronální díra/CIR/HSS detekovan
  | 'IN_TRANSIT'
  | 'L1_IMPACT_IMMINENT'
  | 'MAGNETOSPHERE_ACTIVE'
  | 'AURORA_POSSIBLE_CZ'
  | 'AURORA_LIKELY_CZ'

/** Which stage of the Sun→Earth journey is active */
export type JourneyStage =
  | 'sun'
  | 'transit'
  | 'l1'
  | 'magnetosphere'
  | 'earth'

export interface HeroData {
  state:            SpaceWeatherState
  activeStages:     JourneyStage[]
  /** 0-1 how intense the overall situation is */
  intensity:        number
  /** Metrics for the strip */
  kp:               number
  bz:               number | null
  swSpeed:          number | null
  swDensity:        number | null
  gScale:           number
  /** Hemispheric Power Index in GW — key metric for mid-latitude aurora */
  hpiCurrent:       number | null
  /** Dst (Disturbance Storm Time) in nT — ground magnetometer storm index */
  dstCurrent:       number | null
  latestFlareClass: string | null
  latestCmeSpeed:   number | null
  predictedArrival: string | null
  auroraLikelihood: AuroraLikelihood
  /** 0..1 how far CME has traveled from Sun to Earth */
  transitProgress:  number

  /** Klasifikace zdroje slunečního větru */
  sourceClassification: SourceClassification | null
  /** Detekce rázové vlny */
  shock:            ShockDetection | null
  /** Aktivní precursory pro ČR */
  precursors:       AuroraPrecursor[]
  /** Předpověď založená na typu zdroje */
  sourcePrediction: SourcePrediction | null

  /** For narrative */
  narrative: {
    now:   string
    next:  string
    forCz: string
  }
}

export type AuroraLikelihood =
  | 'none'
  | 'unlikely'
  | 'possible'
  | 'likely'
  | 'very_likely'

export const AURORA_LIKELIHOOD_LABELS: Record<AuroraLikelihood, { label: string; color: string }> = {
  none:        { label: 'Nepravděpodobná', color: '#4a6080' },
  unlikely:    { label: 'Malá šance',      color: '#48c7ff' },
  possible:    { label: 'Možná',           color: '#88ff44' },
  likely:      { label: 'Pravděpodobná',   color: '#ffa500' },
  very_likely: { label: 'Velmi pravděpodobná', color: '#ff3d9a' },
}

/** Map Kp to NOAA G-scale */
export function kpToGScale(kp: number): number {
  if (kp >= 9) return 5
  if (kp >= 8) return 4
  if (kp >= 7) return 3
  if (kp >= 6) return 2
  if (kp >= 5) return 1
  return 0
}
