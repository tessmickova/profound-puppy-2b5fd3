// Pojmenované výběry jmen — jeden seznam pro úvodní stránku i katalog.
//
// Sekce na úvodu („Babiččina jména, která se vracejí“) a filtr v katalogu
// musely dřív každý znát vlastní pravidlo. Odkaz „zobrazit všechna“ proto
// vedl jen do obecného katalogu a člověk si výběr musel naklikat znovu.
//
// Tady je výběr popsaný jednou: má id do adresy (`/deti?filtr=navrat`),
// nadpis, vysvětlení a pravidlo. Server podle něj vykreslí obsah rovnou do
// HTML (crawler i vypnutý JavaScript), klient podle stejného id nastaví
// filtr — a obojí ukazuje totéž.

import { dobreSeVola, jeNavrat, jeStalice, jeVrchol, jeVzestup, jeVzacne } from './logic'
import { znejeSvetove } from './zapis'
import type { Jmeno } from './types'

export interface Vyhled {
  id: string
  /** nadpis stránky, když je výběr otevřený */
  nadpis: string
  /** věta pod nadpis — proč tahle skupina vůbec existuje */
  popis: string
  /** pro koho výběr platí; `oboji` = děti i zvířata */
  druh: 'deti' | 'zvirata'
  sedi: (j: Jmeno) => boolean
}

export const VYHLEDY: Vyhled[] = [
  {
    id: 'vzestup',
    nadpis: 'Modernější jména na vzestupu',
    popis: 'Kratší, mezinárodně srozumitelná jména, kterých v porodnicích přibývá.',
    druh: 'deti',
    sedi: jeVzestup,
  },
  {
    id: 'svetove',
    nadpis: 'Jména, která znějí světově',
    popis: 'Sedí v Česku i v cizině — často mají i druhou podobu zápisu.',
    druh: 'deti',
    sedi: znejeSvetove,
  },
  {
    id: 'navrat',
    nadpis: 'Babiččina jména, která se vracejí',
    popis: 'Jména prababiček a pradědečků, po kterých dnešní rodiče znovu sahají.',
    druh: 'deti',
    sedi: jeNavrat,
  },
  {
    id: 'vrchol',
    nadpis: 'Nejčastější jména dnešních miminek',
    popis: 'To, co dnes v porodnicích slyšíte nejčastěji.',
    druh: 'deti',
    sedi: jeVrchol,
  },
  {
    id: 'stalice',
    nadpis: 'Stálice, které nezestárnou',
    popis: 'Dávají se v každé generaci — nikdy nebyly ani zvláštní, ani mimo.',
    druh: 'deti',
    sedi: jeStalice,
  },
  {
    id: 'vzacne',
    nadpis: 'Vzácná jména',
    popis: 'Ve třídě bude nejspíš samo — vzácná bez ohledu na dobu.',
    druh: 'deti',
    sedi: jeVzacne,
  },
  {
    id: 'kratka',
    nadpis: 'Krátká a zvučná jména',
    popis: 'Nejvýš dvě slabiky — dobře se volají přes celé hřiště.',
    druh: 'deti',
    sedi: j => j.zeme === 'cz' && j.slabiky <= 2,
  },
  {
    id: 'volatelne',
    nadpis: 'Jména, která se dobře volají',
    popis: 'Krátká, zvučná a nezaměnitelná s povely.',
    druh: 'zvirata',
    sedi: dobreSeVola,
  },
]

export const vyhledPodleId = (id: string | null | undefined): Vyhled | undefined =>
  id ? VYHLEDY.find(v => v.id === id) : undefined

/** Adresa katalogu s otevřeným výběrem — používá ji úvodní stránka. */
export function odkazVyhledu(v: Vyhled, kategorie?: string): string {
  const zaklad = v.druh === 'deti' ? '/deti' : '/zvirata'
  const parametry = new URLSearchParams({ filtr: v.id })
  if (kategorie) parametry.set('kategorie', kategorie)
  return `${zaklad}?${parametry.toString()}`
}
