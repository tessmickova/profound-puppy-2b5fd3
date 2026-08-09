// Kontrola SEO na skutečně vydaném HTML.
//
// Záměrně nekontroluje zdrojáky, ale odpovědi běžícího serveru. Titulek se
// dá v Next.js poskládat na třech místech (layout, `metadata`,
// `generateMetadata`) a jediné, co se počítá, je to, co nakonec vyleze.
//
// Spuštění:  npm run kontrola:seo            (proti http://localhost:3111)
//            npm run kontrola:seo -- https://…  (proti nasazenému webu)
//
// Vrací nenulový kód, když najde chybu, která poškozuje indexaci. Drobnosti
// jen vypíše — nemá smysl kvůli o dva znaky delšímu popisku zastavit vydání.

import { ADRESY, VRSTVY } from '../lib/names/adresy'
import type { Vrstva } from '../lib/names/adresy'

const ZAKLAD = (process.argv[2] ?? process.env.SEO_ZAKLADNA ?? 'http://localhost:3111').replace(/\/$/, '')

// Meze vycházejí z toho, kolik Google reálně zobrazí, ne z magických čísel:
// titulek se ořezává kolem 580 px (≈ 60 znaků), popisek kolem 920 px
// (≈ 160 znaků). Krátký popisek si vyhledávač přepíše sám.
const TITULEK_MAX = 65
const POPIS_MIN = 70
const POPIS_MAX = 165

interface Nalez { cesta: string; problem: string }

const kriticke: Nalez[] = []
const drobnosti: Nalez[] = []

const mezi = (s: string) => s.replace(/\s+/g, ' ').trim()

/** Cesta z absolutní adresy; `null`, když to adresa vůbec není. */
function bezpecnaCesta(adresa: string): string | null {
  try { return new URL(adresa).pathname } catch { return null }
}

/** Původ z absolutní adresy; `null`, když to adresa vůbec není. */
function puvod(adresa: string): string | null {
  try { return new URL(adresa).origin } catch { return null }
}

function vyrizni(html: string, vzor: RegExp): string | null {
  const m = vzor.exec(html)
  return m ? mezi(m[1]) : null
}

function odkodujEntity(s: string): string {
  return s
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#(\d+);/g, (_, c) => String.fromCharCode(Number(c)))
    .replace(/&#x([0-9a-f]+);/gi, (_, c) => String.fromCharCode(parseInt(c, 16)))
}

interface Stranka {
  cesta: string
  vrstva: Vrstva
  stav: number
  titulek: string | null
  popis: string | null
  kanonicka: string | null
  h1: string[]
  roboti: string | null
  jsonLd: unknown[]
  chybnyJsonLd: number
}

async function nacti(cesta: string, vrstva: Vrstva): Promise<Stranka> {
  const odpoved = await fetch(`${ZAKLAD}${cesta}`, { redirect: 'manual' })
  const html = odpoved.ok ? await odpoved.text() : ''

  const h1 = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)]
    .map(m => mezi(odkodujEntity(m[1].replace(/<[^>]+>/g, ' '))))

  const jsonLd: unknown[] = []
  let chybnyJsonLd = 0
  for (const m of html.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)) {
    try { jsonLd.push(JSON.parse(m[1])) } catch { chybnyJsonLd++ }
  }

  const titulek = vyrizni(html, /<title>([\s\S]*?)<\/title>/i)
  const popis = vyrizni(html, /<meta name="description" content="([^"]*)"/i)

  return {
    cesta,
    vrstva,
    stav: odpoved.status,
    titulek: titulek ? odkodujEntity(titulek) : null,
    popis: popis ? odkodujEntity(popis) : null,
    kanonicka: vyrizni(html, /<link rel="canonical" href="([^"]*)"/i),
    h1,
    roboti: vyrizni(html, /<meta name="robots" content="([^"]*)"/i),
    jsonLd,
    chybnyJsonLd,
  }
}

/** Načítáme po dávkách — sériově by 218 adres trvalo minuty. */
async function poDavkach<T, V>(polozky: T[], velikost: number, prace: (p: T) => Promise<V>): Promise<V[]> {
  const vysledky: V[] = []
  for (let i = 0; i < polozky.length; i += velikost) {
    vysledky.push(...await Promise.all(polozky.slice(i, i + velikost).map(prace)))
  }
  return vysledky
}

