'use client'

// Uložit / vyřadit přímo na detailu jména.
//
// Rozhodování o jméně není jen „líbí se mi". Stejně důležité je zavřít
// dveře: „tohle už nechci vidět". Bez toho se člověk točí dokola po
// stejných jménech a nikam se neposune.
//
// Jedno jméno může být v katalogu víckrát (holka i pes). Pracujeme proto
// se všemi jeho výskyty najednou — uživatel řeší jméno, ne řádek v datech.

import { Heart, RotateCcw, X } from 'lucide-react'
import { useVyber } from '@/lib/names/vyber'

export default function UlozitJmeno({ jmeno, idcka }: { jmeno: string; idcka: string[] }) {
  const { jeOblibene, jeVyrazene, prepniOblibene, prepniVyrazene } = useVyber()

  const ulozene = idcka.some(jeOblibene)
  const vyrazene = idcka.some(jeVyrazene)

  const prepni = (co: 'oblibene' | 'vyrazene') => {
    const fn = co === 'oblibene' ? prepniOblibene : prepniVyrazene
    const uz = co === 'oblibene' ? ulozene : vyrazene
    // Když je jméno v jednom výskytu uložené a v jiném ne, srovnáme to na
    // jeden stav — jinak by tlačítko na druhé klepnutí „nic neudělalo".
    for (const id of idcka) {
      const jeTam = co === 'oblibene' ? jeOblibene(id) : jeVyrazene(id)
      if (jeTam === uz) fn(id)
    }
  }

  return (
    <div className="jmeno-akce">
      <button
        type="button"
        className={`jmeno-akce-tlacitko ${ulozene ? 'je-aktivni' : ''}`}
        onClick={() => prepni('oblibene')}
        aria-pressed={ulozene}
      >
        <Heart size={15} fill={ulozene ? 'currentColor' : 'none'} aria-hidden />
        {ulozene ? `${jmeno} je ve výběru` : 'Uložit do výběru'}
      </button>

      <button
        type="button"
        className={`jmeno-akce-tlacitko ${vyrazene ? 'je-vyrazene' : ''}`}
        onClick={() => prepni('vyrazene')}
        aria-pressed={vyrazene}
      >
        {vyrazene ? <RotateCcw size={15} aria-hidden /> : <X size={15} aria-hidden />}
        {vyrazene ? 'Vrátit mezi návrhy' : 'Tohle ne'}
      </button>

      <p className="jmeno-akce-pozn">
        Zůstane to ve vašem prohlížeči. Nikam se to neodesílá.
      </p>
    </div>
  )
}
