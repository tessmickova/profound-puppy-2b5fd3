// Generátor docs/KEYWORD_MASTER.csv.
//
// Proč skript a ne ručně psaná tabulka: dlouhý ocas (dotazy na konkrétní
// jméno) se musí odvozovat z **reálných dat**, jinak by v tabulce byla
// jména, na která web nemá stránku, a naopak.
//
// ── Co tu NENÍ a nebude ──────────────────────────────────────────────────
// Objemy hledanosti. Nemáme přístup k žádnému nástroji, který by je měřil,
// a odhad podle citu je v tabulce k nerozeznání od měřeného čísla. Sloupec
// `objem` je proto všude `neznamy` a `zdroj_objemu` říká proč. Až se čísla
// doplní z Search Console nebo Sklik/Ads, vyplní se obojí najednou.
//
// Priorita se počítá jen z toho, co skutečně víme:
//
//   priorita = zamer × pokryti × shluk
//
//   zamer    5 rozhodovací („nemůžeme se shodnout"), 3 průzkumný
//            („nejčastější jména 2025"), 1 navigační
//   pokryti  2,0 stránka neexistuje · 1,5 existuje, ale slabá
//            · 1,0 stránka odpovídá dotazu
//   shluk    1,2 nosné téma webu · 1,0 běžné · 0,7 okrajové
//
// Číslo neříká „tolik lidí to hledá". Říká „tolik nám dá práce navíc
// smysl". To je jiná otázka a jde zodpovědět poctivě.

import { writeFileSync } from 'node:fs'
import { ENTITY_SE_STRANKOU } from '../lib/names/entita'
import { ZEME } from '../lib/names/data'
import { KATEGORIE_INFO } from '../lib/names/types'

type Zamer = 'rozhodovaci' | 'pruzkumny' | 'navigacni'
type Pokryti = 'chybi' | 'slaba' | 'odpovida'

interface Radek {
  dotaz: string
  zamer: Zamer
  shluk: string
  cilovaAdresa: string
  pokryti: Pokryti
  poznamka: string
}

const VAHA_ZAMERU: Record<Zamer, number> = { rozhodovaci: 5, pruzkumny: 3, navigacni: 1 }
const VAHA_POKRYTI: Record<Pokryti, number> = { chybi: 2, slaba: 1.5, odpovida: 1 }

/** Nosná témata webu mají přednost před vším ostatním. */
const VAHA_SHLUKU: Record<string, number> = {
  'rozhodovani': 1.2,
  'jmeno-a-prijmeni': 1.2,
  'vyber-pro-dite': 1.2,
  'vyber-pro-zvire': 1,
  'vyznam-jmena': 1,
  'jmeniny': 1,
  'zeme-pouziti': 0.7,
  'katalog': 1,
  'sourozenci': 1,
}

// ── strategické dotazy ────────────────────────────────────────────────────
// Formulace vycházejí z toho, jak lidé o výběru jména mluví (fóra, dotazy
// v poradnách), ne z nástroje na klíčová slova. Kde si nejsem jistý, že se
// tak dotaz opravdu píše, je to v poznámce.

