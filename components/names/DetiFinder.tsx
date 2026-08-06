'use client'

// Jména pro děti: procházení s filtrem + „nejlepší shoda" podle příjmení,
// měsíce narození, stylu a země. U shody vracíme jen nejlepší výsledky.

import { useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { JMENA, ZEME, zemePodleKodu } from '@/lib/names/data'
import {
  filtruj, kolator, najdiNejlepsiShody, PRAZDNY_FILTR, RAZENI_MOZNOSTI, serad,
} from '@/lib/names/logic'
import type { Filtr, Razeni, Shoda } from '@/lib/names/logic'
import { KATEGORIE_INFO, MESICE_NAZVY, VSECHNY_STYLY } from '@/lib/names/types'
import type { Energie, Kategorie, Styl } from '@/lib/names/types'
import NameCard from './NameCard'

const ENERGIE: Energie[] = ['klidná', 'vyvážená', 'živá']

function Chip({ aktivni, onClick, children }: { aktivni: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
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

const prepni = <T,>(pole: T[], hodnota: T): T[] =>
  pole.includes(hodnota) ? pole.filter(x => x !== hodnota) : [...pole, hodnota]

function ShodaKarta({ shoda, poradi }: { shoda: Shoda; poradi: number }) {
  const zeme = zemePodleKodu(shoda.jmeno.zeme)
  return (
    <article className="rounded-2xl border border-[#efe7da] bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h3 className="[font-family:var(--font-syne)] text-xl font-bold">
          <span className="mr-1.5 text-sm font-semibold text-[#c4b8a7]">{poradi}.</span>
          {shoda.jmeno.jmeno}
          <span className="ml-2 text-base">{zeme?.vlajka}</span>
        </h3>
        <div className="text-right">
          <span className="[font-family:var(--font-syne)] text-2xl font-extrabold text-[#d97757]">{shoda.skore}</span>
          <span className="text-xs text-[#8a7f71]"> /100</span>
        </div>
      </div>
      <div className="mt-1 h-2 overflow-hidden rounded-full bg-[#f3ecdf]">
        <div className="h-full rounded-full bg-gradient-to-r from-[#e7a15c] to-[#d97757]" style={{ width: `${shoda.skore}%` }} />
      </div>
      <p className="mt-2 text-sm text-[#6b6156]">{shoda.jmeno.vyznam}</p>
      {shoda.duvody.length > 0 && (
        <ul className="mt-2 space-y-1 text-xs text-[#8a7f71]">
          {shoda.duvody.slice(0, 4).map((d, i) => (
            <li key={i} className="flex gap-1.5"><span aria-hidden>•</span>{d}</li>
          ))}
        </ul>
      )}
    </article>
  )
}

export default function DetiFinder() {
  const params = useSearchParams()
  const [rezim, setRezim] = useState<'prochazet' | 'shoda'>('prochazet')

  // ── procházení ──
  const [filtr, setFiltr] = useState<Filtr>(() => ({
    ...PRAZDNY_FILTR,
    kategorie: params.get('kategorie') === 'holka' ? ['holka'] : params.get('kategorie') === 'kluk' ? ['kluk'] : [],
    zeme: params.get('zeme') ? [params.get('zeme')!] : [],
  }))
  const [razeni, setRazeni] = useState<Razeni>('popularita')

  // ── nejlepší shoda ──
  const [pohlavi, setPohlavi] = useState<'kluk' | 'holka'>('holka')
  const [prijmeni, setPrijmeni] = useState('')
  const [mesic, setMesic] = useState<number | null>(null)
  const [stylyShody, setStylyShody] = useState<Styl[]>([])
  const [zemeShody, setZemeShody] = useState<string[]>([])

  const detska = useMemo(() => JMENA.filter(j => j.kategorie === 'kluk' || j.kategorie === 'holka'), [])

  const vysledky = useMemo(() => {
    const f: Filtr = { ...filtr, kategorie: filtr.kategorie.length ? filtr.kategorie : (['kluk', 'holka'] as Kategorie[]) }
    return serad(filtruj(detska, f), razeni)
  }, [detska, filtr, razeni])

  const dostupnaPismena = useMemo(() => {
    const set = new Set(detska.map(j => j.jmeno[0].toUpperCase()))
    return [...set].sort((a, b) => kolator.compare(a, b))
  }, [detska])

  const shody = useMemo(
    () => najdiNejlepsiShody(detska, { pohlavi, prijmeni, mesic, styly: stylyShody, zeme: zemeShody }),
    [detska, pohlavi, prijmeni, mesic, stylyShody, zemeShody],
  )

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

  return (
    <div>
      <div className="mb-6 inline-flex rounded-full border border-[#e8dfd2] bg-white p-1">
        <button
          onClick={() => setRezim('prochazet')}
          className={`rounded-full px-4 py-1.5 text-sm font-medium ${rezim === 'prochazet' ? 'bg-[#2b2723] text-[#faf6ef]' : 'text-[#6b6156]'}`}
        >
          📖 Procházet jména
        </button>
        <button
          onClick={() => setRezim('shoda')}
          className={`rounded-full px-4 py-1.5 text-sm font-medium ${rezim === 'shoda' ? 'bg-[#2b2723] text-[#faf6ef]' : 'text-[#6b6156]'}`}
        >
          💘 Najít nejlepší shodu
        </button>
      </div>

      {rezim === 'prochazet' ? (
        <div className="grid gap-8 lg:grid-cols-[300px,1fr]">
          <aside className="space-y-5 self-start rounded-3xl border border-[#e8dfd2] bg-white p-5 shadow-sm lg:sticky lg:top-20">
            <div className="flex items-center justify-between">
              <h2 className="[font-family:var(--font-syne)] text-lg font-bold">Filtr</h2>
              <button onClick={() => setFiltr(PRAZDNY_FILTR)} className="text-xs text-[#8a7f71] underline decoration-dotted hover:text-[#2b2723]">
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

            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-[#8a7f71]">Pro koho</p>
              <div className="flex flex-wrap gap-1.5">
                {(['kluk', 'holka'] as Kategorie[]).map(k => (
                  <Chip key={k} aktivni={filtr.kategorie.includes(k)} onClick={() => setFiltr({ ...filtr, kategorie: prepni(filtr.kategorie, k) })}>
                    {KATEGORIE_INFO[k].emoji} {KATEGORIE_INFO[k].mnozne}
                  </Chip>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-[#8a7f71]">Země</p>
              <div className="flex flex-wrap gap-1.5">
                {ZEME.map(z => (
                  <Chip key={z.kod} aktivni={filtr.zeme.includes(z.kod)} onClick={() => setFiltr({ ...filtr, zeme: prepni(filtr.zeme, z.kod) })}>
                    {z.vlajka} {z.nazev}
                  </Chip>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-[#8a7f71]">Styl</p>
              <div className="flex flex-wrap gap-1.5">
                {VSECHNY_STYLY.map(s => (
                  <Chip key={s} aktivni={filtr.styly.includes(s)} onClick={() => setFiltr({ ...filtr, styly: prepni(filtr.styly, s) })}>
                    {s}
                  </Chip>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-[#8a7f71]">Energie jména</p>
              <div className="flex flex-wrap gap-1.5">
                {ENERGIE.map(e => (
                  <Chip key={e} aktivni={filtr.energie.includes(e)} onClick={() => setFiltr({ ...filtr, energie: prepni(filtr.energie, e) })}>
                    {e}
                  </Chip>
                ))}
              </div>
            </div>

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
                  <option value="2">do 2 slabik</option>
                  <option value="3">do 3 slabik</option>
                  <option value="4">do 4 slabik</option>
                </select>
              </label>
            </div>

            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-[#8a7f71]">Začíná písmenem</p>
              <div className="flex flex-wrap gap-1.5">
                <Chip aktivni={filtr.pismeno === null} onClick={() => setFiltr({ ...filtr, pismeno: null })}>vše</Chip>
                {dostupnaPismena.map(p => (
                  <Chip key={p} aktivni={filtr.pismeno === p} onClick={() => setFiltr({ ...filtr, pismeno: filtr.pismeno === p ? null : p })}>
                    {p}
                  </Chip>
                ))}
              </div>
            </div>
          </aside>

          <section>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-[#6b6156]">
                <strong className="[font-family:var(--font-syne)] text-lg text-[#2b2723]">{vysledky.length}</strong> jmen
              </p>
              <label className="flex items-center gap-2 text-sm text-[#6b6156]">
                Seřadit:
                <select
                  value={razeni}
                  onChange={e => setRazeni(e.target.value as Razeni)}
                  className="rounded-full border border-[#e8dfd2] bg-white px-3 py-1.5 outline-none focus:border-[#2b2723]"
                >
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
                {vysledky.map((j, i) => <NameCard key={j.id} jmeno={j} poradi={razeni === 'popularita' ? i + 1 : undefined} />)}
              </div>
            )}
          </section>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[340px,1fr]">
          <aside className="space-y-5 self-start rounded-3xl border border-[#e8dfd2] bg-white p-5 shadow-sm lg:sticky lg:top-20">
            <h2 className="[font-family:var(--font-syne)] text-lg font-bold">Vaše preference</h2>

            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-[#8a7f71]">Čekáte</p>
              <div className="flex gap-1.5">
                <Chip aktivni={pohlavi === 'holka'} onClick={() => setPohlavi('holka')}>👧 Holčičku</Chip>
                <Chip aktivni={pohlavi === 'kluk'} onClick={() => setPohlavi('kluk')}>👦 Chlapečka</Chip>
              </div>
            </div>

            <label className="block">
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-[#8a7f71]">Příjmení dítěte</p>
              <input
                value={prijmeni}
                onChange={e => setPrijmeni(e.target.value)}
                placeholder={pohlavi === 'holka' ? 'např. Nováková' : 'např. Novák'}
                className="w-full rounded-full border border-[#e8dfd2] bg-[#faf6ef] px-4 py-2 text-sm outline-none focus:border-[#2b2723]"
              />
              <p className="mt-1 text-[11px] text-[#8a7f71]">Zhodnotíme rytmus, plynulost i to, jestli se jméno s příjmením nerýmuje.</p>
            </label>

            <label className="block">
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-[#8a7f71]">Měsíc narození</p>
              <select
                value={mesic ?? ''}
                onChange={e => setMesic(e.target.value ? Number(e.target.value) : null)}
                className="w-full rounded-xl border border-[#e8dfd2] bg-[#faf6ef] px-3 py-2 text-sm outline-none focus:border-[#2b2723]"
              >
                <option value="">— nevím / nechci zadat —</option>
                {MESICE_NAZVY.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
              </select>
            </label>

            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-[#8a7f71]">Styl, který se vám líbí</p>
              <div className="flex flex-wrap gap-1.5">
                {VSECHNY_STYLY.map(s => (
                  <Chip key={s} aktivni={stylyShody.includes(s)} onClick={() => setStylyShody(prepni(stylyShody, s))}>{s}</Chip>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-[#8a7f71]">Země inspirace</p>
              <div className="flex flex-wrap gap-1.5">
                {ZEME.map(z => (
                  <Chip key={z.kod} aktivni={zemeShody.includes(z.kod)} onClick={() => setZemeShody(prepni(zemeShody, z.kod))}>
                    {z.vlajka} {z.nazev}
                  </Chip>
                ))}
              </div>
            </div>
          </aside>

          <section>
            <p className="mb-4 text-sm text-[#6b6156]">
              <strong className="[font-family:var(--font-syne)] text-lg text-[#2b2723]">Top {shody.length}</strong> nejlepších shod
              {prijmeni.trim() && <> pro příjmení <strong>{prijmeni.trim()}</strong></>}
              {mesic && <>, narození v měsíci <strong>{MESICE_NAZVY[mesic - 1]}</strong></>}
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {shody.map((s, i) => <ShodaKarta key={s.jmeno.id} shoda={s} poradi={i + 1} />)}
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
