'use client'

// Osobní výběr jmen: oblíbená, favorité, vyřazená — a kdo z rodiny je chce.
//
// Ke srdíčku patří i opak. Když člověk projde stovky jmen, potřebuje si
// odškrtnout nejen ta, která se mu líbí, ale hlavně ta, u kterých už nechce
// znovu přemýšlet — jinak je potkává pořád dokola.
//
// Hvězdička je nad srdíčkem: srdíčko říká „líbí se mi", hvězdička „tohle je
// opravdový favorit". Hvězdičkové jméno je vždycky i oblíbené — favorit,
// který by nebyl ve výběru, nedává smysl.
//
// `hlasy` si pamatují, kdo z rodiny jméno chce (maminka, tatínek, syn,
// dcera…). Z toho pak stránka analýzy počítá shodu rodiny — „podle vás",
// vedle našich pravidel „podle nás".
//
// Všechno žije v úložišti prohlížeče pod jedním verzovaným záznamem, takže
// se dá čistě rozšířit, aniž by starým návštěvníkům zmizel výběr.

import { useSyncExternalStore } from 'react'

const KLIC = 'svet-jmen-vyber'
/** Původní klíč se samotnými srdíčky — přeneseme z něj data a necháme být. */
const STARY_KLIC = 'svet-jmen-oblibene'

/** Kdo z rodiny jméno chce. Barvy drží ustálený rodinný kód. */
export type Hlasujici = 'maminka' | 'tatinek' | 'syn' | 'dcera'

export const HLASUJICI: { id: Hlasujici; nazev: string; barva: string }[] = [
  { id: 'maminka', nazev: 'Maminka', barva: '#c94f4f' },
  { id: 'tatinek', nazev: 'Tatínek', barva: '#3563a8' },
  { id: 'dcera', nazev: 'Dcera', barva: '#d98ba8' },
  { id: 'syn', nazev: 'Syn', barva: '#7fa8d9' },
]

interface Ulozeny {
  v: 2
  oblibena: string[]
  /** favorité — podmnožina oblíbených */
  hvezdy: string[]
  vyrazena: string[]
  /** id jména → kdo ho chce */
  hlasy: Record<string, Hlasujici[]>
}

const PRAZDNY: Ulozeny = { v: 2, oblibena: [], hvezdy: [], vyrazena: [], hlasy: {} }

let cache: Ulozeny = PRAZDNY
let nacteno = false
const posluchaci = new Set<() => void>()

/** Pole řetězců, nebo prázdné — data z úložiště nikdy nebereme na slovo. */
function pole(x: unknown): string[] {
  return Array.isArray(x) ? x.filter((y): y is string => typeof y === 'string') : []
}

const VSICHNI_HLASUJICI = new Set(HLASUJICI.map(h => h.id))

function hlasyZ(x: unknown): Record<string, Hlasujici[]> {
  if (!x || typeof x !== 'object') return {}
  const cisty: Record<string, Hlasujici[]> = {}
  for (const [id, kdo] of Object.entries(x as Record<string, unknown>)) {
    const platni = pole(kdo).filter((k): k is Hlasujici => VSICHNI_HLASUJICI.has(k as Hlasujici))
    if (platni.length) cisty[id] = platni
  }
  return cisty
}

