'use client'

// Klikatelná stylizovaná mapa světa: kontinenty → země → stránka země.

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { KONTINENTY, ZEME } from '@/lib/names/data'
import type { KontinentId } from '@/lib/names/types'

const TVARY: Record<KontinentId, string> = {
  'severni-amerika': 'M 60,90 Q 130,40 230,55 Q 310,65 330,110 Q 340,150 290,170 Q 250,185 235,230 Q 220,270 185,255 Q 140,235 110,185 Q 75,140 60,90 Z',
  'jizni-amerika':   'M 235,285 Q 280,265 315,290 Q 345,315 330,370 Q 315,430 285,465 Q 262,490 250,455 Q 235,400 225,350 Q 218,310 235,285 Z',
  'evropa':          'M 425,95 Q 470,60 530,65 Q 580,70 590,105 Q 597,140 560,160 Q 520,180 480,170 Q 440,160 428,130 Q 420,110 425,95 Z',
  'afrika':          'M 445,195 Q 505,175 565,195 Q 615,215 610,270 Q 603,330 565,390 Q 535,437 505,420 Q 470,400 458,340 Q 445,280 440,235 Q 438,210 445,195 Z',
  'asie':            'M 605,70 Q 700,40 800,60 Q 890,80 900,140 Q 908,200 850,230 Q 790,258 730,245 Q 665,230 630,190 Q 600,150 598,110 Q 598,85 605,70 Z',
  'australie':       'M 770,330 Q 830,310 880,335 Q 920,360 905,405 Q 890,445 835,450 Q 785,453 765,415 Q 748,375 770,330 Z',
}

const BARVY: Record<KontinentId, { klid: string; aktiv: string }> = {
  'severni-amerika': { klid: '#c9e4d6', aktiv: '#8fcbaa' },
  'jizni-amerika':   { klid: '#f3d9c4', aktiv: '#e5ae7e' },
  'evropa':          { klid: '#cddcf0', aktiv: '#93b6e3' },
  'afrika':          { klid: '#f5e3b8', aktiv: '#e7c26c' },
  'asie':            { klid: '#e5d3ec', aktiv: '#c79fd9' },
  'australie':       { klid: '#f6d2cd', aktiv: '#eb9f94' },
}

const POZICE_ZEMI: Record<string, [number, number]> = {
  cz: [497, 122], sk: [520, 138], de: [478, 104], fr: [447, 133],
  it: [493, 156], es: [430, 155], gb: [441, 88],  se: [507, 68],
  jp: [872, 140], eg: [552, 225], us: [180, 140], br: [288, 360], au: [838, 392],
}

const POPISKY: Record<KontinentId, [number, number]> = {
  'severni-amerika': [170, 105], 'jizni-amerika': [278, 330], 'evropa': [505, 190],
  'afrika': [520, 310], 'asie': [755, 130], 'australie': [838, 435],
}

export default function WorldMap() {
  const [vybrany, setVybrany] = useState<KontinentId | null>(null)
  const [hover, setHover] = useState<KontinentId | null>(null)

  const zemeVyberu = useMemo(
    () => (vybrany ? ZEME.filter(z => z.kontinent === vybrany) : ZEME),
    [vybrany],
  )
  const infoKontinentu = KONTINENTY.find(k => k.id === vybrany)

  return (
    <div className="grid gap-6 lg:grid-cols-[1.6fr,1fr]">
      <div className="self-start rounded-3xl border border-[#e8dfd2] bg-white p-4 shadow-sm">
        <svg viewBox="0 0 960 500" role="img" aria-label="Mapa kontinentů" className="h-auto w-full select-none">
          <rect x="0" y="0" width="960" height="500" rx="24" fill="#eef4f8" />
          {KONTINENTY.map(k => {
            const zvyraznit = vybrany === k.id || hover === k.id
            return (
              <path
                key={k.id}
                d={TVARY[k.id]}
                fill={zvyraznit ? BARVY[k.id].aktiv : BARVY[k.id].klid}
                stroke={zvyraznit ? '#2b2723' : '#ffffff'}
                strokeWidth={zvyraznit ? 2.5 : 2}
                className="cursor-pointer transition-all duration-200"
                onMouseEnter={() => setHover(k.id)}
                onMouseLeave={() => setHover(null)}
                onClick={() => setVybrany(vybrany === k.id ? null : k.id)}
              >
                <title>{k.nazev}</title>
              </path>
            )
          })}
          {KONTINENTY.map(k => (
            <text
              key={`t-${k.id}`}
              x={POPISKY[k.id][0]}
              y={POPISKY[k.id][1]}
              textAnchor="middle"
              className="pointer-events-none"
              fill="#4d443a"
              fontSize="15"
              fontWeight="700"
            >
              {k.nazev}
            </text>
          ))}
          {ZEME.map(z => {
            const [x, y] = POZICE_ZEMI[z.kod]
            const ztlumit = vybrany !== null && z.kontinent !== vybrany
            return (
              <Link key={z.kod} href={`/zeme/${z.kod}`}>
                <g
                  className="cursor-pointer transition-opacity"
                  opacity={ztlumit ? 0.35 : 1}
                  onMouseEnter={() => setHover(z.kontinent)}
                  onMouseLeave={() => setHover(null)}
                >
                  <circle cx={x} cy={y} r="13" fill="white" stroke="#2b2723" strokeWidth="1.5" />
                  <text x={x} y={y + 5} textAnchor="middle" fontSize="14">{z.vlajka}</text>
                  <title>{z.nazev}</title>
                </g>
              </Link>
            )
          })}
        </svg>
        <p className="mt-2 px-2 text-xs text-[#8a7f71]">
          Klikněte na kontinent pro výběr, na vlajku pro přechod na zemi.
        </p>
      </div>

      <div className="rounded-3xl border border-[#e8dfd2] bg-white p-5 shadow-sm">
        <h3 className="[font-family:var(--font-syne)] text-lg font-bold">
          {infoKontinentu ? infoKontinentu.nazev : 'Všechny země'}
        </h3>
        <p className="mt-1 text-sm text-[#8a7f71]">
          {infoKontinentu ? infoKontinentu.popis : 'Vyberte kontinent na mapě, nebo rovnou zemi ze seznamu.'}
        </p>
        <ul className="mt-4 grid gap-2">
          {zemeVyberu.map(z => (
            <li key={z.kod}>
              <Link
                href={`/zeme/${z.kod}`}
                className="flex items-center gap-3 rounded-2xl border border-[#efe7da] px-3 py-2 transition-colors hover:border-[#2b2723] hover:bg-[#faf6ef]"
              >
                <span className="text-2xl">{z.vlajka}</span>
                <span className="flex-1">
                  <span className="block font-semibold">{z.nazev}</span>
                  <span className="block text-xs text-[#8a7f71]">{z.poznamka}</span>
                </span>
                <span aria-hidden className="text-[#c4b8a7]">→</span>
              </Link>
            </li>
          ))}
        </ul>
        {vybrany && (
          <button
            onClick={() => setVybrany(null)}
            className="mt-4 w-full rounded-full border border-[#e8dfd2] px-3 py-1.5 text-sm text-[#6b6156] hover:bg-[#faf6ef]"
          >
            Zobrazit všechny země
          </button>
        )}
      </div>
    </div>
  )
}
