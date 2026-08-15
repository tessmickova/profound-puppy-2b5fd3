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
import { serad } from '@/lib/names/logic'
import { KATEGORIE_INFO } from '@/lib/names/types'
import { vyhledPodleId } from '@/lib/names/vyhledy'
import {
  jsonLdOdpovedi, jsonLdPostup, jsonLdSlovnik, ODPOVEDI_DETI, WEB,
} from '@/lib/names/seo'

export const metadata: Metadata = {
  title: 'Jména pro děti — podle příjmení i měsíce narození',
  description:
    'Jména pro holčičky a kluky z celého světa. Chytré hledání nejlepší shody: souzvuk s příjmením, měsíc narození, styl i země inspirace.',
  alternates: { canonical: '/deti' },
}

/** Kolik jmen vykreslí server rovnou do HTML, než se zapne filtr v prohlížeči. */
const SSR_POCET = 24

export default async function DetiStranka(
  { searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> },
) {
  const parametry = await searchParams
  const jeden = (k: string) => (Array.isArray(parametry[k]) ? parametry[k][0] : parametry[k]) ?? null

  const detska = JMENA.filter(j => j.kategorie === 'kluk' || j.kategorie === 'holka')
    .sort((a, b) => b.popularita - a.popularita)

  // Hloubkový odkaz musí být čitelný i bez JavaScriptu: co je v adrese,
  // vykreslí server. Klientský filtr si potom tentýž stav nastaví sám —
  // pravidla jsou společná (`vyhledy.ts`), takže se nemají jak rozejít.
  const kategorie = jeden('kategorie') === 'holka' ? 'holka' : jeden('kategorie') === 'kluk' ? 'kluk' : null
  const vyhled = vyhledPodleId(jeden('filtr'))

  let vybrana = detska
  if (kategorie) vybrana = vybrana.filter(j => j.kategorie === kategorie)
  if (vyhled?.druh === 'deti') vybrana = vybrana.filter(vyhled.sedi)
  const spicka = unikatniPodleJmena(serad(vybrana, 'popularita')).slice(0, SSR_POCET)

  const nadpis = vyhled?.nadpis
    ?? (kategorie ? `Jména pro ${KATEGORIE_INFO[kategorie].proKoho}` : 'Jména pro děti')
  const popis = vyhled?.popis
    ?? 'Procházejte jména podle zemí a stylů, nebo zadejte příjmení, jména rodičů '
      + 'a sourozence — a my vybereme jen ty nejlepší shody, které ladí s celou rodinou.'

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

      <div className="mb-2"><NadpisSekce druh="lide" uroven={1}>{nadpis}</NadpisSekce></div>
      <p className="mb-8 max-w-2xl text-[#6b6156]">{popis}</p>
      <PasyJmen druh="lide" />

      {/* Špička výběru rovnou v HTML — pro vyhledávače a pro chvíli, než
          se v prohlížeči zapne filtr. Po zapnutí ji filtr nahradí. */}
      {(kategorie || vyhled) && (
        <section className="ssr-spicka" aria-label={nadpis}>
          <div className="mrizka-jmen mrizka-kompakt">
            {spicka.map((u, i) => (
              <NameCard key={u.jmeno.id} jmeno={u.jmeno} zemeNavic={u.zeme} poradi={i + 1} />
            ))}
          </div>
        </section>
      )}

      <Suspense>
        <DetiFinder />
      </Suspense>

      <RychleOdpovedi odpovedi={ODPOVEDI_DETI} nadpis="Krátké odpovědi na to, co lidé řeší nejčastěji" />
    </Shell>
  )
}
