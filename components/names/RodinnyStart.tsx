'use client'

// Rodinný start na úvodní stránce.
//
// Žádný formulář se šesti poli — jedna otázka po druhé, každá akce má
// okamžitou vizuální odměnu: zadané jméno se promění v kartičku člena
// rodiny. Data jdou do sdíleného profilu (localStorage), takže /rodina
// i /deti ukazují okamžitě totéž. Role je nepovinná — hlavní je jméno.

import { useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ROLE, useRodina } from '@/lib/names/rodina'

/** Role nabízené v rychlé volbě — lidé první, zvířata za „dalším“. */
const RYCHLE_ROLE = ['maminka', 'tatinek', 'dcera', 'syn', 'pes', 'kocka'] as const

const roleInfo = (id: string) => ROLE.find(r => r.id === id) ?? { id, nazev: 'Člen rodiny', emoji: '✨' }

export default function RodinnyStart() {
  const router = useRouter()
  const { clenove, prijmeni, nastavPrijmeni, pridej, odeber } = useRodina()

  // Krok se odvozuje od dat: kdo má příjmení, je za prvním krokem.
  const [krok, setKrok] = useState<1 | 2>(prijmeni.trim() ? 2 : 1)
  const [prijmeniNavrh, setPrijmeniNavrh] = useState(prijmeni)
  const [pridavamRoli, setPridavamRoli] = useState<string | null>(null)
  const [noveJmeno, setNoveJmeno] = useState('')
  const vstupJmena = useRef<HTMLInputElement>(null)

  const potvrdPrijmeni = () => {
    nastavPrijmeni(prijmeniNavrh.trim())
    setKrok(2)
  }

  const potvrdClena = () => {
    if (noveJmeno.trim() && pridavamRoli) {
      pridej(noveJmeno, pridavamRoli)
      setNoveJmeno('')
      setPridavamRoli(null)
    }
  }

  const ukazJmena = (kategorie: 'holka' | 'kluk' | null) => {
    router.push(kategorie ? `/deti?kategorie=${kategorie}` : '/deti')
  }

  return (
    <section
      aria-label="Rodinný start — najdeme jméno pro vaši rodinu"
      className="mx-auto mt-7 max-w-xl rounded-3xl border border-[#e8dfd2] bg-white p-6 text-left shadow-sm"
    >
      {/* drobný ukazatel kroků — bez čísel, jen tečky */}
      <p className="mb-4 flex items-center gap-2 text-[11.5px] font-semibold uppercase tracking-wide text-[#8a7f71]">
        <span aria-hidden className={krok === 1 ? 'text-[#d97757]' : ''}>● Příjmení</span>
        <span aria-hidden>─</span>
        <span aria-hidden className={krok === 2 ? 'text-[#d97757]' : ''}>● Rodina</span>
        <span aria-hidden>─</span>
        <span aria-hidden>○ Jména</span>
        <span className="sr-only">Krok {krok} ze 2</span>
      </p>

      {krok === 1 && (
        <form onSubmit={e => { e.preventDefault(); potvrdPrijmeni() }}>
          <label htmlFor="rs-prijmeni" className="[font-family:var(--font-nadpis)] text-lg font-bold">
            Jaké příjmení bude dítě nosit?
          </label>
          <p className="mb-3 mt-1 text-[13px] text-[#8a7f71]">
            Jméno a příjmení mají znít dohromady — proto začínáme tady.
          </p>
          <div className="flex gap-2">
            <input
              id="rs-prijmeni"
              value={prijmeniNavrh}
              onChange={e => setPrijmeniNavrh(e.target.value)}
              placeholder="např. Nováková"
              autoComplete="family-name"
              className="min-w-0 flex-1 rounded-xl border border-[#e0d5c5] px-4 py-2.5 text-[15px] focus:border-[#d97757] focus:outline-none"
            />
            <button type="submit" className="rounded-xl bg-[#d97757] px-5 py-2.5 font-bold text-white hover:bg-[#c4633f]">
              Pokračovat →
            </button>
          </div>
          <button type="button" onClick={() => setKrok(2)} className="mt-2 text-[12.5px] text-[#8a7f71] underline decoration-dotted hover:text-[#2b2723]">
            Přeskočit — příjmení doplním později
          </button>
        </form>
      )}

      {krok === 2 && (
        <div>
          <h2 className="[font-family:var(--font-nadpis)] text-lg font-bold">
            {prijmeni.trim() ? `${prijmeni.trim()} — zní to dobře. ` : ''}Kdo už je doma?
          </h2>
          <p className="mb-3 mt-1 text-[13px] text-[#8a7f71]">
            Stačí křestní jména — doporučíme jména, která k vaší rodině ladí. Klidně přeskočte.
          </p>

          {/* kartičky přidaných členů — okamžitá odměna za každé jméno */}
          {clenove.length > 0 && (
            <ul className="mb-3 flex flex-wrap gap-2" aria-label="Členové rodiny">
              {clenove.map(c => {
                const r = roleInfo(c.role)
                return (
                  <li key={c.id} className="nastup flex items-center gap-1.5 rounded-full border border-[#e8dfd2] bg-[#faf6ef] py-1 pl-2.5 pr-1 text-[13.5px] font-semibold">
                    <span aria-hidden>{r.emoji}</span> {c.jmeno}
                    <span className="text-[11px] font-normal text-[#8a7f71]">{r.nazev.toLowerCase()}</span>
                    <button
                      type="button"
                      onClick={() => odeber(c.id)}
                      aria-label={`Odebrat ${c.jmeno}`}
                      className="rounded-full px-1.5 text-[#8a7f71] hover:bg-[#f0e8dc] hover:text-[#2b2723]"
                    >×</button>
                  </li>
                )
              })}
            </ul>
          )}

          {pridavamRoli === null ? (
            <div className="flex flex-wrap gap-2" role="group" aria-label="Přidat člena rodiny">
              {RYCHLE_ROLE.map(id => {
                const r = roleInfo(id)
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => { setPridavamRoli(id); queueMicrotask(() => vstupJmena.current?.focus()) }}
                    className="rounded-full border border-[#e0d5c5] bg-white px-3.5 py-2 text-[13.5px] font-semibold hover:border-[#d97757] hover:bg-[#fdf3ef]"
                  >
                    <span aria-hidden>{r.emoji}</span> {r.nazev}
                  </button>
                )
              })}
              <button
                type="button"
                onClick={() => { setPridavamRoli('zvire'); queueMicrotask(() => vstupJmena.current?.focus()) }}
                className="rounded-full border border-dashed border-[#e0d5c5] px-3.5 py-2 text-[13.5px] font-semibold text-[#8a7f71] hover:border-[#d97757] hover:text-[#2b2723]"
              >
                ✨ Někdo další
              </button>
            </div>
          ) : (
            <form onSubmit={e => { e.preventDefault(); potvrdClena() }} className="flex flex-wrap items-center gap-2">
              <span className="text-[14px] font-semibold" aria-hidden>{roleInfo(pridavamRoli).emoji}</span>
              <label htmlFor="rs-jmeno" className="text-[14px] font-semibold">
                Jak se jmenuje {roleInfo(pridavamRoli).nazev.toLowerCase()}?
              </label>
              <input
                id="rs-jmeno"
                ref={vstupJmena}
                value={noveJmeno}
                onChange={e => setNoveJmeno(e.target.value)}
                placeholder="křestní jméno"
                autoComplete="off"
                className="min-w-0 flex-1 rounded-xl border border-[#e0d5c5] px-3.5 py-2 text-[14.5px] focus:border-[#d97757] focus:outline-none"
              />
              <button type="submit" className="rounded-xl bg-[#2b2723] px-4 py-2 text-[14px] font-bold text-white">✓</button>
              <button type="button" onClick={() => { setPridavamRoli(null); setNoveJmeno('') }} className="text-[13px] text-[#8a7f71] underline decoration-dotted">
                zrušit
              </button>
            </form>
          )}

          <div className="mt-5 border-t border-[#f0e8dc] pt-4">
            <p className="mb-2 text-[14px] font-semibold">Koho pojmenováváme?</p>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => ukazJmena('holka')} className="rounded-xl bg-[#d97757] px-4 py-2.5 font-bold text-white hover:bg-[#c4633f]">
                👧 Holčičku
              </button>
              <button type="button" onClick={() => ukazJmena('kluk')} className="rounded-xl bg-[#d97757] px-4 py-2.5 font-bold text-white hover:bg-[#c4633f]">
                👦 Chlapečka
              </button>
              <button type="button" onClick={() => ukazJmena(null)} className="rounded-xl border border-[#e0d5c5] bg-white px-4 py-2.5 font-bold hover:border-[#d97757]">
                💛 Ještě nevíme
              </button>
            </div>
            <p className="mt-3 text-[12.5px] text-[#8a7f71]">
              Hledáte pro zvíře? <Link href="/zvirata" className="underline decoration-dotted hover:text-[#2b2723]">Jména pro zvířata →</Link>
              {' '}· Rodinu kdykoli upravíte na <Link href="/rodina" className="underline decoration-dotted hover:text-[#2b2723]">svém profilu</Link>.
            </p>
          </div>
        </div>
      )}
    </section>
  )
}
