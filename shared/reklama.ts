// Obchodní podmínky reklamy — jediný zdroj pravdy.
//
// Čte odsud web (rám s plochami, stránka /reklama), reklamní služba
// (samoobsluha, výpočet ceny, rezervace slotu, validace objednávky)
// i právní texty. Cena, délka, počet ploch ani interval rotace nesmí být
// nikde jinde napsané ručně — jinak si stránky začnou odporovat, jak se to
// už jednou stalo (ceník sliboval 15 s a tři měsíce, checkout 30 s a rok).
//
// Soubor záměrně nemá žádné závislosti: importuje ho jak Next.js, tak
// Cloudflare Worker, který běží v jiném runtime.

/** Kolik pozic web má — pět v levém sloupci, pět v pravém. */
export const POZIC = 10

/** Každá pozice má dvě strany, takže prodejných ploch je dvakrát tolik. */
export const PLOCH = POZIC * 2

/** Cena jedné plochy za měsíc v Kč bez DPH. */
export const CENA_MESIC_KC = 5000

/** Jak dlouho je vidět jedna strana pozice, než se překlopí (ms). */
export const ROTACE_SLOUPCE_MS = 15_000

/** Jak dlouho je vidět jedna kampaň v liště nahoře na telefonu (ms). */
export const ROTACE_LISTA_MS = 10_000

/** Kolik kampaní běží na jedné ploše zároveň. */
export const KAMPANI_NA_PLOSE = 1

export type ObdobiId = 'mesic' | 'dva' | 'tri'

export interface Obdobi {
  id: ObdobiId
  /** jak se období jmenuje ve větě: „kampaň na <nazev>" */
  nazev: string
  dnu: number
  /** kolikrát měsíční cena */
  nasobek: number
}

/**
 * Delší období zatím neprodáváme. Dokud není jasná návštěvnost, dala by se
 * jen prodělat — zdražit zpětně už nejde.
 */
export const OBDOBI: Obdobi[] = [
  { id: 'mesic', nazev: '1 měsíc', dnu: 30, nasobek: 1 },
  { id: 'dva', nazev: '2 měsíce', dnu: 60, nasobek: 2 },
  { id: 'tri', nazev: '3 měsíce', dnu: 90, nasobek: 3 },
]

export const OBDOBI_PODLE_ID: Record<ObdobiId, Obdobi> =
  Object.fromEntries(OBDOBI.map(o => [o.id, o])) as Record<ObdobiId, Obdobi>

export const jeObdobi = (x: unknown): x is ObdobiId =>
  typeof x === 'string' && Object.prototype.hasOwnProperty.call(OBDOBI_PODLE_ID, x)

/** Cena kampaně v Kč bez DPH. */
export const cenaKc = (obdobi: ObdobiId): number =>
  CENA_MESIC_KC * OBDOBI_PODLE_ID[obdobi].nasobek

/** Id plochy podle jejího čísla v náhledu (1–20). */
export const plochaId = (cislo: number): string => `plocha-${cislo}`

/** Číslo plochy z jejího id; 0 znamená neznámé. */
export function plochaCislo(id: string): number {
  const m = /^plocha-(\d{1,2})$/.exec(id)
  if (!m) return 0
  const n = Number(m[1])
  return n >= 1 && n <= PLOCH ? n : 0
}

export const jePlocha = (id: unknown): id is string =>
  typeof id === 'string' && plochaCislo(id) > 0

/** Kde plocha na webu je — stejný popis vidí zákazník všude. */
export function popisPlochy(cislo: number): string {
  const pozice = Math.ceil(cislo / 2)
  const vlevo = pozice <= POZIC / 2
  const vSloupci = vlevo ? pozice : pozice - POZIC / 2
  const strana = cislo % 2 === 1 ? 'A' : 'B'
  return `${vlevo ? 'levý' : 'pravý'} sloupec, ${vSloupci}. shora — strana ${strana}`
}

/** Meze textů inzerátu. Platí na serveru; formulář je jen opisuje. */
export const MEZE = {
  znacka: 32,
  nadpis: 48,
  text: 150,
  cta: 24,
  odkaz: 300,
  firma: 80,
  email: 120,
  ico: 12,
  /** největší povolené logo v bajtech */
  logo: 200 * 1024,
  /** největší rozměr loga v pixelech */
  logoPx: 1024,
} as const

/** Ikony, ze kterých si firma vybírá, dokud nenahraje logo. */
export const IKONY = [
  'bone', 'dog', 'cat', 'house', 'shield-check', 'star', 'baby',
  'sparkles', 'type', 'users', 'globe', 'calendar', 'languages',
] as const
