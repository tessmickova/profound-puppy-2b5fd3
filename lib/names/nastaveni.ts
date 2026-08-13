'use client'

// Přepínače webu čtené z reklamní služby.
//
// Web je statický a nasazuje se přes CI — kdyby šlo něco vypnout jen novým
// nasazením, trvalo by to minuty a vyžadovalo Git. Přepínače proto žijí
// v databázi reklamní služby a mění se ze stránky /admin. Web se na ně
// zeptá jednou za načtení; když služba neodpoví, platí výchozí stav
// „všechno zapnuto" — výpadek reklamní služby nesmí vypnout web.

import { useEffect, useState } from 'react'
import { ADRESA_REKLAM } from './reklamniServer'

export interface Prepinace {
  /** reklamní plochy po stranách a v liště */
  reklamy: boolean
  /** levý panel „Můj výběr" */
  vyber_panel: boolean
  /** stránka /analyza-vyberu */
  analyza_vyberu: boolean
}

export const VYCHOZI_PREPINACE: Prepinace = {
  reklamy: true,
  vyber_panel: true,
  analyza_vyberu: true,
}

export const POPIS_PREPINACU: { klic: keyof Prepinace; nazev: string; popis: string }[] = [
  { klic: 'reklamy', nazev: 'Reklamní plochy', popis: 'Postranní sloupce a lišta s inzeráty. Vypnutí schová všechny plochy, kampaně v databázi zůstávají.' },
  { klic: 'vyber_panel', nazev: 'Panel „Můj výběr"', popis: 'Levý vysouvací panel se srdíčkovými jmény a hlasy rodiny.' },
  { klic: 'analyza_vyberu', nazev: 'Analýza výběru', popis: 'Stránka /analyza-vyberu s barevným skóre „podle vás i podle nás".' },
]

const LIMIT_MS = 2500

let cekajici: Promise<Prepinace> | null = null

async function stahni(): Promise<Prepinace> {
  if (!ADRESA_REKLAM) return VYCHOZI_PREPINACE
  const stopka = new AbortController()
  const casovac = setTimeout(() => stopka.abort(), LIMIT_MS)
  try {
    const odpoved = await fetch(`${ADRESA_REKLAM}/api/nastaveni`, { signal: stopka.signal })
    if (!odpoved.ok) return VYCHOZI_PREPINACE
    const data = await odpoved.json() as { nastaveni?: Record<string, unknown> }
    const stav = { ...VYCHOZI_PREPINACE }
    for (const k of Object.keys(stav) as (keyof Prepinace)[]) {
      const v = data.nastaveni?.[k]
      if (typeof v === 'boolean') stav[k] = v
    }
    return stav
  } catch {
    return VYCHOZI_PREPINACE
  } finally {
    clearTimeout(casovac)
  }
}

/** Přepínače pro komponenty webu. Do první odpovědi platí „vše zapnuto". */
export function usePrepinace(): Prepinace {
  const [stav, setStav] = useState(VYCHOZI_PREPINACE)
  useEffect(() => {
    let zije = true
    ;(cekajici ??= stahni()).then(s => { if (zije) setStav(s) })
    return () => { zije = false }
  }, [])
  return stav
}
