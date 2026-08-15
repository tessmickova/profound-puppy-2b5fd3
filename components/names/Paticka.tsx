import Link from 'next/link'
import { ZEME } from '@/lib/names/data'
import { KATEGORIE_INFO } from '@/lib/names/types'
import type { Kategorie } from '@/lib/names/types'
import { PRAVNI, UDAJE_PROVOZOVATELE_DOPLNENY } from '@/lib/names/pravni'

// Patička slouží lidem, ne vyhledávači.
//
// Dřív v ní byl výpis všech 25 zemí na každé stránce webu — pro člověka
// nepřehledná zeď odkazů, pro crawler tisíce opakovaných řádků. Zůstaly
// hlavní cesty a nejčastější země; kompletní seznam má vlastní stránku.

const DETI: Kategorie[] = ['holka', 'kluk']
const ZVIRATA: Kategorie[] = ['pes', 'fenka', 'kocka', 'kocour']

/** Země, které lidi hledají nejčastěji. Zbytek je za odkazem „všechny země". */
const HLAVNI_ZEME = ['cz', 'sk', 'gb', 'de', 'fr', 'it']

const O_PROJEKTU = [
  { href: '/metodika', text: 'Jak vybíráme jména' },
  { href: '/reklama', text: 'Reklama na webu' },
  { href: '/reklama/ucet', text: 'Účet inzerenta' },
  { href: '/podminky', text: 'Podmínky' },
  { href: '/soukromi', text: 'Ochrana údajů' },
  { href: '/sprava', text: 'Správa webu' },
]

function Sloupec({ nadpis, deti }: { nadpis: string; deti: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-3 [font-family:var(--font-nadpis)] text-[15px] font-bold">{nadpis}</h2>
      <ul className="space-y-1.5 text-[13.5px]">{deti}</ul>
    </div>
  )
}

const Odkaz = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <li>
    <Link href={href} className="text-[#6b6156] hover:text-[#2b2723] hover:underline">
      {children}
    </Link>
  </li>
)

export default function Paticka() {
  return (
    <footer className="mt-16 border-t border-[#e8dfd2] bg-[#f6f0e6]">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <nav className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4" aria-label="Rozcestník webu">
          <Sloupec
            nadpis="Pro děti"
            deti={<>
              {DETI.map(k => (
                <Odkaz key={k} href={`/jmena/${KATEGORIE_INFO[k].slug}`}>
                  Jména pro {KATEGORIE_INFO[k].proKoho}
                </Odkaz>
              ))}
              <Odkaz href="/deti">Shoda s příjmením a rodinou</Odkaz>
              <Odkaz href="/rodina">Rodinný profil</Odkaz>
            </>}
          />

          <Sloupec
            nadpis="Pro zvířata"
            deti={<>
              {ZVIRATA.map(k => (
                <Odkaz key={k} href={`/jmena/${KATEGORIE_INFO[k].slug}`}>
                  Jména pro {KATEGORIE_INFO[k].proKoho}
                </Odkaz>
              ))}
              <Odkaz href="/zvirata">Podle plemene a povahy</Odkaz>
            </>}
          />

          <Sloupec
            nadpis="Podle země"
            deti={<>
              {HLAVNI_ZEME.map(kod => {
                const z = ZEME.find(x => x.kod === kod)
                if (!z) return null
                return (
                  <Odkaz key={kod} href={`/zeme/${kod}`}>
                    <span aria-hidden>{z.vlajka}</span> {z.pridavne[0].toUpperCase() + z.pridavne.slice(1)} jména
                  </Odkaz>
                )
              })}
              <Odkaz href="/zeme">Všechny země ({ZEME.length})</Odkaz>
            </>}
          />

          <Sloupec
            nadpis="O projektu"
            deti={<>
              {O_PROJEKTU.map(o => <Odkaz key={o.href} href={o.href}>{o.text}</Odkaz>)}
              <Odkaz href="/oblibene">Uložená jména</Odkaz>
            </>}
          />
        </nav>

        <div className="mt-9 flex flex-wrap items-center justify-between gap-3 border-t border-[#e8dfd2] pt-6 text-[12.5px] text-[#8a7f71]">
          <p>
            Svět jmen — katalog jmen pro děti i zvířata. Zdarma, bez registrace.
          </p>
          {/* Dokud jsou údaje zástupné, radši nic než „VYPLNIT s.r.o.“. */}
          {UDAJE_PROVOZOVATELE_DOPLNENY && (
            <p>
              {PRAVNI.provozovatel}
              {PRAVNI.ico ? `, IČO ${PRAVNI.ico}` : ''} ·{' '}
              <a href={`mailto:${PRAVNI.email}`} className="hover:text-[#2b2723] hover:underline">
                {PRAVNI.email}
              </a>
            </p>
          )}
        </div>
      </div>
    </footer>
  )
}
