'use client'

// Stavební prvky kompaktního filtru. Každý typ volby dostal ovládání, které
// se pro ni hodí prakticky: přepínač pro „právě jedna", chipy pro krátké
// výčty, select pro dlouhé seznamy, posuvník pro čísla a mřížku písmen
// pro abecedu.

import { ChevronDown, X } from 'lucide-react'
import type { ReactNode } from 'react'

export function Sekce({
  nazev, ikona, pocet, vychoziOtevrena = false, children,
}: {
  nazev: string
  ikona?: ReactNode
  /** kolik voleb je v sekci aktivních — ukáže se jako oranžová bublina */
  pocet?: number
  vychoziOtevrena?: boolean
  children: ReactNode
}) {
  return (
    <details className="filtr-sekce" open={vychoziOtevrena || (pocet ?? 0) > 0}>
      <summary>
        {ikona}
        {nazev}
        {(pocet ?? 0) > 0 && <span className="filtr-pocet">{pocet}</span>}
        <ChevronDown className="sipka" size={14} aria-hidden />
      </summary>
      <div className="obsah">{children}</div>
    </details>
  )
}

export function Chip({
  aktivni, onClick, children, title,
}: {
  aktivni: boolean
  onClick: () => void
  children: ReactNode
  title?: string
}) {
  return (
    <button
      type="button"
      title={title}
      aria-pressed={aktivni}
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[12.5px] transition-colors ${
        aktivni
          ? 'border-[#2b2723] bg-[#2b2723] text-[#faf6ef]'
          : 'border-[#e8dfd2] bg-white text-[#6b6156] hover:border-[#c4b8a7]'
      }`}
    >
      {children}
    </button>
  )
}

export function Chipy({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap gap-1.5">{children}</div>
}

/** Přepínač pro volby, kde platí právě jedna (pohlaví, pro koho). */
export function Prepinac<T extends string>({
  hodnota, moznosti, onZmena,
}: {
  hodnota: T
  moznosti: { id: T; nazev: string; ikona?: ReactNode; title?: string }[]
  onZmena: (h: T) => void
}) {
  return (
    <div className="prepinac" role="group">
      {moznosti.map(m => (
        <button
          key={m.id}
          type="button"
          title={m.title}
          aria-pressed={hodnota === m.id}
          onClick={() => onZmena(m.id)}
        >
          {m.ikona}
          {m.nazev}
        </button>
      ))}
    </div>
  )
}

/** Posuvník s popiskem — pro maximální délku či počet slabik. */
export function Posuvnik({
  popisek, hodnota, min, max, jednotka, onZmena,
}: {
  popisek: string
  /** null = bez omezení (posuvník je na maximu) */
  hodnota: number | null
  min: number
  max: number
  jednotka: string
  onZmena: (h: number | null) => void
}) {
  const aktualni = hodnota ?? max
  return (
    <label className="block">
      <span className="mb-1 flex items-center justify-between text-[12px] text-[#6b6156]">
        {popisek}
        <strong className="font-semibold text-[#2b2723]">
          {hodnota === null ? 'bez omezení' : `do ${hodnota} ${jednotka}`}
        </strong>
      </span>
      <input
        type="range"
        className="posuvnik"
        min={min}
        max={max}
        value={aktualni}
        onChange={e => {
          const v = Number(e.target.value)
          onZmena(v >= max ? null : v)
        }}
      />
    </label>
  )
}

/** Kompaktní mřížka písmen A–Ž. */
export function PismenaMrizka({
  pismena, vybrane, onVyber,
}: {
  pismena: string[]
  vybrane: string | null
  onVyber: (p: string | null) => void
}) {
  return (
    <div className="pismena">
      <button
        type="button"
        aria-pressed={vybrane === null}
        onClick={() => onVyber(null)}
        title="Všechna písmena"
      >
        vše
      </button>
      {pismena.map(p => (
        <button
          key={p}
          type="button"
          aria-pressed={vybrane === p}
          onClick={() => onVyber(vybrane === p ? null : p)}
        >
          {p}
        </button>
      ))}
    </div>
  )
}

/** Vícenásobný výběr v selectu — pro dlouhé seznamy (země). */
export function VyberZemi({
  zeme, vybrane, onPrepni, onVymaz,
}: {
  zeme: { kod: string; nazev: string; vlajka: string }[]
  vybrane: string[]
  onPrepni: (kod: string) => void
  onVymaz: () => void
}) {
  return (
    <div>
      <select
        value=""
        onChange={e => e.target.value && onPrepni(e.target.value)}
        className="w-full rounded-xl border border-[#e8dfd2] bg-[#faf6ef] px-3 py-2 text-[13px] outline-none focus:border-[#2b2723]"
        aria-label="Přidat zemi do filtru"
      >
        <option value="">+ přidat zemi…</option>
        {zeme.filter(z => !vybrane.includes(z.kod)).map(z => (
          <option key={z.kod} value={z.kod}>{z.vlajka} {z.nazev}</option>
        ))}
      </select>
      {vybrane.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {vybrane.map(kod => {
            const z = zeme.find(x => x.kod === kod)
            return (
              <button
                key={kod}
                type="button"
                onClick={() => onPrepni(kod)}
                className="inline-flex items-center gap-1 rounded-full bg-[#2b2723] px-2.5 py-1 text-[12px] text-[#faf6ef]"
              >
                {z?.vlajka} {z?.nazev} <X size={11} aria-hidden />
              </button>
            )
          })}
          <button type="button" onClick={onVymaz} className="text-[12px] text-[#8a7f71] underline decoration-dotted">
            vymazat
          </button>
        </div>
      )}
    </div>
  )
}

/** Lišta aktivních filtrů nad výsledky — každý jde odebrat jedním klikem. */
export function AktivniFiltry({
  polozky,
}: {
  polozky: { klic: string; popis: string; zrus: () => void }[]
}) {
  if (!polozky.length) return null
  return (
    <div className="aktivni-filtry">
      {polozky.map(p => (
        <button key={p.klic} type="button" onClick={p.zrus} title="Odebrat filtr">
          {p.popis} <X size={11} aria-hidden />
        </button>
      ))}
    </div>
  )
}