async function main() {
  console.log(`Kontroluji ${ADRESY.length} adres na ${ZAKLAD}…\n`)

  let stranky: Stranka[]
  try {
    stranky = await poDavkach(ADRESY, 12, a => nacti(a.cesta, a.vrstva))
  } catch (e) {
    console.error(`Server na ${ZAKLAD} neodpovídá (${e instanceof Error ? e.message : e}).`)
    console.error('Spusťte `npx next start -p 3111`, nebo předejte adresu: npm run kontrola:seo -- https://…')
    process.exit(1)
  }

  // ── stránka po stránce ──────────────────────────────────────────────────
  for (const s of stranky) {
    if (s.stav !== 200) {
      kriticke.push({ cesta: s.cesta, problem: `vrací ${s.stav}, ale je v mapě webu` })
      continue
    }

    if (!s.titulek) kriticke.push({ cesta: s.cesta, problem: 'chybí titulek' })
    else if (s.titulek.length > TITULEK_MAX) {
      drobnosti.push({ cesta: s.cesta, problem: `titulek má ${s.titulek.length} znaků (ořízne se kolem ${TITULEK_MAX})` })
    }

    if (!s.popis) kriticke.push({ cesta: s.cesta, problem: 'chybí meta description' })
    else if (s.popis.length > POPIS_MAX) {
      drobnosti.push({ cesta: s.cesta, problem: `popisek má ${s.popis.length} znaků (ořízne se kolem ${POPIS_MAX})` })
    } else if (s.popis.length < POPIS_MIN) {
      drobnosti.push({ cesta: s.cesta, problem: `popisek má jen ${s.popis.length} znaků — vyhledávač si ho přepíše` })
    }

    // Canonical porovnáváme podle **cesty**, ne podle celé adresy: web se
    // často testuje na jiném portu, než na jaký je sestavený, a rozdíl
    // v původu je vlastnost prostředí, ne chyba stránky. Jednotnost původu
    // se kontroluje zvlášť, níž.
    if (!s.kanonicka) {
      kriticke.push({ cesta: s.cesta, problem: 'chybí canonical' })
    } else {
      const cesta = bezpecnaCesta(s.kanonicka)
      const ocekavana = s.cesta === '/' ? '/' : s.cesta
      if (cesta === null) {
        kriticke.push({ cesta: s.cesta, problem: `canonical není platná adresa: ${s.kanonicka}` })
      } else if (cesta.replace(/\/$/, '') !== ocekavana.replace(/\/$/, '')) {
        kriticke.push({ cesta: s.cesta, problem: `canonical míří na jinou stránku: ${s.kanonicka}` })
      }
    }

    if (s.h1.length === 0) kriticke.push({ cesta: s.cesta, problem: 'nemá žádný <h1>' })
    else if (s.h1.length > 1) {
      drobnosti.push({ cesta: s.cesta, problem: `má ${s.h1.length} nadpisů <h1>: ${s.h1.join(' | ')}` })
    }

    if (s.roboti?.includes('noindex')) {
      kriticke.push({ cesta: s.cesta, problem: 'je v mapě webu, ale má noindex' })
    }

    if (s.chybnyJsonLd > 0) {
      kriticke.push({ cesta: s.cesta, problem: `${s.chybnyJsonLd}× nevalidní JSON-LD` })
    }
  }

  // ── duplicity napříč webem ──────────────────────────────────────────────
  const skupiny = (klic: (s: Stranka) => string | null) => {
    const mapa = new Map<string, string[]>()
    for (const s of stranky) {
      const k = klic(s)
      if (!k) continue
      mapa.set(k, [...(mapa.get(k) ?? []), s.cesta])
    }
    return [...mapa.entries()].filter(([, cesty]) => cesty.length > 1)
  }

  for (const [titulek, cesty] of skupiny(s => s.titulek)) {
    kriticke.push({
      cesta: cesty.slice(0, 4).join(', ') + (cesty.length > 4 ? ` (+${cesty.length - 4})` : ''),
      problem: `sdílí titulek „${titulek}" — vyhledávač je bude považovat za jednu stránku`,
    })
  }
  for (const [popis, cesty] of skupiny(s => s.popis)) {
    drobnosti.push({
      cesta: cesty.slice(0, 4).join(', ') + (cesty.length > 4 ? ` (+${cesty.length - 4})` : ''),
      problem: `sdílí popisek „${popis.slice(0, 60)}…"`,
    })
  }

  // Všechny canonical adresy musí mít jeden původ. Dvě domény v canonical
  // znamenají dvě konkurenční kopie webu — přesně to, čemu má canonical
  // bránit.
  const puvody = new Set(stranky.map(s => (s.kanonicka ? puvod(s.kanonicka) : null)).filter(Boolean))
  if (puvody.size > 1) {
    kriticke.push({ cesta: '(celý web)', problem: `canonical odkazuje na víc domén: ${[...puvody].join(', ')}` })
  } else if (puvody.size === 1) {
    const jediny = [...puvody][0] as string
    console.log(`Canonical původ: ${jediny}${jediny === ZAKLAD ? '' : `  (testuje se přes ${ZAKLAD})`}\n`)
  }

  // ── přehled po vrstvách ─────────────────────────────────────────────────
  console.log('Pokrytí po vrstvách:')
  for (const v of VRSTVY) {
    const vrstva = stranky.filter(s => s.vrstva === v)
    const ok = vrstva.filter(s => s.stav === 200).length
    const sJsonLd = vrstva.filter(s => s.jsonLd.length > 0).length
    console.log(`  ${v.padEnd(9)} ${String(ok).padStart(3)}/${vrstva.length} dostupných, ${sJsonLd} se strukturovanými daty`)
  }

  console.log('')
  if (drobnosti.length) {
    console.log(`Drobnosti (${drobnosti.length}):`)
    for (const d of drobnosti.slice(0, 40)) console.log(`  • ${d.cesta}: ${d.problem}`)
    if (drobnosti.length > 40) console.log(`  … a dalších ${drobnosti.length - 40}`)
    console.log('')
  }

  if (kriticke.length) {
    console.error(`Chyby, které poškozují indexaci (${kriticke.length}):`)
    for (const k of kriticke) console.error(`  ✗ ${k.cesta}: ${k.problem}`)
    process.exit(1)
  }

  console.log('SEO kontrola prošla bez kritických nálezů.')
}

main().catch(e => {
  console.error('Kontrola SEO selhala:', e instanceof Error ? e.message : e)
  process.exit(1)
})
