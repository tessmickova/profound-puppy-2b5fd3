import { JE_NAHLED } from '@/lib/config'

// Ověřovací soubor pro IndexNow (Bing, Seznam, Yandex a další).
//
// Protokol chce soubor s klíčem někde na doméně a jeho adresu pak posíláme
// v `keyLocation`. Držíme ho na pevné adrese `/indexnow.txt` místo
// `/{klíč}.txt` — Next.js neumí segment, který je zčásti dynamický, a
// `keyLocation` je podle specifikace plnohodnotná varianta.
//
// Klíč **není v repozitáři**. Vygeneruje se jednou a uloží do proměnné
// prostředí `INDEXNOW_KEY`; dokud tam není, tenhle soubor neexistuje a
// odesílání se ani nespustí. Vymyšlený klíč by službu jen tiše rozbil.

export const dynamic = 'force-static'

export function GET() {
  const klic = (process.env.INDEXNOW_KEY ?? '').trim()

  // Na náhledu ne — jinak by se dala potvrdit adresa, která nemá být v indexu.
  if (JE_NAHLED || !klic) {
    return new Response('Not found', { status: 404 })
  }

  return new Response(klic, {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=86400',
    },
  })
}
