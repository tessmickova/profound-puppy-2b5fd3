// Filtrování, řazení a hledání nejlepších shod (příjmení, měsíc narození, styl).

import type { Energie, Jmeno, Kategorie, Styl, Velikost } from './types'
import type { Plemeno } from './types'

export const kolator = new Intl.Collator('cs')

// ── štítky: hity, trendy a originální krásky ─────────────────────────────────

/** 🔥 Hit — dlouhodobě nejoblíbenější jména. */
export const jeHit = (j: Jmeno) => j.popularita >= 88

/** 📈 Trendy — moderní jména, která právě letí nahoru. */
export const jeTrendy = (j: Jmeno) => j.styly.includes('moderní')

/** 💎 Originál — méně obvyklá, ale krásná jména (skryté poklady). */
export const jeOriginal = (j: Jmeno) => j.popularita <= 80

// ── řazení ───────────────────────────────────────────────────────────────────

export type Razeni = 'abecedne' | 'abecedne-z' | 'popularita' | 'nejkratsi' | 'nejdelsi' | 'slabiky'

export const RAZENI_MOZNOSTI: { id: Razeni; nazev: string }[] = [
  { id: 'abecedne',   nazev: 'Abecedně A–Z' },
  { id: 'abecedne-z', nazev: 'Abecedně Z–A' },
  { id: 'popularita', nazev: 'Nejoblíbenější' },
  { id: 'nejkratsi',  nazev: 'Nejkratší' },
  { id: 'nejdelsi',   nazev: 'Nejdelší' },
  { id: 'slabiky',    nazev: 'Podle slabik' },
]

export function serad(jmena: Jmeno[], razeni: Razeni): Jmeno[] {
  const kopie = [...jmena]
  switch (razeni) {
    case 'abecedne':   return kopie.sort((a, b) => kolator.compare(a.jmeno, b.jmeno))
    case 'abecedne-z': return kopie.sort((a, b) => kolator.compare(b.jmeno, a.jmeno))
    case 'popularita': return kopie.sort((a, b) => b.popularita - a.popularita || kolator.compare(a.jmeno, b.jmeno))
    case 'nejkratsi':  return kopie.sort((a, b) => a.delka - b.delka || kolator.compare(a.jmeno, b.jmeno))
    case 'nejdelsi':   return kopie.sort((a, b) => b.delka - a.delka || kolator.compare(a.jmeno, b.jmeno))
    case 'slabiky':    return kopie.sort((a, b) => a.slabiky - b.slabiky || kolator.compare(a.jmeno, b.jmeno))
  }
}

// ── filtr ────────────────────────────────────────────────────────────────────

export interface Filtr {
  kategorie: Kategorie[]
  zeme: string[]
  styly: Styl[]
  energie: Energie[]
  velikosti: Velikost[]
  pismeno: string | null
  maxDelka: number | null
  maxSlabiky: number | null
  hledat: string
}

export const PRAZDNY_FILTR: Filtr = {
  kategorie: [], zeme: [], styly: [], energie: [], velikosti: [],
  pismeno: null, maxDelka: null, maxSlabiky: null, hledat: '',
}

const bezDiakritiky = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

export function filtruj(jmena: Jmeno[], f: Filtr): Jmeno[] {
  const hledat = bezDiakritiky(f.hledat.trim())
  return jmena.filter(j => {
    if (f.kategorie.length && !f.kategorie.includes(j.kategorie)) return false
    if (f.zeme.length && !f.zeme.includes(j.zeme)) return false
    if (f.styly.length && !f.styly.some(s => j.styly.includes(s))) return false
    if (f.energie.length && !f.energie.includes(j.energie)) return false
    if (f.velikosti.length && j.velikost && !f.velikosti.includes(j.velikost)) return false
    if (f.pismeno && bezDiakritiky(j.jmeno[0]) !== bezDiakritiky(f.pismeno)) return false
    if (f.maxDelka && j.delka > f.maxDelka) return false
    if (f.maxSlabiky && j.slabiky > f.maxSlabiky) return false
    if (hledat && !bezDiakritiky(j.jmeno).includes(hledat) && !bezDiakritiky(j.vyznam).includes(hledat)) return false
    return true
  })
}

