import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Shell from '@/components/names/Shell'
import NameCard from '@/components/names/NameCard'
import Reklama from '@/components/names/Reklama'
import { jmenaZeme, KONTINENTY, ZEME, zemePodleKodu } from '@/lib/names/data'
import { serad } from '@/lib/names/logic'
import { jsonLdDrobky, jsonLdSeznam, WEB } from '@/lib/names/seo'
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
      <nav className="mb-6 text-sm text-[#8a7f71]">
        <Link href="/" className="underline decoration-dotted hover:text-[#2b2723]">Mapa světa</Link>
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
            🐾 Filtrovat zvířecí jména
          </Link>
          <Link href={`/deti?zeme=${zeme.kod}`} className="rounded-full bg-[#d97757] px-4 py-2 text-sm font-semibold text-white">
            👶 Filtrovat dětská jména
          </Link>
        </div>
      </header>

      <div className="mb-10">
        <Reklama plocha="zeme-1" varianta="pruh" />
      </div>

      {PORADI_KATEGORII.map((kat, poradiKat) => {
        const skupina = serad(jmena.filter(j => j.kategorie === kat), 'popularita')
        if (!skupina.length) return null
        const info = KATEGORIE_INFO[kat]
        // mezi kategorie prokládáme nativní plochy, ať nejsou všechny u sebe
        const plocha = ['zeme-2', 'zeme-3', 'zeme-4'][Math.floor(poradiKat / 3)]
        return (
          <section key={kat} className="mb-10">
            <h2 className="mb-3 [font-family:var(--font-syne)] text-2xl font-bold">
              {info.emoji} {info.mnozne}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {skupina.map((j, i) => <NameCard key={j.id} jmeno={j} poradi={i + 1} />)}
              {poradiKat % 3 === 0 && plocha && <Reklama plocha={plocha} />}
            </div>
          </section>
        )
      })}

      <div className="mb-6">
        <Reklama plocha="zeme-5" varianta="pruh" />
      </div>

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
