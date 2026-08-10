'use client'
// components/ObservingConditions.tsx
// Podmínky pozorování: měsíc (globální), region buttons + locate me, per-city score+factors+sky
import { useState, useMemo, useEffect, useCallback } from 'react'
import {
  getSunPosition, getSunTimes,
  calculateObservingConditions, getLocalityProbability,
  CZ_LOCATIONS, DISTRICTS_BY_REGION, type CzLocation,
} from '@/lib/astronomy'
import { OBSERVATION_SPOTS, type ObservationSpot } from '@/lib/observationSpots'
import clsx from 'clsx'

const REGIONS = [
  'Moravskoslezský', 'Olomoucký', 'Zlínský', 'Jihomoravský', 'Vysočina',
  'Pardubický', 'Královéhradecký', 'Liberecký', 'Středočeský', 'Jihočeský',
  'Plzeňský', 'Ústecký', 'Karlovarský',
] as const

interface Props {
  kp: number
  bz?: number | null
}

export function ObservingConditions({ kp, bz: bzRaw = 0 }: Props) {
  const bz = bzRaw ?? 0
  const [selectedRegion, setSelectedRegion] = useState<string>('Moravskoslezský')
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null)
  const [expandedCity, setExpandedCity] = useState<string | null>('Palkovice')
  const [geoLocation, setGeoLocation] = useState<CzLocation | null>(null)
  const [geoLoading, setGeoLoading] = useState(false)
  const [cloudCache, setCloudCache] = useState<Record<string, number | null>>({})
  const [regionCloudMap, setRegionCloudMap] = useState<Record<string, number | null>>({})
  const [cloudLoaded, setCloudLoaded] = useState(false)

  const now = useMemo(() => new Date(), [])

  // Representative location per region (pick first location found)
  const regionRepresentatives = useMemo(() => {
    const map: Record<string, CzLocation> = {}
    for (const r of REGIONS) {
      const loc = CZ_LOCATIONS.find(l => l.region === r)
      if (loc) map[r] = loc
    }
    return map
  }, [])

  // Representative location per district
  const districtRepresentatives = useMemo(() => {
    const map: Record<string, CzLocation> = {}
    for (const loc of CZ_LOCATIONS) {
      if (!map[loc.district]) map[loc.district] = loc
    }
    return map
  }, [])

  // Fetch cloud cover for 13 region representative points only
  useEffect(() => {
    const entries = Object.entries(regionRepresentatives)
    if (entries.length === 0) return
    let cancelled = false
    const lats = entries.map(([, l]) => l.lat).join(',')
    const lons = entries.map(([, l]) => l.lon).join(',')
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lons}&current=cloud_cover&timezone=Europe%2FPrague`
    fetch(url)
      .then(r => r.json())
      .then(data => {
        if (cancelled) return
        const newMap: Record<string, number | null> = {}
        if (Array.isArray(data)) {
          data.forEach((d: any, i: number) => {
            newMap[entries[i][0]] = d?.current?.cloud_cover ?? null
          })
        }
        setRegionCloudMap(newMap)
        setCloudLoaded(true)
      })
      .catch(() => { if (!cancelled) setCloudLoaded(true) })
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Compute suitability per region: 'good' | 'ok' | 'poor' | null (loading)
  const regionSuitability = useMemo(() => {
    const map: Record<string, 'good' | 'ok' | 'poor' | null> = {}
    for (const r of REGIONS) {
      if (!cloudLoaded) { map[r] = null; continue }
      const loc = regionRepresentatives[r]
      if (!loc) { map[r] = 'poor'; continue }
      const cond = calculateObservingConditions(kp, loc, now)
      const cloud = regionCloudMap[r] ?? null
      if (cloud == null) { map[r] = null; continue }
      // Cloud-dominant logic — this is what determines "jasno vs zataženo"
      if (cloud > 80) { map[r] = 'poor'; continue }
      const cloudPenalty = Math.max(0, (cloud - 25) * 0.7)
      const effective = cond.score - cloudPenalty
      if (cloud <= 30 && effective >= 35) map[r] = 'good'
      else if (cloud <= 55 && effective >= 20) map[r] = 'ok'
      else if (effective >= 45) map[r] = 'ok'
      else map[r] = 'poor'
    }
    return map
  }, [kp, now, regionRepresentatives, regionCloudMap, cloudLoaded])

  // Compute suitability per district — use region cloud as proxy
  const districtSuitability = useMemo(() => {
    const map: Record<string, 'good' | 'ok' | 'poor' | null> = {}
    for (const d of Object.keys(districtRepresentatives)) {
      if (!cloudLoaded) { map[d] = null; continue }
      const loc = districtRepresentatives[d]
      if (!loc) { map[d] = 'poor'; continue }
      // Use region-level cloud (districts within same region have similar weather)
      const cloud = regionCloudMap[loc.region] ?? null
      if (cloud == null) { map[d] = null; continue }
      const cond = calculateObservingConditions(kp, loc, now)
      if (cloud > 80) { map[d] = 'poor'; continue }
      const cloudPenalty = Math.max(0, (cloud - 25) * 0.7)
      const effective = cond.score - cloudPenalty
      // District-level: also factor bortle — dark-sky districts are more favorable
      const bortleBonus = loc.bortle <= 3 ? 8 : loc.bortle <= 5 ? 3 : 0
      const adj = effective + bortleBonus
      if (cloud <= 30 && adj >= 35) map[d] = 'good'
      else if (cloud <= 55 && adj >= 20) map[d] = 'ok'
      else if (adj >= 45) map[d] = 'ok'
      else map[d] = 'poor'
    }
    return map
  }, [kp, now, districtRepresentatives, regionCloudMap, cloudLoaded])
  // Districts available for the selected region
  const regionDistricts = useMemo(() => DISTRICTS_BY_REGION[selectedRegion] ?? [], [selectedRegion])

  // Auto-select first district when region changes and no district is set
  useEffect(() => {
    if (!selectedDistrict && regionDistricts.length > 0) {
      setSelectedDistrict(regionDistricts[0])
    }
  }, [regionDistricts, selectedDistrict])

  // Locations filtered by selected region + district (+ geo location if applicable)
  const regionLocations = useMemo(() => {
    let locs = CZ_LOCATIONS.filter(l => l.region === selectedRegion)
    if (selectedDistrict) locs = locs.filter(l => l.district === selectedDistrict)
    if (geoLocation && geoLocation.region === selectedRegion) {
      if (!selectedDistrict || geoLocation.district === selectedDistrict) {
        if (!locs.some(l => l.name === geoLocation.name)) {
          return [geoLocation, ...locs]
        }
      }
    }
    return locs
  }, [selectedRegion, selectedDistrict, geoLocation])

  // Fetch cloud cover for expanded city
  useEffect(() => {
    if (!expandedCity) return
    const loc = regionLocations.find(l => l.name === expandedCity)
    if (!loc || cloudCache[loc.name] !== undefined) return
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lon}&current=cloud_cover&timezone=Europe%2FPrague`
    let cancelled = false
    fetch(url)
      .then(r => r.json())
      .then(d => {
        if (!cancelled && d?.current?.cloud_cover != null) {
          setCloudCache(prev => ({ ...prev, [loc.name]: d.current.cloud_cover }))
        }
      })
      .catch(() => { if (!cancelled) setCloudCache(prev => ({ ...prev, [loc.name]: null })) })
    return () => { cancelled = true }
  }, [expandedCity, regionLocations, cloudCache])

  // Geolocation handler
  const handleLocateMe = useCallback(() => {
    if (!navigator.geolocation) return
    setGeoLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        // Find nearest CZ_LOCATION
        let nearest = CZ_LOCATIONS[0]
        let minDist = Infinity
        for (const loc of CZ_LOCATIONS) {
          const d = Math.hypot(loc.lat - pos.coords.latitude, loc.lon - pos.coords.longitude)
          if (d < minDist) { minDist = d; nearest = loc }
        }
        const geoLoc: CzLocation = {
          ...nearest,
          name: `📍 Moje poloha (${nearest.name})`,
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        }
        setGeoLocation(geoLoc)
        setSelectedRegion(nearest.region)
        setSelectedDistrict(nearest.district)
        setExpandedCity(geoLoc.name)
        setGeoLoading(false)
      },
      () => setGeoLoading(false),
      { enableHighAccuracy: false, timeout: 8000 },
    )
  }, [])

  const fmt = (d: Date | null) =>
    d ? d.toLocaleTimeString('cs-CZ', { timeZone: 'Europe/Prague', hour: '2-digit', minute: '2-digit' }) : '—'

  return (
    <div className="mt-8">
      <div className="text-sm font-mono tracking-[3px] text-aurora-green/90 uppercase mb-4 flex items-center gap-3">
        🔭 Podmínky pozorování
        <span className="flex items-center gap-1 text-[10px] tracking-normal text-green-400 font-semibold">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_6px_#4ade80] animate-pulse" />
          LIVE
        </span>
        <span className="flex-1 h-px bg-white/8" />
      </div>

      {/* Region selector — buttons */}
      <div className="bg-[#04101e]/90 border border-white/8 rounded-2xl p-4 mb-4">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="font-display text-xs font-bold tracking-widest text-slate-400 uppercase">Kraj</span>
          <span className="flex items-center gap-2.5 ml-2 text-[9px] text-slate-600">
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />příznivé</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-slate-400 inline-block" />přijatelné</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-slate-700 inline-block" />nepříznivé</span>
          </span>
          <button
            onClick={handleLocateMe}
            disabled={geoLoading}
            className="ml-auto px-3 py-1.5 rounded-lg text-xs font-bold bg-aurora-teal/10 text-aurora-teal border border-aurora-teal/20 hover:bg-aurora-teal/20 transition-colors disabled:opacity-50"
          >
            {geoLoading ? '⏳ Hledám…' : '📍 Moje poloha'}
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {REGIONS.map(r => {
            const suit = regionSuitability[r]
            const isSelected = selectedRegion === r
            // Unselected colors: null = loading (neutral), good = green, ok = light, poor = dim
            const unselectedText = suit === 'good' ? 'text-green-400' : suit === 'ok' ? 'text-slate-300' : suit === 'poor' ? 'text-slate-600' : 'text-slate-400'
            const unselectedBorder = suit === 'good' ? 'border-green-500/20' : suit === 'poor' ? 'border-white/4' : 'border-white/6'
            const unselectedBg = suit === 'good' ? 'bg-green-500/6' : suit === 'poor' ? 'bg-white/2' : 'bg-white/4'
            const cloud = regionCloudMap[r]
            const tooltip = suit === 'good' ? `Příznivé — oblačnost ${cloud ?? '?'}%`
              : suit === 'ok' ? `Přijatelné — oblačnost ${cloud ?? '?'}%`
              : suit === 'poor' ? `Nepříznivé — oblačnost ${cloud ?? '?'}%`
              : 'Načítání…'
            return (
              <button
                key={r}
                onClick={() => { setSelectedRegion(r); setSelectedDistrict(null); setExpandedCity(null) }}
                className={clsx(
                  'px-2.5 py-1 rounded-md text-xs font-semibold transition-all border',
                  isSelected
                    ? 'bg-aurora-green/20 text-aurora-green border-aurora-green/30'
                    : `${unselectedBg} ${unselectedText} ${unselectedBorder} hover:brightness-125`
                )}
                title={tooltip}
              >
                {r}
              </button>
            )
          })}
        </div>
      </div>

      {/* District selector — buttons */}
      <div className="bg-[#04101e]/90 border border-white/8 rounded-2xl p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="font-display text-xs font-bold tracking-widest text-slate-400 uppercase">Okres</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {regionDistricts.map(d => {
            const suit = districtSuitability[d]
            const isSelected = selectedDistrict === d
            const unselectedText = suit === 'good' ? 'text-green-400' : suit === 'ok' ? 'text-slate-300' : suit === 'poor' ? 'text-slate-600' : 'text-slate-400'
            const unselectedBorder = suit === 'good' ? 'border-green-500/20' : suit === 'poor' ? 'border-white/4' : 'border-white/6'
            const unselectedBg = suit === 'good' ? 'bg-green-500/6' : suit === 'poor' ? 'bg-white/2' : 'bg-white/4'
            return (
              <button
                key={d}
                onClick={() => { setSelectedDistrict(d); setExpandedCity(null) }}
                className={clsx(
                  'px-2.5 py-1 rounded-md text-xs font-semibold transition-all border',
                  isSelected
                    ? 'bg-aurora-teal/20 text-aurora-teal border-aurora-teal/30'
                    : `${unselectedBg} ${unselectedText} ${unselectedBorder} hover:brightness-125`
                )}
                title={suit === 'good' ? 'Příznivé podmínky' : suit === 'ok' ? 'Přijatelné podmínky' : suit === 'poor' ? 'Nepříznivé podmínky' : 'Načítání…'}
              >
                {d}
              </button>
            )
          })}
        </div>
      </div>

      {/* City cards for selected region / district */}
      <div className="space-y-2">
        {regionLocations.map(loc => (
          <CityCard
            key={loc.name}
            location={loc}
            kp={kp}
            bz={bz}
            now={now}
            cloudCover={cloudCache[loc.name] ?? null}
            isExpanded={expandedCity === loc.name}
            onToggle={() => setExpandedCity(expandedCity === loc.name ? null : loc.name)}
            fmt={fmt}
          />
        ))}
      </div>
    </div>
  )
}

