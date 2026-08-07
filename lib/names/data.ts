// Kurátorovaný katalog nejlíbivějších jmen podle zemí — zvířata i děti.
// Popularita je redakční skóre líbivosti 0–100 (kombinace tamních žebříčků a zvuku jména).

import type { Energie, Jmeno, Kategorie, Kontinent, PohlaviZvirete, Styl, Velikost, Zeme } from './types'
import { DOMACKY, SAMICE_ZVIRE, SVATKY_CZ, UNISEX, UNISEX_ZVIRE } from './extra'

export const KONTINENTY: Kontinent[] = [
  { id: 'evropa',          nazev: 'Evropa',              popis: 'Tradice svátků, jmeniny a klasika, která nestárne.' },
  { id: 'asie',            nazev: 'Asie',                popis: 'Krátká melodická jména plná přírody a symbolů.' },
  { id: 'afrika',          nazev: 'Afrika',              popis: 'Jména s příběhem — od faraonů po poušť.' },
  { id: 'severni-amerika', nazev: 'Severní Amerika',     popis: 'Uvolněná, přátelská jména z filmů a seriálů.' },
  { id: 'jizni-amerika',   nazev: 'Jižní Amerika',       popis: 'Hravá, sladká a temperamentní jména.' },
  { id: 'australie',       nazev: 'Austrálie a Oceánie', popis: 'Slunce, surf a jména, která znějí jako prázdniny.' },
]

export const ZEME: Zeme[] = [
  { kod: 'cz', nazev: 'Česko',          vlajka: '🇨🇿', kontinent: 'evropa',          poznamka: 'Jmeniny v kalendáři a zdrobněliny pro každou příležitost.' },
  { kod: 'sk', nazev: 'Slovensko',      vlajka: '🇸🇰', kontinent: 'evropa',          poznamka: 'Měkké souhlásky a jména, která hladí.' },
  { kod: 'de', nazev: 'Německo',        vlajka: '🇩🇪', kontinent: 'evropa',          poznamka: 'Krátká úderná jména i návrat staré klasiky.' },
  { kod: 'fr', nazev: 'Francie',        vlajka: '🇫🇷', kontinent: 'evropa',          poznamka: 'Elegance, šarm a jména jako z filmu.' },
  { kod: 'it', nazev: 'Itálie',         vlajka: '🇮🇹', kontinent: 'evropa',          poznamka: 'Zpěvná jména končící na -o a -a.' },
  { kod: 'es', nazev: 'Španělsko',      vlajka: '🇪🇸', kontinent: 'evropa',          poznamka: 'Temperament a sluneční samohlásky.' },
  { kod: 'gb', nazev: 'Velká Británie', vlajka: '🇬🇧', kontinent: 'evropa',          poznamka: 'Královská klasika vedle roztomilých mazlivých forem.' },
  { kod: 'se', nazev: 'Švédsko',        vlajka: '🇸🇪', kontinent: 'evropa',          poznamka: 'Severská mytologie a jména z Astrid Lindgrenové.' },
  { kod: 'jp', nazev: 'Japonsko',       vlajka: '🇯🇵', kontinent: 'asie',            poznamka: 'Každé jméno je malý obraz — květ, nebe, jaro.' },
  { kod: 'eg', nazev: 'Egypt',          vlajka: '🇪🇬', kontinent: 'afrika',          poznamka: 'Jména bohů, faraonů a pouštních hvězd.' },
  { kod: 'us', nazev: 'USA',            vlajka: '🇺🇸', kontinent: 'severni-amerika', poznamka: 'Přátelská jména, která zná celý svět.' },
  { kod: 'br', nazev: 'Brazílie',       vlajka: '🇧🇷', kontinent: 'jizni-amerika',   poznamka: 'Sladká jména — med, popcorn i karamel.' },
  { kod: 'au', nazev: 'Austrálie',      vlajka: '🇦🇺', kontinent: 'australie',       poznamka: 'Pohodová jména z buše i od moře.' },
  { kod: 'gr', nazev: 'Řecko',          vlajka: '🇬🇷', kontinent: 'evropa',          poznamka: 'Bohové Olympu, filozofové a jména psaná mýty.' },
  { kod: 'pl', nazev: 'Polsko',         vlajka: '🇵🇱', kontinent: 'evropa',          poznamka: 'Srdečná jména od Baltu po Tatry — a slavní psi z večerníčků.' },
  { kod: 'ca', nazev: 'Kanada',         vlajka: '🇨🇦', kontinent: 'severni-amerika', poznamka: 'Zimní jména — sníh, javor a polární záře.' },
  { kod: 'in', nazev: 'Indie',          vlajka: '🇮🇳', kontinent: 'asie',            poznamka: 'Jména vonící kořením — král, perla i měsíční svit.' },
  { kod: 'ar', nazev: 'Argentina',      vlajka: '🇦🇷', kontinent: 'jizni-amerika',   poznamka: 'Tango, pampy a jména se šarmem gaučů.' },
  { kod: 'nz', nazev: 'Nový Zéland',    vlajka: '🇳🇿', kontinent: 'australie',       poznamka: 'Maorská jména plná moře, kapradin a ptačího zpěvu.' },
  { kod: 'nl', nazev: 'Nizozemsko',     vlajka: '🇳🇱', kontinent: 'evropa',          poznamka: 'Krátká jména od kanálů, tulipánů a větrných mlýnů.' },
  { kod: 'no', nazev: 'Norsko',         vlajka: '🇳🇴', kontinent: 'evropa',          poznamka: 'Fjordy, vikingské ságy a jména tvrdá jako led.' },
  { kod: 'ie', nazev: 'Irsko',          vlajka: '🇮🇪', kontinent: 'evropa',          poznamka: 'Keltské legendy, zelené kopce a jména, která se zpívají.' },
  { kod: 'pt', nazev: 'Portugalsko',    vlajka: '🇵🇹', kontinent: 'evropa',          poznamka: 'Melancholické fado, mořeplavci a sladká jména.' },
  { kod: 'ua', nazev: 'Ukrajina',       vlajka: '🇺🇦', kontinent: 'evropa',          poznamka: 'Slunečnice, stepi a jména se srdcem kozáků.' },
  { kod: 'kr', nazev: 'Jižní Korea',    vlajka: '🇰🇷', kontinent: 'asie',            poznamka: 'Jména jako přání — moudrost, jas a laskavost.' },
]

export const zemePodleKodu = (kod: string) => ZEME.find(z => z.kod === kod)

// ── pomocné výpočty ──────────────────────────────────────────────────────────

const SAMOHLASKY = 'aáeéěiíoóuúůyý'

const klic = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

function pocetSlabik(jmeno: string): number {
  const s = jmeno.toLowerCase()
  let n = 0
  let vSamohlasce = false
  for (const ch of s) {
    const je = SAMOHLASKY.includes(ch)
    if (je && !vSamohlasce) n++
    vSamohlasce = je
  }
  return Math.max(1, n)
}

type RadekZvire = [string, string, number, Styl[], Energie, Velikost?]
type RadekDite = [string, string, number, Styl[], Energie, number[]?]

let poradi = 0
const vsechna: Jmeno[] = []

const SAMCI_KATEGORIE: Kategorie[] = ['pes', 'kocour']
const SAMICI_KATEGORIE: Kategorie[] = ['fenka', 'kocka']

function pohlaviZvirete(jmeno: string, kategorie: Kategorie): PohlaviZvirete | undefined {
  if (kategorie === 'kluk' || kategorie === 'holka') return undefined
  const k = klic(jmeno)
  if (UNISEX_ZVIRE.has(k)) return 'unisex'
  if (SAMICE_ZVIRE.has(k)) return 'samice'
  if (SAMCI_KATEGORIE.includes(kategorie)) return 'samec'
  if (SAMICI_KATEGORIE.includes(kategorie)) return 'samice'
  return 'samec'
}

function pridej(zeme: string, kategorie: Kategorie, radky: (RadekZvire | RadekDite)[]) {
  const jePes = kategorie === 'pes' || kategorie === 'fenka'
  const jeDite = kategorie === 'kluk' || kategorie === 'holka'
  for (const r of radky) {
    const [jmeno, vyznam, popularita, styly, energie, extra] = r
    const k = klic(jmeno)
    vsechna.push({
      id: `${zeme}-${kategorie}-${poradi++}`,
      jmeno, kategorie, zeme, vyznam, popularita, styly, energie,
      delka: jmeno.replace(/\s/g, '').length,
      slabiky: pocetSlabik(jmeno),
      mesice: jeDite && Array.isArray(extra) ? extra : [],
      velikost: jePes && typeof extra === 'string' ? extra : undefined,
      domacky: jeDite ? DOMACKY[k] : undefined,
      svatek: jeDite && zeme === 'cz' ? SVATKY_CZ[k] : undefined,
      unisex: jeDite && UNISEX.has(k) ? true : undefined,
      pohlavi: pohlaviZvirete(jmeno, kategorie),
    })
  }
}

// ══ ČESKO ════════════════════════════════════════════════════════════════════

pridej('cz', 'kluk', [
  ['Jakub',   'ten, kdo jde v patách — věrný průvodce', 96, ['tradiční'], 'vyvážená', [7]],
  ['Jan',     'Bůh je milostivý — česká klasika č. 1', 94, ['tradiční'], 'klidná', [5, 6]],
  ['Tomáš',   'dvojče — jméno s tisíciletou tradicí', 90, ['tradiční'], 'vyvážená', [3, 12]],
  ['Adam',    'člověk ze země — první a nadčasové', 92, ['tradiční', 'moderní'], 'vyvážená', [12]],
  ['Matyáš',  'dar od Boha — hravé i vznešené', 89, ['tradiční', 'elegantní'], 'živá', [2]],
  ['Vojtěch', 'útěcha vojska — jméno s pevným krokem', 87, ['tradiční'], 'živá', [4]],
  ['Filip',   'milovník koní — energické a přímé', 85, ['tradiční', 'sportovní'], 'živá', [5]],
  ['Mikuláš', 'vítězství lidu — voní prosincem', 82, ['tradiční', 'královské'], 'klidná', [12]],
])
pridej('cz', 'holka', [
  ['Eliška',   'Bůh je má přísaha — královna českých jmen', 97, ['tradiční', 'královské'], 'vyvážená', [10]],
  ['Anna',     'milostiplná — jméno, které nikdy nezklame', 93, ['tradiční'], 'klidná', [7]],
  ['Tereza',   'sklízející — hřejivé a spolehlivé', 91, ['tradiční'], 'vyvážená', [10]],
  ['Adéla',    'ušlechtilá — něžné se špetkou noblesy', 90, ['tradiční', 'elegantní'], 'vyvážená', [9]],
  ['Amálie',   'pracovitá — křehká krása starých časů', 89, ['tradiční', 'elegantní'], 'klidná', [6]],
  ['Sofie',    'moudrost — světové jméno s grácií', 88, ['moderní', 'elegantní'], 'vyvážená', [5]],
  ['Viktorie', 'vítězka — jméno se vztyčenou hlavou', 86, ['královské', 'elegantní'], 'živá', [3]],
  ['Ema',      'všeobjímající — krátké a hebké', 85, ['moderní'], 'klidná', [4]],
])
pridej('cz', 'pes', [
  ['Alík',  'nejčeštější psí jméno — kamarád z dětství', 90, ['tradiční', 'hravé'], 'živá', 'malé'],
  ['Ben',   'krátké, laskavé, spolehlivé', 92, ['tradiční'], 'vyvážená', 'střední'],
  ['Rex',   'král — pro psa s autoritou', 88, ['tradiční', 'královské'], 'živá', 'velké'],
  ['Baryk', 'chlupatý filozof z večerníčku', 84, ['hravé', 'tradiční'], 'klidná', 'střední'],
  ['Punťa', 'věrný parťák od boudy — zdrobnělina k pomazlení', 82, ['hravé'], 'klidná', 'malé'],
  ['Cézar', 'vládce — důstojné jméno pro velkého psa', 80, ['královské'], 'vyvážená', 'velké'],
])
pridej('cz', 'fenka', [
  ['Ajda',  'věrná parťačka na výlety', 90, ['tradiční'], 'živá', 'střední'],
  ['Bety',  'domácká pohodářka', 88, ['hravé'], 'vyvážená', 'střední'],
  ['Kessy', 'energie na rozdávání', 84, ['moderní', 'sportovní'], 'živá', 'střední'],
  ['Elza',  'ušlechtilá — fenka s noblesou', 82, ['elegantní'], 'klidná', 'velké'],
  ['Dina',  'jemná duše s bystrým čenichem', 80, ['tradiční'], 'vyvážená', 'malé'],
  ['Žeryk', 'nezbeda ze Čtyřlístku (pro fenky se nosí i Žerička)', 74, ['hravé'], 'živá', 'malé'],
])
pridej('cz', 'kocour', [
  ['Mikeš',  'mluvící kocour z Hrusic — poklad Ladových knížek', 95, ['tradiční', 'hravé'], 'živá'],
  ['Mourek', 'mourovatý klasik od kamen', 90, ['tradiční'], 'klidná'],
  ['Macek',  'velký měkký mazel', 86, ['hravé'], 'klidná'],
  ['Fousek', 'kníraté jméno pro zvědavce', 82, ['hravé'], 'vyvážená'],
  ['Damián', 'elegán s ďolíčkem v srsti', 76, ['elegantní'], 'vyvážená'],
])
pridej('cz', 'kocka', [
  ['Micka',   'nejmilovanější kočičí klasika', 92, ['tradiční'], 'klidná'],
  ['Mína',    'něžná společnice na klín', 86, ['tradiční'], 'klidná'],
  ['Líza',    'chytrá slečna s vlastní hlavou', 84, ['hravé'], 'živá'],
  ['Bára',    'bouřka v kožíšku', 80, ['tradiční'], 'živá'],
  ['Perlička','vzácnost, která přede', 76, ['elegantní'], 'klidná'],
])
pridej('cz', 'kun', [
  ['Šemík', 'bájný kůň, který skočil z Vyšehradu', 94, ['mytologické', 'tradiční'], 'živá'],
  ['Ryzka', 'ryzák se srdcem na dlani', 80, ['přírodní', 'tradiční'], 'vyvážená'],
])
pridej('cz', 'kralik', [
  ['Bobek', 'králík z klobouku — legenda večerníčku', 92, ['hravé', 'tradiční'], 'živá'],
  ['Ušák',  'uši jako radary, srdce ze zlata', 78, ['hravé'], 'klidná'],
])
pridej('cz', 'papousek', [
  ['Lóra',  'upovídaná dáma všech voliér', 88, ['tradiční', 'hravé'], 'živá'],
  ['Kokeš', 'drzoun, co si sedne na rameno', 76, ['hravé'], 'živá'],
])
pridej('cz', 'krecek', [
  ['Křupka', 'chroupe, syslí a je k sežrání', 84, ['hravé'], 'živá'],
  ['Fíček',  'kapesní kamarád do dlaně', 74, ['hravé'], 'vyvážená'],
])

// ══ SLOVENSKO ════════════════════════════════════════════════════════════════

pridej('sk', 'kluk', [
  ['Samuel', 'vyslyšel Bůh — měkké a vážené', 92, ['tradiční'], 'klidná', [9]],
  ['Oliver', 'olivovník — svěží evropský favorit', 90, ['moderní'], 'vyvážená', [7]],
  ['Michal', 'kdo je jako Bůh — ochránce', 88, ['tradiční'], 'vyvážená', [9]],
  ['Martin', 'bojovník s dobrým srdcem — svátek na sněhu', 86, ['tradiční'], 'vyvážená', [11]],
  ['Šimon',  'naslouchající — tiché a milé', 84, ['tradiční'], 'klidná', [10]],
  ['Matej',  'dar od Boha — bratr českého Matyáše', 83, ['tradiční'], 'živá', [2]],
])
pridej('sk', 'holka', [
  ['Nina',      'krátké, zvonivé, nezapomenutelné', 91, ['moderní'], 'vyvážená', [1]],
  ['Natália',   'narozená o Vánocích', 89, ['tradiční', 'elegantní'], 'vyvážená', [12]],
  ['Viktória',  'vítězka s dlouhým á', 87, ['královské'], 'živá', [3]],
  ['Lívia',     'olivově něžná', 85, ['elegantní', 'moderní'], 'klidná', [6]],
  ['Zuzana',    'lilie — slovenská stálice', 84, ['tradiční'], 'vyvážená', [8]],
  ['Dominika',  'patřící neděli — slunečná povaha', 82, ['tradiční'], 'živá', [7]],
])
pridej('sk', 'pes', [
  ['Dunčo', 'nejslovenštější pes od salaše', 90, ['tradiční', 'hravé'], 'vyvážená', 'střední'],
  ['Aron',  'síla a klid v jednom', 86, ['tradiční'], 'vyvážená', 'velké'],
  ['Bady',  'parťák do nepohody', 82, ['moderní', 'sportovní'], 'živá', 'střední'],
  ['Miško', 'medvídek v psím kožichu', 80, ['hravé'], 'klidná', 'malé'],
  ['Rio',   'temperament jižní řeky', 78, ['moderní', 'sportovní'], 'živá', 'střední'],
])
pridej('sk', 'fenka', [
  ['Ajka',  'věrné oči, rychlé nohy', 88, ['tradiční'], 'živá', 'střední'],
  ['Bela',  'bílá kráska', 85, ['elegantní', 'přírodní'], 'klidná', 'velké'],
  ['Sita',  'jemná duše z hor', 80, ['tradiční'], 'vyvážená', 'střední'],
  ['Fanka', 'veselá kopa ze dvora', 77, ['hravé'], 'živá', 'malé'],
  ['Luna',  'měsíční světlo na tlapkách', 84, ['přírodní', 'moderní'], 'klidná', 'střední'],
])
pridej('sk', 'kocour', [
  ['Murko',  'mourek po slovensky — přede u pece', 89, ['tradiční'], 'klidná'],
  ['Cyro',   'vznešený pán domácnosti', 80, ['elegantní'], 'vyvážená'],
  ['Felix',  'šťastný — a taky filmová hvězda', 84, ['tradiční', 'hravé'], 'živá'],
  ['Bruno',  'hnědý sametový tlapkáč', 78, ['tradiční'], 'klidná'],
])
pridej('sk', 'kocka', [
  ['Mica',  'slovenská Micka — klasika', 88, ['tradiční'], 'klidná'],
  ['Cilka', 'drobná slečna s velkým srdcem', 82, ['tradiční', 'hravé'], 'vyvážená'],
  ['Bibi',  'korálkové oči, hebký kožíšek', 78, ['hravé'], 'živá'],
  ['Zora',  'jitřenka — vstává první', 76, ['přírodní', 'elegantní'], 'vyvážená'],
])
pridej('sk', 'kun', [
  ['Tátoš', 'kouzelný kůň z pohádek', 90, ['mytologické'], 'živá'],
  ['Hviezda', 'hvězda pastvin', 78, ['přírodní', 'elegantní'], 'vyvážená'],
])
pridej('sk', 'kralik', [
  ['Mrkvička', 'jméno, které chutná', 84, ['hravé'], 'živá'],
  ['Fúzik',    'vousky v jednom pohybu', 76, ['hravé'], 'vyvážená'],
])
pridej('sk', 'papousek', [
  ['Žako',  'šedý mudrc, co všechno zopakuje', 82, ['tradiční'], 'vyvážená'],
  ['Pirko', 'peříčko s vlastním názorem', 75, ['hravé'], 'živá'],
])
pridej('sk', 'krecek', [
  ['Chrumko', 'chroupe od rána do večera', 83, ['hravé'], 'živá'],
  ['Cukrík',  'sladký jako bonbon', 77, ['hravé'], 'vyvážená'],
])

