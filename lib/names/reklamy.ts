// Nativní reklamní plochy. Kreativy záměrně vypadají jako ostatní obsah webu
// (stejné karty, stejná paleta) — žádné blikající bannery. Každá plocha se
// po patnácti sekundách překlopí na druhou stranu, kde je jiná kampaň.
//
// Toto jsou ukázková data pro vývoj a náhled. V ostrém provozu je nahradí
// odpověď reklamní služby (viz `reklamniServer.ts`) — tvar `Inzerat` je
// v obou případech stejný.

/** Ploch je dvacet: deset pozic po dvou stranách. */
export type ReklamniPlocha = `plocha-${number}`

/** Kolik pozic web má — pět vlevo, pět vpravo. */
export const POZIC = 10

/** Kolik ploch se dá koupit dohromady (každá pozice má dvě strany). */
export const PLOCH = POZIC * 2

/** Seznam id všech ploch v pořadí, v jakém je vidí zákazník v náhledu. */
export const PLOCHY: string[] = Array.from({ length: PLOCH }, (_, i) => `plocha-${i + 1}`)

export interface Inzerat {
  id: string
  /** krátký nadpis — čte se jako nadpis běžné karty */
  nadpis: string
  text: string
  /** co uvidí uživatel na tlačítku */
  cta: string
  odkaz: string
  /** jméno inzerenta, zobrazuje se drobně u štítku */
  znacka: string
  /** klíč ikony (lucide) — použije se, když inzerent nemá logo */
  ikona: string | null
  /** adresa loga inzerenta; má přednost před ikonou */
  logo?: string | null
}

const PSI: Inzerat[] = [
  { id: 'r-psi-1', nadpis: 'Gravírovaná známka na obojek', text: 'Jméno i telefon vyrytý do nerezu. Vyrobíme do druhého dne a pošleme zdarma.', cta: 'Vybrat známku', odkaz: '#', znacka: 'Známkárna.cz', ikona: 'bone' },
  { id: 'r-psi-2', nadpis: 'Kurz základní poslušnosti', text: 'Šest lekcí, malé skupiny, výcvik hravou formou. Naučte štěně reagovat na jméno.', cta: 'Zobrazit termíny', odkaz: '#', znacka: 'Psí škola Blesk', ikona: 'dog' },
  { id: 'r-psi-3', nadpis: 'Pelíšek s vyšitým jménem', text: 'Pratelný potah, paměťová pěna a jméno vyšité na boku. Tři velikosti.', cta: 'Prohlédnout pelíšky', odkaz: '#', znacka: 'Hafík & spol.', ikona: 'house' },
  { id: 'r-psi-4', nadpis: 'Pojištění pro psy a kočky', text: 'Úrazy i nemoci bez spoluúčasti, sjednání online za pět minut.', cta: 'Spočítat cenu', odkaz: '#', znacka: 'Zvířepojišťovna', ikona: 'shield-check' },
]

const KOCKY: Inzerat[] = [
  { id: 'r-kocky-1', nadpis: 'Škrabadlo, které nezkazí obývák', text: 'Dubové dřevo a sisal místo plyše. Kočka si zvykne za jeden večer.', cta: 'Vybrat škrabadlo', odkaz: '#', znacka: 'Kočkodřevo', ikona: 'cat' },
  { id: 'r-kocky-2', nadpis: 'Miska s jménem vaší kočky', text: 'Ručně malovaná keramika, jméno napíšeme podle vás. Vhodná do myčky.', cta: 'Objednat misku', odkaz: '#', znacka: 'Keramika Lada', ikona: 'star' },
  { id: 'r-kocky-3', nadpis: 'Čip a registrace v evropské databázi', text: 'Když se kočka zatoulá, jméno na známce nestačí. Čipujeme bez objednání.', cta: 'Najít veterinu', odkaz: '#', znacka: 'VetPoint', ikona: 'shield-check' },
]

const DETI: Inzerat[] = [
  { id: 'r-deti-1', nadpis: 'Dřevěné jméno nad postýlku', text: 'Vyřežeme jméno z bukového dřeva, na přání s barvou a hvězdičkami.', cta: 'Navrhnout jméno', odkaz: '#', znacka: 'Dřevěné jméno', ikona: 'baby' },
  { id: 'r-deti-2', nadpis: 'Kniha na jméno vašeho dítěte', text: 'Pohádka, ve které je vaše dítě hlavní postavou. Tisk na počkání.', cta: 'Vytvořit knihu', odkaz: '#', znacka: 'Moje pohádka', ikona: 'star' },
  { id: 'r-deti-3', nadpis: 'Fotograf na první měsíc', text: 'Novorozenecké focení u vás doma, klidné tempo, bez rekvizit navíc.', cta: 'Rezervovat termín', odkaz: '#', znacka: 'Ateliér Zrnko', ikona: 'sparkles' },
  { id: 'r-deti-4', nadpis: 'Jmenovky do školky', text: 'Nažehlovací štítky se jménem — vydrží stovky praní. Sto kusů v balení.', cta: 'Objednat štítky', odkaz: '#', znacka: 'Štítkovna', ikona: 'type' },
]

const OBECNE: Inzerat[] = [
  { id: 'r-obec-1', nadpis: 'Rodokmen na jednom listu', text: 'Dohledáme předky pět generací zpět a vytiskneme na kvalitní papír.', cta: 'Zjistit víc', odkaz: '#', znacka: 'Rodokmeny.cz', ikona: 'users' },
  { id: 'r-obec-2', nadpis: 'Původ vašeho příjmení', text: 'Odkud se vzalo, kolik lidí ho dnes nosí a v jakém kraji je nejčastější.', cta: 'Vyhledat příjmení', odkaz: '#', znacka: 'Kde se vzalo', ikona: 'globe' },
  { id: 'r-obec-3', nadpis: 'Kalendář se jmeninami', text: 'Nástěnný kalendář, kde jsou svátky vidět na první pohled. Formát A3.', cta: 'Prohlédnout kalendář', odkaz: '#', znacka: 'Papírna Vltava', ikona: 'calendar' },
  { id: 'r-obec-4', nadpis: 'Jazykový kurz pro rodiče', text: 'Chcete jméno, které zvládnou i v cizině? Naučte se ho správně vyslovit.', cta: 'Vyzkoušet lekci', odkaz: '#', znacka: 'Lingvo', ikona: 'languages' },
]

/**
 * Ukázkové kreativy pro vývoj a náhled — v ostrém provozu je nahradí odpověď
 * reklamní služby. Rozdělují se po ploše, ať náhled nevypadá jednotvárně.
 */
const UKAZKY = [...DETI, ...OBECNE, ...PSI, ...KOCKY]

export const REKLAMY: Record<string, Inzerat[]> = Object.fromEntries(
  PLOCHY.map((id, i) => [id, [UKAZKY[i % UKAZKY.length]]]),
)

export const inzeratyProPlochu = (plocha: string): Inzerat[] => REKLAMY[plocha] ?? []

/** Jak dlouho je vidět jedna strana pozice ve sloupci, než se překlopí. */
export const INTERVAL_MS = 15_000

/** Jak dlouho je vidět jedna reklama v liště nahoře na telefonu. */
export const INTERVAL_LISTA_MS = 10_000