/** Jména vhodná pro dané plemeno: velikost (u psů), energie, styl a bonus za zemi původu. */
export function jmenaProPlemeno(jmena: Jmeno[], plemeno: Plemeno): Jmeno[] {
  const kandidati = jmena.filter(j => {
    if (plemeno.druh === 'pes' && j.kategorie !== 'pes' && j.kategorie !== 'fenka') return false
    if (plemeno.druh === 'kocka' && j.kategorie !== 'kocour' && j.kategorie !== 'kocka') return false
    if (plemeno.velikost && j.velikost && j.velikost !== plemeno.velikost) return false
    return true
  })
  const skore = (j: Jmeno) => {
    let s = j.popularita
    if (j.zeme === plemeno.puvod) s += 25            // jméno z domoviny plemene
    if (j.energie === plemeno.energie) s += 15
    s += j.styly.filter(st => plemeno.styly.includes(st)).length * 10
    return s
  }
  return kandidati.sort((a, b) => skore(b) - skore(a) || kolator.compare(a.jmeno, b.jmeno))
}

// ── způsob života → doporučené nastavení filtru ──────────────────────────────

export interface ZpusobZivota {
  id: string
  nazev: string
  emoji: string
  popis: string
  energie: Energie[]
  styly: Styl[]
  velikosti: Velikost[]
}

export const ZPUSOBY_ZIVOTA: ZpusobZivota[] = [
  { id: 'sport',   nazev: 'Sportovec',        emoji: '🏃', popis: 'Běh, výlety, agility — parťák do terénu.',        energie: ['živá'],               styly: ['sportovní', 'hravé'],     velikosti: ['střední', 'velké'] },
  { id: 'byt',     nazev: 'Městský byt',      emoji: '🏢', popis: 'Menší prostor, procházky v parku.',               energie: ['klidná', 'vyvážená'], styly: ['moderní', 'elegantní'],   velikosti: ['malé', 'střední'] },
  { id: 'zahrada', nazev: 'Dům se zahradou',  emoji: '🏡', popis: 'Prostor na hlídání i dovádění.',                  energie: ['vyvážená', 'živá'],   styly: ['tradiční', 'přírodní'],   velikosti: ['střední', 'velké'] },
  { id: 'rodina',  nazev: 'Rodina s dětmi',   emoji: '👨‍👩‍👧', popis: 'Trpělivý kamarád, jméno, které děti vysloví.', energie: ['vyvážená'],           styly: ['hravé', 'tradiční'],      velikosti: ['střední'] },
  { id: 'pohoda',  nazev: 'Klid a pohoda',    emoji: '🛋️', popis: 'Večery na gauči, mazlení na plný úvazek.',        energie: ['klidná'],             styly: ['elegantní', 'hravé'],     velikosti: ['malé'] },
  { id: 'styl',    nazev: 'Milovník stylu',   emoji: '✨', popis: 'Jméno jako vizitka — elegance především.',         energie: ['klidná', 'vyvážená'], styly: ['elegantní', 'královské'], velikosti: [] },
]

// ── nejlepší shoda pro děti: příjmení + měsíc + preference ───────────────────

export interface VstupShody {
  pohlavi: 'kluk' | 'holka'
  prijmeni: string
  mesic: number | null       // 1–12, null = nezadáno
  styly: Styl[]
  zeme: string[]
}

export interface Shoda {
  jmeno: Jmeno
  skore: number              // 0–100
  duvody: string[]
}

const SAMOHLASKY = 'aáeéěiíoóuúůyý'
const jeSamohlaska = (ch: string) => SAMOHLASKY.includes(ch.toLowerCase())

function slabiky(text: string): number {
  let n = 0, v = false
  for (const ch of text.toLowerCase()) {
    const je = jeSamohlaska(ch)
    if (je && !v) n++
    v = je
  }
  return Math.max(1, n)
}

