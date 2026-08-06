// Typy pro sekci „Svět jmen" — jména zvířat i dětí podle zemí

export type Kategorie =
  | 'pes' | 'fenka' | 'kocour' | 'kocka'
  | 'kun' | 'kralik' | 'papousek' | 'krecek'
  | 'kluk' | 'holka'

export type Styl =
  | 'tradiční' | 'moderní' | 'hravé' | 'elegantní'
  | 'přírodní' | 'mytologické' | 'královské' | 'sportovní'

export type Energie = 'klidná' | 'vyvážená' | 'živá'

/** U psích jmen: k jak velkému plemeni se jméno hodí */
export type Velikost = 'malé' | 'střední' | 'velké'

export type KontinentId =
  | 'evropa' | 'asie' | 'afrika'
  | 'severni-amerika' | 'jizni-amerika' | 'australie'

export interface Jmeno {
  id: string
  jmeno: string
  kategorie: Kategorie
  /** kód země (cz, de, jp…) */
  zeme: string
  vyznam: string
  /** oblíbenost 0–100 (redakční skóre líbivosti) */
  popularita: number
  styly: Styl[]
  energie: Energie
  delka: number
  slabiky: number
  /** měsíce narození, ke kterým jméno ladí (svátek či sezóna); prázdné = neutrální */
  mesice: number[]
  /** jen psi a fenky — k jaké velikosti plemene jméno sedí */
  velikost?: Velikost
}

export interface Zeme {
  kod: string
  nazev: string
  vlajka: string
  kontinent: KontinentId
  /** krátká poznámka o tamní jmenné tradici */
  poznamka: string
}

export interface Kontinent {
  id: KontinentId
  nazev: string
  popis: string
}

export interface Plemeno {
  nazev: string
  /** 'pes' nebo 'kocka' — druh zvířete */
  druh: 'pes' | 'kocka'
  velikost?: Velikost
  energie: Energie
  styly: Styl[]
  /** kód země původu plemene */
  puvod: string
  popis: string
}

export const KATEGORIE_INFO: Record<Kategorie, { nazev: string; mnozne: string; emoji: string }> = {
  pes:      { nazev: 'Pes',      mnozne: 'Psi',       emoji: '🐕' },
  fenka:    { nazev: 'Fenka',    mnozne: 'Fenky',     emoji: '🐩' },
  kocour:   { nazev: 'Kocour',   mnozne: 'Kocouři',   emoji: '🐈' },
  kocka:    { nazev: 'Kočka',    mnozne: 'Kočky',     emoji: '🐱' },
  kun:      { nazev: 'Kůň',      mnozne: 'Koně',      emoji: '🐴' },
  kralik:   { nazev: 'Králík',   mnozne: 'Králíci',   emoji: '🐰' },
  papousek: { nazev: 'Papoušek', mnozne: 'Papoušci',  emoji: '🦜' },
  krecek:   { nazev: 'Křeček',   mnozne: 'Křečci',    emoji: '🐹' },
  kluk:     { nazev: 'Kluk',     mnozne: 'Kluci',     emoji: '👦' },
  holka:    { nazev: 'Holčička', mnozne: 'Holčičky',  emoji: '👧' },
}

export const VSECHNY_STYLY: Styl[] = [
  'tradiční', 'moderní', 'hravé', 'elegantní', 'přírodní', 'mytologické', 'královské', 'sportovní',
]

export const MESICE_NAZVY = [
  'leden', 'únor', 'březen', 'duben', 'květen', 'červen',
  'červenec', 'srpen', 'září', 'říjen', 'listopad', 'prosinec',
]
