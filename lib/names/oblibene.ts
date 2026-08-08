'use client'

// Srdíčka. Data i logika jsou v `vyber.ts`, kde k oblíbeným patří i opak —
// vyřazená jména. Tenhle soubor zůstává jako zkratka pro místa, která
// potřebují jen srdíčka.

import { prepniOblibene, useVyber } from './vyber'

export { prepniOblibene }

export function useOblibene() {
  const v = useVyber()
  return {
    ids: v.oblibena,
    pocet: v.pocetOblibenych,
    je: v.jeOblibene,
    prepni: v.prepniOblibene,
  }
}
