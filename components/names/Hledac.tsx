'use client'

// „Nevíme, kde začít."
//
// Nejčastější výchozí stav návštěvníka. Dlouhý formulář na začátku je
// špatná odpověď: „chcete tradiční, nebo moderní jméno?" většina lidí neumí
// zodpovědět dřív, než uvidí příklady. Proto se web ptá ukazováním —
// člověk vybírá z dvojic a systém si z toho odvodí vkus.
//
// Hodnotu dáváme dřív, než je hotovo: po třech kolech ukážeme první
// návrhy a nabídneme zpřesnění. Nikdo nemusí dojít na konec kvízu.

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Heart, Lock, RotateCcw, X } from 'lucide-react'
import { JMENA } from '@/lib/names/data'
import {
  doporuc, naucSe, popisPreferenci, slovemSkore, type Doporuceni,
} from '@/lib/names/rozhodovani'
import { slugJmena } from '@/lib/names/slug'
import { useVyber } from '@/lib/names/vyber'
import { KATEGORIE_INFO } from '@/lib/names/types'
import type { Jmeno, Kategorie, Styl } from '@/lib/names/types'

/** Po kolika kolech ukážeme první výsledky. */
const PRVNI_VYSLEDKY = 3
/** Kolik dvojic vůbec nabídneme, než řekneme „to stačí". */
const MAX_KOL = 8
/** Kolik jmen ukazujeme naráz — víc už je zahlcení, ne pomoc. */
const NAVRHU = 8

const ZVIRATA: Kategorie[] = [
  'pes', 'fenka', 'kocour', 'kocka', 'kun', 'kralik', 'papousek', 'krecek',
  'morce', 'had', 'rybka', 'zelva', 'fretka', 'koza', 'leguan',
]

interface Kolo { a: Jmeno; b: Jmeno }

/**
 * Dvojice sestavujeme tak, aby se jména lišila — jinak se z volby nic
 * nedozvíme. Osy voleb (tradiční × moderní, domácí × světové, krátké ×
 * dlouhé, běžné × vzácné) používáme jen tam, kde má obě strany čím
 * naplnit; u malých kategorií jich prostě bude míň.
 */
function pripravKola(kategorie: Kategorie[], seed: number): Kolo[] {
  const zaklad = JMENA.filter(j => kategorie.includes(j.kategorie))
  if (zaklad.length < 4) return []

  const styl = (s: Styl) => zaklad.filter(j => j.styly.includes(s))
  const osy: [Jmeno[], Jmeno[]][] = [
    [styl('tradiční'), styl('moderní')],
    [zaklad.filter(j => j.zeme === 'cz' || j.zeme === 'sk'), zaklad.filter(j => j.zeme !== 'cz' && j.zeme !== 'sk')],
    [zaklad.filter(j => j.slabiky <= 2), zaklad.filter(j => j.slabiky >= 3)],
    [zaklad.filter(j => j.popularita >= 88), zaklad.filter(j => j.popularita <= 74)],
    [styl('hravé'), styl('elegantní')],
    [styl('přírodní'), styl('královské')],
    [zaklad.filter(j => j.slabiky <= 2 && j.popularita <= 78), zaklad.filter(j => j.slabiky >= 3 && j.popularita >= 85)],
    [zaklad.filter(j => !/[áéěíóúůýčďňřšťž]/i.test(j.jmeno)), zaklad.filter(j => /[áéěíóúůýčďňřšťž]/i.test(j.jmeno))],
  ]

  // Deterministický výběr — stejný seed dá stejná kola, takže se obsah
  // po překreslení nemění pod rukama.
  const pouzita = new Set<string>()
  const vezmi = (pole: Jmeno[], posun: number): Jmeno | null => {
    if (!pole.length) return null
    for (let k = 0; k < pole.length; k++) {
      const j = pole[(seed * 7 + posun * 13 + k) % pole.length]
      if (!pouzita.has(j.id)) return j
    }
    return null
  }

  const kola: Kolo[] = []
  osy.forEach(([levy, pravy], i) => {
    if (kola.length >= MAX_KOL) return
    if (levy.length < 2 || pravy.length < 2) return
    const a = vezmi(levy, i)
    if (!a) return
    pouzita.add(a.id)
    const b = vezmi(pravy, i + 3)
    if (!b) return
    pouzita.add(b.id)
    kola.push({ a, b })
  })
  return kola
}

