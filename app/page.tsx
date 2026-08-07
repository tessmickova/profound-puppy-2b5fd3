import type { Metadata } from 'next'
import Link from 'next/link'
import Shell from '@/components/names/Shell'
import WorldMap from '@/components/names/WorldMap'
import NameCard from '@/components/names/NameCard'
import Reklama from '@/components/names/Reklama'
import { JMENA, KONTINENTY, ZEME } from '@/lib/names/data'
import { jeOriginal, jeTrendy, serad } from '@/lib/names/logic'
import { CASTE_DOTAZY, jsonLdDotazy, jsonLdSeznam, WEB } from '@/lib/names/seo'

export const metadata: Metadata = {
  title: 'Svět jmen — jména pro děti i zvířata podle zemí světa',
  description:
    'Přes 750 jmen z 19 zemí: pro holčičky, kluky, psy, kočky i další zvířata. '
    + 'Vyberte jméno, které ladí s příjmením, rodinou i plemenem.',
  alternates: { canonical: '/' },
  keywords: [
    'jména pro děti', 'jména pro psy', 'jména pro kočky', 'jak pojmenovat psa',
    'jméno k příjmení', 'jména sourozenců', 'jmeniny', 'význam jmen',
  ],
}

export default function Domov() {
  const topZvirata = serad(JMENA.filter(j => !['kluk', 'holka'].includes(j.kategorie)), 'popularita').slice(0, 6)
  const topDeti = serad(JMENA.filter(j => ['kluk', 'holka'].includes(j.kategorie)), 'popularita').slice(0, 6)
  const trendy = serad(JMENA.filter(jeTrendy), 'popularita').slice(0, 6)
  const originaly = serad(JMENA.filter(jeOriginal), 'popularita').slice(0, 6)

  return (
    <Shell>
      <section className="mb-10 text-center">
        <h1 className="[font-family:var(--font-syne)] text-4xl font-extrabold tracking-tight sm:text-5xl">
          Najděte jméno, které <span className="text-[#d97757]">k vám patří</span>
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-[#6b6156]">
          Nejlíbivější jména pro psy, fenky, kočky, kocoury i další zvířata — a taky pro holčičky
          a kluky. Vybraná podle zemí celého světa, s významem, stylem a chytrým filtrem.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Link href="/zvirata" className="rounded-full bg-[#2b2723] px-5 py-2.5 text-sm font-semibold text-[#faf6ef] transition-transform hover:scale-105">
            🐾 Jména pro zvířata
          </Link>
          <Link href="/deti" className="rounded-full bg-[#d97757] px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-105">
            👶 Jména pro děti
          </Link>
        </div>
      </section>

      <div className="mb-8">
        <Reklama plocha="domov-nad-mapou" varianta="pruh" />
      </div>

      <section className="mb-10">
        <h2 className="mb-4 [font-family:var(--font-syne)] text-2xl font-bold">Vyberte si na mapě</h2>
        <WorldMap />
      </section>

      <div className="mb-12 grid gap-3 sm:grid-cols-2">
        <Reklama plocha="domov-po-mape" />
        <Reklama plocha="domov-bocni" />
      </div>

      <section className="mb-14 grid gap-4 text-center sm:grid-cols-3">
        <div className="rounded-3xl border border-[#e8dfd2] bg-white p-6">
          <p className="[font-family:var(--font-syne)] text-3xl font-extrabold text-[#d97757]">{JMENA.length}</p>
          <p className="text-sm text-[#6b6156]">pečlivě vybraných jmen s významem</p>
        </div>
        <div className="rounded-3xl border border-[#e8dfd2] bg-white p-6">
          <p className="[font-family:var(--font-syne)] text-3xl font-extrabold text-[#d97757]">{ZEME.length}</p>
          <p className="text-sm text-[#6b6156]">zemí na {KONTINENTY.length} kontinentech</p>
        </div>
        <div className="rounded-3xl border border-[#e8dfd2] bg-white p-6">
          <p className="[font-family:var(--font-syne)] text-3xl font-extrabold text-[#d97757]">10</p>
          <p className="text-sm text-[#6b6156]">kategorií — od psů a koček po koně a papoušky</p>
        </div>
      </section>

      <section className="mb-14">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="[font-family:var(--font-syne)] text-2xl font-bold">Nejlíbivější zvířecí jména</h2>
          <Link href="/zvirata" className="text-sm text-[#8a7f71] underline decoration-dotted hover:text-[#2b2723]">všechna →</Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {topZvirata.map((j, i) => <NameCard key={j.id} jmeno={j} poradi={i + 1} />)}
        </div>
      </section>

      <section className="mb-14">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="[font-family:var(--font-syne)] text-2xl font-bold">📈 Populární trendy právě teď</h2>
          <Link href="/zvirata" className="text-sm text-[#8a7f71] underline decoration-dotted hover:text-[#2b2723]">filtrovat trendy →</Link>
        </div>
        <p className="mb-4 max-w-2xl text-sm text-[#6b6156]">Moderní jména, která právě letí nahoru — u zvířat i dětí je poznáte podle štítku 📈.</p>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {trendy.slice(0, 5).map((j, i) => <NameCard key={j.id} jmeno={j} poradi={i + 1} />)}
          <Reklama plocha="domov-mezi" />
        </div>
      </section>

      <section className="mb-14">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="[font-family:var(--font-syne)] text-2xl font-bold">💎 Originální a pěkná</h2>
          <Link href="/deti" className="text-sm text-[#8a7f71] underline decoration-dotted hover:text-[#2b2723]">objevit další →</Link>
        </div>
        <p className="mb-4 max-w-2xl text-sm text-[#6b6156]">Skryté poklady — jména, která nepotkáte na každém hřišti ani v každém parku, a přesto krásně znějí.</p>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {originaly.map((j, i) => <NameCard key={j.id} jmeno={j} poradi={i + 1} />)}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="[font-family:var(--font-syne)] text-2xl font-bold">Nejlíbivější dětská jména</h2>
          <Link href="/deti" className="text-sm text-[#8a7f71] underline decoration-dotted hover:text-[#2b2723]">všechna + hledání shody →</Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {topDeti.map((j, i) => <NameCard key={j.id} jmeno={j} poradi={i + 1} />)}
        </div>
      </section>

      <section className="mt-14">
        <h2 className="mb-4 [font-family:var(--font-syne)] text-2xl font-bold">Časté otázky o výběru jména</h2>
        <div className="grid gap-3">
          {CASTE_DOTAZY.map(d => (
            <details key={d.otazka} className="rounded-2xl border border-[#e8dfd2] bg-white p-4">
              <summary className="cursor-pointer [font-family:var(--font-syne)] text-base font-bold">
                {d.otazka}
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-[#6b6156]">{d.odpoved}</p>
            </details>
          ))}
        </div>
      </section>

      <div className="mt-12">
        <Reklama plocha="domov-pred-patickou" varianta="pruh" />
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdDotazy()) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLdSeznam(
            'Nejlíbivější jména pro děti',
            `${WEB.url}/deti`,
            topDeti.map(j => ({ jmeno: j.jmeno, vyznam: j.vyznam })),
          )),
        }}
      />
    </Shell>
  )
}
