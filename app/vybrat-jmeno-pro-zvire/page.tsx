import type { Metadata } from 'next'
import Link from 'next/link'
import Shell from '@/components/names/Shell'
import Hledac from '@/components/names/Hledac'
import { WEB } from '@/lib/names/seo'

export const metadata: Metadata = {
  title: 'Jméno pro zvíře — vyberte z dvojic a my doporučíme',
  description:
    'Pes, kočka, králík i papoušek. Vyberete si z několika dvojic jmen a my '
    + 'z toho poznáme, co se vám líbí. Po třech volbách uvidíte první návrhy.',
  alternates: { canonical: '/vybrat-jmeno-pro-zvire' },
  openGraph: {
    title: 'Jméno pro zvíře — vyberte z dvojic a my doporučíme',
    description: 'Vyberete si z dvojic, my z toho poznáme váš vkus a doporučíme jména.',
    url: `${WEB.url}/vybrat-jmeno-pro-zvire`,
  },
}

export default function VybratProZvire() {
  return (
    <Shell>
      <nav className="drobky" aria-label="Drobečková navigace">
        <Link href="/">Úvod</Link>
        <span aria-hidden> › </span>
        <span aria-current="page">Jméno pro zvíře</span>
      </nav>

      <header className="nastroj-hlava">
        <h1>Přivedli jste si domů zvíře a jméno pořád nemáte?</h1>
        <p className="nastroj-podnadpis">
          Vyberte si z pár dvojic. Z toho poznáme, jestli vám sedí spíš krátká
          a hravá jména, nebo důstojnější a delší — a podle toho doporučíme.
        </p>
      </header>

      <Hledac druh="zvirata" />

      <section className="nastroj-vysvetleni">
        <h2>Na čem u zvířecího jména opravdu záleží</h2>
        <p>
          U psa a kočky má jméno jednu praktickou funkci navíc oproti dětskému:{' '}
          <strong>musí se dát zavolat přes celý park</strong>. Krátká jména
          zakončená samohláskou (Bára, Aran, Míša) zvíře rozpozná snáz než
          dlouhá a tlumená. Zároveň by se nemělo plést s běžnými povely —
          jméno znějící jako „fuj" nebo „lehni" práci s pejskem komplikuje.
        </p>

        <h2>Co počítáme a co si nevymýšlíme</h2>
        <p>
          Z vašich voleb odvozujeme modernost, mezinárodnost, neobvyklost,
          délku a výraznost. U každého návrhu si můžete rozkliknout{' '}
          <strong>„Proč mi ho doporučujete?"</strong> a vidět, která pravidla
          se uplatnila. Skóre je součet těch pravidel — <strong>ne
          pravděpodobnost</strong>, že se jméno zvířeti bude líbit.{' '}
          <Link href="/metodika">Celá metodika</Link>.
        </p>

        <h2>Kam dál</h2>
        <ul className="nastroj-dalsi">
          <li><Link href="/jmena/psy">Jména pro psy</Link></li>
          <li><Link href="/jmena/kocky">Jména pro kočky</Link></li>
          <li><Link href="/zvirata">Všechna zvířecí jména</Link></li>
          <li><Link href="/vybrat-jmeno-pro-dite">Hledáme jméno pro miminko</Link></li>
        </ul>
      </section>
    </Shell>
  )
}
