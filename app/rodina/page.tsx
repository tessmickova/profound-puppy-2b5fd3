import type { Metadata } from 'next'
import Shell from '@/components/names/Shell'
import RodinaProfil from '@/components/names/RodinaProfil'

export const metadata: Metadata = {
  // Osobní nástroj — pro vyhledávač tu není co indexovat.
  robots: { index: false, follow: true },
  title: 'Moje rodina — jména, která k vám ladí',
  description:
    'Naklikejte svou rodinu včetně zvířat a nechte si doporučovat další lidská i zvířecí jména, která k současným patří.',
}

export default function RodinaStranka() {
  return (
    <Shell>
      <h1 className="mb-2 [font-family:var(--font-nadpis)] text-3xl font-extrabold">Moje rodina</h1>
      <p className="mb-8 max-w-2xl text-[#6b6156]">
        Váš rodinný profil: lidé i zvířata na jednom místě. Podle jmen, která už doma máte,
        sám doporučí další — lidská i zvířecí — tak, aby k sobě všechna patřila.
      </p>
      <RodinaProfil />
    </Shell>
  )
}
