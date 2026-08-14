'use client'

// Rodinný profil — členové rodiny (lidé i zvířata) a příjmení v localStorage,
// sdílené přes všechny komponenty stejně jako srdíčka. Jeden zdroj pravdy:
// co člověk vyplní na úvodní stránce, vidí na /deti i na /rodina — a naopak.

import { useSyncExternalStore } from 'react'

export interface ClenRodiny {
  id: string
  jmeno: string
  role: string
}

export const ROLE: { id: string; nazev: string; emoji: string }[] = [
  { id: 'maminka', nazev: 'Maminka', emoji: '👩' },
  { id: 'tatinek', nazev: 'Tatínek', emoji: '👨' },
  { id: 'dcera',   nazev: 'Dcera',   emoji: '👧' },
  { id: 'syn',     nazev: 'Syn',     emoji: '👦' },
  { id: 'dite',    nazev: 'Dítě',    emoji: '🧒' },
  { id: 'pes',     nazev: 'Pes',     emoji: '🐕' },
  { id: 'fenka',   nazev: 'Fenka',   emoji: '🐩' },
  { id: 'kocour',  nazev: 'Kocour',  emoji: '🐈' },
  { id: 'kocka',   nazev: 'Kočka',   emoji: '🐱' },
  { id: 'zvire',   nazev: 'Jiné zvíře', emoji: '🐾' },
]

/** Role, které se počítají jako sourozenec při hledání jmen. */
export const ROLE_DETI = ['dcera', 'syn', 'dite']

const KLIC = 'svet-jmen-rodina'
const KLIC_PRIJMENI = 'svet-jmen-prijmeni'
const PRAZDNI: ClenRodiny[] = []

interface Stav { clenove: ClenRodiny[]; prijmeni: string }

let cache: Stav = { clenove: PRAZDNI, prijmeni: '' }
let nacteno = false
const posluchaci = new Set<() => void>()

function nacti() {
  let clenove: ClenRodiny[] = []
  let prijmeni = ''
  try { clenove = JSON.parse(localStorage.getItem(KLIC) ?? '[]') } catch { clenove = [] }
  if (!Array.isArray(clenove)) clenove = []
  try { prijmeni = localStorage.getItem(KLIC_PRIJMENI) ?? '' } catch { prijmeni = '' }
  cache = { clenove, prijmeni }
  nacteno = true
}
function uloz() {
  try {
    localStorage.setItem(KLIC, JSON.stringify(cache.clenove))
    localStorage.setItem(KLIC_PRIJMENI, cache.prijmeni)
  } catch {}
  posluchaci.forEach(p => p())
}
function subscribe(cb: () => void) {
  if (!nacteno) { nacti(); queueMicrotask(() => posluchaci.forEach(p => p())) }
  posluchaci.add(cb)
  return () => { posluchaci.delete(cb) }
}
const getSnapshot = () => cache
const SERVEROVY: Stav = { clenove: PRAZDNI, prijmeni: '' }
const getServerSnapshot = () => SERVEROVY

/** Mutace nejdřív načte uložený stav — zápis „naslepo“ by přepsal
 * rodinu uloženou z minula, když ještě neproběhlo žádné čtení. */
function zajistiNacteno() {
  if (!nacteno) nacti()
}

export function pridejClena(jmeno: string, role: string) {
  zajistiNacteno()
  const cisty = jmeno.trim()
  if (!cisty) return
  cache = {
    ...cache,
    clenove: [...cache.clenove, { id: `${role}-${cisty}-${Math.random().toString(36).slice(2, 8)}`, jmeno: cisty, role }],
  }
  uloz()
}
export function odeberClena(id: string) {
  zajistiNacteno()
  cache = { ...cache, clenove: cache.clenove.filter(c => c.id !== id) }
  uloz()
}
export function nastavPrijmeni(prijmeni: string) {
  zajistiNacteno()
  cache = { ...cache, prijmeni: prijmeni.trimStart() }
  uloz()
}

/**
 * Nastaví jméno prvního člena s některou z rolí — pro pole typu „maminka"
 * na /deti, která editují sdílený profil místo vlastního stavu.
 * Prázdné jméno člena odebere; neexistující vytvoří s rolí `novaRole`.
 */
export function nastavPodleRole(role: string[], novaRole: string, jmeno: string) {
  zajistiNacteno()
  const cisty = jmeno.trim()
  const stavajici = cache.clenove.find(c => role.includes(c.role))
  if (!stavajici) {
    if (cisty) pridejClena(cisty, novaRole)
    return
  }
  if (!cisty) { odeberClena(stavajici.id); return }
  cache = {
    ...cache,
    clenove: cache.clenove.map(c => (c.id === stavajici.id ? { ...c, jmeno: cisty } : c)),
  }
  uloz()
}

export const clenPodleRole = (clenove: ClenRodiny[], ...role: string[]) =>
  clenove.find(c => role.includes(c.role))

/** Jen pro testy: vynutí nové načtení z úložiště. */
export function _znovuNactiProTesty() {
  nacteno = false
}

export function useRodina() {
  const stav = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  return {
    clenove: stav.clenove,
    pocet: stav.clenove.length,
    prijmeni: stav.prijmeni,
    pridej: pridejClena,
    odeber: odeberClena,
    nastavPrijmeni,
    nastavPodleRole,
  }
}
