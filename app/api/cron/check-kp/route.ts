// app/api/cron/check-kp/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin }        from '@/lib/supabase'
import { dispatchAlerts }             from '@/lib/alerts'
import { fetchAllAuroraData }         from '@/lib/noaa'

const CRON_SECRET = process.env.CRON_SECRET

export async function GET(req: NextRequest) {
  if (CRON_SECRET) {
    const auth = req.headers.get('authorization')
    if (auth !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  let supabase
  try {
    supabase = createSupabaseAdmin()
  } catch (e) {
    return NextResponse.json({ error: 'Supabase init failed', details: String(e) }, { status: 500 })
  }

  let data
  try {
    data = await fetchAllAuroraData()
    await supabase.from('aurora_cache').insert({
      fetched_at:  data.fetchedAt,
      kp_current:  data.kpCurrent,
      bz:          data.solarWind?.bz ?? null,
      sw_speed:    data.solarWind?.speed ?? null,
      sw_density:  data.solarWind?.density ?? null,
      payload:     data as any,
    })
  } catch (err) {
    return NextResponse.json({ error: 'fetch failed', details: String(err) }, { status: 500 })
  }

  const kp = data.kpCurrent
  const bz = data.solarWind?.bz ?? null

  let alertResult = { sent: 0, total: 0 }
  if (kp >= 3) {
    alertResult = await dispatchAlerts(kp, bz)
  }

  return NextResponse.json({
    kp,
    bz,
    alerts: alertResult,
    cachedAt: data.fetchedAt,
  })
}
