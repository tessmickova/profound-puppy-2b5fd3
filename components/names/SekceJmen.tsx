'use client'

// Kategorie jmen na úvodní stránce — skleněný box s vlastním „Objevit
// další jména". Každá kategorie se rozbaluje zvlášť: koho zajímají
// návraty babiččiných jmen, nemusí kvůli dalším jménům opouštět box
// ani rolovat cizí kategorií.

import { useState } from 'react'
import Link from 'next/link'
import type { Jmeno } from '@/lib/names/types'
import NameCard from './NameCard'
import NadpisSekce from './NadpisSekce'
import type { Druh } from './NadpisSekce'

/** Kolik jmen box ukáže na začátku a o kolik přidá jedno klepnutí. */
const KOLIK = 6

export default function SekceJmen({
  druh, nadpis, jmena, odkaz,
}: {
  druh: Druh
  nadpis: string
  jmena: Jmeno[]
  odkaz: { href: string; text: string }
}) {
  const [kolik, setKolik] = useState(KOLIK)
  return (
    <section className="sekce-sklo">
      <div className="sekce-sklo-hlava">
        <NadpisSekce druh={druh} uroven={3}>{nadpis}</NadpisSekce>
        <Link href={odkaz.href} className="odkaz-dal">
          {odkaz.text} →
        </Link>
      </div>
      <div className="nastup mrizka-jmen mrizka-kompakt">
        {jmena.slice(0, kolik).map((j, i) => <NameCard key={j.id} jmeno={j} poradi={i + 1} />)}
      </div>
      {kolik < jmena.length && (
        <div className="sekce-dalsi">
          <button type="button" className="vyber-tlacitko" onClick={() => setKolik(k => k + KOLIK)}>
            Objevit další jména
          </button>
        </div>
      )}
    </section>
  )
}