// ══ NĚMECKO ══════════════════════════════════════════════════════════════════

pridej('de', 'kluk', [
  ['Noah',  'utěšitel — německá jednička', 93, ['moderní', 'tradiční'], 'klidná', [11]],
  ['Leon',  'lev — krátké a silné', 91, ['moderní'], 'živá', [6]],
  ['Paul',  'skromný — nadčasová stálice', 89, ['tradiční'], 'klidná', [6]],
  ['Finn',  'světlý poutník ze severu', 87, ['moderní', 'přírodní'], 'živá', [8]],
  ['Elias', 'můj Bůh je Hospodin — jemné a pevné', 86, ['tradiční'], 'vyvážená', [7]],
  ['Anton', 'neocenitelný — návrat staré školy', 84, ['tradiční', 'elegantní'], 'vyvážená', [1]],
])
pridej('de', 'holka', [
  ['Emilia', 'horlivá — melodie na tři slabiky', 94, ['moderní', 'elegantní'], 'vyvážená', [5]],
  ['Mia',    'vzpurná i milovaná — mini jméno, maxi šarm', 92, ['moderní'], 'živá', [4]],
  ['Hannah', 'milostiplná — čte se stejně z obou stran', 89, ['tradiční'], 'klidná', [7]],
  ['Lina',   'něžná — lehounká jako pírko', 87, ['moderní'], 'klidná', [9]],
  ['Clara',  'jasná — světlo starých salonů', 86, ['tradiční', 'elegantní'], 'vyvážená', [8]],
  ['Greta',  'perla — jméno s pevným stiskem', 84, ['tradiční'], 'živá', [6]],
])
pridej('de', 'pes', [
  ['Bello', 'štěkavý klasik německých dvorků', 88, ['tradiční', 'hravé'], 'živá', 'střední'],
  ['Bruno', 'hnědý medvěd — klidná síla', 87, ['tradiční'], 'klidná', 'velké'],
  ['Fritz', 'pruský vtipálek', 83, ['tradiční', 'hravé'], 'živá', 'malé'],
  ['Rocco', 'rocker s dobrým srdcem', 81, ['moderní', 'sportovní'], 'živá', 'velké'],
  ['Balu',  'medvěd z Knihy džunglí — pohodář', 85, ['hravé'], 'klidná', 'velké'],
])
pridej('de', 'fenka', [
  ['Frieda', 'mírumilovná — babiččino jméno v nejlepším', 88, ['tradiční'], 'klidná', 'střední'],
  ['Heidi',  'děvče z Alp — sluníčko', 86, ['tradiční', 'hravé'], 'živá', 'malé'],
  ['Nala',   'lvice z Lvího krále', 85, ['hravé', 'mytologické'], 'vyvážená', 'střední'],
  ['Greta',  'perla mezi fenkami', 80, ['tradiční'], 'vyvážená', 'velké'],
  ['Emma',   'všeobjímající péče', 83, ['tradiční'], 'klidná', 'střední'],
])
pridej('de', 'kocour', [
  ['Findus', 'zelený kocourek od Pettsona — kamarád vynálezce', 90, ['hravé'], 'živá'],
  ['Moritz', 'lumpík z dvojice Max a Moritz', 84, ['tradiční', 'hravé'], 'živá'],
  ['Karlo',  'svobodný pán — chodí si po svém', 79, ['elegantní'], 'vyvážená'],
  ['Anton',  'důstojný domácí filozof', 77, ['tradiční'], 'klidná'],
])
pridej('de', 'kocka', [
  ['Minka', 'mazlivá klasika německých kuchyní', 87, ['tradiční'], 'klidná'],
  ['Lotte', 'šarmantní slečna od vedle', 84, ['tradiční', 'elegantní'], 'vyvážená'],
  ['Mieze', 'kočičí oslovení, které zlidovělo', 80, ['tradiční', 'hravé'], 'klidná'],
  ['Susi',  'zvědavý čumáček', 76, ['hravé'], 'živá'],
])
pridej('de', 'kun', [
  ['Falada', 'mluvící kůň z pohádky bratří Grimmů', 86, ['mytologické'], 'klidná'],
  ['Sturm',  'bouře — vítr v hřívě', 78, ['přírodní'], 'živá'],
])
pridej('de', 'kralik', [
  ['Hoppel', 'hopsá, tedy jest', 84, ['hravé'], 'živá'],
  ['Möhre',  'mrkev — jméno rovnou k večeři', 74, ['hravé'], 'vyvážená'],
])
pridej('de', 'papousek', [
  ['Coco',  'papoušek všech kapitánů', 84, ['tradiční', 'hravé'], 'živá'],
  ['Bubi',  'mazánek klece', 74, ['hravé'], 'vyvážená'],
])
pridej('de', 'krecek', [
  ['Willi', 'pilný střádal ze zooobchodu', 80, ['hravé'], 'živá'],
  ['Krümel', 'drobeček — vejde se do kapsy', 76, ['hravé'], 'vyvážená'],
])

// ══ FRANCIE ══════════════════════════════════════════════════════════════════

pridej('fr', 'kluk', [
  ['Gabriel',  'Bůh je má síla — francouzská jednička', 94, ['tradiční', 'elegantní'], 'vyvážená', [3]],
  ['Louis',    'slavný bojovník — jméno králů', 92, ['královské', 'tradiční'], 'vyvážená', [8]],
  ['Léo',      'lev s pařížským šarmem', 90, ['moderní'], 'živá', [6]],
  ['Raphaël',  'Bůh uzdravuje — andělská klasika', 88, ['tradiční', 'elegantní'], 'klidná', [10]],
  ['Jules',    'mladý — nosí ho básníci', 86, ['elegantní', 'moderní'], 'vyvážená', [4]],
  ['Hugo',     'duchaplný — od Paříže po Prahu', 85, ['tradiční', 'moderní'], 'vyvážená', [4]],
])
pridej('fr', 'holka', [
  ['Louise',   'slavná bojovnice — něžná revoluce', 93, ['tradiční', 'elegantní'], 'vyvážená', [3]],
  ['Jade',     'drahokam — hladké a chladivě krásné', 91, ['moderní'], 'klidná', [8]],
  ['Alice',    'vznešená — dívka ze země divů', 89, ['tradiční'], 'vyvážená', [6]],
  ['Chloé',    'kvetoucí — voní jarem', 88, ['elegantní'], 'živá', [5]],
  ['Léa',      'lehká jako vánek', 86, ['moderní'], 'klidná', [3]],
  ['Margot',   'perla s ofinou — retro šik', 85, ['elegantní', 'tradiční'], 'vyvážená', [6]],
])
pridej('fr', 'pes', [
  ['Milou',   'věrný foxteriér z Tintina', 90, ['hravé', 'tradiční'], 'živá', 'malé'],
  ['Filou',   'šibal — pes, co vás okrade o srdce', 87, ['hravé'], 'živá', 'malé'],
  ['Gaston',  'dobrácký popleta', 84, ['tradiční', 'hravé'], 'klidná', 'velké'],
  ['Oscar',   'elegán s motýlkem', 82, ['elegantní'], 'vyvážená', 'střední'],
  ['Titou',   'mazlík z jihu Francie', 78, ['hravé'], 'vyvážená', 'malé'],
])
pridej('fr', 'fenka', [
  ['Belle',  'kráska — a že to ví', 90, ['elegantní'], 'vyvážená', 'střední'],
  ['Fifi',   'pařížská parádnice', 85, ['hravé', 'elegantní'], 'živá', 'malé'],
  ['Coco',   'pocta Coco Chanel — ikona stylu', 84, ['elegantní', 'moderní'], 'vyvážená', 'malé'],
  ['Perle',  'perla — vzácná a tichá', 79, ['elegantní'], 'klidná', 'střední'],
  ['Mirza',  'francouzská písňová legenda', 76, ['tradiční'], 'živá', 'střední'],
])
pridej('fr', 'kocour', [
  ['Minou',  'kočičí oslovení, ze kterého je jméno', 88, ['tradiční', 'hravé'], 'klidná'],
  ['Marcel', 'kavárenský povaleč s knírkem', 84, ['tradiční', 'elegantní'], 'klidná'],
  ['Félix',  'šťastný kocour — filmová stálice', 83, ['tradiční'], 'živá'],
  ['Pompon', 'bambulka — kulaťoučký mazel', 78, ['hravé'], 'klidná'],
])
pridej('fr', 'kocka', [
  ['Minette', 'slečinka s drápky v rukavičkách', 86, ['tradiční', 'elegantní'], 'klidná'],
  ['Plume',   'pírko — našlapuje neslyšně', 84, ['elegantní', 'přírodní'], 'klidná'],
  ['Chipie',  'rošťanda — vládne bytu', 80, ['hravé'], 'živá'],
  ['Câline',  'mazlivá — jméno jako pohlazení', 78, ['elegantní'], 'klidná'],
])
pridej('fr', 'kun', [
  ['Tornado', 'vítr z komiksů — rychlost sama', 82, ['sportovní'], 'živá'],
  ['Étoile',  'hvězda — bílá lysinka na čele', 80, ['elegantní', 'přírodní'], 'vyvážená'],
])
pridej('fr', 'kralik', [
  ['Panpan', 'Dupík z Bambiho po francouzsku', 85, ['hravé'], 'živá'],
  ['Câlin',  'mazel na plný úvazek', 76, ['hravé'], 'klidná'],
])
pridej('fr', 'papousek', [
  ['Jacquot', 'tradiční jméno všech francouzských papoušků', 82, ['tradiční'], 'živá'],
  ['Kiki',    'drzé peří', 76, ['hravé'], 'živá'],
])
pridej('fr', 'krecek', [
  ['Nougat',  'sladký jako nugát', 80, ['hravé'], 'vyvážená'],
  ['Biscotte','sucharka, co křupe', 75, ['hravé'], 'živá'],
])

// ══ ITÁLIE ═══════════════════════════════════════════════════════════════════

pridej('it', 'kluk', [
  ['Leonardo',   'silný jako lev — génius v každém ohledu', 94, ['tradiční', 'elegantní'], 'vyvážená', [11]],
  ['Francesco',  'Francouzek — jméno světce z Assisi', 91, ['tradiční'], 'klidná', [10]],
  ['Lorenzo',    'vavřínem ověnčený', 89, ['tradiční', 'elegantní'], 'vyvážená', [8]],
  ['Alessandro', 'obránce lidí — velkolepé', 88, ['královské'], 'živá', [8]],
  ['Matteo',     'dar od Boha — sluneční melodie', 87, ['tradiční'], 'vyvážená', [9]],
  ['Tommaso',    'dvojče — zpěvná klasika', 84, ['tradiční'], 'klidná', [7]],
])
pridej('it', 'holka', [
  ['Sofia',    'moudrost — italská první dáma', 94, ['elegantní', 'tradiční'], 'vyvážená', [5]],
  ['Giulia',   'mladistvá — celá Itálie v jednom jméně', 92, ['tradiční'], 'živá', [5]],
  ['Aurora',   'jitřenka — světlo úsvitu', 91, ['přírodní', 'elegantní'], 'vyvážená', [12]],
  ['Ginevra',  'bílá vlna — jméno z artušovských legend', 88, ['mytologické', 'elegantní'], 'klidná', [1]],
  ['Beatrice', 'ta, jež přináší štěstí — Dantova múza', 87, ['tradiční', 'elegantní'], 'klidná', [2]],
  ['Alice',    'vznešená — lehká jako opera buffa', 85, ['tradiční'], 'vyvážená', [6]],
])
pridej('it', 'pes', [
  ['Fido',   'věrný — praotec všech psích jmen', 90, ['tradiční'], 'vyvážená', 'střední'],
  ['Argo',   'Odysseův věrný pes — čekal dvacet let', 87, ['mytologické'], 'klidná', 'velké'],
  ['Rocco',  'skála — svalnatý dobrák', 84, ['tradiční', 'sportovní'], 'živá', 'velké'],
  ['Leo',    'malý lev na gauči', 83, ['moderní'], 'živá', 'malé'],
  ['Ugo',    'krátké jméno, velká osobnost', 78, ['tradiční'], 'vyvážená', 'střední'],
])
pridej('it', 'fenka', [
  ['Stella', 'hvězda — září na každé procházce', 89, ['elegantní', 'přírodní'], 'vyvážená', 'střední'],
  ['Perla',  'perla Jadranu', 84, ['elegantní'], 'klidná', 'malé'],
  ['Luna',   'měsíc nad Toskánskem', 88, ['přírodní', 'moderní'], 'klidná', 'střední'],
  ['Bella',  'krásná — jednoduše', 86, ['elegantní'], 'vyvážená', 'střední'],
  ['Kira',   'paprsek slunce', 79, ['moderní'], 'živá', 'velké'],
])
pridej('it', 'kocour', [
  ['Romeo',   'milovník ze střech Verony', 90, ['tradiční', 'elegantní'], 'vyvážená'],
  ['Micio',   'kočičí mazel po italsku', 84, ['tradiční', 'hravé'], 'klidná'],
  ['Nerone',  'černý císař domácnosti', 80, ['královské'], 'vyvážená'],
  ['Pallino', 'kulička, co se koulí bytem', 77, ['hravé'], 'živá'],
])
pridej('it', 'kocka', [
  ['Micia',    'něžná mourinka', 85, ['tradiční'], 'klidná'],
  ['Bianca',   'bílá dáma', 83, ['elegantní'], 'klidná'],
  ['Stellina', 'hvězdička na čtyřech tlapkách', 80, ['hravé', 'elegantní'], 'živá'],
  ['Dolce',    'sladká jako tiramisu', 78, ['hravé'], 'vyvážená'],
])
pridej('it', 'kun', [
  ['Furia',   'vichr z filmových pláten', 84, ['sportovní'], 'živá'],
  ['Morello', 'vraník barvy višně', 78, ['přírodní', 'tradiční'], 'vyvážená'],
])
pridej('it', 'kralik', [
  ['Batuffolo', 'chomáček vaty', 80, ['hravé'], 'klidná'],
  ['Carota',    'mrkvička po italsku', 74, ['hravé'], 'živá'],
])
pridej('it', 'papousek', [
  ['Pippo',  'veselý brepta', 80, ['hravé'], 'živá'],
  ['Verde',  'zelený jako limetka', 74, ['přírodní'], 'vyvážená'],
])
pridej('it', 'krecek', [
  ['Nocciola', 'lískový oříšek', 79, ['hravé', 'přírodní'], 'živá'],
  ['Ciccio',   'buclík k pomazlení', 75, ['hravé'], 'klidná'],
])

// ══ ŠPANĚLSKO ════════════════════════════════════════════════════════════════