export default function Hledac({ druh }: { druh: 'deti' | 'zvirata' }) {
  const [vybrane, setVybrane] = useState<Kategorie[] | null>(null)
  const [seed] = useState(() => Math.floor(Math.random() * 997) + 1)
  const [kolo, setKolo] = useState(0)
  const [vybrana, setVybrana] = useState<Jmeno[]>([])
  const [odmitnuta, setOdmitnuta] = useState<Jmeno[]>([])
  const [prijmeni, setPrijmeni] = useState('')
  const { prepniOblibene, jeOblibene } = useVyber()

  const kategorie = vybrane ?? []
  const kola = useMemo(
    () => (kategorie.length ? pripravKola(kategorie, seed) : []),
    [kategorie, seed],
  )

  const preference = useMemo(() => naucSe(vybrana, odmitnuta), [vybrana, odmitnuta])
  const popis = popisPreferenci(preference)
  const konec = Math.min(MAX_KOL, kola.length)
  const hotovo = kolo >= konec
  const ukazVysledky = kategorie.length > 0 && (hotovo || kolo >= PRVNI_VYSLEDKY)

  const navrhy: Doporuceni[] = useMemo(() => {
    if (!ukazVysledky) return []
    return doporuc({
      preference,
      kategorie,
      prijmeni,
      vynech: odmitnuta.map(j => j.id),
    }, NAVRHU)
  }, [ukazVysledky, preference, kategorie, prijmeni, odmitnuta])

  const zvol = (vybrany: Jmeno, druhy: Jmeno) => {
    setVybrana(v => [...v, vybrany])
    setOdmitnuta(o => [...o, druhy])
    setKolo(k => k + 1)
  }

  const znovu = () => {
    setKolo(0); setVybrana([]); setOdmitnuta([])
  }

  // ── první krok: pro koho jméno hledáme ──────────────────────────────────
  if (vybrane === null) {
    const volby: { klic: string; popisek: string; emoji: string; kat: Kategorie[] }[] =
      druh === 'deti'
        ? [
            { klic: 'holka', popisek: 'Holčičku', emoji: KATEGORIE_INFO.holka.emoji, kat: ['holka'] },
            { klic: 'kluk', popisek: 'Chlapečka', emoji: KATEGORIE_INFO.kluk.emoji, kat: ['kluk'] },
            { klic: 'oboje', popisek: 'Ještě nevíme', emoji: '💛', kat: ['holka', 'kluk'] },
          ]
        : ZVIRATA.map(k => ({
            klic: k,
            popisek: KATEGORIE_INFO[k].nazev,
            emoji: KATEGORIE_INFO[k].emoji,
            kat: [k],
          }))

    return (
      <section className="hledac">
        <h2 className="hledac-otazka">
          {druh === 'deti' ? 'Koho čekáte?' : 'Koho budete pojmenovávat?'}
        </h2>
        <div className="hledac-volby">
          {volby.map(v => (
            <button
              key={v.klic}
              type="button"
              className="hledac-volba"
              onClick={() => setVybrane(v.kat)}
            >
              <span className="hledac-emoji" aria-hidden>{v.emoji}</span>
              {v.popisek}
            </button>
          ))}
        </div>
        <p className="hledac-pozn">
          <Lock size={13} aria-hidden /> Nic se nikam neodesílá. Celý výběr
          počítáme přímo ve vašem prohlížeči.
        </p>
      </section>
    )
  }

  return (
    <section className="hledac">
      {!hotovo && kola[kolo] && (
        <>
          <div className="hledac-postup">
            <p className="hledac-otazka">Které z nich je vám bližší?</p>
            <p className="hledac-krok">{kolo + 1}. z {konec}</p>
          </div>

          <div className="hledac-dvojice">
            {[kola[kolo].a, kola[kolo].b].map((j, i) => {
              const druhy = i === 0 ? kola[kolo].b : kola[kolo].a
              return (
                <button key={j.id} type="button" className="hledac-karta" onClick={() => zvol(j, druhy)}>
                  <span className="hledac-jmeno">{j.jmeno}</span>
                  <span className="hledac-vyznam">{j.vyznam}</span>
                </button>
              )
            })}
          </div>

          <button type="button" className="hledac-preskoc" onClick={() => setKolo(k => k + 1)}>
            Ani jedno — ukažte další dvojici
          </button>
        </>
      )}

      {ukazVysledky && (
        <div className="hledac-vysledky">
          <div className="hledac-shrnuti">
            <h3>{hotovo ? 'Tady jsou vaše jména' : 'Už máme první představu'}</h3>
            {popis.length > 0 ? (
              <p>Zatím to vypadá na <strong>{popis.join(', ')}</strong>.</p>
            ) : (
              <p>Ještě pár voleb a začneme vidět, co se vám líbí.</p>
            )}
          </div>

          <label className="porovnani-pole hledac-prijmeni">
            <span>Máte příjmení? Zpřesníme to <em>nepovinné</em></span>
            <span className="porovnani-vstup">
              <input
                value={prijmeni}
                onChange={e => setPrijmeni(e.target.value)}
                placeholder="Nováková"
                autoComplete="off"
              />
            </span>
          </label>

          <ul className="hledac-navrhy">
            {navrhy.map(d => (
              <li key={d.jmeno.id} className="hledac-navrh">
                <div className="hledac-navrh-hlava">
                  <Link href={`/jmeno/${slugJmena(d.jmeno.jmeno)}`} className="hledac-navrh-jmeno">
                    {d.jmeno.jmeno}
                  </Link>
                  <span className="hledac-skore">{slovemSkore(d.skore)}</span>
                  <button
                    type="button"
                    className={`srdicko ${jeOblibene(d.jmeno.id) ? 'je-aktivni' : ''}`}
                    onClick={() => prepniOblibene(d.jmeno.id)}
                    aria-pressed={jeOblibene(d.jmeno.id)}
                    aria-label={jeOblibene(d.jmeno.id)
                      ? `Odebrat ${d.jmeno.jmeno} z oblíbených`
                      : `Přidat ${d.jmeno.jmeno} do oblíbených`}
                  >
                    <Heart size={16} fill={jeOblibene(d.jmeno.id) ? 'currentColor' : 'none'} aria-hidden />
                  </button>
                </div>
                <p className="hledac-navrh-vyznam">{d.jmeno.vyznam}</p>
                {d.duvody.length > 0 && (
                  <details className="hledac-proc">
                    <summary>Proč mi ho doporučujete?</summary>
                    <ul>
                      {d.duvody.slice(0, 5).map((duvod, i) => (
                        <li key={i} className={duvod.pro ? 'je-pro' : 'je-proti'}>
                          <span aria-hidden>{duvod.pro ? '+' : '−'}</span> {duvod.text}
                        </li>
                      ))}
                    </ul>
                    <p className="hledac-proc-pozn">
                      Skóre {d.skore} ze 100 je součet pravidel výše, ne
                      pravděpodobnost, že budete spokojení.{' '}
                      <Link href="/metodika">Jak ho počítáme</Link>.
                    </p>
                  </details>
                )}
              </li>
            ))}
          </ul>

          <div className="hledac-dal">
            {!hotovo && (
              <p className="hledac-zpresnit">
                Chcete výsledky zpřesnit? Pokračujte ve výběru výš — každá
                volba je posune.
              </p>
            )}
            <div className="hledac-tlacitka">
              <button type="button" className="vyber-tlacitko" onClick={znovu}>
                <RotateCcw size={14} aria-hidden /> Začít znovu
              </button>
              <Link href="/oblibene" className="vyber-tlacitko je-hlavni">
                Můj výběr <ArrowRight size={14} aria-hidden />
              </Link>
              <Link href="/porovnat-jmena" className="vyber-tlacitko">
                Porovnat finalisty
              </Link>
            </div>
          </div>
        </div>
      )}

      {!ukazVysledky && (
        <p className="hledac-pozn">
          <Lock size={13} aria-hidden /> Nic se nikam neodesílá. Výběr
          počítáme přímo ve vašem prohlížeči.
        </p>
      )}

      {kategorie.length > 0 && kola.length === 0 && (
        <p className="hledac-pozn">
          <X size={13} aria-hidden /> Pro tuhle kategorii zatím nemáme dost
          jmen na porovnávání dvojic — zkuste{' '}
          <Link href="/zvirata">rovnou procházet katalog</Link>.
        </p>
      )}
    </section>
  )
}
