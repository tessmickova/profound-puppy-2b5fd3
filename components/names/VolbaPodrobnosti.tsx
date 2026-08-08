'use client'

// Přepínače toho, co se u nalezených jmen ukazuje. Ne každý chce numerologii
// a ne každého zajímá svátek — tady si to každý poskládá po svém.

import { Eye } from 'lucide-react'
import { PODROBNOSTI, usePodrobnosti } from '@/lib/names/podrobnosti'

export default function VolbaPodrobnosti() {
  const { ukazuje, prepni, vratVychozi } = usePodrobnosti()

  return (
    <div>
      <div className="podrobnosti-hlava">
        <h3 className="flex items-center gap-1.5 [font-family:var(--font-nadpis)] text-[13px] font-bold text-[#2b2723]">
          <Eye size={13} aria-hidden /> Co u jmen ukázat
        </h3>
        <button
          onClick={vratVychozi}
          className="textove text-[12px] text-[#8a7f71] underline decoration-dotted hover:text-[#2b2723]"
        >
          Výchozí
        </button>
      </div>
      <div className="podrobnosti-chipy">
        {PODROBNOSTI.map(p => (
          <button
            key={p.klic}
            type="button"
            className="podrobnost-chip"
            aria-pressed={ukazuje(p.klic)}
            title={p.popis}
            onClick={() => prepni(p.klic)}
          >
            {ukazuje(p.klic) && <span className="fajfka" aria-hidden>✓</span>}
            {p.nazev}
          </button>
        ))}
      </div>
    </div>
  )
}
