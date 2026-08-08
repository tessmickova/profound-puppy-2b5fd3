'use client'

// Karta jména záměrně ukazuje jen to hlavní — jméno, odkud je a jestli je
// uložené. Význam, analýza i numerologie patří do panelu, který se vysune
// po kliknutí.

import { useState } from 'react'
import Link from 'next/link'
import { KATEGORIE_INFO, POHLAVI_INFO } from '@/lib/names/types'
import type { Jmeno } from '@/lib/names/types'
import { zemePodleKodu } from '@/lib/names/data'
import { jeHit, jeOriginal, jeTrendy } from '@/lib/names/logic'
import { useOblibene } from '@/lib/names/oblibene'
import { otevriDetail } from '@/lib/names/detail'
import { slugJmena } from '@/lib/names/slug'

/** Jeden štítek navíc — víc jich na kartu nepatří. */
function hlavniStitek(j: Jmeno): { text: string; trida: string } | null {
  if (jeHit(j)) return { text: 'hit', trida: 'bg-[#fdeaea] text-[#b3403a]' }
  if (jeTrendy(j)) return { text: 'trendy', trida: 'bg-[#e7f0fb] text-[#3563a8]' }
  if (jeOriginal(j)) return { text: 'originál', trida: 'bg-[#f2ecfa] text-[#6d4fa1]' }
  return null
}

export function Srdicko({
  id, jmeno, velke,
}: {
  id: string
  /** jméno do popisku pro čtečku — samotné srdíčko nic neříká */
  jmeno?: string
  velke?: boolean
}) {
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
      aria-pressed={oblibene}
      aria-label={jmeno
        ? (oblibene ? `Odebrat ${jmeno} z oblíbených` : `Přidat ${jmeno} do oblíbených`)
        : (oblibene ? 'Odebrat z oblíbených' : 'Přidat do oblíbených')}
      title={oblibene ? 'Odebrat z oblíbených' : 'Uložit mezi oblíbená'}
      className={`srdicko ${velke ? 'text-2xl' : 'text-lg'} ${poskoc ? 'srdce-poskoc' : ''} transition-transform hover:scale-125 ${oblibene ? '' : 'opacity-45 hover:opacity-100'}`}
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

/**
 * Vrátí třídu podle toho, kolik znaků se má na řádek vejít. Číslo pořadí
 * se počítá taky — „128." zabere skoro tolik co dvě písmena.
 */
function delkaTridy(jmeno: string, poradi?: number | null): string {
  const znaku = jmeno.length + (poradi != null ? String(poradi).length + 1 : 0)
  if (znaku >= 11) return 'je-velmi-dlouhe'
  if (znaku >= 9) return 'je-dlouhe'
  return ''
}

export default function NameCard({
  jmeno, poradi, odkaz = false,
}: {
  jmeno: Jmeno
  poradi?: number
  /** true = jméno má vlastní stránku, karta je tedy skutečný odkaz */
  odkaz?: boolean
}) {
  const zeme = zemePodleKodu(jmeno.zeme)
  const kat = KATEGORIE_INFO[jmeno.kategorie]
  const stitek = hlavniStitek(jmeno)

  // Karta, která vede na jinou stránku, musí být odkaz — dá se otevřít
  // v novém panelu a čtečka ji ohlásí správně. Karta, která jen vysouvá
  // panel, zůstává tlačítkem. Div s role="button" není ani jedno.
  const obsah = (
    <>
      {/* Jméno má celý řádek pro sebe. Delší jména dostanou menší písmo,
          aby se nikdy nelámala uprostřed slova. */}
      <h3 className={`karta-jmeno ${delkaTridy(jmeno.jmeno, poradi)}`}>
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
        <span className="ml-auto"><Srdicko id={jmeno.id} jmeno={jmeno.jmeno} /></span>
      </div>
    </>
  )

  if (odkaz) {
    return (
      <article className="karta-jmena karta-klikatelna">
        <Link href={`/jmeno/${slugJmena(jmeno.jmeno)}`} className="karta-odkaz">
          <span className="sr-only">Otevřít detail jména {jmeno.jmeno}</span>
        </Link>
        {obsah}
      </article>
    )
  }

  return (
    <article className="karta-jmena karta-klikatelna">
      <button
        type="button"
        className="karta-odkaz"
        onClick={() => otevriDetail(jmeno.id)}
      >
        <span className="sr-only">Zobrazit podrobnosti jména {jmeno.jmeno}</span>
      </button>
      {obsah}
    </article>
  )
}
