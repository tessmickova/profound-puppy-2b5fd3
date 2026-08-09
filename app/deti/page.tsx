import type { Metadata } from 'next'
import { Suspense } from 'react'
import Shell from '@/components/names/Shell'
import DetiFinder from '@/components/names/DetiFinder'
import PasyJmen from '@/components/names/PasyJmen'
import NadpisSekce from '@/components/names/NadpisSekce'
import RychleOdpovedi from '@/components/names/RychleOdpovedi'
import { JMENA } from '@/lib/names/data'
import {
  jsonLdOdpovedi, jsonLdPostup, jsonLdSlovnik, ODPOVEDI_DETI, WEB,
} from '@/lib/names/seo'

export const metadata: Metadata = {
  title: 'Jména pro děti — podle příjmení i měsíce narození',
  description:
    'Jména pro holčičky a kluky z celého světa. Chytré hledání nejlepší shody: souzvuk s příjmením, měsíc narození, styl i země inspirace.',
  alternates: { canonical: '/deti' },
}

export default function DetiStranka() {
  const detska = JMENA.filter(j => j.kategorie === 'kluk' || j.kategorie === 'holka')
    .sort((a, b) => b.popularita - a.popularita)

  return (
    <Shell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOdpovedi(ODPOVEDI_DETI)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdPostup()) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLdSlovnik('Jména pro děti', `${WEB.url}/deti`, detska)),
        }}
      />

      <div className="mb-2"><NadpisSekce druh="lide" uroven={1}>Jména pro děti</NadpisSekce></div>
      <p className="mb-8 max-w-2xl text-[#6b6156]">
        Procházejte jména podle zemí a stylů, nebo zadejte příjmení, jména rodičů
        a sourozence — a my vybereme jen ty nejlepší shody, které ladí s celou rodinou.
      </p>
      <PasyJmen druh="lide" />

      <Suspense>
        <DetiFinder />
      </Suspense>

      <RychleOdpovedi odpovedi={ODPOVEDI_DETI} nadpis="Krátké odpovědi na to, co lidé řeší nejčastěji" />
    </Shell>
  )
}
