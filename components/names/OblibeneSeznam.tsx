'use client'

// Stránka srdíček — jména, která si návštěvník uložil.

import Link from 'next/link'
import { useMemo } from 'react'
import { JMENA } from '@/lib/names/data'
import { kolator } from '@/lib/names/logic'
import { KATEGORIE_INFO } from '@/lib/names/types'
import type { Kategorie } from '@/lib/names/types'
import { useOblibene } from '@/lib/names/oblibene'
import NameCard from './NameCard'
import Reklama from './Reklama'

const PORADI: Kategorie[] = ['pes', 'fenka', 'kocour', 'kocka', 'kun', 'kralik', 'papousek', 'krecek', 'kluk', 'holka']

export default function OblibeneSeznam() {
  const { ids } = useOblibene()

  const skupiny = useMemo(() => {
    const vybrana = JMENA.filter(j => ids.includes(j.id))
    return PORADI
      .map(kat => ({
        kat,
        jmena: vybrana.filter(j => j.kategorie === kat).sort((a, b) => kolator.compare(a.jmeno, b.jmeno)),
      }))
      .filter(s => s.jmena.length > 0)
  }, [ids])

  if (!skupiny.length) {
    return (
      <div>
        <div className="rounded-3xl border border-dashed border-[#e8dfd2] p-12 text-center">
          <p className="text-4xl">🤍</p>
          <p className="mt-3 text-[#6b6156]">
            Zatím tu nic není. Klikněte na srdíčko u kteréhokoli jména a uloží se vám sem.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link href="/zvirata" className="rounded-full bg-[#2b2723] px-4 py-2 text-sm font-semibold text-[#faf6ef]">Procházet zvířecí jména</Link>
            <Link href="/deti" className="rounded-full bg-[#d97757] px-4 py-2 text-sm font-semibold text-white">Procházet dětská jména</Link>
          </div>
        </div>
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <Reklama plocha="oblibene-1" />
          <Reklama plocha="oblibene-2" />
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <Reklama plocha="oblibene-1" varianta="pruh" />
      </div>
      {skupiny.map(({ kat, jmena }, i) => (
        <section key={kat} className="mb-10">
          <h2 className="mb-3 [font-family:var(--font-syne)] text-2xl font-bold">
            {KATEGORIE_INFO[kat].emoji} {KATEGORIE_INFO[kat].mnozne}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {jmena.map(j => <NameCard key={j.id} jmeno={j} />)}
            {i < 3 && <Reklama plocha={`oblibene-${i + 2}`} />}
          </div>
        </section>
      ))}
      <Reklama plocha="oblibene-5" varianta="pruh" />
    </div>
  )
}
