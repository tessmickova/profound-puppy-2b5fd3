// Rozhodovací jádro webu.
//
// Katalog umí ukázat tisíc jmen. To ale není problém, se kterým sem lidé
// chodí — ti přicházejí s nejistotou. Tenhle soubor proto řeší tři věci:
//
//   1. z pár klepnutí odhadnout, co se člověku líbí (`Preference`),
//   2. u každého doporučení umět říct **proč** (`Doporuceni.duvody`),
//   3. postavit dvě až pět jmen vedle sebe tak, aby bylo vidět, čím se
//      liší (`porovnej`) — ne který je „lepší".
//
// Žádné skóre tu není pravděpodobnost. Je to součet pravidel, která jsou
// napsaná na `/metodika` a u každého výsledku rozepsaná.

import { JMENA } from './data'
import { NEUTRALNI_SOUZVUK, souzvukSPrijmenim } from './logic'
import { bezHacku, genitiv, hlaskovani, maDiakritiku, osloveni, vCizine, zkontrolujInicialy } from './cestina'
import { slugJmena } from './slug'
import type { Jmeno, Kategorie, Styl } from './types'

// ── preference ────────────────────────────────────────────────────────────

/**
 * Co o vkusu člověka víme. Každá osa je −1…+1, nula znamená „nevíme".
 * Hodnoty vznikají z toho, co si člověk vybral — neptáme se na ně přímo,
 * protože „chcete tradiční, nebo moderní jméno?" většina lidí neumí
 * zodpovědět dřív, než uvidí příklady.
 */
export interface Preference {
  /** −1 tradiční … +1 moderní */
  modernost: number
  /** −1 domácí … +1 mezinárodní */
  mezinarodnost: number
  /** −1 běžné … +1 neobvyklé */
  neobvyklost: number
  /** −1 krátké … +1 delší */
  delka: number
  /** −1 jemné … +1 výrazné */
  vyraznost: number
}

export const PRAZDNE_PREFERENCE: Preference = {
  modernost: 0, mezinarodnost: 0, neobvyklost: 0, delka: 0, vyraznost: 0,
}

/** Přepočet hodnoty z rozsahu `[od, do]` na osu −1…1. */
function naOsu(hodnota: number, od: number, do_: number): number {
  const t = (hodnota - od) / (do_ - od)
  return Math.max(-1, Math.min(1, t * 2 - 1))
}

/**
 * Osy, na kterých jméno leží. Z nich se počítá shoda s vkusem.
 *
 * Tam, kde jsou v datech čísla (oblíbenost, slabiky), pracujeme se
 * **spojitou** hodnotou. Škatulky „běžné / vzácné" by stovky jmen srovnaly
 * na stejné skóre a pořadí by pak rozhodovala první drobnost, která se
 * připočte — třeba příjmení.
 */
function osy(j: Jmeno): Preference {
  const styl = (s: Styl) => j.styly.includes(s)
  return {
    modernost: styl('moderní') ? 1 : styl('tradiční') ? -1 : 0,
    // Slovensko je nám jazykově blízké, ale už to není „domácí" jméno.
    mezinarodnost: j.zeme === 'cz' ? -1 : j.zeme === 'sk' ? -0.5 : 1,
    // Redakční skóre líbivosti (72–97): čím vyšší, tím běžnější jméno.
    neobvyklost: -naOsu(j.popularita, 74, 92),
    delka: naOsu(j.slabiky, 1.5, 3.5),
    vyraznost: styl('elegantní') || styl('přírodní') ? -1
      : styl('královské') || styl('mytologické') || styl('sportovní') ? 1 : 0,
  }
}

const OSY: (keyof Preference)[] = ['modernost', 'mezinarodnost', 'neobvyklost', 'delka', 'vyraznost']

/**
 * Naučí se z toho, co člověk označil.
 *
 * Kladné volby táhnou preference k sobě, odmítnutá jména od sebe — a to
 * silněji, protože „tohle rozhodně ne" je jistější informace než „tohle je
 * hezké". Hodnoty držíme v rozsahu −1…1, aby pár kliknutí neurčilo všechno.
 */
export function naucSe(vybrana: Jmeno[], odmitnuta: Jmeno[]): Preference {
  const p = { ...PRAZDNE_PREFERENCE }
  const pridej = (j: Jmeno, vaha: number) => {
    const o = osy(j)
    for (const osa of OSY) p[osa] += o[osa] * vaha
  }
  for (const j of vybrana) pridej(j, 1)
  for (const j of odmitnuta) pridej(j, -1.4)

  const delitel = Math.max(1, vybrana.length + odmitnuta.length)
  for (const osa of OSY) {
    p[osa] = Math.max(-1, Math.min(1, p[osa] / delitel))
  }
  return p
}

