'use client'

// Karta jména záměrně ukazuje jen to hlavní — jméno, odkud je a jestli je
// uložené. Význam, analýza i numerologie patří do panelu, který se vysune
// po kliknutí.

import { useState } from 'react'
import { KATEGORIE_INFO, POHLAVI_INFO } from '@/lib/names/types'
import type { Jmeno } from '@/lib/names/types'
import { zemePodleKodu } from '@/lib/names/data'
import { jeHit, jeOriginal, jeTrendy } from '@/lib/names/logic'
import { useOblibene } from '@/lib/names/oblibene'
import { otevriDetail } from '@/lib/names/detail'

/** Jeden štítek navíc — víc jich na kartu nepatří. */
function hlavniStitek(j: Jmeno): { text: string; trida: string } | null {
  if (jeHit(j)) return { text: 'hit', trida: 'bg-[#fdeaea] text-[#b3403a]' }
  if (jeTrendy(j)) return { text: 'trendy', trida: 'bg-[#e7f0fb] text-[#3563a8]' }
  if (jeOriginal(j)) return { text: 'originál', trida: 'bg-[#f2ecfa] text-[#6d4fa1]' }
  return null
}

export function Srdicko({ id, velke }: { id: string; velke?: boolean }) {
  const { je, prepni } = useOblibene()
  const [poskoc, setPoskoc] = useState(false)
  const oblibene = je(id)
  return (
    <button
      type="button"
      onClick={e => {
        e.stopPropagation()
        if (!oblibene) { setPoskoc(true); window.setTimeout(() => setPoskoc(false), 450) }
        prepni(id)
      }}
      aria-label={oblibene ? 'Odebrat z oblíbených' : 'Přidat do oblíbených'}
      title={oblibene ? 'Odebrat z oblíbených' : 'Uložit mezi oblíbená'}
      className={`${velke ? 'text-2xl' : 'text-lg'} ${poskoc ? 'srdce-poskoc' : ''} leading-none transition-transform hover:scale-125 ${oblibene ? '' : 'opacity-45 hover:opacity-100'}`}
    >
      {oblibene ? '❤️' : '🤍'}
    </button>
  )
}

/** Štítky do panelu a do karet shody, kde dávají smysl i mimo detail. */
export function Stitky({ jmeno }: { jmeno: Jmeno }) {
  const s = hlavniStitek(jmeno)
  if (!s) return null
  return <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${s.trida}`}>{s.text}</span>
}

export default function NameCard({ jmeno, poradi }: { jmeno: Jmeno; poradi?: number }) {
  const zeme = zemePodleKodu(jmeno.zeme)
  const kat = KATEGORIE_INFO[jmeno.kategorie]
  const stitek = hlavniStitek(jmeno)

  return (
    <article
      className="karta-jmena karta-klikatelna"
      onClick={() => otevriDetail(jmeno.id)}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); otevriDetail(jmeno.id) } }}
      role="button"
      tabIndex={0}
      aria-label={`Zobrazit detail jména ${jmeno.jmeno}`}
    >
      {/* jméno má celý řádek pro sebe, ať se nemusí lámat */}
      <h3 className="karta-jmeno">
        {poradi != null && <span className="karta-poradi">{poradi}.</span>}
        {jmeno.jmeno}
      </h3>

      <div className="karta-spodek">
        <span
          className="karta-puvod"
          title={`${kat.nazev}${jmeno.pohlavi ? ` · ${POHLAVI_INFO[jmeno.pohlavi].nazev}` : ''} · ${zeme?.nazev ?? ''}`}
        >
          {kat.emoji}
          {jmeno.pohlavi && jmeno.pohlavi !== 'unisex' && (
            <span className={jmeno.pohlavi === 'samec' ? 'text-[#4a5c7d]' : 'text-[#8a4a63]'}>
              {POHLAVI_INFO[jmeno.pohlavi].znak}
            </span>
          )}
          {zeme?.vlajka}
        </span>
        {stitek && (
          <span className={`karta-stitek ${stitek.trida}`}>{stitek.text}</span>
        )}
        <span className="ml-auto"><Srdicko id={jmeno.id} /></span>
      </div>
    </article>
  )
}
