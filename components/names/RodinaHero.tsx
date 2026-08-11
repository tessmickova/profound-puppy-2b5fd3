'use client'

// Hlavní prvek úvodní stránky: jméno, které ladí k celé rodině.
//
// Tohle je to, čím se web liší od katalogů. Katalog odpoví „jaká jsou
// jména pro holčičky". Tady se ptáme na lidi, co už doma jsou — příjmení,
// maminka, tatínek, sourozenci — a hledáme jméno, které k nim sedí.
//
// Není to vyhledávání v databázi (to na úvod nepatří), ale nástroj:
// nic se nevypisuje, dokud člověk něco nezadá, a každý výsledek má
// napsané, **proč** vyšel.

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Heart, Plus, Sparkles, X } from 'lucide-react'
import { JMENA } from '@/lib/names/data'
import { najdiNejlepsiShody } from '@/lib/names/logic'
import { slugJmena } from '@/lib/names/slug'
import { useVyber } from '@/lib/names/vyber'

/** Kolik jmen ukazujeme. Šest se vejde do dvou i tří sloupců beze zbytku. */
const KOLIK = 6
/** Kolik sourozenců jde zadat. Víc už je spíš překlep než rodina. */
const NEJVIC_SOUROZENCU = 4

export default function RodinaHero() {
  const [pohlavi, setPohlavi] = useState<'holka' | 'kluk'>('holka')
  const [prijmeni, setPrijmeni] = useState('')
  const [maminka, setMaminka] = useState('')
  const [tatinek, setTatinek] = useState('')
  const [sourozenci, setSourozenci] = useState<string[]>([''])
  const { prepniOblibene, jeOblibene } = useVyber()

  const zadano = [prijmeni, maminka, tatinek, ...sourozenci].some(v => v.trim().length > 1)

  const shody = useMemo(() => {
    if (!zadano) return []
    return najdiNejlepsiShody(JMENA, {
      pohlavi,
      prijmeni,
      mesic: null,
      styly: [],
      zeme: [],
      maminka,
      tatinek,
      sourozenci,
    }, KOLIK)
  }, [zadano, pohlavi, prijmeni, maminka, tatinek, sourozenci])

  const upravSourozence = (i: number, hodnota: string) =>
    setSourozenci(s => s.map((x, k) => (k === i ? hodnota : x)))

  return (
    <section className="rodina-hero">
      <div className="rodina-hero-text">
        <h1>
          Jméno, které ladí k <span>celé vaší rodině</span>
        </h1>
        <p className="rodina-hero-podnadpis">
          Řekněte nám, kdo už je doma. Podle příjmení, jmen rodičů
          i sourozenců najdeme jména, která k nim sedí — a u každého
          napíšeme proč.
        </p>
      </div>

      <div className="rodina-hero-formular">
        <div className="prepinac rodina-hero-pohlavi">
          <button type="button" aria-pressed={pohlavi === 'holka'} onClick={() => setPohlavi('holka')}>
            čekáme holčičku
          </button>
          <button type="button" aria-pressed={pohlavi === 'kluk'} onClick={() => setPohlavi('kluk')}>
            čekáme chlapečka
          </button>
        </div>

        <div className="rodina-hero-pole">
          <label>
            <span>Příjmení</span>
            <input value={prijmeni} onChange={e => setPrijmeni(e.target.value)} placeholder="Nováková" autoComplete="off" />
          </label>
          <label>
            <span>Maminka</span>
            <input value={maminka} onChange={e => setMaminka(e.target.value)} placeholder="Tereza" autoComplete="off" />
          </label>
          <label>
            <span>Tatínek</span>
            <input value={tatinek} onChange={e => setTatinek(e.target.value)} placeholder="Martin" autoComplete="off" />
          </label>
          {sourozenci.map((s, i) => (
            <label key={i}>
              <span>{sourozenci.length > 1 ? `${i + 1}. sourozenec` : 'Sourozenec'}</span>
              <span className="rodina-hero-vstup">
                <input
                  value={s}
                  onChange={e => upravSourozence(i, e.target.value)}
                  placeholder={i === 0 ? 'Vojtěch' : 'Amálie'}
                  autoComplete="off"
                />
                {i > 0 && (
                  <button
                    type="button"
                    className="rodina-hero-odebrat"
                    onClick={() => setSourozenci(x => x.filter((_, k) => k !== i))}
                    aria-label={`Odebrat ${i + 1}. sourozence`}
                  >
                    <X size={14} aria-hidden />
                  </button>
                )}
              </span>
            </label>
          ))}
        </div>

        <div className="rodina-hero-radek">
          {sourozenci.length < NEJVIC_SOUROZENCU && (
            <button
              type="button"
              className="rodina-hero-pridat"
              onClick={() => setSourozenci(s => [...s, ''])}
            >
              <Plus size={14} aria-hidden /> Přidat sourozence
            </button>
          )}
          <p className="rodina-hero-pozn">
            Stačí jedno políčko. Nic se nikam neodesílá — počítá se to přímo
            ve vašem prohlížeči.
          </p>
        </div>
      </div>

      {zadano && (
        <div className="rodina-hero-vysledky">
          <h2>
            <Sparkles size={15} aria-hidden />
            {shody.length ? 'Jména, která k vám ladí' : 'Zatím nic nesedí'}
          </h2>

          <ul className="rodina-hero-mrizka">
            {shody.map(s => (
              <li key={s.jmeno.id} className="rodina-navrh">
                <div className="rodina-navrh-hlava">
                  <Link href={`/jmeno/${slugJmena(s.jmeno.jmeno)}`}>{s.jmeno.jmeno}</Link>
                  <button
                    type="button"
                    className={`srdicko ${jeOblibene(s.jmeno.id) ? '' : 'opacity-45'}`}
                    onClick={() => prepniOblibene(s.jmeno.id)}
                    aria-pressed={jeOblibene(s.jmeno.id)}
                    aria-label={jeOblibene(s.jmeno.id)
                      ? `Odebrat ${s.jmeno.jmeno} z výběru`
                      : `Uložit ${s.jmeno.jmeno} do výběru`}
                  >
                    <Heart size={15} fill={jeOblibene(s.jmeno.id) ? 'currentColor' : 'none'} aria-hidden />
                  </button>
                </div>
                {s.rodinnyStitek && (
                  <span className="rodina-navrh-stitek" title={s.rodinnyStitek.popis}>
                    {s.rodinnyStitek.text}
                  </span>
                )}
                <ul className="rodina-navrh-duvody">
                  {s.duvody.slice(0, 3).map((d, i) => <li key={i}>{d}</li>)}
                </ul>
              </li>
            ))}
          </ul>

          <p className="rodina-hero-dal">
            <Link href="/rodina">
              Zadat celou rodinu včetně zvířat a měsíce narození <ArrowRight size={14} aria-hidden />
            </Link>
          </p>
        </div>
      )}
    </section>
  )
}
