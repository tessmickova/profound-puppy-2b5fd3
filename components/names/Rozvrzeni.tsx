'use client'

// Rozvržení stránky: obsah drží střed, reklamní plochy jsou po stranách.
// Na mobilu postranní sloupce nejsou, proto se plochy vykreslí až pod obsahem —
// obsah tak zůstává první i na telefonu.

import type { ReactNode } from 'react'
import Reklama from './Reklama'

export default function Rozvrzeni({
  plochy, children, uzsi = false,
}: {
  /** názvy reklamních ploch; první polovina jde vlevo, druhá vpravo */
  plochy: string[]
  children: ReactNode
  /** true = obsah už má vlastní levý sloupec (filtr), plochy patří jen vpravo */
  uzsi?: boolean
}) {
  if (uzsi) {
    return (
      <div className="rozvrzeni-jednostranne">
        <div className="rozvrzeni-obsah">{children}</div>
        <aside className="rozvrzeni-sloupec" aria-label="Sponzorovaný obsah">
          {plochy.map(p => <Reklama key={p} plocha={p} varianta="uzka" />)}
        </aside>
        <div className="rozvrzeni-pod-obsahem">
          {plochy.map(p => <Reklama key={`m-${p}`} plocha={p} />)}
        </div>
      </div>
    )
  }

  const stred = Math.ceil(plochy.length / 2)
  const vlevo = plochy.slice(0, stred)
  const vpravo = plochy.slice(stred)

  return (
    <div className="rozvrzeni-oboustranne">
      <aside className="rozvrzeni-sloupec" aria-label="Sponzorovaný obsah">
        {vlevo.map(p => <Reklama key={p} plocha={p} varianta="uzka" />)}
      </aside>
      <div className="rozvrzeni-obsah">{children}</div>
      <aside className="rozvrzeni-sloupec" aria-label="Sponzorovaný obsah">
        {vpravo.map(p => <Reklama key={p} plocha={p} varianta="uzka" />)}
      </aside>
      <div className="rozvrzeni-pod-obsahem">
        {plochy.map(p => <Reklama key={`m-${p}`} plocha={p} />)}
      </div>
    </div>
  )
}
