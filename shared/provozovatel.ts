// Údaje o provozovateli — jediný zdroj pravdy pro celý projekt.
//
// Nic z toho si nevymýšlíme. Dokud majitel projektu hodnoty nedoplní,
// zůstávají zástupné a produkční build kvůli nim spadne (viz `zkontroluj`).
// Díky tomu se na web nikdy nedostane falešné IČO ani neexistující firma.
//
// Doplňuje se na jednom místě: proměnné prostředí ve `wrangler.jsonc`
// (web) a `ads-worker/wrangler.toml` (reklamní služba).

/** Hodnota, kterou musí majitel projektu nahradit. */
export const ZASTUPNA = 'VYPLNIT'

export interface Provozovatel {
  /** obchodní firma zapsaná v rejstříku */
  nazev: string
  ico: string
  /** DIČ; prázdné, když provozovatel není plátce DPH */
  dic: string
  /** true = ceny jsou bez DPH a účtuje se navíc */
  platceDph: boolean
  /** sídlo tak, jak má být na faktuře */
  sidlo: string
  email: string
  emailReklama: string
  /** bankovní spojení pro platby za reklamu */
  ucet: string
}

/**
 * Kdo web provozuje.
 *
 * Jsou to veřejné údaje z živnostenského rejstříku a zákon je vyžaduje
 * uvádět, takže patří rovnou do kódu — ne do proměnných prostředí, kde by
 * se dvě kopie tiše rozešly. Proměnnou prostředí je pořád možné přebít
 * (jiný provozovatel, jiná instalace), ale nikdo to udělat nemusí.
 */
export const PROVOZOVATEL_UDAJE: Provozovatel = {
  nazev: 'Vítězslav Miček',
  ico: '07347219',
  dic: '',
  platceDph: false,
  sidlo: 'Těšínská 1240/50b, Havířov',
  email: 'info@svetjmen.cz',
  emailReklama: 'reklama@svetjmen.cz',
  // Podnikatelský účet zatím není založený. Dokud tu je zástupná hodnota,
  // služba nesmí přijímat objednávky reklamy — zákazník by dostal pokyn
  // poslat peníze na neexistující účet.
  ucet: `${ZASTUPNA}/0000`,
}

/** Pole, která identifikují provozovatele. Bez nich nesmí web ven. */
const POVINNA_TOTOZNOST: (keyof Provozovatel)[] = ['nazev', 'ico', 'sidlo', 'email']

/** Pole, bez kterých se nesmí prodávat reklama (ale web běžet může). */
const POVINNA_PLATBA: (keyof Provozovatel)[] = ['emailReklama', 'ucet']

const prazdneNeboZastupne = (h: string): boolean =>
  !h.trim() || h.includes(ZASTUPNA) || /^0+$/.test(h.replace(/\D/g, '')) === true && /\d/.test(h)

/**
 * Kontrolní číslice IČO (modulo 11).
 *
 * Osm číslic ještě neznamená platné IČO. Překlep v jedné číslici by prošel
 * do patičky i na fakturu — a chybný identifikátor je horší než žádný.
 */
export function jePlatneIco(ico: string): boolean {
  if (!/^\d{8}$/.test(ico)) return false
  const soucet = [8, 7, 6, 5, 4, 3, 2]
    .reduce((s, vaha, i) => s + Number(ico[i]) * vaha, 0)
  return (11 - (soucet % 11)) % 10 === Number(ico[7])
}

/** Pole, která chybí k identifikaci provozovatele. Prázdné = můžeme ven. */
export function chybejiciTotoznost(p: Provozovatel): string[] {
  const chybi = POVINNA_TOTOZNOST.filter(k => prazdneNeboZastupne(String(p[k])))
  if (!chybi.includes('ico') && !jePlatneIco(p.ico)) chybi.push('ico')
  return chybi
}

/** Pole, která chybí k přijímání plateb za reklamu. */
export function chybejiciPlatba(p: Provozovatel): string[] {
  const chybi = POVINNA_PLATBA.filter(k => prazdneNeboZastupne(String(p[k])))
  if (p.platceDph && prazdneNeboZastupne(p.dic)) chybi.push('dic')
  return chybi
}

/**
 * Vrátí seznam polí, která musí doplnit majitel projektu.
 * Prázdný seznam = údaje jsou kompletní.
 */
export function chybejiciUdaje(p: Provozovatel): string[] {
  return [...chybejiciTotoznost(p), ...chybejiciPlatba(p)]
}

/** Adresy, na kterých web nesmí běžet v produkci. */
export function jeProdukcniAdresa(url: string): boolean {
  let u: URL
  try { u = new URL(url) } catch { return false }
  if (u.protocol !== 'https:') return false
  const h = u.hostname
  if (h === 'localhost' || h.endsWith('.local') || /^\d+\.\d+\.\d+\.\d+$/.test(h)) return false
  if (h.includes(ZASTUPNA.toLowerCase())) return false
  return h.includes('.')
}
