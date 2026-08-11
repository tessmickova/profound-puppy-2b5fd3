'use client'

// Panel s detailem jména — vysune se zprava po kliknutí na kartu.
// Karta ukazuje jen jméno; všechno ostatní patří sem.

import { useEffect } from 'react'
import { X } from 'lucide-react'
import { JMENA, jeMezinarodni, zemePodleKodu } from '@/lib/names/data'
import { JMENA_V_CESKU } from '@/lib/names/vCesku'
import { jeHit, numerologie, rychlaAnalyza } from '@/lib/names/logic'
import { osloveni, zdrobneliny } from '@/lib/names/cestina'
import { vlnaJmena } from '@/lib/names/vlny'
import { KATEGORIE_INFO, POHLAVI_INFO, VLNA_INFO } from '@/lib/names/types'
import { useDetail } from '@/lib/names/detail'
import { useOblibene } from '@/lib/names/oblibene'

const NUMEROLOGIE_POPIS: Record<number, string> = {
  1: 'Jde si za svým a vede ostatní. Samostatnost, odvaha, chuť být první.',
  2: 'Umí naslouchat a hledat shodu. Citlivost, takt, síla v klidu.',
  3: 'Tvoří, mluví, baví. Fantazie, humor a chuť sdílet.',
  4: 'Staví na pevných základech. Pořádek, vytrvalost, spolehlivost.',
  5: 'Potřebuje pohyb a změnu. Zvědavost, svoboda, chuť poznávat.',
  6: 'Pečuje o druhé a drží rodinu pohromadě. Vřelost a odpovědnost.',
  7: 'Přemýšlí do hloubky. Klid, pozorování, vlastní vnitřní svět.',
  8: 'Umí rozhodovat a nést následky. Cílevědomost a přirozená autorita.',
  9: 'Vidí dál než na špičku nosu. Velkorysost, ideály, soucit.',
}

