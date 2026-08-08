'use client'

// Hledání konkrétního jména.
//
// Nejčastější důvod návštěvy je „co znamená tohle jméno" — proto je pole
// hned nahoře a našeptávač nabízí po prvním písmenu. Píše se s diakritikou
// i bez ní: „eliska" najde Elišku.
//
// Ovládání odpovídá tomu, co čtečky obrazovky čekají od pole s nápovědou:
// role="combobox" na vstupu, seznam s role="listbox", šipky, Enter, Esc.

import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { najdi, type PolozkaRejstriku } from '@/lib/names/rejstrik'
import { KATEGORIE_INFO } from '@/lib/names/types'

/** Krátký popis, pro koho se jméno používá — „holčičky · fenky". */
function proKoho(p: PolozkaRejstriku): string {
  return p.k.map(k => KATEGORIE_INFO[k].mnozne.toLowerCase()).join(' · ')
}

export default function Hledani({ velke = false }: { velke?: boolean }) {
  const router = useRouter()
  const [dotaz, setDotaz] = useState('')
  const [otevreno, setOtevreno] = useState(false)
  const [kurzor, setKurzor] = useState(0)
  // Dokud se člověk šipkami nepohnul, je zvýrazněný první návrh. První
  // stisk šipky dolů proto nesmí skočit na druhý — to je klasická past.
  const [pohnuto, setPohnuto] = useState(false)
  const obal = useRef<HTMLDivElement>(null)
  const poleRef = useRef<HTMLInputElement>(null)
  const id = useId()

  const navrhy = useMemo(() => najdi(dotaz), [dotaz])

  useEffect(() => { setKurzor(0); setPohnuto(false) }, [dotaz])

  useEffect(() => {
    if (!otevreno) return
    const mimo = (e: MouseEvent) => {
      if (!obal.current?.contains(e.target as Node)) setOtevreno(false)
    }
    document.addEventListener('mousedown', mimo)
    return () => document.removeEventListener('mousedown', mimo)
  }, [otevreno])

  const otevri = (p: PolozkaRejstriku) => {
    setOtevreno(false)
    if (p.s) {
      router.push(`/jmeno/${p.s}`)
      return
    }
    // Jméno bez vlastní stránky pošleme do katalogu s předvyplněným hledáním.
    const kamDal = p.k.some(k => k === 'kluk' || k === 'holka') ? '/deti' : '/zvirata'
    router.push(`${kamDal}?hledat=${encodeURIComponent(p.j)}`)
  }

  const klavesa = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { setOtevreno(false); return }
    if (!navrhy.length) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setOtevreno(true)
      if (!pohnuto) { setPohnuto(true); setKurzor(0); return }
      setKurzor(k => Math.min(navrhy.length - 1, k + 1))
      return
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setPohnuto(true)
      setKurzor(k => Math.max(0, k - 1))
      return
    }
    if (e.key === 'Enter') {
      e.preventDefault()
      if (otevreno && navrhy[kurzor]) otevri(navrhy[kurzor])
      return
    }
    if (e.key === 'Home') { setKurzor(0) }
    if (e.key === 'End') { setKurzor(navrhy.length - 1) }
  }

  const ukazat = otevreno && dotaz.trim().length > 0

  return (
    <div ref={obal} className={`hledani ${velke ? 'je-velke' : ''}`}>
      <div className="hledani-pole">
        <Search size={velke ? 20 : 17} aria-hidden className="hledani-lupa" />
        <input
          ref={poleRef}
          type="text"
          value={dotaz}
          onChange={e => { setDotaz(e.target.value); setOtevreno(true) }}
          onFocus={() => setOtevreno(true)}
          onKeyDown={klavesa}
          placeholder="Napište jméno — třeba Eliška nebo Rex"
          aria-label="Hledat jméno"
          role="combobox"
          aria-expanded={ukazat}
          aria-controls={`${id}-seznam`}
          aria-autocomplete="list"
          aria-activedescendant={ukazat && navrhy[kurzor] ? `${id}-${kurzor}` : undefined}
          autoComplete="off"
        />
        {dotaz && (
          <button
            type="button"
            className="hledani-smazat"
            onClick={() => { setDotaz(''); poleRef.current?.focus() }}
            aria-label="Vymazat hledání"
          >
            <X size={15} aria-hidden />
          </button>
        )}
      </div>

      {ukazat && (
        <div className="hledani-navrhy" id={`${id}-seznam`} role="listbox" aria-label="Nalezená jména">
          {navrhy.length === 0 ? (
            <p className="hledani-nic">
              Takové jméno v katalogu nemáme. Zkuste{' '}
              <a href="/deti">procházet dětská</a> nebo{' '}
              <a href="/zvirata">zvířecí jména</a>.
            </p>
          ) : navrhy.map((p, i) => (
            <button
              key={p.j}
              type="button"
              role="option"
              id={`${id}-${i}`}
              aria-selected={i === kurzor}
              className={`hledani-navrh ${i === kurzor ? 'je-na-rade' : ''}`}
              onMouseEnter={() => { setKurzor(i); setPohnuto(true) }}
              onClick={() => otevri(p)}
            >
              <span className="hledani-jmeno">{p.j}</span>
              <span className="hledani-pro">{proKoho(p)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
