import type { Metadata } from 'next'
import Link from 'next/link'
import Shell from '@/components/names/Shell'
import Hledac from '@/components/names/Hledac'
import { WEB } from '@/lib/names/seo'

// Vstup pro člověka, který neví, kde začít. Nástroj je hned nahoře —
// text až za ním, protože ten sem nikdo nepřišel číst.

export const metadata: Metadata = {
  title: 'Nevíte, kde začít s výběrem jména? Ukážeme vám dvojice',
  description:
    'Nemusíte procházet stovky jmen. Vyberete si z několika dvojic a my z toho '
    + 'poznáme, co se vám líbí. Po třech volbách uvidíte první návrhy.',
  alternates: { canonical: '/vybrat-jmeno-pro-dite' },
  openGraph: {
    title: 'Nevíte, kde začít s výběrem jména?',
    description: 'Vyberete si z dvojic, my z toho poznáme váš vkus a doporučíme jména.',
    url: `${WEB.url}/vybrat-jmeno-pro-dite`,
  },
}

export default function VybratProDite() {
  return (
    <Shell>
      <nav className="drobky" aria-label="Drobečková navigace">
        <Link href="/">Úvod</Link>
        <span aria-hidden> › </span>
        <span aria-current="page">Nevím, kde začít</span>
      </nav>

      <header className="nastroj-hlava">
        <h1>Nevíte, kde začít?</h1>
        <p className="nastroj-podnadpis">
          Seznam šesti set jmen vám teď nepomůže. Vyberte si z pár dvojic —
          z toho poznáme, co se vám líbí, a doporučíme jména, která tomu
          odpovídají.
        </p>
      </header>

      <Hledac druh="deti" />

      <section className="nastroj-vysvetleni">
        <h2>Proč se ptáme obrázkem, a ne formulářem</h2>
        <p>
          „Chcete tradiční, nebo moderní jméno?" většina lidí neumí odpovědět,
          dokud neuvidí příklady. Konkrétní dvojice — <strong>Eliška, nebo
          Nela?</strong> — zodpoví každý za dvě vteřiny. Z několika takových
          voleb vyjde poměrně přesná představa o vkusu, aniž byste museli
          cokoliv vyplňovat.
        </p>

        <h2>Co s výsledkem počítáme a co ne</h2>
        <p>
          Z vašich voleb odvozujeme pět vlastností: modernost, mezinárodnost,
          neobvyklost, délku a výraznost. Každé jméno v katalogu podle nich
          dostane skóre — a u každého návrhu si můžete rozkliknout{' '}
          <strong>„Proč mi ho doporučujete?"</strong> a přesně vidět, která
          pravidla se uplatnila.
        </p>
        <p>
          Skóre <strong>není pravděpodobnost</strong>, že budete spokojení.
          Takové číslo by nikdo neuměl spočítat a my si ho nevymýšlíme. Je to
          jen součet pravidel, která si můžete zkontrolovat.{' '}
          <Link href="/metodika">Celá metodika</Link>.
        </p>
        <p>
          Odmítnutá jména si pamatujeme jen v tomto prohlížeči a v návrzích se
          už neobjeví. Nikam se neodesílají.
        </p>

        <h2>Kam dál</h2>
        <ul className="nastroj-dalsi">
          <li><Link href="/porovnat-jmena">Už máme favority — porovnat je</Link></li>
          <li><Link href="/jmeno-k-prijmeni">Jak jméno zní s naším příjmením</Link></li>
          <li><Link href="/jmena/holcicky">Procházet jména pro holčičky</Link></li>
          <li><Link href="/jmena/kluky">Procházet jména pro kluky</Link></li>
          <li><Link href="/vybrat-jmeno-pro-zvire">Hledáme jméno pro zvíře</Link></li>
        </ul>
      </section>
    </Shell>
  )
}
