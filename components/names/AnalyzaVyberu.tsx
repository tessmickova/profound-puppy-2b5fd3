'use client'

// Podrobná analýza vybraných jmen — „podle nás i podle vás".
//
// Dvě půlky, které se nesmí míchat mlčky:
//  · „podle vás" počítá jen to, co rodina sama naklikala — srdíčka,
//    hvězdičky a barevné hlasy členů rodiny. Žádná naše chytristika.
//  · „podle nás" jsou naše pravidla ladění (styl, původ, rytmus, iniciály)
//    proti rodinnému profilu ze stránky /rodina.
// Výsledná shoda je průměr obou půlek — a u každé je vidět, z čeho vzešla,
// takže se dá s výsledkem nesouhlasit s plným vědomím proč.

import { useMemo } from 'react'
import Link from 'next/link'
import { ArrowRight, Heart, Star, Trophy, Users } from 'lucide-react'
import { JMENA } from '@/lib/names/data'
import { rodinnaHarmonie } from '@/lib/names/logic'
import type { ClenProShodu } from '@/lib/names/logic'
import { otevriDetail } from '@/lib/names/detail'
import { KATEGORIE_INFO } from '@/lib/names/types'
import { HLASUJICI, useVyber } from '@/lib/names/vyber'
import { useRodina } from '@/lib/names/rodina'
import { usePrepinace } from '@/lib/names/nastaveni'

/** Druhý pád rolí pro věty typu „jméno maminky". */
const KOHO: Record<string, string> = {
  maminka: 'maminky', tatinek: 'tatínka', dcera: 'dcery', syn: 'syna',
  pes: 'psa', fenka: 'fenky', kocour: 'kocoura', kocka: 'kočky', zvire: 'zvířete',
}
const KDO: Record<string, string> = {
  maminka: 'maminka', tatinek: 'tatínek', dcera: 'sourozenec', syn: 'sourozenec',
  pes: 'pes', fenka: 'fenka', kocour: 'kocour', kocka: 'kočka', zvire: 'zvíře',
}

/** Barva podle výše shody — zelená sedí, jantarová ujde, šedá je vlažná. */
const barvaShody = (b: number) => (b >= 80 ? '#4d8b5c' : b >= 60 ? '#c98a2e' : '#a2988a')

function Prouzek({ popisek, body }: { popisek: string; body: number }) {
  return (
    <div className="analyza-prouzek">
      <span className="analyza-prouzek-popisek">{popisek}</span>
      <span className="analyza-prouzek-drah" role="img" aria-label={`${popisek}: ${body} ze 100`}>
        <span style={{ width: `${body}%`, background: barvaShody(body) }} />
      </span>
      <span className="analyza-prouzek-cislo" style={{ color: barvaShody(body) }}>{body}</span>
    </div>
  )
}

