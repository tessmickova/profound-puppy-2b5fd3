// Filtrování, řazení a hledání nejlepších shod (příjmení, měsíc narození, styl).

import type { Energie, Jmeno, Kategorie, PohlaviZvirete, Styl, Velikost } from './types'
import type { Plemeno } from './types'
import { vlnaJmena } from './vlny'

export const kolator = new Intl.Collator('cs')

// ── štítky ───────────────────────────────────────────────────────────────────
//
// Dřív se počítaly z `popularita` a ze stylu. To bylo špatně: `popularita`
// je redakční skóre líbivosti, ne četnost, a styl „moderní" neříká nic
// o době. Kvůli tomu dostávala **Denisa štítek „originál"** — přitom to
// není originální jméno, jen jméno generace dnešních maminek.
//
// Dobovou informaci nese `vlna` (viz `lib/names/vlny.ts`). Jméno, které
// vlnu nemá, se neoznačuje — „nevíme" není totéž co „průměrné".

/** 🔥 Hit — dlouhodobě nejoblíbenější jména. */
export const jeHit = (j: Jmeno) => j.popularita >= 88

/** 📈 Jde nahoru — modernější jména, kterých přibývá. Hlavní proud. */
export const jeVzestup = (j: Jmeno) => vlnaJmena(j) === 'stoupa'

/** 🕰️ Vrací se — babiččina jména zpátky v módě. Vedlejší, ale výrazný proud. */
export const jeNavrat = (j: Jmeno) => vlnaJmena(j) === 'retro'

/** Obojí dohromady — „co se bude dávat", když se rozdíl neřeší. */
export const jeVyhled = (j: Jmeno) => jeVzestup(j) || jeNavrat(j)

/** 💎 Vzácné bez ohledu na dobu. Skutečný originál, ne odkvetlá klasika. */
export const jeVzacne = (j: Jmeno) => vlnaJmena(j) === 'vzacne'

/** 👶 Nejčastější jména dnešních miminek. */
export const jeVrchol = (j: Jmeno) => vlnaJmena(j) === 'vrchol'

/** ⏳ Stálice — dává se v každé generaci. */
export const jeStalice = (j: Jmeno) => vlnaJmena(j) === 'stalice'

/** 🕰️ Jméno generace rodičů — dnes se dává málo. */
export const jeDoznivajici = (j: Jmeno) => vlnaJmena(j) === 'dozniva'

// ── volatelnost psích jmen (kynologická doporučení: 1–2 slabiky, samohláska
//    na konci, žádná podobnost s povelem) ─────────────────────────────────────

const POVELY = ['sedni', 'lehni', 'fuj', 'aport', 'zustan', 'dej', 'ne', 'sem']

const bezDiakritikyText = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

/** 📣 Dobře se volá — krátké psí jméno končící samohláskou. */
export function dobreSeVola(j: Jmeno): boolean {
  if (j.kategorie !== 'pes' && j.kategorie !== 'fenka') return false
  return j.slabiky <= 2 && /[aáeéěiíoóuúůyý]$/i.test(j.jmeno) && !povelKolize(j)
}

/** Vrátí povel, se kterým se jméno může plést (nebo null). */
export function povelKolize(j: Jmeno): string | null {
  if (j.kategorie !== 'pes' && j.kategorie !== 'fenka') return null
  const n = bezDiakritikyText(j.jmeno)
  for (const p of POVELY) {
    if (p.length >= 3 ? n.startsWith(p.slice(0, 3)) : n.startsWith(p)) return p
  }
  return null
}

// ── numerologie, znamení a monogram ──────────────────────────────────────────

const NUMEROLOGIE_VYZNAM: Record<number, string> = {
  1: 'vůdce', 2: 'diplomat', 3: 'tvořivý duch', 4: 'stavitel', 5: 'dobrodruh',
  6: 'pečovatel', 7: 'myslitel', 8: 'vládce', 9: 'idealista',
}

/** Číslo jména podle pythagorejské numerologie (1–9) + krátký význam. */
export function numerologie(jmeno: string): { cislo: number; vyznam: string } {
  let soucet = 0
  for (const ch of bezDiakritikyText(jmeno)) {
    const kod = ch.charCodeAt(0) - 96 // a=1 … z=26
    if (kod >= 1 && kod <= 26) soucet += ((kod - 1) % 9) + 1
  }
  let cislo = soucet
  while (cislo > 9) cislo = String(cislo).split('').reduce((a, c) => a + Number(c), 0)
  if (cislo < 1) cislo = 1
  return { cislo, vyznam: NUMEROLOGIE_VYZNAM[cislo] }
}

