import type { Metadata } from 'next'
import Shell from '@/components/names/Shell'
import Admin from '@/components/names/Admin'

// Adresa /admin patří druhému projektu v repozitáři (AuroraDog diagnostika),
// proto má správa Světa jmen vlastní českou adresu /sprava.

export const metadata: Metadata = {
  // Správcovská stránka — do vyhledávačů nepatří.
  robots: { index: false, follow: false },
  title: 'Správa webu',
  description: 'Objednávky reklamy, přepínače funkcí a provozní audit Světa jmen.',
}

export default function SpravaStranka() {
  return (
    <Shell>
      <h1 className="mb-2 text-3xl">Správa webu</h1>
      <p className="mb-8 max-w-2xl text-[#6b6156]">
        Objednávky reklamy, přepínače funkcí a stálý provozní audit —
        bezpečnost, právo, peníze a doporučení na jednom místě. Živá správa
        vyžaduje admin token; audit je vidět rovnou.
      </p>
      <Admin />
    </Shell>
  )
}
