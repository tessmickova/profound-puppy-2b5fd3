'use client'

// Co všechno se má u nalezeného jména ukázat.
//
// Dřív web ukazoval všem stejnou sadu — číslo jména a svátek u každého jména,
// ať to člověk chtěl nebo ne. Tady si to každý vypne nebo vymění za něco,
// co ho zajímá víc. Volba se pamatuje v prohlížeči.

import { useSyncExternalStore } from 'react'

export type KlicPodrobnosti =
  | 'skore' | 'vyznam' | 'duvody' | 'cislo' | 'svatek'
  | 'domacky' | 'styl' | 'oblibenost' | 'delka'

export const PODROBNOSTI: { klic: KlicPodrobnosti; nazev: string; popis: string }[] = [
  { klic: 'skore',      nazev: 'skóre shody',    popis: 'číslo 0–100 a proužek, jak jméno sedí' },
  { klic: 'vyznam',     nazev: 'význam',         popis: 'co jméno znamená a odkud je' },
  { klic: 'duvody',     nazev: 'proč se hodí',   popis: 'heslovité vysvětlení shody' },
  { klic: 'cislo',      nazev: 'číslo jména',    popis: 'výklad podle numerologie — berte jako hru' },
  { klic: 'svatek',     nazev: 'svátek',         popis: 'datum jmenin, když je české' },
  { klic: 'domacky',    nazev: 'domácké tvary',  popis: 'jak se jménu bude říkat doma' },
  { klic: 'styl',       nazev: 'styl a energie', popis: 'tradiční, přírodní, klidné, živé…' },
  { klic: 'oblibenost', nazev: 'oblíbenost',     popis: 'jak často se jméno v Česku dává' },
  { klic: 'delka',      nazev: 'délka a slabiky', popis: 'počet písmen a slabik' },
]

const VYCHOZI: KlicPodrobnosti[] = ['skore', 'vyznam', 'duvody', 'cislo', 'svatek', 'domacky']
const KLIC_ULOZISTE = 'svetjmen-podrobnosti'

let vybrane: KlicPodrobnosti[] = VYCHOZI
let nacteno = false
const posluchaci = new Set<() => void>()

function nacti() {
  if (nacteno || typeof window === 'undefined') return
  nacteno = true
  try {
    const ulozeno = window.localStorage.getItem(KLIC_ULOZISTE)
    if (ulozeno) vybrane = JSON.parse(ulozeno)
  } catch {
    // Poškozený záznam nás nesmí položit — zůstane výchozí sada.
  }
}

function oznam() {
  try {
    window.localStorage.setItem(KLIC_ULOZISTE, JSON.stringify(vybrane))
  } catch {
    // Zakázané úložiště nevadí, volba pak platí jen do zavření karty.
  }
  posluchaci.forEach(p => p())
}

const odebirej = (p: () => void) => {
  nacti()
  posluchaci.add(p)
  return () => { posluchaci.delete(p) }
}

export function usePodrobnosti() {
  const aktualni = useSyncExternalStore(
    odebirej,
    () => { nacti(); return vybrane },
    () => VYCHOZI,
  )
  return {
    vybrane: aktualni,
    ukazuje: (k: KlicPodrobnosti) => aktualni.includes(k),
    prepni: (k: KlicPodrobnosti) => {
      vybrane = vybrane.includes(k) ? vybrane.filter(x => x !== k) : [...vybrane, k]
      oznam()
    },
    vratVychozi: () => { vybrane = VYCHOZI; oznam() },
  }
}
