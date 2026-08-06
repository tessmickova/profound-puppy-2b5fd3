'use client'

// Nejpodrobnější filtr jmen pro zvířata: druh, země, plemeno, způsob života,
// styl, energie, velikost, písmeno, délka, slabiky, hledání + řazení.

import { useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { JMENA, ZEME } from '@/lib/names/data'
import { PLEMENA_KOCEK, PLEMENA_PSU, VSECHNA_PLEMENA } from '@/lib/names/breeds'
import {
  filtruj, jeHit, jeOriginal, jeTrendy, jmenaProPlemeno, kolator, PRAZDNY_FILTR,
  RAZENI_MOZNOSTI, serad, ZPUSOBY_ZIVOTA,
} from '@/lib/names/logic'
import { useOblibene } from '@/lib/names/oblibene'
import type { Filtr, Razeni } from '@/lib/names/logic'
import { KATEGORIE_INFO, VSECHNY_STYLY } from '@/lib/names/types'
import type { Energie, Kategorie, Velikost } from '@/lib/names/types'
import NameCard from './NameCard'

const ZVIRECI_KATEGORIE: Kategorie[] = ['pes', 'fenka', 'kocour', 'kocka', 'kun', 'kralik', 'papousek', 'krecek']
const ENERGIE: Energie[] = ['klidná', 'vyvážená', 'živá']
const VELIKOSTI: Velikost[] = ['malé', 'střední', 'velké']

function Chip({ aktivni, onClick, children, title }: {
  aktivni: boolean; onClick: () => void; children: React.ReactNode; title?: string
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-sm transition-colors ${
        aktivni
          ? 'border-[#2b2723] bg-[#2b2723] text-[#faf6ef]'
          : 'border-[#e8dfd2] bg-white text-[#6b6156] hover:border-[#c4b8a7]'
      }`}
    >
      {children}
    </button>
  )
}

function Sekce({ nazev, children }: { nazev: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-[#8a7f71]">{nazev}</p>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  )
}

const prepni = <T,>(pole: T[], hodnota: T): T[] =>
  pole.includes(hodnota) ? pole.filter(x => x !== hodnota) : [...pole, hodnota]

export default function ZvirataFinder() {
  const params = useSearchParams()
  const [filtr, setFiltr] = useState<Filtr>(() => ({
    ...PRAZDNY_FILTR,
    zeme: params.get('zeme') ? [params.get('zeme')!] : [],
    kategorie: params.get('kategorie') ? [params.get('kategorie') as Kategorie] : [],
  }))
  const [razeni, setRazeni] = useState<Razeni | 'doporucene'>('popularita')
  const [plemeno, setPlemeno] = useState<string>('')
  const [zivot, setZivot] = useState<string>('')
  const [rychle, setRychle] = useState<string[]>([])
  const { ids: oblibena } = useOblibene()

  const vybranePlemeno = VSECHNA_PLEMENA.find(p => p.nazev === plemeno)
  const vybranyZivot = ZPUSOBY_ZIVOTA.find(z => z.id === zivot)

  const zakladni = useMemo(() => JMENA.filter(j => ZVIRECI_KATEGORIE.includes(j.kategorie)), [])

  const vysledky = useMemo(() => {
    // plemeno určuje druh, velikost a pořadí „doporučené"
    let kandidati = vybranePlemeno ? jmenaProPlemeno(zakladni, vybranePlemeno) : zakladni
    const f: Filtr = {
      ...filtr,
      kategorie: vybranePlemeno ? [] : filtr.kategorie,
      velikosti: vybranePlemeno ? [] : filtr.velikosti,
      energie: filtr.energie.length ? filtr.energie : (vybranyZivot?.energie ?? []),
      styly: filtr.styly.length ? filtr.styly : (vybranyZivot?.styly ?? []),
    }
    if (!vybranePlemeno && vybranyZivot?.velikosti.length && !filtr.velikosti.length) {
      f.velikosti = vybranyZivot.velikosti
    }
    kandidati = filtruj(kandidati, f)
    if (rychle.includes('srdce')) kandidati = kandidati.filter(j => oblibena.includes(j.id))
    if (rychle.includes('hit')) kandidati = kandidati.filter(jeHit)
    if (rychle.includes('trendy')) kandidati = kandidati.filter(jeTrendy)
    if (rychle.includes('original')) kandidati = kandidati.filter(jeOriginal)
    if (razeni === 'doporucene') return kandidati // pořadí z jmenaProPlemeno
    return serad(kandidati, razeni)
  }, [zakladni, filtr, razeni, vybranePlemeno, vybranyZivot, rychle, oblibena])

  const dostupnaPismena = useMemo(() => {
    const set = new Set(zakladni.map(j => j.jmeno[0].toUpperCase()))
    return [...set].sort((a, b) => kolator.compare(a, b))
  }, [zakladni])

  const abecedne = razeni === 'abecedne' || razeni === 'abecedne-z'
  const skupiny = useMemo(() => {
    if (!abecedne) return null
    const mapa = new Map<string, typeof vysledky>()
    for (const j of vysledky) {
      const p = j.jmeno[0].toUpperCase()
      if (!mapa.has(p)) mapa.set(p, [])
      mapa.get(p)!.push(j)
    }
    return [...mapa.entries()]
  }, [vysledky, abecedne])

  const reset = () => { setFiltr(PRAZDNY_FILTR); setPlemeno(''); setZivot(''); setRychle([]); setRazeni('popularita') }

  return (
    <div className="grid gap-8 lg:grid-cols-[300px,1fr]">
      <aside className="space-y-5 self-start rounded-3xl border border-[#e8dfd2] bg-white p-5 shadow-sm lg:sticky lg:top-20">
        <div className="flex items-center justify-between">
          <h2 className="[font-family:var(--font-syne)] text-lg font-bold">Filtr</h2>
          <button onClick={reset} className="text-xs text-[#8a7f71] underline decoration-dotted hover:text-[#2b2723]">
            Vymazat vše
          </button>
        </div>

        <input
          type="search"
          value={filtr.hledat}
          onChange={e => setFiltr({ ...filtr, hledat: e.target.value })}
          placeholder="Hledat jméno či význam…"
          className="w-full rounded-full border border-[#e8dfd2] bg-[#faf6ef] px-4 py-2 text-sm outline-none focus:border-[#2b2723]"
        />

        <Sekce nazev="Rychlé výběry">
          <Chip aktivni={rychle.includes('srdce')} onClick={() => setRychle(prepni(rychle, 'srdce'))} title="Jen jména, která jste si označili srdíčkem">❤️ oblíbená</Chip>
          <Chip aktivni={rychle.includes('hit')} onClick={() => setRychle(prepni(rychle, 'hit'))} title="Dlouhodobě nejoblíbenější jména">🔥 hity</Chip>
          <Chip aktivni={rychle.includes('trendy')} onClick={() => setRychle(prepni(rychle, 'trendy'))} title="Moderní jména, která právě letí">📈 trendy</Chip>
          <Chip aktivni={rychle.includes('original')} onClick={() => setRychle(prepni(rychle, 'original'))} title="Méně obvyklá, ale krásná — skryté poklady">💎 originální</Chip>
        </Sekce>

        <Sekce nazev="Kdo dostane jméno">
          {ZVIRECI_KATEGORIE.map(k => (
            <Chip key={k} aktivni={filtr.kategorie.includes(k)} onClick={() => setFiltr({ ...filtr, kategorie: prepni(filtr.kategorie, k) })}>
              {KATEGORIE_INFO[k].emoji} {KATEGORIE_INFO[k].mnozne}
            </Chip>
          ))}
        </Sekce>

        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-[#8a7f71]">Plemeno</p>
          <select
            value={plemeno}
            onChange={e => { setPlemeno(e.target.value); if (e.target.value) setRazeni('doporucene') }}
            className="w-full rounded-xl border border-[#e8dfd2] bg-[#faf6ef] px-3 py-2 text-sm outline-none focus:border-[#2b2723]"
          >
            <option value="">— bez výběru plemene —</option>
            <optgroup label="Psí plemena">
              {PLEMENA_PSU.map(p => <option key={p.nazev} value={p.nazev}>{p.nazev}</option>)}
            </optgroup>
            <optgroup label="Kočičí plemena">
              {PLEMENA_KOCEK.map(p => <option key={p.nazev} value={p.nazev}>{p.nazev}</option>)}
            </optgroup>
          </select>
          {vybranePlemeno && (
            <p className="mt-2 rounded-xl bg-[#f3ecdf] p-2.5 text-xs text-[#6b6156]">{vybranePlemeno.popis}</p>
          )}
        </div>

        <Sekce nazev="Váš způsob života">
          {ZPUSOBY_ZIVOTA.map(z => (
            <Chip key={z.id} aktivni={zivot === z.id} onClick={() => setZivot(zivot === z.id ? '' : z.id)} title={z.popis}>
              {z.emoji} {z.nazev}
            </Chip>
          ))}
        </Sekce>
        {vybranyZivot && (
          <p className="rounded-xl bg-[#e8f0e6] p-2.5 text-xs text-[#4f6a4a]">{vybranyZivot.popis}</p>
        )}

        <Sekce nazev="Země původu">
          {ZEME.map(z => (
            <Chip key={z.kod} aktivni={filtr.zeme.includes(z.kod)} onClick={() => setFiltr({ ...filtr, zeme: prepni(filtr.zeme, z.kod) })} title={z.nazev}>
              {z.vlajka} {z.nazev}
            </Chip>
          ))}
        </Sekce>

        <Sekce nazev="Styl jména">
          {VSECHNY_STYLY.map(s => (
            <Chip key={s} aktivni={filtr.styly.includes(s)} onClick={() => setFiltr({ ...filtr, styly: prepni(filtr.styly, s) })}>
              {s}
            </Chip>
          ))}
        </Sekce>

        <Sekce nazev="Povaha / energie">
          {ENERGIE.map(e => (
            <Chip key={e} aktivni={filtr.energie.includes(e)} onClick={() => setFiltr({ ...filtr, energie: prepni(filtr.energie, e) })}>
              {e}
            </Chip>
          ))}
        </Sekce>

        {!vybranePlemeno && (
          <Sekce nazev="Velikost plemene (psi)">
            {VELIKOSTI.map(v => (
              <Chip key={v} aktivni={filtr.velikosti.includes(v)} onClick={() => setFiltr({ ...filtr, velikosti: prepni(filtr.velikosti, v) })}>
                {v}
              </Chip>
            ))}
          </Sekce>
        )}

        <div className="grid grid-cols-2 gap-3">
          <label className="block text-xs font-semibold uppercase tracking-wide text-[#8a7f71]">
            Max. délka
            <select
              value={filtr.maxDelka ?? ''}
              onChange={e => setFiltr({ ...filtr, maxDelka: e.target.value ? Number(e.target.value) : null })}
              className="mt-1 w-full rounded-xl border border-[#e8dfd2] bg-[#faf6ef] px-2 py-1.5 text-sm font-normal normal-case outline-none"
            >
              <option value="">libovolná</option>
              <option value="4">do 4 písmen</option>
              <option value="5">do 5 písmen</option>
              <option value="6">do 6 písmen</option>
              <option value="8">do 8 písmen</option>
            </select>
          </label>
          <label className="block text-xs font-semibold uppercase tracking-wide text-[#8a7f71]">
            Max. slabik
            <select
              value={filtr.maxSlabiky ?? ''}
              onChange={e => setFiltr({ ...filtr, maxSlabiky: e.target.value ? Number(e.target.value) : null })}
              className="mt-1 w-full rounded-xl border border-[#e8dfd2] bg-[#faf6ef] px-2 py-1.5 text-sm font-normal normal-case outline-none"
            >
              <option value="">libovolně</option>
              <option value="1">1 slabika</option>
              <option value="2">do 2 slabik</option>
              <option value="3">do 3 slabik</option>
            </select>
          </label>
        </div>

        <Sekce nazev="Začíná písmenem">
          <Chip aktivni={filtr.pismeno === null} onClick={() => setFiltr({ ...filtr, pismeno: null })}>vše</Chip>
          {dostupnaPismena.map(p => (
            <Chip key={p} aktivni={filtr.pismeno === p} onClick={() => setFiltr({ ...filtr, pismeno: filtr.pismeno === p ? null : p })}>
              {p}
            </Chip>
          ))}
        </Sekce>
      </aside>

      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-[#6b6156]">
            <strong className="[font-family:var(--font-syne)] text-lg text-[#2b2723]">{vysledky.length}</strong> jmen
            {vybranePlemeno && <> pro plemeno <strong>{vybranePlemeno.nazev}</strong></>}
          </p>
          <label className="flex items-center gap-2 text-sm text-[#6b6156]">
            Seřadit:
            <select
              value={razeni}
              onChange={e => setRazeni(e.target.value as Razeni | 'doporucene')}
              className="rounded-full border border-[#e8dfd2] bg-white px-3 py-1.5 outline-none focus:border-[#2b2723]"
            >
              {vybranePlemeno && <option value="doporucene">Doporučené pro plemeno</option>}
              {RAZENI_MOZNOSTI.map(r => <option key={r.id} value={r.id}>{r.nazev}</option>)}
            </select>
          </label>
        </div>

        {vysledky.length === 0 && (
          <div className="rounded-3xl border border-dashed border-[#e8dfd2] p-10 text-center text-[#8a7f71]">
            Tak přísnému filtru neodpovídá žádné jméno — zkuste některé podmínky uvolnit.
          </div>
        )}

        {skupiny ? (
          skupiny.map(([pismeno, jmena]) => (
            <div key={pismeno} className="mb-6">
              <h3 className="mb-2 border-b border-[#e8dfd2] pb-1 [font-family:var(--font-syne)] text-2xl font-bold text-[#c4b8a7]">
                {pismeno}
              </h3>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {jmena.map(j => <NameCard key={j.id} jmeno={j} />)}
              </div>
            </div>
          ))
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {vysledky.map((j, i) => (
              <NameCard key={j.id} jmeno={j} poradi={razeni === 'doporucene' || razeni === 'popularita' ? i + 1 : undefined} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
