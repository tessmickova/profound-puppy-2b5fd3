import type { Metadata } from 'next'
import Link from 'next/link'
import Shell from '@/components/names/Shell'
import { JMENA, KONTINENTY, ZEME } from '@/lib/names/data'
import { velke } from '@/lib/names/logic'

// Kompletní seznam zemí má vlastní stránku, aby nemusel viset v patičce
// na každé stránce webu. Pro člověka přehlednější, pro crawler jedno místo
// místo tisíců opakovaných odkazů.

export const metadata: Metadata = {
  title: 'Jména podle zemí — všech 25 zemí světa',
  description:
    'Česká, německá, francouzská, japonská i další jména pro děti a zvířata. '
    + 'Vyberte zemi a projděte si jména, která se v ní používají.',
  alternates: { canonical: '/zeme' },
}

export default function VsechnyZemeStranka() {
  const pocty = new Map<string, number>()
  for (const j of JMENA) pocty.set(j.zeme, (pocty.get(j.zeme) ?? 0) + 1)

  return (
    <Shell>
      <nav className="drobky" aria-label="Drobečková navigace">
        <Link href="/">Úvod</Link>
        <span aria-hidden> › </span>
        <span aria-current="page">Země</span>
      </nav>

      <header className="kategorie-hlava">
        <h1>Jména podle zemí</h1>
        <p className="kategorie-popis">
          {ZEME.length} zemí a {JMENA.length} jmen. U každé země najdete jména
          pro děti i pro zvířata — tak, jak se tam skutečně používají.
        </p>
      </header>

      {KONTINENTY.map(k => {
        const zeme = ZEME.filter(z => z.kontinent === k.id)
        if (!zeme.length) return null
        return (
          <section key={k.id} aria-labelledby={`kontinent-${k.id}`}>
            <h2 id={`kontinent-${k.id}`}>{k.nazev}</h2>
            <ul className="zeme-mrizka">
              {zeme.map(z => (
                <li key={z.kod}>
                  <Link href={`/zeme/${z.kod}`} className="zeme-dlazdice">
                    <span className="zeme-vlajka" aria-hidden>{z.vlajka}</span>
                    <span className="zeme-nazev">{velke(z.pridavne)} jména</span>
                    <span className="zeme-pocet">{pocty.get(z.kod) ?? 0} jmen</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )
      })}
    </Shell>
  )
}