export default function DetailPanel() {
  const { id, zavri } = useDetail()
  const { je, prepni } = useOblibene()

  useEffect(() => {
    if (!id) return
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') zavri() }
    window.addEventListener('keydown', esc)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', esc)
      document.body.style.overflow = ''
    }
  }, [id, zavri])

  const jmeno = id ? JMENA.find(j => j.id === id) : null
  if (!jmeno) return null

  const zeme = zemePodleKodu(jmeno.zeme)
  const kat = KATEGORIE_INFO[jmeno.kategorie]
  const num = numerologie(jmeno.jmeno)
  const vCesku = JMENA_V_CESKU.includes(jmeno.jmeno)
  const postrehy = rychlaAnalyza(jmeno, vCesku)
  const rodZensky = ['holka', 'fenka', 'kocka'].includes(jmeno.kategorie)
    || jmeno.pohlavi === 'samice'
  const mazlive = zdrobneliny(jmeno.jmeno, rodZensky, jmeno.domacky ?? [])
  const oblibene = je(jmeno.id)
  const vlna = vlnaJmena(jmeno)

  const stitky = [
    vlna && { text: VLNA_INFO[vlna].stitek, trida: VLNA_INFO[vlna].trida },
    jeHit(jmeno) && { text: 'hit', trida: 'bg-[#fdeaea] text-[#b3403a]' },
    jeMezinarodni(jmeno) && { text: 'mezinárodní', trida: 'bg-[#e4f0f4] text-[#2f6f84]' },
    jmeno.unisex && { text: 'unisex', trida: 'bg-[#eef2e4] text-[#5f7233]' },
  ].filter(Boolean) as { text: string; trida: string }[]

  return (
    <>
      <div className="detail-zaves" onClick={zavri} aria-hidden />

      <aside className="detail-panel" role="dialog" aria-modal="true" aria-label={`Detail jména ${jmeno.jmeno}`}>
        <header className="detail-hlava">
          <div>
            <p className="text-[12px] font-medium uppercase tracking-wide text-[#a2988a]">
              {kat.nazev}
              {jmeno.pohlavi && jmeno.pohlavi !== 'unisex' && ` ${POHLAVI_INFO[jmeno.pohlavi].znak}`}
              {' · '}{zeme?.vlajka} {zeme?.nazev}
            </p>
            <h2 className="[font-family:var(--font-nadpis)] text-[30px] font-extrabold leading-tight">
              {jmeno.jmeno}
            </h2>
          </div>
          <button onClick={zavri} className="detail-zavrit" aria-label="Zavřít detail">
            <X size={18} />
          </button>
        </header>

        <div className="detail-telo">
          {stitky.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-1.5">
              {stitky.map(s => (
                <span key={s.text} className={`rounded-full px-2.5 py-1 text-[11.5px] font-semibold ${s.trida}`}>
                  {s.text}
                </span>
              ))}
            </div>
          )}

          <section className="detail-sekce">
            <h3>Význam</h3>
            <p className="text-[15px] leading-relaxed text-[#4d443a]">{jmeno.vyznam}</p>
          </section>

          <section className="detail-sekce">
            <h3>Jak se volá a zdrobňuje</h3>
            <dl className="detail-postrehy">
              <div>
                <dt>Zavoláte</dt>
                <dd><strong className="text-[#2b2723]">{osloveni(jmeno.jmeno)}!</strong></dd>
              </div>
              {mazlive.bezne.length > 0 && (
                <div>
                  <dt>Doma se řekne</dt>
                  <dd>{mazlive.bezne.join(', ')}</dd>
                </div>
              )}
              {mazlive.hrave.length > 0 && (
                <div>
                  <dt>Mazlivě a hravě</dt>
                  <dd>{mazlive.hrave.join(', ')}</dd>
                </div>
              )}
            </dl>
            <p className="mt-1.5 text-[12px] text-[#a2988a]">
              Návrhy podle českých vzorů — vlastní přezdívka je vždycky nejlepší.
            </p>
          </section>

          <section className="detail-sekce">
            <h3>Rychlá analýza</h3>
            <dl className="detail-postrehy">
              {postrehy.map(p => (
                <div key={p.popisek}>
                  <dt>{p.popisek}</dt>
                  <dd>
                    {p.hodnota}
                    {p.tip && <span className="detail-tip"> — {p.tip}</span>}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="detail-sekce">
            <h3>Numerologie</h3>
            <div className="flex items-start gap-3">
              <span className="detail-cislo">{num.cislo}</span>
              <div>
                <p className="text-[15px] font-semibold text-[#2b2723]">{num.vyznam}</p>
                <p className="mt-1 text-[13.5px] leading-relaxed text-[#6b6156]">
                  {NUMEROLOGIE_POPIS[num.cislo]}
                </p>
              </div>
            </div>
            <p className="mt-2.5 text-[11.5px] text-[#a2988a]">
              Číslo vzniká součtem písmen podle pythagorejské soustavy. Berte to jako hru, ne jako věštbu.
            </p>
          </section>

          <section className="detail-sekce">
            <h3>Líbivost</h3>
            <div className="flex items-center gap-3">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#f3ecdf]">
                <div className="h-full rounded-full bg-linear-to-r from-[#e7a15c] to-[#d97757]" style={{ width: `${jmeno.popularita}%` }} />
              </div>
              <span className="[font-family:var(--font-nadpis)] text-lg font-extrabold text-[#d97757]">
                {jmeno.popularita}
              </span>
            </div>
          </section>
        </div>

        <footer className="detail-pata">
          <button
            onClick={() => prepni(jmeno.id)}
            className={`detail-srdce ${oblibene ? 'je-ulozene' : ''}`}
          >
            {oblibene ? '❤️ Uloženo mezi oblíbená' : '🤍 Uložit mezi oblíbená'}
          </button>
        </footer>
      </aside>
    </>
  )
}
