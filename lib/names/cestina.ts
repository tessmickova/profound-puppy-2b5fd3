// Praktická čeština kolem jmen: oslovení, skloňování, diakritika, výslovnost.
//
// Všechno tu jsou **pravidla, ne slovník**. U běžných jmen sedí, u výjimek
// se mohou splést — proto to web nikde nepodává jako jistotu a u každého
// výstupu je vidět, z čeho vyšel.
//
// Proč to vůbec je: rodič se neptá „jaká je etymologie", ale „jak na něj
// budu volat" a „bude to muset hláskovat?". To jsou rozhodovací otázky.

const SAMOHLASKY = 'aáeéěiíoóuúůyý'

const bezDiakritiky = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '')

export const maDiakritiku = (jmeno: string) => bezDiakritiky(jmeno) !== jmeno

/** Jméno bez háčků a čárek — jak ho napíše cizí formulář nebo letenka. */
export const bezHacku = (jmeno: string) => bezDiakritiky(jmeno)

/**
 * 5. pád (oslovení). Pokrývá běžné české vzory; u cizích jmen a výjimek
 * se může minout, proto to ukazujeme jako „nejčastěji" a ne jako pravidlo.
 */
export function osloveni(jmeno: string): string {
  const j = jmeno.trim()
  if (!j) return j
  const posledni = j.slice(-1).toLowerCase()
  const dve = j.slice(-2).toLowerCase()

  // Ženská jména na -a: Eliška → Eliško, Máňa → Máňo
  if (posledni === 'a') return j.slice(0, -1) + 'o'
  // Ženská na -e zůstávají: Marie → Marie
  if (posledni === 'e') return j
  // Ženská na souhlásku se nemění: Dagmar → Dagmar
  if (jeZenskeNaSouhlasku(j)) return j

  // Mužská jména
  if (dve === 'ek') return j.slice(0, -2) + 'ku'      // Marek → Marku
  if (dve === 'ec') return j.slice(0, -2) + 'če'      // Vojtěch je jinde
  if (posledni === 'r') return j + 'e'                // Petr → Petře (viz níž)
  if (posledni === 'k') return j + 'u'                // Patrik → Patriku
  if (posledni === 'g') return j + 'u'
  if (posledni === 'h') return j + 'u'                // Vojtěch → Vojtěchu
  if (posledni === 'c') return j.slice(0, -1) + 'če'
  if (posledni === 'i' || posledni === 'í') return j  // Jiří → Jiří
  if (posledni === 'o') return j                      // Hugo → Hugo
  if (posledni === 'y') return j
  if (SAMOHLASKY.includes(posledni)) return j
  // Měkké zakončení volá na -i: Tomáš → Tomáši, Rex → Rexi, Ondřej → Ondřeji
  if ('šžčřcjx'.includes(posledni)) return j + 'i'
  return j + 'e'                                      // Jan → Jane
}

/** Ženská jména končící na souhlásku, která se neskloňují. */
function jeZenskeNaSouhlasku(j: string): boolean {
  return ['dagmar', 'ester', 'miriam', 'ingrid', 'karin', 'sharon', 'nikol']
    .includes(bezDiakritiky(j).toLowerCase())
}

/** 2. pád — „bez koho": ukazuje, jestli jméno v češtině ohýbá přirozeně. */
export function genitiv(jmeno: string): string {
  const j = jmeno.trim()
  const posledni = j.slice(-1).toLowerCase()
  if (posledni === 'a') return j.slice(0, -1) + 'y'
  if (posledni === 'e') return j
  if (jeZenskeNaSouhlasku(j)) return j
  if (SAMOHLASKY.includes(posledni)) return j
  return j + 'a'
}

/**
 * Hláskování. Odhaduje, jestli bude nositel jméno v Česku vysvětlovat.
 * Rozhoduje se podle znaků, které česká výslovnost nečte, jak se píšou.
 */
export function hlaskovani(jmeno: string): { snadne: boolean; duvod: string } {
  const bez = bezDiakritiky(jmeno).toLowerCase()

  // Písmena, která česká abeceda běžně nepoužívá.
  const ciziPismena = /[qwx]/.test(bez)
  // Skupiny, kde se česká a cizí výslovnost rozcházejí.
  const ciziSkupiny = /(ph|th|ck|gh|sch|ou[^s]|ea|ee|oo|ai|ay|ey|oy)/.test(bez)
  const dvojiteSouhlasky = /([bcdfgklmnprstvz])\1/.test(bez)

  if (ciziPismena) {
    return { snadne: false, duvod: 'obsahuje písmeno, které se v češtině běžně nepíše (q, w, x)' }
  }
  if (ciziSkupiny) {
    return { snadne: false, duvod: 'obsahuje skupinu písmen, kterou Češi čtou různě' }
  }
  if (dvojiteSouhlasky) {
    return { snadne: false, duvod: 'zdvojená souhláska se v češtině často vypustí při psaní' }
  }
  if (maDiakritiku(jmeno)) {
    return { snadne: true, duvod: 'píše se, jak se čte; jen si hlídejte diakritiku ve formulářích' }
  }
  return { snadne: true, duvod: 'píše se, jak se čte' }
}

