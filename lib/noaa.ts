// lib/noaa.ts
const NOAA = process.env.NOAA_BASE_URL ?? 'https://services.swpc.noaa.gov'
const NASA  = 'https://api.nasa.gov/DONKI'

import { fetchAllDonki } from '@/lib/space-weather/nasa'
import type { DonkiData } from '@/lib/space-weather/nasa'

// ── TYPES ────────────────────────────────────────────────────────────────────

export type KpPoint = {
  time_tag:       string
  kp_index:       number
  source:         'estimated' | 'predicted' | 'official'
}

export type SolarWindPoint = {
  time_tag:       string
  speed:          number
  density:        number
  temperature:    number
  bz:             number
  bt:             number
}

export type CmeEvent = {
  activityID:     string
  startTime:      string
  note:           string
  speed:          number | null
  earthImpact:    boolean
  impactTime:     string | null
}

export type SolarFlare = {
  flrID:          string
  beginTime:      string
  peakTime:       string | null
  classType:      string
  sourceLocation: string
  activeRegionNum: number | null
}

export type ForecastPeriod = {
  time:     string          // ISO time tag of the 3h window start
  kp:       number          // predicted KP for this 3h window
  observed: boolean         // whether this is an already-observed value
}

export type ForecastDay = {
  date:           string
  kpMax:          number
  kpMinor:        number
  kpModerate:     number
  kpSevere:       number
  periods:        ForecastPeriod[]   // 3h windows within this day
}

export type HpiPoint = {
  time_tag:    string
  north_hpi:   number
  south_hpi:   number
}

export type AuroralOvalPoint = {
  lon: number
  lat: number
  value: number  // aurora probability 0-100
}

export type DstPoint = {
  time_tag: string
  dst:      number
}

export type SolarRegion = {
  region:          number
  magClass:        string       // A, B, BG, BGD, G, GD, D
  spotClass:       string
  location:        string       // e.g. "S27E18"
  area:            number
  observedDate:    string
}

export type AggregatedData = {
  kpCurrent:      number
  kp3h:           number          // latest completed 3-hour observed KP
  kpHistory:      KpPoint[]
  solarWind:      SolarWindPoint | null
  solarWindHistory: SolarWindPoint[]
  cme:            CmeEvent[]
  flares:         SolarFlare[]
  forecast:       ForecastDay[]
  donki:          DonkiData | null
  hpiCurrent:     number | null
  hpiHistory:     HpiPoint[]
  dstCurrent:     number | null
  dstHistory:     DstPoint[]
  auroralOval:    AuroralOvalPoint[]
  solarRegions:   SolarRegion[]
  fetchedAt:      string
}

// ── FETCH HELPERS ────────────────────────────────────────────────────────────

async function noaaFetch<T>(path: string, revalidate = 60): Promise<T> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 8000)
  try {
    const res = await fetch(`${NOAA}${path}`, {
      next: { revalidate },
      headers: { 'Accept': 'application/json' },
      signal: controller.signal,
    })
    if (!res.ok) throw new Error(`NOAA ${path} → ${res.status}`)
    return res.json()
  } finally {
    clearTimeout(timeout)
  }
}

async function nasaFetch<T>(path: string, revalidate = 900): Promise<T> {
  const key = process.env.NASA_API_KEY ?? 'DEMO_KEY'
  const url  = `${NASA}${path}${path.includes('?') ? '&' : '?'}api_key=${key}`
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10000)
  try {
    const res = await fetch(url, { next: { revalidate }, signal: controller.signal })
    if (!res.ok) throw new Error(`DONKI ${path} → ${res.status}`)
    return res.json()
  } finally {
    clearTimeout(timeout)
  }
}

// ── KP INDEX ─────────────────────────────────────────────────────────────────

type NoaaKpRaw = {
  time_tag:      string
  kp_index:      number
  estimated_kp:  number
  kp:            string
}

export async function fetchKpHistory(): Promise<KpPoint[]> {
  const raw = await noaaFetch<NoaaKpRaw[]>(
    '/json/planetary_k_index_1m.json', 60
  )
  return raw.map(item => ({
    time_tag:  item.time_tag,
    kp_index:  item.estimated_kp ?? item.kp_index,
    source:    'estimated' as const,
  }))
}

