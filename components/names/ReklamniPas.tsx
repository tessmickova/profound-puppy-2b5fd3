'use client'

// Reklamní pruh připnutý úplně nahoře — jen na telefonu.
//
// Vypadá jako jezdící pásy jmen, jen místo jmen jedou názvy firem a každý
// je odkaz. Jede výrazně pomaleji než jména: jméno stačí zahlédnout, název
// firmy si má člověk stihnout přečíst a případně na něj klepnout.
//
// Kreativy si bere ze stejné reklamní služby jako ostatní plochy. Když
// služba neodpoví, pruh se nevykreslí a stránka se posune nahoru — nic se
// nerozbije.

import { useEffect, useState } from 'react'
import { inzeratyProPlochu, type Inzerat } from '@/lib/names/reklamy'
import { ADRESA_REKLAM, nactiInzeraty } from '@/lib/names/reklamniServer'

/** Plocha, kterou si firmy kupují právě pro tenhle pruh. */
export const PLOCHA_PASU = 'mobil-pas'

/** Pod tolik firem by pás vypadal prázdně, tak se seznam zopakuje víckrát. */
const NEJMENE = 6

export default function ReklamniPas() {
  const [inzeraty, setInzeraty] = useState<Inzerat[]>(
    () => (ADRESA_REKLAM ? [] : inzeratyProPlochu(PLOCHA_PASU)),
  )

  useEffect(() => {
    if (!ADRESA_REKLAM) return
    let zive = true
    nactiInzeraty(PLOCHA_PASU).then(nove => {
      if (zive && nove && nove.length > 0) setInzeraty(nove)
    })
    return () => { zive = false }
  }, [])

  if (inzeraty.length === 0) return null

  // Smyčka je nekonečná díky tomu, že se seznam vykreslí dvakrát a animace
  // posune pás přesně o polovinu jeho šířky. Krátký seznam proto nejdřív
  // natáhneme, ať mezi firmami nezůstane prázdné místo.
  const nasobek = Math.max(1, Math.ceil(NEJMENE / inzeraty.length))
  const rada: Inzerat[] = []
  for (let i = 0; i < nasobek; i++) rada.push(...inzeraty)

  return (
    <aside className="reklamni-pas" aria-label="Sponzorovaný obsah">
      <span className="reklamni-pas-stitek">reklama</span>
      <div className="reklamni-pas-okno">
        <div className="reklamni-pas-stopa">
          {[...rada, ...rada].map((r, i) => (
            <a
              key={`${r.id}-${i}`}
              href={r.odkaz}
              rel="sponsored nofollow noopener"
              className="reklamni-pas-box"
              tabIndex={i < rada.length ? undefined : -1}
              aria-hidden={i < rada.length ? undefined : true}
            >
              <span className="reklamni-pas-znacka">{r.znacka}</span>
              <span className="reklamni-pas-cta">{r.cta}</span>
            </a>
          ))}
        </div>
      </div>
    </aside>
  )
}