const STRATEGICKE: Radek[] = [
  // Rozhodování — jádro webu.
  { dotaz: 'jak vybrat jméno pro dítě', zamer: 'rozhodovaci', shluk: 'rozhodovani', cilovaAdresa: '/vybrat-jmeno-pro-dite', pokryti: 'odpovida', poznamka: 'hlavní vstup pro nerozhodnuté' },
  { dotaz: 'nemůžeme se shodnout na jménu', zamer: 'rozhodovaci', shluk: 'rozhodovani', cilovaAdresa: '/jak-vybrat-jmeno-kdyz-se-nemuzeme-shodnout', pokryti: 'odpovida', poznamka: 'nejčastější skutečný problém, konkurence ho neřeší' },
  { dotaz: 'jak se rozhodnout mezi dvěma jmény', zamer: 'rozhodovaci', shluk: 'rozhodovani', cilovaAdresa: '/porovnat-jmena', pokryti: 'odpovida', poznamka: '' },
  { dotaz: 'porovnání jmen', zamer: 'rozhodovaci', shluk: 'rozhodovani', cilovaAdresa: '/porovnat-jmena', pokryti: 'odpovida', poznamka: '' },
  { dotaz: 'nevím jaké jméno dát dítěti', zamer: 'rozhodovaci', shluk: 'rozhodovani', cilovaAdresa: '/vybrat-jmeno-pro-dite', pokryti: 'odpovida', poznamka: '' },
  { dotaz: 'lituje někdo jména svého dítěte', zamer: 'pruzkumny', shluk: 'rozhodovani', cilovaAdresa: '', pokryti: 'chybi', poznamka: 'článek o prevenci lítosti — zatím nenapsaný' },
  { dotaz: 'kdy se rozhodnout pro jméno dítěte', zamer: 'pruzkumny', shluk: 'rozhodovani', cilovaAdresa: '', pokryti: 'chybi', poznamka: 'navazuje na matriční lhůty' },

  // Jméno a příjmení.
  { dotaz: 'jméno k příjmení', zamer: 'rozhodovaci', shluk: 'jmeno-a-prijmeni', cilovaAdresa: '/jmeno-k-prijmeni', pokryti: 'odpovida', poznamka: '' },
  { dotaz: 'jak zní jméno s příjmením', zamer: 'rozhodovaci', shluk: 'jmeno-a-prijmeni', cilovaAdresa: '/jmeno-k-prijmeni', pokryti: 'odpovida', poznamka: '' },
  { dotaz: 'jméno k příjmení Novák', zamer: 'rozhodovaci', shluk: 'jmeno-a-prijmeni', cilovaAdresa: '/jmeno-k-prijmeni', pokryti: 'slaba', poznamka: 'nástroj to umí, ale stránka pro konkrétní příjmení není — a plošně je generovat NEBUDEME (doorway)' },
  { dotaz: 'iniciály jména kontrola', zamer: 'rozhodovaci', shluk: 'jmeno-a-prijmeni', cilovaAdresa: '/jmeno-k-prijmeni', pokryti: 'odpovida', poznamka: '' },
  { dotaz: 'druhé jméno pro dítě', zamer: 'pruzkumny', shluk: 'jmeno-a-prijmeni', cilovaAdresa: '', pokryti: 'chybi', poznamka: 'nástroj umí druhé jméno, článek chybí' },

  // Výběr pro dítě — průzkumná fáze.
  { dotaz: 'jména pro holčičky', zamer: 'pruzkumny', shluk: 'vyber-pro-dite', cilovaAdresa: '/jmena/holcicky', pokryti: 'odpovida', poznamka: 'obsazené velkými katalogy, sami sebou nevyhrajeme' },
  { dotaz: 'jména pro kluky', zamer: 'pruzkumny', shluk: 'vyber-pro-dite', cilovaAdresa: '/jmena/kluky', pokryti: 'odpovida', poznamka: 'viz výš' },
  { dotaz: 'nejčastější jména v ČR', zamer: 'pruzkumny', shluk: 'vyber-pro-dite', cilovaAdresa: '', pokryti: 'chybi', poznamka: 'jde jen s daty ČSÚ a s uvedeným rokem — bez zdroje nepsat' },
  { dotaz: 'neobvyklá jména pro holčičky', zamer: 'pruzkumny', shluk: 'vyber-pro-dite', cilovaAdresa: '/jmena/holcicky', pokryti: 'slaba', poznamka: 'filtr to umí, vstupní stránka chybí' },
  { dotaz: 'krátká jména pro děti', zamer: 'pruzkumny', shluk: 'vyber-pro-dite', cilovaAdresa: '/deti', pokryti: 'slaba', poznamka: '' },
  { dotaz: 'jména která fungují i v cizině', zamer: 'rozhodovaci', shluk: 'vyber-pro-dite', cilovaAdresa: '', pokryti: 'chybi', poznamka: 'data pro to máme (vCizine), stránka ne' },
  { dotaz: 'jméno bez háčků a čárek', zamer: 'rozhodovaci', shluk: 'vyber-pro-dite', cilovaAdresa: '', pokryti: 'chybi', poznamka: 'praktický dotaz rodičů, kteří žijí v zahraničí' },

  // Sourozenci.
  { dotaz: 'jméno k sourozenci', zamer: 'rozhodovaci', shluk: 'sourozenci', cilovaAdresa: '/rodina', pokryti: 'slaba', poznamka: 'rodinný profil je noindex — potřebuje veřejnou vstupní stránku' },
  { dotaz: 'jména sourozenců která k sobě ladí', zamer: 'rozhodovaci', shluk: 'sourozenci', cilovaAdresa: '', pokryti: 'chybi', poznamka: '' },

  // Zvířata.
  { dotaz: 'jak pojmenovat psa', zamer: 'rozhodovaci', shluk: 'vyber-pro-zvire', cilovaAdresa: '/vybrat-jmeno-pro-zvire', pokryti: 'odpovida', poznamka: '' },
  { dotaz: 'jména pro psy', zamer: 'pruzkumny', shluk: 'vyber-pro-zvire', cilovaAdresa: '/jmena/psy', pokryti: 'odpovida', poznamka: '' },
  { dotaz: 'jména pro kočky', zamer: 'pruzkumny', shluk: 'vyber-pro-zvire', cilovaAdresa: '/jmena/kocky', pokryti: 'odpovida', poznamka: '' },
  { dotaz: 'jméno pro psa na písmeno', zamer: 'rozhodovaci', shluk: 'vyber-pro-zvire', cilovaAdresa: '', pokryti: 'chybi', poznamka: 'vrhové písmeno u chovatelských stanic — filtr to umí, stránka chybí' },
  { dotaz: 'jméno pro psa které se dobře volá', zamer: 'rozhodovaci', shluk: 'vyber-pro-zvire', cilovaAdresa: '/vybrat-jmeno-pro-zvire', pokryti: 'slaba', poznamka: 'logika volatelnosti v kódu je, na stránce není vidět' },

  // Význam a jmeniny.
  { dotaz: 'význam jmen', zamer: 'pruzkumny', shluk: 'vyznam-jmena', cilovaAdresa: '/deti', pokryti: 'slaba', poznamka: 'rozcestník podle významu chybí' },
  { dotaz: 'jmeniny kdy má svátek', zamer: 'navigacni', shluk: 'jmeniny', cilovaAdresa: '', pokryti: 'chybi', poznamka: 'kalendář svátků není samostatná sekce; data v extra.ts jsou' },

  // Metodika a důvěra.
  { dotaz: 'svět jmen', zamer: 'navigacni', shluk: 'katalog', cilovaAdresa: '/', pokryti: 'odpovida', poznamka: 'značka' },
  { dotaz: 'odkud jsou data o jménech', zamer: 'pruzkumny', shluk: 'katalog', cilovaAdresa: '/metodika', pokryti: 'odpovida', poznamka: 'důležité pro citovatelnost v AI odpovědích' },
]

