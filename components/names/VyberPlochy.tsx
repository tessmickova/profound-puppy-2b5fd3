'use client'

// Interaktivní náhled reklamních ploch.
//
// Zákazník vidí zmenšený web s dvaceti plochami a klepnutím si vybere přesně
// tu, kterou kupuje — ne jméno v seznamu, ale to konkrétní místo. Přepínač
// „strana A / strana B" ukazuje, jak se pozice po patnácti sekundách překlopí.
//
// Volné a obsazené plochy si tahá z reklamní služby. Když neodpoví, náhled
// zůstane a jen se u ploch nepíše, jestli jsou volné — koupit se dá stejně.

import { useEffect, useMemo, useState } from 'react'
import { Check, Loader2 } from 'lucide-react'
import { CENA_MESIC_KC, OBDOBI, PLOCH, POZIC, ROTACE_SLOUPCE_MS, cenaKc, type ObdobiId } from '@/shared/reklama'
import { ADRESA_REKLAM } from '@/lib/names/reklamniServer'
import { PRAVNI } from '@/lib/names/pravni'

/** Kam psát, když reklamní služba není po ruce. */
const EMAIL = PRAVNI.emailReklama

/** Ceník i délky kampaní jsou v `shared/reklama.ts` — tady se jen čtou. */
const CENA_MESIC = CENA_MESIC_KC

interface Slot {
  id: string
  nazev: string
  stranka: string
  volno: number
}

const cislo = (id: string) => Number(id.replace('plocha-', ''))
/** Plochy jedné pozice: lichá je strana A, sudá strana B. */
const plochaPozice = (pozice: number, strana: 'a' | 'b') =>
  `plocha-${pozice * 2 - (strana === 'a' ? 1 : 0)}`

const korun = (c: number) => c.toLocaleString('cs-CZ')

