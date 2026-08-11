'use client'

// První otázka úvodní stránky: koho pojmenováváte?
//
// Dvě velké záložky místo dvou odkazů. Rozdíl je zásadní: odkaz člověka
// odvede na jinou stránku, záložka mu přepne celý úvod do jeho situace —
// rodič vidí rodinný nástroj a dětská jména, páníček zvířecí jména.
// Nikam se nekliká „naslepo".
//
// Oba panely jsou v HTML (server je vykreslí), přepíná se jen `hidden`.
// Obsah tak vidí i vyhledávače a čtečky, a přepnutí je okamžité.

import { useState, type ReactNode } from 'react'
import { Miminko, Stene } from './Ilustrace'

export default function UvodZalozky({ deti, zvirata }: { deti: ReactNode; zvirata: ReactNode }) {
  const [aktivni, setAktivni] = useState<'deti' | 'zvirata'>('deti')

  return (
    <div>
      <div className="uvod-zalozky" role="tablist" aria-label="Koho pojmenováváte?">
        <button
          type="button"
          role="tab"
          id="zalozka-deti"
          aria-selected={aktivni === 'deti'}
          aria-controls="panel-deti"
          className="uvod-zalozka"
          onClick={() => setAktivni('deti')}
        >
          <Miminko velikost={64} />
          <span className="uvod-zalozka-text">
            <strong>Miminko</strong>
            <small>holčičku, chlapečka nebo ještě nevíme</small>
          </span>
        </button>
        <button
          type="button"
          role="tab"
          id="zalozka-zvirata"
          aria-selected={aktivni === 'zvirata'}
          aria-controls="panel-zvirata"
          className="uvod-zalozka"
          onClick={() => setAktivni('zvirata')}
        >
          <Stene velikost={64} />
          <span className="uvod-zalozka-text">
            <strong>Zvíře</strong>
            <small>psa, kočku, králíka i papouška</small>
          </span>
        </button>
      </div>

      <div role="tabpanel" id="panel-deti" aria-labelledby="zalozka-deti" hidden={aktivni !== 'deti'}>
        {deti}
      </div>
      <div role="tabpanel" id="panel-zvirata" aria-labelledby="zalozka-zvirata" hidden={aktivni !== 'zvirata'}>
        {zvirata}
      </div>
    </div>
  )
}
