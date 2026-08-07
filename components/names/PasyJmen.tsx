'use client'

// Dva jezdící pásy jmen. Horní se posouvá doprava, dolní doleva — protipohyb
// dělá stránku živou, aniž by cokoli blikalo. Uvnitř je jen jméno, nic víc.
// Sekce záměrně nemá nadpis: pásy mluví samy za sebe.
//
// Smyčka je nekonečná díky tomu, že se seznam vykreslí dvakrát za sebou
// a animace posune pás přesně o polovinu jeho šířky.

import { pasyJmen } from '@/lib/names/vCesku'

function Pas({ jmena, smer }: { jmena: string[]; smer: 'vpravo' | 'vlevo' }) {
  return (
    <div className="pas" aria-hidden>
      <div className={`pas-stopa pas-${smer}`}>
        {[...jmena, ...jmena].map((j, i) => (
          <span key={`${j}-${i}`} className="pas-box">{j}</span>
        ))}
      </div>
    </div>
  )
}

export default function PasyJmen() {
  const [horni, dolni] = pasyJmen()
  return (
    <section className="pasy mb-14" aria-label="Jména používaná v Česku">
      <Pas jmena={horni} smer="vpravo" />
      <Pas jmena={dolni} smer="vlevo" />
    </section>
  )
}