pridej('es', 'kluk', [
  ['Hugo',   'duchaplný — španělská špička', 92, ['moderní', 'tradiční'], 'vyvážená', [4]],
  ['Martín', 'bojovník — s přízvukem na konci', 90, ['tradiční'], 'vyvážená', [11]],
  ['Mateo',  'dar od Boha — sluneční jméno', 89, ['tradiční'], 'živá', [9]],
  ['Leo',    'lev — krátké a hravé', 87, ['moderní'], 'živá', [6]],
  ['Pablo',  'skromný — jméno malířů', 85, ['tradiční'], 'klidná', [1]],
  ['Manuel', 'Bůh s námi — klasika s kytarou', 83, ['tradiční'], 'vyvážená', [1]],
])
pridej('es', 'holka', [
  ['Lucía',   'světlo — španělská královna jmen', 94, ['tradiční', 'elegantní'], 'vyvážená', [12]],
  ['Sofía',   'moudrost s přízvukem', 91, ['elegantní'], 'vyvážená', [5]],
  ['Martina', 'bojovnice s úsměvem', 89, ['tradiční'], 'živá', [11]],
  ['Paula',   'drobná — a přece velká', 86, ['tradiční'], 'klidná', [1]],
  ['Julia',   'mladistvá — věčné léto', 85, ['tradiční'], 'vyvážená', [5]],
  ['Carmen',  'píseň — jméno jako opera', 84, ['tradiční', 'elegantní'], 'živá', [7]],
])
pridej('es', 'pes', [
  ['Chico',  'kluk — parťák do ulic', 87, ['hravé'], 'živá', 'malé'],
  ['Rayo',   'blesk — nejrychlejší na dvoře', 85, ['sportovní', 'přírodní'], 'živá', 'střední'],
  ['Toro',   'býk — hruď kolem dokola', 82, ['tradiční'], 'vyvážená', 'velké'],
  ['Canelo', 'skořicový hafan', 84, ['přírodní', 'hravé'], 'vyvážená', 'střední'],
  ['Lucero', 'jitřní hvězda', 78, ['přírodní', 'elegantní'], 'klidná', 'velké'],
])
pridej('es', 'fenka', [
  ['Canela',   'skořice — sladká a hřejivá', 88, ['přírodní', 'hravé'], 'vyvážená', 'střední'],
  ['Chispa',   'jiskra — pořád v jednom ohni', 85, ['hravé', 'sportovní'], 'živá', 'malé'],
  ['Estrella', 'hvězda jižního nebe', 84, ['elegantní', 'přírodní'], 'vyvážená', 'střední'],
  ['Bonita',   'hezounká — a ví to', 82, ['hravé', 'elegantní'], 'živá', 'malé'],
  ['Linda',    'půvabná společnice', 78, ['tradiční'], 'klidná', 'velké'],
])
pridej('es', 'kocour', [
  ['Michi',  'španělské čiči — zlidovělé oslovení', 86, ['tradiční', 'hravé'], 'klidná'],
  ['Tigre',  'tygr obývákový pruhovaný', 83, ['přírodní'], 'živá'],
  ['Simón',  'naslouchající pán střech', 78, ['tradiční'], 'vyvážená'],
  ['Coque',  'frajer z Madridu', 75, ['hravé', 'moderní'], 'živá'],
])
pridej('es', 'kocka', [
  ['Pelusa', 'chmýří — nadýchaná něha', 84, ['hravé'], 'klidná'],
  ['Nube',   'obláček na slunci', 81, ['přírodní', 'elegantní'], 'klidná'],
  ['Lola',   'temperament v kožíšku', 83, ['tradiční', 'hravé'], 'živá'],
  ['Alba',   'svítání — vstává s ptáky', 78, ['přírodní', 'elegantní'], 'vyvážená'],
])
pridej('es', 'kun', [
  ['Babieca',  'věrný kůň rytíře Cida', 86, ['mytologické', 'tradiční'], 'vyvážená'],
  ['Relámpago','blesk přes pampu', 78, ['sportovní'], 'živá'],
])
pridej('es', 'kralik', [
  ['Saltarín', 'hopsálek', 80, ['hravé'], 'živá'],
  ['Copito',   'vločička sněhu', 76, ['hravé', 'přírodní'], 'klidná'],
])
pridej('es', 'papousek', [
  ['Lorito', 'papoušek, jak má být', 80, ['tradiční', 'hravé'], 'živá'],
  ['Paco',   'brepta s velkým slovníkem', 76, ['hravé'], 'živá'],
])
pridej('es', 'krecek', [
  ['Bolita',   'kulička v kolečku', 79, ['hravé'], 'živá'],
  ['Churrito', 'sladký jako churros', 74, ['hravé'], 'vyvážená'],
])

// ══ VELKÁ BRITÁNIE ═══════════════════════════════════════════════════════════

pridej('gb', 'kluk', [
  ['Oliver', 'olivovník — britská jednička', 94, ['tradiční'], 'vyvážená', [7]],
  ['George', 'hospodář — jméno králů', 92, ['královské', 'tradiční'], 'vyvážená', [4]],
  ['Arthur', 'medvěd — král kulatého stolu', 90, ['královské', 'mytologické'], 'klidná', [11]],
  ['Harry',  'pán domu — princ i čaroděj', 88, ['tradiční', 'hravé'], 'živá', [7]],
  ['Archie', 'odvážný — mazlivá forma, co dobyla ostrovy', 86, ['moderní', 'hravé'], 'živá', [9]],
  ['Theo',   'boží dar — krátké a vřelé', 85, ['moderní'], 'vyvážená', [11]],
])
pridej('gb', 'holka', [
  ['Olivia', 'olivovník — první dáma ostrovů', 94, ['tradiční', 'elegantní'], 'vyvážená', [7]],
  ['Amelia', 'pracovitá — letkyně i princezna', 92, ['tradiční', 'elegantní'], 'vyvážená', [3]],
  ['Isla',   'ostrov — skotský vánek', 90, ['přírodní', 'moderní'], 'klidná', [8]],
  ['Ivy',    'břečťan — drobné a nezdolné', 88, ['přírodní', 'moderní'], 'klidná', [12]],
  ['Freya',  'severská bohyně lásky', 87, ['mytologické'], 'živá', [2]],
  ['Lily',   'lilie — čistota a půvab', 86, ['přírodní', 'tradiční'], 'klidná', [5]],
])
pridej('gb', 'pes', [
  ['Buddy',  'kamarád — pes, co podává tlapku', 89, ['hravé'], 'vyvážená', 'střední'],
  ['Alfie',  'rozšafný londýnský gentleman', 87, ['hravé', 'tradiční'], 'vyvážená', 'malé'],
  ['Teddy',  'medvídek na vodítku', 86, ['hravé'], 'klidná', 'malé'],
  ['Baxter', 'pekař — pes s buřinkou', 80, ['tradiční', 'elegantní'], 'vyvážená', 'velké'],
  ['Winston','státník s mopsím výrazem', 82, ['královské', 'tradiční'], 'klidná', 'velké'],
])
pridej('gb', 'fenka', [
  ['Poppy',  'vlčí mák — kvete celý rok', 90, ['přírodní', 'hravé'], 'živá', 'malé'],
  ['Daisy',  'sedmikráska z anglické louky', 88, ['přírodní'], 'vyvážená', 'střední'],
  ['Millie', 'jemná společnice k čaji', 85, ['hravé'], 'klidná', 'malé'],
  ['Rosie',  'růžička s mokrým čenichem', 84, ['přírodní', 'hravé'], 'vyvážená', 'střední'],
  ['Skye',   'nebe nad Skotskem', 81, ['přírodní', 'moderní'], 'živá', 'velké'],
])
pridej('gb', 'kocour', [
  ['Jasper', 'drahokam s drápky', 85, ['elegantní'], 'vyvážená'],
  ['Oscar',  'divadelní hvězda parapetů', 84, ['tradiční', 'elegantní'], 'klidná'],
  ['Tom',    'kocour, kterého zná celý svět', 82, ['tradiční', 'hravé'], 'živá'],
  ['Monty',  'aristokrat z venkovského sídla', 79, ['královské', 'hravé'], 'klidná'],
])
pridej('gb', 'kocka', [
  ['Tilly',  'drobná dáma s bystrým okem', 85, ['hravé'], 'vyvážená'],
  ['Misty',  'mlha nad vřesovištěm', 83, ['přírodní'], 'klidná'],
  ['Willow', 'vrba — pružná a tichá', 82, ['přírodní', 'elegantní'], 'klidná'],
  ['Molly',  'věrná společnice ke krbu', 80, ['tradiční'], 'vyvážená'],
])
pridej('gb', 'kun', [
  ['Beauty', 'Černý hřebec z klasického románu', 86, ['tradiční', 'elegantní'], 'vyvážená'],
  ['Chester','hnědák s gentlemanským krokem', 76, ['tradiční'], 'klidná'],
])
pridej('gb', 'kralik', [
  ['Peter',  'králík Petr z knížek Beatrix Potterové', 88, ['tradiční', 'hravé'], 'živá'],
  ['Clover', 'čtyřlístek pro štěstí', 78, ['přírodní'], 'klidná'],
])
pridej('gb', 'papousek', [
  ['Polly',  '„Polly wants a cracker" — legenda', 84, ['tradiční', 'hravé'], 'živá'],
  ['Pip',    'pecka — malý a drzý', 75, ['hravé'], 'živá'],
])
pridej('gb', 'krecek', [
  ['Hammy',  'křeček z animáků — pořád v poklusu', 80, ['hravé'], 'živá'],
  ['Nibbles','okusovač všeho', 76, ['hravé'], 'živá'],
])

// ══ ŠVÉDSKO ══════════════════════════════════════════════════════════════════

pridej('se', 'kluk', [
  ['William', 'odhodlaný ochránce — severská stálice', 91, ['tradiční'], 'vyvážená', [4]],
  ['Nils',    'vítěz — poutník s divokými husami', 88, ['tradiční'], 'klidná', [10]],
  ['Oscar',   'boží kopí — jméno králů i ceny', 87, ['královské', 'tradiční'], 'vyvážená', [12]],
  ['Axel',    'otec míru — úderné a moderní', 86, ['moderní'], 'živá', [3]],
  ['Alfred',  'moudrý rádce — Nobelovo jméno', 84, ['tradiční', 'elegantní'], 'klidná', [10]],
  ['Vidar',   'tichý bůh lesů ze severské mytologie', 82, ['mytologické', 'přírodní'], 'klidná', [2]],
])
pridej('se', 'holka', [
  ['Alice',  'vznešená — švédská jednička', 92, ['tradiční'], 'vyvážená', [6]],
  ['Maja',   'májová — kvete v jednoduchosti', 90, ['přírodní', 'moderní'], 'klidná', [5]],
  ['Elsa',   'zasvěcená Bohu — ledová královna', 89, ['tradiční', 'královské'], 'klidná', [1]],
  ['Astrid', 'božsky krásná — pocta Lindgrenové', 88, ['tradiční', 'mytologické'], 'vyvážená', [11]],
  ['Freja',  'bohyně lásky a jara', 87, ['mytologické'], 'živá', [2]],
  ['Wilma',  'odhodlaná ochránkyně s úsměvem', 85, ['moderní'], 'živá', [9]],
])
pridej('se', 'pes', [
  ['Ludde',  'chundelatý pohodář — švédská psí klasika', 88, ['hravé'], 'klidná', 'střední'],
  ['Sigge',  'vítězný skřítek', 86, ['hravé', 'tradiční'], 'živá', 'malé'],
  ['Bamse',  'nejsilnější medvěd na světě z komiksů', 85, ['hravé'], 'klidná', 'velké'],
  ['Loke',   'severský šibal Loki', 83, ['mytologické'], 'živá', 'střední'],
  ['Thor',   'hromovládce s vrtícím ocasem', 84, ['mytologické'], 'živá', 'velké'],
])
pridej('se', 'fenka', [
  ['Saga',   'příběh — jméno jako vyprávění', 88, ['mytologické', 'elegantní'], 'klidná', 'střední'],
  ['Ronja',  'dcera loupežníka — divoška z lesů', 87, ['tradiční', 'přírodní'], 'živá', 'střední'],
  ['Doris',  'dar moře — retro švihačka', 80, ['tradiční', 'hravé'], 'vyvážená', 'malé'],
  ['Stina',  'pevná a jasná', 78, ['tradiční'], 'vyvážená', 'střední'],
  ['Tuva',   'travnatý pahorek — hebkost sama', 79, ['přírodní', 'moderní'], 'klidná', 'velké'],
])
pridej('se', 'kocour', [
  ['Findus', 'kocourek z Pettsona a Finduse', 90, ['hravé'], 'živá'],
  ['Sixten', 'kamenný vítěz s hebkou srstí', 82, ['tradiční'], 'vyvážená'],
  ['Melker', 'svérázný pán ze souostroví', 78, ['tradiční'], 'klidná'],
  ['Gösta',  'severský dobrák', 75, ['tradiční'], 'klidná'],
])
pridej('se', 'kocka', [
  ['Selma',  'spisovatelka mezi kočkami', 84, ['tradiční', 'elegantní'], 'klidná'],
  ['Tindra', 'třpytit se — jiskry v očích', 83, ['přírodní', 'moderní'], 'živá'],
  ['Signe',  'nové vítězství — tichá síla', 80, ['tradiční'], 'klidná'],
  ['Vilda',  'divoká — a pyšná na to', 78, ['přírodní'], 'živá'],
])
pridej('se', 'kun', [
  ['Gubben', 'koník Pipi Dlouhé punčochy', 85, ['hravé'], 'klidná'],
  ['Norr',   'sever — vítr v hřívě', 76, ['přírodní'], 'vyvážená'],
])
pridej('se', 'kralik', [
  ['Skutt',  'hop! — králičí skok', 80, ['hravé'], 'živá'],
  ['Morot',  'mrkev po švédsku', 74, ['hravé'], 'vyvážená'],
])
pridej('se', 'papousek', [
  ['Pelle',  'peříčkový kamarád', 78, ['hravé'], 'živá'],
  ['Kajsa',  'štěbetalka od fjordu', 74, ['hravé'], 'živá'],
])
pridej('se', 'krecek', [
  ['Nisse',  'domácí skřítek ve fusaku', 79, ['hravé', 'mytologické'], 'živá'],
  ['Plutten','drobísek', 74, ['hravé'], 'vyvážená'],
])

// ══ JAPONSKO ═════════════════════════════════════════════════════════════════

pridej('jp', 'kluk', [
  ['Haruto', 'slunečný let — nejoblíbenější jméno Japonska', 92, ['moderní', 'přírodní'], 'vyvážená', [4]],
  ['Ren',    'lotos — čistota na hladině', 90, ['přírodní', 'moderní'], 'klidná', [7]],
  ['Sota',   'svěží vítr', 88, ['moderní', 'přírodní'], 'živá', [9]],
  ['Riku',   'pevná zem', 86, ['přírodní'], 'vyvážená', [3]],
  ['Kaito',  'moře a souhvězdí', 85, ['přírodní', 'moderní'], 'živá', [8]],
  ['Yuto',   'vlídný a nadějný', 83, ['moderní'], 'klidná', [10]],
])
pridej('jp', 'holka', [
  ['Himari', 'slunečnice obrácená ke světlu', 92, ['přírodní', 'moderní'], 'vyvážená', [7]],
  ['Sakura', 'třešňový květ — symbol jara', 91, ['přírodní', 'tradiční'], 'klidná', [3, 4]],
  ['Yui',    'něžné pouto', 89, ['moderní'], 'klidná', [1]],
  ['Hana',   'květina — prosté a dokonalé', 88, ['přírodní', 'tradiční'], 'vyvážená', [5]],
  ['Aoi',    'slézový květ — modř nebe', 86, ['přírodní'], 'klidná', [6]],
  ['Mio',    'vodní cesta — plyne lehce', 85, ['moderní', 'přírodní'], 'vyvážená', [8]],
])
pridej('jp', 'pes', [
  ['Hachi',  'věrný Hačikó — čekal každý den', 94, ['tradiční'], 'klidná', 'velké'],
  ['Kotaro', 'malý syn — samuraj do deště', 85, ['tradiční'], 'vyvážená', 'malé'],
  ['Maru',   'kruh — kulaťoučké štěstí', 87, ['hravé'], 'klidná', 'malé'],
  ['Taro',   'prvorozený — psí klasika Japonska', 84, ['tradiční'], 'vyvážená', 'střední'],
  ['Kuro',   'černý jako noc', 80, ['přírodní'], 'vyvážená', 'velké'],
])
pridej('jp', 'fenka', [
  ['Momo',   'broskvička', 90, ['hravé', 'přírodní'], 'živá', 'malé'],
  ['Koharu', 'malé jaro uprostřed podzimu', 87, ['přírodní', 'elegantní'], 'klidná', 'malé'],
  ['Yuki',   'sníh — tichá a bílá', 86, ['přírodní'], 'klidná', 'střední'],
  ['Azuki',  'červená fazolka — sladkost sama', 82, ['hravé'], 'vyvážená', 'malé'],
  ['Sora',   'nebe bez mráčku', 84, ['přírodní'], 'živá', 'velké'],
])
pridej('jp', 'kocour', [
  ['Tama',   'drahokam — nejslavnější kočičí jméno Japonska', 90, ['tradiční'], 'klidná'],
  ['Tora',   'tygr — pruhy povinné', 86, ['přírodní'], 'živá'],
  ['Jiji',   'černý kocourek čarodějky Kiki', 88, ['hravé'], 'vyvážená'],
  ['Fuku',   'štěstí — přináší ho do domu', 82, ['tradiční'], 'klidná'],
])
pridej('jp', 'kocka', [
  ['Mei',    'výhonek — jarní něha', 86, ['přírodní'], 'klidná'],
  ['Yuzu',   'citrusová vůně zimy', 84, ['přírodní', 'hravé'], 'živá'],
  ['Hime',   'princezna — a chová se tak', 83, ['královské'], 'klidná'],
  ['Kinako', 'sójová moučka — barva karamelu', 79, ['hravé'], 'vyvážená'],
])
pridej('jp', 'kun', [
  ['Kaze',   'vítr nad rýžovými poli', 82, ['přírodní'], 'živá'],
  ['Hikari', 'světlo — záře v pohybu', 80, ['přírodní', 'elegantní'], 'vyvážená'],
])
pridej('jp', 'kralik', [
  ['Mochi',  'rýžový koláček — měkkost sama', 86, ['hravé'], 'klidná'],
  ['Usagi',  'králíček z Měsíce', 78, ['mytologické', 'hravé'], 'živá'],
])
pridej('jp', 'papousek', [
  ['Piko',   'pípnutí s úsměvem', 78, ['hravé'], 'živá'],
  ['Aozora', 'modré nebe', 74, ['přírodní'], 'vyvážená'],
])
pridej('jp', 'krecek', [
  ['Chibi',  'prcek — menší než malý', 82, ['hravé'], 'živá'],
  ['Kurumi', 'vlašský ořech', 76, ['přírodní', 'hravé'], 'vyvážená'],
])

