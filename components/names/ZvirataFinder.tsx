'use client'

// Vyhledávač zvířecích jmen. Filtr je kompaktní: sbalené sekce, přepínače,
// posuvníky a mřížka písmen místo dlouhých seznamů chipů. Na mobilu se panel
// vysouvá zespoda, na desktopu drží u levého okraje.

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  ArrowDownAZ, Bird, Cat, Dices, Dog, Flame, Gem, Globe, Heart, Mars, Megaphone,
  Palette, Rabbit, Rat, Ruler, Search, SlidersHorizontal, Sparkles, TrendingUp,
  Type, Venus, X, Zap,
} from 'lucide-react'
import { JMENA, ZEME } from '@/lib/names/data'
import { PLEMENA_KOCEK, PLEMENA_PSU, VSECHNA_PLEMENA } from '@/lib/names/breeds'
import {
  dobreSeVola, filtruj, jeHit, jeOriginal, jeTrendy, jmenaProPlemeno, kolator,
  PRAZDNY_FILTR, RAZENI_MOZNOSTI, serad, ZPUSOBY_ZIVOTA,
} from '@/lib/names/logic'
import type { Filtr, Razeni } from '@/lib/names/logic'
import { KATEGORIE_INFO, VSECHNY_STYLY } from '@/lib/names/types'
import type { Energie, Kategorie, PohlaviZvirete, Velikost } from '@/lib/names/types'
import { useOblibene } from '@/lib/names/oblibene'
import NameCard from './NameCard'
import Rozvrzeni from './Rozvrzeni'
import {
  AktivniFiltry, Chip, Chipy, PismenaMrizka, Posuvnik, Prepinac, Sekce, VyberZemi,
} from './FiltrUI'

