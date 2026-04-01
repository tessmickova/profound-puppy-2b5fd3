// lib/space-weather/nasa/fetchNasaDonki.ts

const NASA_BASE = 'https://api.nasa.gov/DONKI'

export async function fetchNasaDonki<T>(
  endpoint: string,
  params?: Record<string, string>,
): Promise<T> {
  const key = process.env.NASA_API_KEY || 'DEMO_KEY'
  const url = new URL(`${NASA_BASE}/${endpoint}`)
  url.searchParams.set('api_key', key)
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, v)
    }
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10000)
  try {
    const res = await fetch(url.toString(), { next: { revalidate: 900 }, signal: controller.signal })
    if (!res.ok) {
      throw new Error(`DONKI ${endpoint} → ${res.status} ${res.statusText}`)
    }
    return res.json()
  } finally {
    clearTimeout(timeout)
  }
}

/** Returns { startDate, endDate } for the last N days */
export function dateRange(days = 14): { startDate: string; endDate: string } {
  const end   = new Date()
  const start = new Date(end.getTime() - days * 864e5)
  return {
    startDate: start.toISOString().slice(0, 10),
    endDate:   end.toISOString().slice(0, 10),
  }
}
