'use client'

// Osobní výběr jmen: oblíbená a vyřazená.
//
// Ke srdíčku patří i opak. Když člověk projde stovky jmen, potřebuje si
// odškrtnout nejen ta, která se mu líbí, ale hlavně ta, u kterých už nechce
// znovu přemýšlet — jinak je potkává pořád dokola. Vyřazené jméno proto
// z výsledků zmizí a dá se kdykoli vrátit.
//
// Obojí žije v úložišti prohlížeče pod jedním verzovaným záznamem, takže
// se dá čistě rozšířit, aniž by starým návštěvníkům zmizel výběr.

import { useSyncExternalStore } from 'react'

const KLIC = 'svet-jmen-vyber'
/** Původní klíč se samotnými srdíčky — přeneseme z něj data a necháme být. */
const STARY_KLIC = 'svet-jmen-oblibene'

interface Ulozeny {
  v: 1
  oblibena: string[]
  vyrazena: string[]
}

const PRAZDNY: Ulozeny = { v: 1, oblibena: [], vyrazena: [] }

let cache: Ulozeny = PRAZDNY
let nacteno = false
const posluchaci = new Set<() => void>()

/** Pole řetězců, nebo prázdné — data z úložiště nikdy nebereme na slovo. */
function pole(x: unknown): string[] {
  return Array.isArray(x) ? x.filter((y): y is string => typeof y === 'string') : []
}

function nacti() {
  nacteno = true
  try {
    const surove = localStorage.getItem(KLIC)
    if (surove) {
      const d: unknown = JSON.parse(surove)
      if (d && typeof d === 'object') {
        const o = d as Partial<Ulozeny>
        cache = { v: 1, oblibena: pole(o.oblibena), vyrazena: pole(o.vyrazena) }
        return
      }
    }
    // Přechod ze starého záznamu, kde byla jen srdíčka.
    const stare = localStorage.getItem(STARY_KLIC)
    if (stare) {
      cache = { v: 1, oblibena: pole(JSON.parse(stare)), vyrazena: [] }
      uloz()
      return
    }
    cache = PRAZDNY
  } catch {
    // Poškozený nebo nedostupný záznam (soukromý režim) nesmí web položit.
    cache = PRAZDNY
  }
}

function uloz() {
  try {
    localStorage.setItem(KLIC, JSON.stringify(cache))
  } catch {
    // Soukromý režim nebo plné úložiště — výběr pak platí jen pro tuhle návštěvu.
  }
}

/**
 * Před každou změnou si přečteme, co je v úložišti právě teď.
 *
 * Není to zbytečná práce: jde o pár desítek řetězců a řeší to dvě věci.
 * Zaprvé zápis dřív, než se první komponenta přihlásí k odběru — ten by
 * vycházel z prázdné paměti a uložený výběr by přepsal. Zadruhé dva otevřené
 * panely: bez toho by srdíčko v jednom zahodilo všechno, co člověk mezitím
 * naklikal ve druhém.
 */
function zajistiNacteni() {
  nacti()
}

function zmen(novy: Ulozeny) {
  cache = novy
  uloz()
  posluchaci.forEach(p => p())
}

/** Změna v jiném panelu prohlížeče — přečteme ji a překreslíme. */
function zJinehoPanelu(e: StorageEvent) {
  if (e.key !== null && e.key !== KLIC) return
  nacti()
  posluchaci.forEach(p => p())
}

function subscribe(cb: () => void) {
  if (!nacteno) {
    nacti()
    queueMicrotask(() => posluchaci.forEach(p => p()))
  }
  if (posluchaci.size === 0 && typeof window !== 'undefined') {
    window.addEventListener('storage', zJinehoPanelu)
  }
  posluchaci.add(cb)
  return () => {
    posluchaci.delete(cb)
    if (posluchaci.size === 0 && typeof window !== 'undefined') {
      window.removeEventListener('storage', zJinehoPanelu)
    }
  }
}

const getSnapshot = () => cache
const getServerSnapshot = () => PRAZDNY

const bez = (pole: string[], id: string) => pole.filter(x => x !== id)

/** Srdíčko. Oblíbené jméno nemůže být zároveň vyřazené. */
export function prepniOblibene(id: string) {
  zajistiNacteni()
  const je = cache.oblibena.includes(id)
  zmen({
    v: 1,
    oblibena: je ? bez(cache.oblibena, id) : [...cache.oblibena, id],
    vyrazena: bez(cache.vyrazena, id),
  })
}

/** Vyřazení. Vyřazené jméno zároveň mizí z oblíbených. */
export function prepniVyrazene(id: string) {
  zajistiNacteni()
  const je = cache.vyrazena.includes(id)
  zmen({
    v: 1,
    oblibena: bez(cache.oblibena, id),
    vyrazena: je ? bez(cache.vyrazena, id) : [...cache.vyrazena, id],
  })
}

/** Vrátí všechna vyřazená jména zpátky do hry. */
export function vratVsechnaVyrazena() {
  zajistiNacteni()
  zmen({ ...cache, vyrazena: [] })
}

export function useVyber() {
  const v = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  return {
    oblibena: v.oblibena,
    vyrazena: v.vyrazena,
    pocetOblibenych: v.oblibena.length,
    pocetVyrazenych: v.vyrazena.length,
    jeOblibene: (id: string) => v.oblibena.includes(id),
    jeVyrazene: (id: string) => v.vyrazena.includes(id),
    prepniOblibene,
    prepniVyrazene,
    vratVsechnaVyrazena,
  }
}
