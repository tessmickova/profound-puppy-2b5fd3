import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight, Globe2, Heart, ListChecks, Lock, Scale, ShieldCheck, Users,
} from 'lucide-react'
import Shell from '@/components/names/Shell'
import NameCard from '@/components/names/NameCard'
import Rozvrzeni from '@/components/names/Rozvrzeni'
import PasyJmen from '@/components/names/PasyJmen'
import NadpisSekce from '@/components/names/NadpisSekce'
import RodinaHero from '@/components/names/RodinaHero'
import UvodZalozky from '@/components/names/UvodZalozky'
import type { Druh } from '@/components/names/NadpisSekce'
import { JMENA, ZEME } from '@/lib/names/data'
import { dobreSeVola, jeNavrat, jeStalice, jeVrchol, jeVzestup, serad } from '@/lib/names/logic'
import { VYHLED } from '@/lib/names/vlny'
import { znejeSvetove } from '@/lib/names/zapis'
import { KATEGORIE_INFO } from '@/lib/names/types'
import type { Kategorie } from '@/lib/names/types'
import { CASTE_DOTAZY, jsonLdDotazy, jsonLdSeznam, WEB } from '@/lib/names/seo'

// Úvodní stránka není katalog, ale rozcestník podle situace. První otázka
// jsou dvě velké záložky — miminko, nebo zvíře — a všechno pod nimi se
// přepne do zvolené situace. Rozcestník „kde jste teď" je až pod obsahem.

export const metadata: Metadata = {
  title: 'Svět jmen — pomůžeme vám vybrat jméno a rozhodnout se',
  description:
    'Nemusíte procházet stovky jmen. Ukážeme dvojice a poznáme váš vkus, porovnáme '
    + `finalisty a otestujeme jméno s příjmením. ${JMENA.length} jmen z ${ZEME.length} zemí, zdarma a bez registrace.`,
  alternates: { canonical: '/' },
  keywords: [
    'jak vybrat jméno pro dítě', 'porovnat jména', 'jméno k příjmení',
    'jména pro děti', 'jména pro psy', 'jména pro kočky', 'význam jmen',
  ],
}

/** Široká paleta zvířat, která lidi doma opravdu mají. */
const DRUHY: Kategorie[] = [
  'pes', 'fenka', 'kocour', 'kocka', 'kralik', 'krecek', 'morce', 'papousek',
  'rybka', 'zelva', 'had', 'fretka', 'kun', 'koza', 'leguan',
]

/** Kde v rozhodování je — každá cesta vede do konkrétního nástroje. */
const CESTY = [
  {
    href: '/vybrat-jmeno-pro-dite',
    nadpis: 'Nevíme, kde začít',
    popis: 'Vyberete si z pár dvojic a my z toho poznáme, co se vám líbí.',
    cta: 'Ukažte mi dvojice',
    Ikona: ListChecks,
  },
  {
    href: '/porovnat-jmena',
    nadpis: 'Máme favority',
    popis: 'Dvě tři jména a každé má něco. Ukážeme, čím se doopravdy liší.',
    cta: 'Porovnat finalisty',
    Ikona: Scale,
  },
  {
    href: '/jmeno-k-prijmeni',
    nadpis: 'Ladí to k příjmení?',
    popis: 'Oslovení, iniciály, hláskování i to, jak jméno zní v cizině.',
    cta: 'Otestovat celé jméno',
    Ikona: Users,
  },
  {
    href: '/jak-vybrat-jmeno-kdyz-se-nemuzeme-shodnout',
    nadpis: 'Neshodneme se',
    popis: 'Každý chce jiné. Postup ve čtyřech krocích, který to obejde.',
    cta: 'Jak z toho ven',
    Ikona: Heart,
  },
]

