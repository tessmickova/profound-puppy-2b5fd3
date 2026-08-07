'use client'

// Dva jezdící pásy jmen. Horní se posouvá doprava, dolní doleva — protipohyb
// dělá stránku živou, aniž by cokoli blikalo. Uvnitř je jen jméno, nic víc.
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
  const pocet = horni.length + dolni.length

  return (
    <section className="mb-14" aria-label="Jména, která se v Česku používají">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="[font-family:var(--font-syne)] text-2xl font-bold">Jména, která u nás žijí</h2>
        <span className="text-[13px] text-[#8a7f71]">{pocet} jmen z celého světa</span>
      </div>
      <p className="mb-4 max-w-2xl text-[13.5px] text-[#8a7f71]">
        Každé z nich nosí v Česku víc než pět lidí — od Jiřího a Marie přes Nguyen
        a Oksanu až po Sakuru. Tak dnes vypadá jmenná mapa republiky.
      </p>

      <div className="pasy">
        <Pas jmena={horni} smer="vpravo" />
        <Pas jmena={dolni} smer="vlevo" />
      </div>
    </section>
  )
}
