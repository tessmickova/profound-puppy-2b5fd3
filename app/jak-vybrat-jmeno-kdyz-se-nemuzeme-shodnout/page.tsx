import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import Shell from '@/components/names/Shell'
import PorovnaniJmen from '@/components/names/PorovnaniJmen'
import { jsonLdDrobky, jsonLdNavod, WEB } from '@/lib/names/seo'

// Nejčastější skutečný problém, se kterým lidé přicházejí: jména nejsou
// problém, shoda je. Stránka proto neradí „vyberte si jméno", ale dává
// postup, jak se dobrat rozhodnutí ve dvou.

export const metadata: Metadata = {
  title: 'Nemůžeme se shodnout na jménu — co s tím',
  description:
    'Každý chce jiné jméno. Postup, který funguje líp než další seznam: vetovací '
    + 'kolo, společný užší výběr a týden zkoušení nahlas. Plus nástroj na porovnání finalistů.',
  alternates: { canonical: '/jak-vybrat-jmeno-kdyz-se-nemuzeme-shodnout' },
  openGraph: {
    title: 'Nemůžeme se shodnout na jménu — co s tím',
    description: 'Postup ve čtyřech krocích, jak se ve dvou dobrat rozhodnutí.',
    url: `${WEB.url}/jak-vybrat-jmeno-kdyz-se-nemuzeme-shodnout`,
  },
}

const KROKY = [
  {
    nazev: 'Každý sepíše pět jmen — odděleně',
    text: 'Ne společně u stolu. Ve chvíli, kdy jeden vysloví jméno nahlas, '
      + 'druhý na něj reaguje místo toho, aby přemýšlel o svém. Pět jmen, '
      + 'každý sám, bez zdůvodňování.',
  },
  {
    nazev: 'Vyměňte si seznamy a škrtejte jen tvrdá ne',
    text: 'Tvrdé ne je jméno bývalé lásky, jméno, které nosí někdo v rodině, '
      + 'nebo cokoliv, co ve vás vyvolá okamžitý odpor. Zbytek nechte, i když '
      + 'se vám nelíbí. Cílem není vyhrát, ale zjistit, co zbude.',
  },
  {
    nazev: 'Ze zbytku vyberte dva až tři finalisty',
    text: 'Když nezbude nic společného, opakujte první krok — ale tentokrát '
      + 'si nejdřív řekněte, co se vám na jménech toho druhého líbilo. Skoro '
      + 'vždycky se ukáže společný jmenovatel, který jste dosud nepojmenovali.',
  },
  {
    nazev: 'Týden zkoušejte nahlas, každé jméno pár dní',
    text: 'Jméno, které se dobře čte, se nemusí dobře volat. Používejte ho '
      + 'v běžných větách — „Jde se spát." — a po pár dnech se ptejte, které '
      + 'vám šlo přirozeněji z úst. Rozhodne obvykle tohle, ne argumenty.',
  },
]

export default function Neshoda() {
  return (
    <Shell>
      <nav className="drobky" aria-label="Drobečková navigace">
        <Link href="/">Úvod</Link>
        <span aria-hidden> › </span>
        <span aria-current="page">Nemůžeme se shodnout</span>
      </nav>

      <header className="nastroj-hlava">
        <h1>Nemůžeme se na jméně shodnout</h1>
        <p className="nastroj-podnadpis">
          Problém obvykle není v tom, že byste znali málo jmen. Je v tom, že
          každý z vás vybírá podle něčeho jiného — a nikdo to nahlas neřekl.
          Tady je postup, který to obejde.
        </p>
      </header>

      <ol className="postup-kroky">
        {KROKY.map((k, i) => (
          <li key={k.nazev} className="postup-krok">
            <span className="postup-cislo" aria-hidden>{i + 1}</span>
            <div>
              <h2>{k.nazev}</h2>
              <p>{k.text}</p>
            </div>
          </li>
        ))}
      </ol>

      <section className="nastroj-blok">
        <h2>Máte finalisty? Postavte je vedle sebe</h2>
        <p className="nastroj-podnadpis">
          Když se hádka točí dokola, pomůže vidět, čím se jména{' '}
          <strong>doopravdy</strong> liší — jak se s nimi bude oslovovat, jak
          se hláskují, jak často je uslyšíte na hřišti.
        </p>
        <Suspense fallback={<p className="porovnani-cekame">Připravujeme porovnání…</p>}>
          <PorovnaniJmen />
        </Suspense>
      </section>

      <section className="nastroj-vysvetleni">
        <h2>Tři věci, které spory obvykle vyřeší</h2>
        <ul>
          <li>
            <strong>Rozdělte roli jména a příjmení.</strong> Když jeden z vás
            trvá na jménu po babičce, druhý často nebojuje proti jménu, ale
            proti tomu, že se nemohl podílet. Druhé jméno je legitimní řešení,
            ne ústupek.
          </li>
          <li>
            <strong>Vyzkoušejte jméno na cizím člověku.</strong> Jak zní, když
            ho vysloví někdo, kdo neví, o co jde? Řekněte ho v obchodě nebo
            u lékaře a poslouchejte, jestli se musí ptát podruhé.
          </li>
          <li>
            <strong>Nechte to týden ležet.</strong> Jména, která vydrží týden
            bez toho, aby vás začala unavovat, obvykle vydrží i dalších padesát let.
          </li>
        </ul>

        <h2>Co tady nenajdete</h2>
        <p>
          Neurčíme za vás vítěze a nespočítáme „procento shody" mezi vámi.
          Takové číslo by bylo vymyšlené. Ukážeme rozdíly, rozhodnutí zůstává
          na vás — a to je dobře, protože žít s ním budete vy.{' '}
          <Link href="/metodika">Jak počítáme, co počítáme</Link>.
        </p>

        <h2>Kam dál</h2>
        <ul className="nastroj-dalsi">
          <li><Link href="/vybrat-jmeno-pro-dite">Nevíme, kde začít — ukažte nám dvojice</Link></li>
          <li><Link href="/jmeno-k-prijmeni">Jak jméno zní s naším příjmením</Link></li>
          <li><Link href="/rodina">Rodinný profil — jména, která ladí k sourozenci</Link></li>
          <li><Link href="/oblibene">Náš společný výběr</Link></li>
        </ul>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLdNavod(
            'Jak se ve dvou shodnout na jménu pro dítě',
            'P7D',
            KROKY,
          )),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLdDrobky([
            { nazev: 'Úvod', url: WEB.url },
            { nazev: 'Nemůžeme se shodnout', url: `${WEB.url}/jak-vybrat-jmeno-kdyz-se-nemuzeme-shodnout` },
          ])),
        }}
      />
    </Shell>
  )
}
