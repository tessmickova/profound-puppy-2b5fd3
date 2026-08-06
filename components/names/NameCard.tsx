import { KATEGORIE_INFO } from '@/lib/names/types'
import type { Jmeno } from '@/lib/names/types'
import { zemePodleKodu } from '@/lib/names/data'

export default function NameCard({ jmeno, poradi }: { jmeno: Jmeno; poradi?: number }) {
  const zeme = zemePodleKodu(jmeno.zeme)
  const kat = KATEGORIE_INFO[jmeno.kategorie]
  return (
    <article className="flex flex-col gap-2 rounded-2xl border border-[#efe7da] bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <h3 className="[font-family:var(--font-syne)] text-xl font-bold leading-tight">
          {poradi != null && <span className="mr-1 text-sm font-semibold text-[#c4b8a7]">{poradi}.</span>}
          {jmeno.jmeno}
        </h3>
        <span className="whitespace-nowrap text-sm" title={`${kat.nazev} · ${zeme?.nazev ?? ''}`}>
          {kat.emoji} {zeme?.vlajka}
        </span>
      </div>
      <p className="text-sm text-[#6b6156]">{jmeno.vyznam}</p>
      <div className="mt-auto flex flex-wrap items-center gap-1.5 text-[11px]">
        {jmeno.styly.map(s => (
          <span key={s} className="rounded-full bg-[#f3ecdf] px-2 py-0.5 text-[#6b6156]">{s}</span>
        ))}
        <span className="rounded-full bg-[#e8f0e6] px-2 py-0.5 text-[#4f6a4a]">{jmeno.energie}</span>
        {jmeno.velikost && (
          <span className="rounded-full bg-[#e9eef6] px-2 py-0.5 text-[#4a5c7d]">{jmeno.velikost} plemeno</span>
        )}
        <span className="rounded-full bg-[#f6e9ee] px-2 py-0.5 text-[#8a4a63]">
          {jmeno.slabiky} {jmeno.slabiky === 1 ? 'slabika' : jmeno.slabiky <= 4 ? 'slabiky' : 'slabik'}
        </span>
      </div>
      <div className="flex items-center gap-2" title={`Líbivost ${jmeno.popularita}/100`}>
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#f3ecdf]">
          <div className="h-full rounded-full bg-gradient-to-r from-[#e7a15c] to-[#d97757]" style={{ width: `${jmeno.popularita}%` }} />
        </div>
        <span className="text-[11px] font-semibold text-[#8a7f71]">{jmeno.popularita}</span>
      </div>
    </article>
  )
}
