'use client'

// Jména pro děti: procházení s kompaktním filtrem, hledání nejlepší shody
// (příjmení, rodina, měsíc) a sourozenecký ladič.

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  ArrowDownAZ, Baby, BookOpen, Calendar, Circle, Dices, Flame, Gem, Globe,
  Heart, Palette, Ruler, Search, SlidersHorizontal, Sparkles, TrendingUp, Type,
  Users, X, Zap,
} from 'lucide-react'
import { JMENA, jeMezinarodni, ZEME } from '@/lib/names/data'
import {
  filtruj, jeHit, jeOriginal, jeTrendy, kolator, monogram, najdiKSourozenci,
  najdiNejlepsiShody, PRAZDNY_FILTR, RAZENI_MOZNOSTI, serad,
  ZNAMENI_MESICE,
} from '@/lib/names/logic'
import type { Filtr, Razeni } from '@/lib/names/logic'
import { KATEGORIE_INFO, MESICE_NAZVY, VSECHNY_STYLY } from '@/lib/names/types'
import type { Energie, Kategorie, Styl } from '@/lib/names/types'
import { useOblibene } from '@/lib/names/oblibene'
import NameCard from './NameCard'
import ShodaKarta from './ShodaKarta'
import VolbaPodrobnosti from './VolbaPodrobnosti'
import Rozvrzeni from './Rozvrzeni'
import RodinnyVyhledavac from './RodinnyVyhledavac'
import {
  AktivniFiltry, Chip, Chipy, PismenaMrizka, Posuvnik, Prepinac, Sekce, VyberZemi,
} from './FiltrUI'

const ENERGIE: Energie[] = ['klidná', 'vyvážená', 'živá']
const prepni = <T,>(pole: T[], hodnota: T): T[] =>
  pole.includes(hodnota) ? pole.filter(x => x !== hodnota) : [...pole, hodnota]

/** O kolik jmen se seznam prodlouží jedním kliknutím. */
const DAVKA = 12

/**
 * Když se z prvních dvanácti nelíbí ani jedno, musí být kam pokračovat.
 * Ukazuje se pruh s počtem a dvěma tlačítky — po dávce, nebo rovnou vše.
 */
function DalsiVysledky({
  zobrazeno, celkem, onVic, onVse,
}: {
  zobrazeno: number
  celkem: number
  onVic: () => void
  onVse: () => void
}) {
  if (celkem <= zobrazeno) {
    return (
      <p className="dalsi-pocet mt-6">
        To je všech {celkem} jmen, která podmínkám odpovídají.
      </p>
    )
  }
  const zbyva = celkem - zobrazeno
  return (
    <div className="dalsi-pruh">
      <button type="button" className="dalsi-tlacitko" onClick={onVic}>
        Zobrazit dalších {Math.min(DAVKA, zbyva)}
      </button>
      <button type="button" className="dalsi-vse" onClick={onVse}>
        Zobrazit všech {celkem}
      </button>
      <p className="dalsi-pocet">
        Vidíte {zobrazeno} z {celkem}. Pořadí je podle shody — čím dál, tím volnější výběr.
      </p>
    </div>
  )
}

