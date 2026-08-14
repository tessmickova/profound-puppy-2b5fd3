import type { Metadata } from 'next'
import { Suspense } from 'react'
import Shell from '@/components/names/Shell'
import DetiFinder from '@/components/names/DetiFinder'
import PasyJmen from '@/components/names/PasyJmen'
import NadpisSekce from '@/components/names/NadpisSekce'
import RychleOdpovedi from '@/components/names/RychleOdpovedi'
import NameCard from '@/components/names/NameCard'
import { JMENA } from '@/lib/names/data'
import { unikatniPodleJmena } from '@/lib/names/entita'
import { jeOriginal, jeTrendy, serad } from '@/lib/names/logic'
import {
  jsonLdOdpovedi, jsonLdPostup, jsonLdSlovnik, ODPOVEDI_DETI, WEB,
} from '@/lib/names/seo'

// Hloubkové odkazy: /deti?kategorie=holka musí mít odpovídající obsah už
// v HTML ze serveru — ne až po načtení JavaScriptu. Server proto vykreslí
// filtrovanou špičku a interaktivní finder ji po hydrataci převezme.

type Parametry = { kategorie?: string; filtr?: string; zeme?: string }

const SSR_VYBERY: Record<string, { nadpis: string; vyber: (j: typeof JMENA) => typeof JMENA }> = {
  holka: { nadpis: 'Nejoblíbenější jména pro holčičky', vyber: j => j.filter(x => x.kategorie === 'holka') },
  kluk: { nadpis: 'Nejoblíbenější jména pro kluky', vyber: j => j.filter(x => x.kategorie === 'kluk') },
  trendy: { nadpis: 'Trendy jména právě teď', vyber: j => j.filter(jeTrendy) },
  original: { nadpis: 'Originální jména, která nepotkáte všude', vyber: j => j.filter(jeOriginal) },
}

export async function generateMetadata(
  { searchParams }: { searchParams: Promise<Parametry> },
): Promise<Metadata> {
  const p = await searchParams
  // Kategorie mají vlastní SEO stránky /jmena/* — filtr na ně odkazuje
  // canonicalem, aby nevznikal duplicitní obsah.
  const canonical = p.kategorie === 'holka' ? '/jmena/holcicky'
    : p.kategorie === 'kluk' ? '/jmena/kluci' : '/deti'
  return {
    title: 'Jména pro děti — nejlepší shody podle příjmení a měsíce narození',
    description:
      'Jména pro holčičky a kluky z celého světa. Chytré hledání nejlepší shody: souzvuk s příjmením, měsíc narození, styl i země inspirace.',
    alternates: { canonical },
  }
}

export default async function DetiStranka(
  { searchParams }: { searchParams: Promise<Parametry> },
) {
  const p = await searchParams
  const detska = JMENA.filter(j => j.kategorie === 'kluk' || j.kategorie === 'holka')
    .sort((a, b) => b.popularita - a.popularita)

  const ssrKlic = p.kategorie && SSR_VYBERY[p.kategorie] ? p.kategorie
    : p.filtr && SSR_VYBERY[p.filtr] ? p.filtr : null
  const ssrVyber = ssrKlic ? SSR_VYBERY[ssrKlic] : null
  const ssrJmena = ssrVyber
    ? unikatniPodleJmena(serad(ssrVyber.vyber(detska), 'popularita')).slice(0, 12)
    : []

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

      <div className="mb-2"><NadpisSekce druh="lide">Jména pro děti</NadpisSekce></div>
      <p className="mb-8 max-w-2xl text-[#6b6156]">
        Procházejte jména podle zemí a stylů, nebo zadejte příjmení, jména rodičů
        a sourozence — a my vybereme jen ty nejlepší shody, které ladí s celou rodinou.
      </p>
      <PasyJmen druh="lide" />

      {ssrVyber && (
        <section className="mb-10" aria-labelledby="ssr-vyber">
          <h2 id="ssr-vyber" className="mb-3 [font-family:var(--font-nadpis)] text-xl font-bold">
            {ssrVyber.nadpis}
          </h2>
          <div className="nastup mrizka-jmen">
            {ssrJmena.map((u, i) => (
              <NameCard key={u.jmeno.id} jmeno={u.jmeno} poradi={i + 1} dalsiZeme={u.zeme} />
            ))}
          </div>
          <p className="mt-3 text-[13.5px] text-[#8a7f71]">
            Kompletní výběr s dalšími filtry je níž — pokračujte v ladění podle stylu, délky nebo země.
          </p>
        </section>
      )}

      <Suspense>
        <DetiFinder />
      </Suspense>

      <RychleOdpovedi odpovedi={ODPOVEDI_DETI} nadpis="Krátké odpovědi na to, co lidé řeší nejčastěji" />
    </Shell>
  )
}
