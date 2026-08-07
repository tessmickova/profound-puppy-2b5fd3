import type { Metadata } from 'next'
import { Suspense } from 'react'
import Shell from '@/components/names/Shell'
import ZvirataFinder from '@/components/names/ZvirataFinder'
import PasyJmen from '@/components/names/PasyJmen'
import NadpisSekce from '@/components/names/NadpisSekce'
import RychleOdpovedi from '@/components/names/RychleOdpovedi'
import { JMENA } from '@/lib/names/data'
import { jsonLdOdpovedi, jsonLdSlovnik, ODPOVEDI_ZVIRATA, WEB } from '@/lib/names/seo'

export const metadata: Metadata = {
  title: 'Jména pro zvířata — psi, kočky, koně a další | Svět jmen',
  description:
    'Nejpodrobnější filtr zvířecích jmen: podle druhu, plemene, země původu, stylu, energie, velikosti, délky i počátečního písmene. Vše abecedně i podle oblíbenosti.',
  alternates: { canonical: '/zvirata' },
}

const LIDSKE = ['kluk', 'holka']

export default function ZvirataStranka() {
  const zvireci = JMENA.filter(j => !LIDSKE.includes(j.kategorie))
    .sort((a, b) => b.popularita - a.popularita)

  return (
    <Shell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOdpovedi(ODPOVEDI_ZVIRATA)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLdSlovnik('Jména pro zvířata', `${WEB.url}/zvirata`, zvireci)),
        }}
      />

      <div className="mb-2"><NadpisSekce druh="zvirata">Jména pro zvířata</NadpisSekce></div>
      <p className="mb-8 max-w-2xl text-[#6b6156]">
        Vyberte druh, plemeno nebo způsob života — a nechte filtr najít jméno, které vašemu
        zvířeti padne jako obojek na míru.
      </p>
      <PasyJmen druh="zvirata" />

      <Suspense>
        <ZvirataFinder />
      </Suspense>

      <RychleOdpovedi odpovedi={ODPOVEDI_ZVIRATA} nadpis="Krátké odpovědi na to, co lidé řeší nejčastěji" />
    </Shell>
  )
}