export async function fetchKpForecast(): Promise<KpPoint[]> {
  const raw = await noaaFetch<string[][]>(
    '/products/noaa-planetary-k-index-forecast.json', 900
  )
  return raw.slice(1).map(row => {
    const src = row[2]
    // 'observed' = completed 3h windows, 'estimated' = current ongoing window, rest = predicted
    const source: KpPoint['source'] =
      src === 'observed'  ? 'official'   :
      src === 'estimated' ? 'estimated'  :
                            'predicted'
    return {
      time_tag:  row[0],
      kp_index:  parseFloat(row[1]),
      source,
    }
  })
}

// ── SOLAR WIND ────────────────────────────────────────────────────────────────

export async function fetchSolarWind(): Promise<SolarWindPoint[]> {
  const [mag, plasma] = await Promise.all([
    noaaFetch<string[][]>(
      '/products/solar-wind/mag-1-day.json', 60
    ),
    noaaFetch<string[][]>(
      '/products/solar-wind/plasma-1-day.json', 60
    ),
  ])

  // plasma: [time_tag, density, speed, temperature]
  const plasmaMap = new Map(
    plasma.slice(1).map(row => [
      row[0].slice(0, 16), { density: parseFloat(row[1]), speed: parseFloat(row[2]), temperature: parseFloat(row[3]) }
    ])
  )

  // mag: [time_tag, bx_gsm, by_gsm, bz_gsm, lon_gsm, lat_gsm, bt]
  return mag.slice(1)
    .map(row => {
      const p = plasmaMap.get(row[0].slice(0, 16))
      return p ? {
        time_tag:    row[0],
        bz:          parseFloat(row[3]),
        bt:          parseFloat(row[6]),
        speed:       p.speed,
        density:     p.density,
        temperature: p.temperature,
      } : null
    })
    .filter(Boolean) as SolarWindPoint[]
}

// ── CME (NASA DONKI) ──────────────────────────────────────────────────────────

export async function fetchCME(): Promise<CmeEvent[]> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 864e5).toISOString().slice(0, 10)
  const today        = new Date().toISOString().slice(0, 10)

  const raw = await nasaFetch<any[]>(
    `/CME?startDate=${sevenDaysAgo}&endDate=${today}`, 900
  )

  return (raw ?? []).map((item: any) => {
    const analyses = item.cmeAnalyses ?? []
    const best = analyses.find((a: any) => a.isMostAccurate) ?? analyses[0] ?? {}
    return {
      activityID:  item.activityID ?? '',
      startTime:   item.startTime ?? '',
      note:        item.note ?? '',
      speed:       best.speed ?? null,
      earthImpact: !!(item.linkedEvents?.some((e: any) => e.activityID?.includes('GST'))),
      impactTime:  null,
    }
  })
}

// ── SOLAR FLARES (NASA DONKI) ─────────────────────────────────────────────────

export async function fetchFlares(): Promise<SolarFlare[]> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 864e5).toISOString().slice(0, 10)
  const today        = new Date().toISOString().slice(0, 10)

  const raw = await nasaFetch<any[]>(
    `/FLR?startDate=${sevenDaysAgo}&endDate=${today}`, 900
  )

  return (raw ?? []).map((f: any) => ({
    flrID:           f.flrID ?? '',
    beginTime:       f.beginTime ?? '',
    peakTime:        f.peakTime ?? null,
    classType:       f.classType ?? 'unknown',
    sourceLocation:  f.sourceLocation ?? '',
    activeRegionNum: f.activeRegionNum ?? null,
  }))
}

// ── 3-DAY FORECAST ────────────────────────────────────────────────────────────

export async function fetchForecastDays(): Promise<ForecastDay[]> {
  // Derive forecast from KP forecast (geomagnetic-activity-probabilities is discontinued)
  const kpForecast = await fetchKpForecast()

  const byDay = new Map<string, { kp: number; time: string; observed: boolean }[]>()
  for (const pt of kpForecast) {
    const day = pt.time_tag.slice(0, 10)
    if (!byDay.has(day)) byDay.set(day, [])
    byDay.get(day)!.push({
      kp: pt.kp_index,
      time: pt.time_tag,
      observed: pt.source !== 'predicted',
    })
  }

  const today = new Date().toISOString().slice(0, 10)
  return Array.from(byDay.entries())
    .filter(([date]) => date >= today)
    .slice(0, 3)
    .map(([date, values]) => {
      const max = Math.max(...values.map(v => v.kp))
      return {
        date,
        kpMax:      Math.round(max),
        kpMinor:    max >= 4 ? Math.round(Math.min(100, (max / 9) * 100)) : 0,
        kpModerate: max >= 6 ? Math.round(Math.min(100, ((max - 4) / 5) * 100)) : 0,
        kpSevere:   max >= 8 ? Math.round(Math.min(100, ((max - 6) / 3) * 100)) : 0,
        periods:    values
          .sort((a, b) => a.time.localeCompare(b.time))
          .map(v => ({ time: v.time, kp: v.kp, observed: v.observed })),
      }
    })
}

