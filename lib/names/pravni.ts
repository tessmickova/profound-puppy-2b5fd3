// Zpětně kompatibilní pohled na centrální config.
//
// Právní texty dřív měly vlastní kopie údajů o provozovateli; teď je berou
// z `lib/config.ts`, aby se nemohly rozejít.

import { OVERENO, PRAVNI_UCINNOST, PROVOZOVATEL, ADRESA_REKLAM as ADRESA } from '@/lib/config'
import { PLATBA_PRIPRAVENA, TOTOZNOST_DOPLNENA } from '@/lib/config'

/**
 * Smí se vypsat, kdo web provozuje?
 *
 * Identifikace provozovatele je zákonná povinnost, takže se vypisuje,
 * jakmile jsou údaje skutečné. Naopak zástupné hodnoty („VYPLNIT s.r.o.,
 * IČO 00000000“) vidět být nesmí — působí jako nedodělek a hlavně tvrdí
 * něco, co není pravda.
 *
 * Bankovní účet se posuzuje zvlášť (`PLATBA_PRIPRAVENA`): bez něj se
 * nesmí prodávat reklama, ale web tím nijak netrpí.
 */
export const UDAJE_PROVOZOVATELE_DOPLNENY = TOTOZNOST_DOPLNENA

export { PLATBA_PRIPRAVENA }

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
