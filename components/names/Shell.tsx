'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { Baby, Heart, House, PawPrint, Users } from 'lucide-react'
import { useOblibene } from '@/lib/names/oblibene'
import { useRodina } from '@/lib/names/rodina'
import Paticka from './Paticka'
import DetailPanel from './DetailPanel'
import VyberPanel from './VyberPanel'
import Odhalovani from './Odhalovani'
import ReklamniRam from './ReklamniRam'
import Hledani from './Hledani'

// Navigace je dvojí: v hlavičce na velkých displejích, jako spodní lišta
// na telefonu. Obojí ukazuje stejných pět míst, aby se uživatel neztratil.

const POLOZKY = [
  { href: '/', nazev: 'Úvod', Ikona: House },
  { href: '/deti', nazev: 'Jména pro děti', kratce: 'Děti', Ikona: Baby },
  { href: '/zvirata', nazev: 'Jména pro zvířata', kratce: 'Zvířata', Ikona: PawPrint },
]

export default function Shell({ children }: { children: React.ReactNode }) {
  const cesta = usePathname()
  const hlavicka = useRef<HTMLElement>(null)

  // Skutečnou výšku přišpendlené hlavičky ví jen prohlížeč: liší se podle
  // šířky okna i podle toho, jestli se text zalomil. Panel „Můj výběr“ pod
  // ni musí přesně zapadnout, takže ji změříme a předáme do CSS.
  useEffect(() => {
    const prvek = hlavicka.current
    if (!prvek) return
    const zmer = () => {
      document.documentElement.style.setProperty('--vyska-hlavicky', `${Math.round(prvek.getBoundingClientRect().height)}px`)
    }
    zmer()
    const pozorovatel = new ResizeObserver(zmer)
    pozorovatel.observe(prvek)
    return () => pozorovatel.disconnect()
  }, [])
  const { pocet } = useOblibene()
  const { pocet: pocetRodiny } = useRodina()

  const jeAktivni = (href: string) => (href === '/' ? cesta === '/' : cesta.startsWith(href))

  return (
    <div className="svetjmen-shell min-h-screen bg-[#faf6ef] pb-16 text-[#2b2723] lg:pb-0">
      {/* Živé pozadí: dvě pomalu plující barevné skvrny za obsahem.
          Čistě dekorace — pointer-events none, žádný vliv na čtení. */}
      <div className="pozadi-zare" aria-hidden>
        <span /><span /><span />
      </div>
      <Odhalovani />
      {/* Reklama: postranní sloupce na širokém okně, jinak lišta nahoře. */}
      <ReklamniRam />
      <header ref={hlavicka} className="hlavicka sticky top-0 z-40 border-b border-[#e8dfd2] bg-[#faf6ef]/92 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-3 py-2.5 sm:px-4">
          <Link href="/" className="flex shrink-0 items-center gap-1.5 [font-family:var(--font-nadpis)] text-base font-extrabold tracking-tight sm:text-lg">
            <PawPrint size={20} className="text-[#d97757]" aria-hidden />
            <span>Svět jmen</span>
          </Link>

          {/* Hledání konkrétního jména je dosažitelné odkudkoli. */}
          <div className="hlavicka-hledani hidden md:block">
            <Hledani />
          </div>

          {/* hlavní navigace — na telefonu ji nahradí spodní lišta */}
          <nav className="ml-auto hidden items-center gap-0.5 text-[13px] sm:flex" aria-label="Hlavní navigace">
            {POLOZKY.map(({ href, nazev, Ikona }) => (
              <Link
                key={href}
                href={href}
                aria-current={jeAktivni(href) ? 'page' : undefined}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 font-medium transition-colors ${
                  jeAktivni(href) ? 'bg-[#2b2723] text-[#faf6ef]' : 'text-[#6b6156] hover:bg-[#efe7da] hover:text-[#2b2723]'
                }`}
              >
                <Ikona size={15} aria-hidden />
                {nazev}
              </Link>
            ))}
            <Link
              href="/rodina"
              title="Profil vaší rodiny — lidé i zvířata"
              aria-current={jeAktivni('/rodina') ? 'page' : undefined}
              className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1.5 font-medium transition-colors ${
                jeAktivni('/rodina') ? 'bg-[#2b2723] text-[#faf6ef]' : 'text-[#6b6156] hover:bg-[#efe7da] hover:text-[#2b2723]'
              }`}
            >
              <Users size={15} aria-hidden />
              {pocetRodiny > 0 && <span className="font-semibold">{pocetRodiny}</span>}
            </Link>
            <Link
              href="/oblibene"
              title="Vaše oblíbená jména"
              aria-current={jeAktivni('/oblibene') ? 'page' : undefined}
              className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1.5 font-medium transition-colors ${
                jeAktivni('/oblibene') ? 'bg-[#d97757] text-white' : 'text-[#6b6156] hover:bg-[#efe7da] hover:text-[#2b2723]'
              }`}
            >
              <Heart size={15} aria-hidden fill={pocet > 0 ? 'currentColor' : 'none'} />
              {pocet > 0 && <span className="font-semibold">{pocet}</span>}
            </Link>
          </nav>

          {/* na telefonu zůstane v hlavičce jen odkaz na uložená jména */}
          <Link
            href="/oblibene"
            className="ml-auto inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[13px] font-medium text-[#6b6156] sm:hidden"
            aria-label="Vaše oblíbená jména"
          >
            <Heart size={17} aria-hidden fill={pocet > 0 ? '#d97757' : 'none'} color={pocet > 0 ? '#d97757' : 'currentColor'} />
            {pocet > 0 && <span className="font-semibold text-[#d97757]">{pocet}</span>}
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-3 pt-6 sm:px-4 sm:pt-8">{children}</main>

      <Paticka />

      {/* Panel s výběrem je PŘED detailem: když se z něj otevře jméno,
          detail se vykreslí později v DOM, a je tedy navrchu. */}
      <VyberPanel />
      <DetailPanel />

      {/* spodní lišta — hlavní navigace na telefonu */}
      <nav className="spodni-lista sm:hidden" aria-label="Hlavní navigace">
        {[
          ...POLOZKY.map(p => ({ href: p.href, nazev: p.kratce ?? p.nazev, Ikona: p.Ikona, pocet: 0 })),
          { href: '/rodina', nazev: 'Rodina', Ikona: Users, pocet: pocetRodiny },
          { href: '/oblibene', nazev: 'Uložená', Ikona: Heart, pocet },
        ].map(({ href, nazev, Ikona, pocet: p }) => (
          <Link
            key={href}
            href={href}
            aria-current={jeAktivni(href) ? 'page' : undefined}
            className={jeAktivni(href) ? 'je-aktivni' : ''}
          >
            <span className="relative">
              <Ikona size={20} aria-hidden />
              {p > 0 && <span className="lista-pocet">{p}</span>}
            </span>
            {nazev}
          </Link>
        ))}
      </nav>
    </div>
  )
}
