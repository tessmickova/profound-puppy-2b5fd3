'use client'

// Dva jezdící pásy jmen. Horní se posouvá doprava, dolní doleva — protipohyb
// dělá stránku živou, aniž by cokoli blikalo. Uvnitř je jen jméno, nic víc.
//
// Smyčka je nekonečná díky tomu, že se seznam vykreslí dvakrát za sebou
// a animace posune pás přesně o polovinu jeho šířky.

import { pasyJmen, pasyZvirat } from '@/lib/names/vCesku'

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

export default function PasyJmen({ druh = 'lide' }: { druh?: 'lide' | 'zvirata' }) {
  const [horni, dolni] = druh === 'zvirata' ? pasyZvirat() : pasyJmen()
  return (
    // Pásy nic nesdělují — jsou to jen jména plující kolem. Pro čtečku
    // obrazovky je proto schováváme celé; obsah, který je v nich, je
    // dostupný v katalogu.
    <section
      className={`pasy pasy-${druh} mb-14`}
      aria-hidden
      role="presentation"
    >
      <Pas jmena={horni} smer="vpravo" />
      <Pas jmena={dolni} smer="vlevo" />
    </section>
  )
}
