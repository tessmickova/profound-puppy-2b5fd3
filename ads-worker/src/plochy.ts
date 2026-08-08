// Katalog reklamních ploch.
//
// Obchodní pravidla — počet ploch, cena, období, interval rotace — jsou
// v `shared/reklama.ts` a čte je odsud web i tahle služba. Tady zůstává jen
// to, co potřebuje samotný prodej.

export {
  CENA_MESIC_KC, IKONY, MEZE, OBDOBI, OBDOBI_PODLE_ID, PLOCH, POZIC,
  ROTACE_LISTA_MS, ROTACE_SLOUPCE_MS, cenaKc, jeObdobi, jePlocha,
  plochaCislo, plochaId, popisPlochy, type Obdobi as ObdobiPopis, type ObdobiId,
} from '../../shared/reklama'

import {
  CENA_MESIC_KC, KAMPANI_NA_PLOSE, PLOCH, cenaKc, plochaCislo, plochaId,
  popisPlochy, type ObdobiId,
} from '../../shared/reklama'

/** Kolik kampaní se na jedné ploše střídá. */
export const KAPACITA = KAMPANI_NA_PLOSE

export interface Plocha {
  id: string
  nazev: string
  /** kde na webu plocha je — stejný popis vidí zákazník v náhledu */
  stranka: string
  cena_mesic: number
  cislo: number
}

export const PLOCHY: Plocha[] = Array.from({ length: PLOCH }, (_, i) => {
  const cislo = i + 1
  return {
    id: plochaId(cislo),
    nazev: `Plocha ${cislo}`,
    stranka: popisPlochy(cislo),
    cena_mesic: CENA_MESIC_KC,
    cislo,
  }
})

export const plochaPodleId = (id: string): Plocha | undefined => {
  const c = plochaCislo(id)
  return c ? PLOCHY[c - 1] : undefined
}

export const cena = (_plocha: Plocha, obdobi: ObdobiId): number => cenaKc(obdobi)

/** Kolik kampaní se na dané ploše střídá. */
export const kapacitaPlochy = (_plocha: Plocha): number => KAPACITA
