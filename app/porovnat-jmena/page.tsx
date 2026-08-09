import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import Shell from '@/components/names/Shell'
import PorovnaniJmen from '@/components/names/PorovnaniJmen'
import { WEB } from '@/lib/names/seo'

// Problémová vstupní stránka: nástroj je hned nahoře, text až za ním.
// Kdo sem přijde s hotovými favority, nechce číst — chce je postavit
// vedle sebe.

export const metadata: Metadata = {
  title: 'Porovnat jména — postavte finalisty vedle sebe',
  description:
    'Máte dvě nebo tři jména a nemůžete se rozhodnout? Ukážeme, čím se liší — '
    + 'oslovení, hláskování, četnost, zdrobněliny i souzvuk s příjmením.',
  alternates: { canonical: '/porovnat-jmena' },
  openGraph: {
    title: 'Porovnat jména — postavte finalisty vedle sebe',
    description: 'Ukážeme, čím se vaši finalisté liší. Rozhodnutí necháme na vás.',
    url: `${WEB.url}/porovnat-jmena`,
  },
}

export default function PorovnatStranka() {
  return (
    <Shell>
      <nav className="drobky" aria-label="Drobečková navigace">
        <Link href="/">Úvod</Link>
        <span aria-hidden> › </span>
        <span aria-current="page">Porovnat jména</span>
      </nav>

      <header className="nastroj-hlava">
        <h1>Máte několik jmen a každé má něco?</h1>
        <p className="nastroj-podnadpis">
          Nemusíte hledat další. Napište, co už máte, a uvidíte, čím se vaši
          finalisté doopravdy liší.
        </p>
      </header>

      <Suspense fallback={<p className="porovnani-cekame">Připravujeme porovnání…</p>}>
        <PorovnaniJmen />
      </Suspense>

      <section className="nastroj-vysvetleni">
        <h2>Podle čeho jména porovnáváme</h2>
        <p>
          Bereme věci, které jsou <strong>ověřitelné a prakticky důležité</strong> —
          ne dojmy. Význam a jmeniny z katalogu, oslovení a skloňování z pravidel
          české gramatiky, hláskování z toho, jestli se jméno píše, jak se čte,
          a souzvuk s příjmením ze tří pravidel: přechod hlásek, rytmus a rým.
        </p>
        <p>
          Co <strong>neděláme</strong>: neurčujeme vítěze a nepočítáme
          pravděpodobnost, že budete spokojení. Taková čísla by byla vymyšlená.{' '}
          <Link href="/metodika">Celá metodika</Link>.
        </p>

        <h2>Kam dál</h2>
        <ul className="nastroj-dalsi">
          <li><Link href="/jmeno-k-prijmeni">Jak jméno zní s naším příjmením</Link></li>
          <li><Link href="/jmena/holcicky">Jména pro holčičky</Link></li>
          <li><Link href="/jmena/kluky">Jména pro kluky</Link></li>
          <li><Link href="/oblibene">Můj výběr jmen</Link></li>
        </ul>
      </section>
    </Shell>
  )
}