/** Slovní popis vkusu — aby bylo vidět, co si o člověku web myslí. */
export function popisPreferenci(p: Preference): string[] {
  const popis: string[] = []
  const silne = (v: number) => Math.abs(v) >= 0.34
  if (silne(p.modernost)) popis.push(p.modernost > 0 ? 'spíš moderní jména' : 'spíš tradiční jména')
  if (silne(p.mezinarodnost)) popis.push(p.mezinarodnost > 0 ? 'mezinárodní jména' : 'jména domácí a známá')
  if (silne(p.neobvyklost)) popis.push(p.neobvyklost > 0 ? 'méně obvyklá jména' : 'jména, která lidé znají')
  if (silne(p.delka)) popis.push(p.delka > 0 ? 'delší jména' : 'krátká jména')
  if (silne(p.vyraznost)) popis.push(p.vyraznost > 0 ? 'výrazná jména' : 'jemná jména')
  return popis
}

// ── doporučení ────────────────────────────────────────────────────────────

export interface Duvod {
  /** true = mluví pro jméno, false = mluví proti */
  pro: boolean
  text: string
}

export interface Doporuceni {
  jmeno: Jmeno
  /** 0–100 podle pravidel Světa jmen; není to pravděpodobnost */
  skore: number
  duvody: Duvod[]
}

/** Slovní zařazení skóre. Číslo samo o sobě nic neříká. */
export function slovemSkore(skore: number): string {
  if (skore >= 85) return 'Velmi dobrá shoda'
  if (skore >= 70) return 'Dobrá shoda'
  if (skore >= 55) return 'Částečná shoda'
  return 'Spíš mimo vaše preference'
}

export interface VstupDoporuceni {
  preference: Preference
  kategorie: Kategorie[]
  prijmeni?: string
  /** id jmen, která už člověk zná — nenabízíme je znovu */
  vynech?: string[]
}

/**
 * Doporučí jména a ke každému rozepíše důvody.
 *
 * Skóre začíná na 60 a pravidla ho posouvají nahoru i dolů. Díky tomu se
 * dá u každého jména ukázat, co pro něj mluví a co proti — bez toho by
 * číslo bylo jen dojem s dvěma desetinnými místy.
 */
export function doporuc(vstup: VstupDoporuceni, limit = 12): Doporuceni[] {
  const { preference, kategorie, prijmeni, vynech = [] } = vstup
  const zakazane = new Set(vynech)

  const kandidati = JMENA.filter(j => kategorie.includes(j.kategorie) && !zakazane.has(j.id))

  const hodnocena = kandidati.map((j): Doporuceni => {
    const o = osy(j)
    const duvody: Duvod[] = []
    let skore = 60

    // Shoda vkusu: každá osa přidá nebo ubere podle toho, jak silně
    // se preference a jméno potkávají.
    const popisOsy: Record<keyof Preference, [string, string]> = {
      modernost: ['odpovídá vašemu příklonu k tradičním jménům', 'je moderní, jak jste vybírali'],
      mezinarodnost: ['je domácí a známé', 'funguje i za hranicemi'],
      neobvyklost: ['je jméno, které lidé znají', 'není mezi nejčastějšími'],
      delka: ['je krátké', 'má delší, plnější zvuk'],
      vyraznost: ['zní jemně', 'zní výrazně'],
    }
    // Do skóre se započítá **každá** shoda, i slabá — jinak by se stovky
    // jmen zastavily na stejném čísle a o pořadí by rozhodla první
    // připočtená drobnost. Vypsat důvod má ale smysl až od chvíle, kdy je
    // dost výrazný na to, aby se dal přečíst jako tvrzení.
    const NAPSAT_DUVOD = 0.25
    for (const osa of OSY) {
      const shoda = preference[osa] * o[osa]
      skore += (shoda > 0 ? 7 : 9) * shoda
      if (shoda > NAPSAT_DUVOD) {
        duvody.push({ pro: true, text: popisOsy[osa][preference[osa] > 0 ? 1 : 0] })
      } else if (shoda < -NAPSAT_DUVOD) {
        duvody.push({ pro: false, text: popisOsy[osa][preference[osa] > 0 ? 0 : 1] })
      }
    }

    // Příjmení jméno **doladí**, nepřebije vkus. Proto se počítá odchylka
    // od neutrálního souzvuku, ne jeho absolutní hodnota — jinak by pouhé
    // vyplnění příjmení přeskládalo celý žebříček podle rytmu slabik.
    if (prijmeni?.trim()) {
      const souzvuk = souzvukSPrijmenim(j.jmeno, prijmeni)
      skore += (souzvuk.body - NEUTRALNI_SOUZVUK) * 0.25
      souzvuk.duvody.forEach((d, i) => {
        duvody.push({ pro: souzvuk.kladne[i], text: d })
      })
    }

    return { jmeno: j, skore: Math.max(0, Math.min(100, Math.round(skore))), duvody }
  })

  return hodnocena
    .sort((a, b) => b.skore - a.skore || b.jmeno.popularita - a.jmeno.popularita)
    .slice(0, limit)
}