// ══ EGYPT ════════════════════════════════════════════════════════════════════

pridej('eg', 'kluk', [
  ['Omar',   'dlouhý život — vážené a silné', 90, ['tradiční'], 'vyvážená', [1]],
  ['Youssef','Bůh přidá — egyptský Josef', 89, ['tradiční'], 'klidná', [3]],
  ['Karim',  'štědrý — jméno s otevřenou dlaní', 87, ['tradiční', 'elegantní'], 'vyvážená', [6]],
  ['Ali',    'vznešený — krátké a hrdé', 86, ['tradiční'], 'živá', [5]],
  ['Amir',   'princ — vládne s úsměvem', 84, ['královské'], 'vyvážená', [8]],
  ['Tarek',  'jitřní hvězda — ten, kdo klepe na dveře rána', 82, ['tradiční', 'přírodní'], 'živá', [10]],
])
pridej('eg', 'holka', [
  ['Layla',  'noc — temná krása pouště', 91, ['tradiční', 'elegantní'], 'klidná', [12]],
  ['Nour',   'světlo — září i v šeru', 89, ['elegantní', 'moderní'], 'vyvážená', [6]],
  ['Salma',  'mírumilovná — bezpečné objetí', 87, ['tradiční'], 'klidná', [9]],
  ['Farida', 'jedinečná — perla bez páru', 85, ['elegantní'], 'vyvážená', [4]],
  ['Mariam', 'milovaná — nilská Marie', 84, ['tradiční'], 'klidná', [8]],
  ['Yasmin', 'jasmínový květ', 86, ['přírodní', 'elegantní'], 'vyvážená', [5]],
])
pridej('eg', 'pes', [
  ['Anubis', 'šakalí bůh — strážce se špičatýma ušima', 88, ['mytologické'], 'vyvážená', 'velké'],
  ['Ramses', 'faraon faraonů — vládce gauče', 86, ['královské', 'mytologické'], 'klidná', 'velké'],
  ['Sultan', 'vládce dvora', 83, ['královské'], 'vyvážená', 'velké'],
  ['Zaki',   'bystrý — nic mu neuteče', 80, ['tradiční'], 'živá', 'střední'],
  ['Amun',   'skrytý bůh — tichý společník', 78, ['mytologické'], 'klidná', 'střední'],
])
pridej('eg', 'fenka', [
  ['Cleo',   'Kleopatra do dlaně', 90, ['královské', 'moderní'], 'vyvážená', 'malé'],
  ['Zahra',  'květ pouště', 85, ['přírodní', 'elegantní'], 'klidná', 'střední'],
  ['Nefer',  'krásná — jako Nefertiti', 83, ['královské', 'elegantní'], 'klidná', 'střední'],
  ['Habiba', 'milovaná — srdíčko rodiny', 81, ['tradiční'], 'vyvážená', 'malé'],
  ['Nala',   'dar — lvice s něžnou duší', 84, ['mytologické', 'hravé'], 'živá', 'velké'],
])
pridej('eg', 'kocour', [
  ['Ra',     'bůh slunce — vyhřívá se právem', 88, ['mytologické', 'královské'], 'klidná'],
  ['Horus',  'sokolí bůh s ostrým zrakem', 84, ['mytologické'], 'živá'],
  ['Osiris', 'vládce podsvětí pod postelí', 82, ['mytologické'], 'vyvážená'],
  ['Mau',    'egyptská kočka — jméno staré tisíce let', 80, ['tradiční'], 'vyvážená'],
])
pridej('eg', 'kocka', [
  ['Bastet', 'kočičí bohyně radosti — originál', 90, ['mytologické', 'královské'], 'vyvážená'],
  ['Nubia',  'zlatá země jihu', 82, ['přírodní', 'elegantní'], 'klidná'],
  ['Sahara', 'pouštní vítr v kožíšku', 80, ['přírodní'], 'živá'],
  ['Lotus',  'květ Nilu', 79, ['přírodní', 'elegantní'], 'klidná'],
])
pridej('eg', 'kun', [
  ['Sirocco', 'horký vítr od pouště', 82, ['přírodní'], 'živá'],
  ['Nil',     'řeka, která dala život', 78, ['přírodní', 'tradiční'], 'klidná'],
])
pridej('eg', 'kralik', [
  ['Habibi', 'miláček — nejmilejší slovo arabštiny', 82, ['hravé'], 'klidná'],
  ['Fulful', 'pepříček', 74, ['hravé'], 'živá'],
])
pridej('eg', 'papousek', [
  ['Zuzu',   'štěbetavý drahoušek', 78, ['hravé'], 'živá'],
  ['Sissa',  'hlásek od Nilu', 72, ['hravé'], 'vyvážená'],
])
pridej('eg', 'krecek', [
  ['Simsim', 'sezamové semínko — otevři se!', 80, ['hravé'], 'živá'],
  ['Tamr',   'datle — sladký záškodník', 73, ['hravé', 'přírodní'], 'vyvážená'],
])

// ══ USA ══════════════════════════════════════════════════════════════════════

pridej('us', 'kluk', [
  ['Liam',   'odhodlaný ochránce — americká jednička', 93, ['moderní'], 'vyvážená', [3]],
  ['Henry',  'pán domu — návrat klasiky', 90, ['tradiční', 'královské'], 'klidná', [7]],
  ['Jack',   'chlapík pro každou práci', 88, ['tradiční', 'hravé'], 'živá', [8]],
  ['Mason',  'kameník — poctivé řemeslo', 85, ['moderní'], 'vyvážená', [10]],
  ['Ethan',  'pevný a vytrvalý', 84, ['moderní'], 'vyvážená', [1]],
  ['Logan',  'malá loučka — velké dobrodružství', 83, ['moderní', 'přírodní'], 'živá', [9]],
])
pridej('us', 'holka', [
  ['Ava',       'ptáček — dvě písmena navíc ke kráse', 92, ['moderní', 'elegantní'], 'vyvážená', [4]],
  ['Charlotte', 'svobodná — královská i americká', 91, ['královské', 'tradiční'], 'vyvážená', [11]],
  ['Harper',    'harfenistka — jméno se strunami', 88, ['moderní'], 'živá', [9]],
  ['Grace',     'půvab — tiché požehnání', 86, ['tradiční', 'elegantní'], 'klidná', [12]],
  ['Hazel',     'líska — oči barvy podzimu', 85, ['přírodní', 'moderní'], 'klidná', [10]],
  ['Scarlett',  'šarlatová — ohnivé srdce jihu', 84, ['moderní', 'elegantní'], 'živá', [2]],
])
pridej('us', 'pes', [
  ['Max',    'největší — nejoblíbenější psí jméno světa', 92, ['tradiční'], 'živá', 'střední'],
  ['Cooper', 'bednář — parťák z verandy', 89, ['moderní'], 'vyvážená', 'střední'],
  ['Duke',   'vévoda — důstojnost s vrtěním', 85, ['královské'], 'vyvážená', 'velké'],
  ['Rocky',  'šampión ze schodů ve Philly', 86, ['sportovní', 'hravé'], 'živá', 'velké'],
  ['Tucker', 'neúnavný honič míčků', 82, ['hravé'], 'živá', 'střední'],
])
pridej('us', 'fenka', [
  ['Bella',  'kráska — dlouholetá americká jednička', 91, ['elegantní'], 'vyvážená', 'střední'],
  ['Lucy',   'světlo — komička rodiny', 88, ['tradiční', 'hravé'], 'živá', 'malé'],
  ['Sadie',  'princezna z předměstí', 85, ['tradiční'], 'vyvážená', 'střední'],
  ['Maggie', 'perla — dobrota sama', 83, ['tradiční'], 'klidná', 'velké'],
  ['Roxy',   'rocková hvězda parku', 81, ['moderní', 'sportovní'], 'živá', 'malé'],
])
pridej('us', 'kocour', [
  ['Milo',   'vlídný dobrodruh', 88, ['hravé', 'moderní'], 'živá'],
  ['Simba',  'lvíče s velkými plány', 87, ['mytologické', 'hravé'], 'živá'],
  ['Oreo',   'černobílý jako sušenka', 84, ['hravé'], 'vyvážená'],
  ['Loki',   'bůh lumpáren', 83, ['mytologické', 'hravé'], 'živá'],
])
pridej('us', 'kocka', [
  ['Nala',    'královna obýváku', 88, ['mytologické'], 'vyvážená'],
  ['Callie',  'kaliko kráska', 83, ['hravé'], 'klidná'],
  ['Pepper',  'pepřová povaha', 82, ['hravé', 'přírodní'], 'živá'],
  ['Kitty',   'kočka jménem Kočka — a funguje to', 80, ['hravé', 'tradiční'], 'vyvážená'],
])
pridej('us', 'kun', [
  ['Spirit', 'nezkrotný duch prérie', 87, ['přírodní', 'sportovní'], 'živá'],
  ['Dakota', 'přítel — jméno velkých plání', 80, ['přírodní'], 'vyvážená'],
])
pridej('us', 'kralik', [
  ['Clover', 'jetelový mlsoun', 80, ['přírodní', 'hravé'], 'klidná'],
  ['Biscuit','sušenka s dlouhýma ušima', 77, ['hravé'], 'vyvážená'],
])
pridej('us', 'papousek', [
  ['Sunny',  'sluníčko na bidýlku', 80, ['hravé', 'přírodní'], 'živá'],
  ['Echo',   'zopakuje úplně všechno', 78, ['hravé', 'mytologické'], 'živá'],
])
pridej('us', 'krecek', [
  ['Peanut', 'buráček v kolečku', 82, ['hravé'], 'živá'],
  ['Chewie', 'chlupatý kopilot', 78, ['hravé'], 'vyvážená'],
])

// ══ BRAZÍLIE ═════════════════════════════════════════════════════════════════

pridej('br', 'kluk', [
  ['Miguel',   'kdo je jako Bůh — brazilská jednička', 92, ['tradiční'], 'vyvážená', [9]],
  ['Arthur',   'medvěd — král i v tropech', 89, ['královské'], 'vyvážená', [11]],
  ['Davi',     'milovaný — s kytarou v ruce', 87, ['tradiční'], 'klidná', [12]],
  ['Gael',     'zářivý — krátké a moderní', 86, ['moderní'], 'živá', [7]],
  ['Bernardo', 'silný jako medvěd — srdečné', 84, ['tradiční'], 'vyvážená', [8]],
  ['Heitor',   'trojský hrdina Hektor po brazilsku', 83, ['mytologické'], 'vyvážená', [6]],
])
pridej('br', 'holka', [
  ['Helena',    'pochodeň — světlo Brazílie', 92, ['tradiční', 'elegantní'], 'vyvážená', [5]],
  ['Alice',     'vznešená — sluneční verze', 90, ['tradiční'], 'živá', [6]],
  ['Laura',     'vavřín — voní vítězstvím', 88, ['tradiční'], 'klidná', [8]],
  ['Valentina', 'silná a zdravá — samá láska', 87, ['elegantní'], 'vyvážená', [2]],
  ['Maitê',     'milovaná paní — jméno jako bossa nova', 84, ['moderní'], 'klidná', [3]],
  ['Cecília',   'hudbě zaslíbená', 83, ['tradiční', 'elegantní'], 'vyvážená', [11]],
])
pridej('br', 'pes', [
  ['Caramelo', 'karamelový voříšek — národní hrdina Brazílie', 92, ['hravé', 'přírodní'], 'vyvážená', 'střední'],
  ['Totó',     'brazilský Alík', 86, ['tradiční', 'hravé'], 'živá', 'malé'],
  ['Bidu',     'modrý pes z komiksů Maurícia de Sousy', 84, ['hravé'], 'živá', 'malé'],
  ['Zeca',     'pohodář z pláže', 80, ['hravé'], 'klidná', 'střední'],
  ['Bob',      'krátké, věrné, nesmrtelné', 82, ['tradiční'], 'vyvážená', 'velké'],
])
pridej('br', 'fenka', [
  ['Mel',     'med — sladší jméno nenajdeš', 90, ['hravé', 'přírodní'], 'klidná', 'malé'],
  ['Pipoca',  'popcorn — skáče radostí', 87, ['hravé'], 'živá', 'malé'],
  ['Amora',   'ostružinka', 85, ['přírodní', 'hravé'], 'vyvážená', 'střední'],
  ['Belinha', 'krásečka — samá láska', 82, ['hravé'], 'klidná', 'malé'],
  ['Farofa',  'křupavá dobrota k feijoadě', 78, ['hravé'], 'živá', 'střední'],
])
pridej('br', 'kocour', [
  ['Frajola', 'černobílý filuta — brazilský Sylvestr', 87, ['hravé'], 'živá'],
  ['Mingau',  'bílý kocour z Turmy da Mônica — kaše', 85, ['hravé'], 'klidná'],
  ['Chico',   'lidový šarm', 82, ['tradiční', 'hravé'], 'vyvážená'],
  ['Nino',    'chlapeček — mazel k zulíbání', 79, ['hravé'], 'klidná'],
])
pridej('br', 'kocka', [
  ['Lua',   'měsíc nad Copacabanou', 88, ['přírodní', 'elegantní'], 'klidná'],
  ['Nina',  'holčička — jemná duše', 85, ['tradiční'], 'vyvážená'],
  ['Mia',   'mňau v jednom slově', 83, ['hravé', 'moderní'], 'živá'],
  ['Tita',  'tetička domácnosti', 78, ['hravé'], 'klidná'],
])
pridej('br', 'kun', [
  ['Vento',   'vítr pamp', 82, ['přírodní', 'sportovní'], 'živá'],
  ['Estrela', 'hvězda rodea', 79, ['přírodní', 'elegantní'], 'vyvážená'],
])
pridej('br', 'kralik', [
  ['Sansão', 'modrý plyšový králík Môniky — silák', 84, ['hravé'], 'klidná'],
  ['Cenoura','mrkev — jasná volba', 76, ['hravé'], 'živá'],
])
pridej('br', 'papousek', [
  ['Louro',  'papoušek Louro José — televizní legenda', 84, ['hravé', 'tradiční'], 'živá'],
  ['Zabelê', 'ptačí zpěv severovýchodu', 74, ['přírodní'], 'vyvážená'],
])
pridej('br', 'krecek', [
  ['Feijão', 'fazolka — malý a k sežrání', 80, ['hravé'], 'živá'],
  ['Paçoca', 'arašídová sladkost', 75, ['hravé'], 'vyvážená'],
])

// ══ AUSTRÁLIE ════════════════════════════════════════════════════════════════

pridej('au', 'kluk', [
  ['Lachlan', 'země jezer — skotský dárek Austrálii', 88, ['tradiční'], 'vyvážená', [7]],
  ['Noah',    'utěšitel — jednička i u protinožců', 90, ['moderní'], 'klidná', [11]],
  ['Hunter',  'lovec — dobrodruh z buše', 85, ['moderní', 'sportovní'], 'živá', [3]],
  ['Flynn',   'syn rusovlasého — surfař', 84, ['moderní'], 'živá', [1]],
  ['Banjo',   'pocta básníku Banjovi Patersonovi', 82, ['hravé', 'tradiční'], 'živá', [2]],
  ['Kai',     'moře — dvě písmena oceánu', 83, ['moderní', 'přírodní'], 'vyvážená', [6]],
])
pridej('au', 'holka', [
  ['Matilda', 'síla boje — valčík celé země', 90, ['tradiční', 'hravé'], 'živá', [1]],
  ['Evie',    'život — drobné a zářivé', 88, ['moderní', 'hravé'], 'živá', [12]],
  ['Ruby',    'rubín — drahokam jihu', 87, ['moderní', 'elegantní'], 'vyvážená', [7]],
  ['Sienna',  'barva slunce a hlíny', 85, ['moderní', 'přírodní'], 'klidná', [9]],
  ['Billie',  'odhodlaná — s klukovským špuntem', 84, ['moderní', 'hravé'], 'živá', [5]],
  ['Zara',    'kvetoucí — svěží a světové', 83, ['moderní'], 'vyvážená', [10]],
])
pridej('au', 'pes', [
  ['Bluey',  'modrý honácký pes — miláček televize', 92, ['hravé'], 'živá', 'střední'],
  ['Rusty',  'rezavý parťák z farmy', 85, ['tradiční', 'hravé'], 'vyvážená', 'střední'],
  ['Ziggy',  'klikatý blesk energie', 83, ['moderní', 'hravé'], 'živá', 'malé'],
  ['Buster', 'rozbíječ nudy', 81, ['hravé'], 'živá', 'velké'],
  ['Ned',    'zbojník Ned Kelly — s obojkem místo brnění', 80, ['tradiční'], 'vyvážená', 'velké'],
])
pridej('au', 'fenka', [
  ['Kirra',  'listí — jméno od surfařské pláže', 86, ['přírodní', 'moderní'], 'živá', 'střední'],
  ['Bindi',  'malá holčička — dcera lovce krokodýlů', 85, ['přírodní', 'hravé'], 'živá', 'střední'],
  ['Pippa',  'milovnice koní — anglický šarm', 83, ['hravé', 'elegantní'], 'vyvážená', 'malé'],
  ['Missy',  'slečinka z verandy', 80, ['hravé'], 'klidná', 'malé'],
  ['Lola',   'tanečnice — nohy nezastavíš', 82, ['hravé'], 'živá', 'střední'],
])
pridej('au', 'kocour', [
  ['Ollie',  'pohodář z terasy', 85, ['hravé', 'moderní'], 'vyvážená'],
  ['Monty',  'pán trávníku', 82, ['královské', 'hravé'], 'klidná'],
  ['Archer', 'lučištník — skočí na cokoliv', 80, ['moderní', 'sportovní'], 'živá'],
  ['Smokey', 'kouřová srst, ospalé oči', 79, ['přírodní'], 'klidná'],
])
pridej('au', 'kocka', [
  ['Coco',   'kokosová slečna', 84, ['hravé', 'elegantní'], 'vyvážená'],
  ['Zali',   'vzácná — australský originál', 82, ['moderní'], 'živá'],
  ['Maisie', 'perlička — hebkost z vlny', 80, ['hravé'], 'klidná'],
  ['Kiki',   'dvojité kiki, dvojitá zábava', 78, ['hravé'], 'živá'],
])
pridej('au', 'kun', [
  ['Phar Lap', 'legendární dostihový šampión', 86, ['sportovní', 'tradiční'], 'živá'],
  ['Waler',    'australský vojenský kůň — houževnatost', 76, ['tradiční'], 'vyvážená'],
])
pridej('au', 'kralik', [
  ['Wally',  'ušatý popleta', 79, ['hravé'], 'vyvážená'],
  ['Gumnut', 'plod blahovičníku — kapsička buše', 74, ['přírodní', 'hravé'], 'klidná'],
])
pridej('au', 'papousek', [
  ['Kiwi',   'zelený kamarád z jihu', 80, ['hravé', 'přírodní'], 'živá'],
  ['Skippy', 'skokan na bidýlku', 76, ['hravé'], 'živá'],
])
pridej('au', 'krecek', [
  ['Timtam', 'čokoládová sušenka — národní poklad', 80, ['hravé'], 'živá'],
  ['Digger', 'kopáč tunelů v hoblinách', 75, ['hravé'], 'živá'],
])

