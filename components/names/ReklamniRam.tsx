'use client'

// Reklamní rám kolem obsahu.
//
// Web má deset pevných pozic — pět v levém sloupci, pět v pravém. Sloupce jsou
// přišpendlené k oknu: roluje jen obsah stránky, reklama zůstává. Každá pozice
// má dvě strany a po patnácti sekundách se překlopí na tu druhou, kde je jiná
// kampaň. Prodaných ploch je tedy dvacet.
//
// Když se sloupce do okna nevejdou (užší displeje, tablety, telefony),
// schovají se a místo nich naskočí úzká lišta úplně nahoře. V ní jede jedna
// reklama (na širším tabletu dvě) a po deseti sekundách ji vystřídá další.
//
// Všech deset pozic se překlápí v jednu a tu samou chvíli. Rozházené
// překlápění by znamenalo, že se koutkem oka pořád něco hýbe — takhle se
// obraz jednou za patnáct sekund změní a pak je zase klid.
//
// Rotace se zastaví při najetí myší, doteku i zaměření z klávesnice; vypnout
// se dá tlačítkem v liště. Kdo má v systému vypnuté animace, uvidí prosté
// prostřídání bez otáčení. Označení „reklama" je vidět vždycky.

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Baby, Bone, Calendar, Cat, Dog, Globe, House, Languages, Pause, Play,
  ShieldCheck, Sparkles, Star, Type, Users, type LucideIcon,
} from 'lucide-react'
import Link from 'next/link'
import {
  INTERVAL_LISTA_MS, INTERVAL_MS, PLOCH, PLOCHY, POZIC,
  inzeratyProPlochu, type Inzerat,
} from '@/lib/names/reklamy'
import { ADRESA_REKLAM, nactiVsechnyInzeraty } from '@/lib/names/reklamniServer'
import { usePrepinace } from '@/lib/names/nastaveni'

const IKONY: Record<string, LucideIcon> = {
  bone: Bone, dog: Dog, house: House, 'shield-check': ShieldCheck, cat: Cat,
  star: Star, baby: Baby, sparkles: Sparkles, type: Type, users: Users,
  globe: Globe, calendar: Calendar, languages: Languages,
}

/** Od téhle šířky se vejdou postranní sloupce i obsah. */
const SIRKA_SLOUPCU = 1240
/** Od téhle šířky se do lišty nahoře vejdou dvě reklamy vedle sebe. */
const SIRKA_DVOU = 700

/** Plochy jedné pozice: strana A je lichá, strana B sudá. */
function stranyPozice(pozice: number): [string, string] {
  return [`plocha-${pozice * 2 - 1}`, `plocha-${pozice * 2}`]
}

type Mapa = Record<string, Inzerat[]>

/** Ukázkové kreativy pro vývoj; v provozu je nahradí odpověď služby. */
function ukazkoveKreativy(): Mapa {
  return Object.fromEntries(PLOCHY.map(id => [id, inzeratyProPlochu(id)]))
}

export default function ReklamniRam() {
  const [mapa, setMapa] = useState<Mapa>(() => (ADRESA_REKLAM ? {} : ukazkoveKreativy()))
  const [rezim, setRezim] = useState<'sloupce' | 'lista' | null>(null)
  const [dve, setDve] = useState(false)
  const [tise, setTise] = useState(false)
  const [stopnuto, setStopnuto] = useState(false)
  const [otoceno, setOtoceno] = useState(false)
  const pauza = useRef(false)
  const prepinace = usePrepinace()

  useEffect(() => {
    if (!ADRESA_REKLAM) return
    let zive = true
    nactiVsechnyInzeraty().then(nove => {
      if (zive && nove) setMapa(nove)
    })
    return () => { zive = false }
  }, [])

  // Kam se reklama vejde, poznáme až v prohlížeči — proto až v efektu.
  useEffect(() => {
    const zmer = () => {
      setRezim(window.innerWidth >= SIRKA_SLOUPCU ? 'sloupce' : 'lista')
      setDve(window.innerWidth >= SIRKA_DVOU)
    }
    zmer()
    window.addEventListener('resize', zmer)
    return () => window.removeEventListener('resize', zmer)
  }, [])

  useEffect(() => {
    const dotaz = window.matchMedia('(prefers-reduced-motion: reduce)')
    const zmer = () => setTise(dotaz.matches)
    zmer()
    dotaz.addEventListener('change', zmer)
    return () => dotaz.removeEventListener('change', zmer)
  }, [])

  // Jeden časovač pro všechny pozice — překlopí se naráz, ne jedna po druhé.
  useEffect(() => {
    if (rezim !== 'sloupce' || stopnuto) return
    const id = window.setInterval(() => {
      if (!pauza.current) setOtoceno(o => !o)
    }, INTERVAL_MS)
    return () => window.clearInterval(id)
  }, [rezim, stopnuto])

  const drz = useCallback((ano: boolean) => { pauza.current = ano }, [])
  // Klepnutí na pauzu je jasný pokyn — přidržení myší nebo prstem, které
  // mohlo zůstat viset z předchozího doteku, tím zároveň pouštíme.
  const prepni = useCallback(() => {
    pauza.current = false
    setStopnuto(s => !s)
  }, [])

  if (rezim === null) return null
  // Vypnuto z adminu — plochy zmizí, kampaně v databázi zůstávají.
  if (!prepinace.reklamy) return null

  const spolecne = { mapa, tise, pauza, stopnuto, drz }

  if (rezim === 'lista') {
    return (
      <ReklamniLista {...spolecne} kolik={dve ? 2 : 1} prepni={prepni} />
    )
  }

  return (
    <>
      <ReklamniSloupec strana="vlevo" pozice={[1, 2, 3, 4, 5]} otoceno={otoceno} {...spolecne} />
      <ReklamniSloupec strana="vpravo" pozice={[6, 7, 8, 9, 10]} otoceno={otoceno} {...spolecne} />
    </>
  )
}

