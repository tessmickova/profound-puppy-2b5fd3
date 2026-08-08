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
  /**
   * Kód země, ve které se jméno **používá** (cz, de, jp…).
   *
   * Není to totéž co jazykový původ jména: Emma se běžně dává v Německu
   * i v Česku, ale germánský původ má jen jednou. Původ držíme zvlášť
   * v `puvod` a uvádíme ho jen tam, kde ho opravdu známe.
   */
  zeme: string
  /**
   * Jazykový původ jména, pokud je doložený — např. 'hebrejský',
   * 'germánský', 'latinský'. Prázdné znamená „nevíme", ne „žádný".
   */
  puvod?: string
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
  /** domácké podoby a zdrobněliny */
  domacky?: string[]
  /** jmeniny v českém kalendáři, např. „25. 7." */
  svatek?: string
  /** jméno se používá pro kluky i holčičky */
  unisex?: boolean
  /** u zvířat: pro koho se jméno hodí */
  pohlavi?: PohlaviZvirete
}

export type PohlaviZvirete = 'samec' | 'samice' | 'unisex'

export const POHLAVI_INFO: Record<PohlaviZvirete, { nazev: string; znak: string }> = {
  samec:  { nazev: 'pro samce',    znak: '♂' },
  samice: { nazev: 'pro samičku',  znak: '♀' },
  unisex: { nazev: 'pro obě pohlaví', znak: '⚥' },
}

export interface Zeme {
  kod: string
  /** 1. pád: „Česko" */
  nazev: string
  /** 2. pád: „z Česka" — čeština se nedá odvodit z nominativu */
  genitiv: string
  /** přídavné jméno v ženském rodě: „česká jména" */
  pridavne: string
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
  /** ručně vybraná jména na míru plemeni (historie, film, mytologie…) — v pořadí doporučení */
  doporucena?: string[]
}

/**
 * Popisky kategorií ve všech tvarech, které web potřebuje.
 *
 * `mnozne` je 1. pád („Psi jsou…"), `proKoho` 4. pád do vazby „jména pro …"
 * („jména pro psy"). Bez toho vznikalo „Jména pro psi", což česky není.
 * `slug` je kus adresy vstupní stránky.
 */
export const KATEGORIE_INFO: Record<Kategorie, {
  nazev: string; mnozne: string; proKoho: string; slug: string; emoji: string
}> = {
  pes:      { nazev: 'Pes',      mnozne: 'Psi',      proKoho: 'psy',       slug: 'psy',       emoji: '🐕' },
  fenka:    { nazev: 'Fenka',    mnozne: 'Fenky',    proKoho: 'fenky',     slug: 'fenky',     emoji: '🐩' },
  kocour:   { nazev: 'Kocour',   mnozne: 'Kocouři',  proKoho: 'kocoury',   slug: 'kocoury',   emoji: '🐈' },
  kocka:    { nazev: 'Kočka',    mnozne: 'Kočky',    proKoho: 'kočky',     slug: 'kocky',     emoji: '🐱' },
  kun:      { nazev: 'Kůň',      mnozne: 'Koně',     proKoho: 'koně',      slug: 'kone',      emoji: '🐴' },
  kralik:   { nazev: 'Králík',   mnozne: 'Králíci',  proKoho: 'králíky',   slug: 'kraliky',   emoji: '🐰' },
  papousek: { nazev: 'Papoušek', mnozne: 'Papoušci', proKoho: 'papoušky',  slug: 'papousky',  emoji: '🦜' },
  krecek:   { nazev: 'Křeček',   mnozne: 'Křečci',   proKoho: 'křečky',    slug: 'krecky',    emoji: '🐹' },
  kluk:     { nazev: 'Kluk',     mnozne: 'Kluci',    proKoho: 'kluky',     slug: 'kluky',     emoji: '👦' },
  holka:    { nazev: 'Holčička', mnozne: 'Holčičky', proKoho: 'holčičky',  slug: 'holcicky',  emoji: '👧' },
}

export const VSECHNY_STYLY: Styl[] = [
  'tradiční', 'moderní', 'hravé', 'elegantní', 'přírodní', 'mytologické', 'královské', 'sportovní',
]

export const MESICE_NAZVY = [
  'leden', 'únor', 'březen', 'duben', 'květen', 'červen',
  'červenec', 'srpen', 'září', 'říjen', 'listopad', 'prosinec',
]
