// Jediné místo, odkud web bere údaje o sobě a o provozovateli.
//
// Stránky nesmí mít vlastní verzi téže obchodní informace. Když se změní
// e-mail nebo IČO, mění se tady a nikde jinde.
//
// Produkční build spadne, dokud jsou v hodnotách zástupné údaje — viz
// `zkontrolujProdukci()`, které volá `next.config.js`.

import {
  ZASTUPNA, chybejiciUdaje, jeProdukcniAdresa, type Provozovatel,
} from '@/shared/provozovatel'

const env = (klic: string, vychozi: string): string =>
  (process.env[klic] ?? '').trim() || vychozi

/**
 * Kanonický původ webu. V produkci sem patří skutečná doména;
 * na workers.dev běží náhled, který se neindexuje (viz `JE_NAHLED`).
 */
export const PUVOD = env('NEXT_PUBLIC_URL', 'http://localhost:3000').replace(/\/$/, '')

/**
 * Náhled poznáme podle adresy: workers.dev ani localhost není produkce,
 * takže se z něj nesmí stát druhá indexovatelná kopie webu.
 */
export const JE_NAHLED =
  PUVOD.includes('workers.dev') || PUVOD.includes('localhost') || !PUVOD.startsWith('https://')

export const WEB = {
  nazev: 'Svět jmen',
  puvod: PUVOD,
  jazyk: 'cs-CZ',
  popis:
    'Jména pro děti i zvířata podle zemí celého světa — s významem, oblíbeností, '
    + 'jmeninami a výběrem podle příjmení, rodiny a plemene.',
} as const

export const PROVOZOVATEL: Provozovatel = {
  nazev: env('NEXT_PUBLIC_PROVOZOVATEL', `${ZASTUPNA} s.r.o.`),
  ico: env('NEXT_PUBLIC_ICO', '00000000'),
  dic: env('NEXT_PUBLIC_DIC', ''),
  platceDph: env('NEXT_PUBLIC_PLATCE_DPH', '') === '1',
  sidlo: env('NEXT_PUBLIC_SIDLO', `${ZASTUPNA} — sídlo`),
  email: env('NEXT_PUBLIC_KONTAKT', `${ZASTUPNA}@example.com`),
  emailReklama: env('NEXT_PUBLIC_KONTAKT_REKLAMA', `${ZASTUPNA}@example.com`),
  ucet: env('NEXT_PUBLIC_UCET', `${ZASTUPNA}/0000`),
}

/** Adresa reklamní služby; prázdná = reklamy se nevykreslí. */
export const ADRESA_REKLAM = env('NEXT_PUBLIC_ADS_API', '').replace(/\/$/, '')

/** Datum, ke kterému platí právní dokumenty. */
export const PRAVNI_UCINNOST = env('NEXT_PUBLIC_PRAVNI_UCINNOST', '2026-08-01')

/** Kdy jsme naposledy ověřovali fakta u úředních tvrzení. */
export const OVERENO = env('NEXT_PUBLIC_OVERENO', '2026-08-08')

/** Co ještě musí majitel projektu doplnit. Prázdné = můžeme do produkce. */
export function chybejici(): string[] {
  const chybi = chybejiciUdaje(PROVOZOVATEL)
  if (!jeProdukcniAdresa(PUVOD)) chybi.push('NEXT_PUBLIC_URL')
  return chybi
}

/**
 * Zarážka pro produkční build. Radši ať spadne build, než aby web tvrdil
 * návštěvníkům i inzerentům vymyšlené IČO.
 */
export function zkontrolujProdukci(): void {
  const chybi = chybejici()
  if (chybi.length === 0) return
  throw new Error(
    'Produkční build zastaven — nejsou doplněné údaje provozovatele: '
    + chybi.join(', ')
    + '. Doplňte je ve `wrangler.jsonc` (vars) a v `ads-worker/wrangler.toml`, '
    + 'nebo build spusťte bez NEXT_PUBLIC_PRODUKCE=1 jako náhled.',
  )
}
