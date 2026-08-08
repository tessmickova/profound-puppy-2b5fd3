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

/** Pole, bez kterých se nesmí spustit produkce. */
const POVINNA: (keyof Provozovatel)[] = ['nazev', 'ico', 'sidlo', 'email', 'emailReklama', 'ucet']

const prazdneNeboZastupne = (h: string): boolean =>
  !h.trim() || h.includes(ZASTUPNA) || /^0+$/.test(h.replace(/\D/g, '')) === true && /\d/.test(h)

/**
 * Vrátí seznam polí, která musí doplnit majitel projektu.
 * Prázdný seznam = údaje jsou kompletní.
 */
export function chybejiciUdaje(p: Provozovatel): string[] {
  const chybi = POVINNA.filter(k => prazdneNeboZastupne(String(p[k])))
  if (p.platceDph && prazdneNeboZastupne(p.dic)) chybi.push('dic')
  if (!chybi.includes('ico') && !/^\d{8}$/.test(p.ico)) chybi.push('ico')
  return chybi
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
