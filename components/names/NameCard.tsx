'use client'

import { KATEGORIE_INFO, POHLAVI_INFO } from '@/lib/names/types'
import type { Jmeno } from '@/lib/names/types'
import { jeMezinarodni, zemePodleKodu } from '@/lib/names/data'
import { dobreSeVola, jeHit, jeOriginal, jeTrendy, povelKolize } from '@/lib/names/logic'
import { useOblibene } from '@/lib/names/oblibene'

export function Stitky({ jmeno }: { jmeno: Jmeno }) {
  const kolize = povelKolize(jmeno)
  return (
    <>
      {jeHit(jmeno) && (
        <span className="rounded-full bg-[#fdeaea] px-2 py-0.5 text-[11px] font-semibold text-[#b3403a]" title="Dlouhodobě nejoblíbenější jména">🔥 hit</span>
      )}
      {jeTrendy(jmeno) && (
        <span className="rounded-full bg-[#e7f0fb] px-2 py-0.5 text-[11px] font-semibold text-[#3563a8]" title="Moderní jméno, které právě letí">📈 trendy</span>
      )}
      {jeOriginal(jmeno) && (
        <span className="rounded-full bg-[#f2ecfa] px-2 py-0.5 text-[11px] font-semibold text-[#6d4fa1]" title="Méně obvyklé, ale krásné — skrytý poklad">💎 originál</span>
      )}
      {dobreSeVola(jmeno) && (
        <span className="rounded-full bg-[#e6f2ee] px-2 py-0.5 text-[11px] font-semibold text-[#2c7a5f]" title="1–2 slabiky a samohláska na konci — na jméno pes dobře slyší">📣 dobře se volá</span>
      )}
      {kolize && (
        <span className="rounded-full bg-[#fbf0dd] px-2 py-0.5 text-[11px] font-semibold text-[#9a6b1f]" title={`Zní podobně jako povel „${kolize}" — pes se může plést`}>⚠️ zní jako povel</span>
      )}
      {jmeno.unisex && (
        <span className="rounded-full bg-[#eef2e4] px-2 py-0.5 text-[11px] font-semibold text-[#5f7233]" title="Používá se pro kluky i holčičky">⚪ unisex</span>
      )}
      {jmeno.pohlavi === 'unisex' && (
        <span className="rounded-full bg-[#eef2e4] px-2 py-0.5 text-[11px] font-semibold text-[#5f7233]" title="Hodí se samci i samičce">⚥ pro obě pohlaví</span>
      )}
      {jeMezinarodni(jmeno) && (
        <span className="rounded-full bg-[#e4f0f4] px-2 py-0.5 text-[11px] font-semibold text-[#2f6f84]" title="Používá se ve více zemích — funguje i v zahraničí">🌍 mezinárodní</span>
      )}
      {jmeno.svatek && (
        <span className="rounded-full bg-[#f4ecdd] px-2 py-0.5 text-[11px] font-semibold text-[#8a6d2f]" title="Jmeniny v českém kalendáři">📅 svátek {jmeno.svatek}</span>
      )}
    </>
  )
}

export function Srdicko({ id, velke }: { id: string; velke?: boolean }) {
  const { je, prepni } = useOblibene()
  const oblibene = je(id)
  return (
    <button
      type="button"
      onClick={() => prepni(id)}
      aria-label={oblibene ? 'Odebrat z oblíbených' : 'Přidat do oblíbených'}
      title={oblibene ? 'Odebrat z oblíbených' : 'Přidat do oblíbených'}
      className={`${velke ? 'text-2xl' : 'text-lg'} leading-none transition-transform hover:scale-125 ${oblibene ? '' : 'opacity-45 hover:opacity-100'}`}
    >
      {oblibene ? '❤️' : '🤍'}
    </button>
  )
}

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
        <div className="flex items-center gap-1.5">
          <span
            className="whitespace-nowrap text-sm"
            title={`${kat.nazev}${jmeno.pohlavi ? ` · ${POHLAVI_INFO[jmeno.pohlavi].nazev}` : ''} · ${zeme?.nazev ?? ''}`}
          >
            {kat.emoji}
            {jmeno.pohlavi && jmeno.pohlavi !== 'unisex' && (
              <span className={jmeno.pohlavi === 'samec' ? 'text-[#4a5c7d]' : 'text-[#8a4a63]'}>
                {POHLAVI_INFO[jmeno.pohlavi].znak}
              </span>
            )}
            {' '}{zeme?.vlajka}
          </span>
          <Srdicko id={jmeno.id} />
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5 empty:hidden">
        <Stitky jmeno={jmeno} />
      </div>
      <p className="text-sm text-[#6b6156]">{jmeno.vyznam}</p>
      {jmeno.domacky && jmeno.domacky.length > 0 && (
        <p className="text-xs text-[#8a7f71]">doma: {jmeno.domacky.join(', ')}</p>
      )}
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
