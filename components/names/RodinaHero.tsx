'use client'

// Hlavní prvek úvodní stránky: jméno, které ladí k celé rodině.
//
// Tohle je to, čím se web liší od katalogů. Katalog odpoví „jaká jsou
// jména pro holčičky". Tady se ptáme na lidi, co už doma jsou — příjmení,
// maminka, tatínek, sourozenec — a hledáme jméno, které k nim sedí.
//
// Proto stojí nahoře a ne v podstránce. Není to vyhledávání v databázi
// (to na úvod nepatří), ale nástroj: nic se nevypisuje, dokud člověk
// něco nezadá, a každý výsledek má napsané, **proč** vyšel.

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Heart, Sparkles } from 'lucide-react'
import { JMENA } from '@/lib/names/data'
import { najdiNejlepsiShody } from '@/lib/names/logic'
import { slugJmena } from '@/lib/names/slug'
import { useVyber } from '@/lib/names/vyber'
import { Rodina } from './Ilustrace'

/** Kolik jmen ukazujeme. Šest se vejde do dvou i tří sloupců beze zbytku. */
const KOLIK = 6

interface Pole { klic: 'prijmeni' | 'maminka' | 'tatinek' | 'sourozenec'; popisek: string; napoveda: string }

const POLE: Pole[] = [
  { klic: 'prijmeni', popisek: 'Příjmení', napoveda: 'Nováková' },
  { klic: 'maminka', popisek: 'Maminka', napoveda: 'Tereza' },
  { klic: 'tatinek', popisek: 'Tatínek', napoveda: 'Martin' },
  { klic: 'sourozenec', popisek: 'Sourozenec', napoveda: 'Vojtěch' },
]

export default function RodinaHero() {
  const [pohlavi, setPohlavi] = useState<'holka' | 'kluk'>('holka')
  const [rodina, setRodina] = useState({ prijmeni: '', maminka: '', tatinek: '', sourozenec: '' })
  const { prepniOblibene, jeOblibene } = useVyber()

  const zadano = Object.values(rodina).some(v => v.trim().length > 1)

  const shody = useMemo(() => {
    if (!zadano) return []
    return najdiNejlepsiShody(JMENA, {
      pohlavi,
      prijmeni: rodina.prijmeni,
      mesic: null,
      styly: [],
      zeme: [],
      maminka: rodina.maminka,
      tatinek: rodina.tatinek,
      sourozenec: rodina.sourozenec,
    }, KOLIK)
  }, [zadano, pohlavi, rodina])

  const uprav = (klic: Pole['klic'], hodnota: string) =>
    setRodina(r => ({ ...r, [klic]: hodnota }))

  return (
    <section className="rodina-hero">
      <div className="rodina-hero-uvod">
        <div className="rodina-hero-text">
          <h1>
            Jméno, které ladí k <span>celé vaší rodině</span>
          </h1>
          <p className="rodina-hero-podnadpis">
            Řekněte nám, kdo už je doma. Podle příjmení, jmen rodičů
            i sourozence najdeme jména, která k nim sedí — a u každého
            napíšeme proč.
          </p>
        </div>
        <Rodina velikost={196} className="rodina-hero-obrazek" />
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
          {POLE.map(p => (
            <label key={p.klic}>
              <span>{p.popisek}</span>
              <input
                value={rodina[p.klic]}
                onChange={e => uprav(p.klic, e.target.value)}
                placeholder={p.napoveda}
                autoComplete="off"
              />
            </label>
          ))}
        </div>

        <p className="rodina-hero-pozn">
          Stačí jedno políčko. Nic se nikam neodesílá — počítá se to přímo
          ve vašem prohlížeči.
        </p>
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
