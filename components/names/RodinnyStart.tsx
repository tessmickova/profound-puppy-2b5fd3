'use client'

// Rodinný start na úvodní stránce — hlavní prvek celého webu.
//
// Dřív tu stál formulář se šesti poli (příjmení, maminka, tatínek,
// sourozenec, měsíc…). Kdo přijde vybírat jméno, nechce vyplňovat
// dotazník: chce jednu otázku po druhé a hned něco vidět.
//
// Proto postupné odhalování — každý krok je jedna otázka a každá akce má
// okamžitou odměnu: zadané jméno se promění v kartičku člena rodiny, takže
// se rodina „skládá“ před očima. Role je nepovinná, všechno jde přeskočit
// a výsledky se ukážou rovnou tady, ne až na jiné stránce.
//
// Data jdou do sdíleného profilu (`lib/names/rodina.ts`), takže /rodina
// i hledání ukazují okamžitě totéž.

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Heart, Sparkles, Star, X } from 'lucide-react'
import { JMENA } from '@/lib/names/data'
import { najdiNejlepsiShody } from '@/lib/names/logic'
import { otevriDetail } from '@/lib/names/detail'
import { roleInfo, useRodina } from '@/lib/names/rodina'
import { useVyber } from '@/lib/names/vyber'

/** Role v rychlé volbě. Lidé napřed, zvířata za nimi — pořadí podle četnosti. */
const RYCHLE_ROLE = ['maminka', 'tatinek', 'dcera', 'syn', 'pes', 'kocka'] as const

/** Kolik jmen ukážeme napoprvé a o kolik přidá „Objevit další“. */
const KOLIK = 6
const NEJVIC = 24

type Pohlavi = 'holka' | 'kluk' | null

