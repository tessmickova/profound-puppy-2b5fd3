// Zpětně kompatibilní pohled na centrální config.
//
// Právní texty dřív měly vlastní kopie údajů o provozovateli; teď je berou
// z `lib/config.ts`, aby se nemohly rozejít.

import { OVERENO, PRAVNI_UCINNOST, PROVOZOVATEL, ADRESA_REKLAM as ADRESA } from '@/lib/config'
import { chybejiciUdaje } from '@/shared/provozovatel'

/**
 * Jsou údaje o provozovateli skutečné?
 *
 * Náhled běží se zástupnými hodnotami („VYPLNIT s.r.o., IČO 00000000“)
 * a ty nesmí být vidět: na produkčně vypadajícím webu působí jako
 * nedodělek a zároveň by tvrdily něco, co není pravda. Kde se údaje
 * vypisují, se proto řádek raději vynechá, dokud je majitelka nedoplní.
 * Produkční build hlídá `zkontrolujProdukci()` — tohle je jen clona
 * pro náhled.
 */
export const UDAJE_PROVOZOVATELE_DOPLNENY = chybejiciUdaje(PROVOZOVATEL).length === 0

export const PRAVNI = {
  provozovatel: PROVOZOVATEL.nazev,
  ico: PROVOZOVATEL.ico,
  dic: PROVOZOVATEL.dic,
  platceDph: PROVOZOVATEL.platceDph,
  sidlo: PROVOZOVATEL.sidlo,
  email: PROVOZOVATEL.email,
  emailReklama: PROVOZOVATEL.emailReklama,
  ucet: PROVOZOVATEL.ucet,
  ucinnostOd: PRAVNI_UCINNOST,
  overeno: OVERENO,
}

/** Adresa samoobsluhy reklamní služby. Prázdná = služba ještě neběží. */
export const ADRESA_REKLAM = ADRESA

/** Datum ve tvaru, jaký se čte v textu: 1. 8. 2026. */
export function cesyDatum(iso: string): string {
  const [r, m, d] = iso.split('-').map(Number)
  if (!r || !m || !d) return iso
  return `${d}. ${m}. ${r}`
}
