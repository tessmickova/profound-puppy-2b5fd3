'use client'

// Kategorie jmen na úvodní stránce — skleněný box s vlastním „Objevit
// další jména". Každá kategorie se rozbaluje zvlášť: koho zajímají
// návraty babiččiných jmen, nemusí kvůli dalším jménům opouštět box
// ani rolovat cizí kategorií.

import { useState } from 'react'
import Link from 'next/link'
import { unikatniPodleJmena } from '@/lib/names/entita'
import { useRodina } from '@/lib/names/rodina'
import { useVyber } from '@/lib/names/vyber'
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
  const { pohlavi } = useRodina()
  const { vyrazena } = useVyber()

  // Volba „koho pojmenováváme" a vyřazená jména platí pro celou stránku,
  // ne jen pro box nahoře. Kdo hledá jméno pro chlapečka, nemá o kus níž
  // číst seznam holčičích jmen — a co jednou vyřadil, nechce vidět znovu.
  let vybrana = jmena
  if (druh === 'lide' && pohlavi) vybrana = vybrana.filter(j => j.kategorie === pohlavi)
  if (vyrazena.length) vybrana = vybrana.filter(j => !vyrazena.includes(j.id))

  // Jedno jméno = jedna karta. „Ema" z Česka i z Německa je pořád Ema.
  const unikatni = unikatniPodleJmena(vybrana)
  return (
    <section className="sekce-sklo odhal">
      <div className="sekce-sklo-hlava">
        <NadpisSekce druh={druh} uroven={3}>{nadpis}</NadpisSekce>
        <Link href={odkaz.href} className="odkaz-dal">
          {odkaz.text} →
        </Link>
      </div>
      <div className="nastup mrizka-jmen mrizka-kompakt">
        {unikatni.slice(0, kolik).map((u, i) => (
          <NameCard key={u.jmeno.id} jmeno={u.jmeno} zemeNavic={u.zeme} poradi={i + 1} />
        ))}
      </div>
      {kolik < unikatni.length && (
        <div className="sekce-dalsi">
          <button type="button" className="vyber-tlacitko" onClick={() => setKolik(k => k + KOLIK)}>
            Objevit další jména
          </button>
        </div>
      )}
    </section>
  )
}
