'use client'

// Rozbalovací nabídka v barvách webu.
//
// Systémový <select> vypadá v každém prohlížeči jinak a v žádném jako zbytek
// webu — proto máme vlastní. Chová se ale jako ten systémový: otevírá se
// klávesnicí, šipky přejíždějí po položkách, Enter vybírá, Esc zavírá,
// psaní skáče na první odpovídající položku a čtečka obrazovky slyší
// „seznam s výběrem".

import { useEffect, useId, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'

export interface Volba {
  hodnota: string
  nazev: string
  /** volitelný prefix — vlajka nebo emoji */
  znak?: string
  /** nadpis skupiny, do které položka patří */
  skupina?: string
}

export default function Vyber({
  hodnota, volby, onZmena, popisek, prazdne, varianta = 'pole', ikona,
}: {
  hodnota: string
  volby: Volba[]
  onZmena: (h: string) => void
  /** popis pro čtečku obrazovky */
  popisek: string
  /** text, když není nic vybráno; bez něj je výběr povinný */
  prazdne?: string
  /** 'pole' = na šířku sekce, 'pilulka' = úsporné tlačítko do lišty */
  varianta?: 'pole' | 'pilulka'
  ikona?: React.ReactNode
}) {
  const [otevreno, setOtevreno] = useState(false)
  const [kurzor, setKurzor] = useState(0)
  const obal = useRef<HTMLDivElement>(null)
  const seznam = useRef<HTMLDivElement>(null)
  const hledani = useRef({ text: '', kdy: 0 })
  const id = useId()

  const vsechny: Volba[] = prazdne
    ? [{ hodnota: '', nazev: prazdne }, ...volby]
    : volby
  const vybrana = vsechny.find(v => v.hodnota === hodnota) ?? vsechny[0]

  // Klik mimo i ztráta zaměření nabídku zavřou — jinak by zůstala viset.
  useEffect(() => {
    if (!otevreno) return
    const mimo = (e: MouseEvent) => {
      if (!obal.current?.contains(e.target as Node)) setOtevreno(false)
    }
    document.addEventListener('mousedown', mimo)
    return () => document.removeEventListener('mousedown', mimo)
  }, [otevreno])

  // Po otevření doskrolujeme na vybranou položku, ať ji je vidět.
  useEffect(() => {
    if (!otevreno) return
    const i = Math.max(0, vsechny.findIndex(v => v.hodnota === hodnota))
    setKurzor(i)
    requestAnimationFrame(() => {
      seznam.current?.querySelector<HTMLElement>('[data-kurzor="true"]')
        ?.scrollIntoView({ block: 'nearest' })
    })
  }, [otevreno])  // eslint-disable-line react-hooks/exhaustive-deps

  const vyber = (h: string) => {
    onZmena(h)
    setOtevreno(false)
    obal.current?.querySelector('button')?.focus()
  }

  const posun = (o: number) => {
    setKurzor(k => {
      const novy = Math.min(vsechny.length - 1, Math.max(0, k + o))
      requestAnimationFrame(() => {
        seznam.current?.querySelector<HTMLElement>('[data-kurzor="true"]')
          ?.scrollIntoView({ block: 'nearest' })
      })
      return novy
    })
  }

  /** Psaní skočí na první položku začínající napsaným textem. */
  const doPismene = (znak: string) => {
    const ted = Date.now()
    const h = hledani.current
    h.text = ted - h.kdy > 900 ? znak : h.text + znak
    h.kdy = ted
    const hledany = h.text.toLowerCase()
    const i = vsechny.findIndex(v => v.nazev.toLowerCase().startsWith(hledany))
    if (i >= 0) {
      setKurzor(i)
      if (!otevreno) onZmena(vsechny[i].hodnota)
      requestAnimationFrame(() => {
        seznam.current?.querySelector<HTMLElement>('[data-kurzor="true"]')
          ?.scrollIntoView({ block: 'nearest' })
      })
    }
  }

  const klavesa = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { setOtevreno(false); return }
    if (e.key === 'Tab') { setOtevreno(false); return }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      if (!otevreno) { setOtevreno(true); return }
      posun(e.key === 'ArrowDown' ? 1 : -1)
      return
    }
    if (e.key === 'Home' || e.key === 'End') {
      if (!otevreno) return
      e.preventDefault()
      setKurzor(e.key === 'Home' ? 0 : vsechny.length - 1)
      return
    }
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      if (otevreno) vyber(vsechny[kurzor].hodnota)
      else setOtevreno(true)
      return
    }
    if (e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey) doPismene(e.key)
  }

  // Nadpis skupiny vypíšeme jen tam, kde se skupina mění.
  let poslednıSkupina: string | undefined

  return (
    <div ref={obal} className={`vyber ${varianta === 'pilulka' ? 'vyber-pilulka' : ''}`}>
      <button
        type="button"
        className="vyber-spoust"
        aria-haspopup="listbox"
        aria-expanded={otevreno}
        aria-label={popisek}
        onClick={() => setOtevreno(o => !o)}
        onKeyDown={klavesa}
      >
        {ikona && <span className="vyber-ikona" aria-hidden>{ikona}</span>}
        <span className="vyber-text">
          {vybrana?.znak && <span aria-hidden>{vybrana.znak} </span>}
          {vybrana?.nazev}
        </span>
        <ChevronDown size={14} className="vyber-sipka" aria-hidden />
      </button>

      {otevreno && (
        <div
          ref={seznam}
          className="vyber-nabidka"
          role="listbox"
          id={id}
          tabIndex={-1}
          aria-label={popisek}
          onKeyDown={klavesa}
        >
          {vsechny.map((v, i) => {
            const novaSkupina = v.skupina && v.skupina !== poslednıSkupina
            poslednıSkupina = v.skupina
            return (
              <div key={v.hodnota || `prazdne-${i}`}>
                {novaSkupina && <p className="vyber-skupina">{v.skupina}</p>}
                <button
                  type="button"
                  role="option"
                  aria-selected={v.hodnota === hodnota}
                  data-kurzor={i === kurzor}
                  className={`vyber-polozka ${i === kurzor ? 'je-na-rade' : ''} ${v.hodnota === hodnota ? 'je-vybrana' : ''}`}
                  onMouseEnter={() => setKurzor(i)}
                  onClick={() => vyber(v.hodnota)}
                >
                  <span className="vyber-polozka-text">
                    {v.znak && <span aria-hidden>{v.znak} </span>}
                    {v.nazev}
                  </span>
                  {v.hodnota === hodnota && <Check size={13} aria-hidden />}
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