export default function AnalyzaVyberu() {
  const { oblibena, jeHvezda, hlasyPro } = useVyber()
  const { clenove } = useRodina()
  const prepinace = usePrepinace()

  // Rodinný profil → vstup pro naše pravidla ladění. Bereme všechny členy —
  // i u zvířat dává smysl hlídat iniciály a záměnu jmen.
  const proShodu = useMemo<ClenProShodu[]>(() => clenove.map(c => ({
    jmeno: c.jmeno,
    kdo: KDO[c.role] ?? c.role,
    koho: KOHO[c.role] ?? `člena rodiny (${c.jmeno})`,
  })), [clenove])

  const rozbory = useMemo(() => {
    const vybrana = oblibena
      .map(id => JMENA.find(j => j.id === id))
      .filter((j): j is NonNullable<typeof j> => Boolean(j))

    return vybrana.map(j => {
      const hlasy = hlasyPro(j.id)
      const hvezda = jeHvezda(j.id)

      // Podle vás: srdíčko dostalo každé jméno tady (základ 40),
      // hvězdička je jasné znamení favorita (+20), každý hlas člena
      // rodiny +10. Maximum 100 = favorit, kterého chtějí všichni.
      const podleVas = Math.min(100, 40 + (hvezda ? 20 : 0) + hlasy.length * 10)

      const harmonie = proShodu.length ? rodinnaHarmonie(j, proShodu, JMENA) : null
      const celkem = harmonie ? Math.round((podleVas + harmonie.body) / 2) : podleVas

      return { j, hlasy, hvezda, podleVas, harmonie, celkem }
    }).sort((a, b) => b.celkem - a.celkem)
  }, [oblibena, hlasyPro, jeHvezda, proShodu])

  if (!prepinace.analyza_vyberu) {
    return (
      <div className="analyza-prazdno">
        <p>Tahle stránka je dočasně vypnutá správcem webu.</p>
        <Link href="/" className="vyber-tlacitko">Zpět na úvod</Link>
      </div>
    )
  }

  if (rozbory.length === 0) {
    return (
      <div className="analyza-prazdno">
        <Heart size={26} aria-hidden />
        <p>
          Zatím nemáte vybraná žádná jména. Klepněte u jmen na srdíčko —
          a tady pak uvidíte, jak moc každé z nich ladí do vaší rodiny.
        </p>
        <Link href="/" className="vyber-tlacitko je-hlavni">
          Začít vybírat <ArrowRight size={14} aria-hidden />
        </Link>
      </div>
    )
  }

  return (
    <div className="analyza">
      {proShodu.length === 0 && (
        <p className="analyza-upozorneni">
          <Users size={14} aria-hidden /> Půlka „podle nás" teď chybí: nevíme,
          kdo u vás doma je. <Link href="/rodina">Vyplňte rodinný profil</Link>
          {' '}a spočítáme i ladění se jmény, která už doma máte.
        </p>
      )}

      <ol className="analyza-seznam">
        {rozbory.map((r, i) => (
          <li key={r.j.id} className={`analyza-karta ${i === 0 ? 'je-vitez' : ''}`}>
            {i === 0 && (
              <p className="analyza-vitez-stitek">
                <Trophy size={13} aria-hidden /> největší shoda
              </p>
            )}
            <div className="analyza-hlava">
              <span className="analyza-poradi" aria-hidden>{i + 1}.</span>
              <button type="button" className="analyza-jmeno" onClick={() => otevriDetail(r.j.id)}>
                {r.j.jmeno}
                <span aria-hidden>{KATEGORIE_INFO[r.j.kategorie].emoji}</span>
              </button>
              {r.hvezda
                ? <Star size={15} className="analyza-znak je-hvezda" fill="currentColor" aria-label="Váš favorit" />
                : <Heart size={15} className="analyza-znak je-srdce" fill="currentColor" aria-label="Oblíbené" />}
              <span className="analyza-celkem" style={{ color: barvaShody(r.celkem) }}>
                {r.celkem}<small>/100</small>
              </span>
            </div>

            <Prouzek popisek="podle vás" body={r.podleVas} />
            {r.harmonie && <Prouzek popisek="podle nás" body={r.harmonie.body} />}

            <div className="analyza-hlasy">
              {r.hlasy.length
                ? HLASUJICI.filter(h => r.hlasy.includes(h.id)).map(h => (
                  <span key={h.id} className="analyza-hlas" style={{ ['--hlas-barva' as string]: h.barva }}>
                    {h.nazev}
                  </span>
                ))
                : <span className="analyza-hlas-nikdo">zatím bez hlasů rodiny — rozdejte je v panelu „Můj výběr"</span>}
            </div>

            {r.harmonie && r.harmonie.duvody.length > 0 && (
              <ul className="analyza-duvody">
                {r.harmonie.duvody.slice(0, 4).map((d, k) => <li key={k}>{d}</li>)}
              </ul>
            )}
          </li>
        ))}
      </ol>

      <p className="analyza-pozn">
        Jak se počítá: „podle vás" je jen z vašich srdíček, hvězdiček
        a hlasů členů rodiny (srdíčko 40, hvězdička +20, každý hlas +10).
        „Podle nás" jsou naše pravidla ladění se jmény z vašeho
        rodinného profilu — styl, původ, rytmus, iniciály a svátky.
        Celková shoda je průměr obou. Žádné statistiky si nevymýšlíme;
        všechno, z čeho číslo vzešlo, je vypsané u jména.
      </p>
    </div>
  )
}