/** Počáteční písmeno bez diakritiky — pro iniciály a řazení. */
export const inicialka = (jmeno: string) =>
  bezDiakritiky(jmeno.trim().slice(0, 1)).toUpperCase()

/**
 * Zkratky z iniciál, na které se vyplatí upozornit.
 *
 * Záměrně **nehodnotíme**, jestli se dítěti někdo bude smát — to nikdo
 * zaručit neumí. Jen ukážeme, co iniciály tvoří, ať se rodič může
 * rozhodnout sám.
 */
const VYZNAMOVE_ZKRATKY = new Set([
  'SS', 'KKK', 'WC', 'BS', 'DNA', 'FBI', 'CIA', 'STB', 'KGB', 'HIV', 'PPP',
])

export function zkontrolujInicialy(casti: string[]): { text: string; poznamka: string | null } {
  const text = casti.filter(Boolean).map(inicialka).join('. ') + '.'
  const holy = casti.filter(Boolean).map(inicialka).join('')
  if (VYZNAMOVE_ZKRATKY.has(holy)) {
    return { text, poznamka: `Iniciály tvoří zkratku ${holy} — možná to budete chtít zvážit.` }
  }
  if (holy.length >= 2 && new Set(holy).size === 1) {
    return { text, poznamka: `Všechna písmena jsou stejná (${holy}). Někomu se to líbí, někomu ne.` }
  }
  return { text, poznamka: null }
}

/**
 * Jak jméno funguje v angličtině a němčině.
 *
 * Je to **heuristika podle pravopisu**, ne slovník výslovnosti: díváme se
 * na znaky, které tamní čtenář nezná, a na skupiny, které přečte jinak.
 * Proto výstup mluví o „počítejte s vysvětlováním", ne o správnosti.
 */
export function vCizine(jmeno: string): {
  jazyk: string
  jak: 'snadno' | 's-vysvetlovanim' | 'jinak-zni'
  duvod: string
}[] {
  const ma = maDiakritiku(jmeno)
  const bez = bezDiakritiky(jmeno)
  const zmenaTvaru = ma ? `zapíše se jako ${bez}` : ''
  const nizkeC = jmeno.toLowerCase()

  const vysledky: { jazyk: string; jak: 'snadno' | 's-vysvetlovanim' | 'jinak-zni'; duvod: string }[] = []

  // Angličtina
  if (/[čćšžďťňřůě]/i.test(nizkeC)) {
    vysledky.push({
      jazyk: 'angličtina',
      jak: 's-vysvetlovanim',
      duvod: `háčky a kroužky se v anglickém prostředí ztratí — ${zmenaTvaru}`,
    })
  } else if (/^(j|ch)/i.test(nizkeC) || /y$/i.test(nizkeC)) {
    vysledky.push({
      jazyk: 'angličtina',
      jak: 'jinak-zni',
      duvod: 'začátek nebo konec se v angličtině čte jinak než česky',
    })
  } else {
    vysledky.push({ jazyk: 'angličtina', jak: 'snadno', duvod: 'zápis i čtení dávají smysl i anglicky' })
  }

  // Němčina
  if (/[čćšžďťňřů]/i.test(nizkeC)) {
    vysledky.push({
      jazyk: 'němčina',
      jak: 's-vysvetlovanim',
      duvod: `diakritika se nepřenese — ${zmenaTvaru}`,
    })
  } else if (/^(w|v)/i.test(nizkeC) || /z/i.test(nizkeC)) {
    vysledky.push({
      jazyk: 'němčina',
      jak: 'jinak-zni',
      duvod: 'v/w a z se v němčině čtou jinak než v češtině',
    })
  } else {
    vysledky.push({ jazyk: 'němčina', jak: 'snadno', duvod: 'zápis i čtení dávají smysl i německy' })
  }

  return vysledky
}

// ── zdrobněliny ──────────────────────────────────────────────────────────