// ── postranní sloupec ────────────────────────────────────────────────────

interface SpolecneVlastnosti {
  mapa: Mapa
  tise: boolean
  pauza: React.MutableRefObject<boolean>
  stopnuto: boolean
  drz: (ano: boolean) => void
  prepni: () => void
}

function ReklamniSloupec({
  strana, pozice, otoceno, mapa, tise, drz,
}: Omit<SpolecneVlastnosti, 'prepni' | 'pauza' | 'stopnuto'>
  & { strana: 'vlevo' | 'vpravo'; pozice: number[]; otoceno: boolean }) {
  return (
    <aside
      className={`reklamni-sloupec je-${strana}`}
      aria-label="Sponzorovaný obsah"
      onPointerEnter={() => drz(true)}
      onPointerLeave={() => drz(false)}
      onPointerCancel={() => drz(false)}
      onFocusCapture={() => drz(true)}
      onBlurCapture={() => drz(false)}
      onTouchEnd={() => drz(false)}
    >
      {pozice.map(p => (
        <Pozice key={p} pozice={p} otoceno={otoceno} mapa={mapa} tise={tise} />
      ))}
    </aside>
  )
}

/** Jedna pozice ve sloupci: dvě strany, mezi kterými se přepíná. */
function Pozice({
  pozice, otoceno, mapa, tise,
}: { pozice: number; otoceno: boolean; mapa: Mapa; tise: boolean }) {
  const [strany] = useState(() => stranyPozice(pozice))

  return (
    <div className={`reklamni-pozice ${tise ? 'je-tise' : ''}`}>
      <div className={`reklamni-otoc ${otoceno ? 'je-otocena' : ''}`}>
        <Karta plocha={strany[0]} mapa={mapa} tvar="prední" />
        <Karta plocha={strany[1]} mapa={mapa} tvar="zadní" />
      </div>
    </div>
  )
}

/** Jedna reklamní karta — buď kampaň, nebo nabídka volného místa. */
function Karta({ plocha, mapa, tvar }: { plocha: string; mapa: Mapa; tvar: 'prední' | 'zadní' }) {
  const cislo = Number(plocha.replace('plocha-', ''))
  const inzerat = mapa[plocha]?.[0]
  const Ikona = inzerat ? (IKONY[inzerat.ikona ?? ''] ?? Sparkles) : Sparkles

  if (!inzerat) {
    // Volné místo není díra v rozvržení, ale nabídka. Odkaz míří rovnou
    // na rezervaci téhle konkrétní plochy, ne na obecnou stránku o reklamě —
    // zákazník tak nemusí hledat, na které místo zrovna klepl.
    return (
      <Link
        href={`/reklama?plocha=plocha-${cislo}`}
        className={`reklamni-karta je-volna je-${tvar === 'prední' ? 'pred' : 'za'}`}
      >
        <span className="reklamni-znak">reklama</span>
        <span className="reklamni-dlazdice" aria-hidden><Sparkles size={20} strokeWidth={1.75} /></span>
        <span className="reklamni-nadpis">Volné místo pro vaši reklamu</span>
        <span className="reklamni-popis">plocha {cislo} z {PLOCH}</span>
        <span className="reklamni-cta">Rezervovat <span aria-hidden>→</span></span>
      </Link>
    )
  }

  return (
    <a
      href={inzerat.odkaz}
      rel="sponsored nofollow noopener"
      className={`reklamni-karta je-${tvar === 'prední' ? 'pred' : 'za'}`}
    >
      <span className="reklamni-znak">reklama</span>
      {/* Firmy sem dávají logo; ikona je jen náhrada, dokud ho nenahrají. */}
      <span className={`reklamni-dlazdice ${inzerat.logo ? 'je-logo' : ''}`} aria-hidden>
        {inzerat.logo
          ? <img src={inzerat.logo} alt="" loading="lazy" />
          : <Ikona size={20} strokeWidth={1.75} />}
      </span>
      <span className="reklamni-nadpis">{inzerat.nadpis}</span>
      <span className="reklamni-popis">{inzerat.znacka}</span>
      <span className="reklamni-cta">{inzerat.cta} <span aria-hidden>→</span></span>
    </a>
  )
}

