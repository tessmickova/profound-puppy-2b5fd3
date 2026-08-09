// Zápis jména: české a světové podoby téhož jména.
//
// ── Proč to vůbec je ─────────────────────────────────────────────────────
// Část maminek nechce jiné jméno — chce **jiný zápis**. Teodor a Theodor
// je totéž jméno, ale Theodor zní světověji a na cestovním pasu vypadá
// jinak. Totéž Sofie/Sofia, Ema/Emma, Melánie/Melanie, Sebastián/Sebastian.
// Je to skutečné rozhodnutí, které rodiče řeší, a katalog na něj dosud
// neuměl odpovědět: měl vždycky jen jednu podobu.
//
// ── Proč to není další záznam v katalogu ─────────────────────────────────
// `pridej()` v `data.ts` klíčuje jména bez diakritiky, takže „Melanie"
// a „Melánie" jsou pro něj jedno a totéž a druhý zápis by **tiše zahodil**.
// A i kdyby ne, dvě karty pro totéž jméno by výběr jen ředily. Varianta je
// proto vlastnost jména, ne samostatné jméno.
//
// ── Co to není ───────────────────────────────────────────────────────────
// Není to seznam překladů. „Jan" a „John" jsou příbuzná jména, ale ne
// varianty zápisu jednoho jména — do téhle tabulky nepatří.

import type { Jmeno } from './types'
import { bezDiakritiky } from './slug'

/**
 * Jméno v katalogu → další podoby, kterými se běžně zapisuje v Česku.
 *
 * Klíč je vždy podoba, která je v datech. Hodnoty jsou zápisy, které
 * matrika zapíše a které se u nás skutečně používají.
 */
const VARIANTY: Record<string, string[]> = {
  // kluci
  Teodor: ['Theodor'],
  Sebastián: ['Sebastian'],
  Kristián: ['Kristian', 'Christian'],
  Damián: ['Damian'],
  Tobiáš: ['Tobias'],
  Šimon: ['Simon'],
  // Nikolas ne — to je v katalogu vlastní jméno, ne jiný zápis Mikuláše.
  Mikuláš: ['Nicolas'],
  Maxim: ['Maximilian'],
  Vilém: ['William'],
  Antonín: ['Anton'],
  Matyáš: ['Matthias'],
  Filip: ['Philip'],
  Marek: ['Marcus'],

  // holky
  Sofie: ['Sofia', 'Žofie'],
  Ema: ['Emma'],
  Melánie: ['Melanie'],
  Natálie: ['Nathalie', 'Natalie'],
  Viktorie: ['Victoria'],
  Julie: ['Julia'],
  Isabela: ['Isabella'],
  // Amálka je domácký tvar, ten patří do `domacky`, ne sem.
  Amálie: ['Amelie'],
  Sára: ['Sarah'],
  Klára: ['Clara'],
  Alžběta: ['Elizabeth'],
  Matylda: ['Matilda'],
  Anežka: ['Agnes'],
  Josefína: ['Josephine'],
  // Helena ne — to je delší jméno, ne jiný zápis Elen.
  Elen: ['Ellen'],
  Stela: ['Stella'],
}

/**
 * Jména, která v češtině **znějí světově** — ať už proto, že se tak
 * i zapisují, nebo že mají cizí variantu.
 *
 * Je to redakční výběr, ne pravidlo z pravopisu: rozhoduje, jak jméno
 * působí na české ucho, ne kolik má cizích písmen. Proto je psaný ručně
 * a ne odvozený z toho, jestli má jméno háček.
 */
const SVETOVY_ZVUK = new Set([
  // kluci
  'Teodor', 'Sebastián', 'Kristián', 'Damián', 'Tobiáš', 'Oliver', 'Leo',
  'Maxim', 'Alex', 'Elias', 'Nikolas', 'Adrian', 'Matteo', 'Max', 'Bruno',
  'Denis', 'David', 'Samuel',
  // holky
  'Mia', 'Ella', 'Laura', 'Stela', 'Nina', 'Isabela', 'Zoe', 'Elen',
  'Melánie', 'Sofie', 'Ema', 'Viktorie', 'Julie', 'Natálie', 'Sára',
  'Emily', 'Vivien', 'Rebeka', 'Valentýna',
])

/** Další podoby zápisu jména. Prázdné pole = žádnou neevidujeme. */
export const variantyZapisu = (jmeno: string): string[] => VARIANTY[jmeno] ?? []

/**
 * Zní jméno světově?
 *
 * Jen u českých dětských jmen — u cizích záznamů je otázka nesmyslná
 * (japonské jméno zní v Japonsku domácky) a u zvířat ji nikdo neřeší.
 */
export function znejeSvetove(j: Jmeno): boolean {
  if (j.kategorie !== 'kluk' && j.kategorie !== 'holka') return false
  if (j.zeme !== 'cz') return false
  return SVETOVY_ZVUK.has(j.jmeno)
}

/** Pro kontrolu dat a pro rejstřík — všechna jména s evidovanou variantou. */
export const JMENA_S_VARIANTOU = Object.keys(VARIANTY)

/** Pro kontrolu dat — jména označená jako světově znějící. */
export const SVETOVA_JMENA = [...SVETOVY_ZVUK]

/**
 * Hledaný tvar variant — aby našeptávač našel Teodora, i když člověk
 * napíše „Theodor". Právě takhle to totiž do vyhledávání píšou lidé,
 * kteří tu podobu chtějí.
 */
export const hledaneVarianty = (jmeno: string): string[] =>
  variantyZapisu(jmeno).map(bezDiakritiky)