/** Znamení zvěrokruhu připadající na daný měsíc (vždy dvě). */
export const ZNAMENI_MESICE: Record<number, string> = {
  1: 'Kozoroh / Vodnář', 2: 'Vodnář / Ryby', 3: 'Ryby / Beran', 4: 'Beran / Býk',
  5: 'Býk / Blíženci', 6: 'Blíženci / Rak', 7: 'Rak / Lev', 8: 'Lev / Panna',
  9: 'Panna / Váhy', 10: 'Váhy / Štír', 11: 'Štír / Střelec', 12: 'Střelec / Kozoroh',
}

const NEVHODNE_MONOGRAMY = new Set(['SS', 'WC', 'BS', 'PMS', 'KKK'])

/** Iniciály jména a příjmení + upozornění na nešťastné monogramy. */
export function monogram(jmeno: string, prijmeni: string): { text: string; varovani: string | null } {
  const inicialy = (jmeno[0] ?? '') + (prijmeni.trim()[0] ?? '')
  const text = inicialy.toUpperCase().split('').join('. ') + (inicialy ? '.' : '')
  const varovani = NEVHODNE_MONOGRAMY.has(inicialy.toUpperCase())
    ? `iniciály ${text} mohou být terčem vtipů — zvažte jiné jméno`
    : null
  return { text, varovani }
}

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
  /** u zvířat: pro samce, samičku, nebo obojí */
  pohlavi: PohlaviZvirete[]
  pismeno: string | null
  konciNa: string | null
  maxDelka: number | null
  maxSlabiky: number | null
  hledat: string
}

export const PRAZDNY_FILTR: Filtr = {
  kategorie: [], zeme: [], styly: [], energie: [], velikosti: [], pohlavi: [],
  pismeno: null, konciNa: null, maxDelka: null, maxSlabiky: null, hledat: '',
}

const bezDiakritiky = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

/** Filtr pohlaví u zvířat — unisex jména se ukazují u samců i samiček. */
export function sedneNaPohlavi(j: Jmeno, vybrana: PohlaviZvirete[]): boolean {
  if (!vybrana.length || !j.pohlavi) return true
  if (j.pohlavi === 'unisex') return true
  return vybrana.includes(j.pohlavi)
}

export function filtruj(jmena: Jmeno[], f: Filtr): Jmeno[] {
  const hledat = bezDiakritiky(f.hledat.trim())
  return jmena.filter(j => {
    if (f.kategorie.length && !f.kategorie.includes(j.kategorie)) return false
    if (f.zeme.length && !f.zeme.includes(j.zeme)) return false
    if (f.styly.length && !f.styly.some(s => j.styly.includes(s))) return false
    if (f.energie.length && !f.energie.includes(j.energie)) return false
    if (f.velikosti.length && j.velikost && !f.velikosti.includes(j.velikost)) return false
    if (f.pohlavi?.length && !sedneNaPohlavi(j, f.pohlavi)) return false
    if (f.pismeno && bezDiakritiky(j.jmeno[0]) !== bezDiakritiky(f.pismeno)) return false
    if (f.konciNa && bezDiakritiky(j.jmeno[j.jmeno.length - 1]) !== bezDiakritiky(f.konciNa)) return false
    if (f.maxDelka && j.delka > f.maxDelka) return false
    if (f.maxSlabiky && j.slabiky > f.maxSlabiky) return false
    if (hledat
      && !bezDiakritiky(j.jmeno).includes(hledat)
      && !bezDiakritiky(j.vyznam).includes(hledat)
      && !(j.domacky ?? []).some(d => bezDiakritiky(d).includes(hledat))) return false
    return true
  })
}

/** Jména vhodná pro dané plemeno: nejdřív ručně doporučená (historie, film,
 *  zima…), pak podle velikosti, energie, stylu a země původu plemene. */