/** Souzvuk jména s příjmením (0–100) + slovní zdůvodnění. */
export function souzvukSPrijmenim(jmeno: string, prijmeni: string): { body: number; duvody: string[] } {
  const j = bezDiakritiky(jmeno)
  const p = bezDiakritiky(prijmeni)
  let body = 70
  const duvody: string[] = []

  const konecJmena = j[j.length - 1]
  const zacatekPrijmeni = p[0]

  if (j[0] === p[0]) { body += 8; duvody.push('hezká aliterace — stejné počáteční písmeno') }

  if (konecJmena === zacatekPrijmeni) {
    body -= 12; duvody.push('jméno končí písmenem, kterým příjmení začíná — hůř se vyslovuje')
  } else if (jeSamohlaska(konecJmena) && jeSamohlaska(zacatekPrijmeni)) {
    body -= 8; duvody.push('dvě samohlásky na hranici jmen se slévají')
  } else if (jeSamohlaska(konecJmena) !== jeSamohlaska(zacatekPrijmeni)) {
    body += 8; duvody.push('plynulý přechod mezi jménem a příjmením')
  }

  if (j.length >= 2 && p.length >= 2 && j.slice(-2) === p.slice(-2)) {
    body -= 15; duvody.push('jméno se s příjmením rýmuje — dvojice zní jako říkanka')
  }

  const sj = slabiky(j), sp = slabiky(p), celkem = sj + sp
  if (celkem >= 4 && celkem <= 6) { body += 10; duvody.push('příjemný rytmus celého jména') }
  else if (celkem >= 8) { body -= 8; duvody.push('celé jméno je hodně dlouhé') }
  if (sj !== sp) { body += 4 } else { body -= 3; duvody.push('stejný počet slabik působí monotónně') }

  return { body: Math.max(0, Math.min(100, body)), duvody }
}

export function najdiNejlepsiShody(jmena: Jmeno[], vstup: VstupShody, limit = 12): Shoda[] {
  const prijmeni = vstup.prijmeni.trim()
  const kandidati = jmena.filter(j =>
    j.kategorie === vstup.pohlavi &&
    (!vstup.zeme.length || vstup.zeme.includes(j.zeme))
  )

  const shody: Shoda[] = kandidati.map(j => {
    const duvody: string[] = []
    let skore = 0

    // 1) souzvuk s příjmením (váha 45 %) — bez příjmení váhu přebírá popularita
    if (prijmeni) {
      const s = souzvukSPrijmenim(j.jmeno, prijmeni)
      skore += s.body * 0.45
      duvody.push(...s.duvody)
    } else {
      skore += j.popularita * 0.45
    }

    // 2) oblíbenost (25 %)
    skore += j.popularita * 0.25
    if (j.popularita >= 90) duvody.push('dlouhodobě velmi oblíbené jméno')

    // 3) měsíc narození (15 %)
    if (vstup.mesic) {
      if (j.mesice.includes(vstup.mesic)) {
        skore += 15
        duvody.push('ladí s měsícem narození (svátek či sezóna jména)')
      } else if (j.mesice.some(m => Math.abs(m - vstup.mesic!) === 1 || Math.abs(m - vstup.mesic!) === 11)) {
        skore += 8
        duvody.push('svátek či sezóna jména je hned vedle měsíce narození')
      } else {
        skore += 4
      }
    } else {
      skore += 8
    }

    // 4) preferovaný styl (15 %)
    if (vstup.styly.length) {
      const prekryv = j.styly.filter(s => vstup.styly.includes(s)).length
      if (prekryv > 0) {
        skore += Math.min(15, prekryv * 10)
        duvody.push(`odpovídá stylu, který se vám líbí (${j.styly.filter(s => vstup.styly.includes(s)).join(', ')})`)
      }
    } else {
      skore += 8
    }

    return { jmeno: j, skore: Math.round(Math.max(0, Math.min(100, skore))), duvody }
  })

  return shody
    .sort((a, b) => b.skore - a.skore || kolator.compare(a.jmeno.jmeno, b.jmeno.jmeno))
    .slice(0, limit)
}