// ══ ŘECKO ════════════════════════════════════════════════════════════════════

pridej('gr', 'kluk', [
  ['Alexandros', 'obránce lidí — jméno velkého krále', 89, ['královské', 'tradiční'], 'živá', [2]],
  ['Georgios',   'rolník — nejřečtější ze všech jmen', 88, ['tradiční'], 'vyvážená', [4]],
  ['Dimitris',   'zasvěcený bohyni úrody', 86, ['tradiční'], 'vyvážená', [10]],
  ['Nikos',      'vítěz — krátké a sebevědomé', 85, ['tradiční'], 'živá', [12]],
  ['Ilias',      'můj Bůh je Hospodin — sluneční prorok', 83, ['tradiční'], 'klidná', [7]],
  ['Stavros',    'kříž — pevný bod rodiny', 80, ['tradiční'], 'klidná', [9]],
])
pridej('gr', 'holka', [
  ['Eleni',    'zářivá — světlo Řecka', 90, ['tradiční', 'elegantní'], 'vyvážená', [5]],
  ['Maria',    'milovaná — středomořská stálice', 89, ['tradiční'], 'klidná', [8]],
  ['Athina',   'bohyně moudrosti — jméno hlavního města', 87, ['mytologické', 'královské'], 'vyvážená', [3]],
  ['Zoi',      'život — tři písmena, celý svět', 85, ['moderní'], 'živá', [1]],
  ['Kalliopi', 'krásnohlasá múza epické poezie', 81, ['mytologické', 'elegantní'], 'klidná', [6]],
  ['Despina',  'paní domu — noblesa v každém kroku', 79, ['tradiční', 'elegantní'], 'vyvážená', [11]],
])
pridej('gr', 'pes', [
  ['Zeus',     'vládce Olympu — hromy na povel', 92, ['mytologické', 'královské'], 'živá', 'velké'],
  ['Apollo',   'bůh slunce a hudby — zlatá srst povinná', 89, ['mytologické'], 'vyvážená', 'velké'],
  ['Hermes',   'posel bohů — nejrychlejší z parku', 85, ['mytologické', 'sportovní'], 'živá', 'střední'],
  ['Odysseus', 'lstivý mořeplavec — vždy najde cestu domů', 82, ['mytologické'], 'klidná', 'velké'],
  ['Aris',     'bůh boje s měkkým srdcem', 80, ['mytologické'], 'živá', 'střední'],
])
pridej('gr', 'fenka', [
  ['Athena',  'bohyně moudrosti — chytřejší než vy', 90, ['mytologické', 'královské'], 'vyvážená', 'velké'],
  ['Hera',    'královna bohů — vládne domácnosti', 86, ['mytologické', 'královské'], 'klidná', 'velké'],
  ['Artemis', 'bohyně lovu — les je její', 85, ['mytologické', 'sportovní'], 'živá', 'střední'],
  ['Iris',    'bohyně duhy — barevná duše', 82, ['mytologické', 'přírodní'], 'vyvážená', 'malé'],
  ['Gaia',    'matka země — klid sám', 80, ['mytologické', 'přírodní'], 'klidná', 'střední'],
])
pridej('gr', 'kocour', [
  ['Platon',   'filozof podřimující na slunci', 84, ['mytologické', 'elegantní'], 'klidná'],
  ['Sokrates', 'vím, že nic nevím — ale nažrat chci', 82, ['mytologické', 'hravé'], 'klidná'],
  ['Feta',     'bílý jako sýr z Egeje', 80, ['hravé'], 'vyvážená'],
  ['Ikaros',   'letí výš, než by měl — typicky kočičí', 78, ['mytologické', 'hravé'], 'živá'],
])
pridej('gr', 'kocka', [
  ['Afrodita', 'bohyně krásy — a je si toho vědoma', 86, ['mytologické', 'elegantní'], 'klidná'],
  ['Melina',   'medová — sladkost sama', 82, ['tradiční', 'hravé'], 'vyvážená'],
  ['Olympia',  'z hory bohů — výš než ostatní', 79, ['mytologické', 'královské'], 'vyvážená'],
  ['Kleio',    'múza dějin — pamatuje si každou křivdu', 77, ['mytologické'], 'klidná'],
])
pridej('gr', 'kun', [
  ['Pegas',     'okřídlený kůň — skáče, jako by létal', 92, ['mytologické'], 'živá'],
  ['Bukefalos', 'věrný kůň Alexandra Velikého', 84, ['mytologické', 'královské'], 'vyvážená'],
])
pridej('gr', 'kralik', [
  ['Zorbas', 'tančí sirtaki mezi záhony', 78, ['hravé'], 'živá'],
  ['Pita',   'kulaťoučký jako placka', 75, ['hravé'], 'klidná'],
])
pridej('gr', 'papousek', [
  ['Sirtaki', 'tančí na bidýlku', 77, ['hravé'], 'živá'],
  ['Homer',   'básník — recituje celé eposy', 75, ['mytologické', 'hravé'], 'živá'],
])
pridej('gr', 'krecek', [
  ['Gyros',   'točí se v kolečku jako na grilu', 79, ['hravé'], 'živá'],
  ['Baklava', 'sladký a vrstevnatý', 74, ['hravé'], 'vyvážená'],
])

// ══ POLSKO ═══════════════════════════════════════════════════════════════════

pridej('pl', 'kluk', [
  ['Antoni',     'neocenitelný — polská jednička', 91, ['tradiční'], 'vyvážená', [6]],
  ['Aleksander', 'obránce lidí — velkolepé i domácké', 88, ['královské', 'tradiční'], 'vyvážená', [2]],
  ['Franciszek', 'svobodný — vřelé jméno s úsměvem', 85, ['tradiční'], 'klidná', [10]],
  ['Stanisław',  'ať upevní slávu — stará šlechta', 83, ['tradiční', 'královské'], 'klidná', [11]],
  ['Wojtek',     'útěcha vojska — i slavný medvěd od Monte Cassina', 82, ['tradiční', 'hravé'], 'živá', [4]],
  ['Marcel',     'malý bojovník s galantním šarmem', 80, ['moderní'], 'vyvážená', [1]],
])
pridej('pl', 'holka', [
  ['Zuzanna', 'lilie — polská královna jmen', 90, ['tradiční', 'elegantní'], 'vyvážená', [8]],
  ['Zofia',   'moudrost — babiččino jméno v plné slávě', 89, ['tradiční'], 'klidná', [5]],
  ['Hanna',   'milostiplná — hladí už při vyslovení', 87, ['tradiční'], 'klidná', [7]],
  ['Maja',    'májová víla', 86, ['přírodní', 'moderní'], 'živá', [5]],
  ['Lena',    'zářivá — krátké a světové', 85, ['moderní'], 'vyvážená', [3]],
  ['Wanda',   'kněžna z pověsti o Krakovu', 79, ['mytologické', 'tradiční'], 'vyvážená', [6]],
])
pridej('pl', 'pes', [
  ['Burek',  'polský Alík — dobrák od kosti', 88, ['tradiční'], 'vyvážená', 'střední'],
  ['Reksio', 'zvědavé štěně z legendárního večerníčku', 87, ['hravé', 'tradiční'], 'živá', 'malé'],
  ['Azor',   'klasika polských dvorků', 84, ['tradiční'], 'vyvážená', 'velké'],
  ['Szarik', 'chlupatý hrdina ze seriálu Čtyři z tanku a pes', 83, ['tradiční', 'hravé'], 'živá', 'velké'],
  ['Fafik',  'šibal, co ukradne i srdce', 78, ['hravé'], 'živá', 'malé'],
])
pridej('pl', 'fenka', [
  ['Saba',  'věrná společnice z románu V pouští a pralesem', 84, ['tradiční'], 'klidná', 'velké'],
  ['Perła', 'perla — vzácnost na tlapkách', 81, ['elegantní'], 'vyvážená', 'střední'],
  ['Mika',  'jemná duše s jiskrou', 80, ['moderní'], 'živá', 'malé'],
  ['Figa',  'fík — sladká drzost', 78, ['hravé'], 'živá', 'malé'],
  ['Zośka', 'domácká parádnice', 76, ['tradiční', 'hravé'], 'vyvážená', 'střední'],
])
pridej('pl', 'kocour', [
  ['Filemon', 'bílé koťátko z pohádek — popleta k pomazlení', 86, ['hravé', 'tradiční'], 'klidná'],
  ['Mruczek', 'polský Mourek — přede jako mlýnek', 84, ['tradiční'], 'klidná'],
  ['Bonifacy','rozvážný starší parťák Filemona', 82, ['tradiční', 'hravé'], 'klidná'],
  ['Klakier', 'tleská ocasem každé večeři', 74, ['hravé'], 'živá'],
])
pridej('pl', 'kocka', [
  ['Kicia', 'kočičí něha po polsku', 82, ['tradiční', 'hravé'], 'klidná'],
  ['Pusia', 'mazlík na plný úvazek', 80, ['hravé'], 'klidná'],
  ['Mania', 'energie, co nejde vypnout', 78, ['hravé'], 'živá'],
  ['Wisła', 'královna polských řek', 75, ['přírodní'], 'vyvážená'],
])
pridej('pl', 'kun', [
  ['Kasztanka', 'legendární klisna maršála Piłsudského', 84, ['tradiční', 'královské'], 'vyvážená'],
  ['Wicher',    'vichr — hříva ve větru', 80, ['přírodní', 'sportovní'], 'živá'],
])
pridej('pl', 'kralik', [
  ['Marchewka', 'mrkvička — jméno rovnou od záhonu', 78, ['hravé'], 'živá'],
  ['Pysia',     'čumáček k zulíbání', 74, ['hravé'], 'klidná'],
])
pridej('pl', 'papousek', [
  ['Gadula', 'mluvka, co nezavře zobák', 77, ['hravé'], 'živá'],
  ['Kesza',  'barevný švihák', 74, ['hravé'], 'živá'],
])
pridej('pl', 'krecek', [
  ['Pączek',   'kobliha — kulaťoučký mls', 79, ['hravé'], 'vyvážená'],
  ['Orzeszek', 'oříšek v tvářích', 75, ['hravé'], 'živá'],
])

// ══ KANADA ═══════════════════════════════════════════════════════════════════

pridej('ca', 'kluk', [
  ['Hudson',   'podle slavného zálivu — objevitel', 85, ['moderní', 'přírodní'], 'vyvážená', [9]],
  ['Jasper',   'drahokam i národní park ve Skalistých horách', 84, ['přírodní', 'moderní'], 'klidná', [10]],
  ['Nathan',   'dar od Boha — spolehlivý parťák', 83, ['tradiční'], 'vyvážená', [12]],
  ['Maverick', 'svéhlavý dobrodruh', 81, ['moderní', 'sportovní'], 'živá', [7]],
  ['Emmett',   'pravdomluvný — silný a tichý', 80, ['moderní'], 'klidná', [4]],
  ['Rory',     'rudý král — zrzavé štěstí', 79, ['tradiční', 'hravé'], 'živá', [3]],
])
pridej('ca', 'holka', [
  ['Nova',    'nová hvězda — i Nové Skotsko', 86, ['moderní', 'přírodní'], 'živá', [11]],
  ['Violet',  'fialka — křehká a nezlomná', 85, ['přírodní', 'elegantní'], 'klidná', [3]],
  ['Autumn',  'podzim — jméno barvy javorů', 84, ['přírodní'], 'klidná', [9, 10]],
  ['Maple',   'javor — sladká jako sirup', 82, ['přírodní', 'hravé'], 'vyvážená', [10]],
  ['Juniper', 'jalovec — voní lesem', 80, ['přírodní', 'moderní'], 'vyvážená', [6]],
  ['Wren',    'střízlík — malý ptáček, velký hlas', 79, ['přírodní', 'moderní'], 'živá', [5]],
])
pridej('ca', 'pes', [
  ['Yukon',   'zlatokopecká řeka severu — dobrodruh', 88, ['přírodní'], 'živá', 'velké'],
  ['Bear',    'medvěd — velké srdce v kožichu', 86, ['přírodní'], 'klidná', 'velké'],
  ['Koda',    'přítel — medvídek z Medvědích bratrů', 85, ['hravé', 'přírodní'], 'vyvážená', 'střední'],
  ['Moose',   'los — největší parťák lesa', 84, ['přírodní', 'hravé'], 'klidná', 'velké'],
  ['Chinook', 'teplý vítr z hor i kanadské tažné plemeno', 82, ['přírodní', 'tradiční'], 'živá', 'velké'],
])
pridej('ca', 'fenka', [
  ['Juno',    'římská královna nebes — i oceněný film', 86, ['mytologické', 'moderní'], 'vyvážená', 'střední'],
  ['Aspen',   'osika — hory a prašan', 85, ['přírodní', 'sportovní'], 'živá', 'střední'],
  ['Tundra',  'severská pláň — nekonečná výdrž', 84, ['přírodní'], 'živá', 'velké'],
  ['Winter',  'zima — bílá a tichá', 83, ['přírodní', 'elegantní'], 'klidná', 'velké'],
  ['Neve',    'sníh — hebkost vloček', 80, ['přírodní', 'elegantní'], 'klidná', 'malé'],
])
pridej('ca', 'kocour', [
  ['Puck',   'hokejový puk — po bytě jen sviští', 82, ['sportovní', 'hravé'], 'živá'],
  ['Frost',  'mráz — chladná elegance, teplý klín', 81, ['přírodní', 'elegantní'], 'klidná'],
  ['Grizzly','medvěd v kočičím vydání', 80, ['přírodní', 'hravé'], 'vyvážená'],
  ['Timbit', 'koblížek z kanadské kavárny', 79, ['hravé'], 'klidná'],
])
pridej('ca', 'kocka', [
  ['Nanuk', 'lední medvěd v inuitských příbězích', 83, ['mytologické', 'přírodní'], 'vyvážená'],
  ['Sable', 'sobolí kožíšek', 80, ['přírodní', 'elegantní'], 'klidná'],
  ['Ivory', 'slonovinově bílá', 78, ['elegantní'], 'klidná'],
  ['Willa', 'odhodlaná ochránkyně gauče', 76, ['moderní'], 'vyvážená'],
])
pridej('ca', 'kun', [
  ['Blizzard', 'sněhová bouře v plném trysku', 82, ['přírodní', 'sportovní'], 'živá'],
  ['Cedar',    'cedr — klidná síla lesa', 75, ['přírodní'], 'klidná'],
])
pridej('ca', 'kralik', [
  ['Snowball', 'sněhová koule s ušima', 82, ['hravé', 'přírodní'], 'živá'],
  ['Thumper',  'Dupík z Bambiho — dupe pro radost', 84, ['hravé'], 'živá'],
])
pridej('ca', 'papousek', [
  ['Piper', 'pískálek od jezera', 78, ['hravé', 'přírodní'], 'živá'],
  ['Huron', 'jméno velkého jezera', 73, ['přírodní'], 'vyvážená'],
])
pridej('ca', 'krecek', [
  ['Poutine', 'národní pochoutka — hranolky se sýrem', 78, ['hravé'], 'vyvážená'],
  ['Nugget',  'zlatý valounek', 76, ['hravé'], 'živá'],
])

// ══ INDIE ════════════════════════════════════════════════════════════════════

