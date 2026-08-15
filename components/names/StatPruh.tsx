'use client'

// Pruh s čísly webu — čísla se napočítají, až když na ně člověk doroluje.
//
// Všechna čísla jsou skutečná a přijdou ze serveru (počty z katalogu),
// tady se jen animují. Kdo omezil pohyb, vidí čísla rovnou.

import { useEffect, useRef, useState } from 'react'

interface Stat {
  hodnota: number
  /** text za číslem — „jmen", „zemí"… */
  jednotka: string
  popis: string
}

function Pocitadlo({ cil, spustit }: { cil: number; spustit: boolean }) {
  // Výchozí hodnota je CÍL, ne nula. Server i první vykreslení tak ukážou
  // skutečné číslo — crawler, pomalý JavaScript ani chyba hydratace nesmí
  // z webu udělat „0 jmen v katalogu“. Animace se rozjede až v prohlížeči:
  // teprve `spustit` shodí číslo na začátek a nechá ho doběhnout zpátky.
  const [hodnota, setHodnota] = useState(cil)

  useEffect(() => {
    if (!spustit) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setHodnota(cil)
      return
    }
    const zacatek = performance.now()
    const DOBA = 1100
    let bezi = true
    const krok = (ted: number) => {
      if (!bezi) return
      const podil = Math.min(1, (ted - zacatek) / DOBA)
      // rychlý rozjezd, jemné dobrždění
      const kridlo = 1 - Math.pow(1 - podil, 3)
      setHodnota(Math.round(cil * kridlo))
      if (podil < 1) requestAnimationFrame(krok)
    }
    requestAnimationFrame(krok)
    return () => { bezi = false }
  }, [spustit, cil])

  return <>{oddelTisice(hodnota)}</>
}

/**
 * Tisíce oddělené pevnou mezerou. Vlastní funkce schválně: `toLocaleString`
 * se může na serveru a v prohlížeči lišit (jiná data ICU) a rozdíl jediného
 * znaku by rozbil hydrataci právě u čísla, které má být první, co je vidět.
 */
function oddelTisice(cislo: number): string {
  return String(cislo).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

export default function StatPruh({ staty }: { staty: Stat[] }) {
  const [videt, setVidet] = useState(false)
  const obal = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const prvek = obal.current
    if (!prvek) return
    const pozorovatel = new IntersectionObserver(([z]) => {
      if (z.isIntersecting) { setVidet(true); pozorovatel.disconnect() }
    }, { threshold: 0.4 })
    pozorovatel.observe(prvek)
    return () => pozorovatel.disconnect()
  }, [])

  return (
    <div ref={obal} className="stat-pruh" role="list">
      {staty.map(s => (
        <div key={s.popis} role="listitem" className="stat-bod">
          <span className="stat-cislo">
            <Pocitadlo cil={s.hodnota} spustit={videt} />
            <small>{s.jednotka}</small>
          </span>
          <span className="stat-popis">{s.popis}</span>
        </div>
      ))}
    </div>
  )
}