/**
 * Ručně vybrané hravé přezdívky. Generovat se nedají — „Vanilka" pro
 * Vanesu je nápad, ne pravidlo — takže jich je málo a jsou jen tam, kde
 * opravdu sedí. Kde jméno v tabulce není, hravou přezdívku prostě
 * nenabízíme; vymyšlená by byla trapná.
 */
const HRAVE: Record<string, string[]> = {
  vanesa: ['Vanilka'],
  eliska: ['Elza'],
  amalie: ['Máli'],
  karolina: ['Kája'],
  magdalena: ['Majda'],
  albert: ['Berti'],
  mikulas: ['Miki'],
  frantisek: ['Fanda'],
  josefina: ['Pepina'],
  jakub: ['Kubajz'],
  matylda: ['Tyldinka'],
  teodor: ['Teddy'],
  leo: ['Lvíček'],
  ella: ['Elka'],
  rozalie: ['Rozárka'],
  barbora: ['Barunka'],
  vojtech: ['Vojtík'],
  anezka: ['Nezinka'],
}

const klicJmena = (s: string) => bezDiakritiky(s).toLowerCase()

/** Změkčení souhlásky před -u- v mazlivých tvarech: Vanulinka → Vaňulinka. */
function zmekci(kmen: string): string {
  const posledni = kmen.slice(-1)
  const mapa: Record<string, string> = { n: 'ň', t: 'ť', d: 'ď' }
  return mapa[posledni] ? kmen.slice(0, -1) + mapa[posledni] : kmen
}

/**
 * Krátký kmen jména — první slabika a souhláska za ní (Vanesa → Van,
 * Martin → Mart). Z něj se staví mazlivé tvary.
 */
function kratkyKmen(jmeno: string): string {
  const m = /^([^aáeéěiíoóuúůyý]*[aáeéěiíoóuúůyý])([^aáeéěiíoóuúůyý]+)/i.exec(jmeno)
  if (!m) return jmeno
  // z „Martin" vezmeme Mart, z „Vanesy" Van — souhláskovou skupinu
  // zkrátíme na dvě, jinak by vyšlo „Vans" nebo naopak „Mar"
  return m[1] + m[2].slice(0, 2)
}

export interface NavrhyZdrobnelin {
  /** běžné tvary — kurátorské první, pak generované */
  bezne: string[]
  /** mazlivé a hravé tvary */
  hrave: string[]
}

/**
 * Zdrobněliny jména. **Návrhy podle vzorů, ne slovník** — kurátorské tvary
 * (z katalogu) jdou první, generované za nimi. U generovaných se může
 * čeština splést, proto se všude podávají jako nápady.
 */
export function zdrobneliny(
  jmeno: string,
  rodZensky: boolean,
  kuratorske: string[] = [],
): NavrhyZdrobnelin {
  const j = jmeno.trim()
  const bezne: string[] = [...kuratorske]
  const hrave: string[] = (HRAVE[klicJmena(j)] ?? [])
    .filter(x => !bezne.some(b => b.toLowerCase() === x.toLowerCase()))
  const pridej = (kam: string[], tvar: string) => {
    if (tvar.length < 3 || tvar.toLowerCase() === j.toLowerCase()) return
    if (![...bezne, ...hrave].some(x => x.toLowerCase() === tvar.toLowerCase())) kam.push(tvar)
  }

  const kmen = kratkyKmen(j)
  if (rodZensky) {
    // Amálie → Amál (ne „Amáli"), Vanesa → Vanes
    const plny = /ie$/i.test(j) ? j.slice(0, -2) : /[aáeé]$/i.test(j) ? j.slice(0, -1) : j
    // Vaneska — plný kmen + ka; po k/č by vyšlo „Eliškka", to přeskočíme
    if (!/[kč]$/i.test(plny)) pridej(bezne, plny + 'ka')
    pridej(bezne, kmen + 'inka')      // Vaninka
    pridej(hrave, zmekci(kmen) + 'uška')   // Vaňuška
    pridej(hrave, zmekci(kmen) + 'ulka')   // Vaňulka
    pridej(hrave, zmekci(kmen) + 'ulinka') // Vaňulinka
  } else {
    pridej(bezne, kmen + 'ík')        // Tomík, Rexík
    pridej(bezne, kmen + 'ínek')      // Martínek
    pridej(hrave, kmen + 'oušek')     // Filoušek
    pridej(hrave, zmekci(kmen) + 'ulda')   // Maťulda
  }

  return { bezne: bezne.slice(0, 5), hrave: hrave.slice(0, 4) }
}