pridej('in', 'kluk', [
  ['Aarav',  'klidný a moudrý — indická jednička', 89, ['moderní'], 'klidná', [1]],
  ['Arjun',  'zářivý lučištník z Mahábháraty', 88, ['mytologické', 'tradiční'], 'živá', [5]],
  ['Vihaan', 'úsvit — začátek nového dne', 86, ['moderní', 'přírodní'], 'vyvážená', [3]],
  ['Rohan',  'vzestupný — stoupá výš', 84, ['tradiční'], 'vyvážená', [8]],
  ['Dev',    'božský — tři písmena požehnání', 82, ['mytologické'], 'klidná', [10]],
  ['Kiran',  'paprsek světla', 80, ['přírodní'], 'vyvážená', [6]],
])
pridej('in', 'holka', [
  ['Aanya',  'nevyčerpatelná laskavost', 87, ['moderní'], 'vyvážená', [2]],
  ['Diya',   'lampička — světlo svátku Diwali', 86, ['tradiční', 'přírodní'], 'klidná', [10, 11]],
  ['Priya',  'milovaná — něha v každé slabice', 85, ['tradiční'], 'klidná', [7]],
  ['Asha',   'naděje — jméno, které drží', 83, ['tradiční'], 'vyvážená', [4]],
  ['Meera',  'oddaná básnířka — hudba sama', 82, ['tradiční', 'elegantní'], 'klidná', [9]],
  ['Indira', 'měsíční krása — jméno první premiérky', 79, ['královské', 'tradiční'], 'vyvážená', [11]],
])
pridej('in', 'pes', [
  ['Raja',  'král — vládne dvorku i srdci', 87, ['královské', 'tradiční'], 'vyvážená', 'velké'],
  ['Sheru', 'lvíček — klasika indických ulic', 85, ['tradiční', 'hravé'], 'živá', 'střední'],
  ['Moti',  'perla — tradiční jméno věrných psů', 84, ['tradiční'], 'klidná', 'střední'],
  ['Shera', 'tygří síla', 81, ['přírodní'], 'živá', 'velké'],
  ['Badal', 'mrak — tichý pozorovatel', 78, ['přírodní'], 'klidná', 'velké'],
])
pridej('in', 'fenka', [
  ['Rani',    'královna — a všichni to vědí', 86, ['královské', 'tradiční'], 'vyvážená', 'střední'],
  ['Chandni', 'měsíční svit na srsti', 82, ['přírodní', 'elegantní'], 'klidná', 'střední'],
  ['Laila',   'noc — tmavá kráska', 81, ['tradiční', 'elegantní'], 'klidná', 'velké'],
  ['Gauri',   'zářivá bohyně — jemnost sama', 79, ['mytologické'], 'vyvážená', 'malé'],
  ['Mithi',   'sladká — mls na čtyřech tlapkách', 77, ['hravé'], 'živá', 'malé'],
])
pridej('in', 'kocour', [
  ['Billu',  'lidový kočičí hrdina', 82, ['tradiční', 'hravé'], 'vyvážená'],
  ['Kaju',   'kešu oříšek — křupavá dobrota', 80, ['hravé'], 'klidná'],
  ['Chotu',  'prcek s velkými plány', 78, ['hravé'], 'živá'],
  ['Bindas', 'bezstarostný frajer', 75, ['hravé', 'moderní'], 'živá'],
])
pridej('in', 'kocka', [
  ['Chai',   'čaj s mlékem — hřeje na klíně', 82, ['hravé'], 'klidná'],
  ['Mausi',  'kočička — něžné oslovení', 80, ['tradiční'], 'klidná'],
  ['Kali',   'mocná bohyně — černá jako noc', 79, ['mytologické'], 'živá'],
  ['Meethi', 'sladká jako laddu', 76, ['hravé'], 'vyvážená'],
])
pridej('in', 'kun', [
  ['Chetak', 'legendární věrný kůň mahárány Pratápa', 88, ['mytologické', 'královské'], 'živá'],
  ['Toofan', 'bouře napříč plání', 80, ['přírodní', 'sportovní'], 'živá'],
])
pridej('in', 'kralik', [
  ['Gajar', 'mrkev po hindsku', 76, ['hravé'], 'živá'],
  ['Sufi',  'tichý mystik s dlouhýma ušima', 74, ['tradiční'], 'klidná'],
])
pridej('in', 'papousek', [
  ['Mitthu', 'nejklasičtější jméno indických papoušků', 84, ['tradiční', 'hravé'], 'živá'],
  ['Hira',   'diamant v peří', 76, ['elegantní'], 'vyvážená'],
])
pridej('in', 'krecek', [
  ['Laddu',  'kulatá sladkost — jako on', 80, ['hravé'], 'vyvážená'],
  ['Chintu', 'drobeček plný rošťáren', 75, ['hravé'], 'živá'],
])

// ══ ARGENTINA ════════════════════════════════════════════════════════════════

pridej('ar', 'kluk', [
  ['Mateo',    'dar od Boha — vládne žebříčkům', 89, ['tradiční'], 'vyvážená', [9]],
  ['Thiago',   'následovník — fotbalové jméno', 87, ['moderní', 'sportovní'], 'živá', [7]],
  ['Benjamín', 'syn štěstí — benjamínek rodiny', 85, ['tradiční'], 'klidná', [3]],
  ['Santino',  'svatouš s jiskrou v oku', 83, ['moderní'], 'živá', [11]],
  ['Bautista', 'křtitel — jméno se zvonem', 82, ['tradiční'], 'vyvážená', [6]],
  ['Felipe',   'milovník koní — gaučo od kolébky', 80, ['tradiční'], 'vyvážená', [5]],
])
pridej('ar', 'holka', [
  ['Catalina', 'čistá — perla Buenos Aires', 88, ['tradiční', 'elegantní'], 'vyvážená', [11]],
  ['Isabella', 'zasvěcená Bohu — jižní grácie', 86, ['elegantní', 'královské'], 'klidná', [7]],
  ['Delfina',  'delfínka — typicky argentinský půvab', 85, ['elegantní', 'přírodní'], 'vyvážená', [4]],
  ['Alma',     'duše — jméno jako vydechnutí', 84, ['moderní', 'elegantní'], 'klidná', [8]],
  ['Josefina', 'ať Bůh přidá — noblesa pamp', 82, ['tradiční'], 'vyvážená', [3]],
  ['Milagros', 'zázraky — a dělá je denně', 80, ['tradiční'], 'živá', [12]],
])
pridej('ar', 'pes', [
  ['Tango',    'tanec Buenos Aires — vášeň na čtyřech nohách', 86, ['hravé', 'elegantní'], 'živá', 'střední'],
  ['Firulais', 'legendární jméno všech jihoamerických voříšků', 84, ['tradiční', 'hravé'], 'vyvážená', 'střední'],
  ['Gaucho',   'jezdec pamp — věrný a otužilý', 83, ['tradiční'], 'vyvážená', 'velké'],
  ['Che',      'kamaráde! — oslovení, ze kterého je jméno', 81, ['hravé', 'moderní'], 'živá', 'malé'],
  ['Cacho',    'domácký dobrák', 76, ['tradiční'], 'klidná', 'velké'],
])
pridej('ar', 'fenka', [
  ['Dulce',   'sladká jako dulce de leche', 84, ['hravé'], 'klidná', 'malé'],
  ['Pampa',   'nekonečná rovina — běžkyně', 82, ['přírodní', 'sportovní'], 'živá', 'velké'],
  ['Morocha', 'tmavovláska z milongy', 79, ['tradiční', 'elegantní'], 'vyvážená', 'střední'],
  ['Milonga', 'píseň předměstí — tančí při chůzi', 78, ['hravé', 'elegantní'], 'vyvážená', 'střední'],
  ['Fiesta',  'oslava každého příchodu domů', 77, ['hravé'], 'živá', 'malé'],
])
pridej('ar', 'kocour', [
  ['Mate',   'hořký čaj z dýňky — národní rituál', 84, ['tradiční', 'hravé'], 'klidná'],
  ['Gardel', 'král tanga — zpívá za úplňku', 82, ['tradiční', 'elegantní'], 'vyvážená'],
  ['Tito',   'lidový šarmér', 79, ['hravé'], 'živá'],
  ['Bigote', 'knírač — vousky na parádu', 77, ['hravé'], 'klidná'],
])
pridej('ar', 'kocka', [
  ['Perlita',  'perlička Río de la Plata', 81, ['elegantní'], 'klidná'],
  ['Chiquita', 'drobečka s temperamentem', 79, ['hravé'], 'živá'],
  ['Mimosa',   'mazlivá květinka', 78, ['přírodní', 'hravé'], 'klidná'],
  ['Manteca',  'máslová — rozpouští se na slunci', 76, ['hravé'], 'klidná'],
])
pridej('ar', 'kun', [
  ['Mancha',  'slavný kůň, který došel z pamp až do New Yorku', 86, ['tradiční', 'sportovní'], 'vyvážená'],
  ['Criollo', 'houževnaté plemeno gaučů', 78, ['tradiční'], 'vyvážená'],
])
pridej('ar', 'kralik', [
  ['Alfajor',  'sušenková sladkost s karamelem', 78, ['hravé'], 'klidná'],
  ['Pochoclo', 'popcorn — skáče z pánve', 75, ['hravé'], 'živá'],
])
pridej('ar', 'papousek', [
  ['Charly', 'rockér argentinských balkonů', 76, ['moderní', 'hravé'], 'živá'],
  ['Pepe',   'upovídaný soused', 74, ['hravé'], 'živá'],
])
pridej('ar', 'krecek', [
  ['Ñoqui',  'noková kulička', 76, ['hravé'], 'vyvážená'],
  ['Turrón', 'nugátová dobrota', 73, ['hravé'], 'klidná'],
])

// ══ NOVÝ ZÉLAND ══════════════════════════════════════════════════════════════

pridej('nz', 'kluk', [
  ['Oliver', 'olivovník — jednička i na Zélandu', 89, ['tradiční'], 'vyvážená', [7]],
  ['Tane',   'maorský bůh lesů a ptáků', 85, ['mytologické', 'přírodní'], 'klidná', [9]],
  ['Nikau',  'jediná novozélandská palma — jižní elegance', 82, ['přírodní'], 'vyvážená', [1]],
  ['Kauri',  'obří posvátný strom', 81, ['přírodní'], 'klidná', [6]],
  ['Beau',   'krasavec — krátké a švihácké', 80, ['moderní'], 'živá', [2]],
  ['Ryder',  'jezdec vln', 79, ['moderní', 'sportovní'], 'živá', [12]],
])
pridej('nz', 'holka', [
  ['Isla',   'ostrov — jméno jako příboj', 89, ['přírodní'], 'klidná', [8]],
  ['Aroha',  'láska — nejkrásnější maorské slovo', 88, ['tradiční', 'elegantní'], 'klidná', [2]],
  ['Maia',   'odvážná — jasná hvězda Plejád', 85, ['mytologické', 'moderní'], 'živá', [5]],
  ['Amaia',  'konec i začátek — melodie sama', 83, ['moderní'], 'vyvážená', [4]],
  ['Kiri',   'kůra stromu — i slavná operní pěvkyně', 81, ['přírodní', 'elegantní'], 'vyvážená', [3]],
  ['Tui',    'zpěvný pták s bílým límečkem', 79, ['přírodní', 'hravé'], 'živá', [10]],
])
pridej('nz', 'pes', [
  ['Koru',  'spirála mladé kapradiny — nový začátek', 83, ['přírodní'], 'vyvážená', 'střední'],
  ['Chase', 'honič ovcí i míčků', 82, ['sportovní', 'hravé'], 'živá', 'střední'],
  ['Tama',  'syn — maorská klasika', 80, ['tradiční'], 'vyvážená', 'střední'],
  ['Hemi',  'maorský James — pohodář', 78, ['tradiční'], 'klidná', 'velké'],
  ['Rimu',  'jehličnan deštných lesů', 76, ['přírodní'], 'klidná', 'velké'],
])
pridej('nz', 'fenka', [
  ['Moana', 'oceán — dcera vln', 88, ['přírodní', 'mytologické'], 'živá', 'střední'],
  ['Kea',   'nejchytřejší papoušek světa — horská rošťanda', 84, ['přírodní', 'hravé'], 'živá', 'střední'],
  ['Hina',  'měsíční bohyně Polynésie', 80, ['mytologické', 'elegantní'], 'klidná', 'malé'],
  ['Awa',   'řeka — plyne klidně', 78, ['přírodní'], 'klidná', 'střední'],
  ['Pipi',  'mušlička z pláže', 76, ['hravé'], 'živá', 'malé'],
])
pridej('nz', 'kocour', [
  ['Mittens', 'wellingtonský kocour, kterého zná celá země', 88, ['hravé'], 'vyvážená'],
  ['Rangi',   'nebeský otec z maorských mýtů', 80, ['mytologické'], 'klidná'],
  ['Smudge',  'šmouha na gauči', 78, ['hravé'], 'klidná'],
  ['Kahu',    'jestřáb — pozorovatel z výšky', 76, ['přírodní'], 'vyvážená'],
])
pridej('nz', 'kocka', [
  ['Marama', 'měsíc nad zátokou', 79, ['mytologické', 'přírodní'], 'klidná'],
  ['Tia',    'jiskřička', 78, ['moderní'], 'živá'],
  ['Pixie',  'skřítek s drápky', 77, ['hravé'], 'živá'],
  ['Zena',   'bojovnice — princezna gauče', 76, ['hravé'], 'vyvážená'],
])
pridej('nz', 'kun', [
  ['Aotea', 'bílý oblak — jako název země Aotearoa', 80, ['přírodní', 'mytologické'], 'vyvážená'],
  ['Blaze', 'lysina i plamen', 77, ['sportovní'], 'živá'],
])
pridej('nz', 'kralik', [
  ['Manuka', 'keř nejslavnějšího medu', 80, ['přírodní', 'hravé'], 'klidná'],
  ['Flopsy', 'ouška do všech stran', 77, ['hravé'], 'živá'],
])
pridej('nz', 'papousek', [
  ['Kaka',  'hlučný lesní papoušek — místní originál', 78, ['přírodní', 'hravé'], 'živá'],
  ['Tiki',  'talisman pro štěstí', 76, ['mytologické', 'hravé'], 'vyvážená'],
])
pridej('nz', 'krecek', [
  ['Pavlova', 'národní dezert — sladký spor s Austrálií', 77, ['hravé'], 'klidná'],
  ['Kumara',  'sladká brambora', 74, ['hravé', 'přírodní'], 'vyvážená'],
])

// ══ ROZŠÍŘENÍ — slavní psi, historie a zimní jména ═══════════════════════════

pridej('us', 'pes', [
  ['Balto',  'husky, který v roce 1925 dovezl sérum do Nome', 91, ['tradiční', 'sportovní'], 'živá', 'velké'],
  ['Togo',   'skutečný hrdina séroběhu — uběhl nejdelší úsek', 89, ['tradiční', 'sportovní'], 'živá', 'střední'],
  ['Snoopy', 'nejslavnější bígl světa — snílek na boudě', 90, ['hravé'], 'vyvážená', 'střední'],
  ['Scooby', 'strašpytel s velkým srdcem — doga z animáku', 88, ['hravé'], 'klidná', 'velké'],
  ['Marley', 'nezvladatelný labrador z knihy i filmu', 85, ['hravé'], 'živá', 'velké'],
  ['Shadow', 'moudrý zlatý retrívr z Cesty domů', 83, ['tradiční'], 'klidná', 'velké'],
  ['Denali', 'nejvyšší hora severu — pes velkých výšek', 81, ['přírodní'], 'vyvážená', 'velké'],
])
pridej('us', 'fenka', [
  ['Lassie', 'nejvěrnější kolie filmové historie', 90, ['tradiční'], 'vyvážená', 'střední'],
  ['Aurora', 'polární záře — světlo severní oblohy', 84, ['přírodní', 'elegantní'], 'klidná', 'velké'],
])
pridej('gb', 'pes', [
  ['Bobby', 'skotský teriér, který 14 let hlídal hrob svého pána', 85, ['tradiční'], 'klidná', 'malé'],
  ['Pongo', 'tatínek 101 dalmatinů', 83, ['hravé'], 'vyvážená', 'velké'],
])
pridej('gb', 'fenka', [
  ['Lady',  'dáma z filmu Lady a Tramp', 86, ['elegantní', 'tradiční'], 'klidná', 'malé'],
  ['Honey', 'medová srst zlatých retrívrů', 84, ['hravé', 'přírodní'], 'vyvážená', 'velké'],
])
pridej('de', 'pes', [
  ['Blitz', 'blesk — povel rychlejší než zvuk', 82, ['sportovní'], 'živá', 'velké'],
])
pridej('se', 'pes', [
  ['Odin', 'vládce severských bohů — jedno oko, vševědoucí', 87, ['mytologické', 'královské'], 'vyvážená', 'velké'],
])
pridej('se', 'fenka', [
  ['Ylva', 'vlčice — divoká krev severu', 82, ['mytologické', 'přírodní'], 'živá', 'velké'],
])
pridej('jp', 'pes', [
  ['Shiro', 'bílý — sněhová srst', 81, ['přírodní', 'tradiční'], 'klidná', 'střední'],
])
pridej('cz', 'kun', [
  ['Bělka', 'bílá klisnička z pohádek', 76, ['tradiční', 'přírodní'], 'klidná'],
])
pridej('gb', 'kun', [
  ['Copenhagen', 'kůň vévody z Wellingtonu — veterán od Waterloo', 80, ['tradiční', 'královské'], 'vyvážená'],
])
pridej('us', 'kun', [
  ['Comanche', 'legendární kavaleristický kůň, který přežil Little Bighorn', 82, ['tradiční'], 'vyvážená'],
])

// ══ NIZOZEMSKO ═══════════════════════════════════════════════════════════════

