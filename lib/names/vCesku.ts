// Jména, která v Česku reálně někdo nosí — víc než pět nositelů.
//
// Ministerstvo vnitra přestalo statistiky četnosti jmen zveřejňovat; poslední
// veřejný seznam je z roku 2016 (147 511 unikátních jmen) a pracují s ním weby
// jako kdejsme.cz nebo nasejmena.cz. Tenhle výběr z něj vychází, ale je
// kurátorovaný, ne strojově načtený — držíme se jmen, u kterých je počet
// nositelů bezpečně nad hranicí pěti.

/** Česká a slovenská klasika — jména s tisíci nositelů. */
const DOMACI = [
  'Jiří', 'Jan', 'Petr', 'Josef', 'Pavel', 'Martin', 'Jaroslav', 'Tomáš', 'Miroslav',
  'Zdeněk', 'František', 'Václav', 'Michal', 'Milan', 'Karel', 'Vladimír', 'Lukáš',
  'David', 'Jakub', 'Ladislav', 'Stanislav', 'Roman', 'Ondřej', 'Antonín', 'Radek',
  'Marek', 'Daniel', 'Vojtěch', 'Filip', 'Adam', 'Matěj', 'Šimon', 'Kryštof',
  'Dominik', 'Patrik', 'Štěpán', 'Michael', 'Matyáš', 'Vít', 'Aleš', 'Robert',
  'Richard', 'Bohumil', 'Rudolf', 'Oldřich', 'Emil', 'Vlastimil', 'Radim', 'Luboš',
  'Miloš', 'Bohuslav', 'Jindřich', 'Otakar', 'Přemysl', 'Svatopluk', 'Vratislav',
  'Kamil', 'Norbert', 'Alois', 'Ivo', 'Vilém', 'Prokop', 'Mikuláš', 'Kristián',
  'Marie', 'Jana', 'Eva', 'Hana', 'Anna', 'Lenka', 'Kateřina', 'Věra', 'Lucie',
  'Alena', 'Jaroslava', 'Petra', 'Martina', 'Jitka', 'Veronika', 'Ludmila', 'Jarmila',
  'Michaela', 'Zdeňka', 'Marcela', 'Tereza', 'Monika', 'Helena', 'Zuzana', 'Ivana',
  'Eliška', 'Adéla', 'Barbora', 'Kristýna', 'Natálie', 'Karolína', 'Klára', 'Nikola',
  'Simona', 'Denisa', 'Aneta', 'Gabriela', 'Andrea', 'Markéta', 'Pavlína', 'Šárka',
  'Dagmar', 'Blanka', 'Radka', 'Vlasta', 'Božena', 'Růžena', 'Julie', 'Rozálie',
  'Amálie', 'Viktorie', 'Antonie', 'Magdaléna', 'Alžběta', 'Vendula', 'Nela', 'Ema',
  'Miluše', 'Drahomíra', 'Květoslava', 'Bohumila', 'Vlastimila', 'Zdislava',
  'Libuše', 'Miroslava', 'Stanislava', 'Vladimíra', 'Jindřiška', 'Dobromila',
  'Anežka', 'Terezie', 'Františka', 'Josefína', 'Apolena', 'Ludvika', 'Otýlie',
  'Sabina', 'Silvie', 'Renáta', 'Jolana', 'Iveta', 'Květa', 'Milada', 'Naděžda',
  'Emília', 'Ivona', 'Danica', 'Vesna', 'Branislav', 'Dušan', 'Marián', 'Tibor',
]

/** Jména, která k nám přišla ze světa a dnes je nosí tisíce lidí. */
const PRISLA_ZE_SVETA = [
  // západní Evropa a Amerika
  'Nikolas', 'Sebastian', 'Oliver', 'Kevin', 'Denis', 'Marco', 'Alex', 'Erik',
  'Max', 'Samuel', 'Matias', 'Leon', 'Nathan', 'Christian', 'Robin', 'Sam',
  'Daniel', 'Gabriel', 'Raphael', 'Benjamin', 'Elias', 'Theodor', 'Oskar',
  'Hugo', 'Felix', 'Viktor', 'Lucas', 'Noah', 'Liam', 'Ethan', 'Adrian',
  'Marcus', 'Alan', 'Ronald', 'Edward', 'Arnošt', 'Bruno', 'Konrád', 'Hubert',
  'Emma', 'Sofie', 'Sophia', 'Laura', 'Nicol', 'Melissa', 'Vanessa', 'Stella',
  'Elena', 'Diana', 'Nina', 'Alice', 'Amelie', 'Isabela', 'Victoria', 'Charlotte',
  'Sára', 'Ester', 'Rebeka', 'Miriam', 'Judita', 'Stela', 'Emily', 'Olivie',
  'Sofia', 'Valentýna', 'Beatrice', 'Chiara', 'Bianca', 'Camila', 'Nora',
  'Ingrid', 'Astrid', 'Greta', 'Frida', 'Matilda', 'Cecílie', 'Klaudie',
  'Adriana', 'Alexandra', 'Kamila', 'Lada', 'Linda', 'Nataša', 'Patricie',
  'Sandra', 'Tamara', 'Zoe', 'Mia', 'Ela', 'Leona', 'Nikoleta', 'Melánie',
]

