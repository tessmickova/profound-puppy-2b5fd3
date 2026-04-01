// app/api/aurora-data/route.ts
import { NextResponse }       from 'next/server'
import { fetchAllAuroraData } from '@/lib/noaa'
import { createSupabaseAdmin } from '@/lib/supabase'

const CACHE_TTL_SECONDS = parseInt(process.env.LIVE_DATA_REVALIDATE_SEC ?? '60')

export async function GET() {
  try {
    return await handleGet()
  } catch (e) {
    console.error('Unhandled error in aurora-data route:', e)
    return NextResponse.json(
      { error: 'Interní chyba serveru', detail: String(e) },
      { status: 503 }
    )
  }
}

async function handleGet() {
  let supabase: ReturnType<typeof createSupabaseAdmin> | null = null
  try {
    supabase = createSupabaseAdmin()
  } catch (e) {
    console.error('Supabase init failed:', e)
  }

  // 1. Try cache
  let cached: Record<string, unknown> | null = null
  if (supabase) {
    try {
      const { data: row } = await supabase
        .from('aurora_cache')
        .select('*')
        .order('fetched_at', { ascending: false })
        .limit(1)
        .single()

      if (row) {
        const age = (Date.now() - new Date(row.fetched_at).getTime()) / 1000
        if (age < CACHE_TTL_SECONDS) {
          return NextResponse.json({
            ...(row.payload as Record<string, unknown>),
            _source:    'cache',
            _cacheAge:  Math.round(age),
            fetchedAt:  row.fetched_at,
          }, {
            headers: {
              'Cache-Control': `public, s-maxage=${CACHE_TTL_SECONDS - Math.round(age)}, stale-while-revalidate=30`,
              'X-Cache':       'HIT',
              'X-Cache-Age':   String(Math.round(age)),
            }
          })
        }
        cached = row.payload as Record<string, unknown>
      }
    } catch (e) {
      console.error('Supabase cache read failed:', e)
    }
  }

  // 2. Fetch fresh data
  let data
  try {
    data = await fetchAllAuroraData()
  } catch (err) {
    console.error('NOAA fetch failed:', err)
    if (cached) {
      return NextResponse.json({ ...cached, _source: 'stale-cache' })
    }
    return NextResponse.json({ error: 'Data dočasně nedostupná' }, { status: 503 })
  }

  // 3. Save to Supabase cache (non-blocking)
  if (supabase) {
    Promise.resolve(supabase.from('aurora_cache').insert({
      fetched_at:  data.fetchedAt,
      kp_current:  data.kpCurrent,
      bz:          data.solarWind?.bz ?? null,
      sw_speed:    data.solarWind?.speed ?? null,
      sw_density:  data.solarWind?.density ?? null,
      payload:     data as any,
    })).then(() =>
      Promise.resolve(supabase!.rpc('cleanup_aurora_cache', { keep_rows: 100 }))
    ).catch(e => console.error('Cache write failed:', e))
  }

  // 4. Return to client
  return NextResponse.json(
    { ...data, _source: 'live' },
    {
      headers: {
        'Cache-Control': `public, s-maxage=${CACHE_TTL_SECONDS}, stale-while-revalidate=30`,
        'X-Cache':       'MISS',
      }
    }
  )
}
