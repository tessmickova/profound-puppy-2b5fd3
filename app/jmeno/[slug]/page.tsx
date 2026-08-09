import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Shell from '@/components/names/Shell'
import TestJmena from '@/components/names/TestJmena'
import PorovnaniJmen from '@/components/names/PorovnaniJmen'
import UlozitJmeno from '@/components/names/UlozitJmeno'
import { ENTITY_SE_STRANKOU, entitaPodleSlugu, podobna, zemeEntity } from '@/lib/names/entita'
import { KATEGORIE_INFO, VLNA_INFO } from '@/lib/names/types'
import { ROK_REVIZE, vlnaJmena } from '@/lib/names/vlny'
import { variantyZapisu } from '@/lib/names/zapis'
import { WEB } from '@/lib/names/seo'
import { velke } from '@/lib/names/logic'

// Detail dostane jen jméno, o kterém máme co říct — viz `maDostDat`.
// Zbytek katalogu zůstává v přehledech, aby nevznikly stovky skoro
// stejných stránek.
export function generateStaticParams() {
  return ENTITY_SE_STRANKOU.map(e => ({ slug: e.slug }))
}

// `dynamicParams` nevypínáme: adaptér pro Cloudflare si s ním neporadí
// a předrenderované cesty pak vracely 404. Neznámé adresy odbaví `notFound()`
// níž — stejně jako u stránek zemí, které tímhle způsobem fungují.

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const e = entitaPodleSlugu(slug)
  if (!e) return {}
  const casti = ['význam', e.puvod ? 'původ' : null, e.svatek ? 'svátek' : null, 'oblíbenost']
    .filter(Boolean)
  return {
    title: `${e.jmeno} — ${casti.join(', ')}`,
    description: `${e.jmeno}: ${e.vyznam} Kde se jméno používá, ${
      e.svatek ? `jmeniny ${e.svatek}, ` : ''
    }domácké tvary a jména, která k němu ladí.`,
    alternates: { canonical: `/jmeno/${e.slug}` },
    openGraph: {
      title: `${e.jmeno} — význam a původ jména`,
      description: e.vyznam,
      url: `${WEB.url}/jmeno/${e.slug}`,
    },
  }
}