export default function VyberPlochy() {
  const [sloty, setSloty] = useState<Record<string, Slot> | null>(null)
  const [nacita, setNacita] = useState(Boolean(ADRESA_REKLAM))
  const [strana, setStrana] = useState<'a' | 'b'>('a')
  const [vybrano, setVybrano] = useState<string | null>(null)
  const [obdobi, setObdobi] = useState<ObdobiId>('mesic')

  useEffect(() => {
    if (!ADRESA_REKLAM) return
    let zive = true
    fetch(`${ADRESA_REKLAM}/api/sloty`, { cache: 'no-store' })
      .then(o => (o.ok ? o.json() : null))
      .then((d: { plochy?: Slot[] } | null) => {
        if (!zive) return
        if (d?.plochy) setSloty(Object.fromEntries(d.plochy.map(p => [p.id, p])))
        setNacita(false)
      })
      .catch(() => { if (zive) setNacita(false) })
    return () => { zive = false }
  }, [])

  const pozice = useMemo(() => Array.from({ length: POZIC }, (_, i) => i + 1), [])
  const vlevo = pozice.slice(0, POZIC / 2)
  const vpravo = pozice.slice(POZIC / 2)

  const celkem = cenaKc(obdobi)
  const vybranySlot = vybrano ? sloty?.[vybrano] : null
  const obsazena = Boolean(vybrano && vybranySlot && vybranySlot.volno === 0)

  const odkazNaObjednavku = vybrano && ADRESA_REKLAM
    ? `${ADRESA_REKLAM}/?plocha=${encodeURIComponent(vybrano)}&obdobi=${obdobi}`
    : null

  const dlazdice = (p: number) => {
    const id = plochaPozice(p, strana)
    const c = cislo(id)
    const slot = sloty?.[id]
    const volna = !slot || slot.volno > 0
    const jeVybrana = vybrano === id
    return (
      <button
        key={id}
        type="button"
        onClick={() => setVybrano(jeVybrana ? null : id)}
        aria-pressed={jeVybrana}
        className={`plochy-dlazdice ${volna ? '' : 'je-obsazena'} ${jeVybrana ? 'je-vybrana' : ''}`}
      >
        <span className="plochy-cislo">{c}</span>
        <span className="plochy-stav">
          {jeVybrana && <Check size={12} aria-hidden />}
          {volna ? 'volná' : 'obsazená'}
        </span>
      </button>
    )
  }

  return (
    <section className="plochy-vyber">
      <div className="plochy-hlava">
        <div>
          <h2 className="plochy-nadpis">Vyberte si své místo</h2>
          <p className="plochy-popis">
            Web má {POZIC} pozic — polovina vlevo, polovina vpravo. Každá se po{' '}
            {ROTACE_SLOUPCE_MS / 1000} sekundách překlopí na druhou stranu, kde je
            jiná kampaň. Ploch je proto {PLOCH} a každá je samostatně k mání.
          </p>
        </div>
        <div className="plochy-strany" role="group" aria-label="Strana pozice">
          {(['a', 'b'] as const).map(s => (
            <button
              key={s}
              type="button"
              onClick={() => setStrana(s)}
              aria-pressed={strana === s}
              className={strana === s ? 'je-aktivni' : ''}
            >
              strana {s.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="plochy-nahled">
        <div className="plochy-sloupec">{vlevo.map(dlazdice)}</div>
        <div className="plochy-telo" aria-hidden>
          <span className="plochy-telo-pruh" />
          <span className="plochy-telo-pruh je-kratsi" />
          <p className="plochy-telo-popis">obsah webu</p>
          <span className="plochy-telo-pruh" />
          <span className="plochy-telo-pruh je-kratsi" />
        </div>
        <div className="plochy-sloupec">{vpravo.map(dlazdice)}</div>
      </div>

      <p className="plochy-poznamka">
        Na telefonu se sloupce schovají a stejné kampaně jedou v úzké liště
        nahoře — plocha se platí jednou a vidí ji všichni.
        {nacita && <> <Loader2 size={12} className="plochy-tocitko" aria-hidden /> zjišťujeme, které jsou volné…</>}
      </p>

      <div className="plochy-koupe">
        <div className="plochy-koupe-radek">
          <span className="plochy-koupe-popisek">Vybraná plocha</span>
          <strong>{vybrano ? `Plocha ${cislo(vybrano)} — ${sloty?.[vybrano]?.stranka ?? popisMista(vybrano)}` : 'zatím žádná'}</strong>
        </div>

        <div className="plochy-koupe-radek">
          <span className="plochy-koupe-popisek">Na jak dlouho</span>
          <div className="plochy-obdobi" role="group" aria-label="Délka kampaně">
            {OBDOBI.map(o => (
              <button
                key={o.id}
                type="button"
                onClick={() => setObdobi(o.id)}
                aria-pressed={obdobi === o.id}
                className={obdobi === o.id ? 'je-aktivni' : ''}
              >
                {o.nazev}
              </button>
            ))}
          </div>
        </div>

        <div className="plochy-koupe-radek">
          <span className="plochy-koupe-popisek">Cena</span>
          <strong className="plochy-cena">{korun(celkem)} Kč</strong>
          <span className="plochy-cena-pozn">bez DPH · {korun(CENA_MESIC)} Kč za měsíc</span>
        </div>

        {obsazena && (
          <p className="plochy-obsazena">
            Tahle plocha je právě obsazená. Vyberte jinou — nebo nám napište
            a dáme vědět, až se uvolní.
          </p>
        )}

        {!vybrano || obsazena ? (
          <button type="button" className="plochy-tlacitko" disabled>
            {obsazena ? 'Tahle plocha je obsazená' : 'Vyberte plochu v náhledu'}
          </button>
        ) : odkazNaObjednavku ? (
          <a className="plochy-tlacitko" href={odkazNaObjednavku}>
            Koupit plochu {cislo(vybrano)} na {OBDOBI.find(o => o.id === obdobi)!.nazev} <span aria-hidden>→</span>
          </a>
        ) : (
          // Bez připojené reklamní služby (vývoj) pošleme zákazníka e-mailem —
          // předvyplníme, co si vybral, ať to nemusí opisovat.
          <a
            className="plochy-tlacitko"
            href={`mailto:${EMAIL}?subject=${encodeURIComponent(`Reklama — plocha ${cislo(vybrano)}`)}&body=${encodeURIComponent(
              `Dobrý den,\nmáme zájem o plochu ${cislo(vybrano)} (${popisMista(vybrano)}) na ${OBDOBI.find(o => o.id === obdobi)!.nazev}, tedy za ${korun(celkem)} Kč bez DPH.\n\n`,
            )}`}
          >
            Poptat plochu {cislo(vybrano)} na {OBDOBI.find(o => o.id === obdobi)!.nazev} <span aria-hidden>→</span>
          </a>
        )}
      </div>
    </section>
  )
}

/** Popis místa, když reklamní služba neodpověděla a nemáme její text. */
function popisMista(id: string): string {
  const c = cislo(id)
  const pozice = Math.ceil(c / 2)
  const sloupec = pozice <= POZIC / 2 ? 'levý' : 'pravý'
  const vSloupci = pozice <= POZIC / 2 ? pozice : pozice - POZIC / 2
  return `${sloupec} sloupec, ${vSloupci}. shora, strana ${c % 2 === 1 ? 'A' : 'B'}`
}
