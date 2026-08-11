import type { Metadata } from 'next'
import Shell from '@/components/names/Shell'
import AnalyzaVyberu from '@/components/names/AnalyzaVyberu'

export const metadata: Metadata = {
  // Osobní nástroj nad vlastním výběrem — pro vyhledávač tu není co indexovat.
  robots: { index: false, follow: true },
  title: 'Analýza mého výběru jmen',
  description: 'Jak moc každé vybrané jméno ladí do vaší rodiny — podle vašich srdíček a hlasů i podle našich pravidel.',
}

export default function AnalyzaVyberuStranka() {
  return (
    <Shell>
      <h1 className="mb-2 text-3xl">Analýza vašeho výběru</h1>
      <p className="mb-8 max-w-2xl text-[#6b6156]">
        Každé jméno z vašeho výběru dostane dvě známky: <strong>podle
        vás</strong> (srdíčka, hvězdičky a hlasy členů rodiny)
        a <strong>podle nás</strong> (jak ladí se jmény z vašeho rodinného
        profilu). Všechno se počítá jen ve vašem prohlížeči.
      </p>
      <AnalyzaVyberu />
    </Shell>
  )
}