// ── HPI (Hemispheric Power Index) — text endpoint (JSON is 404) ──────────────

export async function fetchHpi(): Promise<HpiPoint[]> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 8000)
  try {
    const res = await fetch(
      `${NOAA}/text/aurora-nowcast-hemi-power.txt`,
      { next: { revalidate: 60 }, signal: controller.signal },
    )
    if (!res.ok) throw new Error(`HPI text → ${res.status}`)
    const text = await res.text()
    const lines = text.split('\n').filter(l => l.trim() && !l.startsWith('#'))
    return lines.slice(-60).map(line => {
      const parts = line.trim().split(/\s+/)
      // format: obs_time  forecast_time  north_hpi  south_hpi
      return {
        time_tag:  (parts[0] ?? '').replace('_', ' '),
        north_hpi: parseFloat(parts[2]) || 0,
        south_hpi: parseFloat(parts[3]) || 0,
      }
    }).filter(p => p.north_hpi > 0 || p.south_hpi > 0)
  } finally {
    clearTimeout(timeout)
  }
}

// ── Dst (Disturbance Storm Time Index — Kyoto) ──────────────────────────────

export async function fetchDst(): Promise<DstPoint[]> {
  const raw = await noaaFetch<string[][]>('/products/kyoto-dst.json', 300)
  if (!raw || raw.length < 2) return []
  return raw.slice(1).map(row => ({
    time_tag: row[0],
    dst:      parseInt(row[1], 10) || 0,
  }))
}

// ── AURORAL OVAL (OVATION model) ─────────────────────────────────────────────

export async function fetchAuroralOval(): Promise<AuroralOvalPoint[]> {
  const raw = await noaaFetch<any>('/json/ovation_aurora_latest.json', 300)
  if (!raw?.coordinates) return []
  // Filter for European region (lon 10-20, lat 45-55 roughly CZ + surroundings)
  return (raw.coordinates as number[][]).filter((p: number[]) => {
    const lon = p[0] > 180 ? p[0] - 360 : p[0]
    return lon >= 5 && lon <= 25 && p[1] >= 44 && p[1] <= 56 && p[2] > 0
  }).map((p: number[]) => ({
    lon: p[0] > 180 ? p[0] - 360 : p[0],
    lat: p[1],
    value: p[2],
  }))
}

// ── SOLAR REGIONS (magnetic classification) ──────────────────────────────────

async function fetchSolarRegions(): Promise<SolarRegion[]> {
  const raw = await noaaFetch<any[]>('/json/solar_regions.json', 900)
  if (!Array.isArray(raw)) return []
  // Deduplicate: keep latest observed_date per region
  const latest = new Map<number, any>()
  for (const r of raw) {
    const existing = latest.get(r.region)
    if (!existing || r.observed_date > existing.observed_date) latest.set(r.region, r)
  }
  return Array.from(latest.values()).map(r => ({
    region:       r.region,
    magClass:     r.mag_class ?? 'A',
    spotClass:    r.spot_class ?? '',
    location:     r.location ?? '',
    area:         r.area ?? 0,
    observedDate: r.observed_date ?? '',
  }))
}

// ── MAIN AGGREGATOR ───────────────────────────────────────────────────────────

