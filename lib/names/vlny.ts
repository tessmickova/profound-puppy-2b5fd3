// Kde jméno stojí na české vlně — a proč to nejde odvodit z jednoho čísla.
//
// ── Co bylo špatně ───────────────────────────────────────────────────────
// Štítek „originál" se dřív počítal jako `popularita <= 80`. Jenže
// `popularita` je redakční skóre líbivosti, ne četnost. Výsledek:
// **Denisa dostala štítek „originál"**. Denisa není originální jméno, je
// to úplně běžné české jméno — jenom se dávalo generaci dnešních maminek,
// ne dnešním miminkám. Stejně dopadly Blanka, Ludmila, Zuzana, Richard.
//
// Jsou to dvě různé osy, které se do jednoho čísla vtěsnat nedají:
//
//   jak je jméno vzácné  ×  v které době se dávalo
//
// Kryšpín je vzácný vždycky. Denisa nebyla vzácná nikdy — jen její doba
// byla před třiceti lety. Rozálie byla vzácná a teď se vrací.
//
// ── Co to je ─────────────────────────────────────────────────────────────
// `vlna` je **redakční zařazení**, ne statistika. Neopíráme se o data ČSÚ
// (ta v repozitáři nejsou) a nikde netvrdíme, že jde o měření. Proto je
// tu `ROK_REVIZE` — zařazení bez roku je za dva roky k ničemu a čtenář
// nemá jak poznat, že zestárlo.
//
// ── Na co se ptá maminka ─────────────────────────────────────────────────
// „Co se bude dávat letos a příští rok." Na to odpovídají vlny `stoupa`
// a `retro` (viz `jeVyhled`) — ne `moderní` styl, který o době neříká nic.

import type { Jmeno, Vlna } from './types'

/** Rok, ke kterému je zařazení revidované. Vypisuje se uživateli. */
export const ROK_REVIZE = 2026

/** Roky, na které se dívá výhled. Odvozené, ať se to nerozejde. */
export const VYHLED: [number, number] = [ROK_REVIZE, ROK_REVIZE + 1]

/**
 * Zařazení podle jména, ne podle id — jedno jméno má v katalogu víc
 * záznamů (Sofie jako holka i jako kočka) a vlna patří jménu.
 *
 * Klíč je jméno přesně tak, jak je v datech.
 */
