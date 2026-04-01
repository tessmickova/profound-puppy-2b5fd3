// lib/space-weather/nasa/getGeomagneticStorms.ts
import { fetchNasaDonki, dateRange } from './fetchNasaDonki'
import type { RawGST, DonkiGST } from './types'

export async function getGeomagneticStorms(days = 14): Promise<DonkiGST[]> {
  const range = dateRange(days)
  const raw = await fetchNasaDonki<RawGST[]>('GST', range)

  return (raw ?? [])
    .map(item => {
      const kpValues = (item.allKpIndex ?? []).map(k => k.kpIndex).filter(v => typeof v === 'number')
      return {
        id:        item.gstID,
        startTime: item.startTime,
        maxKp:     kpValues.length > 0 ? Math.max(...kpValues) : null,
        link:      item.link ?? null,
      }
    })
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
}
