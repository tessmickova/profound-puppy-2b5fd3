import type { Metadata } from 'next'
import Shell from '@/components/names/Shell'
import OblibeneSeznam from '@/components/names/OblibeneSeznam'

export const metadata: Metadata = {
  // Osobní nástroj — pro vyhledávač tu není co indexovat.
  robots: { index: false, follow: true },
  title: 'Můj výběr jmen',
  description: 'Uložená i vyřazená jména pohromadě. Výběr zůstává ve vašem prohlížeči.',
}

export default function OblibeneStranka() {
  return (
    <Shell>
      <h1 className="mb-2 text-3xl">Můj výběr jmen</h1>
      <p className="mb-8 max-w-2xl text-[#6b6156]">
        Jména, která jste si uložili srdíčkem, i ta, která jste vyřadili.
        Výběr zůstává jen ve vašem prohlížeči — nikam se nic neposílá
        a k ničemu se nemusíte registrovat.
      </p>
      <OblibeneSeznam />
    </Shell>
  )
}