const VLNY: Record<string, Vlna> = {
  // ── kluci ──────────────────────────────────────────────────────────────
  // Nejčastější na dnešních porodnicích.
  Jakub: 'vrchol',
  Adam: 'vrchol',
  Matyáš: 'vrchol',
  Vojtěch: 'vrchol',
  Matěj: 'vrchol',
  Šimon: 'vrchol',
  Kryštof: 'vrchol',

  // Dávají se v každé generaci — nikdy nebyly ani zvláštní, ani mimo.
  Jan: 'stalice',
  Tomáš: 'stalice',
  Filip: 'stalice',
  Ondřej: 'stalice',
  Daniel: 'stalice',
  Štěpán: 'stalice',
  Kristián: 'stalice',

  // Jdou nahoru — tady se čeká přírůstek.
  Oliver: 'stoupa',
  Sebastián: 'stoupa',
  Damián: 'stoupa',
  Vít: 'stoupa',
  Mikuláš: 'stoupa',

  // Prapradědečkova jména, která se vracejí. Nejsilnější současný proud.
  Antonín: 'retro',
  Vilém: 'retro',
  Teodor: 'retro',
  Bruno: 'retro',

  // Generace dnešních rodičů. Známá, ale dnes se dávají málo.
  Marek: 'dozniva',
  Richard: 'dozniva',

  // Modernější jména, která dnes mladé maminky chtějí nejvíc. Tohle je
  // hlavní proud — retro je vedle něj menšinový, i když je vidět víc.
  Tobiáš: 'stoupa',
  Samuel: 'stoupa',
  Leo: 'stoupa',
  Maxim: 'stoupa',
  Alex: 'stoupa',
  Elias: 'stoupa',
  Nikolas: 'stoupa',
  Adrian: 'stoupa',
  Matteo: 'stoupa',
  Max: 'stoupa',

  David: 'stalice',
  Dominik: 'stalice',

  Josef: 'retro',
  František: 'retro',
  Karel: 'retro',

  Lukáš: 'dozniva',
  Martin: 'dozniva',
  Denis: 'dozniva',
  Michal: 'dozniva',
  Petr: 'dozniva',
  Pavel: 'dozniva',
  Jiří: 'dozniva',
  Roman: 'dozniva',
  Zdeněk: 'dozniva',

  // Rozšíření katalogu 2026 — kvůli rodinnému ladění.
  Hugo: 'stoupa',
  Theo: 'stoupa',
  Vincent: 'stoupa',
  Oskar: 'stoupa',
  Albert: 'stoupa',
  Artur: 'stoupa',
  Benjamin: 'stoupa',
  Gabriel: 'stoupa',
  Jonáš: 'stoupa',
  Tadeáš: 'stoupa',
  Jáchym: 'stoupa',
  Matouš: 'vrchol',
  Václav: 'stalice',
  Viktor: 'stalice',
  Robin: 'stalice',
  Jindřich: 'retro',
  Emil: 'retro',
  Eduard: 'retro',
  Ludvík: 'retro',
  Otakar: 'retro',
  Prokop: 'retro',
  Hynek: 'retro',
  Erik: 'dozniva',
  Patrik: 'dozniva',
  Robert: 'dozniva',
  Miroslav: 'dozniva',
  Jaroslav: 'dozniva',
  Cyril: 'vzacne',

  // Vzácná bez ohledu na dobu — skutečné originály.
  Kryšpín: 'vzacne',

  // ── holky ──────────────────────────────────────────────────────────────
  Eliška: 'vrchol',
  Adéla: 'vrchol',
  Sofie: 'vrchol',
  Viktorie: 'vrchol',
  Ema: 'vrchol',
  Julie: 'vrchol',
  Nela: 'vrchol',
  Sára: 'vrchol',

  Anna: 'stalice',
  Tereza: 'stalice',
  Marie: 'stalice',
  Klára: 'stalice',
  Barbora: 'stalice',
  Natálie: 'stalice',
  Karolína: 'stalice',

  Justýna: 'stoupa',

  Amálie: 'retro',
  Rozálie: 'retro',
  Alžběta: 'retro',
  Ludmila: 'retro',

  Kristýna: 'dozniva',
  Veronika: 'dozniva',
  Zuzana: 'dozniva',
  Denisa: 'dozniva',
  Blanka: 'dozniva',

  // Modernější holčičí jména — hlavní proud dnešních maminek.
  Mia: 'stoupa',
  Ella: 'stoupa',
  Laura: 'stoupa',
  Stela: 'stoupa',
  Nina: 'stoupa',
  Isabela: 'stoupa',
  Zoe: 'stoupa',
  Elen: 'stoupa',
  Valentýna: 'stoupa',
  Melánie: 'stoupa',
  Emily: 'stoupa',
  Vivien: 'stoupa',
  Rebeka: 'stoupa',

  Anežka: 'retro',
  Josefína: 'retro',
  Matylda: 'retro',

  Kateřina: 'stalice',
  Hana: 'stalice',

  Lucie: 'dozniva',
  Michaela: 'dozniva',
  Nikola: 'dozniva',
  Aneta: 'dozniva',
  Petra: 'dozniva',
  Lenka: 'dozniva',
  Jana: 'dozniva',

  Vanda: 'vzacne',

  // Rozšíření katalogu 2026 — kvůli rodinnému ladění.
  Vanesa: 'stoupa',
  Nora: 'stoupa',
  Alma: 'stoupa',
  Olívie: 'stoupa',
  Amélie: 'stoupa',
  Šarlota: 'stoupa',
  Liliana: 'stoupa',
  Elena: 'stoupa',
  Alice: 'stoupa',
  Johana: 'retro',
  Dorota: 'retro',
  Apolena: 'retro',
  Antonie: 'retro',
  Františka: 'retro',
  Edita: 'retro',
  Magdaléna: 'stalice',
  Markéta: 'stalice',
  Eva: 'stalice',
  Gabriela: 'stalice',
  Helena: 'stalice',
  Monika: 'dozniva',
  Šárka: 'dozniva',
  Andrea: 'dozniva',
  Simona: 'dozniva',
  Alena: 'dozniva',
  Ivana: 'dozniva',
  Berenika: 'vzacne',
}

/**
 * Vlna jména — jen pro dětská jména používaná v Česku.
 *
 * Cizí záznamy (Himari z Japonska, Aanya z Indie) vlnu nedostávají:
 * popisují jméno v jeho zemi, ne to, co se dává v Česku. Zvířecí jména
 * taky ne — o módě zvířecích jmen žádná použitelná data nemáme a
 * vymýšlet si ji kvůli štítku by bylo přesně to, co tenhle soubor opravuje.
 *
 * `undefined` znamená **nevíme**, ne „průměrné". Jméno bez vlny se prostě
 * neoznačuje.
 */
export function vlnaJmena(j: Jmeno): Vlna | undefined {
  if (j.kategorie !== 'kluk' && j.kategorie !== 'holka') return undefined
  if (j.zeme !== 'cz') return undefined
  return VLNY[j.jmeno]
}

/** Zařazená jména — pro kontrolu dat. Překlep v klíči by jinak tiše nic nedělal. */
export const ZARAZENA_JMENA = Object.keys(VLNY)

/** Kolik jmen připadá na kterou vlnu — vypisuje kontrola dat. */
export function poctyVln(): Record<Vlna, number> {
  const pocty = { vrchol: 0, stoupa: 0, retro: 0, stalice: 0, dozniva: 0, vzacne: 0 }
  for (const v of Object.values(VLNY)) pocty[v]++
  return pocty
}
