// lib/space-weather/nasa/index.ts
export { fetchNasaDonki, dateRange } from './fetchNasaDonki'
export { getCME }                    from './getCME'
export { getCMEArrival }             from './getCMEArrival'
export { getFlares }                 from './getFlares'
export { getGeomagneticStorms }      from './getGeomagneticStorms'
export type {
  DonkiCME,
  DonkiCMEArrival,
  DonkiFlare,
  DonkiGST,
  DonkiData,
} from './types'

import { getCME }                from './getCME'
import { getCMEArrival }         from './getCMEArrival'
import { getFlares }             from './getFlares'
import { getGeomagneticStorms }  from './getGeomagneticStorms'
import type { DonkiData }       from './types'

/** Fetch all DONKI endpoints in parallel, never crash on partial failure */
export async function fetchAllDonki(days = 14): Promise<DonkiData> {
  const [cmes, arrivals, flares, storms] = await Promise.allSettled([
    getCME(days),
    getCMEArrival(days),
    getFlares(days),
    getGeomagneticStorms(days),
  ])

  return {
    cmes:      cmes.status     === 'fulfilled' ? cmes.value     : [],
    arrivals:  arrivals.status === 'fulfilled' ? arrivals.value  : [],
    flares:    flares.status   === 'fulfilled' ? flares.value    : [],
    storms:    storms.status   === 'fulfilled' ? storms.value    : [],
    fetchedAt: new Date().toISOString(),
  }
}
