// Rejstřík pro rychlé hledání konkrétního jména.
//
// Do prohlížeče posíláme jen to nejnutnější — jméno, adresu, kategorie
// a hledaný tvar bez diakritiky. Celý katalog by byl zbytečně těžký
// a k našeptávači ho není potřeba.

import { VSECHNY_ENTITY } from './entita'
import { bezDiakritiky } from './slug'
import type { Kategorie } from './types'

export interface PolozkaRejstriku {
  /** jméno tak, jak se píše */
  j: string
  /** adresa detailu; prázdná, když jméno vlastní stránku nemá */
  s: string
  /** hledaný tvar: malá písmena, bez diakritiky */
  h: string
  /** kategorie, ve kterých se jméno objevuje */
  k: Kategorie[]
}

export const REJSTRIK: PolozkaRejstriku[] = VSECHNY_ENTITY
  .map(e => ({
    j: e.jmeno,
    s: e.vyskyty.length && e.vyznam.trim().length >= 12 ? e.slug : '',
    h: bezDiakritiky(e.jmeno),
    k: e.kategorie,
  }))
  .sort((a, b) => a.j.localeCompare(b.j, 'cs'))

/**
 * Najde jména podle napsaného textu.
 *
 * Nejdřív ta, která hledaným textem začínají — to je skoro vždycky to,
 * co člověk chce. Teprve pak ta, která ho mají uvnitř.
 */
export function najdi(dotaz: string, kolik = 8): PolozkaRejstriku[] {
  const q = bezDiakritiky(dotaz.trim())
  if (q.length < 1) return []

  const zacatek: PolozkaRejstriku[] = []
  const uvnitr: PolozkaRejstriku[] = []
  for (const p of REJSTRIK) {
    if (p.h.startsWith(q)) zacatek.push(p)
    else if (p.h.includes(q)) uvnitr.push(p)
    if (zacatek.length >= kolik) break
  }
  return [...zacatek, ...uvnitr].slice(0, kolik)
}