export function jmenaProPlemeno(jmena: Jmeno[], plemeno: Plemeno): Jmeno[] {
  const doporucena = new Map((plemeno.doporucena ?? []).map((n, i) => [n.toLowerCase(), i]))
  const kandidati = jmena.filter(j => {
    if (plemeno.druh === 'pes' && j.kategorie !== 'pes' && j.kategorie !== 'fenka') return false
    if (plemeno.druh === 'kocka' && j.kategorie !== 'kocour' && j.kategorie !== 'kocka') return false
    if (plemeno.velikost && j.velikost && j.velikost !== plemeno.velikost
        && !doporucena.has(j.jmeno.toLowerCase())) return false
    return true
  })
  const skore = (j: Jmeno) => {
    let s = j.popularita
    const kurator = doporucena.get(j.jmeno.toLowerCase())
    if (kurator !== undefined) s += 500 - kurator * 5 // kurátorský výběr drží pořadí na špici
    if (j.zeme === plemeno.puvod) s += 25             // jméno z domoviny plemene
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
  /** jména rodičů a sourozence — jméno dítěte má ladit s celou rodinou */
  maminka?: string
  tatinek?: string
  sourozenec?: string
  /** další sourozenci; jméno má ladit ke každému z nich */
  sourozenci?: string[]
}

export interface Shoda {
  jmeno: Jmeno
  skore: number              // 0–100
  duvody: string[]
  /** štítek „ladí s oběma rodiči / s celou rodinou", když jsou zadaní členové rodiny */
  rodinnyStitek?: { text: string; popis: string } | null
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

/**
 * Souzvuk jména s příjmením (0–100) + slovní zdůvodnění.
 *
 * `NEUTRALNI_SOUZVUK` je výchozí hodnota, od které pravidla přidávají a
 * ubírají. Kdo skóre používá jako **příspěvek** k jinému hodnocení, musí
 * počítat s odchylkou od téhle hodnoty, ne s číslem samotným — jinak by
 * pouhé vyplnění příjmení posunulo úplně všechno.
 *
 * `kladne[i]` říká, jestli `duvody[i]` mluví pro, nebo proti. Bez toho by
 * se „jméno se rýmuje s příjmením" dalo omylem ukázat jako výhoda.
 */
export const NEUTRALNI_SOUZVUK = 70

export function souzvukSPrijmenim(jmeno: string, prijmeni: string): {
  body: number; duvody: string[]; kladne: boolean[]
} {
  const j = bezDiakritiky(jmeno)
  const p = bezDiakritiky(prijmeni)
  let body = NEUTRALNI_SOUZVUK
  const duvody: string[] = []
  const kladne: boolean[] = []
  const pridej = (zmena: number, text: string) => {
    body += zmena
    duvody.push(text)
    kladne.push(zmena >= 0)
  }

  const konecJmena = j[j.length - 1]
  const zacatekPrijmeni = p[0]

  if (j[0] === p[0]) pridej(8, 'hezká aliterace — stejné počáteční písmeno')

  if (konecJmena === zacatekPrijmeni) {
    pridej(-12, 'jméno končí písmenem, kterým příjmení začíná — hůř se vyslovuje')
  } else if (jeSamohlaska(konecJmena) && jeSamohlaska(zacatekPrijmeni)) {
    pridej(-8, 'dvě samohlásky na hranici jmen se slévají')
  } else if (jeSamohlaska(konecJmena) !== jeSamohlaska(zacatekPrijmeni)) {
    pridej(8, 'plynulý přechod mezi jménem a příjmením')
  }

  if (j.length >= 2 && p.length >= 2 && j.slice(-2) === p.slice(-2)) {
    pridej(-15, 'jméno se s příjmením rýmuje — dvojice zní jako říkanka')
  }

  const sj = slabiky(j), sp = slabiky(p), celkem = sj + sp
  if (celkem >= 4 && celkem <= 6) pridej(10, 'příjemný rytmus celého jména')
  else if (celkem >= 8) pridej(-8, 'celé jméno je hodně dlouhé')
  if (sj !== sp) { body += 4 } else { pridej(-3, 'stejný počet slabik působí monotónně') }

  return { body: Math.max(0, Math.min(100, body)), duvody, kladne }
}

// ── sourozenecký ladič: jméno k bráškovi či sestřičce ────────────────────────

export interface VstupSourozenec {
  pohlavi: 'kluk' | 'holka'
  sourozenec: string
  prijmeni: string
}

export function najdiKSourozenci(jmena: Jmeno[], vstup: VstupSourozenec, limit = 12): Shoda[] {
  const surName = vstup.sourozenec.trim()
  if (!surName) return []
  const klicS = bezDiakritiky(surName)
  const referencni = jmena.find(j =>
    (j.kategorie === 'kluk' || j.kategorie === 'holka') && bezDiakritiky(j.jmeno) === klicS)
  const kandidati = jmena.filter(j =>
    j.kategorie === vstup.pohlavi && bezDiakritiky(j.jmeno) !== klicS)

  const shody: Shoda[] = kandidati.map(j => {
    const duvody: string[] = []
    let skore = 45 + j.popularita * 0.2

    if (referencni) {
      const prekryv = j.styly.filter(s => referencni.styly.includes(s))
      if (prekryv.length) { skore += Math.min(16, prekryv.length * 8); duvody.push(`stejný styl jako ${referencni.jmeno} (${prekryv.join(', ')})`) }
      if (j.zeme === referencni.zeme) { skore += 10; duvody.push('stejná země původu — jména ladí kulturně') }
      if (Math.abs(j.popularita - referencni.popularita) <= 12) { skore += 6; duvody.push('podobně oblíbená dvojice') }
    }
    if (Math.abs(j.slabiky - slabiky(surName)) <= 1) { skore += 8; duvody.push('podobný rytmus obou jmen') }
    if (bezDiakritiky(j.jmeno[0]) === klicS[0]) { skore -= 6; duvody.push('stejná iniciála — doma se může plést') }
    if (j.jmeno.length >= 2 && surName.length >= 2
      && bezDiakritiky(j.jmeno.slice(-2)) === klicS.slice(-2)) { skore -= 12; duvody.push(`rýmuje se se jménem ${surName}`) }

    if (vstup.prijmeni.trim()) {
      const s = souzvukSPrijmenim(j.jmeno, vstup.prijmeni)
      skore += (s.body - 70) * 0.3
      duvody.push(...s.duvody.slice(0, 2))
    }

    return { jmeno: j, skore: Math.round(Math.max(0, Math.min(100, skore))), duvody }
  })

  return shody
    .sort((a, b) => b.skore - a.skore || kolator.compare(a.jmeno.jmeno, b.jmeno.jmeno))
    .slice(0, limit)
}

/** Zjistí, jestli je jedno jméno podobou druhého (Petr → Petra, Josef → Josefína). */
function jePodobaJmena(a: string, b: string): boolean {
  const x = bezDiakritiky(a), y = bezDiakritiky(b)
  if (x === y) return false
  const [kratsi, delsi] = x.length <= y.length ? [x, y] : [y, x]
  if (delsi.startsWith(kratsi) && kratsi.length >= 3 && delsi.length - kratsi.length <= 4) return true
  let spolecne = 0
  while (spolecne < kratsi.length && kratsi[spolecne] === delsi[spolecne]) spolecne++
  return spolecne >= 4
}

export interface ClenProShodu {
  jmeno: string
  /** 'maminka' | 'tatínek' | 'sourozenec' — kdo to v rodině je */
  kdo: string
  /** druhý pád pro věty: „jméno maminky" */
  koho: string
}

export interface RodinnaShoda {
  body: number
  duvody: string[]
  /** členové rodiny, se kterými jméno prokazatelně ladí */
  ladiS: string[]
  /** počet členů, proti kterým se hodnotilo */
  zClenu: number
}

/** Jak jméno ladí se jmény rodičů a sourozence — styl, původ, rytmus, podoba. */
export function rodinnaHarmonie(j: Jmeno, clenove: ClenProShodu[], jmena: Jmeno[]): RodinnaShoda {
  let body = 70
  const duvody: string[] = []
  const ladiS: string[] = []
  const rodina = clenove.filter(c => c.jmeno.trim())

  for (const clen of rodina) {
    const klicC = bezDiakritiky(clen.jmeno)
    let sladeno = 0  // kladné signály minus záporné pro tohoto člena

    if (bezDiakritiky(j.jmeno) === klicC) {
      body -= 15
      duvody.push(`úplně stejné jméno jako ${clen.kdo} se doma plete`)
      continue
    }
    if (jePodobaJmena(j.jmeno, clen.jmeno)) {
      body += 14; sladeno += 2
      duvody.push(`krásně odkazuje na jméno ${clen.koho} (${clen.jmeno} → ${j.jmeno})`)
    } else if (j.jmeno.length >= 2 && clen.jmeno.length >= 2
      && bezDiakritiky(j.jmeno.slice(-2)) === klicC.slice(-2)) {
      body -= 8; sladeno -= 2
      duvody.push(`rýmuje se se jménem ${clen.koho}`)
    }

    // najdeme jméno člena rodiny v katalogu a porovnáme styl a původ
    const ref = jmena.find(x =>
      (x.kategorie === 'kluk' || x.kategorie === 'holka') && bezDiakritiky(x.jmeno) === klicC)
    if (ref) {
      const prekryv = j.styly.filter(s => ref.styly.includes(s))
      if (prekryv.length) {
        body += Math.min(10, prekryv.length * 6); sladeno += 1
        duvody.push(`ladí stylem se jménem ${clen.koho} (${prekryv.join(', ')})`)
      }
      if (j.zeme === ref.zeme) {
        body += 5; sladeno += 1
        duvody.push(`stejný původ jako jméno ${clen.koho}`)
      }
      if (Math.abs(j.popularita - ref.popularita) <= 12) {
        body += 3; sladeno += 1
        duvody.push(`podobně oblíbené jméno jako ${clen.koho}`)
      }
    }

    if (sladeno > 0) ladiS.push(clen.kdo)
  }

  // rodinný rytmus: nejhezčí je, když se délky jmen střídají
  if (rodina.length >= 2) {
    const slabikyRodiny = rodina.map(c => slabiky(c.jmeno))
    if (slabikyRodiny.every(s => s === j.slabiky)) {
      body -= 6
      duvody.push('všechna jména v rodině by byla stejně dlouhá — zní to monotónně')
    } else if (slabikyRodiny.every(s => s !== j.slabiky)) {
      body += 6
      duvody.push('rytmus jmen se v rodině hezky střídá')
    }
  }

  // aliterace se členem rodiny — jen jednou
  const aliterace = rodina.find(c => bezDiakritiky(c.jmeno)[0] === bezDiakritiky(j.jmeno)[0]
    && bezDiakritiky(c.jmeno) !== bezDiakritiky(j.jmeno))
  if (aliterace) {
    body += 4
    duvody.push(`stejná iniciála jako ${aliterace.kdo}`)
  }

  return { body: Math.max(0, Math.min(100, body)), duvody, ladiS, zClenu: rodina.length }
}

/** Štítek shrnující, s kým v rodině jméno ladí (nebo null). */
export function rodinnyStitek(r: RodinnaShoda): { text: string; popis: string } | null {
  const rodice = r.ladiS.filter(k => k === 'maminka' || k === 'tatínek')
  if (r.zClenu >= 3 && r.ladiS.length === r.zClenu) {
    return { text: '👪 ladí s celou rodinou', popis: 'Jméno sedí ke jménům obou rodičů i sourozence.' }
  }
  if (rodice.length === 2) {
    return { text: '💞 ladí s oběma rodiči', popis: 'Jméno sedí ke jménu maminky i tatínka.' }
  }
  if (r.ladiS.includes('sourozenec') && rodice.length === 1) {
    return { text: '👫 ladí s rodičem i sourozencem', popis: 'Jméno sedí ke jménu jednoho rodiče i sourozence.' }
  }
  if (r.ladiS.length === 1) {
    return { text: `✨ ladí se jménem ${r.ladiS[0] === 'sourozenec' ? 'sourozence' : r.ladiS[0]}`, popis: 'Jméno sedí k jednomu členu rodiny.' }
  }
  return null
}

// ── doporučení do rodinného profilu: další jména, která ladí s celou rodinou ─

export function najdiProRodinu(jmena: Jmeno[], clenove: string[], kategorie: Kategorie, limit = 6): Shoda[] {
  const cleny = clenove.map(c => c.trim()).filter(Boolean)
  if (!cleny.length) return []
  const obsazena = new Set(cleny.map(bezDiakritikyText))
  const refs = cleny
    .map(c => jmena.find(x => bezDiakritikyText(x.jmeno) === bezDiakritikyText(c)))
    .filter((x): x is Jmeno => Boolean(x))

  const zemeCetnost = new Map<string, number>()
  const stylyRodiny = new Set<Styl>()
  for (const r of refs) {
    zemeCetnost.set(r.zeme, (zemeCetnost.get(r.zeme) ?? 0) + 1)
    r.styly.forEach(s => stylyRodiny.add(s))
  }
  const dominantniZeme = [...zemeCetnost.entries()].sort((a, b) => b[1] - a[1])[0]?.[0]

  const kandidati = jmena.filter(j =>
    j.kategorie === kategorie && !obsazena.has(bezDiakritikyText(j.jmeno)))

  const shody: Shoda[] = kandidati.map(j => {
    const duvody: string[] = []
    let skore = 40 + j.popularita * 0.3

    for (const c of cleny) {
      if (jePodobaJmena(j.jmeno, c)) {
        skore += 8; duvody.push(`odkazuje na jméno ${c}`)
      } else if (j.jmeno.length >= 2 && c.length >= 2
        && bezDiakritikyText(j.jmeno.slice(-2)) === bezDiakritikyText(c.slice(-2))) {
        skore -= 5; duvody.push(`rýmuje se se jménem ${c}`)
      }
    }
    const prekryv = j.styly.filter(s => stylyRodiny.has(s))
    if (prekryv.length) {
      skore += Math.min(12, prekryv.length * 6)
      duvody.push(`nese rodinný styl (${prekryv.join(', ')})`)
    }
    if (dominantniZeme && j.zeme === dominantniZeme) {
      skore += 7; duvody.push('ladí s převažujícím původem jmen v rodině')
    }
    if (cleny.some(c => bezDiakritikyText(c)[0] === bezDiakritikyText(j.jmeno)[0])) {
      skore -= 3; duvody.push('stejná iniciála jako někdo z rodiny — může se plést')
    }
    if (dobreSeVola(j)) {
      skore += 6; duvody.push('dobře se volá — krátké a končí samohláskou')
    }
    return { jmeno: j, skore: Math.round(Math.max(0, Math.min(100, skore))), duvody }
  })

  return shody
    .sort((a, b) => b.skore - a.skore || kolator.compare(a.jmeno.jmeno, b.jmeno.jmeno))
    .slice(0, limit)
}

export function najdiNejlepsiShody(jmena: Jmeno[], vstup: VstupShody, limit = 12): Shoda[] {
  const prijmeni = vstup.prijmeni.trim()
  // Sourozenců může být víc — druhé dítě je nejčastější situace, třetí
  // není výjimka. Duplicitní zápis téhož jména se počítá jen jednou.
  const sourozenci = [...new Set(
    [vstup.sourozenec ?? '', ...(vstup.sourozenci ?? [])]
      .map(x => x.trim())
      .filter(Boolean),
  )]
  const rodina: ClenProShodu[] = [
    { jmeno: (vstup.maminka ?? '').trim(), kdo: 'maminka', koho: 'maminky' },
    { jmeno: (vstup.tatinek ?? '').trim(), kdo: 'tatínek', koho: 'tatínka' },
    ...sourozenci.map(x => ({ jmeno: x, kdo: 'sourozenec', koho: 'sourozence' })),
  ].filter(c => c.jmeno)

  const kandidati = jmena.filter(j =>
    j.kategorie === vstup.pohlavi &&
    (!vstup.zeme.length || vstup.zeme.includes(j.zeme)) &&
    !rodina.some(c => bezDiakritiky(c.jmeno) === bezDiakritiky(j.jmeno))
  )

  const shody: Shoda[] = kandidati.map(j => {
    const duvody: string[] = []
    // každé kritérium dává 0–100 a má váhu; skóre je vážený průměr zadaných kritérií
    const slozky: [number, number][] = []
    let stitek: { text: string; popis: string } | null = null

    slozky.push([j.popularita, 25])
    if (j.popularita >= 90) duvody.push('dlouhodobě velmi oblíbené jméno')

    if (prijmeni) {
      const s = souzvukSPrijmenim(j.jmeno, prijmeni)
      slozky.push([s.body, 35])
      duvody.push(...s.duvody)
    }

    if (rodina.length) {
      const r = rodinnaHarmonie(j, rodina, jmena)
      slozky.push([r.body, 30])
      duvody.push(...r.duvody)
      stitek = rodinnyStitek(r)
    }

    if (vstup.mesic) {
      if (j.mesice.includes(vstup.mesic)) {
        slozky.push([100, 15])
        duvody.push('ladí s měsícem narození (svátek či sezóna jména)')
      } else if (j.mesice.some(m => Math.abs(m - vstup.mesic!) === 1 || Math.abs(m - vstup.mesic!) === 11)) {
        slozky.push([70, 15])
        duvody.push('svátek či sezóna jména je hned vedle měsíce narození')
      } else {
        slozky.push([40, 15])
      }
    }

    if (vstup.styly.length) {
      const prekryv = j.styly.filter(s => vstup.styly.includes(s))
      slozky.push([prekryv.length ? Math.min(100, 60 + prekryv.length * 40) : 20, 15])
      if (prekryv.length) duvody.push(`odpovídá stylu, který se vám líbí (${prekryv.join(', ')})`)
    }

    const soucetVah = slozky.reduce((a, [, v]) => a + v, 0)
    const skore = Math.round(slozky.reduce((a, [h, v]) => a + h * v, 0) / soucetVah)

    return { jmeno: j, skore: Math.max(0, Math.min(100, skore)), duvody, rodinnyStitek: stitek }
  })

  return shody
    .sort((a, b) => b.skore - a.skore || kolator.compare(a.jmeno.jmeno, b.jmeno.jmeno))
    .slice(0, limit)
}

// ── rychlá analýza jména pro vysouvací panel ─────────────────────────────────

export interface Postreh {
  /** krátký nadpis — jedno až dvě slova */
  popisek: string
  /** heslovitá hodnota, ne věta */
  hodnota: string
  /** volitelné doplnění, proč to stojí za zmínku */
  tip?: string
}

const VYSLOVNOST_TEZKA = /[řžščťďňů]/i

/** Heslovité postřehy o jménu — to, co člověk chce vědět na první pohled. */
export function rychlaAnalyza(j: Jmeno, jeVCesku: boolean): Postreh[] {
  const postrehy: Postreh[] = []

  postrehy.push({
    popisek: 'Délka',
    hodnota: `${j.slabiky} ${j.slabiky === 1 ? 'slabika' : j.slabiky <= 4 ? 'slabiky' : 'slabik'} · ${j.delka} písmen`,
    tip: j.slabiky <= 2 ? 'krátká jména se snadno volají' : undefined,
  })

  const konec = j.jmeno[j.jmeno.length - 1]
  postrehy.push({
    popisek: 'Zvuk',
    hodnota: /[aáeéěiíoóuúůyý]/i.test(konec) ? `končí samohláskou „${konec}"` : `končí souhláskou „${konec}"`,
    tip: /[aáeéěiíoóuúůyý]/i.test(konec) ? 'zní měkce a nese se do dálky' : 'působí pevně a rázně',
  })

  postrehy.push({
    popisek: 'Výslovnost',
    hodnota: VYSLOVNOST_TEZKA.test(j.jmeno)
      ? 'v cizině se s ním zapotí'
      : /^[a-zA-Zá-žÁ-Ž]+$/.test(j.jmeno) ? 'zvládne ji i cizinec' : 'vyžaduje cvik',
  })

  postrehy.push({
    popisek: 'Oblíbenost',
    hodnota: j.popularita >= 90 ? 'velmi vysoká'
      : j.popularita >= 80 ? 'vysoká'
      : j.popularita >= 70 ? 'střední' : 'nižší',
    tip: j.popularita >= 88 ? 've třídě nejspíš nebude samo'
      : j.popularita <= 80 ? 'nepotkáte ho na každém rohu' : undefined,
  })

  postrehy.push({ popisek: 'Povaha jména', hodnota: j.energie })
  postrehy.push({ popisek: 'Styl', hodnota: j.styly.join(', ') })

  if (j.velikost) {
    postrehy.push({ popisek: 'Sedne plemeni', hodnota: `${j.velikost} vzrůstu` })
  }
  if (j.pohlavi === 'unisex') {
    postrehy.push({ popisek: 'Pohlaví', hodnota: 'sedne samci i samičce' })
  }
  if (j.svatek) {
    postrehy.push({ popisek: 'Jmeniny', hodnota: j.svatek })
  }
  if (j.unisex) {
    postrehy.push({ popisek: 'Unisex', hodnota: 'pro kluky i holčičky' })
  }
  if (jeVCesku) {
    postrehy.push({ popisek: 'V Česku', hodnota: 'běžně se tu vyskytuje' })
  }
  if (dobreSeVola(j)) {
    postrehy.push({ popisek: 'Volání', hodnota: 'zvíře na něj dobře slyší', tip: 'krátké a končí samohláskou' })
  }
  const kolize = povelKolize(j)
  if (kolize) {
    postrehy.push({ popisek: 'Pozor', hodnota: `plete se s povelem „${kolize}"` })
  }

  return postrehy
}

/** První písmeno velké — na začátek věty nebo nadpisu. */
export function velke(text: string): string {
  return text ? text[0].toUpperCase() + text.slice(1) : text
}
