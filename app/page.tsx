import type { Metadata } from 'next'
import Link from 'next/link'
import { Baby, Cat, Dog, Sparkles, Users } from 'lucide-react'
import Shell from '@/components/names/Shell'
import NameCard from '@/components/names/NameCard'
import Rozvrzeni from '@/components/names/Rozvrzeni'
import PasyJmen from '@/components/names/PasyJmen'
import { JMENA, ZEME } from '@/lib/names/data'
import { jeOriginal, jeTrendy, serad } from '@/lib/names/logic'
import { CASTE_DOTAZY, jsonLdDotazy, jsonLdSeznam, WEB } from '@/lib/names/seo'

export const metadata: Metadata = {
  title: 'Svět jmen — jména pro děti i zvířata podle zemí světa',
  description:
    `Přes ${JMENA.length} jmen z ${ZEME.length} zemí: pro holčičky, kluky, psy, kočky i další `
    + 'zvířata. Vyberte jméno, které ladí s příjmením, rodinou i plemenem.',
  alternates: { canonical: '/' },
  keywords: [
    'jména pro děti', 'jména pro psy', 'jména pro kočky', 'jak pojmenovat psa',
    'jméno k příjmení', 'jména sourozenců', 'jmeniny', 'význam jmen',
  ],
}

const DLAZDICE = [
  { href: '/deti?kategorie=holka', nazev: 'Pro holčičku', popis: 'Něžná i silná jména', Ikona: Baby, barva: '#f8dfe6' },
  { href: '/deti?kategorie=kluk', nazev: 'Pro chlapečka', popis: 'Klasika i novinky', Ikona: Baby, barva: '#dfe9f8' },
  { href: '/zvirata?kategorie=pes', nazev: 'Pro pejska', popis: 'Podle plemene i povahy', Ikona: Dog, barva: '#f6e6d3' },
  { href: '/zvirata?kategorie=kocka', nazev: 'Pro kočičku', popis: 'Od Micky po Bastet', Ikona: Cat, barva: '#e4eede' },
]

export default function Domov() {
  const topZvirata = serad(JMENA.filter(j => !['kluk', 'holka'].includes(j.kategorie)), 'popularita').slice(0, 6)
  const topDeti = serad(JMENA.filter(j => ['kluk', 'holka'].includes(j.kategorie)), 'popularita').slice(0, 6)
  const trendy = serad(JMENA.filter(jeTrendy), 'popularita').slice(0, 6)
  const originaly = serad(JMENA.filter(jeOriginal), 'popularita').slice(0, 6)

  return (
    <Shell>
      <Rozvrzeni plochy={['domov-nad-mapou', 'domov-po-mape', 'domov-mezi', 'domov-bocni', 'domov-pred-patickou']}>
        <section className="hero-zare mb-10 text-center">
          <p className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-[#efe0cc] bg-white px-3 py-1 text-[12.5px] font-medium text-[#8a6d2f]">
            <Sparkles size={13} aria-hidden /> {JMENA.length} jmen z {ZEME.length} zemí — zdarma a bez registrace
          </p>
          <h1 className="[font-family:var(--font-syne)] text-[32px] font-extrabold leading-[1.08] tracking-tight sm:text-5xl">
            Najděte jméno, které <span className="text-[#d97757]">k vám patří</span>
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-[15px] leading-relaxed text-[#6b6156]">
            Vybírat jméno má být radost, ne tabulka. Řekněte nám, koho čekáte —
            a my vybereme jména, která sedí k vašemu příjmení, rodině i povaze.
          </p>
        </section>

        <section className="mb-14">
          <div className="dlazdice nastup">
            {DLAZDICE.map(({ href, nazev, popis, Ikona, barva }) => (
              <Link key={href} href={href} style={{ ['--dlazdice-barva' as string]: barva }}>
                <span className="dlazdice-ikona"><Ikona size={19} aria-hidden /></span>
                <span className="dlazdice-nazev">{nazev}</span>
                <span className="dlazdice-popis">{popis}</span>
              </Link>
            ))}
          </div>
          <p className="mt-4 text-center text-[13.5px] text-[#8a7f71]">
            Máte doma víc jmen? <Link href="/rodina" className="font-semibold text-[#2b2723] underline decoration-[#e0c9b4] decoration-2 underline-offset-2 hover:decoration-[#d97757]">Založte rodinný profil</Link> a doporučíme další, která k nim ladí.
          </p>
        </section>

        <PasyJmen />

        <Sekce
          nadpis="Nejlíbivější dětská jména"
          popis="Žebříček napříč všemi zeměmi — od české klasiky po jižní temperament."
          jmena={topDeti}
          odkaz={{ href: '/deti', text: 'všechna dětská jména' }}
        />

        <Sekce
          nadpis="Nejlíbivější zvířecí jména"
          popis="Jména, na která vaše zvíře uslyší a vy je budete rádi volat."
          jmena={topZvirata}
          odkaz={{ href: '/zvirata', text: 'všechna zvířecí jména' }}
        />

        <Sekce
          nadpis="Populární trendy právě teď"
          popis="Moderní jména, která letí nahoru — u dětí i zvířat je poznáte podle štítku."
          jmena={trendy}
          odkaz={{ href: '/deti', text: 'filtrovat trendy' }}
        />

        <Sekce
          nadpis="Originální a pěkná"
          popis="Skryté poklady — jména, která nepotkáte na každém hřišti ani v každém parku."
          jmena={originaly}
          odkaz={{ href: '/deti', text: 'objevit další' }}
        />

        <section className="mt-14">
          <h2 className="mb-4 [font-family:var(--font-syne)] text-2xl font-bold">Časté otázky o výběru jména</h2>
          <div className="grid gap-2.5">
            {CASTE_DOTAZY.map(d => (
              <details key={d.otazka} className="rounded-2xl border border-[#e8dfd2] bg-white p-4 transition-colors hover:border-[#d9cfbe]">
                <summary className="cursor-pointer [font-family:var(--font-syne)] text-[15.5px] font-bold">
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
  nadpis, popis, jmena, odkaz,
}: {
  nadpis: string
  popis: string
  jmena: typeof JMENA
  odkaz: { href: string; text: string }
}) {
  return (
    <section className="mb-12">
      <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="[font-family:var(--font-syne)] text-2xl font-bold">{nadpis}</h2>
        <Link href={odkaz.href} className="text-[13.5px] text-[#8a7f71] underline decoration-dotted hover:text-[#2b2723]">
          {odkaz.text} →
        </Link>
      </div>
      <p className="mb-4 max-w-2xl text-[13.5px] text-[#8a7f71]">{popis}</p>
      <div className="nastup grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {jmena.map((j, i) => <NameCard key={j.id} jmeno={j} poradi={i + 1} />)}
      </div>
    </section>
  )
}
