import type { Metadata } from 'next'
import { Suspense } from 'react'
import Shell from '@/components/names/Shell'
import DetiFinder from '@/components/names/DetiFinder'
import PasyJmen from '@/components/names/PasyJmen'
import NadpisSekce from '@/components/names/NadpisSekce'

export const metadata: Metadata = {
  title: 'Jména pro děti — nejlepší shody podle příjmení a měsíce narození | Svět jmen',
  description:
    'Jména pro holčičky a kluky z celého světa. Chytré hledání nejlepší shody: souzvuk s příjmením, měsíc narození, styl i země inspirace.',
}

export default function DetiStranka() {
  return (
    <Shell>
      <div className="mb-2"><NadpisSekce druh="lide">Jména pro děti</NadpisSekce></div>
      <p className="mb-8 max-w-2xl text-[#6b6156]">
        Procházejte jména podle zemí a stylů, nebo zadejte příjmení, jména rodičů
        a sourozence — a my vybereme jen ty nejlepší shody, které ladí s celou rodinou.
      </p>
      <PasyJmen druh="lide" />

      <Suspense>
        <DetiFinder />
      </Suspense>
    </Shell>
  )
}
