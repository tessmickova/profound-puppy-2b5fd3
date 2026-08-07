'use client'

// Rodinný profil: nakliká se celá rodina včetně zvířat a web sám doporučuje
// další lidská i zvířecí jména, která k současným ladí.

import { useMemo, useState } from 'react'
import { JMENA, zemePodleKodu } from '@/lib/names/data'
import { najdiProRodinu } from '@/lib/names/logic'
import type { Shoda } from '@/lib/names/logic'
import { KATEGORIE_INFO } from '@/lib/names/types'
import type { Kategorie } from '@/lib/names/types'
import { ROLE, useRodina } from '@/lib/names/rodina'
import { Srdicko, Stitky } from './NameCard'
import Reklama from './Reklama'

const SKUPINY: { kat: Kategorie; nadpis: string }[] = [
  { kat: 'holka',  nadpis: 'Holčičky' },
  { kat: 'kluk',   nadpis: 'Kluci' },
  { kat: 'pes',    nadpis: 'Psi' },
  { kat: 'fenka',  nadpis: 'Fenky' },
  { kat: 'kocour', nadpis: 'Kocouři' },
  { kat: 'kocka',  nadpis: 'Kočky' },
]

function DoporuceniKarta({ shoda, poradi }: { shoda: Shoda; poradi: number }) {
  const zeme = zemePodleKodu(shoda.jmeno.zeme)
  return (
    <article className="rounded-2xl border border-[#efe7da] bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h4 className="[font-family:var(--font-syne)] text-lg font-bold">
          <span className="mr-1.5 text-sm font-semibold text-[#c4b8a7]">{poradi}.</span>
          {shoda.jmeno.jmeno}
          <span className="ml-2 text-sm">{zeme?.vlajka}</span>
        </h4>
        <div className="flex items-center gap-2">
          <span>
            <span className="[font-family:var(--font-syne)] text-xl font-extrabold text-[#d97757]">{shoda.skore}</span>
            <span className="text-[10px] text-[#8a7f71]"> /100</span>
          </span>
          <Srdicko id={shoda.jmeno.id} />
        </div>
      </div>
      <div className="mt-1 flex flex-wrap gap-1.5 empty:hidden">
        <Stitky jmeno={shoda.jmeno} />
      </div>
      <p className="mt-1.5 text-xs text-[#6b6156]">{shoda.jmeno.vyznam}</p>
      {shoda.duvody.length > 0 && (
        <ul className="mt-2 space-y-1 text-[11px] text-[#8a7f71]">
          {shoda.duvody.slice(0, 3).map((d, i) => (
            <li key={i} className="flex gap-1.5"><span aria-hidden>•</span>{d}</li>
          ))}
        </ul>
      )}
    </article>
  )
}

export default function RodinaProfil() {
  const { clenove, pridej, odeber } = useRodina()
  const [jmeno, setJmeno] = useState('')
  const [role, setRole] = useState('maminka')

  const jmenaClenu = useMemo(() => clenove.map(c => c.jmeno), [clenove])
  const doporuceni = useMemo(
    () => SKUPINY.map(s => ({ ...s, shody: najdiProRodinu(JMENA, jmenaClenu, s.kat, 6) })),
    [jmenaClenu],
  )

  const pridat = () => {
    pridej(jmeno, role)
    setJmeno('')
  }

  return (
    <div>
      <section className="mb-8 rounded-3xl border border-[#e8dfd2] bg-white p-6 shadow-sm">
        <h2 className="[font-family:var(--font-syne)] text-xl font-bold">Kdo už doma je</h2>
        <p className="mt-1 text-sm text-[#8a7f71]">
          Naklikejte svou rodinu včetně zvířat. Profil se ukládá jen ve vašem prohlížeči —
          žádná registrace není potřeba a nikam se nic neposílá.
        </p>

        <form
          className="mt-4 flex flex-wrap gap-2"
          onSubmit={e => { e.preventDefault(); pridat() }}
        >
          <input
            value={jmeno}
            onChange={e => setJmeno(e.target.value)}
            placeholder="jméno — např. Jana nebo Rex"
            className="w-56 rounded-full border border-[#e8dfd2] bg-[#faf6ef] px-4 py-2 text-sm outline-none focus:border-[#2b2723]"
          />
          <select
            value={role}
            onChange={e => setRole(e.target.value)}
            className="rounded-full border border-[#e8dfd2] bg-[#faf6ef] px-3 py-2 text-sm outline-none focus:border-[#2b2723]"
          >
            {ROLE.map(r => <option key={r.id} value={r.id}>{r.emoji} {r.nazev}</option>)}
          </select>
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

      <div className="mb-8">
        <Reklama plocha="rodina-1" varianta="pruh" />
      </div>

      {clenove.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[#e8dfd2] p-12 text-center text-[#8a7f71]">
          <p className="text-4xl">👪</p>
          <p className="mt-3">
            Přidejte prvního člena rodiny — třeba sebe nebo svého mazlíčka — a hned
            doporučíme další jména, která k vám budou patřit.
          </p>
        </div>
      ) : (
        <>
          <h2 className="mb-1 [font-family:var(--font-syne)] text-2xl font-bold">Kdo by k vám ještě ladil</h2>
          <p className="mb-6 text-sm text-[#8a7f71]">
            Doporučení se počítají ze jmen, která už doma máte — podle stylu, původu, rytmu
            i toho, aby se nová jména s těmi současnými nepletla a nerýmovala.
          </p>
          {doporuceni.map(({ kat, nadpis, shody }, i) => (
            <section key={kat} className="mb-8">
              <h3 className="mb-3 [font-family:var(--font-syne)] text-xl font-bold">
                {KATEGORIE_INFO[kat].emoji} {nadpis}
              </h3>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {shody.map((s, j) => <DoporuceniKarta key={s.jmeno.id} shoda={s} poradi={j + 1} />)}
                {i < 3 && <Reklama plocha={`rodina-${i + 2}`} />}
              </div>
            </section>
          ))}
          <Reklama plocha="rodina-5" varianta="pruh" />
        </>
      )}
    </div>
  )
}
