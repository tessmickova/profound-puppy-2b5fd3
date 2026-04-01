// lib/space-weather/nasa/getFlares.ts
import { fetchNasaDonki, dateRange } from './fetchNasaDonki'
import type { RawFlare, DonkiFlare } from './types'

export async function getFlares(days = 14): Promise<DonkiFlare[]> {
  const range = dateRange(days)
  const raw = await fetchNasaDonki<RawFlare[]>('FLR', range)

  return (raw ?? [])
    .map(item => ({
      id:              item.flrID,
      beginTime:       item.beginTime,
      peakTime:        item.peakTime ?? null,
      endTime:         item.endTime ?? null,
      classType:       item.classType ?? 'unknown',
      sourceLocation:  item.sourceLocation ?? null,
      activeRegionNum: item.activeRegionNum ?? null,
      link:            item.link ?? '',
    }))
    .sort((a, b) => new Date(b.beginTime).getTime() - new Date(a.beginTime).getTime())
}
