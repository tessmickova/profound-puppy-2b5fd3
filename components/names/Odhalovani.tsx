'use client'

// Odhalování obsahu při rolování — sekce s třídou `odhal` se jemně
// vynoří, až když na ně člověk doroluje.
//
// Postavené obráceně, než bývá zvykem: obsah je VIDITELNÝ od začátku
// a skrývá se až po naběhnutí skriptu (třída `odhal-aktivni` na <html>).
// Bez JavaScriptu, při pádu skriptu i pro vyhledávače je tak stránka
// vždycky celá. Kdo si přeje omezit pohyb, žádné animace nedostane.

import { useEffect } from 'react'

export default function Odhalovani() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const koren = document.documentElement
    koren.classList.add('odhal-aktivni')

    const pozorovatel = new IntersectionObserver(zaznamy => {
      for (const z of zaznamy) {
        if (z.isIntersecting) {
          z.target.classList.add('je-videt')
          pozorovatel.unobserve(z.target)
        }
      }
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 })

    // Co už je ve výřezu, ukážeme rovnou — bez čekání na první scroll.
    for (const prvek of document.querySelectorAll('.odhal')) {
      const obdelnik = prvek.getBoundingClientRect()
      if (obdelnik.top < window.innerHeight && obdelnik.bottom > 0) {
        prvek.classList.add('je-videt')
      } else {
        pozorovatel.observe(prvek)
      }
    }

    return () => {
      pozorovatel.disconnect()
      koren.classList.remove('odhal-aktivni')
    }
  }, [])

  return null
}
