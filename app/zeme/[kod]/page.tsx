import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Shell from '@/components/names/Shell'
import NameCard from '@/components/names/NameCard'
import Rozvrzeni from '@/components/names/Rozvrzeni'
import NadpisSekce from '@/components/names/NadpisSekce'
import { jmenaZeme, KONTINENTY, ZEME, zemePodleKodu } from '@/lib/names/data'
import { serad } from '@/lib/names/logic'
import { jsonLdDrobky, jsonLdSeznam, jsonLdSlovnik, WEB } from '@/lib/names/seo'
import { KATEGORIE_INFO } from '@/lib/names/types'
import type { Kategorie } from '@/lib/names/types'

export function generateStaticParams() {
  return ZEME.map(z => ({ kod: z.kod }))
}

export async function generateMetadata({ params }: { params: Promise<{ kod: string }> }): Promise<Metadata> {
  const { kod } = await params
  const zeme = zemePodleKodu(kod)
  if (!zeme) return {}
  return {
    title: `Jména z ${zeme.nazev} — pro děti i zvířata`,
    description: `${zeme.poznamka} Jména pro holčičky, kluky, psy, kočky i další zvířata z ${zeme.nazev} — s významem a oblíbeností.`,
    alternates: { canonical: `/zeme/${zeme.kod}` },
  }
}

const PORADI_KATEGORII: Kategorie[] = ['pes', 'fenka', 'kocour', 'kocka', 'kun', 'kralik', 'papousek', 'krecek', 'kluk', 'holka']

export default async function ZemeStranka({ params }: { params: Promise<{ kod: string }> }) {
  const { kod } = await params
  const zeme = zemePodleKodu(kod)
  if (!zeme) notFound()

  const jmena = jmenaZeme(kod)
  const kontinent = KONTINENTY.find(k => k.id === zeme.kontinent)

  return (
    <Shell>
      <Rozvrzeni plochy={['zeme-1', 'zeme-2', 'zeme-3', 'zeme-4', 'zeme-5']}>
      <nav className="drobecky mb-6 text-sm text-[#8a7f71]" aria-label="Drobečková navigace">
        <Link href="/" className="underline decoration-dotted hover:text-[#2b2723]">Úvod</Link>
        <span className="mx-2">/</span>
        <span>{kontinent?.nazev}</span>
        <span className="mx-2">/</span>
        <span className="text-[#2b2723]">{zeme.nazev}</span>
      </nav>

      <header className="mb-10 rounded-3xl border border-[#e8dfd2] bg-white p-8 text-center shadow-sm">
        <div className="text-6xl">{zeme.vlajka}</div>
        <h1 className="mt-3 [font-family:var(--font-syne)] text-4xl font-extrabold">{zeme.nazev}</h1>
        <p className="mx-auto mt-2 max-w-xl text-[#6b6156]">{zeme.poznamka}</p>
        <p className="mt-3 text-sm text-[#8a7f71]">
          {jmena.length} vybraných jmen · kontinent {kontinent?.nazev}
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Link href={`/zvirata?zeme=${zeme.kod}`} className="rounded-full bg-[#2b2723] px-4 py-2 text-sm font-semibold text-[#faf6ef]">
            Filtrovat zvířecí jména
          </Link>
          <Link href={`/deti?zeme=${zeme.kod}`} className="rounded-full bg-[#d97757] px-4 py-2 text-sm font-semibold text-white">
            Filtrovat dětská jména
          </Link>
        </div>
      </header>

      {PORADI_KATEGORII.map(kat => {
        const skupina = serad(jmena.filter(j => j.kategorie === kat), 'popularita')
        if (!skupina.length) return null
        const info = KATEGORIE_INFO[kat]
        return (
          <section key={kat} className="mb-10">
            <div className="mb-3">
              <NadpisSekce druh={kat === 'kluk' || kat === 'holka' ? 'lide' : 'zvirata'}>
                {info.mnozne}
              </NadpisSekce>
            </div>
            <div className="nastup mrizka-jmen">
              {skupina.map((j, i) => <NameCard key={j.id} jmeno={j} poradi={i + 1} />)}
            </div>
          </section>
        )
      })}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLdDrobky([
            { nazev: 'Svět jmen', url: '/' },
            { nazev: zeme.nazev, url: `/zeme/${zeme.kod}` },
          ])),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLdSeznam(
            `Jména z ${zeme.nazev}`,
            `${WEB.url}/zeme/${zeme.kod}`,
            jmena.map(j => ({ jmeno: j.jmeno, vyznam: j.vyznam })),
          )),
        }}
      />
      {/* Slovník jméno → význam. Jazykový model si z jedné stránky odnese
          konkrétní dvojice, ne jen seznam slov. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLdSlovnik(
            `Jména z ${zeme.nazev} a jejich význam`,
            `${WEB.url}/zeme/${zeme.kod}`,
            jmena.map(j => ({ jmeno: j.jmeno, vyznam: j.vyznam })),
          )),
        }}
      />

      </Rozvrzeni>

      <div className="mt-12 flex flex-wrap justify-center gap-2">
        {ZEME.filter(z => z.kod !== zeme.kod).map(z => (
          <Link key={z.kod} href={`/zeme/${z.kod}`} className="rounded-full border border-[#e8dfd2] bg-white px-3 py-1.5 text-sm text-[#6b6156] hover:border-[#2b2723]">
            {z.vlajka} {z.nazev}
          </Link>
        ))}
      </div>
    </Shell>
  )
}