export default function RodinnyStart() {
  const { clenove, prijmeni, rodice, sourozenci, pridej, odeber, nastavPrijmeni } = useRodina()
  const { prepniOblibene, jeOblibene, prepniHvezdu, jeHvezda } = useVyber()

  // Krok se odvozuje z dat, ne z historie klikání: kdo se vrátí s uloženou
  // rodinou, nezačíná znovu od příjmení.
  const [krok, setKrok] = useState<1 | 2>(1)
  const [navrhPrijmeni, setNavrhPrijmeni] = useState('')
  const [pridavamRoli, setPridavamRoli] = useState<string | null>(null)
  const [noveJmeno, setNoveJmeno] = useState('')
  const [pohlavi, setPohlavi] = useState<Pohlavi>(null)
  const [kolik, setKolik] = useState(KOLIK)
  const vstupJmena = useRef<HTMLInputElement>(null)

  // Uložený profil dorazí až po připojení k úložišti (server ho nezná).
  useEffect(() => {
    if (prijmeni) setNavrhPrijmeni(p => p || prijmeni)
    if (prijmeni || clenove.length) setKrok(2)
    // Doběhne jen při prvním doplnění dat; pak už si krok řídí člověk.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prijmeni, clenove.length > 0])

  const potvrdPrijmeni = () => {
    nastavPrijmeni(navrhPrijmeni.trim())
    setKrok(2)
  }

  const potvrdClena = () => {
    if (!noveJmeno.trim() || !pridavamRoli) return
    pridej(noveJmeno, pridavamRoli)
    setNoveJmeno('')
    setPridavamRoli(null)
  }

  const zacniPridavat = (role: string) => {
    setPridavamRoli(role)
    queueMicrotask(() => vstupJmena.current?.focus())
  }

  // Hledáme, jakmile je co — jméno kohokoli z rodiny nebo příjmení stačí.
  const zadano = Boolean(prijmeni.trim() || clenove.length)

  const shody = useMemo(() => {
    if (!zadano || !pohlavi) return []
    return najdiNejlepsiShody(JMENA, {
      pohlavi,
      prijmeni,
      mesic: null,
      styly: [],
      zeme: [],
      maminka: rodice[0] ?? '',
      tatinek: rodice[1] ?? '',
      sourozenci,
    }, kolik)
  }, [zadano, pohlavi, prijmeni, rodice, sourozenci, kolik])

  return (
    <section className="rodina-hero start" aria-label="Najdeme jméno, které ladí k vaší rodině">
      <ol className="start-kroky" aria-label={`Krok ${krok} ze 3`}>
        <li className={krok === 1 ? 'je-tady' : 'je-hotovy'}>Příjmení</li>
        <li className={krok === 2 ? 'je-tady' : ''}>Rodina</li>
        <li className={shody.length ? 'je-tady' : ''}>Jména</li>
      </ol>

      {krok === 1 ? (
        <form
          className="start-krok"
          onSubmit={e => { e.preventDefault(); potvrdPrijmeni() }}
        >
          <h1>
            Najdeme jméno, které <span>zapadne právě k vám</span>
          </h1>
          <p className="rodina-hero-podnadpis">
            Začneme tím nejdůležitějším — jméno a příjmení musí znít dobře dohromady.
          </p>

          <label className="start-otazka" htmlFor="start-prijmeni">
            Jaké příjmení bude dítě nosit?
          </label>
          <div className="start-radek">
            <input
              id="start-prijmeni"
              className="start-vstup"
              value={navrhPrijmeni}
              onChange={e => setNavrhPrijmeni(e.target.value)}
              placeholder="např. Nováková"
              autoComplete="family-name"
            />
            <button type="submit" className="vyber-tlacitko je-hlavni">
              Pokračovat <ArrowRight size={15} aria-hidden />
            </button>
          </div>
          <button type="button" className="start-preskocit" onClick={() => setKrok(2)}>
            Příjmení zatím nevíme — přeskočit
          </button>
        </form>
      ) : (
        <div className="start-krok">
          <h1>
            {prijmeni.trim() ? <>{prijmeni.trim()} — a <span>kdo už je doma?</span></> : <>A <span>kdo už je doma?</span></>}
          </h1>
          <p className="rodina-hero-podnadpis">
            Stačí křestní jména. Podle nich najdeme jména, která k vaší rodině
            ladí — a u každého napíšeme proč.
          </p>

          {clenove.length > 0 && (
            <ul className="start-clenove" aria-label="Vaše rodina">
              {clenove.map(c => {
                const r = roleInfo(c.role)
                return (
                  <li key={c.id} className="start-clen">
                    <span aria-hidden>{r.emoji}</span>
                    <strong>{c.jmeno}</strong>
                    <small>{r.nazev.toLowerCase()}</small>
                    <button
                      type="button"
                      onClick={() => odeber(c.id)}
                      aria-label={`Odebrat ${c.jmeno} z rodiny`}
                    >
                      <X size={13} aria-hidden />
                    </button>
                  </li>
                )
              })}
            </ul>
          )}

          {pridavamRoli === null ? (
            <div className="start-role" role="group" aria-label="Přidat člena rodiny">
              {RYCHLE_ROLE.map(id => {
                const r = roleInfo(id)
                return (
                  <button key={id} type="button" className="start-role-tlacitko" onClick={() => zacniPridavat(id)}>
                    <span aria-hidden>{r.emoji}</span> {r.nazev}
                  </button>
                )
              })}
              <button
                type="button"
                className="start-role-tlacitko je-dalsi"
                onClick={() => zacniPridavat('zvire')}
              >
                <span aria-hidden>✨</span> Někdo další
              </button>
            </div>
          ) : (
            <form className="start-radek" onSubmit={e => { e.preventDefault(); potvrdClena() }}>
              <label className="start-otazka" htmlFor="start-jmeno">
                <span aria-hidden>{roleInfo(pridavamRoli).emoji}</span>{' '}
                Jak se jmenuje {roleInfo(pridavamRoli).nazev.toLowerCase()}?
              </label>
              <input
                id="start-jmeno"
                ref={vstupJmena}
                className="start-vstup"
                value={noveJmeno}
                onChange={e => setNoveJmeno(e.target.value)}
                placeholder="křestní jméno"
                autoComplete="off"
              />
              <button type="submit" className="vyber-tlacitko je-hlavni" disabled={!noveJmeno.trim()}>
                Přidat
              </button>
              <button
                type="button"
                className="start-preskocit"
                onClick={() => { setPridavamRoli(null); setNoveJmeno('') }}
              >
                zrušit
              </button>
            </form>
          )}

          <div className="start-pohlavi">
            <p className="start-otazka">Koho pojmenováváme?</p>
            <div className="start-role">
              <button
                type="button"
                className={`start-role-tlacitko ${pohlavi === 'holka' ? 'je-vybrany' : ''}`}
                aria-pressed={pohlavi === 'holka'}
                onClick={() => { setPohlavi('holka'); setKolik(KOLIK) }}
              >
                <span aria-hidden>👧</span> Holčičku
              </button>
              <button
                type="button"
                className={`start-role-tlacitko ${pohlavi === 'kluk' ? 'je-vybrany' : ''}`}
                aria-pressed={pohlavi === 'kluk'}
                onClick={() => { setPohlavi('kluk'); setKolik(KOLIK) }}
              >
                <span aria-hidden>👦</span> Chlapečka
              </button>
              <Link href="/deti" className="start-role-tlacitko je-dalsi">
                <span aria-hidden>💛</span> Ještě nevíme
              </Link>
            </div>
          </div>

          <p className="rodina-hero-pozn">
            Nic se nikam neodesílá — počítá se to přímo ve vašem prohlížeči.
            Rodinu upravíte kdykoli na <Link href="/rodina">svém profilu</Link>.
          </p>
        </div>
      )}

      {shody.length > 0 && (
        <div className="rodina-hero-vysledky">
          <h2>
            <Sparkles size={15} aria-hidden /> Jména, která k vám ladí
          </h2>

          <ul className="rodina-hero-mrizka">
            {shody.map(s => (
              <li key={s.jmeno.id} className="rodina-navrh">
                <div className="rodina-navrh-hlava">
                  {/* Panel funguje pro každé jméno v katalogu; vlastní
                      stránku mají jen některá a odkaz by končil na 404. */}
                  <button type="button" className="rodina-navrh-jmeno" onClick={() => otevriDetail(s.jmeno.id)}>
                    {s.jmeno.jmeno}
                  </button>
                  <span className="rodina-navrh-akce">
                    <button
                      type="button"
                      className={`hvezdicka ${jeHvezda(s.jmeno.id) ? 'je-aktivni' : ''}`}
                      onClick={() => prepniHvezdu(s.jmeno.id)}
                      aria-pressed={jeHvezda(s.jmeno.id)}
                      aria-label={jeHvezda(s.jmeno.id)
                        ? `Odebrat ${s.jmeno.jmeno} z favoritů`
                        : `Označit ${s.jmeno.jmeno} jako favorita`}
                    >
                      <Star size={15} fill={jeHvezda(s.jmeno.id) ? 'currentColor' : 'none'} aria-hidden />
                    </button>
                    <button
                      type="button"
                      className={`srdicko ${jeOblibene(s.jmeno.id) ? 'je-aktivni' : ''}`}
                      onClick={() => prepniOblibene(s.jmeno.id)}
                      aria-pressed={jeOblibene(s.jmeno.id)}
                      aria-label={jeOblibene(s.jmeno.id)
                        ? `Odebrat ${s.jmeno.jmeno} z výběru`
                        : `Uložit ${s.jmeno.jmeno} do výběru`}
                    >
                      <Heart size={15} fill={jeOblibene(s.jmeno.id) ? 'currentColor' : 'none'} aria-hidden />
                    </button>
                  </span>
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

          <div className="rodina-hero-dal">
            {shody.length >= kolik && kolik < NEJVIC && (
              <button type="button" className="vyber-tlacitko" onClick={() => setKolik(k => k + KOLIK)}>
                Objevit další jména
              </button>
            )}
            <Link href={pohlavi ? `/deti?kategorie=${pohlavi}` : '/deti'}>
              Otevřít celý katalog s filtry <ArrowRight size={14} aria-hidden />
            </Link>
          </div>
        </div>
      )}
    </section>
  )
}
