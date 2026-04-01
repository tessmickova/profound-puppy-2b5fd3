// lib/space-weather/nasa/getCME.ts
import { fetchNasaDonki, dateRange } from './fetchNasaDonki'
import type { RawCME, DonkiCME } from './types'

export async function getCME(days = 14): Promise<DonkiCME[]> {
  const range = dateRange(days)
  const raw = await fetchNasaDonki<RawCME[]>('CME', range)

  return (raw ?? [])
    .map(item => {
      const analyses = item.cmeAnalyses ?? []
      const best = analyses.find(a => a.isMostAccurate) ?? analyses[0] ?? null

      return {
        activityID:      item.activityID,
        startTime:       item.startTime,
        sourceLocation:  item.sourceLocation ?? null,
        activeRegionNum: item.activeRegionNum ?? null,
        note:            item.note ?? '',
        instruments:     (item.instruments ?? []).map(i => i.displayName),
        link:            item.link ?? '',
        linkedEventIds:  (item.linkedEvents ?? []).map(e => e.activityID),
        analysis: best ? {
          isMostAccurate: best.isMostAccurate,
          time21_5:       best.time21_5 ?? null,
          latitude:       best.latitude ?? null,
          longitude:      best.longitude ?? null,
          halfAngle:      best.halfAngle ?? null,
          speed:          best.speed ?? null,
          type:           best.type ?? null,
        } : null,
      }
    })
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
}
