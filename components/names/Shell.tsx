'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Baby, Heart, House, PawPrint, Users } from 'lucide-react'
import { useOblibene } from '@/lib/names/oblibene'
import { useRodina } from '@/lib/names/rodina'

const POLOZKY = [
  { href: '/', nazev: 'Úvod', kratce: 'Úvod', Ikona: House },
  { href: '/deti', nazev: 'Jména pro děti', kratce: 'Děti', Ikona: Baby },
  { href: '/zvirata', nazev: 'Jména pro zvířata', kratce: 'Zvířata', Ikona: PawPrint },
]

export default function Shell({ children }: { children: React.ReactNode }) {
  const cesta = usePathname()
  const { pocet } = useOblibene()
  const { pocet: pocetRodiny } = useRodina()

  return (
    <div className="min-h-screen bg-[#faf6ef] text-[#2b2723]">
      <header className="sticky top-0 z-40 border-b border-[#e8dfd2] bg-[#faf6ef]/92 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-3 py-2.5 sm:px-4">
          <Link href="/" className="flex shrink-0 items-center gap-1.5 [font-family:var(--font-syne)] text-base font-extrabold tracking-tight sm:text-lg">
            <PawPrint size={20} className="text-[#d97757]" aria-hidden />
            <span>Svět jmen</span>
          </Link>

          <nav className="ml-auto flex items-center gap-0.5 overflow-x-auto text-[13px]" aria-label="Hlavní navigace">
            {POLOZKY.map(({ href, nazev, kratce, Ikona }) => {
              const aktivni = href === '/' ? cesta === '/' : cesta.startsWith(href)
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={aktivni ? 'page' : undefined}
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1.5 font-medium transition-colors sm:px-3 ${
                    aktivni ? 'bg-[#2b2723] text-[#faf6ef]' : 'text-[#6b6156] hover:bg-[#efe7da] hover:text-[#2b2723]'
                  }`}
                >
                  <Ikona size={15} aria-hidden />
                  <span className="hidden sm:inline">{nazev}</span>
                  <span className="sm:hidden">{kratce}</span>
                </Link>
              )
            })}
            <Link
              href="/rodina"
              title="Profil vaší rodiny — lidé i zvířata"
              className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1.5 font-medium transition-colors ${
                cesta.startsWith('/rodina') ? 'bg-[#2b2723] text-[#faf6ef]' : 'text-[#6b6156] hover:bg-[#efe7da] hover:text-[#2b2723]'
              }`}
            >
              <Users size={15} aria-hidden />
              {pocetRodiny > 0 && <span className="font-semibold">{pocetRodiny}</span>}
            </Link>
            <Link
              href="/oblibene"
              title="Vaše oblíbená jména"
              className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1.5 font-medium transition-colors ${
                cesta.startsWith('/oblibene') ? 'bg-[#d97757] text-white' : 'text-[#6b6156] hover:bg-[#efe7da] hover:text-[#2b2723]'
              }`}
            >
              <Heart size={15} aria-hidden fill={pocet > 0 ? 'currentColor' : 'none'} />
              {pocet > 0 && <span className="font-semibold">{pocet}</span>}
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-3 pb-20 pt-6 sm:px-4 sm:pt-8">{children}</main>

      <footer className="border-t border-[#e8dfd2] py-8 text-center text-[13px] text-[#8a7f71]">
        <p>Svět jmen — vybírat jméno má být radost. Zdarma, bez registrace, bez sbírání údajů.</p>
        <p className="mt-1">
          <Link href="/aurora" className="underline decoration-dotted hover:text-[#2b2723]">AuroraDog — sledování polární záře</Link>
        </p>
      </footer>
    </div>
  )
}
