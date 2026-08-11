'use client'

// Osobní výběr návštěvníka: uložená a vyřazená jména.
//
// Ke srdíčku patří i opak. Vyřazená jména mizí z výsledků, takže musí být
// místo, kde je vidět, co člověk vyřadil, a kde to jde vzít zpátky —
// jinak by nešlo poznat, proč se jméno v katalogu neobjevuje.

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { JMENA } from '@/lib/names/data'
import { kolator } from '@/lib/names/logic'
import { KATEGORIE_INFO } from '@/lib/names/types'
import type { Kategorie } from '@/lib/names/types'
import { useVyber } from '@/lib/names/vyber'
import NameCard from './NameCard'
import Rozvrzeni from './Rozvrzeni'
import NadpisSekce from './NadpisSekce'

const PORADI: Kategorie[] = [
  'holka', 'kluk', 'pes', 'fenka', 'kocour', 'kocka', 'kun', 'kralik', 'papousek', 'krecek',
  'morce', 'had', 'rybka', 'zelva', 'fretka', 'koza', 'leguan',
]

type Zalozka = 'ulozena' | 'vyrazena'

export default function OblibeneSeznam() {
  const { oblibena, vyrazena, vratVsechnaVyrazena } = useVyber()
  const [zalozka, setZalozka] = useState<Zalozka>('ulozena')

  const ids = zalozka === 'ulozena' ? oblibena : vyrazena

  const skupiny = useMemo(() => {
    const vybrana = JMENA.filter(j => ids.includes(j.id))
    return PORADI
      .map(kat => ({
        kat,
        jmena: vybrana
          .filter(j => j.kategorie === kat)
          .sort((a, b) => kolator.compare(a.jmeno, b.jmeno)),
      }))
      .filter(s => s.jmena.length > 0)
  }, [ids])

  const zalozky = (
    <div className="taby mb-5" role="tablist" aria-label="Můj výběr">
      <button
        type="button"
        role="tab"
        aria-selected={zalozka === 'ulozena'}
        className={`tab ${zalozka === 'ulozena' ? 'je-aktivni' : ''}`}
        onClick={() => setZalozka('ulozena')}
      >
        Uložená{oblibena.length > 0 && <span className="tab-pocet">{oblibena.length}</span>}
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={zalozka === 'vyrazena'}
        className={`tab ${zalozka === 'vyrazena' ? 'je-aktivni' : ''}`}
        onClick={() => setZalozka('vyrazena')}
      >
        Vyřazená{vyrazena.length > 0 && <span className="tab-pocet">{vyrazena.length}</span>}
      </button>
    </div>
  )

  const prazdno = zalozka === 'ulozena' ? (
    <div className="vyber-prazdno">
      <p className="vyber-prazdno-znak" aria-hidden>🤍</p>
      <p>
        Zatím tu nic není. Klepněte u kteréhokoli jména na srdíčko a uloží se vám sem.
      </p>
      <div className="vyber-prazdno-akce">
        <Link href="/jmena/holcicky" className="vyber-tlacitko je-hlavni">Jména pro holčičky</Link>
        <Link href="/jmena/kluky" className="vyber-tlacitko je-hlavni">Jména pro kluky</Link>
        <Link href="/zvirata" className="vyber-tlacitko">Jména pro zvířata</Link>
      </div>
    </div>
  ) : (
    <div className="vyber-prazdno">
      <p className="vyber-prazdno-znak" aria-hidden>✳︎</p>
      <p>
        Nic jste zatím nevyřadili. Křížek u jména ho schová z výsledků, ať se
        k němu nemusíte pořád vracet. Vrátit ho jde kdykoli tady.
      </p>
      <div className="vyber-prazdno-akce">
        <Link href="/deti" className="vyber-tlacitko je-hlavni">Procházet dětská jména</Link>
        <Link href="/zvirata" className="vyber-tlacitko">Procházet zvířecí jména</Link>
      </div>
    </div>
  )

  return (
    <Rozvrzeni>
      {zalozky}

      {zalozka === 'vyrazena' && vyrazena.length > 0 && (
        <div className="vyber-lista">
          <p>
            Tahle jména se ve výsledcích neukazují. Křížkem u jména je vrátíte
            zpátky — nebo naráz všechna.
          </p>
          <button type="button" className="vyber-tlacitko" onClick={vratVsechnaVyrazena}>
            <RotateCcw size={14} aria-hidden /> Vrátit všechna ({vyrazena.length})
          </button>
        </div>
      )}

      {skupiny.length === 0 ? prazdno : skupiny.map(({ kat, jmena }) => (
        <section key={kat} className="mb-10">
          <div className="mb-3">
            <NadpisSekce druh={kat === 'kluk' || kat === 'holka' ? 'lide' : 'zvirata'}>
              {KATEGORIE_INFO[kat].mnozne}
            </NadpisSekce>
          </div>
          <div className={`nastup mrizka-jmen ${zalozka === 'vyrazena' ? 'je-vyrazene' : ''}`}>
            {jmena.map(j => <NameCard key={j.id} jmeno={j} />)}
          </div>
        </section>
      ))}
    </Rozvrzeni>
  )
}
