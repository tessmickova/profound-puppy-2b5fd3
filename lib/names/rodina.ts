'use client'

// Rodinný profil — kdo u vás doma je, a jak se jmenujete.
//
// Jeden zdroj pravdy pro celý web: co člověk naklikal na úvodní stránce,
// vidí okamžitě i na /rodina a v hledání na /deti — a naopak. Dřív měl
// úvod vlastní čtyři políčka (maminka, tatínek, sourozenec…) a /rodina
// vlastní seznam; byly to dva různé produkty nad stejnou otázkou.
//
// Příjmení patří sem taky: jméno a příjmení se posuzují dohromady, takže
// nemá smysl držet je jinde než rodinu.

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

/** Role, které při hledání jména hrají roli sourozence. */
export const ROLE_DETI = ['dcera', 'syn', 'dite']
/** Role rodičů — jejich jména ladíme s tím novým jinak než sourozenecká. */
export const ROLE_RODICE = ['maminka', 'tatinek']

export const roleInfo = (id: string) =>
  ROLE.find(r => r.id === id) ?? { id, nazev: 'Člen rodiny', emoji: '✨' }

const KLIC = 'svet-jmen-rodina'
const KLIC_PRIJMENI = 'svet-jmen-prijmeni'

interface Stav { clenove: ClenRodiny[]; prijmeni: string }

const PRAZDNY: Stav = { clenove: [], prijmeni: '' }

let cache: Stav = PRAZDNY
let nacteno = false
const posluchaci = new Set<() => void>()

function nacti() {
  let clenove: unknown = []
  let prijmeni = ''
  try { clenove = JSON.parse(localStorage.getItem(KLIC) ?? '[]') } catch { clenove = [] }
  try { prijmeni = localStorage.getItem(KLIC_PRIJMENI) ?? '' } catch { prijmeni = '' }
  // Data z úložiště nebereme na slovo — poškozený záznam nesmí položit web.
  const cisti = Array.isArray(clenove)
    ? clenove.filter((c): c is ClenRodiny =>
      Boolean(c) && typeof c === 'object'
      && typeof (c as ClenRodiny).id === 'string'
      && typeof (c as ClenRodiny).jmeno === 'string'
      && typeof (c as ClenRodiny).role === 'string')
    : []
  cache = { clenove: cisti, prijmeni: typeof prijmeni === 'string' ? prijmeni : '' }
  nacteno = true
}

function uloz() {
  try {
    localStorage.setItem(KLIC, JSON.stringify(cache.clenove))
    localStorage.setItem(KLIC_PRIJMENI, cache.prijmeni)
  } catch {
    // Soukromý režim nebo plné úložiště — profil pak platí jen pro tuhle návštěvu.
  }
  posluchaci.forEach(p => p())
}

/**
 * Před každým zápisem si přečteme, co je v úložišti právě teď.
 *
 * Řeší to dvě věci a stojí jeden `JSON.parse` nad pár jmény. Zaprvé zápis
 * dřív, než si kterákoli komponenta stihla data vyžádat — ten by přepsal
 * rodinu uloženou z minula prázdným seznamem. Zadruhé dva otevřené panely
 * prohlížeče: bez toho by přidání člena v jednom zahodilo všechno, co
 * mezitím přibylo ve druhém. Stejně to má výběr jmen ve `vyber.ts`.
 */
function zajistiNacteno() {
  nacti()
}

function subscribe(cb: () => void) {
  if (!nacteno) { nacti(); queueMicrotask(() => posluchaci.forEach(p => p())) }
  posluchaci.add(cb)
  return () => { posluchaci.delete(cb) }
}

const getSnapshot = () => cache
const getServerSnapshot = () => PRAZDNY

export function pridejClena(jmeno: string, role: string) {
  zajistiNacteno()
  const cisty = jmeno.trim()
  if (!cisty) return
  const id = `${role}-${cisty}-${Math.random().toString(36).slice(2, 8)}`
  cache = { ...cache, clenove: [...cache.clenove, { id, jmeno: cisty, role }] }
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
 * Nastaví jméno prvního člena s některou z rolí.
 *
 * Pro políčka typu „Maminka“, která mají editovat sdílený profil místo
 * vlastního stavu: prázdné jméno člena odebere, nové ho založí.
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

export function useRodina() {
  const stav = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const jmenaRoli = (role: string[]) =>
    stav.clenove.filter(c => role.includes(c.role)).map(c => c.jmeno)
  return {
    clenove: stav.clenove,
    prijmeni: stav.prijmeni,
    pocet: stav.clenove.length,
    /** jména rodičů a sourozenců — vstup pro hledání ladícího jména */
    rodice: jmenaRoli(ROLE_RODICE),
    sourozenci: jmenaRoli(ROLE_DETI),
    pridej: pridejClena,
    odeber: odeberClena,
    nastavPrijmeni,
    nastavPodleRole,
  }
}
