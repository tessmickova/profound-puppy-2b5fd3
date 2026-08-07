'use client'

// Nativní reklamní plocha — vypadá jako běžná karta webu, po 5 s se překlopí
// na další kreativu. Označení „sponzorováno" je povinné (zákon o regulaci
// reklamy i DSA), proto zůstává vždy viditelné, jen nekřičí.

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
  /** 'karta' sedne do mřížky jmen, 'pruh' je na šířku obsahu */
  varianta?: 'karta' | 'pruh'
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
      className={`reklama-plocha ${varianta === 'pruh' ? 'reklama-pruh' : ''}`}
      aria-label="Sponzorovaný obsah"
      onMouseEnter={() => { pauza.current = true }}
      onMouseLeave={() => { pauza.current = false }}
      onFocus={() => { pauza.current = true }}
      onBlur={() => { pauza.current = false }}
    >
      <div className={`reklama-list ${preklapi ? 'je-preklopena' : ''}`}>
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 text-[#8a7f71]">
            <Ikona size={15} strokeWidth={2} aria-hidden />
            <span className="text-[11px] font-medium">{inzerat.znacka}</span>
          </span>
          <span className="rounded-full border border-[#e8dfd2] px-1.5 py-px text-[9px] uppercase tracking-wide text-[#a2988a]">
            sponzorováno
          </span>
        </div>

        <h3 className="[font-family:var(--font-syne)] text-base font-bold leading-tight text-[#2b2723]">
          {inzerat.nadpis}
        </h3>
        <p className="mt-1 flex-1 text-[13px] leading-snug text-[#6b6156]">{inzerat.text}</p>

        <a
          href={inzerat.odkaz}
          rel="sponsored nofollow noopener"
          className="mt-3 inline-flex w-fit items-center gap-1 rounded-full border border-[#e8dfd2] px-3 py-1.5 text-[13px] font-semibold text-[#2b2723] transition-colors hover:border-[#2b2723] hover:bg-[#faf6ef]"
        >
          {inzerat.cta} <span aria-hidden>→</span>
        </a>

        {inzeraty.length > 1 && (
          <div className="mt-2.5 flex gap-1" aria-hidden>
            {inzeraty.map((_, i) => (
              <span
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  i === index ? 'bg-[#d9a68f]' : 'bg-[#f0e7da]'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </aside>
  )
}