/** Všechna jména dohromady — vstup pro jezdící pásy na úvodu. */
export const JMENA_V_CESKU: string[] = [...new Set([...DOMACI, ...PRISLA_ZE_SVETA])]

/** Rozdělí seznam na dva pásy tak, aby oba byly zhruba stejně dlouhé
 *  a sousední jména v nich spolu nesouvisela (nevznikne blok jedné země). */
/**
 * Kolik jmen se do jednoho pásu vejde.
 *
 * Pás je dekorace: jede pořád dokola a nikdo ho nečte celý. Dřív v něm byla
 * všechna jména, a protože se seznam kvůli nekonečné smyčce vykresluje
 * dvakrát, vznikly stovky textových uzlů navíc na každé stránce. Menší výběr
 * vypadá stejně a je znatelně levnější — pro prohlížeč i pro čtečku.
 */
const NA_PAS = 26

export function pasyJmen(): [string[], string[]] {
  const horni: string[] = []
  const dolni: string[] = []
  JMENA_V_CESKU.forEach((j, i) => (i % 2 === 0 ? horni : dolni).push(j))
  return [horni.slice(0, NA_PAS), dolni.slice(0, NA_PAS)]
}

// ── jména mazlíčků, se kterými se v Česku potkáte na každé procházce ─────────
// Sestaveno z jmen běžných u českých chovatelů a v inzerátech útulků;
// míchá domácí klasiku s tím, co k nám přišlo z filmů a seriálů.

const PSI_A_FENKY = [
  'Ben', 'Rex', 'Max', 'Alík', 'Punťa', 'Baryk', 'Bobík', 'Cézar', 'Dick', 'Ajax',
  'Aron', 'Argo', 'Bady', 'Blesk', 'Brok', 'Bruno', 'Bady', 'Cvalík', 'Dan',
  'Endy', 'Fanda', 'Gaston', 'Hektor', 'Charlie', 'Jerry', 'Kajtar', 'Lord',
  'Míša', 'Nero', 'Oskar', 'Pluto', 'Rocky', 'Sam', 'Tobík', 'Uran', 'Vilík',
  'Zorro', 'Žeryk', 'Baron', 'Bobeš', 'Falco', 'Rambo', 'Sirius', 'Teddy',
  'Ajda', 'Bára', 'Bella', 'Bety', 'Cira', 'Dina', 'Elza', 'Fenka', 'Gina',
  'Hera', 'Cindy', 'Jessie', 'Kessy', 'Lucky', 'Maja', 'Nela', 'Orša', 'Perla',
  'Rita', 'Sára', 'Tina', 'Uma', 'Vendy', 'Zita', 'Žofka', 'Amy', 'Daisy',
  'Dixie', 'Ema', 'Chloe', 'Lassie', 'Laika', 'Nikita', 'Roxy', 'Stella',
]

const KOCKY_A_KOCOURI = [
  'Mikeš', 'Mourek', 'Macek', 'Fousek', 'Bertík', 'Cyril', 'Damián', 'Felix',
  'Garfield', 'Kocourek', 'Leon', 'Matýsek', 'Neo', 'Oliver', 'Pepík', 'Ryšek',
  'Sam', 'Šedivák', 'Tom', 'Vašík', 'Zrzek', 'Bonifác', 'Jonáš', 'Kimi',
  'Micka', 'Mína', 'Líza', 'Bára', 'Perlička', 'Aisha', 'Bella', 'Cilka',
  'Dorka', 'Elsa', 'Fanynka', 'Gita', 'Hanka', 'Isis', 'Jitka', 'Kitty',
  'Lucy', 'Máca', 'Nelly', 'Olivie', 'Pusinka', 'Róza',
  'Sofie', 'Terezka', 'Ulita', 'Vendulka', 'Zuzi', 'Žofie', 'Mia', 'Luna',
]

const DALSI_MAZLICI = [
  'Šemík', 'Ryzka', 'Bělka', 'Hvězda', 'Blesk', 'Vítr', 'Perla', 'Kaštan',
  'Bobek', 'Ušák', 'Mrkvička', 'Chlupáček', 'Pampeliška', 'Kulička', 'Cukřík',
  'Lóra', 'Kokeš', 'Žako', 'Ferda', 'Pepa', 'Amálka', 'Křupka', 'Fíček',
  'Hopsalka', 'Oříšek', 'Sněhurka', 'Tlapka', 'Čmelda', 'Bublina', 'Pipin',
]

/** Zvířecí jména pro jezdící pásy — bez duplicit a bez prázdných hodnot. */
export const ZVIRATA_V_CESKU: string[] = [
  ...new Set([...PSI_A_FENKY, ...KOCKY_A_KOCOURI, ...DALSI_MAZLICI].filter(Boolean)),
]

export function pasyZvirat(): [string[], string[]] {
  const horni: string[] = []
  const dolni: string[] = []
  ZVIRATA_V_CESKU.forEach((j, i) => (i % 2 === 0 ? horni : dolni).push(j))
  return [horni.slice(0, NA_PAS), dolni.slice(0, NA_PAS)]
}
