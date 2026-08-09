// Jméno jako entita, ne jako řádek v katalogu.
//
// V datech je „Emma" pětkrát — pro holčičky v Německu, v Česku, pro fenku…
// To jsou ale výskyty téhož jména, ne pět různých jmen. Pro detailovou
// stránku je potřeba jedna entita s atributy: kde se používá, pro koho,
// co znamená, jak se komu líbí.
//
// Stránku dostane jen jméno, o kterém máme co říct. Tisíc dvě stě
// vygenerovaných stránek se stejnou vatou by webu uškodilo víc, než by
// pomohlo — proto `maDostDat()`.

import { JMENA, ZEME } from './data'
import { slugJmena } from './slug'
import { variantyZapisu } from './zapis'
import type { Jmeno, Kategorie } from './types'

export interface Entita {
  slug: string
  /** jméno v podobě, v jaké se píše */
  jmeno: string
  /** všechny výskyty jména v katalogu */
  vyskyty: Jmeno[]
  /** kategorie, ve kterých se jméno objevuje */
  kategorie: Kategorie[]
  /** kódy zemí, kde se jméno používá */
  zeme: string[]
  /** nejdelší popis významu, jaký o jméně máme */
  vyznam: string
  /** jazykový původ, pokud je doložený */
  puvod?: string
  /** jmeniny v českém kalendáři */
  svatek?: string
  domacky: string[]
  /** nejvyšší redakční skóre líbivosti napříč výskyty */
  oblibenost: number
  slabiky: number
  delka: number
  jeLidske: boolean
  jeZvireci: boolean
}

const LIDSKE: Kategorie[] = ['kluk', 'holka']

function postav(): Map<string, Entita> {
  const mapa = new Map<string, Entita>()
  for (const j of JMENA) {
    const slug = slugJmena(j.jmeno)
    if (!slug) continue
    let e = mapa.get(slug)
    if (!e) {
      e = {
        slug, jmeno: j.jmeno, vyskyty: [], kategorie: [], zeme: [],
        vyznam: '', puvod: undefined, svatek: undefined, domacky: [],
        oblibenost: 0, slabiky: j.slabiky, delka: j.delka,
        jeLidske: false, jeZvireci: false,
      }
      mapa.set(slug, e)
    }
    e.vyskyty.push(j)
    if (!e.kategorie.includes(j.kategorie)) e.kategorie.push(j.kategorie)
    if (!e.zeme.includes(j.zeme)) e.zeme.push(j.zeme)
    // Z několika popisů bereme ten nejobsažnější — kratší bývají zkratkovité.
    if (j.vyznam.length > e.vyznam.length) e.vyznam = j.vyznam
    if (j.puvod && !e.puvod) e.puvod = j.puvod
    if (j.svatek && !e.svatek) e.svatek = j.svatek
    for (const d of j.domacky ?? []) if (!e.domacky.includes(d)) e.domacky.push(d)
    e.oblibenost = Math.max(e.oblibenost, j.popularita)
    e.jeLidske = e.jeLidske || LIDSKE.includes(j.kategorie)
    e.jeZvireci = e.jeZvireci || !LIDSKE.includes(j.kategorie)
  }
  return mapa
}

const ENTITY = postav()

/**
 * Má jméno na vlastní stránku dost vlastního obsahu?
 *
 * Chceme stránku, která návštěvníkovi něco přinese — ne šablonu s doplněným
 * jménem. Proto vedle významu vyžadujeme aspoň jednu věc navíc: jmeniny,
 * domácké tvary, použití ve víc zemích, u víc druhů — nebo doloženou další
 * podobu zápisu.
 *
 * Zápis se do brány přidal záměrně: „Teodor, nebo Theodor?" je otázka, na
 * kterou stránka odpovídá něčím konkrétním, ne vatou. Bez toho propadlo
 * devatenáct jmen s doloženou variantou a informace o zápisu nebyla nikde
 * k dohledání.
 */
export function maDostDat(e: Entita): boolean {
  if (e.vyznam.trim().length < 12) return false
  const navic = Number(Boolean(e.svatek))
    + Number(e.domacky.length > 0)
    + Number(e.zeme.length > 1)
    + Number(e.kategorie.length > 1)
    + Number(variantyZapisu(e.jmeno).length > 0)
  return navic >= 1
}

/** Entity, které mají vlastní stránku — v abecedním pořadí. */
export const ENTITY_SE_STRANKOU: Entita[] = [...ENTITY.values()]
  .filter(maDostDat)
  .sort((a, b) => a.slug.localeCompare(b.slug, 'cs'))

export const entitaPodleSlugu = (slug: string): Entita | undefined => {
  const e = ENTITY.get(slug)
  return e && maDostDat(e) ? e : undefined
}

/** Všechny entity včetně těch bez vlastní stránky — pro vyhledávání. */
export const VSECHNY_ENTITY: Entita[] = [...ENTITY.values()]

/** Země, kde se jméno používá, s celými údaji. */
export const zemeEntity = (e: Entita) =>
  e.zeme.map(k => ZEME.find(z => z.kod === k)).filter(Boolean) as typeof ZEME

/**
 * Podobná jména: stejná kategorie, blízká délka i počet slabik.
 * Slouží jako pokračování cesty, ne jako výplň.
 */
export function podobna(e: Entita, kolik = 8): Entita[] {
  const hlavni = e.kategorie[0]
  return ENTITY_SE_STRANKOU
    .filter(x => x.slug !== e.slug && x.kategorie.includes(hlavni))
    .map(x => ({ x, rozdil: Math.abs(x.slabiky - e.slabiky) * 2 + Math.abs(x.delka - e.delka) }))
    .sort((a, b) => a.rozdil - b.rozdil || b.x.oblibenost - a.x.oblibenost)
    .slice(0, kolik)
    .map(v => v.x)
}