export default function Domov() {
  const detska = (f: (j: (typeof JMENA)[number]) => boolean) =>
    serad(JMENA.filter(f), 'popularita').slice(0, 6)

  const moderniVzestup = detska(jeVzestup)
  const svetova = detska(znejeSvetove)
  const navraty = detska(jeNavrat)
  const nejcastejsi = detska(jeVrchol)
  const stalice = detska(jeStalice)
  // Šestá kategorie doplňuje mřížku na sudý počet — boxy stojí ve dvojicích
  // a lichý by nechal vedle sebe prázdné místo.
  const kratka = detska(j => j.zeme === 'cz' && j.slabiky <= 2)
  const topZvirata = serad(JMENA.filter(j => !['kluk', 'holka'].includes(j.kategorie)), 'popularita').slice(0, 6)
  const volatelna = serad(JMENA.filter(dobreSeVola), 'popularita').slice(0, 6)
  const topDeti = serad(JMENA.filter(j => ['kluk', 'holka'].includes(j.kategorie)), 'popularita').slice(0, 6)

  return (
    <Shell>
      <Rozvrzeni>
        <UvodZalozky
          deti={(
            <>
              <RodinaHero />

              <div className="sekce-mrizka">
              <Sekce
                druh="lide"
                nadpis="Modernější jména na vzestupu"
                jmena={moderniVzestup}
                odkaz={{ href: '/deti', text: 'zobrazit všechna' }}
              />
              <Sekce
                druh="lide"
                nadpis="Jména, která znějí světově"
                jmena={svetova}
                odkaz={{ href: '/deti', text: 'zobrazit všechna' }}
              />
              <Sekce
                druh="lide"
                nadpis="Babiččina jména, která se vracejí"
                jmena={navraty}
                odkaz={{ href: '/deti', text: 'zobrazit všechna' }}
              />
              <Sekce
                druh="lide"
                nadpis="Nejčastější jména dnešních miminek"
                jmena={nejcastejsi}
                odkaz={{ href: '/deti', text: 'všechna dětská jména' }}
              />
              <Sekce
                druh="lide"
                nadpis="Stálice, které nezestárnou"
                jmena={stalice}
                odkaz={{ href: '/deti', text: 'objevit další' }}
              />
              <Sekce
                druh="lide"
                nadpis="Krátká a zvučná jména"
                jmena={kratka}
                odkaz={{ href: '/deti', text: 'zobrazit všechna' }}
              />
              </div>

              <PasyJmen druh="lide" />
            </>
          )}
          zvirata={(
            <>
              <section className="rodina-hero zvire-uvod">
                <div className="rodina-hero-text">
                  <h2 className="zvire-uvod-nadpis">
                    Jméno, na které <span>vaše zvíře uslyší</span>
                  </h2>
                  <p className="rodina-hero-podnadpis">
                    Krátké, zvučné a jiné než povely. Vyberte si z pár dvojic
                    a my z toho poznáme, co se vám líbí — nebo rovnou
                    projděte katalog podle druhu a plemene.
                  </p>
                  <div className="zvire-uvod-akce">
                    <Link href="/vybrat-jmeno-pro-zvire" className="vyber-tlacitko je-hlavni">
                      Ukažte mi dvojice <ArrowRight size={14} aria-hidden />
                    </Link>
                    <Link href="/zvirata" className="vyber-tlacitko">
                      Procházet katalog
                    </Link>
                  </div>
                </div>

                {/* Koho doma máte? Obrázek pozná i dítě — proto emoji,
                    ne čárové ikonky. Každé tlačítko vede rovnou do
                    katalogu daného druhu. */}
                <div className="zvire-druhy" role="list" aria-label="Vyberte druh zvířete">
                  {DRUHY.map(d => (
                    <Link key={d} role="listitem" href={`/zvirata?kategorie=${d}`} className="zvire-druh">
                      <span className="zvire-druh-emoji" aria-hidden>{KATEGORIE_INFO[d].emoji}</span>
                      <span className="zvire-druh-nazev">{KATEGORIE_INFO[d].nazev}</span>
                    </Link>
                  ))}
                </div>
              </section>

              <div className="sekce-mrizka">
              <Sekce
                druh="zvirata"
                nadpis="Nejlíbivější zvířecí jména"
                jmena={topZvirata}
                odkaz={{ href: '/zvirata', text: 'všechna zvířecí jména' }}
              />
              <Sekce
                druh="zvirata"
                nadpis="Dobře se volají"
                jmena={volatelna}
                odkaz={{ href: '/zvirata', text: 'zobrazit všechna' }}
              />
              </div>

              <PasyJmen druh="zvirata" />
            </>
          )}
        />

        <section className="uvod-cesty">
          <h2 className="uvod-otazka">Kde jste teď?</h2>
          <div className="cesty-mrizka">
            {CESTY.map(({ href, nadpis, popis, cta, Ikona }) => (
              <Link key={href} href={href} className="cesta">
                <span className="cesta-ikona"><Ikona size={18} aria-hidden /></span>
                <span className="cesta-nadpis">{nadpis}</span>
                <span className="cesta-popis">{popis}</span>
                <span className="cesta-cta">{cta} <ArrowRight size={14} aria-hidden /></span>
              </Link>
            ))}
          </div>
          <p className="uvod-pozn">
            Všechno funguje bez registrace a bez e-mailu —{' '}
            <Link href="/soukromi">jak to máme se soukromím</Link>.
          </p>
        </section>

        <section className="uvod-duvera">
          <h2 className="uvod-otazka">Proč nám věřit</h2>
          <div className="duvera-mrizka">
            <div className="duvera-bod">
              <span className="duvera-ikona"><ShieldCheck size={18} aria-hidden /></span>
              <h3>Žádná vymyšlená čísla</h3>
              <p>
                Neuvádíme procenta shody ani pravděpodobnost, že budete
                spokojení — nikdo je neumí spočítat. U každého doporučení
                ukážeme pravidla, ze kterých vyšlo.{' '}
                <Link href="/metodika">Metodika</Link>.
              </p>
            </div>
            <div className="duvera-bod">
              <span className="duvera-ikona"><Globe2 size={18} aria-hidden /></span>
              <h3>Jména podle zemí, kde se používají</h3>
              <p>
                {JMENA.length} jmen z {ZEME.length} zemí. U každého píšeme, kde
                se jméno běžně nosí — ne odkud pochází jeho etymologie.{' '}
                <Link href="/zeme">Projít podle zemí</Link>.
              </p>
            </div>
            <div className="duvera-bod">
              <span className="duvera-ikona"><Lock size={18} aria-hidden /></span>
              <h3>Nic po vás nechceme</h3>
              <p>
                Žádná registrace, žádný e-mail, žádné sledovací skripty.
                Příjmení ani výběr se nikam neodesílají — počítá se to přímo
                ve vašem prohlížeči.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="mb-4 [font-family:var(--font-nadpis)] text-2xl font-bold">Časté otázky o výběru jména</h2>
          <div className="grid gap-2.5">
            {CASTE_DOTAZY.map(d => (
              <details key={d.otazka} className="rounded-2xl border border-[#e8dfd2] bg-white p-4 transition-colors hover:border-[#d9cfbe]">
                <summary className="cursor-pointer [font-family:var(--font-nadpis)] text-[15.5px] font-bold">
                  {d.otazka}
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-[#6b6156]">{d.odpoved}</p>
              </details>
            ))}
          </div>
        </section>
      </Rozvrzeni>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdDotazy()) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLdSeznam(
            'Nejlíbivější jména pro děti',
            `${WEB.url}/deti`,
            topDeti.map(j => ({ jmeno: j.jmeno, vyznam: j.vyznam })),
          )),
        }}
      />
    </Shell>
  )
}

function Sekce({
  druh, nadpis, jmena, odkaz,
}: {
  druh: Druh
  nadpis: string
  jmena: typeof JMENA
  odkaz: { href: string; text: string }
}) {
  return (
    <section className="sekce-sklo">
      <div className="sekce-sklo-hlava">
        <NadpisSekce druh={druh} uroven={3}>{nadpis}</NadpisSekce>
        <Link href={odkaz.href} className="odkaz-dal">
          {odkaz.text} →
        </Link>
      </div>
      <div className="nastup mrizka-jmen mrizka-kompakt">
        {jmena.map((j, i) => <NameCard key={j.id} jmeno={j} poradi={i + 1} />)}
      </div>
    </section>
  )
}
