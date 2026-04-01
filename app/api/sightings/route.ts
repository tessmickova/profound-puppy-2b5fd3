// app/api/sightings/route.ts
import { NextResponse } from 'next/server'
import { createSupabaseBrowser } from '@/lib/supabase'

/** GET: fetch sightings summary for recent nights, or individual pins with location */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const withLocation = searchParams.get('with_location') === 'true'

  const sb = createSupabaseBrowser()

  if (withLocation) {
    // Return individual sightings with lat/lon for map pins (last 48 hours)
    const { data, error } = await sb
      .from('sightings')
      .select('id, created_at, night_date, type, lat, lon')
      .not('lat', 'is', null)
      .not('lon', 'is', null)
      .gte('created_at', new Date(Date.now() - 48 * 3600_000).toISOString())
      .order('created_at', { ascending: false })
      .limit(200)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data ?? [])
  }

  // Default: aggregated summary
  const { data, error } = await sb
    .from('sightings')
    .select('night_date, type')
    .gte('night_date', new Date(Date.now() - 90 * 86400_000).toISOString().slice(0, 10))
    .order('night_date', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Aggregate per night
  const map = new Map<string, { seen: number; photo: number }>()
  for (const row of data ?? []) {
    const entry = map.get(row.night_date) ?? { seen: 0, photo: 0 }
    if (row.type === 'seen') entry.seen++
    else entry.photo++
    map.set(row.night_date, entry)
  }

  const summary = Array.from(map.entries()).map(([date, counts]) => ({
    night_date: date,
    seen_count: counts.seen,
    photo_count: counts.photo,
  }))

  return NextResponse.json(summary)
}

/** POST: report a sighting */
export async function POST(req: Request) {
  const body = await req.json()
  const { type, kp, bz, fingerprint, lat, lon } = body as {
    type?: string
    kp?: number
    bz?: number
    fingerprint?: string
    lat?: number
    lon?: number
  }

  if (!type || !['seen', 'photo'].includes(type)) {
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  }
  if (!fingerprint || typeof fingerprint !== 'string' || fingerprint.length < 8 || fingerprint.length > 128) {
    return NextResponse.json({ error: 'Invalid fingerprint' }, { status: 400 })
  }

  // Validate coordinates if provided (must be within CZ bounds roughly)
  let validLat: number | null = null
  let validLon: number | null = null
  if (lat != null && lon != null && typeof lat === 'number' && typeof lon === 'number') {
    if (lat >= 48.5 && lat <= 51.1 && lon >= 12.0 && lon <= 18.9) {
      validLat = Math.round(lat * 10000) / 10000
      validLon = Math.round(lon * 10000) / 10000
    }
  }

  // Determine tonight's date (CZ timezone, night = after 18:00 belongs to today, before 06:00 belongs to yesterday)
  const now = new Date()
  const czOffset = getCzOffset(now)
  const czHour = (now.getUTCHours() + czOffset) % 24
  const nightDate = new Date(now)
  if (czHour < 6) nightDate.setDate(nightDate.getDate() - 1)
  const dateStr = nightDate.toISOString().slice(0, 10)

  const sb = createSupabaseBrowser()
  const { error } = await sb.from('sightings').upsert({
    night_date: dateStr,
    type: type as 'seen' | 'photo',
    kp_at_time: kp ?? null,
    bz_at_time: bz ?? null,
    fingerprint,
    lat: validLat,
    lon: validLon,
  }, { onConflict: 'night_date,type,fingerprint' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, night_date: dateStr })
}

function getCzOffset(date: Date): number {
  // CET = UTC+1, CEST = UTC+2
  // CEST: last Sunday of March to last Sunday of October
  const year = date.getUTCFullYear()
  const marchLast = new Date(Date.UTC(year, 2, 31))
  const marchSun = 31 - marchLast.getUTCDay()
  const octLast = new Date(Date.UTC(year, 9, 31))
  const octSun = 31 - octLast.getUTCDay()
  const cestStart = Date.UTC(year, 2, marchSun, 1)
  const cestEnd = Date.UTC(year, 9, octSun, 1)
  return date.getTime() >= cestStart && date.getTime() < cestEnd ? 2 : 1
}
