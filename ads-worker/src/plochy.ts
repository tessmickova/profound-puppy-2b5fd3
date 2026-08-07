// Katalog reklamních ploch a ceník.
//
// Plocha = jedno místo na webu. Na každé ploše se střídá až KAPACITA kampaní,
// takže „volný slot" znamená, že plocha ještě nemá plný počet aktivních
// objednávek. Názvy ploch se musí shodovat s tím, co web posílá v ?plocha=.

/** Kolik kampaní se na jedné ploše střídá. */
export const KAPACITA = 4

export type Obdobi = 'mesic' | 'pulrok' | 'rok'

export const OBDOBI: Record<Obdobi, { nazev: string; dnu: number; nasobek: number }> = {
  mesic:  { nazev: 'měsíc',   dnu: 30,  nasobek: 1 },
  pulrok: { nazev: '6 měsíců', dnu: 182, nasobek: 5 },   // šestý měsíc zdarma
  rok:    { nazev: 'rok',     dnu: 365, nasobek: 9 },    // tři měsíce zdarma
}

export interface Plocha {
  id: string
  nazev: string
  /** kde na webu plocha je — pro přehled v samoobsluze */
  stranka: string
  /** cena za měsíc v Kč bez DPH */
  cena_mesic: number
}

const p = (id: string, nazev: string, stranka: string, cena_mesic: number): Plocha =>
  ({ id, nazev, stranka, cena_mesic })

/**
 * Ceník vychází z toho, kolik lidí plochu uvidí: úvodní strana nejvíc,
 * stránky zemí nejmíň. Postranní sloupce jsou levnější než plochy v obsahu.
 */
export const PLOCHY: Plocha[] = [
  p('domov-nad-mapou',      'Úvod — nad obsahem',        'Úvodní strana', 2400),
  p('domov-po-mape',        'Úvod — pod hledáním',       'Úvodní strana', 2200),
  p('domov-mezi',           'Úvod — mezi sekcemi',       'Úvodní strana', 2000),
  p('domov-pred-patickou',  'Úvod — před patičkou',      'Úvodní strana', 1600),
  p('domov-bocni',          'Úvod — postranní sloupec',  'Úvodní strana', 1400),

  p('deti-filtr',           'Děti — u filtru',           'Jména pro děti', 2000),
  p('deti-nad',             'Děti — nad výsledky',       'Jména pro děti', 1900),
  p('deti-v-mrizce',        'Děti — mezi jmény',         'Jména pro děti', 1800),
  p('deti-pod',             'Děti — pod výsledky',       'Jména pro děti', 1400),
  p('deti-bocni',           'Děti — postranní sloupec',  'Jména pro děti', 1200),

  p('zvirata-filtr',        'Zvířata — u filtru',        'Jména pro zvířata', 2000),
  p('zvirata-nad',          'Zvířata — nad výsledky',    'Jména pro zvířata', 1900),
  p('zvirata-v-mrizce',     'Zvířata — mezi jmény',      'Jména pro zvířata', 1800),
  p('zvirata-pod',          'Zvířata — pod výsledky',    'Jména pro zvířata', 1400),
  p('zvirata-bocni',        'Zvířata — postranní sloupec', 'Jména pro zvířata', 1200),

  p('rodina-1',             'Rodinný profil — 1',        'Rodinný profil', 1500),
  p('rodina-2',             'Rodinný profil — 2',        'Rodinný profil', 1400),
  p('rodina-3',             'Rodinný profil — 3',        'Rodinný profil', 1300),
  p('rodina-4',             'Rodinný profil — 4',        'Rodinný profil', 1200),
  p('rodina-5',             'Rodinný profil — 5',        'Rodinný profil', 1100),

  p('oblibene-1',           'Uložená jména — 1',         'Uložená jména', 1300),
  p('oblibene-2',           'Uložená jména — 2',         'Uložená jména', 1200),
  p('oblibene-3',           'Uložená jména — 3',         'Uložená jména', 1100),
  p('oblibene-4',           'Uložená jména — 4',         'Uložená jména', 1000),
  p('oblibene-5',           'Uložená jména — 5',         'Uložená jména', 900),

  p('zeme-1',               'Stránky zemí — 1',          'Stránky zemí', 1200),
  p('zeme-2',               'Stránky zemí — 2',          'Stránky zemí', 1100),
  p('zeme-3',               'Stránky zemí — 3',          'Stránky zemí', 1000),
  p('zeme-4',               'Stránky zemí — 4',          'Stránky zemí', 900),
  p('zeme-5',               'Stránky zemí — 5',          'Stránky zemí', 800),
]

export const plochaPodleId = (id: string): Plocha | undefined =>
  PLOCHY.find(x => x.id === id)

export const cena = (plocha: Plocha, obdobi: Obdobi): number =>
  plocha.cena_mesic * OBDOBI[obdobi].nasobek

/** Ikony, ze kterých si firma vybírá, když nemá logo. Musí sedět s webem. */
export const IKONY = [
  'bone', 'dog', 'cat', 'house', 'shield-check', 'star', 'baby',
  'sparkles', 'type', 'users', 'globe', 'calendar', 'languages',
] as const
