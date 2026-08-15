// Práce s databází. Držíme to na jednom místě, ať je vidět, jaká data
// o inzerentech vůbec vznikají.

import { KAPACITA, OBDOBI_PODLE_ID, kapacitaPlochy, plochaPodleId, type ObdobiId } from './plochy'

export interface Prostredi {
  DB: D1Database
  LOGA: R2Bucket
  POVOLENE_ORIGINY: string
  BANKOVNI_UCET: string
  PROVOZOVATEL: string
  PROVOZOVATEL_ICO: string
  PROVOZOVATEL_EMAIL: string
  /** sídlo provozovatele na faktuře */
  PROVOZOVATEL_SIDLO?: string
  /** DIČ; prázdné = neplátce DPH */
  PROVOZOVATEL_DIC?: string
  /** kanonická adresa webu — odsud berou právní odkazy svůj původ */
  WEB_URL?: string
  ADMIN_TOKEN?: string
  /**
   * Identifikátor obchodníka u ComGate. Prázdné = brána se nepoužívá
   * a služba prodává dál na převod s variabilním symbolem.
   */
  COMGATE_MERCHANT?: string
  /** 'true' = testovací provoz brány, penězi se nehne. */
  COMGATE_TEST?: string
  /** Tajemství brány. Nastavuje se přes `wrangler secret put`, ne do vars. */
  COMGATE_SECRET?: string
}

export interface RadekInzeratu {
  id: string
  znacka: string
  nadpis: string
  text: string
  cta: string
  odkaz: string
  ikona: string | null
  logo_klic: string | null
}

export interface RadekObjednavky {
  id: string
  inzerent_id: string
  plocha: string
  obdobi: string
  cena_kc: number
  vs: string
  stav: string
  token: string
  plati_od: string | null
  plati_do: string | null
  vytvoreno: string
  /** id transakce v platební bráně; u převodu zůstává prázdné */
  transakce_id: string | null
  zaplaceno_kc: number | null
  zaplaceno_kdy: string | null
  zpusob_platby: string | null
}

/** Náhodný identifikátor. Krátký, ale dost dlouhý na to, aby se neuhodl. */
export function novyId(delka = 12): string {
  const abeceda = 'abcdefghijkmnopqrstuvwxyz23456789'
  const bajty = crypto.getRandomValues(new Uint8Array(delka))
  return Array.from(bajty, b => abeceda[b % abeceda.length]).join('')
}

export const dnesISO = (posun = 0): string => {
  const d = new Date(Date.now() + posun * 86_400_000)
  return d.toISOString().slice(0, 10)
}

/** Variabilní symbol: devět číslic odvozených z náhody, ať se nepletou. */
export function novyVs(): string {
  const b = crypto.getRandomValues(new Uint32Array(1))[0]
  return String(100_000_000 + (b % 899_999_999))
}

/**
 * Kreativy, které se právě mají zobrazit na dané ploše.
 *
 * `i.schvaleno = 1` je tady to nejdůležitější slovo v celé službě. Tenhle
 * dotaz (a jeho dvojče `inzeratyVsech`) je jediné místo, které rozhoduje,
 * co návštěvník uvidí — kdyby podmínka vypadla, schvalování v adminu by bylo
 * jen dekorace a zaplacená kreativa by se vystavila sama.
 */
export async function inzeratyProPlochu(env: Prostredi, plocha: string) {
  const dnes = dnesISO()
  const def = plochaPodleId(plocha)
  const kapacita = def ? kapacitaPlochy(def) : KAPACITA
  const { results } = await env.DB.prepare(
    `SELECT i.id, i.znacka, i.nadpis, i.text, i.cta, i.odkaz, i.ikona, i.logo_klic
       FROM inzeraty i
       JOIN objednavky o ON o.id = i.objednavka_id
      WHERE o.plocha = ?1
        AND o.stav = 'aktivni'
        AND i.schvaleno = 1
        AND (o.plati_od IS NULL OR o.plati_od <= ?2)
        AND (o.plati_do IS NULL OR o.plati_do >= ?2)
      ORDER BY o.vytvoreno
      LIMIT ?3`,
  ).bind(plocha, dnes, kapacita).all<RadekInzeratu>()
  return results ?? []
}

