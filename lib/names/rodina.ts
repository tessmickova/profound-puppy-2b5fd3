'use client'

// Rodinný profil — členové rodiny (lidé i zvířata) v localStorage,
// sdílení přes všechny komponenty stejně jako srdíčka.

import { useSyncExternalStore } from 'react'

export interface ClenRodiny {
  id: string
  jmeno: string
  role: string
}

export const ROLE: { id: string; nazev: string; emoji: string }[] = [
  { id: 'maminka', nazev: 'Maminka', emoji: '👩' },
  { id: 'tatinek', nazev: 'Tatínek', emoji: '👨' },
  { id: 'dcera',   nazev: 'Dcera',   emoji: '👧' },
  { id: 'syn',     nazev: 'Syn',     emoji: '👦' },
  { id: 'pes',     nazev: 'Pes',     emoji: '🐕' },
  { id: 'fenka',   nazev: 'Fenka',   emoji: '🐩' },
  { id: 'kocour',  nazev: 'Kocour',  emoji: '🐈' },
  { id: 'kocka',   nazev: 'Kočka',   emoji: '🐱' },
  { id: 'zvire',   nazev: 'Jiné zvíře', emoji: '🐾' },
]

const KLIC = 'svet-jmen-rodina'
const PRAZDNI: ClenRodiny[] = []

let cache: ClenRodiny[] = PRAZDNI
let nacteno = false
const posluchaci = new Set<() => void>()

function nacti() {
  try { cache = JSON.parse(localStorage.getItem(KLIC) ?? '[]') } catch { cache = [] }
  nacteno = true
}
function uloz() {
  try { localStorage.setItem(KLIC, JSON.stringify(cache)) } catch {}
  posluchaci.forEach(p => p())
}
function subscribe(cb: () => void) {
  if (!nacteno) { nacti(); queueMicrotask(() => posluchaci.forEach(p => p())) }
  posluchaci.add(cb)
  return () => { posluchaci.delete(cb) }
}
const getSnapshot = () => cache
const getServerSnapshot = () => PRAZDNI

export function pridejClena(jmeno: string, role: string) {
  const cisty = jmeno.trim()
  if (!cisty) return
  cache = [...cache, { id: `${role}-${cisty}-${Math.random().toString(36).slice(2, 8)}`, jmeno: cisty, role }]
  uloz()
}
export function odeberClena(id: string) {
  cache = cache.filter(c => c.id !== id)
  uloz()
}

export function useRodina() {
  const clenove = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  return { clenove, pocet: clenove.length, pridej: pridejClena, odeber: odeberClena }
}
