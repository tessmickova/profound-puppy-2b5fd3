import type { Metadata } from 'next'
import Link from 'next/link'
import Shell from '@/components/names/Shell'
import TestJmena from '@/components/names/TestJmena'
import { WEB } from '@/lib/names/seo'

export const metadata: Metadata = {
  title: 'Jméno k příjmení — otestujte, jak bude znít celé',
  description:
    'Zadejte jméno a příjmení a uvidíte, jak celé jméno funguje: oslovení, '
    + 'přechod hlásek, iniciály, hláskování i zápis bez diakritiky.',
  alternates: { canonical: '/jmeno-k-prijmeni' },
  openGraph: {
    title: 'Jméno k příjmení — otestujte, jak bude znít celé',
    description: 'Oslovení, iniciály, hláskování, zápis bez diakritiky. Za pár vteřin.',
    url: `${WEB.url}/jmeno-k-prijmeni`,
  },
}

export default function PrijmeniStranka() {
  return (
    <Shell>
      <nav className="drobky" aria-label="Drobečková navigace">
        <Link href="/">Úvod</Link>
        <span aria-hidden> › </span>
        <span aria-current="page">Jméno k příjmení</span>
      </nav>

      <header className="nastroj-hlava">
        <h1>Jak bude jméno znít s vaším příjmením?</h1>
        <p className="nastroj-podnadpis">
          Napište obojí a hned uvidíte, co se s tím jménem bude v běžném životě
          dít — od oslovení po zápis v cizím formuláři.
        </p>
      </header>

      <TestJmena />

      <section className="nastroj-vysvetleni">
        <h2>Co se u celého jména vyplatí zkontrolovat</h2>
        <ul>
          <li>
            <strong>Přechod jméno–příjmení.</strong> Když jméno končí a příjmení
            začíná stejnou hláskou (<em>Anna Adamcová</em>), dvojice se hůř
            vyslovuje. Není to chyba — jen to poznáte pokaždé, když se
            představujete.
          </li>
          <li>
            <strong>Rytmus.</strong> Dohromady čtyři až šest slabik zní vyváženě.
            Velmi krátké jméno k velmi dlouhému příjmení bývá lepší volba než
            dvě dlouhá za sebou.
          </li>
          <li>
            <strong>Rým.</strong> Stejná koncovka jména i příjmení dělá
            z dvojice říkanku.
          </li>
          <li>
            <strong>Iniciály.</strong> Ukážeme, co tvoří — hodnotit je nechceme,
            to je na vás.
          </li>
          <li>
            <strong>Hláskování a diakritika.</strong> Jak se jméno bude psát tam,
            kde háčky neznají.
          </li>
        </ul>
        <p>
          Nic z toho nedělá jméno dobrým nebo špatným. Jsou to důsledky, se
          kterými se bude žít. <Link href="/metodika">Jak to počítáme</Link>.
        </p>

        <h2>Kam dál</h2>
        <ul className="nastroj-dalsi">
          <li><Link href="/porovnat-jmena">Porovnat několik jmen mezi sebou</Link></li>
          <li><Link href="/deti">Najít jména, která k příjmení sedí</Link></li>
          <li><Link href="/jmena/holcicky">Jména pro holčičky</Link></li>
          <li><Link href="/jmena/kluky">Jména pro kluky</Link></li>
        </ul>
      </section>
    </Shell>
  )
}
