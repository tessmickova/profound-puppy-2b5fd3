// Kurátorovaný katalog nejlíbivějších jmen podle zemí — zvířata i děti.
// Popularita je redakční skóre líbivosti 0–100 (kombinace tamních žebříčků a zvuku jména).

import type { Energie, Jmeno, Kategorie, Kontinent, Styl, Velikost, Zeme } from './types'

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
]

export const zemePodleKodu = (kod: string) => ZEME.find(z => z.kod === kod)

// ── pomocné výpočty ──────────────────────────────────────────────────────────

const SAMOHLASKY = 'aáeéěiíoóuúůyý'

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

function pridej(zeme: string, kategorie: Kategorie, radky: (RadekZvire | RadekDite)[]) {
  const jePes = kategorie === 'pes' || kategorie === 'fenka'
  const jeDite = kategorie === 'kluk' || kategorie === 'holka'
  for (const r of radky) {
    const [jmeno, vyznam, popularita, styly, energie, extra] = r
    vsechna.push({
      id: `${zeme}-${kategorie}-${poradi++}`,
      jmeno, kategorie, zeme, vyznam, popularita, styly, energie,
      delka: jmeno.replace(/\s/g, '').length,
      slabiky: pocetSlabik(jmeno),
      mesice: jeDite && Array.isArray(extra) ? extra : [],
      velikost: jePes && typeof extra === 'string' ? extra : undefined,
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

export const JMENA: Jmeno[] = vsechna

export const jmenaZeme = (kod: string) => JMENA.filter(j => j.zeme === kod)
export const jmenaKontinentu = (kontinent: string) => {
  const kody = ZEME.filter(z => z.kontinent === kontinent).map(z => z.kod)
  return JMENA.filter(j => kody.includes(j.zeme))
}