export default async function JmenoStranka({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const e = entitaPodleSlugu(slug)
  if (!e) notFound()

  const zeme = zemeEntity(e)
  const dalsi = podobna(e)
  const proKoho = e.kategorie.map(k => KATEGORIE_INFO[k])
  // Vlna patří jménu, ne jednotlivému záznamu — vezmeme první výskyt,
  // který ji má (české dětské jméno).
  const vlna = e.vyskyty.map(vlnaJmena).find(Boolean)
  const jineZapisy = variantyZapisu(e.jmeno)

  // DefinedTerm sedí na to, co stránka opravdu je: heslo se slovníkovým
  // významem. Recenze ani hodnocení si nevymýšlíme.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'DefinedTerm',
    name: e.jmeno,
    description: e.vyznam,
    inDefinedTermSet: { '@type': 'DefinedTermSet', name: 'Svět jmen', url: WEB.url },
    url: `${WEB.url}/jmeno/${e.slug}`,
  }

  return (
    <Shell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav className="drobky" aria-label="Drobečková navigace">
        <Link href="/">Úvod</Link>
        <span aria-hidden> › </span>
        <Link href={e.jeLidske ? '/deti' : '/zvirata'}>
          {e.jeLidske ? 'Jména pro děti' : 'Jména pro zvířata'}
        </Link>
        <span aria-hidden> › </span>
        <span aria-current="page">{e.jmeno}</span>
      </nav>

      <article className="jmeno-detail">
        <header className="jmeno-hlava">
          <h1>{e.jmeno}</h1>
          <p className="jmeno-vyznam">{velke(e.vyznam)}</p>
        </header>

        <UlozitJmeno jmeno={e.jmeno} idcka={e.vyskyty.map(v => v.id)} />

        <dl className="jmeno-udaje">
          <div>
            <dt>Používá se pro</dt>
            <dd>{proKoho.map(k => k.mnozne.toLowerCase()).join(', ')}</dd>
          </div>
          {zeme.length > 0 && (
            <div>
              <dt>Kde se s ním potkáte</dt>
              {/* Záměrně „používá se v", ne „pochází z" — to jsou dvě různé věci
                  a původ u většiny jmen doložený nemáme. */}
              <dd>{zeme.map(z => `${z.vlajka} ${z.nazev}`).join(' · ')}</dd>
            </div>
          )}
          {e.puvod && (
            <div>
              <dt>Jazykový původ</dt>
              <dd>{e.puvod}</dd>
            </div>
          )}
          {e.svatek && (
            <div>
              <dt>Jmeniny v českém kalendáři</dt>
              <dd>{e.svatek}</dd>
            </div>
          )}
          {jineZapisy.length > 0 && (
            <div>
              {/* Část rodičů neřeší jiné jméno, ale jiný zápis: Teodor,
                  nebo Theodor? Je to skutečné rozhodnutí a katalog na něj
                  dosud neuměl odpovědět. */}
              <dt>Píše se také</dt>
              <dd>
                {jineZapisy.join(', ')}
                <span className="jmeno-poznamka">
                  Stejné jméno, jiný zápis. Matrika zapíše obojí — vybíráte,
                  jak bude vypadat na dokladech a jak ho přečtou v cizině.
                </span>
              </dd>
            </div>
          )}
          {e.domacky.length > 0 && (
            <div>
              <dt>Domácké tvary</dt>
              <dd>{e.domacky.join(', ')}</dd>
            </div>
          )}
          <div>
            <dt>Délka</dt>
            <dd>{e.delka} písmen, {e.slabiky} {e.slabiky === 1 ? 'slabika' : e.slabiky < 5 ? 'slabiky' : 'slabik'}</dd>
          </div>
          {vlna && (
            <div>
              <dt>Jak je na tom dnes</dt>
              <dd>
                <strong>{VLNA_INFO[vlna].stitek}</strong> — {VLNA_INFO[vlna].popis}{' '}
                <span className="jmeno-poznamka">
                  Redakční zařazení, revize {ROK_REVIZE}. Není to statistika ČSÚ —{' '}
                  <Link href="/metodika">jak k němu docházíme</Link>.
                </span>
              </dd>
            </div>
          )}
          <div>
            <dt>Redakční hodnocení líbivosti</dt>
            <dd>
              {e.oblibenost} ze 100 —{' '}
              <Link href="/metodika">jak ho počítáme</Link>
            </dd>
          </div>
        </dl>

        {/* Detail není konec cesty, ale pracovní stůl. Kdo se sem doklikal,
            už jméno zvažuje — a další seznam mu nepomůže. Potřebuje si ho
            vyzkoušet se svým příjmením a postavit vedle konkurenta. */}
        <section className="jmeno-nastroj">
          <h2>Jak {e.jmeno} zní u vás doma</h2>
          <p className="jmeno-nastroj-popis">
            Doplňte příjmení a uvidíte oslovení, iniciály, hláskování i to,
            jak jméno dopadne v cizině. Nikam se to neodesílá.
          </p>
          <TestJmena vychoziJmeno={e.jmeno} />
        </section>

        <section className="jmeno-nastroj">
          <h2>Zvažujete ještě jiné jméno?</h2>
          <p className="jmeno-nastroj-popis">
            Napište ho a postavíme je vedle sebe. Vítěze nevyhlásíme — ukážeme,
            čím se liší.
          </p>
          <PorovnaniJmen vychozi={[e.jmeno, '']} />
        </section>

        {dalsi.length > 0 && (
          <section className="jmeno-dalsi">
            <h2>Jména, která k němu ladí</h2>
            <p>Podobná délkou i rytmem — dobrá volba pro sourozence.</p>
            <ul>
              {dalsi.map(d => (
                <li key={d.slug}><Link href={`/jmeno/${d.slug}`}>{d.jmeno}</Link></li>
              ))}
            </ul>
          </section>
        )}

        <section className="jmeno-dalsi">
          <h2>Kam dál</h2>
          <ul>
            {proKoho.map(k => (
              <li key={k.slug}><Link href={`/jmena/${k.slug}`}>Jména pro {k.proKoho}</Link></li>
            ))}
            {zeme.slice(0, 3).map(z => (
              <li key={z.kod}><Link href={`/zeme/${z.kod}`}>{velke(z.pridavne)} jména</Link></li>
            ))}
          </ul>
        </section>
      </article>
    </Shell>
  )
}