const ZVIRECI_KATEGORIE: { id: Kategorie; ikona: React.ReactNode }[] = [
  { id: 'pes', ikona: <Dog size={13} /> },
  { id: 'fenka', ikona: <Dog size={13} /> },
  { id: 'kocour', ikona: <Cat size={13} /> },
  { id: 'kocka', ikona: <Cat size={13} /> },
  { id: 'kun', ikona: <Zap size={13} /> },
  { id: 'kralik', ikona: <Rabbit size={13} /> },
  { id: 'papousek', ikona: <Bird size={13} /> },
  { id: 'krecek', ikona: <Rat size={13} /> },
]
const ENERGIE: Energie[] = ['klidná', 'vyvážená', 'živá']
const VELIKOSTI: Velikost[] = ['malé', 'střední', 'velké']

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
  const [plemeno, setPlemeno] = useState('')
  const [zivot, setZivot] = useState('')
  const [rychle, setRychle] = useState<string[]>([])
  const [nahodne, setNahodne] = useState<string | null>(null)
  const [panelOtevren, setPanelOtevren] = useState(false)
  const { ids: oblibena } = useOblibene()

  const vybranePlemeno = VSECHNA_PLEMENA.find(p => p.nazev === plemeno)
  const vybranyZivot = ZPUSOBY_ZIVOTA.find(z => z.id === zivot)
  const zakladni = useMemo(() => JMENA.filter(j => j.kategorie !== 'kluk' && j.kategorie !== 'holka'), [])

  const vysledky = useMemo(() => {
    let kandidati = vybranePlemeno ? jmenaProPlemeno(zakladni, vybranePlemeno) : zakladni
    const f: Filtr = {
      ...filtr,
      kategorie: vybranePlemeno ? [] : filtr.kategorie,
      velikosti: vybranePlemeno ? [] : (filtr.velikosti.length ? filtr.velikosti : (vybranyZivot?.velikosti ?? [])),
      energie: filtr.energie.length ? filtr.energie : (vybranyZivot?.energie ?? []),
      styly: filtr.styly.length ? filtr.styly : (vybranyZivot?.styly ?? []),
    }
    kandidati = filtruj(kandidati, f)
    if (rychle.includes('srdce')) kandidati = kandidati.filter(j => oblibena.includes(j.id))
    if (rychle.includes('hit')) kandidati = kandidati.filter(jeHit)
    if (rychle.includes('trendy')) kandidati = kandidati.filter(jeTrendy)
    if (rychle.includes('original')) kandidati = kandidati.filter(jeOriginal)
    if (rychle.includes('volatelne')) kandidati = kandidati.filter(dobreSeVola)
    return razeni === 'doporucene' ? kandidati : serad(kandidati, razeni)
  }, [zakladni, filtr, razeni, vybranePlemeno, vybranyZivot, rychle, oblibena])

  const pismena = useMemo(() => {
    const zac = new Set(zakladni.map(j => j.jmeno[0].toUpperCase()))
    const kon = new Set(zakladni.map(j => j.jmeno[j.jmeno.length - 1].toUpperCase()))
    return {
      zacatek: [...zac].sort((a, b) => kolator.compare(a, b)),
      konec: [...kon].sort((a, b) => kolator.compare(a, b)),
    }
  }, [zakladni])

  // zavření mobilního panelu klávesou Esc
  useEffect(() => {
    if (!panelOtevren) return
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setPanelOtevren(false) }
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [panelOtevren])

  const reset = () => {
    setFiltr(PRAZDNY_FILTR); setPlemeno(''); setZivot(''); setRychle([]); setRazeni('popularita')
  }

  const pohlaviHodnota: PohlaviZvirete | 'vse' =
    filtr.pohlavi.length === 1 ? filtr.pohlavi[0] : 'vse'

  // souhrn aktivních filtrů nad výsledky
  const aktivni = [
    ...(plemeno ? [{ klic: 'plemeno', popis: plemeno, zrus: () => { setPlemeno(''); setRazeni('popularita') } }] : []),
    ...(zivot ? [{ klic: 'zivot', popis: vybranyZivot!.nazev, zrus: () => setZivot('') }] : []),
    ...filtr.kategorie.map(k => ({ klic: `k-${k}`, popis: KATEGORIE_INFO[k].mnozne, zrus: () => setFiltr(f => ({ ...f, kategorie: prepni(f.kategorie, k) })) })),
    ...filtr.pohlavi.map(p => ({ klic: `p-${p}`, popis: p === 'samec' ? 'samci' : 'samičky', zrus: () => setFiltr(f => ({ ...f, pohlavi: [] })) })),
    ...filtr.zeme.map(z => ({ klic: `z-${z}`, popis: ZEME.find(x => x.kod === z)?.nazev ?? z, zrus: () => setFiltr(f => ({ ...f, zeme: prepni(f.zeme, z) })) })),
    ...filtr.styly.map(s => ({ klic: `s-${s}`, popis: s, zrus: () => setFiltr(f => ({ ...f, styly: prepni(f.styly, s) })) })),
    ...filtr.energie.map(e => ({ klic: `e-${e}`, popis: e, zrus: () => setFiltr(f => ({ ...f, energie: prepni(f.energie, e) })) })),
    ...filtr.velikosti.map(v => ({ klic: `v-${v}`, popis: `${v} plemeno`, zrus: () => setFiltr(f => ({ ...f, velikosti: prepni(f.velikosti, v) })) })),
    ...rychle.map(r => ({ klic: `r-${r}`, popis: r, zrus: () => setRychle(prepni(rychle, r)) })),
    ...(filtr.pismeno ? [{ klic: 'pis', popis: `začíná ${filtr.pismeno}`, zrus: () => setFiltr(f => ({ ...f, pismeno: null })) }] : []),
    ...(filtr.konciNa ? [{ klic: 'kon', popis: `končí ${filtr.konciNa}`, zrus: () => setFiltr(f => ({ ...f, konciNa: null })) }] : []),
    ...(filtr.maxDelka ? [{ klic: 'del', popis: `do ${filtr.maxDelka} písmen`, zrus: () => setFiltr(f => ({ ...f, maxDelka: null })) }] : []),
    ...(filtr.maxSlabiky ? [{ klic: 'sla', popis: `do ${filtr.maxSlabiky} slabik`, zrus: () => setFiltr(f => ({ ...f, maxSlabiky: null })) }] : []),
  ]

  const panel = (
    <aside className={`filtr-panel space-y-1 self-start rounded-3xl border border-[#e8dfd2] bg-white p-4 shadow-sm lg:sticky lg:top-20 ${panelOtevren ? 'je-otevreny' : ''}`}>
      <div className="flex items-center justify-between pb-1">
        <h2 className="flex items-center gap-1.5 [font-family:var(--font-syne)] text-base font-bold">
          <SlidersHorizontal size={16} aria-hidden /> Filtr
          {aktivni.length > 0 && <span className="filtr-pocet">{aktivni.length}</span>}
        </h2>
        <div className="flex items-center gap-2">
          <button onClick={reset} className="text-[12px] text-[#8a7f71] underline decoration-dotted hover:text-[#2b2723]">
            Vymazat
          </button>
          <button
            onClick={() => setPanelOtevren(false)}
            className="filtr-tlacitko-mobil rounded-full border border-[#e8dfd2] p-1"
            aria-label="Zavřít filtr"
          >
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
          placeholder="Hledat jméno či význam…"
          className="w-full rounded-full border border-[#e8dfd2] bg-[#faf6ef] py-2 pl-9 pr-3 text-[13px] outline-none focus:border-[#2b2723]"
        />
      </div>

      <Sekce nazev="Rychlé výběry" ikona={<Sparkles size={13} />} pocet={rychle.length} vychoziOtevrena>
        <Chipy>
          <Chip aktivni={rychle.includes('srdce')} onClick={() => setRychle(prepni(rychle, 'srdce'))} title="Jen jména označená srdíčkem">
            <Heart size={12} /> oblíbená
          </Chip>
          <Chip aktivni={rychle.includes('hit')} onClick={() => setRychle(prepni(rychle, 'hit'))} title="Dlouhodobě nejoblíbenější">
            <Flame size={12} /> hity
          </Chip>
          <Chip aktivni={rychle.includes('trendy')} onClick={() => setRychle(prepni(rychle, 'trendy'))} title="Moderní jména, která právě letí">
            <TrendingUp size={12} /> trendy
          </Chip>
          <Chip aktivni={rychle.includes('original')} onClick={() => setRychle(prepni(rychle, 'original'))} title="Méně obvyklá, ale krásná">
            <Gem size={12} /> originální
          </Chip>
          <Chip aktivni={rychle.includes('volatelne')} onClick={() => setRychle(prepni(rychle, 'volatelne'))} title="1–2 slabiky, samohláska na konci, nezní jako povel">
            <Megaphone size={12} /> dobře se volá
          </Chip>
        </Chipy>
      </Sekce>

      <Sekce nazev="Pohlaví" ikona={<Venus size={13} />} pocet={filtr.pohlavi.length} vychoziOtevrena>
        <Prepinac<PohlaviZvirete | 'vse'>
          hodnota={pohlaviHodnota}
          onZmena={h => setFiltr({ ...filtr, pohlavi: h === 'vse' ? [] : [h] })}
          moznosti={[
            { id: 'samec', nazev: 'samec', ikona: <Mars size={12} />, title: 'Jména pro samce (unisex se ukážou také)' },
            { id: 'samice', nazev: 'samička', ikona: <Venus size={12} />, title: 'Jména pro samičky (unisex se ukážou také)' },
            { id: 'vse', nazev: 'obojí' },
          ]}
        />
      </Sekce>

      <Sekce nazev="Druh zvířete" ikona={<Dog size={13} />} pocet={filtr.kategorie.length}>
        <Chipy>
          {ZVIRECI_KATEGORIE.map(({ id, ikona }) => (
            <Chip key={id} aktivni={filtr.kategorie.includes(id)} onClick={() => setFiltr({ ...filtr, kategorie: prepni(filtr.kategorie, id) })}>
              {ikona} {KATEGORIE_INFO[id].mnozne}
            </Chip>
          ))}
        </Chipy>
      </Sekce>

      <Sekce nazev="Plemeno" ikona={<Dog size={13} />} pocet={plemeno ? 1 : 0}>
        <select
          value={plemeno}
          onChange={e => { setPlemeno(e.target.value); setRazeni(e.target.value ? 'doporucene' : 'popularita') }}
          className="w-full rounded-xl border border-[#e8dfd2] bg-[#faf6ef] px-3 py-2 text-[13px] outline-none focus:border-[#2b2723]"
        >
          <option value="">— bez výběru plemene —</option>
          <optgroup label="Psí plemena">
            {PLEMENA_PSU.map(p => <option key={p.nazev}>{p.nazev}</option>)}
          </optgroup>
          <optgroup label="Kočičí plemena">
            {PLEMENA_KOCEK.map(p => <option key={p.nazev}>{p.nazev}</option>)}
          </optgroup>
        </select>
        {vybranePlemeno && <p className="mt-2 rounded-xl bg-[#f3ecdf] p-2 text-[12px] text-[#6b6156]">{vybranePlemeno.popis}</p>}
      </Sekce>

      <Sekce nazev="Způsob života" ikona={<Zap size={13} />} pocet={zivot ? 1 : 0}>
        <Chipy>
          {ZPUSOBY_ZIVOTA.map(z => (
            <Chip key={z.id} aktivni={zivot === z.id} onClick={() => setZivot(zivot === z.id ? '' : z.id)} title={z.popis}>
              {z.emoji} {z.nazev}
            </Chip>
          ))}
        </Chipy>
      </Sekce>

      <Sekce nazev="Země původu" ikona={<Globe size={13} />} pocet={filtr.zeme.length}>
        <VyberZemi
          zeme={ZEME}
          vybrane={filtr.zeme}
          onPrepni={kod => setFiltr({ ...filtr, zeme: prepni(filtr.zeme, kod) })}
          onVymaz={() => setFiltr({ ...filtr, zeme: [] })}
        />
      </Sekce>

      <Sekce nazev="Styl a povaha" ikona={<Palette size={13} />} pocet={filtr.styly.length + filtr.energie.length + filtr.velikosti.length}>
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
        {!vybranePlemeno && (
          <>
            <p className="mb-1 mt-3 text-[11px] font-semibold uppercase tracking-wide text-[#a2988a]">Velikost plemene</p>
            <Chipy>
              {VELIKOSTI.map(v => (
                <Chip key={v} aktivni={filtr.velikosti.includes(v)} onClick={() => setFiltr({ ...filtr, velikosti: prepni(filtr.velikosti, v) })}>{v}</Chip>
              ))}
            </Chipy>
          </>
        )}
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
  )

  const nahodneJmeno = nahodne ? vysledky.find(j => j.id === nahodne) : null
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
    <Rozvrzeni uzsi plochy={['zvirata-filtr', 'zvirata-nad', 'zvirata-v-mrizce', 'zvirata-pod', 'zvirata-bocni']}>
      <div className="grid items-start gap-6 lg:grid-cols-[268px_1fr]">
        {panelOtevren && <div className="filtr-zaves" onClick={() => setPanelOtevren(false)} aria-hidden />}
        {panel}

        <section>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPanelOtevren(true)}
                className="filtr-tlacitko-mobil inline-flex items-center gap-1.5 rounded-full border border-[#e8dfd2] bg-white px-3 py-1.5 text-[13px] font-semibold"
              >
                <SlidersHorizontal size={14} /> Filtr
                {aktivni.length > 0 && <span className="filtr-pocet">{aktivni.length}</span>}
              </button>
              <p className="text-[13px] text-[#6b6156]">
                <strong className="[font-family:var(--font-syne)] text-lg text-[#2b2723]">{vysledky.length}</strong> jmen
                {vybranePlemeno && <> pro <strong>{vybranePlemeno.nazev}</strong></>}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => vysledky.length && setNahodne(vysledky[Math.floor(Math.random() * vysledky.length)].id)}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#e8dfd2] bg-white px-3 py-1.5 text-[13px] text-[#6b6156] hover:border-[#2b2723]"
                title="Vylosovat jedno jméno z výběru"
              >
                <Dices size={14} /> Překvap mě
              </button>
              <label className="inline-flex items-center gap-1.5 rounded-full border border-[#e8dfd2] bg-white py-1.5 pl-3 pr-1 text-[13px] text-[#6b6156]">
                <ArrowDownAZ size={14} aria-hidden />
                <select
                  value={razeni}
                  onChange={e => setRazeni(e.target.value as Razeni | 'doporucene')}
                  className="bg-transparent pr-1 text-[13px] outline-none"
                  aria-label="Řazení výsledků"
                >
                  {vybranePlemeno && <option value="doporucene">Doporučené pro plemeno</option>}
                  {RAZENI_MOZNOSTI.map(r => <option key={r.id} value={r.id}>{r.nazev}</option>)}
                </select>
              </label>
            </div>
          </div>

          {aktivni.length > 0 && (
            <div className="mb-4">
              <AktivniFiltry polozky={aktivni} />
            </div>
          )}

          {nahodneJmeno && (
            <div className="mb-5 rounded-2xl border-2 border-[#d97757] p-1">
              <p className="px-3 pt-1 text-[11px] font-semibold uppercase tracking-wide text-[#d97757]">Náhodný tip</p>
              <NameCard jmeno={nahodneJmeno} />
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
                <div className="nastup grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {jmena.map(j => <NameCard key={j.id} jmeno={j} />)}
                </div>
              </div>
            ))
          ) : (
            <div className="nastup grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {vysledky.map((j, i) => (
                <NameCard key={j.id} jmeno={j} poradi={razeni === 'doporucene' || razeni === 'popularita' ? i + 1 : undefined} />
              ))}
            </div>
          )}

        </section>
      </div>
    </Rozvrzeni>
  )
}
