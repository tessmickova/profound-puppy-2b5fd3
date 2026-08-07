// Krátké odpovědi na otázky, které lidé kolem jmen skutečně pokládají.
//
// Nejde o výplň kvůli vyhledávačům: jazykové modely citují to, co na stránce
// najdou jako hotovou, uzavřenou větu. Proto je odpověď hned pod otázkou,
// má dvě až tři věty a dá se vytrhnout bez ztráty smyslu. Totéž pak jde
// stránkou ještě jednou jako strukturovaná data.

import type { Odpoved } from '@/lib/names/seo'

export default function RychleOdpovedi({
  odpovedi, nadpis = 'Krátké odpovědi',
}: {
  odpovedi: Odpoved[]
  nadpis?: string
}) {
  return (
    <section className="odpovedi" aria-labelledby="odpovedi-nadpis">
      <h2 id="odpovedi-nadpis" className="odpovedi-nadpis">{nadpis}</h2>
      <div className="odpovedi-mrizka">
        {odpovedi.map(o => (
          <article key={o.otazka} className="odpoved">
            <h3>{o.otazka}</h3>
            <p>{o.odpoved}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