// ── lišta nahoře ─────────────────────────────────────────────────────────

/**
 * Na užších displejích jde reklama do lišty nahoře: 52 px, přišpendlená
 * k oknu, jedna kampaň (na širším tabletu dvě) a po deseti sekundách další.
 */
function ReklamniLista({
  mapa, tise, pauza, stopnuto, drz, prepni, kolik,
}: SpolecneVlastnosti & { kolik: number }) {
  const [od, setOd] = useState(0)

  useEffect(() => {
    if (stopnuto) return
    const id = window.setInterval(() => {
      if (!pauza.current) setOd(i => (i + kolik) % PLOCH)
    }, INTERVAL_LISTA_MS)
    return () => window.clearInterval(id)
  }, [kolik, pauza, stopnuto])

  const videt = Array.from({ length: kolik }, (_, i) => `plocha-${((od + i) % PLOCH) + 1}`)

  return (
    <aside
      className="reklamni-lista"
      aria-label="Sponzorovaný obsah"
      onPointerEnter={() => drz(true)}
      onPointerLeave={() => drz(false)}
      onPointerCancel={() => drz(false)}
      onFocusCapture={() => drz(true)}
      onBlurCapture={() => drz(false)}
      onTouchEnd={() => drz(false)}
    >
      <span className="reklamni-lista-znak">reklama</span>
      <div className={`reklamni-lista-obsah ${tise ? 'je-tise' : ''}`}>
        {videt.map(p => <RadekListy key={p} plocha={p} mapa={mapa} />)}
      </div>
      <TlacitkoPauzy stopnuto={stopnuto} prepni={prepni} maly />
    </aside>
  )
}

function RadekListy({ plocha, mapa }: { plocha: string; mapa: Mapa }) {
  const cislo = Number(plocha.replace('plocha-', ''))
  const inzerat = mapa[plocha]?.[0]
  const Ikona = inzerat ? (IKONY[inzerat.ikona ?? ''] ?? Sparkles) : Sparkles

  if (!inzerat) {
    return (
      <Link href={`/reklama?plocha=plocha-${cislo}`} className="reklamni-lista-box je-volna">
        <Sparkles size={15} strokeWidth={1.75} aria-hidden />
        <span className="reklamni-lista-znacka">Volné místo</span>
        <span className="reklamni-lista-nadpis">pro vaši reklamu — plocha {cislo} z {PLOCH}</span>
        <span className="reklamni-lista-cta">Rezervovat <span aria-hidden>→</span></span>
      </Link>
    )
  }

  return (
    <a href={inzerat.odkaz} rel="sponsored nofollow noopener" className="reklamni-lista-box">
      {inzerat.logo
        ? <img src={inzerat.logo} alt="" className="reklamni-lista-logo" loading="lazy" />
        : <Ikona size={15} strokeWidth={1.75} aria-hidden />}
      <span className="reklamni-lista-znacka">{inzerat.znacka}</span>
      <span className="reklamni-lista-nadpis">{inzerat.nadpis}</span>
      <span className="reklamni-lista-cta">{inzerat.cta} <span aria-hidden>→</span></span>
    </a>
  )
}

function TlacitkoPauzy({
  stopnuto, prepni, maly = false,
}: { stopnuto: boolean; prepni: () => void; maly?: boolean }) {
  return (
    <button
      type="button"
      onClick={prepni}
      className={`reklamni-pauza ${maly ? 'je-mala' : ''}`}
      aria-label={stopnuto ? 'Spustit střídání reklam' : 'Zastavit střídání reklam'}
      title={stopnuto ? 'Spustit střídání reklam' : 'Zastavit střídání reklam'}
    >
      {stopnuto ? <Play size={12} aria-hidden /> : <Pause size={12} aria-hidden />}
    </button>
  )
}

export { POZIC }