pridej('nl', 'kluk', [
  ['Daan',   'soudce — krátké a přímé, nizozemská klasika', 90, ['moderní'], 'vyvážená', [7]],
  ['Sem',    'jméno, tři písmena a hotovo', 88, ['moderní'], 'živá', [3]],
  ['Lucas',  'světlo — přes hranice srozumitelné', 87, ['tradiční'], 'vyvážená', [10]],
  ['Bram',   'otec mnohých — pevné a vlídné', 85, ['tradiční'], 'klidná', [12]],
  ['Jesse',  'dar — měkké i klukovské', 83, ['moderní'], 'vyvážená', [5]],
  ['Willem', 'odhodlaný ochránce — jméno oranžských králů', 81, ['královské', 'tradiční'], 'klidná', [2]],
])
pridej('nl', 'holka', [
  ['Emma',   'všeobjímající — nizozemská jednička už roky', 92, ['tradiční', 'moderní'], 'klidná', [4]],
  ['Julia',  'mladistvá — jižní teplo v severní zemi', 89, ['tradiční'], 'vyvážená', [5]],
  ['Saar',   'kněžna — drobné a nadčasové', 85, ['moderní'], 'živá', [9]],
  ['Fenna',  'mír — ryze frískové jméno', 83, ['přírodní', 'moderní'], 'klidná', [6]],
  ['Anouk',  'milostiplná — jméno s francouzským nádechem', 82, ['elegantní'], 'vyvážená', [7]],
  ['Roos',   'růže — jedna slabika, celá zahrada', 80, ['přírodní'], 'klidná', [8]],
])
pridej('nl', 'pes', [
  ['Boris',  'bojovník — oblíbený hafan z nizozemských dvorků', 84, ['tradiční'], 'vyvážená', 'velké'],
  ['Beau',   'krasavec — pes, co ví, jak vypadá', 86, ['moderní', 'elegantní'], 'živá', 'malé'],
  ['Storm',  'bouře — vítr v uších při běhu po pláži', 83, ['přírodní', 'sportovní'], 'živá', 'velké'],
  ['Kees',   'lidové jméno se sýrovým šarmem', 78, ['tradiční', 'hravé'], 'klidná', 'střední'],
  ['Wolf',   'vlk — divoká duše na vodítku', 82, ['přírodní'], 'živá', 'velké'],
])
pridej('nl', 'fenka', [
  ['Nena',   'holčička — něžné a zvonivé', 82, ['hravé'], 'vyvážená', 'malé'],
  ['Tulp',   'tulipán — národní květina na čtyřech tlapkách', 79, ['přírodní', 'hravé'], 'klidná', 'malé'],
  ['Fien',   'jemná — drobná parádnice', 81, ['moderní', 'elegantní'], 'živá', 'malé'],
  ['Duna',   'duna — písek mezi tlapkami', 78, ['přírodní'], 'vyvážená', 'střední'],
  ['Sanne',  'lilie — klidná společnice', 80, ['tradiční'], 'klidná', 'velké'],
])
pridej('nl', 'kocour', [
  ['Dikkie', 'tlusťoch — kocour z dětských knížek', 84, ['hravé'], 'klidná'],
  ['Poes',   'kočka po nizozemsku — zlidovělé oslovení', 80, ['tradiční'], 'klidná'],
  ['Gouda',  'sýrový gurmán s pruhovaným kožichem', 77, ['hravé'], 'vyvážená'],
  ['Joop',   'staromódní pán domácnosti', 75, ['tradiční'], 'klidná'],
])
pridej('nl', 'kocka', [
  ['Mien',   'domácká klasika babiččiných časů', 79, ['tradiční'], 'klidná'],
  ['Pluis',  'chmýří — nadýchaná a hebká', 82, ['hravé'], 'klidná'],
  ['Nel',    'zářivá — krátké jméno, velká osobnost', 76, ['tradiční'], 'vyvážená'],
  ['Muis',   'myška — ironie kočičích jmen', 78, ['hravé'], 'živá'],
])
pridej('nl', 'kun', [
  ['Fries',  'fríský kůň — vraník s hedvábnou hřívou', 84, ['tradiční', 'elegantní'], 'vyvážená'],
  ['Wind',   'vítr nad poldery', 77, ['přírodní'], 'živá'],
])
pridej('nl', 'kralik', [
  ['Nijntje', 'Miffy — nejslavnější králičice světa', 88, ['hravé'], 'klidná'],
  ['Hopje',   'hopsálek s karamelovou barvou', 76, ['hravé'], 'živá'],
])
pridej('nl', 'papousek', [
  ['Lorre', 'nizozemský papoušek všech pirátů', 80, ['tradiční', 'hravé'], 'živá'],
  ['Piet',  'upovídaný soused z klece', 74, ['hravé'], 'živá'],
])
pridej('nl', 'krecek', [
  ['Stroopje', 'sirupová sušenka — sladký drobek', 78, ['hravé'], 'vyvážená'],
  ['Bolletje', 'kulička, co se valí kolečkem', 75, ['hravé'], 'živá'],
])

// ══ NORSKO ═══════════════════════════════════════════════════════════════════

pridej('no', 'kluk', [
  ['Jakob',   'ten, kdo jde v patách — norská jednička', 89, ['tradiční'], 'vyvážená', [7]],
  ['Emil',    'horlivý — jméno kluka z Lönnebergy', 87, ['tradiční', 'hravé'], 'živá', [5]],
  ['Oskar',   'boží kopí — severská noblesa', 85, ['královské'], 'vyvážená', [12]],
  ['Håkon',   'urozený syn — jméno norských králů', 83, ['královské', 'mytologické'], 'klidná', [8]],
  ['Sander',  'obránce lidí — krátká forma velkého jména', 82, ['moderní'], 'živá', [3]],
  ['Leif',    'dědic — mořeplavec, co našel Ameriku', 80, ['mytologické', 'tradiční'], 'klidná', [10]],
])
pridej('no', 'holka', [
  ['Nora',    'světlo — norská první dáma jmen', 91, ['moderní', 'tradiční'], 'vyvážená', [6]],
  ['Ingrid',  'krásná bohyně — severská síla', 87, ['mytologické', 'tradiční'], 'vyvážená', [8]],
  ['Solveig', 'silná cesta slunce — hrdinka Peer Gynta', 84, ['mytologické', 'elegantní'], 'klidná', [1]],
  ['Liv',     'život — tři písmena plná světla', 86, ['moderní', 'přírodní'], 'klidná', [4]],
  ['Sigrid',  'krásné vítězství — jméno z ság', 82, ['mytologické'], 'živá', [11]],
  ['Maja',    'májová — svěží jako severní jaro', 85, ['přírodní'], 'živá', [5]],
])
pridej('no', 'pes', [
  ['Fjord',  'fjord — hluboká voda mezi horami', 84, ['přírodní'], 'klidná', 'velké'],
  ['Bjørn',  'medvěd — huňatá síla', 86, ['přírodní', 'mytologické'], 'vyvážená', 'velké'],
  ['Nansen', 'polárník Fridtjof Nansen — objevitel', 80, ['tradiční'], 'živá', 'velké'],
  ['Trolle', 'skřítek z norských pohádek', 78, ['mytologické', 'hravé'], 'živá', 'malé'],
  ['Frost',  'mráz na čenichu', 82, ['přírodní'], 'klidná', 'velké'],
])
pridej('no', 'fenka', [
  ['Freya',  'bohyně lásky — severská královna', 88, ['mytologické'], 'živá', 'střední'],
  ['Snø',    'sníh — bílá jako první nadílka', 82, ['přírodní', 'elegantní'], 'klidná', 'velké'],
  ['Vilja',  'vůle — malá tvrdohlavá kráska', 80, ['přírodní'], 'živá', 'střední'],
  ['Aurora', 'polární záře nad Tromsø', 85, ['přírodní', 'elegantní'], 'klidná', 'velké'],
  ['Lykke',  'štěstí — jméno, které se usmívá', 81, ['hravé'], 'vyvážená', 'malé'],
])
pridej('no', 'kocour', [
  ['Tussi',  'chomáč mlhy nad fjordem', 78, ['přírodní', 'hravé'], 'klidná'],
  ['Balder', 'bůh světla a krásy', 82, ['mytologické'], 'klidná'],
  ['Nisse',  'domácí skřítek, co pije mléko', 80, ['mytologické', 'hravé'], 'živá'],
  ['Skogen', 'les — kocour z norských hvozdů', 76, ['přírodní'], 'vyvážená'],
])
pridej('no', 'kocka', [
  ['Frida',  'mír — tichá dáma u kamen', 82, ['tradiční'], 'klidná'],
  ['Skygge', 'stín — vidíte ji, jen když chce', 79, ['přírodní'], 'klidná'],
  ['Perle',  'perla severních moří', 80, ['elegantní'], 'klidná'],
  ['Tindra', 'jiskřit — hvězdy v očích', 78, ['přírodní', 'moderní'], 'živá'],
])
pridej('no', 'kun', [
  ['Sleipnir', 'Ódinův osminohý kůň — nejrychlejší z mýtů', 88, ['mytologické'], 'živá'],
  ['Nordlys',  'polární záře — světlo nad hřívou', 80, ['přírodní', 'elegantní'], 'vyvážená'],
])
pridej('no', 'kralik', [
  ['Snuppe', 'čmuchálek s růžovým nosem', 78, ['hravé'], 'živá'],
  ['Gulrot', 'mrkev po norsku', 74, ['hravé'], 'vyvážená'],
])
pridej('no', 'papousek', [
  ['Fjas',  'blábolil — nezavře zobák', 76, ['hravé'], 'živá'],
  ['Kvitre', 'štěbetat — zpěvák z bidýlka', 73, ['přírodní', 'hravé'], 'živá'],
])
pridej('no', 'krecek', [
  ['Smulen', 'drobeček ve fusaku', 78, ['hravé'], 'vyvážená'],
  ['Knask',  'chroupálek', 74, ['hravé'], 'živá'],
])

// ══ IRSKO ════════════════════════════════════════════════════════════════════

pridej('ie', 'kluk', [
  ['Conor',  'milovník vlků — jméno z keltských ság', 88, ['mytologické', 'tradiční'], 'živá', [3]],
  ['Liam',   'odhodlaný ochránce — irský dárek světu', 90, ['moderní', 'tradiční'], 'vyvážená', [8]],
  ['Cian',   'starobylý — krátké a keltsky měkké', 84, ['tradiční'], 'klidná', [6]],
  ['Fionn',  'světlovlasý hrdina Fionn mac Cumhaill', 86, ['mytologické'], 'živá', [5]],
  ['Oisín',  'kolouch — bard z říše věčného mládí', 83, ['mytologické', 'přírodní'], 'klidná', [10]],
  ['Darragh', 'dub — pevný a zakořeněný', 81, ['přírodní'], 'vyvážená', [11]],
])
pridej('ie', 'holka', [
  ['Saoirse', 'svoboda — jméno, které zní jako píseň', 88, ['moderní', 'elegantní'], 'živá', [4]],
  ['Aoife',   'zářivá — bojovnice z keltských legend', 87, ['mytologické'], 'živá', [7]],
  ['Niamh',   'jas — princezna ze země mládí', 85, ['mytologické', 'elegantní'], 'klidná', [9]],
  ['Ciara',   'temná kráska — irská klasika', 84, ['tradiční'], 'vyvážená', [1]],
  ['Róisín',  'růžička — nejněžnější irské jméno', 83, ['přírodní', 'elegantní'], 'klidná', [6]],
  ['Maeve',   'ta, která opájí — královna Connachtu', 82, ['mytologické', 'královské'], 'živá', [3]],
])
pridej('ie', 'pes', [
  ['Finn',   'světlý — irský hrdina v psí podobě', 88, ['mytologické'], 'živá', 'velké'],
  ['Paddy',  'urozený — nejirštější jméno vůbec', 84, ['tradiční', 'hravé'], 'vyvážená', 'střední'],
  ['Rory',   'rudý král — zrzavá srst povinná', 83, ['tradiční'], 'živá', 'střední'],
  ['Bran',   'havran — pes bájného Fionna', 85, ['mytologické', 'přírodní'], 'klidná', 'velké'],
  ['Guinness', 'černý jako irské pivo', 80, ['hravé'], 'klidná', 'velké'],
])
pridej('ie', 'fenka', [
  ['Shannon', 'stará moudrá řeka Irska', 84, ['přírodní'], 'klidná', 'velké'],
  ['Clover',  'čtyřlístek pro štěstí — irský symbol', 83, ['přírodní', 'hravé'], 'živá', 'malé'],
  ['Erin',    'Irsko samo — jméno celého ostrova', 82, ['tradiční'], 'vyvážená', 'střední'],
  ['Kerry',   'temný lid — i irské hrabství', 80, ['přírodní'], 'živá', 'střední'],
  ['Molly',   'hořká i sladká — dublinská legenda', 85, ['tradiční', 'hravé'], 'vyvážená', 'malé'],
])
pridej('ie', 'kocour', [
  ['Seamus', 'irský Jakub — kocour s knírem', 80, ['tradiční'], 'klidná'],
  ['Pooka',  'skřítek měnící podoby — kočičí povaha', 82, ['mytologické', 'hravé'], 'živá'],
  ['Barley', 'ječmen — zlatá srst', 78, ['přírodní'], 'klidná'],
  ['Murphy', 'mořský bojovník — nejčastější irské příjmení', 79, ['tradiční', 'hravé'], 'vyvážená'],
])
pridej('ie', 'kocka', [
  ['Aine',  'bohyně léta a hojnosti', 82, ['mytologické'], 'klidná'],
  ['Misty', 'mlha nad irskými kopci', 79, ['přírodní'], 'klidná'],
  ['Fianna', 'družina hrdinů — lovkyně v kožichu', 78, ['mytologické'], 'živá'],
  ['Tara',  'kopec králů — sídlo irských vládců', 81, ['královské', 'mytologické'], 'vyvážená'],
])
pridej('ie', 'kun', [
  ['Aonbharr', 'kůň mořského boha, který běžel po vlnách', 84, ['mytologické'], 'živá'],
  ['Kelpie',   'vodní kůň z keltských bájí', 78, ['mytologické', 'přírodní'], 'vyvážená'],
])
pridej('ie', 'kralik', [
  ['Clovie', 'jetelový mlsoun', 76, ['hravé', 'přírodní'], 'klidná'],
  ['Bunny',  'králíček, jak má být', 74, ['hravé'], 'živá'],
])
pridej('ie', 'papousek', [
  ['Blarney', 'výřečný jako kámen z hradu Blarney', 78, ['hravé', 'tradiční'], 'živá'],
  ['Ceol',    'hudba — zpěvák na bidýlku', 74, ['přírodní'], 'živá'],
])
pridej('ie', 'krecek', [
  ['Spud',   'brambora — irská národní láska', 78, ['hravé'], 'vyvážená'],
  ['Nibbler', 'okusovač všeho, co najde', 74, ['hravé'], 'živá'],
])

// ══ PORTUGALSKO ══════════════════════════════════════════════════════════════

pridej('pt', 'kluk', [
  ['Santiago', 'svatý Jakub — poutník do Compostely', 88, ['tradiční'], 'vyvážená', [7]],
  ['Duarte',   'strážce bohatství — jméno portugalských králů', 84, ['královské'], 'klidná', [11]],
  ['Tomás',    'dvojče — měkké a zpěvné', 87, ['tradiční'], 'vyvážená', [3]],
  ['Rodrigo',  'slavný vládce — jméno s kytarou', 85, ['tradiční'], 'živá', [3]],
  ['Vasco',    'mořeplavec Vasco da Gama', 82, ['tradiční'], 'živá', [5]],
  ['Afonso',   'ušlechtilý bojovník — první král Portugalska', 83, ['královské'], 'vyvážená', [8]],
])
pridej('pt', 'holka', [
  ['Beatriz', 'ta, jež přináší štěstí', 89, ['tradiční', 'elegantní'], 'vyvážená', [2]],
  ['Matilde', 'silná v boji — noblesa středověku', 86, ['tradiční', 'královské'], 'klidná', [3]],
  ['Leonor',  'světlo — jméno portugalských královen', 85, ['královské', 'elegantní'], 'klidná', [2]],
  ['Carolina', 'svobodná — melodie na čtyři slabiky', 84, ['elegantní'], 'vyvážená', [7]],
  ['Inês',    'čistá — nešťastná láska z portugalských dějin', 83, ['tradiční', 'elegantní'], 'klidná', [1]],
  ['Alice',   'vznešená — lehká jako fado', 82, ['tradiční'], 'vyvážená', [6]],
])
pridej('pt', 'pes', [
  ['Bolinha', 'kulička — nejmilejší portugalské psí jméno', 84, ['hravé'], 'živá', 'malé'],
  ['Sardinha', 'sardinka — národní rybka na čtyřech tlapkách', 78, ['hravé'], 'živá', 'malé'],
  ['Cão d\'Água', 'vodní pes — portugalské plemeno rybářů', 80, ['tradiční'], 'živá', 'střední'],
  ['Vento',   'vítr od Atlantiku', 82, ['přírodní', 'sportovní'], 'živá', 'velké'],
  ['Zeca',    'lidový šarmér z Lisabonu', 79, ['hravé'], 'vyvážená', 'střední'],
])
pridej('pt', 'fenka', [
  ['Mel',    'med — sladká jako pastel de nata', 86, ['hravé', 'přírodní'], 'klidná', 'malé'],
  ['Estrela', 'hvězda — i pohoří Serra da Estrela', 84, ['přírodní', 'elegantní'], 'vyvážená', 'velké'],
  ['Fadinha', 'malé fado — melancholická kráska', 80, ['elegantní'], 'klidná', 'střední'],
  ['Canela', 'skořice — barva i vůně', 82, ['přírodní', 'hravé'], 'vyvážená', 'střední'],
  ['Nina',   'holčička — jemná společnice', 81, ['tradiční'], 'klidná', 'malé'],
])
pridej('pt', 'kocour', [
  ['Bigodes', 'kníry — vousy na parádu', 80, ['hravé'], 'klidná'],
  ['Pessoa',  'pocta básníku Fernandu Pessoovi', 79, ['tradiční', 'elegantní'], 'klidná'],
  ['Chico',   'lidový mazlík', 81, ['hravé'], 'živá'],
  ['Azulejo', 'modrobílý kachlík — portugalské umění', 77, ['elegantní'], 'vyvážená'],
])
pridej('pt', 'kocka', [
  ['Nata',   'smetanová jako slavný koláček', 82, ['hravé'], 'klidná'],
  ['Lua',    'měsíc nad Tejem', 84, ['přírodní', 'elegantní'], 'klidná'],
  ['Saudade', 'stesk — nejportugalštější slovo světa', 80, ['elegantní'], 'klidná'],
  ['Pipoca', 'popcorn — skáče od rána', 78, ['hravé'], 'živá'],
])
pridej('pt', 'kun', [
  ['Lusitano', 'lusitánský kůň — nejstarší jezdecké plemeno', 84, ['tradiční', 'elegantní'], 'vyvážená'],
  ['Maré',     'příliv — vlny v hřívě', 76, ['přírodní'], 'živá'],
])
pridej('pt', 'kralik', [
  ['Cenourinha', 'mrkvička — jméno k sežrání', 76, ['hravé'], 'živá'],
  ['Fofinho',    'chlupáček k pomazlení', 78, ['hravé'], 'klidná'],
])
pridej('pt', 'papousek', [
  ['Loirinho', 'plavovlásek s barevným peřím', 76, ['hravé'], 'živá'],
  ['Falador',  'mluvka — komentuje celý dům', 74, ['hravé'], 'živá'],
])
pridej('pt', 'krecek', [
  ['Bolacha', 'sušenka — křupavý drobeček', 77, ['hravé'], 'vyvážená'],
  ['Pipo',    'pecka — malý a rychlý', 74, ['hravé'], 'živá'],
])

