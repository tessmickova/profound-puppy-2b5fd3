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
export function pasyJmen(): [string[], string[]] {
  const horni: string[] = []
  const dolni: string[] = []
  JMENA_V_CESKU.forEach((j, i) => (i % 2 === 0 ? horni : dolni).push(j))
  return [horni, dolni]
}
