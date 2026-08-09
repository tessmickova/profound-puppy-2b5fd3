import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight, Baby, Dog, Globe2, Heart, ListChecks, PawPrint, Scale, ShieldCheck, Users,
} from 'lucide-react'
import Shell from '@/components/names/Shell'
import NameCard from '@/components/names/NameCard'
import Rozvrzeni from '@/components/names/Rozvrzeni'
import PasyJmen from '@/components/names/PasyJmen'
import NadpisSekce from '@/components/names/NadpisSekce'
import type { Druh } from '@/components/names/NadpisSekce'
import { JMENA, ZEME } from '@/lib/names/data'
import { jeStalice, jeVrchol, jeVyhled, serad } from '@/lib/names/logic'
import { VYHLED } from '@/lib/names/vlny'
import { CASTE_DOTAZY, jsonLdDotazy, jsonLdSeznam, WEB } from '@/lib/names/seo'

// Úvodní stránka není katalog, ale rozcestník podle toho, **kde v
// rozhodování člověk zrovna je**. Vyhledávání ani mřížka jmen tu nejsou
// první — kdo neví, kde začít, se seznamem nepohne.

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

/** Kdo pojmenovává — první a nejjednodušší otázka. */
const KOHO = [
  {
    href: '/vybrat-jmeno-pro-dite',
    nazev: 'Miminko',
    popis: 'Holčičku, chlapečka nebo ještě nevíme',
    Ikona: Baby,
    barva: '#f8dfe6',
  },
  {
    href: '/vybrat-jmeno-pro-zvire',
    nazev: 'Zvíře',
    popis: 'Psa, kočku, králíka i papouška',
    Ikona: PawPrint,
    barva: '#f6e6d3',
  },
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
  const topZvirata = serad(JMENA.filter(j => !['kluk', 'holka'].includes(j.kategorie)), 'popularita').slice(0, 6)
  const topDeti = serad(JMENA.filter(j => ['kluk', 'holka'].includes(j.kategorie)), 'popularita').slice(0, 6)
  // Na tohle se maminky ptají nejčastěji: co se bude dávat teď a příští
  // rok. Odpovídá dobové zařazení (`vlna`), ne styl „moderní" — ten
  // o době neříká nic.
  const vyhled = serad(JMENA.filter(jeVyhled), 'popularita').slice(0, 6)
  const nejcastejsi = serad(JMENA.filter(jeVrchol), 'popularita').slice(0, 6)
  const stalice = serad(JMENA.filter(jeStalice), 'popularita').slice(0, 6)

  return (
    <Shell>
      <Rozvrzeni>
        <section className="hero-zare uvod-hero">
          <h1>
            Vybrat jméno není o tom najít <span>víc</span> jmen
          </h1>
          <p className="uvod-podnadpis">
            Je to o tom mít v tom jasno. Neukazujeme vám další nekonečný seznam —
            pomůžeme vám zúžit výběr, porovnat finalisty a dojít k rozhodnutí,
            u kterého zůstanete.
          </p>
        </section>

        <section className="uvod-koho">
          <h2 className="uvod-otazka">Koho pojmenováváte?</h2>
          <div className="dlazdice uvod-dlazdice nastup">
            {KOHO.map(({ href, nazev, popis, Ikona, barva }) => (
              <Link key={href} href={href} style={{ ['--dlazdice-barva' as string]: barva }}>
                <span className="dlazdice-ikona"><Ikona size={20} aria-hidden /></span>
                <span className="dlazdice-nazev">{nazev}</span>
                <span className="dlazdice-popis">{popis}</span>
              </Link>
            ))}
          </div>
        </section>

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
            Hledáte jméno k sourozenci? <Link href="/rodina">Založte rodinný profil</Link>{' '}
            a doporučíme jména, která ladí ke všem doma. Všechno funguje bez
            registrace a bez e-mailu — <Link href="/soukromi">jak to máme se soukromím</Link>.
          </p>
        </section>

        <PasyJmen druh="lide" />

        <Sekce
          druh="lide"
          nadpis={`Jména, kterých bude přibývat — ${VYHLED[0]} a ${VYHLED[1]}`}
          popis="Jména, která jdou nahoru, a prababiččina jména, co se vracejí. Redakční zařazení podle toho, jak se dnes v Česku jména dávají — ne statistika."
          jmena={vyhled}
          odkaz={{ href: '/deti', text: 'zobrazit všechna' }}
        />

        <Sekce
          druh="lide"
          nadpis="Nejčastější jména dnešních miminek"
          popis="Tahle uslyšíte na hřišti nejčastěji. Někdo to bere jako doporučení, někdo jako důvod hledat dál."
          jmena={nejcastejsi}
          odkaz={{ href: '/deti', text: 'všechna dětská jména' }}
        />

        <PasyJmen druh="zvirata" />

        <Sekce
          druh="zvirata"
          nadpis="Nejlíbivější zvířecí jména"
          popis="Jména, na která vaše zvíře uslyší a vy je budete rádi volat."
          jmena={topZvirata}
          odkaz={{ href: '/zvirata', text: 'všechna zvířecí jména' }}
        />

        <Sekce
          druh="lide"
          nadpis="Stálice, které nezestárnou"
          popis="Dávají se v každé generaci. Za dvacet let nebudou znít ani staromódně, ani jako móda jednoho roku."
          jmena={stalice}
          odkaz={{ href: '/deti', text: 'objevit další' }}
        />

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
              <span className="duvera-ikona"><Dog size={18} aria-hidden /></span>
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
  druh, nadpis, popis, jmena, odkaz,
}: {
  druh: Druh
  nadpis: string
  popis: string
  jmena: typeof JMENA
  odkaz: { href: string; text: string }
}) {
  return (
    <section className="mb-12">
      <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
        <NadpisSekce druh={druh}>{nadpis}</NadpisSekce>
        <Link href={odkaz.href} className="odkaz-dal text-[13.5px] text-[#8a7f71] underline decoration-dotted hover:text-[#2b2723]">
          {odkaz.text} →
        </Link>
      </div>
      <p className="mb-4 max-w-2xl text-[13.5px] text-[#8a7f71]">{popis}</p>
      <div className="nastup mrizka-jmen">
        {jmena.map((j, i) => <NameCard key={j.id} jmeno={j} poradi={i + 1} />)}
      </div>
    </section>
  )
}
