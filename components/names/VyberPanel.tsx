'use client'

// Panel „Můj výběr": všechna vybraná jména na jedné hromádce.
//
// Vysouvá se zprava do obsahu — ne přes celé okno. Reklamní sloupce
// zůstávají vidět, protože se za ně platí; panel se proto zastaví přesně
// tam, kde reklamy začínají. U každého jména je vidět, jestli je
// srdíčkové nebo hvězdičkové, a barevné pastilky říkají, kdo z rodiny ho
// chce: maminka červená, tatínek modrá, dcera růžová, syn světle modrá.
//
// Je to schválně extra jednoduché — klepnout na pastilku, hotovo. Podrobný
// rozbor patří na stránku analýzy, ne do panelu.

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { BarChart3, Heart, ListChecks, RotateCcw, Star, Users, X } from 'lucide-react'
import { JMENA } from '@/lib/names/data'
import { usePrepinace } from '@/lib/names/nastaveni'
import { HLASUJICI, useVyber } from '@/lib/names/vyber'
import { otevriDetail } from '@/lib/names/detail'
import { KATEGORIE_INFO } from '@/lib/names/types'

export default function VyberPanel() {
  const [otevren, setOtevren] = useState(false)
  /** Vybraná jména, nebo ta vyřazená — obojí patří k rozhodování. */
  const [zalozka, setZalozka] = useState<'vybrana' | 'vyrazena'>('vybrana')
  const obal = useRef<HTMLDivElement>(null)
  const prepinace = usePrepinace()
  const {
    oblibena, vyrazena, jeHvezda, hlasyPro, prepniHlas, hlasVsech,
    prepniOblibene, prepniVyrazene,
  } = useVyber()

  // Zavření klepnutím mimo panel a klávesou Esc.
  //
  // Dřív tuhle práci dělal ztmavovací závěs přes celé okno. Jenže ten
  // zároveň schoval reklamní sloupce — a ty musí být vidět pořád, protože
  // se za ně platí. Panel proto žádný závěs nemá a hlídá si to sám.
  useEffect(() => {
    if (!otevren) return
    const mimo = (e: MouseEvent) => {
      const cil = e.target as Node
      if (!obal.current?.contains(cil)) setOtevren(false)
    }
    const klavesa = (e: KeyboardEvent) => { if (e.key === 'Escape') setOtevren(false) }
    // `mousedown` až v další smyčce, ať zavření nechytí týž klik, který panel otevřel.
    const id = window.setTimeout(() => document.addEventListener('mousedown', mimo), 0)
    document.addEventListener('keydown', klavesa)
    return () => {
      window.clearTimeout(id)
      document.removeEventListener('mousedown', mimo)
      document.removeEventListener('keydown', klavesa)
    }
  }, [otevren])

  // Vypnuto z adminu — ouško ani panel se nevykreslí.
  if (!prepinace.vyber_panel) return null

  const podleId = (ids: string[]) => ids
    .map(id => JMENA.find(j => j.id === id))
    .filter((j): j is NonNullable<typeof j> => Boolean(j))

  const vybrana = podleId(oblibena)
    // favorité nahoru — hvězdička znamená „z tohohle vybíráme"
    .sort((a, b) => Number(jeHvezda(b.id)) - Number(jeHvezda(a.id)))
  const vyhozena = podleId(vyrazena)

  return (
    <div ref={obal}>
      <button
        type="button"
        className={`vyber-panel-ucho ${otevren ? 'je-skryte' : ''}`}
        onClick={() => setOtevren(true)}
        aria-label={`Otevřít můj výběr jmen (${oblibena.length})`}
      >
        <ListChecks size={16} aria-hidden />
        <span>Můj výběr</span>
        {oblibena.length > 0 && <span className="vyber-panel-pocet">{oblibena.length}</span>}
      </button>

      {otevren && (
        <aside className="vyber-panel" role="dialog" aria-label="Můj výběr jmen">
            <header className="vyber-panel-hlava">
              <h2><ListChecks size={17} aria-hidden /> Můj výběr</h2>
              <button onClick={() => setOtevren(false)} className="detail-zavrit" aria-label="Zavřít výběr">
                <X size={18} />
              </button>
            </header>

            <div className="vyber-panel-zalozky" role="tablist" aria-label="Co ukázat">
              <button
                type="button" role="tab"
                aria-selected={zalozka === 'vybrana'}
                className={zalozka === 'vybrana' ? 'je-aktivni' : ''}
                onClick={() => setZalozka('vybrana')}
              >
                Vybraná{oblibena.length > 0 && <span>{oblibena.length}</span>}
              </button>
              <button
                type="button" role="tab"
                aria-selected={zalozka === 'vyrazena'}
                className={zalozka === 'vyrazena' ? 'je-aktivni' : ''}
                onClick={() => setZalozka('vyrazena')}
              >
                Vyřazená{vyrazena.length > 0 && <span>{vyrazena.length}</span>}
              </button>
            </div>

            {zalozka === 'vyrazena' ? (
              vyhozena.length === 0 ? (
                <div className="vyber-panel-prazdno">
                  <RotateCcw size={22} aria-hidden />
                  <p>
                    Zatím jste nic nevyřadili. Křížek u jména ho schová ze všech
                    seznamů — a tady ho kdykoli vrátíte zpátky do hry.
                  </p>
                </div>
              ) : (
                <>
                  <p className="vyber-panel-napoveda">
                    <RotateCcw size={13} aria-hidden /> Tahle jména se nikde
                    nenabízejí. Klepnutím na šipku je vrátíte zpátky.
                  </p>
                  <ul className="vyber-panel-seznam">
                    {vyhozena.map(j => (
                      <li key={j.id} className="vyber-panel-polozka">
                        <div className="vyber-panel-radek">
                          <button type="button" className="vyber-panel-jmeno je-vyhozene" onClick={() => otevriDetail(j.id)}>
                            {j.jmeno}
                            <span className="vyber-panel-druh" aria-hidden>{KATEGORIE_INFO[j.kategorie].emoji}</span>
                          </button>
                          <button
                            type="button"
                            className="vyber-panel-vratit"
                            onClick={() => prepniVyrazene(j.id)}
                            aria-label={`Vrátit ${j.jmeno} zpátky mezi nabízená`}
                            title="Vrátit zpátky"
                          >
                            <RotateCcw size={14} aria-hidden />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </>
              )
            ) : vybrana.length === 0 ? (
              <div className="vyber-panel-prazdno">
                <Heart size={22} aria-hidden />
                <p>
                  Zatím tu nic není. Klepněte u kteréhokoli jména na srdíčko
                  a objeví se tady — hvězdička pak označí opravdové favority.
                </p>
              </div>
            ) : (
              <>
                <p className="vyber-panel-napoveda">
                  <Users size={13} aria-hidden /> Pastilkami označte, kdo z rodiny
                  jméno chce. Barvy: maminka, tatínek, dcera, syn.
                </p>

                <ul className="vyber-panel-seznam">
                  {vybrana.map(j => {
                    const hlasy = hlasyPro(j.id)
                    return (
                      <li key={j.id} className="vyber-panel-polozka">
                        <div className="vyber-panel-radek">
                          <button type="button" className="vyber-panel-jmeno" onClick={() => otevriDetail(j.id)}>
                            {jeHvezda(j.id)
                              ? <Star size={14} className="je-hvezda" fill="currentColor" aria-label="Favorit" />
                              : <Heart size={14} className="je-srdce" fill="currentColor" aria-label="Oblíbené" />}
                            {j.jmeno}
                            <span className="vyber-panel-druh" aria-hidden>{KATEGORIE_INFO[j.kategorie].emoji}</span>
                          </button>
                          <button
                            type="button"
                            className="vyber-panel-odebrat"
                            onClick={() => prepniOblibene(j.id)}
                            aria-label={`Odebrat ${j.jmeno} z výběru`}
                          >
                            <X size={13} aria-hidden />
                          </button>
                        </div>
                        <div className="vyber-panel-hlasy">
                          {HLASUJICI.map(h => {
                            const ma = hlasy.includes(h.id)
                            return (
                              <button
                                key={h.id}
                                type="button"
                                className={`vyber-hlas ${ma ? 'je-aktivni' : ''}`}
                                style={{ ['--hlas-barva' as string]: h.barva }}
                                onClick={() => prepniHlas(j.id, h.id)}
                                aria-pressed={ma}
                                aria-label={`${h.nazev} ${ma ? 'chce' : 'nechce'} jméno ${j.jmeno}`}
                                title={h.nazev}
                              >
                                {h.nazev[0]}
                              </button>
                            )
                          })}
                          <button
                            type="button"
                            className="vyber-hlas vyber-hlas-vsichni"
                            onClick={() => hlasVsech(j.id)}
                            aria-label={`Všichni chtějí jméno ${j.jmeno}`}
                            title="Všichni najednou"
                          >
                            ∀
                          </button>
                        </div>
                      </li>
                    )
                  })}
                </ul>

                <div className="vyber-panel-pata">
                  <Link href="/analyza-vyberu" className="vyber-tlacitko je-hlavni" onClick={() => setOtevren(false)}>
                    <BarChart3 size={15} aria-hidden /> Podrobná analýza výběru
                  </Link>
                  <Link href="/oblibene" className="vyber-tlacitko" onClick={() => setOtevren(false)}>
                    Celá stránka výběru
                  </Link>
                </div>
              </>
            )}
        </aside>
      )}
    </div>
  )
}