// ══ UKRAJINA ═════════════════════════════════════════════════════════════════

pridej('ua', 'kluk', [
  ['Danylo',   'Bůh je můj soudce — jméno haličského krále', 87, ['tradiční', 'královské'], 'vyvážená', [12]],
  ['Maksym',   'největší — pevné a jasné', 86, ['tradiční'], 'živá', [8]],
  ['Bohdan',   'daný Bohem — jméno hetmana', 85, ['tradiční'], 'vyvážená', [7]],
  ['Nazar',    'zasvěcený — měkké a laskavé', 83, ['tradiční'], 'klidná', [10]],
  ['Andrii',   'statečný — patron Ukrajiny', 84, ['tradiční'], 'vyvážená', [12]],
  ['Taras',    'bouřlivý — jméno básníka Ševčenka', 82, ['tradiční'], 'živá', [3]],
])
pridej('ua', 'holka', [
  ['Sofiia',   'moudrost — ukrajinská jednička', 89, ['tradiční', 'elegantní'], 'vyvážená', [9]],
  ['Solomiia', 'pokojná — jméno operní legendy', 84, ['elegantní', 'tradiční'], 'klidná', [8]],
  ['Kateryna', 'čistá — hrdinka Ševčenkovy básně', 85, ['tradiční'], 'vyvážená', [11]],
  ['Zlata',    'zlatá — slunce ve jméně', 83, ['přírodní', 'moderní'], 'živá', [6]],
  ['Myroslava', 'ta, jež slaví mír', 82, ['tradiční'], 'klidná', [2]],
  ['Kalyna',   'kalina — národní keř s rudými plody', 81, ['přírodní', 'tradiční'], 'vyvážená', [9]],
])
pridej('ua', 'pes', [
  ['Sirko',  'šedivec — legendární pes z ukrajinských pohádek', 86, ['tradiční', 'mytologické'], 'vyvážená', 'velké'],
  ['Kozak',  'kozák — volný jezdec stepí', 84, ['tradiční'], 'živá', 'velké'],
  ['Barsyk', 'sněžný levhart — pruhovaný rošťák', 80, ['přírodní'], 'živá', 'střední'],
  ['Hrim',   'hrom — hlas, co se rozléhá', 82, ['přírodní'], 'živá', 'velké'],
  ['Druh',   'přítel — jméno, které říká vše', 79, ['tradiční'], 'klidná', 'střední'],
])
pridej('ua', 'fenka', [
  ['Zirka',   'hvězda nad stepí', 84, ['přírodní', 'elegantní'], 'vyvážená', 'střední'],
  ['Kvitka',  'kytička — jemná krása', 82, ['přírodní'], 'klidná', 'malé'],
  ['Nizhna',  'něžná — jméno jako pohlazení', 79, ['elegantní'], 'klidná', 'střední'],
  ['Vesna',   'jaro — příchod tepla', 83, ['přírodní'], 'živá', 'střední'],
  ['Sonya',   'sluníčko — a taky spinkalka', 81, ['hravé'], 'klidná', 'malé'],
])
pridej('ua', 'kocour', [
  ['Vasyl',   'král — nejčastější jméno ukrajinských kocourů', 84, ['tradiční'], 'klidná'],
  ['Murchyk', 'předoun — od slova mrouskat', 82, ['tradiční', 'hravé'], 'klidná'],
  ['Borshch', 'boršč — rudá polévka i rudý kožich', 78, ['hravé'], 'vyvážená'],
  ['Kotyk',   'kocourek — mazlivé oslovení', 80, ['hravé'], 'klidná'],
])
pridej('ua', 'kocka', [
  ['Murka',    'předelka — klasika ukrajinských domácností', 84, ['tradiční'], 'klidná'],
  ['Sonyashnyk', 'slunečnice — národní květina', 80, ['přírodní'], 'vyvážená'],
  ['Lastivka', 'vlaštovka — přináší jaro', 79, ['přírodní', 'elegantní'], 'živá'],
  ['Pushynka', 'chmýří — nadýchaná kulička', 78, ['hravé'], 'klidná'],
])
pridej('ua', 'kun', [
  ['Viter',  'vítr přes step', 82, ['přírodní', 'sportovní'], 'živá'],
  ['Bulanyi', 'plavák — barva ukrajinských stepních koní', 76, ['tradiční', 'přírodní'], 'vyvážená'],
])
pridej('ua', 'kralik', [
  ['Morkvyna', 'mrkvička — sladké jméno', 76, ['hravé'], 'živá'],
  ['Vushko',   'ouško — jméno podle toho hlavního', 74, ['hravé'], 'klidná'],
])
pridej('ua', 'papousek', [
  ['Kesha',   'papoušek z animovaného seriálu — hvězda', 82, ['hravé', 'tradiční'], 'živá'],
  ['Balakun', 'mluvka — nezavře zobák', 75, ['hravé'], 'živá'],
])
pridej('ua', 'krecek', [
  ['Khomiak', 'křeček — jméno rovnou podle druhu', 77, ['hravé'], 'živá'],
  ['Zernyatko', 'zrníčko — drobek v hoblinách', 74, ['hravé'], 'vyvážená'],
])

// ══ JIŽNÍ KOREA ══════════════════════════════════════════════════════════════

pridej('kr', 'kluk', [
  ['Minjun', 'bystrý a talentovaný — korejská jednička', 88, ['moderní'], 'vyvážená', [3]],
  ['Seojun', 'příznivý a nadaný', 86, ['moderní'], 'živá', [5]],
  ['Doyun',  'cesta a laskavost — jméno jako přání', 85, ['moderní'], 'klidná', [9]],
  ['Jiho',   'moudrost a velkorysost', 84, ['moderní'], 'vyvážená', [7]],
  ['Eunwoo', 'laskavost a vesmír — jméno hvězd', 82, ['elegantní', 'přírodní'], 'klidná', [11]],
  ['Haneul', 'nebe — jedno z mála čistě korejských jmen', 83, ['přírodní'], 'klidná', [4]],
])
pridej('kr', 'holka', [
  ['Seoyeon', 'příznivá a půvabná — první dáma žebříčků', 88, ['elegantní', 'moderní'], 'klidná', [4]],
  ['Jiwoo',   'moudrost a pomoc', 86, ['moderní'], 'vyvážená', [6]],
  ['Hana',    'jedna, jediná — a taky japonský květ', 84, ['moderní', 'přírodní'], 'živá', [5]],
  ['Yuna',    'laskavá krása — jméno olympijské šampionky', 85, ['elegantní'], 'vyvážená', [9]],
  ['Areum',   'krása — ryze korejské slovo jako jméno', 82, ['přírodní', 'elegantní'], 'klidná', [3]],
  ['Sarang',  'láska — nejhezčí slovo korejštiny', 83, ['elegantní'], 'klidná', [2]],
])
pridej('kr', 'pes', [
  ['Jindo',  'korejské národní plemeno — věrnost sama', 86, ['tradiční'], 'vyvážená', 'střední'],
  ['Bori',   'ječmen — nejoblíbenější psí jméno Koreje', 85, ['přírodní', 'hravé'], 'živá', 'střední'],
  ['Haru',   'den — nový začátek každé ráno', 84, ['přírodní'], 'vyvážená', 'malé'],
  ['Dubu',   'tofu — bílá a měkká srst', 82, ['hravé'], 'klidná', 'malé'],
  ['Baekgu', 'bílý pes — hrdina korejských příběhů', 80, ['tradiční'], 'klidná', 'velké'],
])
pridej('kr', 'fenka', [
  ['Kongi',  'fazolka — drobná a kulaťoučká', 82, ['hravé'], 'živá', 'malé'],
  ['Nabi',   'motýl — lehká a poletující', 84, ['přírodní', 'elegantní'], 'živá', 'malé'],
  ['Sarangi', 'miláček — láska v každé slabice', 80, ['hravé'], 'klidná', 'střední'],
  ['Dalbit', 'měsíční svit', 81, ['přírodní', 'elegantní'], 'klidná', 'střední'],
  ['Ppoppo', 'pusinka — mazlivé korejské slovo', 79, ['hravé'], 'vyvážená', 'malé'],
])
pridej('kr', 'kocour', [
  ['Nabi',   'motýl — nejklasičtější korejské kočičí jméno', 86, ['tradiční', 'přírodní'], 'vyvážená'],
  ['Chi',    'jméno krátké jako mrknutí', 78, ['moderní'], 'živá'],
  ['Kimchi', 'kvašené zelí — národní poklad', 80, ['hravé'], 'živá'],
  ['Momo',   'broskev — sladký kocour', 82, ['hravé', 'přírodní'], 'klidná'],
])
pridej('kr', 'kocka', [
  ['Yaong',  'mňau po korejsku', 82, ['hravé'], 'živá'],
  ['Byeol',  'hvězda — třpyt v očích', 84, ['přírodní', 'elegantní'], 'klidná'],
  ['Gureum', 'obláček — bílá a měkká', 80, ['přírodní'], 'klidná'],
  ['Ttosun', 'slečinka — domácké oslovení', 77, ['tradiční', 'hravé'], 'vyvážená'],
])
pridej('kr', 'kun', [
  ['Baram',   'vítr přes ostrov Čedžu', 80, ['přírodní'], 'živá'],
  ['Cheonma', 'nebeský kůň z korejských mýtů', 82, ['mytologické'], 'vyvážená'],
])
pridej('kr', 'kralik', [
  ['Tokki', 'králík — a taky ten z Měsíce', 82, ['hravé', 'mytologické'], 'živá'],
  ['Dangeun', 'mrkev po korejsku', 74, ['hravé'], 'vyvážená'],
])
pridej('kr', 'papousek', [
  ['Ppiyak', 'pípnutí — zvuk, co dělá', 76, ['hravé'], 'živá'],
  ['Suda',   'klábosení — mluvka v kleci', 73, ['hravé'], 'živá'],
])
pridej('kr', 'krecek', [
  ['Haemi',  'úsměv slunce', 76, ['hravé'], 'vyvážená'],
  ['Ttang',  'oříšek — kapesní mlsoun', 74, ['hravé'], 'živá'],
])

// ══ ROZŠÍŘENÍ ČESKÝCH A SLOVENSKÝCH SAD ══════════════════════════════════════

pridej('cz', 'kluk', [
  ['Ondřej',  'ochránce mužů — jméno se zimním svátkem', 88, ['tradiční'], 'vyvážená', [11]],
  ['Matěj',   'dar od Boha — hravý bratranec Matyáše', 87, ['tradiční'], 'živá', [2]],
  ['Šimon',   'naslouchající — měkké a milé', 85, ['tradiční'], 'klidná', [10]],
  ['Daniel',  'Bůh je můj soudce — nadčasová klasika', 84, ['tradiční'], 'vyvážená', [12]],
  ['Antonín', 'neocenitelný — návrat starých jmen', 82, ['tradiční', 'elegantní'], 'klidná', [6]],
  ['Kryštof', 'nesoucí Krista — mořeplavecké jméno', 83, ['tradiční'], 'živá', [7]],
  ['Marek',   'bojovný — krátké a jisté', 81, ['tradiční'], 'vyvážená', [4]],
  ['Oliver',  'olivovník — světová novinka v českém kalendáři', 86, ['moderní'], 'vyvážená', [7]],
])
pridej('cz', 'holka', [
  ['Natálie',  'narozená o Vánocích — sváteční jméno', 88, ['tradiční', 'elegantní'], 'vyvážená', [12]],
  ['Julie',    'mladistvá — romantická klasika', 86, ['tradiční', 'elegantní'], 'klidná', [5]],
  ['Karolína', 'svobodná — noblesa v pěti slabikách', 85, ['elegantní'], 'vyvážená', [7]],
  ['Nela',     'zářivá — krátké moderní jméno', 84, ['moderní'], 'živá', [6]],
  ['Rozálie',  'růžová — babiččino jméno v novém hávu', 82, ['tradiční', 'přírodní'], 'klidná', [9]],
  ['Kristýna', 'pomazaná — devadesátkový hit, co vydržel', 83, ['tradiční'], 'vyvážená', [7]],
  ['Barbora',  'cizinka — jméno se zimním svátkem', 84, ['tradiční'], 'živá', [12]],
  ['Marie',    'milovaná — nejčastější jméno české historie', 85, ['tradiční'], 'klidná', [9]],
])
pridej('cz', 'pes', [
  ['Aramis', 'mušketýr s elegantním krokem', 79, ['tradiční', 'elegantní'], 'vyvážená', 'velké'],
  ['Bertík', 'domácí dobrák se špičatýma ušima', 80, ['hravé'], 'klidná', 'malé'],
  ['Darík',  'dárek, co přišel na čtyřech', 78, ['hravé', 'tradiční'], 'živá', 'střední'],
])
pridej('cz', 'fenka', [
  ['Terry',  'energická parťačka na běh', 81, ['sportovní', 'moderní'], 'živá', 'střední'],
  ['Zorka',  'jitřenka — vstává první z celé rodiny', 79, ['tradiční', 'přírodní'], 'živá', 'střední'],
  ['Sisi',   'císařovna Sisi — noblesa s ocáskem', 80, ['elegantní', 'královské'], 'klidná', 'malé'],
])
pridej('cz', 'kocour', [
  ['Vašík',   'domácký král kuchyně', 79, ['tradiční', 'hravé'], 'klidná'],
  ['Bonifác', 'dobrodinec — vážený pán s knírem', 78, ['tradiční'], 'klidná'],
])
pridej('cz', 'kocka', [
  ['Terezka', 'sklízející — mazlivá slečna', 78, ['tradiční', 'hravé'], 'klidná'],
  ['Zuzi',    'lilie — hravá a upovídaná', 77, ['hravé'], 'živá'],
])
pridej('sk', 'kluk', [
  ['Jakub',   'ten, kdo jde v patách — slovenská jednička', 90, ['tradiční'], 'vyvážená', [7]],
  ['Adam',    'člověk ze země — nadčasové', 88, ['tradiční', 'moderní'], 'vyvážená', [12]],
  ['Filip',   'milovník koní — energický', 85, ['tradiční', 'sportovní'], 'živá', [5]],
  ['Tobias',  'Bůh je dobrý — moderní favorit', 83, ['moderní'], 'klidná', [9]],
])
pridej('sk', 'holka', [
  ['Sofia',   'moudrost — slovenská první dáma', 90, ['elegantní'], 'vyvážená', [5]],
  ['Ema',     'všeobjímající — krátké a hebké', 87, ['moderní'], 'klidná', [4]],
  ['Michaela', 'kdo je jako Bůh — silné a laskavé', 84, ['tradiční'], 'vyvážená', [9]],
  ['Timea',   'ctící Boha — maďarský dárek Slovensku', 82, ['moderní'], 'živá', [1]],
])
pridej('sk', 'pes', [
  ['Cvako',  'šibal, co si zaslouží dvě jména', 77, ['hravé'], 'živá', 'malé'],
  ['Tarzan', 'pán džungle na zahradě', 80, ['hravé', 'sportovní'], 'živá', 'velké'],
])
pridej('sk', 'fenka', [
  ['Cindy',  'popelka s krásnýma očima', 80, ['moderní', 'hravé'], 'vyvážená', 'střední'],
  ['Tara',   'kopec králů — důstojná dáma', 79, ['mytologické'], 'klidná', 'velké'],
])

export const JMENA: Jmeno[] = vsechna

/** Dětská jména, která se používají ve více zemích — „fungují i v zahraničí". */
export const MEZINARODNI: Set<string> = (() => {
  const zeme = new Map<string, Set<string>>()
  for (const j of vsechna) {
    if (j.kategorie !== 'kluk' && j.kategorie !== 'holka') continue
    const k = klic(j.jmeno)
    if (!zeme.has(k)) zeme.set(k, new Set())
    zeme.get(k)!.add(j.zeme)
  }
  const vysledek = new Set<string>()
  for (const [k, z] of zeme) if (z.size >= 2) vysledek.add(k)
  // krátká světová jména srozumitelná všude, i když jsou v katalogu jednou
  for (const k of ['kai', 'leo', 'ema', 'emma', 'mia', 'nina', 'lena', 'alma', 'maia']) vysledek.add(k)
  return vysledek
})()

export const jeMezinarodni = (j: Jmeno) =>
  (j.kategorie === 'kluk' || j.kategorie === 'holka') && MEZINARODNI.has(klic(j.jmeno))

export const jmenaZeme = (kod: string) => JMENA.filter(j => j.zeme === kod)
export const jmenaKontinentu = (kontinent: string) => {
  const kody = ZEME.filter(z => z.kontinent === kontinent).map(z => z.kod)
  return JMENA.filter(j => kody.includes(j.zeme))
}
