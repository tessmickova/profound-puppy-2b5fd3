'use client'

// Rodinný profil: nakliká se celá rodina včetně zvířat a web sám doporučuje
// další lidská i zvířecí jména, která k současným ladí.

import { useMemo, useState } from 'react'
import { JMENA } from '@/lib/names/data'
import { najdiProRodinu } from '@/lib/names/logic'
import type { Kategorie } from '@/lib/names/types'
import { Users } from 'lucide-react'
import { ROLE, useRodina } from '@/lib/names/rodina'
import ShodaKarta from './ShodaKarta'
import Vyber from './Vyber'
import VolbaPodrobnosti from './VolbaPodrobnosti'
import Rozvrzeni from './Rozvrzeni'
import NadpisSekce from './NadpisSekce'

const SKUPINY: { kat: Kategorie; nadpis: string }[] = [
  { kat: 'holka',  nadpis: 'Holčičky' },
  { kat: 'kluk',   nadpis: 'Kluci' },
  { kat: 'pes',    nadpis: 'Psi' },
  { kat: 'fenka',  nadpis: 'Fenky' },
  { kat: 'kocour', nadpis: 'Kocouři' },
  { kat: 'kocka',  nadpis: 'Kočky' },
]

/** Kolik jmen na kategorii ukázat — dá se rozbalit až na všechna. */
const STUPNE = [6, 12, 24, Infinity]

export default function RodinaProfil() {
  const { clenove, pridej, odeber } = useRodina()
  const [jmeno, setJmeno] = useState('')
  const [role, setRole] = useState('maminka')

  const [stupen, setStupen] = useState(0)

  const jmenaClenu = useMemo(() => clenove.map(c => c.jmeno), [clenove])
  const doporuceni = useMemo(
    () => SKUPINY.map(s => ({
      ...s,
      shody: najdiProRodinu(JMENA, jmenaClenu, s.kat, Infinity),
    })),
    [jmenaClenu],
  )
  const kolik = STUPNE[stupen]
  const jeVsechno = stupen === STUPNE.length - 1

  const pridat = () => {
    pridej(jmeno, role)
    setJmeno('')
  }

  return (
    <Rozvrzeni>
      <section className="mb-8 rounded-3xl border border-[#e8dfd2] bg-white p-6 shadow-xs">
        <h2 className="[font-family:var(--font-nadpis)] text-xl font-bold">Kdo už doma je</h2>
        <p className="mt-1 text-sm text-[#8a7f71]">
          Naklikejte svou rodinu včetně zvířat. Profil se ukládá jen ve vašem prohlížeči —
          žádná registrace není potřeba a nikam se nic neposílá.
        </p>

        <form
          className="rodina-pridani mt-4 flex flex-wrap gap-2"
          onSubmit={e => { e.preventDefault(); pridat() }}
        >
          <input
            value={jmeno}
            onChange={e => setJmeno(e.target.value)}
            placeholder="jméno — např. Jana nebo Rex"
            className="w-56 max-w-full rounded-full border border-[#e8dfd2] bg-[#faf6ef] px-4 py-2 text-sm outline-hidden focus:border-[#2b2723]"
          />
          <div className="w-44">
            <Vyber
              hodnota={role}
              popisek="Kdo to je"
              onZmena={setRole}
              volby={ROLE.map(r => ({ hodnota: r.id, nazev: r.nazev, znak: r.emoji }))}
            />
          </div>
          <button
            type="submit"
            disabled={!jmeno.trim()}
            className="rounded-full bg-[#2b2723] px-5 py-2 text-sm font-semibold text-[#faf6ef] disabled:opacity-40"
          >
            + Přidat do rodiny
          </button>
        </form>

        {clenove.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-2">
            {clenove.map(c => {
              const r = ROLE.find(x => x.id === c.role)
              return (
                <li key={c.id} className="flex items-center gap-2 rounded-full border border-[#e8dfd2] bg-[#faf6ef] px-3 py-1.5 text-sm">
                  <span>{r?.emoji}</span>
                  <span className="font-semibold">{c.jmeno}</span>
                  <span className="text-xs text-[#8a7f71]">{r?.nazev.toLowerCase()}</span>
                  <button
                    onClick={() => odeber(c.id)}
                    aria-label={`Odebrat ${c.jmeno}`}
                    className="ml-1 text-[#8a7f71] hover:text-[#b3403a]"
                  >
                    ×
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {clenove.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[#e8dfd2] p-12 text-center text-[#8a7f71]">
          <p className="flex justify-center text-[#c4b8a7]"><Users size={40} strokeWidth={1.5} aria-hidden /></p>
          <p className="mt-3">
            Přidejte prvního člena rodiny — třeba sebe nebo svého mazlíčka — a hned
            doporučíme další jména, která k vám budou patřit.
          </p>
        </div>
      ) : (
        <>
          <h2 className="mb-1 [font-family:var(--font-nadpis)] text-2xl font-bold">Kdo by k vám ještě ladil</h2>
          <p className="mb-4 text-sm text-[#8a7f71]">
            Doporučení se počítají ze jmen, která už doma máte — podle stylu, původu, rytmu
            i toho, aby se nová jména s těmi současnými nepletla a nerýmovala.
          </p>
          <div className="mb-6 rounded-2xl border border-[#e8dfd2] bg-white p-4">
            <VolbaPodrobnosti />
          </div>
          {doporuceni.map(({ kat, nadpis, shody }) => (
            <section key={kat} className="mb-8">
              <div className="mb-3">
                <NadpisSekce druh={kat === 'kluk' || kat === 'holka' ? 'lide' : 'zvirata'} uroven={3}>
                  {nadpis}
                </NadpisSekce>
              </div>
              <div className="nastup grid gap-3 sm:grid-cols-2">
                {shody.slice(0, kolik).map((s, j) => <ShodaKarta key={s.jmeno.id} shoda={s} poradi={j + 1} />)}
              </div>
            </section>
          ))}
          <div className="dalsi-pruh">
            {!jeVsechno && (
              <button type="button" className="dalsi-tlacitko" onClick={() => setStupen(s => s + 1)}>
                Zobrazit víc jmen v každé kategorii
              </button>
            )}
            {stupen > 0 && (
              <button type="button" className="dalsi-vse" onClick={() => setStupen(0)}>
                Zase zkrátit
              </button>
            )}
            <p className="dalsi-pocet">
              {jeVsechno
                ? 'Vidíte všechna jména, která k vaší rodině ladí.'
                : `V každé kategorii je vidět ${kolik} jmen.`}
            </p>
          </div>
        </>
      )}
    </Rozvrzeni>
  )
}
