// Katalog reklamních ploch a ceník.
//
// Web má deset pevných pozic: pět v levém sloupci, pět v pravém. Každá pozice
// se po patnácti sekundách překlopí na druhou stranu, kde je jiná reklama —
// pozic je tedy deset, ale prodaných ploch dvacet. Číslo plochy odpovídá tomu,
// co vidí zákazník v náhledu na `/reklama`: pozice 1 drží plochy 1 a 2,
// pozice 2 plochy 3 a 4 a tak dál.

/** Kolik kampaní se na jedné ploše střídá. Plocha je jedna strana pozice. */
export const KAPACITA = 1

/** Kolik pozic má web dohromady (pět vlevo, pět vpravo). */
export const POZIC = 10

export type Obdobi = 'mesic' | 'dva' | 'tri'

// Delší období zatím neprodáváme. Až bude jasné, jakou má web návštěvnost,
// dá se ceník otevřít výš — zpětně zlevňovat by se nedalo.
export const OBDOBI: Record<Obdobi, { nazev: string; dnu: number; nasobek: number }> = {
  mesic: { nazev: 'měsíc',    dnu: 30, nasobek: 1 },
  dva:   { nazev: '2 měsíce', dnu: 60, nasobek: 2 },
  tri:   { nazev: '3 měsíce', dnu: 90, nasobek: 3 },
}

/** Cena jedné plochy za měsíc v Kč bez DPH. Všechny plochy stojí stejně. */
export const CENA_MESIC = 5000

export interface Plocha {
  id: string
  nazev: string
  /** kde na webu plocha je — pro přehled v samoobsluze */
  stranka: string
  /** cena za měsíc v Kč bez DPH */
  cena_mesic: number
  /** pořadí pozice 1–10 (1–5 levý sloupec, 6–10 pravý) */
  pozice: number
  /** která strana pozice: 'a' je vidět jako první, 'b' po překlopení */
  strana: 'a' | 'b'
}

/**
 * Dvacet ploch: pozice 1–5 vlevo, 6–10 vpravo, každá o dvou stranách.
 * Číslo plochy je to, co si zákazník naklikne v náhledu.
 */
export const PLOCHY: Plocha[] = Array.from({ length: POZIC * 2 }, (_, i) => {
  const cislo = i + 1
  const pozice = Math.ceil(cislo / 2)
  const strana: 'a' | 'b' = cislo % 2 === 1 ? 'a' : 'b'
  const sloupec = pozice <= 5 ? 'levý' : 'pravý'
  const vSloupci = pozice <= 5 ? pozice : pozice - 5
  return {
    id: `plocha-${cislo}`,
    nazev: `Plocha ${cislo}`,
    stranka: `${sloupec} sloupec, ${vSloupci}. shora — strana ${strana.toUpperCase()}`,
    cena_mesic: CENA_MESIC,
    pozice,
    strana,
  }
})

export const plochaPodleId = (id: string): Plocha | undefined =>
  PLOCHY.find(x => x.id === id)

export const cena = (plocha: Plocha, obdobi: Obdobi): number =>
  plocha.cena_mesic * OBDOBI[obdobi].nasobek

/** Kolik kampaní se na dané ploše střídá. */
export const kapacitaPlochy = (_plocha: Plocha): number => KAPACITA

/** Ikony, ze kterých si firma vybírá, když nemá logo. Musí sedět s webem. */
export const IKONY = [
  'bone', 'dog', 'cat', 'house', 'shield-check', 'star', 'baby',
  'sparkles', 'type', 'users', 'globe', 'calendar', 'languages',
] as const
