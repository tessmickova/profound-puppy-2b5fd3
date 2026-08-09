// Ohlášení změn přes IndexNow.
//
// IndexNow je společný protokol Bingu, Seznamu, Yandexu a dalších: místo
// čekání, až crawler přijde sám, mu adresu pošleme. Google IndexNow
// nepoužívá — tam pomůže jen mapa webu a odkazy.
//
// Spouští se **ručně po nasazení**: `npm run indexnow`. Automaticky při
// buildu ne — build běží i tehdy, kdy se na produkci nic nemění, a
// opakované hlášení nezměněných adres si služby vykládají jako spam.
//
// Bez `INDEXNOW_KEY` a bez produkční adresy skript nic neposílá a řekne
// proč. Vymyslet si klíč nebo doménu by znamenalo tiše odesílat data, která
// nikam nepatří.

import { ADRESY } from '../lib/names/adresy'

const PUVOD = (process.env.NEXT_PUBLIC_URL ?? '').trim().replace(/\/$/, '')
const KLIC = (process.env.INDEXNOW_KEY ?? '').trim()
const SLUZBA = 'https://api.indexnow.org/IndexNow'

const adresy = () => ADRESY.map(a => `${PUVOD}${a.cesta === '/' ? '' : a.cesta}`)

async function main() {
  const chybi: string[] = []
  if (!KLIC) chybi.push('INDEXNOW_KEY (vygenerujte náhodných 32 znaků a uložte do prostředí)')
  if (!PUVOD.startsWith('https://')) chybi.push('NEXT_PUBLIC_URL s produkční doménou')
  if (PUVOD.includes('workers.dev')) chybi.push('produkční doména — workers.dev je náhled, ten se nehlásí')

  if (chybi.length) {
    console.error('IndexNow se nespustil, chybí:')
    for (const c of chybi) console.error(`  • ${c}`)
    process.exit(1)
  }

  const seznam = adresy()
  const telo = {
    host: new URL(PUVOD).host,
    key: KLIC,
    keyLocation: `${PUVOD}/indexnow.txt`,
    urlList: seznam,
  }

  console.log(`Hlásím ${seznam.length} adres z ${telo.host}…`)
  const odpoved = await fetch(SLUZBA, {
    method: 'POST',
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify(telo),
  })

  // 200 = přijato, 202 = přijato, klíč se teprve ověřuje.
  if (odpoved.status === 200 || odpoved.status === 202) {
    console.log(`Hotovo (${odpoved.status}).`)
    return
  }

  console.error(`IndexNow odpověděl ${odpoved.status}: ${await odpoved.text()}`)
  if (odpoved.status === 403) {
    console.error(`Klíč se nepodařilo ověřit — zkontrolujte, že ${PUVOD}/indexnow.txt vrací stejnou hodnotu jako INDEXNOW_KEY.`)
  }
  process.exit(1)
}

main().catch(e => {
  console.error('IndexNow selhal:', e instanceof Error ? e.message : e)
  process.exit(1)
})
