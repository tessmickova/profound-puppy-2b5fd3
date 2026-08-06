'use client'

// Srdíčka — oblíbená jména v localStorage, sdílená přes všechny komponenty.

import { useSyncExternalStore } from 'react'

const KLIC = 'svet-jmen-oblibene'
const PRAZDNE: string[] = []

let cache: string[] = PRAZDNE
let nacteno = false
const posluchaci = new Set<() => void>()

function nacti() {
  try {
    cache = JSON.parse(localStorage.getItem(KLIC) ?? '[]')
  } catch {
    cache = []
  }
  nacteno = true
}

function subscribe(cb: () => void) {
  if (!nacteno) {
    nacti()
    queueMicrotask(() => posluchaci.forEach(p => p()))
  }
  posluchaci.add(cb)
  return () => { posluchaci.delete(cb) }
}

const getSnapshot = () => cache
const getServerSnapshot = () => PRAZDNE

export function prepniOblibene(id: string) {
  cache = cache.includes(id) ? cache.filter(x => x !== id) : [...cache, id]
  try { localStorage.setItem(KLIC, JSON.stringify(cache)) } catch {}
  posluchaci.forEach(p => p())
}

export function useOblibene() {
  const ids = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  return {
    ids,
    pocet: ids.length,
    je: (id: string) => ids.includes(id),
    prepni: prepniOblibene,
  }
}
