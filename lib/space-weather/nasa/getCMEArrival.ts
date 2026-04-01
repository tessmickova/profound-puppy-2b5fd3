// lib/space-weather/nasa/getCMEArrival.ts
// Compute estimated Earth-arrival times from CME speed data
// NASA DONKI CMEAnalysis endpoint doesn't provide arrivalTime directly,
// so we estimate from the CME speed + Sun-Earth distance (1 AU ≈ 150M km).

import { getCME } from './getCME'
import type { DonkiCMEArrival } from './types'

/** Sun-Earth distance in km (1 AU) */
const AU_KM = 149_597_870

export async function getCMEArrival(days = 14): Promise<DonkiCMEArrival[]> {
  const cmes = await getCME(days)

  return cmes
    .filter(cme => cme.analysis?.speed && cme.analysis.speed > 0)
    .map(cme => {
      const speed = cme.analysis!.speed!
      const travelSeconds = AU_KM / speed
      const startMs = new Date(cme.startTime).getTime()
      const arrivalMs = startMs + travelSeconds * 1000

      return {
        activityID:     cme.activityID,
        arrivalTime:    new Date(arrivalMs).toISOString(),
        linkedEventIds: cme.linkedEventIds,
        note:           `Estimated from speed ${Math.round(speed)} km/s (travel ~${Math.round(travelSeconds / 3600)}h)`,
        link:           cme.link || null,
      }
    })
    .sort((a, b) => new Date(b.arrivalTime).getTime() - new Date(a.arrivalTime).getTime())
}
