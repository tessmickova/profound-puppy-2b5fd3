// lib/alerts.ts
import { createSupabaseAdmin } from './supabase'
import type { VisibilityLevel } from './noaa'
import { deriveVisibility, VISIBILITY_INFO } from './noaa'

const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`
const WA_TOKEN     = process.env.WHATSAPP_TOKEN
const WA_PHONE_ID  = process.env.WHATSAPP_PHONE_ID

function buildAlertMessage(kp: number, bz: number | null, channel: 'telegram' | 'whatsapp') {
  const vis  = deriveVisibility({ kp, bz })
  const info = VISIBILITY_INFO[vis]
  const bzNote = bz !== null && bz < -5
    ? `\nBz: ${bz.toFixed(1)} nT ✅ (jižní = záře zesiluje!)`
    : bz !== null ? `\nBz: ${bz.toFixed(1)} nT` : ''

  const body =
    `${info.icon} <b>Aurora Alert – KP${kp.toFixed(1)}</b>\n\n` +
    `<b>${info.label}</b>${bzNote}\n\n` +
    `${info.desc}\n\n` +
    `🔗 auroradog.cz`

  return channel === 'telegram' ? body : body.replace(/<\/?b>/g, '*').replace(/<[^>]+>/g, '')
}

async function sendTelegram(chatId: string, text: string): Promise<boolean> {
  try {
    const res = await fetch(`${TELEGRAM_API}/sendMessage`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
    })
    return res.ok
  } catch { return false }
}

async function sendWhatsApp(phone: string, text: string): Promise<boolean> {
  if (!WA_TOKEN || !WA_PHONE_ID) return false
  try {
    const res = await fetch(`https://graph.facebook.com/v19.0/${WA_PHONE_ID}/messages`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${WA_TOKEN}` },
      body:    JSON.stringify({
        messaging_product: 'whatsapp',
        to:                phone,
        type:              'text',
        text:              { body: text },
      }),
    })
    return res.ok
  } catch { return false }
}

export async function dispatchAlerts(kp: number, bz: number | null = null) {
  const supabase = createSupabaseAdmin()

  const { data: subscribers } = await supabase
    .from('subscribers')
    .select('*')
    .eq('active', true)
    .lte('kp_threshold', Math.floor(kp))

  if (!subscribers?.length) return { sent: 0, total: 0 }

  const oneHourAgo = new Date(Date.now() - 36e5).toISOString()
  const { data: recentLogs } = await supabase
    .from('alert_log')
    .select('recipient')
    .gte('sent_at', oneHourAgo)
    .eq('success', true)

  const alreadySent = new Set(recentLogs?.map(l => l.recipient) ?? [])

  let sentCount = 0

  for (const sub of subscribers) {
    if (alreadySent.has(sub.contact)) continue

    const msg     = buildAlertMessage(kp, bz, sub.channel as 'telegram' | 'whatsapp')
    let   success = false

    if (sub.channel === 'telegram') {
      success = await sendTelegram(sub.contact, msg)
    } else if (sub.channel === 'whatsapp') {
      success = await sendWhatsApp(sub.contact, msg)
    }

    await supabase.from('alert_log').insert({
      channel:    sub.channel,
      recipient:  sub.contact,
      kp_at_send: kp,
      message:    msg,
      success,
      error:      success ? null : 'send failed',
    })

    if (success) sentCount++
  }

  return { sent: sentCount, total: subscribers.length }
}