// ── porovnání finalistů ───────────────────────────────────────────────────

export interface RadekPorovnani {
  /** otázka, kterou si rodič klade */
  otazka: string
  /** odpověď pro každé jméno ve stejném pořadí */
  odpovedi: string[]
  /** true = řádek ukazuje rozdíl mezi jmény, ne jen fakta */
  odlisuje: boolean
}

export interface Porovnani {
  jmena: { jmeno: string; zaznam: Jmeno | null }[]
  radky: RadekPorovnani[]
  /** dvě věty o tom, čím se finalisté opravdu liší */
  vCemSeLisi: string
}

const CETNOST = (j: Jmeno): string =>
  j.popularita >= 88 ? 'patří mezi častější'
    : j.popularita >= 78 ? 'středně časté'
      : 'méně obvyklé'

/**
 * Postaví dvě až pět jmen vedle sebe.
 *
 * Nesnaží se vybrat vítěze — od toho je rodič. Ukazuje, v čem se jména
 * liší, protože právě to člověk při zaseknutém rozhodování nevidí:
 * dvě jména se mu líbí stejně a neví, čím se vlastně rozhodnout.
 */
export function porovnej(zadana: string[], prijmeni?: string): Porovnani {
  const jmena = zadana.map(t => {
    const slug = slugJmena(t)
    const zaznam = JMENA.find(j => slugJmena(j.jmeno) === slug) ?? null
    return { jmeno: zaznam?.jmeno ?? t.trim(), zaznam }
  })

  const radky: RadekPorovnani[] = []
  const pridej = (otazka: string, odpovedi: string[]) => {
    radky.push({ otazka, odpovedi, odlisuje: new Set(odpovedi).size > 1 })
  }

  pridej('Co znamená', jmena.map(x => x.zaznam?.vyznam ?? 'v katalogu ho zatím nemáme'))
  pridej('Jak se oslovuje', jmena.map(x => `${osloveni(x.jmeno)}!`))
  pridej('Bez háčků a čárek', jmena.map(x => (maDiakritiku(x.jmeno) ? bezHacku(x.jmeno) : 'píše se stejně')))
  pridej('Hláskování v Česku', jmena.map(x => (hlaskovani(x.jmeno).snadne ? 'bez vysvětlování' : 'počítejte s vysvětlováním')))
  pridej('Délka', jmena.map(x => {
    const z = x.zaznam
    if (!z) return '—'
    return `${z.delka} písmen, ${z.slabiky} ${z.slabiky === 1 ? 'slabika' : z.slabiky < 5 ? 'slabiky' : 'slabik'}`
  }))
  pridej('Jak často se dává', jmena.map(x => (x.zaznam ? CETNOST(x.zaznam) : '—')))
  pridej('Domácké tvary', jmena.map(x => x.zaznam?.domacky?.join(', ') || 'neevidujeme'))
  pridej('Jmeniny', jmena.map(x => x.zaznam?.svatek ?? 'v českém kalendáři nejsou'))
  pridej('V angličtině', jmena.map(x => {
    const a = vCizine(x.jmeno).find(v => v.jazyk === 'angličtina')!
    return a.jak === 'snadno' ? 'bez potíží' : a.jak === 'jinak-zni' ? 'přečtou jinak' : 'ztratí diakritiku'
  }))

  if (prijmeni?.trim()) {
    pridej(`S příjmením ${prijmeni.trim()}`, jmena.map(x => {
      const s = souzvukSPrijmenim(x.jmeno, prijmeni)
      return s.body >= 6 ? 'velmi dobré' : s.body >= 0 ? 'dobré' : 'zaskřípe'
    }))
    pridej('Iniciály', jmena.map(x => {
      const i = zkontrolujInicialy([x.jmeno, prijmeni])
      return i.poznamka ? `${i.text} — ${i.poznamka}` : i.text
    }))
  }

  return { jmena, radky, vCemSeLisi: shrnRozdil(jmena) }
}

