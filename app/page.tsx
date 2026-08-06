import type { Metadata } from 'next'
import Link from 'next/link'
import Shell from '@/components/names/Shell'
import WorldMap from '@/components/names/WorldMap'
import NameCard from '@/components/names/NameCard'
import { JMENA, KONTINENTY, ZEME } from '@/lib/names/data'
import { serad } from '@/lib/names/logic'

export const metadata: Metadata = {
  title: 'Svět jmen — nejlíbivější jména pro zvířata i děti podle zemí',
  description:
    'Klikatelná mapa světa plná jmen: psi, fenky, kočky, kocouři, koně, králíci i papoušci — a k tomu nejlepší jména pro holčičky a kluky, sladěná s příjmením i měsícem narození.',
}

export default function Domov() {
  const topZvirata = serad(JMENA.filter(j => !['kluk', 'holka'].includes(j.kategorie)), 'popularita').slice(0, 6)
  const topDeti = serad(JMENA.filter(j => ['kluk', 'holka'].includes(j.kategorie)), 'popularita').slice(0, 6)

  return (
    <Shell>
      <section className="mb-10 text-center">
        <h1 className="[font-family:var(--font-syne)] text-4xl font-extrabold tracking-tight sm:text-5xl">
          Najděte jméno, které <span className="text-[#d97757]">sedne</span>
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

      <section className="mb-14">
        <h2 className="mb-4 [font-family:var(--font-syne)] text-2xl font-bold">Vyberte si na mapě</h2>
        <WorldMap />
      </section>

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

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="[font-family:var(--font-syne)] text-2xl font-bold">Nejlíbivější dětská jména</h2>
          <Link href="/deti" className="text-sm text-[#8a7f71] underline decoration-dotted hover:text-[#2b2723]">všechna + hledání shody →</Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {topDeti.map((j, i) => <NameCard key={j.id} jmeno={j} poradi={i + 1} />)}
        </div>
      </section>
    </Shell>
  )
}