/**
 * Kreativy všech ploch najednou — web se ptá jedním dotazem.
 *
 * Podmínka `i.schvaleno = 1` musí být i tady: kdyby zůstala jen u dotazu na
 * jednu plochu, neschválená kreativa by prosákla hromadným dotazem, kterým
 * si web bere reklamy ve skutečnosti.
 */
export async function inzeratyVsech(env: Prostredi): Promise<Record<string, RadekInzeratu[]>> {
  const dnes = dnesISO()
  const { results } = await env.DB.prepare(
    `SELECT o.plocha AS plocha, i.id, i.znacka, i.nadpis, i.text, i.cta, i.odkaz, i.ikona, i.logo_klic
       FROM inzeraty i
       JOIN objednavky o ON o.id = i.objednavka_id
      WHERE o.stav = 'aktivni'
        AND i.schvaleno = 1
        AND (o.plati_od IS NULL OR o.plati_od <= ?1)
        AND (o.plati_do IS NULL OR o.plati_do >= ?1)
      ORDER BY o.plocha, o.vytvoreno`,
  ).bind(dnes).all<RadekInzeratu & { plocha: string }>()

  const podle: Record<string, RadekInzeratu[]> = {}
  for (const r of results ?? []) {
    const def = plochaPodleId(r.plocha)
    const strop = def ? kapacitaPlochy(def) : KAPACITA
    const dosud = podle[r.plocha] ?? (podle[r.plocha] = [])
    if (dosud.length < strop) dosud.push(r)
  }
  return podle
}

/** Kolik kampaní na ploše drží místo — aktivní i zaplacení čekatelé. */
export async function obsazenost(env: Prostredi): Promise<Record<string, number>> {
  const dnes = dnesISO()
  const { results } = await env.DB.prepare(
    `SELECT plocha, COUNT(*) AS pocet
       FROM objednavky
      WHERE stav IN ('aktivni', 'ceka_na_platbu')
        AND (plati_do IS NULL OR plati_do >= ?1)
      GROUP BY plocha`,
  ).bind(dnes).all<{ plocha: string; pocet: number }>()

  const mapa: Record<string, number> = {}
  for (const r of results ?? []) mapa[r.plocha] = r.pocet
  return mapa
}

export async function objednavkaPodleTokenu(env: Prostredi, token: string) {
  return env.DB.prepare('SELECT * FROM objednavky WHERE token = ?1')
    .bind(token).first<RadekObjednavky>()
}

/** Spočítá konec platnosti od data zahájení. */
export function platiDo(od: string, obdobi: ObdobiId): string {
  const d = new Date(`${od}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + OBDOBI_PODLE_ID[obdobi].dnu)
  return d.toISOString().slice(0, 10)
}

/**
 * Zhasne prošlé kampaně. Volá se z denního cronu — slot se tím sám uvolní
 * a v samoobsluze se objeví jako volný.
 */
export async function zhasniProsle(env: Prostredi): Promise<number> {
  const dnes = dnesISO()
  const vysledek = await env.DB.prepare(
    `UPDATE objednavky SET stav = 'vyprsela'
      WHERE stav = 'aktivni' AND plati_do IS NOT NULL AND plati_do < ?1`,
  ).bind(dnes).run()
  return vysledek.meta.changes ?? 0
}

/**
 * Zruší objednávky, které nikdo nezaplatil do sedmi dnů. Bez toho by
 * nezaplacené rezervace blokovaly sloty napořád.
 */
export async function zrusNezaplacene(env: Prostredi): Promise<number> {
  const hranice = dnesISO(-7)
  const vysledek = await env.DB.prepare(
    `UPDATE objednavky SET stav = 'zrusena'
      WHERE stav = 'ceka_na_platbu' AND substr(vytvoreno, 1, 10) < ?1`,
  ).bind(hranice).run()
  return vysledek.meta.changes ?? 0
}

/** Zahodí počítadla starší než 24 hodin — jinak by tabulka rostla donekonečna. */
export async function smazStareLimity(env: Prostredi): Promise<number> {
  const hranice = Math.floor(Date.now() / 3_600_000) - 24
  const { meta } = await env.DB.prepare('DELETE FROM limity WHERE okno < ?1').bind(hranice).run()
  return meta?.changes ?? 0
}