export async function fetchAllAuroraData(): Promise<AggregatedData> {
  const [kpHistory, kpForecast, solarWindAll, cme, flares, forecast, donkiResult, hpiResult, dstResult, ovalResult, regionsResult] = await Promise.allSettled([
    fetchKpHistory(),
    fetchKpForecast(),
    fetchSolarWind(),
    fetchCME(),
    fetchFlares(),
    fetchForecastDays(),
    fetchAllDonki(14),
    fetchHpi(),
    fetchDst(),
    fetchAuroralOval(),
    fetchSolarRegions(),
  ])

  const kpHist = kpHistory.status === 'fulfilled' ? kpHistory.value : []
  const kpFcst = kpForecast.status === 'fulfilled' ? kpForecast.value : []
  const swAll  = solarWindAll.status === 'fulfilled' ? solarWindAll.value : []
  const hpiArr = hpiResult.status === 'fulfilled' ? hpiResult.value : []
  const dstArr = dstResult.status === 'fulfilled' ? dstResult.value : []

  // kpCurrent: best available KP for the current 3-hour window.
  // Priority: forecast endpoint's 'estimated' (authoritative NOAA 3h running KP)
  //         > rolling max of last 30 1-minute readings (fallback)
  const recent30 = kpHist.slice(-30)
  const kpRollingMax = recent30.length > 0
    ? Math.max(...recent30.map(p => p.kp_index))
    : 0

  // The forecast endpoint provides 'estimated' for ongoing 3h windows.
  // Pick the one whose time window contains NOW (time_tag ≤ now < time_tag+3h).
  // This is the same KP that other aurora apps display.
  const nowMs = Date.now()
  const currentEstimated = kpFcst.filter(p => {
    if (p.source !== 'estimated') return false
    const start = new Date(p.time_tag + 'Z').getTime()
    return start <= nowMs && nowMs < start + 3 * 3600_000
  })
  // Fallback: if no window matches NOW (clock skew), take the highest estimated
  const allEstimated = kpFcst.filter(p => p.source === 'estimated')
  const bestEstimated = currentEstimated.length > 0
    ? currentEstimated[0]
    : allEstimated.length > 0
      ? allEstimated.reduce((a, b) => a.kp_index >= b.kp_index ? a : b)
      : null
  const kpFromForecast = bestEstimated?.kp_index ?? null
  const kpCurrent = kpFromForecast != null ? Math.max(kpFromForecast, kpRollingMax) : kpRollingMax

  // kp3h: latest completed 3-hour observed KP, or current estimated if higher
  const observed = kpFcst.filter(p => p.source === 'official')
  const lastObserved = observed.at(-1)?.kp_index ?? 0
  const kp3h = Math.max(lastObserved, kpCurrent)

  return {
    kpCurrent:        kpCurrent,
    kp3h,
    kpHistory:        [...kpHist, ...kpFcst],
    solarWind:        swAll.at(-1) ?? null,
    solarWindHistory: swAll.slice(-60),
    cme:              cme.status     === 'fulfilled' ? cme.value     : [],
    flares:           flares.status  === 'fulfilled' ? flares.value  : [],
    forecast:         forecast.status === 'fulfilled' ? forecast.value : [],
    donki:            donkiResult.status === 'fulfilled' ? donkiResult.value : null,
    hpiCurrent:       hpiArr.at(-1)?.north_hpi ?? null,
    hpiHistory:       hpiArr,
    dstCurrent:       dstArr.at(-1)?.dst ?? null,
    dstHistory:       dstArr.slice(-48),
    auroralOval:      ovalResult.status === 'fulfilled' ? ovalResult.value : [],
    solarRegions:     regionsResult.status === 'fulfilled' ? regionsResult.value : [],
    fetchedAt:        new Date().toISOString(),
  }
}

// ── VISIBILITY HELPERS ────────────────────────────────────────────────────────

export type VisibilityLevel = 'none' | 'photo_weak' | 'photo_medium' | 'photo_strong' | 'eye_weak' | 'eye_strong'

export interface VisibilityInput {
  kp: number
  hpi?: number | null
  dst?: number | null
  bz?: number | null
  swSpeed?: number | null
  hasCmeImpact?: boolean
  darkness?: number | null    // 0=day .. 1=night, null = assume dark
  moonIllumination?: number | null  // 0..1, null = assume no penalty
}

/**
 * Multi-factor aurora visibility for CZ (50°N).
 * Combines: Kp, HPI (auroral oval expansion), Bz (IMF southward),
 * solar wind speed (coronal hole HSS / CME sheath), CME impact,
 * sky darkness (astronomical), and moon phase.
 */