/* ---------- City Card sub-component ---------- */

interface CityCardProps {
  location: CzLocation
  kp: number
  bz: number
  now: Date
  cloudCover: number | null
  isExpanded: boolean
  onToggle: () => void
  fmt: (d: Date | null) => string
}

function CityCard({ location, kp, bz, now, cloudCover, isExpanded, onToggle, fmt }: CityCardProps) {
  const sun = useMemo(() => getSunPosition(now, location.lat, location.lon), [now, location])
  const sunTimes = useMemo(() => getSunTimes(now, location.lat, location.lon), [now, location])
  const addCityPollution = false

  const conditions = useMemo(
    () => calculateObservingConditions(kp, location, now, addCityPollution),
    [kp, location, now, addCityPollution],
  )
  const isDark = sun.darkness >= 0.5
  const prob = useMemo(
    () => getLocalityProbability(kp, bz, location, isDark),
    [kp, bz, location, isDark],
  )

  const bortle = location.bortle
  const northFree = Math.round((1 - location.northHorizonBlock) * 100)

  return (
    <div className="bg-[#04101e]/90 border border-white/8 rounded-2xl overflow-hidden">
      {/* Compact summary row — always visible */}
      <button onClick={onToggle} className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/2 transition-colors text-left">
        {/* Score ring (tiny) */}
        <div className="relative w-10 h-10 shrink-0">
          <svg viewBox="0 0 40 40" className="w-full h-full -rotate-90">
            <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
            <circle cx="20" cy="20" r="16" fill="none" stroke={conditions.ratingColor} strokeWidth="3"
              strokeLinecap="round" strokeDasharray={`${conditions.score} 100.5`} className="transition-all duration-700" />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-xs font-bold" style={{ color: conditions.ratingColor }}>
            {conditions.score}
          </span>
        </div>

        {/* Name + rating */}
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-slate-100 truncate">{location.name}</div>
          <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: conditions.ratingColor }}>{conditions.rating}</div>
        </div>

        {/* Quick metrics */}
        <div className="hidden sm:flex items-center gap-3 text-[11px] text-slate-400">
          <span title="Horizont">🌅 <span className={clsx('font-mono font-bold', prob.horizon >= 20 ? 'text-aurora-green' : prob.horizon >= 5 ? 'text-yellow-400' : 'text-slate-500')}>{prob.horizon}%</span></span>
          <span title="Slunce">{sun.skyIcon} <span className={clsx('font-bold', sun.darkness >= 0.8 ? 'text-green-400' : sun.darkness >= 0.4 ? 'text-yellow-400' : 'text-red-400')}>{sun.skyState}</span></span>
          <span title="Oblačnost">{cloudCover != null ? (cloudCover <= 20 ? '☀️' : cloudCover <= 50 ? '⛅' : '☁️') : '–'} <span className="font-mono">{cloudCover != null ? `${cloudCover}%` : ''}</span></span>
          <span title="Bortle">💡 <span className={clsx('font-mono font-bold', bortle <= 4 ? 'text-green-400' : bortle <= 6 ? 'text-yellow-400' : 'text-red-400')}>{bortle}</span></span>
          <span title="Sever volný">🧭 <span className={clsx('font-mono font-bold', northFree >= 80 ? 'text-green-400' : northFree >= 60 ? 'text-yellow-400' : 'text-red-400')}>{northFree}%</span></span>
        </div>

        <span className={clsx('text-slate-500 transition-transform text-xs', isExpanded && 'rotate-180')}>▼</span>
      </button>

      {/* Expanded detail */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-1 border-t border-white/6 space-y-4">
          {/* Probability + sky info row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Aurora probability */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Aurora</div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Horizont</span>
                <span className={clsx('font-mono font-bold', prob.horizon >= 20 ? 'text-aurora-green' : prob.horizon >= 5 ? 'text-yellow-400' : 'text-slate-500')}>{prob.horizon}%</span>
              </div>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-aurora-green transition-all duration-700" style={{ width: `${prob.horizon}%` }} />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Nad hlavou</span>
                <span className={clsx('font-mono font-bold', prob.overhead >= 5 ? 'text-aurora-pink' : 'text-slate-500')}>{prob.overhead}%</span>
              </div>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-aurora-pink transition-all duration-700" style={{ width: `${prob.overhead}%` }} />
              </div>
              <p className="text-[9px] text-slate-500">{prob.summary}</p>
            </div>

            {/* Sun info */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">{sun.skyIcon} Slunce</div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Stav</span>
                <span className={clsx('font-bold', sun.darkness >= 0.8 ? 'text-green-400' : sun.darkness >= 0.4 ? 'text-yellow-400' : 'text-red-400')}>{sun.skyState}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Západ</span>
                <span className="font-mono text-slate-200">{fmt(sunTimes.sunset)}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Astro. soumrak</span>
                <span className="font-mono text-slate-200">{fmt(sunTimes.astronomicalDusk)}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Východ</span>
                <span className="font-mono text-slate-200">{fmt(sunTimes.sunrise)}</span>
              </div>
            </div>

            {/* Cloud cover */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">☁️ Oblačnost</div>
              {cloudCover != null ? (
                <>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Pokrytí</span>
                    <span className={clsx('font-mono font-bold', cloudCover <= 25 ? 'text-green-400' : cloudCover <= 50 ? 'text-yellow-400' : 'text-red-400')}>{cloudCover}%</span>
                  </div>
                  <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className={clsx('h-full rounded-full transition-all duration-700', cloudCover <= 25 ? 'bg-green-400' : cloudCover <= 50 ? 'bg-yellow-400' : 'bg-red-400')} style={{ width: `${cloudCover}%` }} />
                  </div>
                  <div className="text-xs font-bold">
                    <span className={clsx(cloudCover <= 20 ? 'text-green-400' : cloudCover <= 50 ? 'text-yellow-400' : 'text-red-400')}>
                      {cloudCover <= 20 ? 'Jasno ✓' : cloudCover <= 50 ? 'Polojasno' : cloudCover <= 80 ? 'Oblačno' : 'Zataženo ✗'}
                    </span>
                  </div>
                </>
              ) : (
                <span className="text-xs text-slate-500">Načítání…</span>
              )}
            </div>

            {/* Northern horizon */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">🧭 Sev. obzor</div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Bortle</span>
                <span className={clsx('font-mono font-bold', bortle <= 4 ? 'text-green-400' : bortle <= 6 ? 'text-yellow-400' : 'text-red-400')}>{bortle}/9</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Znečištění</span>
                <span className="text-slate-200">{location.lightPollution}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Sever volný</span>
                <span className={clsx('font-mono font-bold', northFree >= 80 ? 'text-green-400' : northFree >= 60 ? 'text-yellow-400' : 'text-red-400')}>{northFree}%</span>
              </div>
            </div>
          </div>

          {/* Factor bars */}
          <div>
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-2">Detailní faktory</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
              {conditions.factors.map(f => (
                <div key={f.name} className="flex items-center gap-2">
                  <span className="text-sm">{f.icon}</span>
                  <span className="text-xs text-slate-300 w-24 shrink-0">{f.name}</span>
                  <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={clsx('h-full rounded-full transition-all duration-700',
                        f.status === 'good' ? 'bg-green-400' : f.status === 'ok' ? 'bg-yellow-400' : 'bg-red-400'
                      )}
                      style={{ width: `${Math.round(f.score * 100)}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-slate-300 w-12 text-right">{f.value}</span>
                  <span className={clsx('w-1.5 h-1.5 rounded-full shrink-0',
                    f.status === 'good' ? 'bg-green-400' : f.status === 'ok' ? 'bg-yellow-400' : 'bg-red-400'
                  )} />
                </div>
              ))}
            </div>
          </div>

          {/* Photo recommendation */}
          <div className="pt-2 border-t border-white/6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm">📸</span>
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Focení</span>
              <span className={clsx('ml-auto px-2 py-0.5 rounded-full text-[10px] font-bold',
                conditions.photoRec.possible
                  ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                  : 'bg-red-500/10 text-red-400 border border-red-500/20'
              )}>
                {conditions.photoRec.possible ? '✓ Možné' : '✗ Nevhodné'}
              </span>
            </div>
            {conditions.photoRec.possible && (
              <div className="flex flex-wrap gap-2 mb-2">
                {[
                  { l: 'ISO', v: conditions.photoRec.iso },
                  { l: 'Exp', v: conditions.photoRec.shutter },
                  { l: 'f/', v: conditions.photoRec.aperture },
                  { l: 'mm', v: conditions.photoRec.focalLength },
                ].map(s => (
                  <span key={s.l} className="text-[10px] bg-white/4 rounded-sm px-2 py-1 border border-white/6">
                    <span className="text-slate-500">{s.l}</span> <span className="font-mono text-slate-200">{s.v}</span>
                  </span>
                ))}
              </div>
            )}
            <div className="space-y-1">
              {conditions.photoRec.tips.slice(0, 2).map((tip, i) => (
                <div key={i} className="flex items-start gap-1.5">
                  <span className="text-aurora-teal text-[10px] mt-0.5">›</span>
                  <span className="text-[11px] text-slate-300 leading-relaxed">{tip}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Observation spots */}
          {OBSERVATION_SPOTS[location.name] && (
            <div className="pt-2 border-t border-white/6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm">📍</span>
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Top 5 míst k pozorování</span>
              </div>
              <div className="space-y-2">
                {OBSERVATION_SPOTS[location.name].map((spot, i) => (
                  <div key={i} className="flex items-start gap-2.5 group">
                    <span className={clsx(
                      'shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5',
                      i === 0 ? 'bg-aurora-green/20 text-aurora-green border border-aurora-green/30'
                        : 'bg-white/6 text-slate-400 border border-white/8'
                    )}>
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-slate-200">{spot.name}</span>
                        <a
                          href={`https://mapy.cz/zakladni?x=${spot.lon}&y=${spot.lat}&z=15`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[9px] text-aurora-teal/70 hover:text-aurora-teal transition-colors shrink-0"
                        >
                          🗺 mapa
                        </a>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-relaxed mt-0.5">{spot.why}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
