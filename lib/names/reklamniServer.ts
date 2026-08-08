// Spojení na reklamní službu.
//
// Reklamy běží na vlastní adrese, oddělené od webu. Tenhle soubor je jediné
// místo, kde o ní web ví, a je napsaný tak, aby výpadek reklam nikdy
// nepoložil obsah: každý dotaz má krátký časový limit a když se cokoli
// nepovede, vrací null — plocha se prostě nevykreslí.

import type { Inzerat } from './reklamy'

export const ADRESA_REKLAM = process.env.NEXT_PUBLIC_ADS_API ?? ''

/** Jak dlouho čekáme na reklamní službu, než na ni zapomeneme. */
const LIMIT_MS = 2500

/** Odpověď hromadného dotazu si držíme na jedno načtení stránky. */
let vsechnyCekajici: Promise<Record<string, Inzerat[]> | null> | null = null

async function stahniVsechny(): Promise<Record<string, Inzerat[]> | null> {
  const stopka = new AbortController()
  const casovac = setTimeout(() => stopka.abort(), LIMIT_MS)
  try {
    const odpoved = await fetch(`${ADRESA_REKLAM}/api/reklamy-vse`, {
      signal: stopka.signal, cache: 'no-store',
    })
    if (!odpoved.ok) return null
    const data = await odpoved.json() as { plochy?: Record<string, Inzerat[]> }
    return data.plochy && typeof data.plochy === 'object' ? data.plochy : null
  } catch {
    return null
  } finally {
    clearTimeout(casovac)
  }
}

/**
 * Kreativy všech ploch jedním dotazem. Ploch je dvacet a ptát se na každou
 * zvlášť by znamenalo dvacet spojení hned po načtení stránky.
 */
export function nactiVsechnyInzeraty(): Promise<Record<string, Inzerat[]> | null> {
  if (!ADRESA_REKLAM) return Promise.resolve(null)
  if (!vsechnyCekajici) vsechnyCekajici = stahniVsechny()
  return vsechnyCekajici
}