export function deriveVisibility(input: VisibilityInput): VisibilityLevel {
  const { kp, hpi, dst, bz, swSpeed, hasCmeImpact, darkness, moonIllumination } = input

  // ── Conservative boosts — KP already integrates Bz/speed/density effects.
  // These small nudges account for real-time L1 data KP hasn't reflected yet.
  // Total positive boost capped at +1.5 to prevent double-counting. ──
  let boost = 0

  // HPI: direct auroral oval expansion measurement
  const hpiVal = hpi ?? 0
  if (hpiVal >= 150) boost += 0.5
  else if (hpiVal >= 100) boost += 0.3
  else if (hpiVal >= 50) boost += 0.1

  // Bz southward: L1 may show activity ahead of 3h KP
  const bzVal = bz ?? 0
  if (bzVal < -20) boost += 0.5
  else if (bzVal < -10) boost += 0.3
  else if (bzVal < -5) boost += 0.15
  // Bz northward penalty — magnetosphere closing, KP may lag behind Bz flip
  // Aggressive: northward Bz means no energy transfer, aurora dies within ~30min
  if (bzVal >= 5) boost -= 3.0
  else if (bzVal > 2) boost -= 2.0
  else if (bzVal > 0) boost -= 0.5

  // Dst: severe storm ground-truth
  const dstVal = dst ?? 0
  if (dstVal < -150) boost += 0.5
  else if (dstVal < -100) boost += 0.3
  else if (dstVal < -50) boost += 0.1

  // Fast solar wind
  const speed = swSpeed ?? 0
  if (speed > 700) boost += 0.3
  else if (speed > 500) boost += 0.15

  // CME earth-impact
  if (hasCmeImpact) boost += 0.3

  // Cap boost: positive capped at +1.5, negative uncapped (northward Bz can fully suppress)
  const clampedBoost = boost >= 0 ? Math.min(boost, 1.5) : Math.max(boost, -4.0)
  let effectiveKp = kp + clampedBoost

  // Hard ceiling: solidly northward Bz means magnetosphere is closed — aurora impossible
  if (bzVal >= 5) effectiveKp = Math.min(effectiveKp, 2.0)
  else if (bzVal > 2) effectiveKp = Math.min(effectiveKp, 4.0)

  // ── Map to level for CZ 50°N — strict thresholds matching real observations ──
  let level: number
  if (effectiveKp >= 9.0) level = 5      // eye_strong — G4/G5, aurora i z města
  else if (effectiveKp >= 7.5) level = 4 // eye_weak — G3+, okem z tmavého místa
  else if (effectiveKp >= 7.0) level = 3 // photo_strong — silné G2/G3
  else if (effectiveKp >= 6.0) level = 2 // photo_medium — G2
  else if (effectiveKp >= 4.5) level = 1 // photo_weak — G1
  else level = 0                          // none

  // ── Sky darkness modifier ──
  if (darkness !== null && darkness !== undefined) {
    if (darkness < 0.3) return 'none'
    if (darkness < 0.5) level = Math.min(level, 1)
    if (darkness < 0.8) level = Math.min(level, 3)
  }

  // ── Moon illumination modifier ──
  if (moonIllumination !== null && moonIllumination !== undefined) {
    if (moonIllumination > 0.8) level = Math.min(level, 3)
    else if (moonIllumination > 0.5 && level >= 4) level -= 1
  }

  const LEVELS: VisibilityLevel[] = ['none', 'photo_weak', 'photo_medium', 'photo_strong', 'eye_weak', 'eye_strong']
  return LEVELS[Math.max(0, Math.min(level, 5))]
}

/** Legacy wrapper — use deriveVisibility() for full multi-factor evaluation */
export function kpToVisibility(kp: number): VisibilityLevel {
  return deriveVisibility({ kp })
}

export const VISIBILITY_INFO: Record<VisibilityLevel, {
  label: string; desc: string; icon: string; color: string
}> = {
  none:         { label: 'Neviditelná',           desc: 'Záře není viditelná ani kamerou z ČR',                           icon: '😴', color: '#4a6080' },
  photo_weak:   { label: 'Fotografická slabě',    desc: 'Citlivá kamera (ISO 6400+, 25 s+) může zachytit slabý nádech u obzoru. Tmavé místo nutné!', icon: '📷', color: '#3a8abf' },
  photo_medium: { label: 'Fotografická středně',   desc: 'Kamera zachytí záři na severním obzoru (ISO 3200, 15–25 s). Tmavé místo!',                  icon: '📷', color: '#48c7ff' },
  photo_strong: { label: 'Fotografická silně',     desc: 'Jasná záře na fotkách, oko může tušit zelený nádech na severu.',                             icon: '📷', color: '#88ff44' },
  eye_weak:     { label: 'Pouhým okem slabě',      desc: 'Záře viditelná okem z tmavého místa — slabý oblouk na severním obzoru.',                     icon: '👁️', color: '#ffa500' },
  eye_strong:   { label: 'Pouhým okem silně',      desc: 'Jasná záře viditelná i z okraje měst — vzácné pro ČR!',                                      icon: '✨', color: '#ff3d9a' },
}
