'use client'
// lib/hooks/useAuroraData.ts
import useSWR from 'swr'
import { useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { deriveVisibility, VISIBILITY_INFO } from '@/lib/noaa'
import type { AggregatedData, KpPoint, SolarWindPoint, CmeEvent, SolarFlare, ForecastDay, VisibilityLevel, HpiPoint, DstPoint, AuroralOvalPoint } from '@/lib/noaa'
import type { DonkiData } from '@/lib/space-weather/nasa'
import { getMoonInfo, getSunPosition } from '@/lib/astronomy'

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`API ${res.status}`)
  return res.json()
}

export function useAuroraData() {
  const { data, error, isLoading, mutate } = useSWR<AggregatedData & { _source?: string; fetchedAt?: string }>(
    '/api/aurora-data',
    fetcher,
    {
      refreshInterval: 60_000,
      revalidateOnFocus: true,
      dedupingInterval: 15_000,
      errorRetryCount: 3,
      errorRetryInterval: 5000,
      keepPreviousData: true,
    }
  )

  // Supabase Realtime: listen for aurora_cache inserts and refresh
  useEffect(() => {
    const client = supabase()
    const channel = client
      .channel('aurora_cache_realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'aurora_cache' },
        () => { mutate() }
      )
      .subscribe()

    return () => { client.removeChannel(channel) }
  }, [mutate])

  const kp         = data?.kpCurrent ?? 0
  const kp3h       = data?.kp3h ?? kp
  const bz         = data?.solarWind?.bz ?? null
  const swSpeed    = data?.solarWind?.speed ?? null
  const swDensity  = data?.solarWind?.density ?? null
  const hpiCurrent = data?.hpiCurrent ?? null
  const dstCurrent = data?.dstCurrent ?? null
  const cmeArr     = data?.cme ?? []
  const hasCmeImpact = cmeArr.some(c => c.earthImpact)

  const now = new Date()
  const moon = getMoonInfo(now)
  const sun = getSunPosition(now, 50.08, 14.44)

  const visibility = deriveVisibility({
    kp, hpi: hpiCurrent, dst: dstCurrent, bz, swSpeed, hasCmeImpact,
    darkness: sun.darkness, moonIllumination: moon.illumination,
  })
  const visInfo    = VISIBILITY_INFO[visibility]
  const kpHistory  = data?.kpHistory ?? []
  const swHistory  = data?.solarWindHistory ?? []
  const cme        = cmeArr
  const flares     = data?.flares ?? []
  const forecast   = data?.forecast ?? []
  const donki      = (data?.donki ?? null) as DonkiData | null
  const hpiHistory = data?.hpiHistory ?? []
  const dstHistory = data?.dstHistory ?? []
  const auroralOval = data?.auroralOval ?? []
  const fetchedAt  = data?.fetchedAt ?? null
  const cacheSource = (data as any)?._source ?? null

  return {
    data,
    isLoading,
    error,
    refresh: mutate,
    kp,
    kp3h,
    visibility,
    visInfo,
    bz,
    swSpeed,
    swDensity,
    kpHistory,
    swHistory,
    cme,
    flares,
    forecast,
    donki,
    hpiCurrent,
    hpiHistory,
    dstCurrent,
    dstHistory,
    auroralOval,
    fetchedAt,
    cacheSource,
  }
}
