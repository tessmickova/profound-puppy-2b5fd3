import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Shell from '@/components/names/Shell'
import NameCard from '@/components/names/NameCard'
import { JMENA } from '@/lib/names/data'
import { ENTITY_SE_STRANKOU, unikatniPodleJmena } from '@/lib/names/entita'
import { serad, velke } from '@/lib/names/logic'
import { slugJmena } from '@/lib/names/slug'
import { jsonLdDrobky, jsonLdSeznam, WEB } from '@/lib/names/seo'
import { KATEGORIE_INFO } from '@/lib/names/types'
import type { Kategorie } from '@/lib/names/types'

// Vstupní stránky pro to, co lidé skutečně hledají: „jména pro holčičky",
// „jména pro psy". Vykreslí je server, takže obsah vidí návštěvník
// i vyhledávač hned — bez čekání na JavaScript.

const KATEGORIE: Kategorie[] = [
  'holka', 'kluk', 'pes', 'fenka', 'kocour', 'kocka', 'kun', 'kralik', 'papousek', 'krecek',
  'morce', 'had', 'rybka', 'zelva', 'fretka', 'koza', 'leguan',
]

const podleSlugu = (slug: string): Kategorie | undefined =>
  KATEGORIE.find(k => KATEGORIE_INFO[k].slug === slug)

/** Kolik jmen ukážeme rovnou na stránce. Zbytek je za odkazem do filtru. */
const NA_STRANCE = 60

export function generateStaticParams() {
  return KATEGORIE.map(k => ({ slug: KATEGORIE_INFO[k].slug }))
}

// `dynamicParams` nevypínáme: adaptér pro Cloudflare si s ním neporadí
// a předrenderované cesty pak vracely 404. Neznámé adresy odbaví `notFound()`
// níž — stejně jako u stránek zemí, které tímhle způsobem fungují.

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const kat = podleSlugu(slug)
  if (!kat) return {}
  const info = KATEGORIE_INFO[kat]
  const pocet = JMENA.filter(j => j.kategorie === kat).length
  return {
    title: `Jména pro ${info.proKoho} — ${pocet} tipů s významem`,
    description: `${pocet} jmen pro ${info.proKoho} s významem, oblíbeností a původem. `
      + 'Vyberte podle stylu, délky, počátečního písmene nebo země, kde se jméno používá.',
    alternates: { canonical: `/jmena/${info.slug}` },
    openGraph: {
      title: `Jména pro ${info.proKoho}`,
      description: `${pocet} jmen s významem a oblíbeností.`,
      url: `${WEB.url}/jmena/${info.slug}`,
    },
  }
}

export default async function KategorieStranka({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const kat = podleSlugu(slug)
  if (!kat) notFound()

  const info = KATEGORIE_INFO[kat]
  const jeDite = kat === 'kluk' || kat === 'holka'
  const vsechna = JMENA.filter(j => j.kategorie === kat)
  // Katalog ukazuje jména, ne záznamy. Sofia používaná v Itálii, Španělsku
  // i na Slovensku je jedno jméno s třemi vlaječkami — ne tři karty.
  const unikatni = unikatniPodleJmena(serad(vsechna, 'popularita'))
  const nejoblibenejsi = unikatni.slice(0, NA_STRANCE)
  const maDetail = new Set(ENTITY_SE_STRANKOU.map(e => e.slug))

  const nejkratsi = unikatniPodleJmena(serad(vsechna, 'nejkratsi')).slice(0, 8)
  const abecedne = unikatniPodleJmena(serad(vsechna, 'abecedne')).slice(0, 8)

  return (
    <Shell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdDrobky([
        { nazev: 'Úvod', url: '/' },
        { nazev: jeDite ? 'Jména pro děti' : 'Jména pro zvířata', url: jeDite ? '/deti' : '/zvirata' },
        { nazev: `Jména pro ${info.proKoho}`, url: `/jmena/${info.slug}` },
      ])) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(
        jsonLdSeznam(
          `Jména pro ${info.proKoho}`,
          `${WEB.url}/jmena/${info.slug}`,
          nejoblibenejsi.slice(0, 20).map(u => ({ jmeno: u.jmeno.jmeno, vyznam: u.jmeno.vyznam })),
        ),
      ) }} />

      <nav className="drobky" aria-label="Drobečková navigace">
        <Link href="/">Úvod</Link>
        <span aria-hidden> › </span>
        <Link href={jeDite ? '/deti' : '/zvirata'}>{jeDite ? 'Jména pro děti' : 'Jména pro zvířata'}</Link>
        <span aria-hidden> › </span>
        <span aria-current="page">{velke(info.proKoho)}</span>
      </nav>

      <header className="kategorie-hlava">
        <h1>Jména pro {info.proKoho}</h1>
        <p className="kategorie-popis">
          {vsechna.length} jmen s významem a oblíbeností. Níž je {NA_STRANCE} nejoblíbenějších;
          celý katalog se dá profiltrovat podle stylu, délky, počátečního písmene
          i země, kde se jméno používá.
        </p>
        <p className="kategorie-akce">
          <Link className="kategorie-tlacitko" href={`${jeDite ? '/deti' : '/zvirata'}?kategorie=${kat}`}>
            Otevřít filtr všech {vsechna.length} jmen <span aria-hidden>→</span>
          </Link>
        </p>
      </header>

      <section aria-labelledby="nejoblibenejsi">
        <h2 id="nejoblibenejsi">Nejčastěji vybíraná</h2>
        <p className="kategorie-poznamka">
          Pořadí je náš redakční výběr, ne statistika matriky —{' '}
          <Link href="/metodika">jak vybíráme a hodnotíme</Link>.
        </p>
        <div className="mrizka nastup">
          {nejoblibenejsi.map((u, i) => (
            <NameCard
              key={u.jmeno.id}
              jmeno={u.jmeno}
              zemeNavic={u.zeme}
              poradi={i + 1}
              odkaz={maDetail.has(slugJmena(u.jmeno.jmeno))}
            />
          ))}
        </div>
      </section>

      <section aria-labelledby="kratka">
        <h2 id="kratka">Krátká jména</h2>
        <ul className="kategorie-radek">
          {nejkratsi.map(u => <li key={u.jmeno.id}>{u.jmeno.jmeno}</li>)}
        </ul>
      </section>

      <section aria-labelledby="abecedne">
        <h2 id="abecedne">Od začátku abecedy</h2>
        <ul className="kategorie-radek">
          {abecedne.map(u => <li key={u.jmeno.id}>{u.jmeno.jmeno}</li>)}
        </ul>
      </section>

      <nav className="kategorie-dalsi" aria-label="Další kategorie">
        <h2>Další kategorie</h2>
        <ul>
          {KATEGORIE.filter(k => k !== kat).map(k => (
            <li key={k}>
              <Link href={`/jmena/${KATEGORIE_INFO[k].slug}`}>
                Jména pro {KATEGORIE_INFO[k].proKoho}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </Shell>
  )
}
