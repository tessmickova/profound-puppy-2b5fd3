'use client'

// Karta nalezené shody.
//
// Řádky mají pevné pořadí a pevnou výšku, takže vedle sebe stojící karty
// vypadají stejně bez ohledu na to, kolik štítků které jméno má. Proužek
// skóre je vždy stejně tenký — dřív se roztahoval podle zbylého místa
// v kartě, což u jedné karty udělalo tlustou pilulku a u vedlejší nic.

import { zemePodleKodu } from '@/lib/names/data'
import { numerologie } from '@/lib/names/logic'
import type { Shoda } from '@/lib/names/logic'
import { usePodrobnosti } from '@/lib/names/podrobnosti'
import { Hvezdicka, Srdicko, Stitky, Vyradit } from './NameCard'

export default function ShodaKarta({ shoda, poradi }: { shoda: Shoda; poradi: number }) {
  const zeme = zemePodleKodu(shoda.jmeno.zeme)
  const { ukazuje } = usePodrobnosti()
  const j = shoda.jmeno

  // Totéž jméno vede katalog zvlášť pro každou zemi. V nabídce je jednou,
  // ale ostatní země si zaslouží vlaječku — „Hugo 🇨🇿🇫🇷🇪🇸" říká víc než
  // třikrát Hugo pod sebou.
  const dalsiVlajky = (shoda.dalsiZeme ?? [])
    .map(kod => zemePodleKodu(kod))
    .filter((z): z is NonNullable<typeof z> => Boolean(z))

  return (
    <article className="karta-jmena karta-shoda">
      <div className="shoda-hlava">
        <h3 className="shoda-jmeno">
          <span className="shoda-poradi">{poradi}.</span>
          {j.jmeno}
          <span
            className="shoda-vlajka"
            title={[zeme?.nazev, ...dalsiVlajky.map(z => z.nazev)].filter(Boolean).join(', ')}
          >
            {zeme?.vlajka}{dalsiVlajky.map(z => z.vlajka).join('')}
          </span>
        </h3>
        <div className="shoda-vpravo">
          {ukazuje('skore') && (
            <span className="shoda-skore">
              {shoda.skore}<span className="shoda-ze-sta">/100</span>
            </span>
          )}
          {/* Stejná trojice jako na kartě v katalogu: vyřadit, favorit,
              oblíbené. Bez křížku se nedalo jméno zamítnout právě tam,
              kde je vidět nejčastěji — při hledání shody. */}
          <Vyradit id={j.id} jmeno={j.jmeno} />
          <Hvezdicka id={j.id} jmeno={j.jmeno} velke />
          <Srdicko id={j.id} jmeno={j.jmeno} velke />
        </div>
      </div>

      {ukazuje('skore') && (
        <div className="shoda-draha" role="img" aria-label={`Shoda ${shoda.skore} ze 100`}>
          <div className="shoda-vypln" style={{ width: `${shoda.skore}%` }} />
        </div>
      )}

      <div className="shoda-stitky empty:hidden">
        {shoda.rodinnyStitek && (
          <span className="stitek-rodina" title={shoda.rodinnyStitek.popis}>
            {shoda.rodinnyStitek.text}
          </span>
        )}
        <Stitky jmeno={j} />
      </div>

      {ukazuje('vyznam') && <p className="shoda-vyznam">{j.vyznam}</p>}

      {(() => {
        // Drobnosti se slévají do jednoho řádku — když si člověk všechny
        // vypne, řádek zmizí celý a karta se nesesype.
        const drobnosti: string[] = []
        if (ukazuje('cislo')) {
          const n = numerologie(j.jmeno)
          drobnosti.push(`číslo jména ${n.cislo} — ${n.vyznam}`)
        }
        if (ukazuje('svatek') && j.svatek) drobnosti.push(`svátek ${j.svatek}`)
        if (ukazuje('domacky') && j.domacky?.length) drobnosti.push(`doma: ${j.domacky.join(', ')}`)
        if (ukazuje('styl')) drobnosti.push(`${j.styly.join(', ')} · ${j.energie}`)
        if (ukazuje('oblibenost')) drobnosti.push(`oblíbenost ${j.popularita}/100`)
        if (ukazuje('delka')) drobnosti.push(`${j.delka} písmen · ${j.slabiky} slabiky`)
        if (!drobnosti.length) return null
        return <p className="shoda-drobnosti">{drobnosti.join(' · ')}</p>
      })()}

      {ukazuje('duvody') && shoda.duvody.length > 0 && (
        <ul className="shoda-duvody">
          {shoda.duvody.slice(0, 5).map((d, i) => (
            <li key={i}>{d}</li>
          ))}
        </ul>
      )}
    </article>
  )
}
