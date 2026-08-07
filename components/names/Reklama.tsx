'use client'

// Nativní reklamní plocha — vypadá jako běžná karta webu, po 5 s se překlopí
// na další kreativu. Označení „sponzorováno" je povinné (zákon o regulaci
// reklamy i DSA), proto zůstává vždy viditelné, jen nekřičí.
//
// Vzhled řídí třídy v globals.css, ne utility — díky tomu má úzká varianta
// v postranním sloupci menší typografii bez duplikace stylů.

import { useEffect, useRef, useState } from 'react'
import {
  Baby, Bone, Calendar, Cat, Dog, Globe, House, Languages, ShieldCheck,
  Sparkles, Star, Type, Users, type LucideIcon,
} from 'lucide-react'
import { INTERVAL_MS, inzeratyProPlochu } from '@/lib/names/reklamy'

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
  const inzeraty = inzeratyProPlochu(plocha)
  const [index, setIndex] = useState(0)
  const [preklapi, setPreklapi] = useState(false)
  const pauza = useRef(false)

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

  const inzerat = inzeraty[index]
  const Ikona = IKONY[inzerat.ikona] ?? Sparkles

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
            <Ikona size={14} strokeWidth={2} aria-hidden />
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
