import Link from 'next/link'
import { KONTINENTY, ZEME } from '@/lib/names/data'
import { KATEGORIE_INFO } from '@/lib/names/types'
import type { Kategorie } from '@/lib/names/types'

// Patička je zároveň rozcestník: odkud se dá dostat všude, včetně zemí,
// které po odstranění mapy nemají jiné místo v navigaci.

const ZVIRATA: Kategorie[] = ['pes', 'fenka', 'kocour', 'kocka', 'kun', 'kralik', 'papousek', 'krecek']

const NASTROJE = [
  { href: '/deti', text: 'Jména pro holčičky', param: '?kategorie=holka' },
  { href: '/deti', text: 'Jména pro chlapečky', param: '?kategorie=kluk' },
  { href: '/deti', text: 'Nejlepší shoda s příjmením', param: '' },
  { href: '/deti', text: 'Ladí k sourozenci', param: '' },
  { href: '/rodina', text: 'Rodinný profil', param: '' },
  { href: '/oblibene', text: 'Uložená jména', param: '' },
]

const PRAVNI_ODKAZY = [
  { href: '/reklama', text: 'Reklama na webu' },
  { href: '/podminky', text: 'Podmínky' },
  { href: '/soukromi', text: 'Ochrana údajů' },
  { href: '/aurora', text: 'AuroraDog' },
]

export default function Paticka() {
  return (
    <footer className="mt-16 border-t border-[#e8dfd2] bg-[#f6f0e6]">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <nav className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4" aria-label="Rozcestník webu">
          <div>
            <h2 className="mb-3 [font-family:var(--font-syne)] text-[15px] font-bold">Pro děti</h2>
            <ul className="space-y-1.5 text-[13.5px]">
              {NASTROJE.map(n => (
                <li key={n.text}>
                  <Link href={`${n.href}${n.param}`} className="text-[#6b6156] hover:text-[#2b2723] hover:underline">
                    {n.text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="mb-3 [font-family:var(--font-syne)] text-[15px] font-bold">Pro zvířata</h2>
            <ul className="space-y-1.5 text-[13.5px]">
              {ZVIRATA.map(k => (
                <li key={k}>
                  <Link href={`/zvirata?kategorie=${k}`} className="text-[#6b6156] hover:text-[#2b2723] hover:underline">
                    Jména pro {KATEGORIE_INFO[k].mnozne.toLowerCase()}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h2 className="mb-3 [font-family:var(--font-syne)] text-[15px] font-bold">
              Jména podle zemí <span className="font-normal text-[#8a7f71]">({ZEME.length})</span>
            </h2>
            <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
              {KONTINENTY.map(k => {
                const zeme = ZEME.filter(z => z.kontinent === k.id)
                if (!zeme.length) return null
                return (
                  <div key={k.id}>
                    <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#a2988a]">{k.nazev}</p>
                    <ul className="flex flex-wrap gap-x-3 gap-y-1 text-[13px]">
                      {zeme.map(z => (
                        <li key={z.kod}>
                          <Link href={`/zeme/${z.kod}`} className="text-[#6b6156] hover:text-[#2b2723] hover:underline">
                            <span aria-hidden>{z.vlajka}</span> {z.nazev}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              })}
            </div>
          </div>
        </nav>

        <div className="mt-9 flex flex-wrap items-center justify-between gap-3 border-t border-[#e8dfd2] pt-5 text-[12.5px] text-[#8a7f71]">
          <p>Svět jmen — vybírat jméno má být radost. Zdarma, bez registrace, bez sbírání údajů.</p>
          <ul className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
            {PRAVNI_ODKAZY.map(o => (
              <li key={o.href}>
                <Link href={o.href} className="underline decoration-dotted hover:text-[#2b2723]">
                  {o.text}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  )
}
