'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useOblibene } from '@/lib/names/oblibene'

const POLOZKY = [
  { href: '/', nazev: 'Mapa světa', emoji: '🗺️' },
  { href: '/zvirata', nazev: 'Jména pro zvířata', emoji: '🐾' },
  { href: '/deti', nazev: 'Jména pro děti', emoji: '👶' },
]

export default function Shell({ children }: { children: React.ReactNode }) {
  const cesta = usePathname()
  const { pocet } = useOblibene()
  return (
    <div className="min-h-screen bg-[#faf6ef] text-[#2b2723]">
      <header className="sticky top-0 z-40 border-b border-[#e8dfd2] bg-[#faf6ef]/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/" className="flex items-center gap-2 [font-family:var(--font-syne)] text-lg font-800 font-extrabold tracking-tight">
            <span className="text-2xl">🐾</span>
            <span>Svět jmen</span>
          </Link>
          <nav className="flex items-center gap-1 text-sm">
            {POLOZKY.map(p => {
              const aktivni = p.href === '/' ? cesta === '/' : cesta.startsWith(p.href)
              return (
                <Link
                  key={p.href}
                  href={p.href}
                  className={`rounded-full px-3 py-1.5 font-medium transition-colors ${
                    aktivni
                      ? 'bg-[#2b2723] text-[#faf6ef]'
                      : 'text-[#6b6156] hover:bg-[#efe7da] hover:text-[#2b2723]'
                  }`}
                >
                  <span className="mr-1 hidden sm:inline">{p.emoji}</span>
                  {p.nazev}
                </Link>
              )
            })}
            <Link
              href="/oblibene"
              className={`rounded-full px-3 py-1.5 font-medium transition-colors ${
                cesta.startsWith('/oblibene')
                  ? 'bg-[#d97757] text-white'
                  : 'text-[#6b6156] hover:bg-[#efe7da] hover:text-[#2b2723]'
              }`}
              title="Vaše oblíbená jména"
            >
              ❤️{pocet > 0 && <span className="ml-1 font-semibold">{pocet}</span>}
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 pb-20 pt-8">{children}</main>
      <footer className="border-t border-[#e8dfd2] py-8 text-center text-sm text-[#8a7f71]">
        <p>Svět jmen — nejlíbivější jména pro zvířata i děti podle zemí. Vybráno s láskou a AI.</p>
        <p className="mt-1">
          <Link href="/aurora" className="underline decoration-dotted hover:text-[#2b2723]">AuroraDog — sledování polární záře</Link>
        </p>
      </footer>
    </div>
  )
}
