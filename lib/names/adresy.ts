// Jediný seznam veřejných adres webu.
//
// Používá ho mapa webu, ohlašování přes IndexNow i kontrola SEO. Kdyby měl
// každý z nich vlastní seznam, tiše by se rozešly — nová stránka by chyběla
// v mapě, nebo by se kontrolovalo něco, co už neexistuje.
//
// Osobní nástroje (`/oblibene`, `/rodina`) tu **nejsou**: jsou označené
// noindex, do indexu nepatří a v mapě webu by si odporovaly samy se sebou.

import { ZEME } from './data'
import { ENTITY_SE_STRANKOU } from './entita'
import { KATEGORIE_INFO } from './types'
import type { Kategorie } from './types'

/** Vrstvy indexace — od „proč sem člověk chodí" po dlouhý ocas. */
export type Vrstva = 'nastroje' | 'katalog' | 'jmena' | 'zeme'

export const VRSTVY: Vrstva[] = ['nastroje', 'katalog', 'jmena', 'zeme']

export interface Adresa {
  cesta: string
  vrstva: Vrstva
  priorita: number
  cetnost: 'weekly' | 'monthly' | 'yearly'
}

const KATEGORIE: Kategorie[] = [
  'holka', 'kluk', 'pes', 'fenka', 'kocour', 'kocka', 'kun', 'kralik', 'papousek', 'krecek',
  'morce', 'had', 'rybka', 'zelva', 'fretka', 'koza', 'leguan',
]

export const ADRESY: Adresa[] = [
  // Vrstva 1 — nástroje, kvůli kterým web existuje.
  { cesta: '/', vrstva: 'nastroje', priorita: 1, cetnost: 'weekly' },
  { cesta: '/vybrat-jmeno-pro-dite', vrstva: 'nastroje', priorita: 0.95, cetnost: 'weekly' },
  { cesta: '/porovnat-jmena', vrstva: 'nastroje', priorita: 0.95, cetnost: 'weekly' },
  { cesta: '/jmeno-k-prijmeni', vrstva: 'nastroje', priorita: 0.9, cetnost: 'weekly' },
  { cesta: '/jak-vybrat-jmeno-kdyz-se-nemuzeme-shodnout', vrstva: 'nastroje', priorita: 0.9, cetnost: 'monthly' },
  { cesta: '/vybrat-jmeno-pro-zvire', vrstva: 'nastroje', priorita: 0.85, cetnost: 'weekly' },
  { cesta: '/metodika', vrstva: 'nastroje', priorita: 0.5, cetnost: 'yearly' },
  { cesta: '/reklama', vrstva: 'nastroje', priorita: 0.3, cetnost: 'yearly' },
  { cesta: '/podminky', vrstva: 'nastroje', priorita: 0.2, cetnost: 'yearly' },
  { cesta: '/soukromi', vrstva: 'nastroje', priorita: 0.2, cetnost: 'yearly' },

  // Vrstva 2 — kategorie a rozcestníky katalogu.
  { cesta: '/deti', vrstva: 'katalog', priorita: 0.9, cetnost: 'weekly' },
  { cesta: '/zvirata', vrstva: 'katalog', priorita: 0.9, cetnost: 'weekly' },
  ...KATEGORIE.map((k): Adresa => ({
    cesta: `/jmena/${KATEGORIE_INFO[k].slug}`, vrstva: 'katalog', priorita: 0.85, cetnost: 'weekly',
  })),

  // Vrstva 3 — detaily jmen; jen ta, která projdou datovou branou.
  ...ENTITY_SE_STRANKOU.map((e): Adresa => ({
    cesta: `/jmeno/${e.slug}`, vrstva: 'jmena', priorita: 0.7, cetnost: 'monthly',
  })),

  // Vrstva 4 — země použití.
  { cesta: '/zeme', vrstva: 'zeme', priorita: 0.6, cetnost: 'monthly' },
  ...ZEME.map((z): Adresa => ({
    cesta: `/zeme/${z.kod}`, vrstva: 'zeme', priorita: 0.6, cetnost: 'monthly',
  })),
]

export const adresyVrstvy = (vrstva: Vrstva) => ADRESY.filter(a => a.vrstva === vrstva)