export default function DetiFinder() {
  const params = useSearchParams()
  const [rezim, setRezim] = useState<'prochazet' | 'shoda' | 'sourozenec'>('prochazet')

  const [filtr, setFiltr] = useState<Filtr>(() => ({
    ...PRAZDNY_FILTR,
    kategorie: params.get('kategorie') === 'holka' ? ['holka'] : params.get('kategorie') === 'kluk' ? ['kluk'] : [],
    zeme: params.get('zeme') ? [params.get('zeme')!] : [],
  }))
  const [razeni, setRazeni] = useState<Razeni>('popularita')
  const [rychle, setRychle] = useState<string[]>([])
  const [nahodne, setNahodne] = useState<string | null>(null)
  const [panelOtevren, setPanelOtevren] = useState(false)
  const { ids: oblibena } = useOblibene()

  const [pohlavi, setPohlavi] = useState<'kluk' | 'holka'>('holka')
  const [prijmeni, setPrijmeni] = useState('')
  const [mesic, setMesic] = useState<number | null>(null)
  const [stylyShody, setStylyShody] = useState<Styl[]>([])
  const [zemeShody, setZemeShody] = useState<string[]>([])
  const [sourozenec, setSourozenec] = useState('')
  const [maminka, setMaminka] = useState('')
  const [tatinek, setTatinek] = useState('')

  const detska = useMemo(() => JMENA.filter(j => j.kategorie === 'kluk' || j.kategorie === 'holka'), [])

  const vysledky = useMemo(() => {
    const f: Filtr = { ...filtr, kategorie: filtr.kategorie.length ? filtr.kategorie : (['kluk', 'holka'] as Kategorie[]) }
    let kandidati = filtruj(detska, f)
    if (rychle.includes('srdce')) kandidati = kandidati.filter(j => oblibena.includes(j.id))
    if (rychle.includes('hit')) kandidati = kandidati.filter(jeHit)
    if (rychle.includes('trendy')) kandidati = kandidati.filter(jeTrendy)
    if (rychle.includes('original')) kandidati = kandidati.filter(jeOriginal)
    if (rychle.includes('unisex')) kandidati = kandidati.filter(j => j.unisex)
    if (rychle.includes('mezinarodni')) kandidati = kandidati.filter(jeMezinarodni)
    if (rychle.includes('svatek')) kandidati = kandidati.filter(j => j.svatek)
    return serad(kandidati, razeni)
  }, [detska, filtr, razeni, rychle, oblibena])

  const pismena = useMemo(() => {
    const zac = new Set(detska.map(j => j.jmeno[0].toUpperCase()))
    const kon = new Set(detska.map(j => j.jmeno[j.jmeno.length - 1].toUpperCase()))
    return {
      zacatek: [...zac].sort((a, b) => kolator.compare(a, b)),
      konec: [...kon].sort((a, b) => kolator.compare(a, b)),
    }
  }, [detska])

  // Nejdřív spočítáme pořadí všech kandidátů a teprve pak z něj ukrojíme,
  // kolik jich má být vidět. Kliknutí na „další" tak nic nepřepočítává.
  const [limitShody, setLimitShody] = useState(DAVKA)
  const [limitSourozenci, setLimitSourozenci] = useState(DAVKA)

  const vsechnyShody = useMemo(
    () => najdiNejlepsiShody(detska, { pohlavi, prijmeni, mesic, styly: stylyShody, zeme: zemeShody, maminka, tatinek, sourozenec }, Infinity),
    [detska, pohlavi, prijmeni, mesic, stylyShody, zemeShody, maminka, tatinek, sourozenec],
  )
  const vsichniSourozenci = useMemo(
    () => najdiKSourozenci(detska, { pohlavi, sourozenec, prijmeni }, Infinity),
    [detska, pohlavi, sourozenec, prijmeni],
  )

  // Změna zadání vrací seznam na začátek — jinak by po úpravě příjmení
  // zůstalo rozbaleno pět set jmen.
  useEffect(() => { setLimitShody(DAVKA) }, [pohlavi, prijmeni, mesic, stylyShody, zemeShody, maminka, tatinek, sourozenec])
  useEffect(() => { setLimitSourozenci(DAVKA) }, [pohlavi, sourozenec, prijmeni])

  const shody = useMemo(() => vsechnyShody.slice(0, limitShody), [vsechnyShody, limitShody])
  const sourozenci = useMemo(() => vsichniSourozenci.slice(0, limitSourozenci), [vsichniSourozenci, limitSourozenci])
  const inicialy = prijmeni.trim() && shody.length ? monogram(shody[0].jmeno.jmeno, prijmeni) : null

  useEffect(() => {
    if (!panelOtevren) return
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setPanelOtevren(false) }
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [panelOtevren])

  const aktivni = [
    ...filtr.kategorie.map(k => ({ klic: `k-${k}`, popis: KATEGORIE_INFO[k].mnozne, zrus: () => setFiltr(f => ({ ...f, kategorie: prepni(f.kategorie, k) })) })),
    ...filtr.zeme.map(z => ({ klic: `z-${z}`, popis: ZEME.find(x => x.kod === z)?.nazev ?? z, zrus: () => setFiltr(f => ({ ...f, zeme: prepni(f.zeme, z) })) })),
    ...filtr.styly.map(s => ({ klic: `s-${s}`, popis: s, zrus: () => setFiltr(f => ({ ...f, styly: prepni(f.styly, s) })) })),
    ...filtr.energie.map(e => ({ klic: `e-${e}`, popis: e, zrus: () => setFiltr(f => ({ ...f, energie: prepni(f.energie, e) })) })),
    ...rychle.map(r => ({ klic: `r-${r}`, popis: r, zrus: () => setRychle(prepni(rychle, r)) })),
    ...(filtr.pismeno ? [{ klic: 'pis', popis: `začíná ${filtr.pismeno}`, zrus: () => setFiltr(f => ({ ...f, pismeno: null })) }] : []),
    ...(filtr.konciNa ? [{ klic: 'kon', popis: `končí ${filtr.konciNa}`, zrus: () => setFiltr(f => ({ ...f, konciNa: null })) }] : []),
    ...(filtr.maxDelka ? [{ klic: 'del', popis: `do ${filtr.maxDelka} písmen`, zrus: () => setFiltr(f => ({ ...f, maxDelka: null })) }] : []),
    ...(filtr.maxSlabiky ? [{ klic: 'sla', popis: `do ${filtr.maxSlabiky} slabik`, zrus: () => setFiltr(f => ({ ...f, maxSlabiky: null })) }] : []),
  ]

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

  const taby = (
    <div className="mb-5 inline-flex flex-wrap rounded-full border border-[#e8dfd2] bg-white p-1">
      {([
        { id: 'prochazet', nazev: 'Procházet jména', ikona: <BookOpen size={14} /> },
        { id: 'shoda', nazev: 'Najít nejlepší shodu', ikona: <Sparkles size={14} /> },
        { id: 'sourozenec', nazev: 'Ladí k sourozenci', ikona: <Users size={14} /> },
      ] as const).map(t => (
        <button
          key={t.id}
          onClick={() => setRezim(t.id)}
          className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[13.5px] font-semibold transition-colors ${
            rezim === t.id ? 'bg-[#2b2723] text-[#faf6ef]' : 'text-[#6b6156]'
          }`}
        >
          {t.ikona} {t.nazev}
        </button>
      ))}
    </div>
  )

  const PLOCHY = ['deti-filtr', 'deti-nad', 'deti-v-mrizce', 'deti-pod', 'deti-bocni']

  return (
    <Rozvrzeni uzsi plochy={PLOCHY}>
      {taby}

      {rezim === 'prochazet' && (
        <div className="grid items-start gap-6 lg:grid-cols-[280px_1fr]">
          {panelOtevren && <div className="filtr-zaves" onClick={() => setPanelOtevren(false)} aria-hidden />}
          <aside className={`filtr-panel space-y-1 self-start rounded-3xl border border-[#e8dfd2] bg-white p-4 shadow-sm lg:sticky lg:top-20 ${panelOtevren ? 'je-otevreny' : ''}`}>
            <div className="flex items-center justify-between pb-1">
              <h2 className="flex items-center gap-1.5 [font-family:var(--font-syne)] text-base font-bold">
                <SlidersHorizontal size={16} aria-hidden /> Filtr
                {aktivni.length > 0 && <span className="filtr-pocet">{aktivni.length}</span>}
              </h2>
              <div className="flex items-center gap-2">
                <button onClick={() => { setFiltr(PRAZDNY_FILTR); setRychle([]) }} className="text-[12px] text-[#8a7f71] underline decoration-dotted hover:text-[#2b2723]">
                  Vymazat
                </button>
                <button onClick={() => setPanelOtevren(false)} className="filtr-tlacitko-mobil rounded-full border border-[#e8dfd2] p-1" aria-label="Zavřít filtr">
                  <X size={14} />
                </button>
              </div>
            </div>

            <div className="relative">
              <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#a2988a]" aria-hidden />
              <input
                type="search"
                value={filtr.hledat}
                onChange={e => setFiltr({ ...filtr, hledat: e.target.value })}
                placeholder="Hledat jméno, význam či zdrobněninu…"
                className="w-full rounded-full border border-[#e8dfd2] bg-[#faf6ef] py-2 pl-9 pr-3 text-[13px] outline-none focus:border-[#2b2723]"
              />
            </div>

            <Sekce nazev="Pro koho" ikona={<Baby size={13} />} pocet={filtr.kategorie.length} vychoziOtevrena>
              <Prepinac<'vse' | 'holka' | 'kluk'>
                hodnota={filtr.kategorie.length === 1 ? (filtr.kategorie[0] as 'holka' | 'kluk') : 'vse'}
                onZmena={h => setFiltr({ ...filtr, kategorie: h === 'vse' ? [] : [h] })}
                moznosti={[
                  { id: 'holka', nazev: 'holčičky' },
                  { id: 'kluk', nazev: 'kluci' },
                  { id: 'vse', nazev: 'obojí' },
                ]}
              />
            </Sekce>

            <Sekce nazev="Rychlé výběry" ikona={<Sparkles size={13} />} pocet={rychle.length} vychoziOtevrena>
              <Chipy>
                <Chip aktivni={rychle.includes('srdce')} onClick={() => setRychle(prepni(rychle, 'srdce'))}><Heart size={12} /> oblíbená</Chip>
                <Chip aktivni={rychle.includes('hit')} onClick={() => setRychle(prepni(rychle, 'hit'))}><Flame size={12} /> hity</Chip>
                <Chip aktivni={rychle.includes('trendy')} onClick={() => setRychle(prepni(rychle, 'trendy'))}><TrendingUp size={12} /> trendy</Chip>
                <Chip aktivni={rychle.includes('original')} onClick={() => setRychle(prepni(rychle, 'original'))}><Gem size={12} /> originální</Chip>
                <Chip aktivni={rychle.includes('unisex')} onClick={() => setRychle(prepni(rychle, 'unisex'))}><Circle size={12} /> unisex</Chip>
                <Chip aktivni={rychle.includes('mezinarodni')} onClick={() => setRychle(prepni(rychle, 'mezinarodni'))}><Globe size={12} /> mezinárodní</Chip>
                <Chip aktivni={rychle.includes('svatek')} onClick={() => setRychle(prepni(rychle, 'svatek'))}><Calendar size={12} /> se svátkem</Chip>
              </Chipy>
            </Sekce>

            <Sekce nazev="Země" ikona={<Globe size={13} />} pocet={filtr.zeme.length}>
              <VyberZemi
                zeme={ZEME}
                vybrane={filtr.zeme}
                onPrepni={kod => setFiltr({ ...filtr, zeme: prepni(filtr.zeme, kod) })}
                onVymaz={() => setFiltr({ ...filtr, zeme: [] })}
              />
            </Sekce>

            <Sekce nazev="Styl a energie" ikona={<Palette size={13} />} pocet={filtr.styly.length + filtr.energie.length}>
              <Chipy>
                {VSECHNY_STYLY.map(s => (
                  <Chip key={s} aktivni={filtr.styly.includes(s)} onClick={() => setFiltr({ ...filtr, styly: prepni(filtr.styly, s) })}>{s}</Chip>
                ))}
              </Chipy>
              <p className="mb-1 mt-3 text-[11px] font-semibold uppercase tracking-wide text-[#a2988a]">Energie</p>
              <Chipy>
                {ENERGIE.map(e => (
                  <Chip key={e} aktivni={filtr.energie.includes(e)} onClick={() => setFiltr({ ...filtr, energie: prepni(filtr.energie, e) })}>{e}</Chip>
                ))}
              </Chipy>
            </Sekce>

            <Sekce nazev="Délka jména" ikona={<Ruler size={13} />} pocet={(filtr.maxDelka ? 1 : 0) + (filtr.maxSlabiky ? 1 : 0)}>
              <div className="space-y-3">
                <Posuvnik popisek="Počet písmen" hodnota={filtr.maxDelka} min={3} max={10} jednotka="písmen" onZmena={h => setFiltr({ ...filtr, maxDelka: h })} />
                <Posuvnik popisek="Počet slabik" hodnota={filtr.maxSlabiky} min={1} max={4} jednotka="slabik" onZmena={h => setFiltr({ ...filtr, maxSlabiky: h })} />
              </div>
            </Sekce>

            <Sekce nazev="Písmena" ikona={<Type size={13} />} pocet={(filtr.pismeno ? 1 : 0) + (filtr.konciNa ? 1 : 0)}>
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-[#a2988a]">Začíná na</p>
              <PismenaMrizka pismena={pismena.zacatek} vybrane={filtr.pismeno} onVyber={p => setFiltr({ ...filtr, pismeno: p })} />
              <p className="mb-1 mt-3 text-[11px] font-semibold uppercase tracking-wide text-[#a2988a]">Končí na</p>
              <PismenaMrizka pismena={pismena.konec} vybrane={filtr.konciNa} onVyber={p => setFiltr({ ...filtr, konciNa: p })} />
            </Sekce>

          </aside>

          <section>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button onClick={() => setPanelOtevren(true)} className="filtr-tlacitko-mobil inline-flex items-center gap-1.5 rounded-full border border-[#e8dfd2] bg-white px-3 py-1.5 text-[13px] font-semibold">
                  <SlidersHorizontal size={14} /> Filtr
                  {aktivni.length > 0 && <span className="filtr-pocet">{aktivni.length}</span>}
                </button>
                <p className="text-[13px] text-[#6b6156]">
                  <strong className="[font-family:var(--font-syne)] text-lg text-[#2b2723]">{vysledky.length}</strong> jmen
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => vysledky.length && setNahodne(vysledky[Math.floor(Math.random() * vysledky.length)].id)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#e8dfd2] bg-white px-3 py-1.5 text-[13px] text-[#6b6156] hover:border-[#2b2723]"
                >
                  <Dices size={14} /> Překvap mě
                </button>
                <label className="inline-flex items-center gap-1.5 rounded-full border border-[#e8dfd2] bg-white py-1.5 pl-3 pr-1 text-[13px] text-[#6b6156]">
                  <ArrowDownAZ size={14} aria-hidden />
                  <select value={razeni} onChange={e => setRazeni(e.target.value as Razeni)} className="bg-transparent pr-1 text-[13px] outline-none" aria-label="Řazení výsledků">
                    {RAZENI_MOZNOSTI.map(r => <option key={r.id} value={r.id}>{r.nazev}</option>)}
                  </select>
                </label>
              </div>
            </div>

            {aktivni.length > 0 && <div className="mb-4"><AktivniFiltry polozky={aktivni} /></div>}

            {nahodne && vysledky.some(j => j.id === nahodne) && (
              <div className="mb-5 rounded-2xl border-2 border-[#d97757] p-1">
                <p className="px-3 pt-1 text-[11px] font-semibold uppercase tracking-wide text-[#d97757]">Náhodný tip</p>
                <NameCard jmeno={vysledky.find(j => j.id === nahodne)!} />
              </div>
            )}

            {vysledky.length === 0 && (
              <div className="rounded-3xl border border-dashed border-[#e8dfd2] p-10 text-center text-[#8a7f71]">
                Tak přísnému filtru neodpovídá žádné jméno — zkuste některé podmínky uvolnit.
              </div>
            )}

            {skupiny ? (
              skupiny.map(([pismeno, jmena]) => (
                <div key={pismeno} className="mb-6">
                  <h3 className="mb-2 border-b border-[#e8dfd2] pb-1 [font-family:var(--font-syne)] text-2xl font-bold text-[#c4b8a7]">{pismeno}</h3>
                  <div className="nastup mrizka-jmen">
                    {jmena.map(j => <NameCard key={j.id} jmeno={j} />)}
                  </div>
                </div>
              ))
            ) : (
              <div className="nastup mrizka-jmen">
                {vysledky.map((j, i) => <NameCard key={j.id} jmeno={j} poradi={razeni === 'popularita' ? i + 1 : undefined} />)}
              </div>
            )}

          </section>
        </div>
      )}

      {rezim === 'shoda' && (
        <>
        <RodinnyVyhledavac
          pohlavi={pohlavi}
          onPohlavi={setPohlavi}
          popisPod="Stačí vyplnit, co víte — každé pole zpřesní výběr. Jména, která ladí s víc členy rodiny, dostanou štítek, a poznáme i podobu jména po rodiči (Petr → Petra)."
          pole={[
            { klic: 'prijmeni', popisek: 'Příjmení dítěte', hodnota: prijmeni, napoveda: pohlavi === 'holka' ? 'např. Nováková' : 'např. Novák', onZmena: setPrijmeni },
            { klic: 'maminka', popisek: 'Maminka', hodnota: maminka, napoveda: 'např. Jana', onZmena: setMaminka },
            { klic: 'tatinek', popisek: 'Tatínek', hodnota: tatinek, napoveda: 'např. Petr', onZmena: setTatinek },
            { klic: 'sourozenec', popisek: 'Sourozenec', hodnota: sourozenec, napoveda: 'např. Eliška', onZmena: setSourozenec },
          ]}
        />

        <div className="grid items-start gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="space-y-4 self-start rounded-3xl border border-[#e8dfd2] bg-white p-4 shadow-sm lg:sticky lg:top-20">
            <h2 className="flex items-center gap-1.5 [font-family:var(--font-syne)] text-base font-bold">
              <Sparkles size={16} aria-hidden /> Doplňující výběr
            </h2>

            <Sekce nazev="Měsíc narození" ikona={<Calendar size={13} />} pocet={mesic ? 1 : 0}>
              <select
                value={mesic ?? ''}
                onChange={e => setMesic(e.target.value ? Number(e.target.value) : null)}
                className="w-full rounded-xl border border-[#e8dfd2] bg-[#faf6ef] px-3 py-2 text-[13px] outline-none focus:border-[#2b2723]"
              >
                <option value="">— nevím / nechci zadat —</option>
                {MESICE_NAZVY.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
              </select>
            </Sekce>

            <Sekce nazev="Styl" ikona={<Palette size={13} />} pocet={stylyShody.length}>
              <Chipy>
                {VSECHNY_STYLY.map(s => (
                  <Chip key={s} aktivni={stylyShody.includes(s)} onClick={() => setStylyShody(prepni(stylyShody, s))}>{s}</Chip>
                ))}
              </Chipy>
            </Sekce>

            <Sekce nazev="Země inspirace" ikona={<Globe size={13} />} pocet={zemeShody.length}>
              <VyberZemi zeme={ZEME} vybrane={zemeShody} onPrepni={k => setZemeShody(prepni(zemeShody, k))} onVymaz={() => setZemeShody([])} />
            </Sekce>

            <div className="border-t border-[#f0e8dc] pt-4">
              <VolbaPodrobnosti />
            </div>
          </aside>

          <section>
            <p className="mb-1 text-sm text-[#6b6156]">
              <strong className="[font-family:var(--font-syne)] text-lg text-[#2b2723]">{vsechnyShody.length}</strong> jmen seřazených podle shody
              {prijmeni.trim() && <> pro příjmení <strong>{prijmeni.trim()}</strong></>}
              {(maminka.trim() || tatinek.trim() || sourozenec.trim()) && (
                <>, ladící se jmény <strong>{[maminka.trim(), tatinek.trim(), sourozenec.trim()].filter(Boolean).join(', ')}</strong></>
              )}
              {mesic && <>, narození v měsíci <strong>{MESICE_NAZVY[mesic - 1]}</strong></>}
            </p>
            <p className="mb-4 text-xs text-[#8a7f71] empty:hidden">
              {inicialy && <>Monogram top shody: <strong>{inicialy.text}</strong>{inicialy.varovani && <span className="text-[#9a6b1f]"> — {inicialy.varovani}</span>}</>}
              {inicialy && mesic ? ' · ' : ''}
              {mesic && <>znamení: <strong>{ZNAMENI_MESICE[mesic]}</strong></>}
            </p>
            <div className="nastup grid gap-3 sm:grid-cols-2">
              {shody.map((s, i) => <ShodaKarta key={s.jmeno.id} shoda={s} poradi={i + 1} />)}
            </div>
            <DalsiVysledky
              zobrazeno={shody.length}
              celkem={vsechnyShody.length}
              onVic={() => setLimitShody(n => n + DAVKA)}
              onVse={() => setLimitShody(vsechnyShody.length)}
            />
          </section>
        </div>
        </>
      )}

      {rezim === 'sourozenec' && (
        <>
        <RodinnyVyhledavac
          pohlavi={pohlavi}
          onPohlavi={setPohlavi}
          popisPod="Najdeme jména ladící se jménem prvního dítěte — stylem, původem i rytmem. Stejnou iniciálu a rýmy hlídáme, aby se jména doma nepletla."
          pole={[
            { klic: 'sourozenec', popisek: 'Jméno sourozence', hodnota: sourozenec, napoveda: 'např. Eliška', onZmena: setSourozenec },
            { klic: 'prijmeni', popisek: 'Příjmení (nepovinné)', hodnota: prijmeni, napoveda: 'např. Nováková', onZmena: setPrijmeni },
          ]}
        />

        <div>
          <section>
            {!sourozenec.trim() ? (
              <div className="rounded-3xl border border-dashed border-[#e8dfd2] p-10 text-center text-[#8a7f71]">
                Zadejte jméno prvního dítěte a najdeme mu ladícího brášku či sestřičku.
              </div>
            ) : (
              <>
                <p className="mb-3 text-sm text-[#6b6156]">
                  <strong className="[font-family:var(--font-syne)] text-lg text-[#2b2723]">{vsichniSourozenci.length}</strong> jmen,
                  která ladí se jménem <strong>{sourozenec.trim()}</strong>
                </p>
                <div className="mb-4 rounded-2xl border border-[#e8dfd2] bg-white p-4">
                  <VolbaPodrobnosti />
                </div>
                <div className="nastup grid gap-3 sm:grid-cols-2">
                  {sourozenci.map((s, i) => <ShodaKarta key={s.jmeno.id} shoda={s} poradi={i + 1} />)}
                </div>
                <DalsiVysledky
                  zobrazeno={sourozenci.length}
                  celkem={vsichniSourozenci.length}
                  onVic={() => setLimitSourozenci(n => n + DAVKA)}
                  onVse={() => setLimitSourozenci(vsichniSourozenci.length)}
                />
              </>
            )}
          </section>
        </div>
        </>
      )}
    </Rozvrzeni>
  )
}
