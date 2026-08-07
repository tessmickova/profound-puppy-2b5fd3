'use client'

// Které jméno je právě otevřené ve vysouvacím panelu. Stejný přístup jako
// u srdíček — jeden zdroj pravdy, ze kterého čte karta i panel.

import { useSyncExternalStore } from 'react'

let otevrene: string | null = null
const posluchaci = new Set<() => void>()

function oznam() { posluchaci.forEach(p => p()) }

function subscribe(cb: () => void) {
  posluchaci.add(cb)
  return () => { posluchaci.delete(cb) }
}

export function otevriDetail(id: string) { otevrene = id; oznam() }
export function zavriDetail() { otevrene = null; oznam() }

export function useDetail() {
  const id = useSyncExternalStore(subscribe, () => otevrene, () => null)
  return { id, otevri: otevriDetail, zavri: zavriDetail }
}
