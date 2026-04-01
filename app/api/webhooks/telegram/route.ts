// app/api/webhooks/telegram/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin }        from '@/lib/supabase'

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!
const SECRET    = process.env.TELEGRAM_WEBHOOK_SECRET!

async function sendMessage(chatId: number | string, text: string) {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
  })
}

export async function POST(req: NextRequest) {
  const secret = req.headers.get('X-Telegram-Bot-Api-Secret-Token')
  if (SECRET && secret !== SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body   = await req.json()
  const msg    = body?.message
  if (!msg) return NextResponse.json({ ok: true })

  const chatId  = msg.chat.id
  const text    = msg.text?.trim() ?? ''
  const supabase = createSupabaseAdmin()

  // /start
  if (text.startsWith('/start')) {
    await supabase.from('subscribers').upsert(
      { channel: 'telegram', contact: String(chatId), kp_threshold: 4, active: true },
      { onConflict: 'channel,contact' }
    )
    await sendMessage(chatId,
      `🐺 <b>Vítej v AuroraDog alertech!</b>\n\n` +
      `Budeš dostávat upozornění když KP index dosáhne <b>KP4</b> nebo výš.\n\n` +
      `<b>Příkazy:</b>\n` +
      `/alert kp3 – nastav jiný práh (kp2–kp9)\n` +
      `/stop – vypnout alerty\n` +
      `/stav – aktuální stav záře\n\n` +
      `🌌 Hodně jasné noci! Tým AuroraDog`
    )
    return NextResponse.json({ ok: true })
  }

  // /alert kpX
  if (text.startsWith('/alert')) {
    const match = text.match(/kp(\d)/i)
    const kp    = match ? parseInt(match[1]) : 4
    await supabase.from('subscribers')
      .update({ kp_threshold: kp, active: true })
      .eq('channel', 'telegram').eq('contact', String(chatId))
    await sendMessage(chatId,
      `✅ Nastaveno! Dostaneš alert při KP<b>${kp}</b> nebo výš.\n` +
      `${kp >= 5 ? '🌈 KP5+ = záře viditelná pouhým okem v ČR!' : kp >= 4 ? '🌅 KP4 = záře na obzoru z tmavých míst' : '📷 KP' + kp + ' = fotografická záře'}`
    )
    return NextResponse.json({ ok: true })
  }

  // /stop
  if (text.startsWith('/stop')) {
    await supabase.from('subscribers')
      .update({ active: false })
      .eq('channel', 'telegram').eq('contact', String(chatId))
    await sendMessage(chatId, '😢 Alerty vypnuty. Znovu aktivovat: /start')
    return NextResponse.json({ ok: true })
  }

  // /stav
  if (text.startsWith('/stav')) {
    const { data: cache } = await supabase
      .from('aurora_cache')
      .select('kp_current, bz, sw_speed, fetched_at')
      .order('fetched_at', { ascending: false })
      .limit(1)
      .single()

    if (cache) {
      const kp  = Number(cache.kp_current)
      const vis = kp >= 7 ? '🎆 Záře nad ČR!' : kp >= 5 ? '🌈 Záře na obzoru ČR' : kp >= 4 ? '🌅 Fotografická záře' : kp >= 2 ? '📷 Kamerová záře' : '😴 Klidno'
      const bzVal = cache.bz != null ? Number(cache.bz) : null
      const swVal = cache.sw_speed != null ? Number(cache.sw_speed) : null
      await sendMessage(chatId,
        `🌍 <b>Aktuální stav (${new Date(cache.fetched_at).toLocaleTimeString('cs-CZ')} UTC)</b>\n\n` +
        `KP index: <b>${kp.toFixed(1)}</b>\n` +
        `Bz: <b>${bzVal?.toFixed(1) ?? '?'} nT</b> ${(bzVal ?? 0) < -5 ? '✅ Jižní – dobré!' : ''}\n` +
        `Sluneční vítr: <b>${swVal?.toFixed(0) ?? '?'} km/s</b>\n\n` +
        `${vis}`
      )
    } else {
      await sendMessage(chatId, '⚠️ Data dočasně nedostupná, zkus za chvíli.')
    }
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ ok: true })
}
