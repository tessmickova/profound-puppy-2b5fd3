import type { Metadata } from 'next'
import Link from 'next/link'
import Shell from '@/components/names/Shell'
import UcetInzerenta from '@/components/names/UcetInzerenta'

export const metadata: Metadata = {
  title: 'Účet inzerenta',
  description: 'Stav kampaně, pokyny k platbě a úprava textu inzerátu.',
  // Osobní plocha inzerenta — pro vyhledávač tu není co indexovat.
  robots: { index: false, follow: true },
}

export default function UcetStranka() {
  return (
    <Shell>
      <nav className="drobky" aria-label="Drobečková navigace">
        <Link href="/">Úvod</Link>
        <span aria-hidden> › </span>
        <Link href="/reklama">Reklama</Link>
        <span aria-hidden> › </span>
        <span aria-current="page">Účet inzerenta</span>
      </nav>

      <div className="mx-auto max-w-2xl">
        <h1 className="mb-2 text-3xl">Účet inzerenta</h1>
        <p className="mb-6 text-[15px] text-[#6b6156]">
          Vidíte tu stav své kampaně, pokyny k platbě a můžete kdykoli upravit
          text inzerátu i logo. Klíč jste dostali při rezervaci.
        </p>
        <UcetInzerenta />
      </div>
    </Shell>
  )
}