function nacti() {
  nacteno = true
  try {
    const surove = localStorage.getItem(KLIC)
    if (surove) {
      const d: unknown = JSON.parse(surove)
      if (d && typeof d === 'object') {
        // Záznam v1 neměl hvězdy ani hlasy — doplní se prázdné a od
        // příštího zápisu je záznam v2. Nikomu nic nezmizí.
        const o = d as Partial<Ulozeny>
        const oblibena = pole(o.oblibena)
        cache = {
          v: 2,
          oblibena,
          hvezdy: pole(o.hvezdy).filter(id => oblibena.includes(id)),
          vyrazena: pole(o.vyrazena),
          hlasy: hlasyZ(o.hlasy),
        }
        return
      }
    }
    // Přechod z úplně prvního záznamu, kde byla jen srdíčka.
    const stare = localStorage.getItem(STARY_KLIC)
    if (stare) {
      cache = { ...PRAZDNY, oblibena: pole(JSON.parse(stare)) }
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

function bezHlasu(hlasy: Record<string, Hlasujici[]>, id: string): Record<string, Hlasujici[]> {
  if (!(id in hlasy)) return hlasy
  const { [id]: _, ...zbytek } = hlasy
  return zbytek
}

/** Srdíčko. Oblíbené jméno nemůže být zároveň vyřazené. */
export function prepniOblibene(id: string) {
  zajistiNacteni()
  const je = cache.oblibena.includes(id)
  zmen({
    ...cache,
    oblibena: je ? bez(cache.oblibena, id) : [...cache.oblibena, id],
    // s oblíbeností padá i hvězda a hlasy — bez záznamu nemají k čemu viset
    hvezdy: je ? bez(cache.hvezdy, id) : cache.hvezdy,
    hlasy: je ? bezHlasu(cache.hlasy, id) : cache.hlasy,
    vyrazena: bez(cache.vyrazena, id),
  })
}

/** Hvězdička = opravdový favorit. Hvězdičkové jméno je vždy i oblíbené. */
export function prepniHvezdu(id: string) {
  zajistiNacteni()
  const je = cache.hvezdy.includes(id)
  zmen({
    ...cache,
    oblibena: cache.oblibena.includes(id) ? cache.oblibena : [...cache.oblibena, id],
    hvezdy: je ? bez(cache.hvezdy, id) : [...cache.hvezdy, id],
    vyrazena: bez(cache.vyrazena, id),
  })
}

/** Vyřazení. Vyřazené jméno zároveň mizí z oblíbených i favoritů. */
export function prepniVyrazene(id: string) {
  zajistiNacteni()
  const je = cache.vyrazena.includes(id)
  zmen({
    ...cache,
    oblibena: bez(cache.oblibena, id),
    hvezdy: bez(cache.hvezdy, id),
    hlasy: bezHlasu(cache.hlasy, id),
    vyrazena: je ? bez(cache.vyrazena, id) : [...cache.vyrazena, id],
  })
}

/** Hlas člena rodiny pro jméno — druhé klepnutí ho zase odebere. */
export function prepniHlas(id: string, kdo: Hlasujici) {
  zajistiNacteni()
  const stavajici = cache.hlasy[id] ?? []
  const nove = stavajici.includes(kdo) ? stavajici.filter(x => x !== kdo) : [...stavajici, kdo]
  const hlasy = { ...cache.hlasy }
  if (nove.length) hlasy[id] = nove
  else delete hlasy[id]
  zmen({ ...cache, hlasy })
}

/** Všichni najednou — když se rodina shodne jedním klepnutím. */
export function hlasVsech(id: string) {
  zajistiNacteni()
  const stavajici = cache.hlasy[id] ?? []
  const maVsechny = HLASUJICI.every(h => stavajici.includes(h.id))
  const hlasy = { ...cache.hlasy }
  if (maVsechny) delete hlasy[id]
  else hlasy[id] = HLASUJICI.map(h => h.id)
  zmen({ ...cache, hlasy })
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
    hvezdy: v.hvezdy,
    vyrazena: v.vyrazena,
    hlasy: v.hlasy,
    pocetOblibenych: v.oblibena.length,
    pocetVyrazenych: v.vyrazena.length,
    jeOblibene: (id: string) => v.oblibena.includes(id),
    jeHvezda: (id: string) => v.hvezdy.includes(id),
    jeVyrazene: (id: string) => v.vyrazena.includes(id),
    hlasyPro: (id: string) => v.hlasy[id] ?? [],
    prepniOblibene,
    prepniHvezdu,
    prepniVyrazene,
    prepniHlas,
    hlasVsech,
    vratVsechnaVyrazena,
  }
}
