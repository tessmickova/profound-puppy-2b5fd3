import type { Metadata } from 'next'
import { Suspense } from 'react'
import Shell from '@/components/names/Shell'
import ZvirataFinder from '@/components/names/ZvirataFinder'

export const metadata: Metadata = {
  title: 'Jména pro zvířata — psi, kočky, koně a další | Svět jmen',
  description:
    'Nejpodrobnější filtr zvířecích jmen: podle druhu, plemene, země původu, stylu, energie, velikosti, délky i počátečního písmene. Vše abecedně i podle oblíbenosti.',
}

export default function ZvirataStranka() {
  return (
    <Shell>
      <h1 className="mb-2 [font-family:var(--font-syne)] text-3xl font-extrabold">Jména pro zvířata</h1>
      <p className="mb-8 max-w-2xl text-[#6b6156]">
        Vyberte druh, plemeno nebo způsob života — a nechte filtr najít jméno, které vašemu
        zvířeti padne jako obojek na míru.
      </p>
      <Suspense>
        <ZvirataFinder />
      </Suspense>
    </Shell>
  )
}
