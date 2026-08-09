'use client'

// Praktický test celého jména.
//
// Rodiče se neptají „jaká je etymologie", ale „jak to bude znít, až na něj
// budu volat", „nebude to muset hláskovat" a „nevznikne z iniciál nesmysl".
// Tenhle nástroj na tyhle otázky odpovídá.
//
// Záměrně nevynáší verdikt „dobré / špatné jméno". Ukazuje kompromisy;
// rozhodnutí patří rodiči.

import { useMemo, useState } from 'react'
import { ArrowRight, Check, CircleAlert, Info } from 'lucide-react'
import Link from 'next/link'
import { otestuj } from '@/lib/names/rozhodovani'
import { REJSTRIK } from '@/lib/names/rejstrik'

const ZNAKY = {
  dobre: { Ikona: Check, popis: 'v pořádku' },
  zvazte: { Ikona: CircleAlert, popis: 'stojí za zvážení' },
  neutral: { Ikona: Info, popis: 'pro informaci' },
} as const

export default function TestJmena({ vychoziJmeno = '' }: { vychoziJmeno?: string }) {
  const [jmeno, setJmeno] = useState(vychoziJmeno)
  const [prijmeni, setPrijmeni] = useState('')
  const [druhe, setDruhe] = useState('')

  const body = useMemo(
    () => (jmeno.trim() ? otestuj(jmeno, prijmeni, druhe) : []),
    [jmeno, prijmeni, druhe],
  )

  return (
    <section className="test-jmena">
      <div className="test-vstupy">
        <label className="porovnani-pole">
          <span>Jméno</span>
          <span className="porovnani-vstup">
            <input
              value={jmeno}
              onChange={e => setJmeno(e.target.value)}
              placeholder="Eliška"
              list="test-napoveda"
              autoComplete="off"
            />
          </span>
        </label>
        <label className="porovnani-pole">
          <span>Příjmení</span>
          <span className="porovnani-vstup">
            <input
              value={prijmeni}
              onChange={e => setPrijmeni(e.target.value)}
              placeholder="Nováková"
              autoComplete="off"
            />
          </span>
        </label>
        <label className="porovnani-pole">
          <span>Druhé jméno <em>nepovinné</em></span>
          <span className="porovnani-vstup">
            <input
              value={druhe}
              onChange={e => setDruhe(e.target.value)}
              placeholder="Marie"
              autoComplete="off"
            />
          </span>
        </label>
      </div>

      <datalist id="test-napoveda">
        {REJSTRIK.slice(0, 400).map(p => <option key={p.j} value={p.j} />)}
      </datalist>

      <p className="porovnani-pozn">
        Jméno ani příjmení nikam neodesíláme — počítá se to přímo ve vašem prohlížeči.
      </p>

      {body.length === 0 ? (
        <p className="porovnani-cekame">Napište jméno a hned uvidíte, jak se bude chovat v běžném životě.</p>
      ) : (
        <>
          <ul className="test-vysledky">
            {body.map(b => {
              const { Ikona, popis } = ZNAKY[b.stav]
              return (
                <li key={b.otazka} className={`test-bod je-${b.stav}`}>
                  <span className="test-znak" title={popis}><Ikona size={15} aria-hidden /><span className="sr-only">{popis}</span></span>
                  <span className="test-obsah">
                    <strong>{b.otazka}</strong>
                    <span>{b.odpoved}</span>
                  </span>
                </li>
              )
            })}
          </ul>

          <p className="test-vysvetleni">
            Nic z toho není verdikt. Jsou to <strong>praktické důsledky</strong>,
            které se s jménem ponesou — co s nimi, je na vás.{' '}
            <Link href="/metodika">Jak to počítáme</Link>.
          </p>

          <p className="porovnani-odkazy">
            <Link href="/porovnat-jmena">Porovnat s dalším jménem <ArrowRight size={13} aria-hidden /></Link>
          </p>
        </>
      )}
    </section>
  )
}
