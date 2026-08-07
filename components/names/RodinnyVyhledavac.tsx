'use client'

// Jména rodiny jsou hlavní vstup, ne položka filtru — proto stojí na středu
// stránky jako vyhledávač a ne schovaná v postranním panelu.

import { Search, Users } from 'lucide-react'

export interface PoleVyhledavace {
  klic: string
  popisek: string
  hodnota: string
  napoveda: string
  onZmena: (v: string) => void
}

export default function RodinnyVyhledavac({
  pohlavi, onPohlavi, pole, popisPod,
}: {
  pohlavi: 'kluk' | 'holka'
  onPohlavi: (p: 'kluk' | 'holka') => void
  pole: PoleVyhledavace[]
  popisPod: string
}) {
  return (
    <section className="vyhledavac">
      <div className="vyhledavac-hlava">
        <h2>
          <Users size={17} aria-hidden />
          Koho hledáte a ke komu má jméno ladit
        </h2>
        <div className="prepinac vyhledavac-pohlavi">
          <button type="button" aria-pressed={pohlavi === 'holka'} onClick={() => onPohlavi('holka')}>
            čekáme holčičku
          </button>
          <button type="button" aria-pressed={pohlavi === 'kluk'} onClick={() => onPohlavi('kluk')}>
            čekáme chlapečka
          </button>
        </div>
      </div>

      <div className="vyhledavac-pole">
        {pole.map(p => (
          <label key={p.klic}>
            <span className="vyhledavac-popisek">{p.popisek}</span>
            <span className="vyhledavac-vstup">
              <Search size={14} aria-hidden />
              <input
                value={p.hodnota}
                onChange={e => p.onZmena(e.target.value)}
                placeholder={p.napoveda}
                autoComplete="off"
              />
            </span>
          </label>
        ))}
      </div>

      <p className="vyhledavac-popis">{popisPod}</p>
    </section>
  )
}