/** Dvě věty o tom, čím se finalisté liší. Jen z toho, co skutečně víme. */
function shrnRozdil(jmena: { jmeno: string; zaznam: Jmeno | null }[]): string {
  const znama = jmena.filter(x => x.zaznam) as { jmeno: string; zaznam: Jmeno }[]
  if (znama.length < 2) {
    return 'Aspoň dvě jména musíme mít v katalogu, abychom je uměli porovnat.'
  }

  const casti: string[] = []
  const nej = (vyber: (z: Jmeno) => number) =>
    [...znama].sort((a, b) => vyber(b.zaznam) - vyber(a.zaznam))

  const podleDelky = nej(z => z.delka)
  if (podleDelky[0].zaznam.delka - podleDelky[podleDelky.length - 1].zaznam.delka >= 3) {
    casti.push(`${podleDelky[0].jmeno} je znatelně delší než ${podleDelky[podleDelky.length - 1].jmeno}`)
  }

  const domaci = znama.filter(x => x.zaznam.zeme === 'cz' || x.zaznam.zeme === 'sk')
  const cizi = znama.filter(x => x.zaznam.zeme !== 'cz' && x.zaznam.zeme !== 'sk')
  if (domaci.length && cizi.length) {
    casti.push(`${domaci[0].jmeno} působí česky, ${cizi[0].jmeno} mezinárodně`)
  }

  const podleCetnosti = nej(z => z.popularita)
  if (podleCetnosti[0].zaznam.popularita - podleCetnosti[podleCetnosti.length - 1].zaznam.popularita >= 10) {
    casti.push(
      `${podleCetnosti[0].jmeno} uslyšíte častěji než ${podleCetnosti[podleCetnosti.length - 1].jmeno}`,
    )
  }

  if (!casti.length) {
    return 'Jména jsou si v měřitelných věcech blízká — rozhodne spíš to, které vám lépe sedí v ústech.'
  }
  return velkeP(casti.join('; ')) + '.'
}

const velkeP = (t: string) => (t ? t[0].toUpperCase() + t.slice(1) : t)

// ── test jména s příjmením ────────────────────────────────────────────────

export interface BodTestu {
  otazka: string
  odpoved: string
  /** 'dobre' | 'zvazte' | 'neutral' — nikdy „špatně" */
  stav: 'dobre' | 'zvazte' | 'neutral'
}

/**
 * Praktický test celého jména.
 *
 * Záměrně nevynáší verdikt „dobré / špatné jméno". Ukazuje, co se
 * s tím jménem bude v běžném životě dít, a nechává rozhodnutí na rodiči.
 */
export function otestuj(jmeno: string, prijmeni: string, druheJmeno?: string): BodTestu[] {
  const j = jmeno.trim()
  const p = prijmeni.trim()
  if (!j) return []

  const body: BodTestu[] = []
  const cele = [j, druheJmeno?.trim(), p].filter(Boolean).join(' ')

  body.push({ otazka: 'Celé jméno', odpoved: cele, stav: 'neutral' })
  body.push({ otazka: 'Jak na něj budete volat', odpoved: `${osloveni(j)}!`, stav: 'neutral' })
  body.push({ otazka: 'Ve větě', odpoved: `Bez ${genitiv(j)} to nezačneme.`, stav: 'neutral' })

  if (p) {
    const s = souzvukSPrijmenim(j, p)
    body.push({
      otazka: 'Přechod jméno–příjmení',
      odpoved: s.duvody.length ? s.duvody.join(' · ') : 'nic nedrhne',
      stav: s.body >= 6 ? 'dobre' : s.body >= 0 ? 'neutral' : 'zvazte',
    })

    const i = zkontrolujInicialy([j, druheJmeno ?? '', p])
    body.push({
      otazka: 'Iniciály',
      odpoved: i.poznamka ? `${i.text} — ${i.poznamka}` : `${i.text} — nic nápadného`,
      stav: i.poznamka ? 'zvazte' : 'dobre',
    })
  }

  const h = hlaskovani(j)
  body.push({
    otazka: 'Bude ho muset hláskovat?',
    odpoved: h.duvod,
    stav: h.snadne ? 'dobre' : 'zvazte',
  })

  if (maDiakritiku(j) || maDiakritiku(p)) {
    body.push({
      otazka: 'Bez diakritiky',
      odpoved: `${bezHacku(cele)} — takhle ho napíše letenka nebo cizí formulář`,
      stav: 'neutral',
    })
  }

  for (const c of vCizine(j)) {
    body.push({
      otazka: `V ${c.jazyk === 'angličtina' ? 'angličtině' : 'němčině'}`,
      odpoved: c.duvod,
      stav: c.jak === 'snadno' ? 'dobre' : 'zvazte',
    })
  }

  const zaznam = JMENA.find(x => slugJmena(x.jmeno) === slugJmena(j))
  if (zaznam?.domacky?.length) {
    body.push({
      otazka: 'Jak mu budou říkat doma',
      odpoved: zaznam.domacky.join(', '),
      stav: 'neutral',
    })
  }

  return body
}