// ── dlouhý ocas z reálných dat ────────────────────────────────────────────

const detailyJmen: Radek[] = ENTITY_SE_STRANKOU.flatMap(e => [
  {
    dotaz: `${e.jmeno} význam jména`,
    zamer: 'pruzkumny' as Zamer,
    shluk: 'vyznam-jmena',
    cilovaAdresa: `/jmeno/${e.slug}`,
    pokryti: 'odpovida' as Pokryti,
    poznamka: '',
  },
])

const zeme: Radek[] = ZEME.map(z => ({
  dotaz: `jména ze země ${z.nazev}`,
  zamer: 'pruzkumny' as Zamer,
  shluk: 'zeme-pouziti',
  cilovaAdresa: `/zeme/${z.kod}`,
  pokryti: 'odpovida' as Pokryti,
  poznamka: 'formulace odhadnutá — skutečné dotazy bývají „norská jména", ne „jména ze země Norsko"',
}))

const kategorie: Radek[] = (Object.keys(KATEGORIE_INFO) as (keyof typeof KATEGORIE_INFO)[])
  .map(k => ({
    dotaz: `jména pro ${KATEGORIE_INFO[k].proKoho}`,
    zamer: 'pruzkumny' as Zamer,
    shluk: 'katalog',
    cilovaAdresa: `/jmena/${KATEGORIE_INFO[k].slug}`,
    pokryti: 'odpovida' as Pokryti,
    poznamka: '',
  }))

// ── výstup ────────────────────────────────────────────────────────────────

function priorita(r: Radek): number {
  const shluk = VAHA_SHLUKU[r.shluk] ?? 1
  return Math.round(VAHA_ZAMERU[r.zamer] * VAHA_POKRYTI[r.pokryti] * shluk * 10) / 10
}

const bunka = (s: string) => (/[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s)

const vsechny = [...STRATEGICKE, ...kategorie, ...zeme, ...detailyJmen]
  .sort((a, b) => priorita(b) - priorita(a) || a.dotaz.localeCompare(b.dotaz, 'cs'))

const HLAVICKA = [
  'dotaz', 'zamer', 'shluk', 'objem', 'zdroj_objemu',
  'pokryti', 'priorita', 'cilova_adresa', 'poznamka',
]

const radky = vsechny.map(r => [
  r.dotaz,
  r.zamer,
  r.shluk,
  'neznamy',
  'zadny-nastroj-hledanosti-k-dispozici',
  r.pokryti,
  String(priorita(r)),
  r.cilovaAdresa,
  r.poznamka,
].map(bunka).join(','))

const csv = [HLAVICKA.join(','), ...radky].join('\n') + '\n'
writeFileSync('docs/KEYWORD_MASTER.csv', csv, 'utf8')

const bezStranky = vsechny.filter(r => !r.cilovaAdresa).length
console.log(`docs/KEYWORD_MASTER.csv — ${vsechny.length} řádků`)
console.log(`  strategické ${STRATEGICKE.length} · kategorie ${kategorie.length} · země ${zeme.length} · detaily jmen ${detailyJmen.length}`)
console.log(`  bez cílové stránky: ${bezStranky} (to je fronta práce, ne chyba)`)
console.log('  objem: neznamy u všech řádků — žádný nástroj hledanosti k dispozici')
