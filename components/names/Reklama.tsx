'use client'

// Nativní reklamní plocha — vypadá jako běžná karta webu, po 30 s se překlopí
// na další kreativu. Označení „sponzorováno" je povinné (zákon o regulaci
// reklamy i DSA), proto zůstává vždy viditelné, jen nekřičí.
//
// Vzhled řídí třídy v globals.css, ne utility — díky tomu má úzká varianta
// v postranním sloupci menší typografii bez duplikace stylů.
//
// Kreativy chodí ze samostatné reklamní služby. Když neodpoví, plocha se
// nevykreslí vůbec — web se jmény tím není nijak dotčený.

import { useEffect, useRef, useState } from 'react'
import {
  Baby, Bone, Calendar, Cat, Dog, Globe, House, Languages, ShieldCheck,
  Sparkles, Star, Type, Users, type LucideIcon,
} from 'lucide-react'
import { INTERVAL_MS, inzeratyProPlochu, type Inzerat } from '@/lib/names/reklamy'
import { ADRESA_REKLAM, nactiInzeraty } from '@/lib/names/reklamniServer'

const IKONY: Record<string, LucideIcon> = {
  bone: Bone, dog: Dog, house: House, 'shield-check': ShieldCheck, cat: Cat,
  star: Star, baby: Baby, sparkles: Sparkles, type: Type, users: Users,
  globe: Globe, calendar: Calendar, languages: Languages,
}

export default function Reklama({
  plocha, varianta = 'karta',
}: {
  plocha: string
  /** 'karta' do mřížky, 'pruh' na šířku obsahu, 'uzka' do postranního sloupce */
  varianta?: 'karta' | 'pruh' | 'uzka'
}) {
  // Bez nastavené služby jedeme na ukázkových kreativách (vývoj a náhled).
  const [inzeraty, setInzeraty] = useState<Inzerat[]>(
    () => (ADRESA_REKLAM ? [] : inzeratyProPlochu(plocha)),
  )
  const [index, setIndex] = useState(0)
  const [preklapi, setPreklapi] = useState(false)
  const pauza = useRef(false)

  useEffect(() => {
    if (!ADRESA_REKLAM) return
    let zive = true
    nactiInzeraty(plocha).then(nove => {
      if (zive && nove && nove.length > 0) setInzeraty(nove)
    })
    return () => { zive = false }
  }, [plocha])

  useEffect(() => {
    if (inzeraty.length < 2) return
    const tiche = typeof window !== 'undefined'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const id = window.setInterval(() => {
      if (pauza.current) return
      if (tiche) {
        setIndex(i => (i + 1) % inzeraty.length)
        return
      }
      setPreklapi(true)
      window.setTimeout(() => {
        setIndex(i => (i + 1) % inzeraty.length)
        setPreklapi(false)
      }, 260)
    }, INTERVAL_MS)
    return () => window.clearInterval(id)
  }, [inzeraty.length])

  // Prázdná plocha = žádná reklama. Radši nic než díra v rozvržení.
  if (inzeraty.length === 0) return null

  const inzerat = inzeraty[index % inzeraty.length]
  const Ikona = IKONY[inzerat.ikona ?? ''] ?? Sparkles

  return (
    <aside
      className={`reklama-plocha ${varianta === 'pruh' ? 'reklama-pruh' : ''} ${varianta === 'uzka' ? 'reklama-uzka' : ''}`}
      aria-label="Sponzorovaný obsah"
      onMouseEnter={() => { pauza.current = true }}
      onMouseLeave={() => { pauza.current = false }}
      onFocus={() => { pauza.current = true }}
      onBlur={() => { pauza.current = false }}
    >
      <div className={`reklama-list ${preklapi ? 'je-preklopena' : ''}`}>
        <div className="reklama-hlava">
          <span className="reklama-znacka">
            {/* Logo jde přes obyčejný <img> — leží na cizí adrese (reklamní službě),
                kterou optimalizátor obrázků stejně nezpracuje. */}
            {inzerat.logo
              ? <img src={inzerat.logo} alt="" width={16} height={16} className="reklama-logo" loading="lazy" />
              : <Ikona size={14} strokeWidth={2} aria-hidden />}
            <span>{inzerat.znacka}</span>
          </span>
          <span className="reklama-stitek">
            <span className="stitek-dlouhy">sponzorováno</span>
            <span className="stitek-kratky">reklama</span>
          </span>
        </div>

        <h3 className="reklama-nadpis">{inzerat.nadpis}</h3>
        <p className="reklama-text">{inzerat.text}</p>

        <a href={inzerat.odkaz} rel="sponsored nofollow noopener" className="reklama-cta">
          {inzerat.cta} <span aria-hidden>→</span>
        </a>

        {inzeraty.length > 1 && (
          <div className="reklama-tecky" aria-hidden>
            {inzeraty.map((_, i) => <span key={i} className={i === index ? 'je' : ''} />)}
          </div>
        )}
      </div>
    </aside>
  )
}
