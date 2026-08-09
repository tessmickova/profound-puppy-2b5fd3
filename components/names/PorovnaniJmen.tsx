'use client'

// Porovnání finalistů.
//
// Nejčastější slepá ulička výběru: máme tři krásná jména a každé má něco.
// Další seznam sta jmen v takové chvíli nepomůže — člověk potřebuje vidět,
// čím se jeho finalisté liší. Proto tabulka odpovědí na otázky, které si
// rodič klade, a nahoře dvě věty o skutečném rozdílu.
//
// Web tu nevybírá vítěze. Rozdíly ukazuje, rozhodnutí nechává na člověku.

import { useMemo, useState } from 'react'
import { ArrowRight, Plus, X } from 'lucide-react'
import { porovnej } from '@/lib/names/rozhodovani'
import { slugJmena } from '@/lib/names/slug'
import { REJSTRIK } from '@/lib/names/rejstrik'
import Link from 'next/link'

const NEJVIC = 5

export default function PorovnaniJmen({
  vychozi = ['', ''],
}: {
  /** předvyplněná jména, když sem člověk přijde z odkazu */
  vychozi?: string[]
}) {
  const [jmena, setJmena] = useState<string[]>(() => {
    const z = vychozi.filter(Boolean)
    return z.length >= 2 ? z.slice(0, NEJVIC) : [...z, '', ''].slice(0, 2)
  })
  const [prijmeni, setPrijmeni] = useState('')

  const vyplnena = jmena.map(j => j.trim()).filter(Boolean)
  const staci = vyplnena.length >= 2

  const vysledek = useMemo(
    () => (staci ? porovnej(vyplnena, prijmeni) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [jmena.join('|'), prijmeni],
  )

  const uprav = (i: number, hodnota: string) => {
    setJmena(j => j.map((x, k) => (k === i ? hodnota : x)))
  }

  return (
    <section className="porovnani">
      <div className="porovnani-vstupy">
        {jmena.map((j, i) => (
          <label key={i} className="porovnani-pole">
            <span>{i + 1}. jméno</span>
            <span className="porovnani-vstup">
              <input
                value={j}
                onChange={e => uprav(i, e.target.value)}
                placeholder={i === 0 ? 'Eliška' : 'Amálie'}
                list="porovnani-napoveda"
                autoComplete="off"
              />
              {jmena.length > 2 && (
                <button
                  type="button"
                  onClick={() => setJmena(x => x.filter((_, k) => k !== i))}
                  aria-label={`Odebrat ${i + 1}. jméno`}
                >
                  <X size={14} aria-hidden />
                </button>
              )}
            </span>
          </label>
        ))}

        <label className="porovnani-pole">
          <span>Příjmení <em>nepovinné</em></span>
          <span className="porovnani-vstup">
            <input
              value={prijmeni}
              onChange={e => setPrijmeni(e.target.value)}
              placeholder="Nováková"
              autoComplete="off"
            />
          </span>
        </label>
      </div>

      {/* Nápověda z rejstříku — bez načítání celého katalogu. */}
      <datalist id="porovnani-napoveda">
        {REJSTRIK.slice(0, 400).map(p => <option key={p.j} value={p.j} />)}
      </datalist>

      <div className="porovnani-akce">
        {jmena.length < NEJVIC && (
          <button type="button" className="porovnani-pridat" onClick={() => setJmena(j => [...j, ''])}>
            <Plus size={14} aria-hidden /> Přidat další jméno
          </button>
        )}
        <p className="porovnani-pozn">
          Příjmení zůstává ve vašem prohlížeči — nikam se neodesílá.
        </p>
      </div>

      {!staci && (
        <p className="porovnani-cekame">
          Napište aspoň dvě jména a hned uvidíte, čím se liší.
        </p>
      )}

      {vysledek && (
        <>
          <div className="porovnani-shrnuti">
            <h3>V čem se skutečně liší</h3>
            <p>{vysledek.vCemSeLisi}</p>
          </div>

          <div className="porovnani-tabulka-obal">
            <table className="porovnani-tabulka">
              <caption className="sr-only">Porovnání jmen podle praktických kritérií</caption>
              <thead>
                <tr>
                  <th scope="col">Otázka</th>
                  {vysledek.jmena.map(x => (
                    <th key={x.jmeno} scope="col">
                      {x.zaznam
                        ? <Link href={`/jmeno/${slugJmena(x.jmeno)}`}>{x.jmeno}</Link>
                        : x.jmeno}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {vysledek.radky.map(r => (
                  <tr key={r.otazka} className={r.odlisuje ? 'je-rozdil' : ''}>
                    <th scope="row">{r.otazka}</th>
                    {r.odpovedi.map((o, i) => <td key={i}>{o}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="porovnani-dal">
            <h3>Pořád nevíte?</h3>
            <p>
              Zkuste to, co funguje líp než další tabulka: <strong>dnes celý den
              používejte první jméno</strong> — v duchu i nahlas, když o dítěti
              mluvíte. Zítra to samé s druhým. Pak si odpovězte na jedinou
              otázku: <em>které vám šlo přirozeněji z úst?</em>
            </p>
            <p className="porovnani-odkazy">
              <Link href="/jmeno-k-prijmeni">Otestovat celé jméno s příjmením <ArrowRight size={13} aria-hidden /></Link>
            </p>
          </div>
        </>
      )}
    </section>
  )
}
