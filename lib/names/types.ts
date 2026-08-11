// Typy pro sekci „Svět jmen" — jména zvířat i dětí podle zemí

export type Kategorie =
  | 'pes' | 'fenka' | 'kocour' | 'kocka'
  | 'kun' | 'kralik' | 'papousek' | 'krecek'
  | 'morce' | 'had' | 'rybka' | 'zelva' | 'fretka' | 'koza' | 'leguan'
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
  morce:    { nazev: 'Morče',    mnozne: 'Morčata',  proKoho: 'morčata',   slug: 'morcata',   emoji: '🐭' },
  had:      { nazev: 'Had',      mnozne: 'Hadi',     proKoho: 'hady',      slug: 'hady',      emoji: '🐍' },
  rybka:    { nazev: 'Rybka',    mnozne: 'Rybky',    proKoho: 'rybky',     slug: 'rybky',     emoji: '🐠' },
  zelva:    { nazev: 'Želva',    mnozne: 'Želvy',    proKoho: 'želvy',     slug: 'zelvy',     emoji: '🐢' },
  fretka:   { nazev: 'Fretka',   mnozne: 'Fretky',   proKoho: 'fretky',    slug: 'fretky',    emoji: '🦦' },
  koza:     { nazev: 'Koza',     mnozne: 'Kozy',     proKoho: 'kozy',      slug: 'kozy',      emoji: '🐐' },
  leguan:   { nazev: 'Leguán',   mnozne: 'Leguáni',  proKoho: 'leguány',   slug: 'leguany',   emoji: '🦎' },
  kluk:     { nazev: 'Kluk',     mnozne: 'Kluci',    proKoho: 'kluky',     slug: 'kluky',     emoji: '👦' },
  holka:    { nazev: 'Holčička', mnozne: 'Holčičky', proKoho: 'holčičky',  slug: 'holcicky',  emoji: '👧' },
}

/**
 * Kde jméno stojí na české vlně. Redakční zařazení, ne statistika —
 * podrobnosti a důvod, proč to nejde odvodit z oblíbenosti, jsou
 * v `lib/names/vlny.ts`.
 */
export type Vlna = 'vrchol' | 'stoupa' | 'retro' | 'stalice' | 'dozniva' | 'vzacne'

export const VLNA_INFO: Record<Vlna, {
  /** krátký štítek na kartě */
  stitek: string
  /** věta do detailu */
  popis: string
  /** barevný tón štítku — dobová informace má svůj, ať se nepletou */
  trida: string
}> = {
  vrchol: {
    stitek: 'teď nejčastější',
    popis: 'Patří k nejčastějším jménům dnešních miminek — na hřišti ho uslyšíte často.',
    trida: 'bg-[#fdeaea] text-[#b3403a]',
  },
  stoupa: {
    stitek: 'jde nahoru',
    popis: 'Dává se čím dál víc. Čekejte, že ho bude přibývat.',
    trida: 'bg-[#e7f0fb] text-[#3563a8]',
  },
  retro: {
    stitek: 'vrací se',
    popis: 'Jméno prababiček a pradědečků, které se po generaci vrátilo zpátky do módy.',
    trida: 'bg-[#f6ecdd] text-[#8a6320]',
  },
  stalice: {
    stitek: 'stálice',
    popis: 'Dává se v každé generaci. Nikdy nebylo ani zvláštní, ani mimo.',
    trida: 'bg-[#eef2e4] text-[#5f7233]',
  },
  dozniva: {
    stitek: 'jméno generace rodičů',
    popis: 'Běžné jméno, ale doba, kdy se dávalo, byla o generaci dřív. Dnešním miminkám se dává málo.',
    trida: 'bg-[#efe9e2] text-[#6b6156]',
  },
  vzacne: {
    stitek: 'vzácné',
    popis: 'Vzácné bez ohledu na dobu. Pravděpodobně bude ve třídě jediné.',
    trida: 'bg-[#f2ecfa] text-[#6d4fa1]',
  },
}

export const VSECHNY_STYLY: Styl[] = [
  'tradiční', 'moderní', 'hravé', 'elegantní', 'přírodní', 'mytologické', 'královské', 'sportovní',
]

export const MESICE_NAZVY = [
  'leden', 'únor', 'březen', 'duben', 'květen', 'červen',
  'červenec', 'srpen', 'září', 'říjen', 'listopad', 'prosinec',
]
