// Jména, která v Česku reálně někdo nosí — víc než pět nositelů.
//
// Ministerstvo vnitra přestalo statistiky četnosti jmen zveřejňovat; poslední
// veřejný seznam je z roku 2016 (147 511 unikátních jmen) a pracují s ním weby
// jako kdejsme.cz nebo nasejmena.cz. Tenhle výběr z něj vychází, ale je
// kurátorovaný, ne strojově načtený — držíme se jmen, u kterých je počet
// nositelů bezpečně nad hranicí pěti.
//
// Záměrně je tu i vrstva jmen, která do Česka přišla s lidmi odjinud —
// vietnamská, ukrajinská, ruská, arabská i západní. Přesně tak dnes vypadá
// jmenná mapa republiky.

/** Česká a slovenská klasika — jména s tisíci nositelů. */
const DOMACI = [
  'Jiří', 'Jan', 'Petr', 'Josef', 'Pavel', 'Martin', 'Jaroslav', 'Tomáš', 'Miroslav',
  'Zdeněk', 'František', 'Václav', 'Michal', 'Milan', 'Karel', 'Vladimír', 'Lukáš',
  'David', 'Jakub', 'Ladislav', 'Stanislav', 'Roman', 'Ondřej', 'Antonín', 'Radek',
  'Marek', 'Daniel', 'Vojtěch', 'Filip', 'Adam', 'Matěj', 'Šimon', 'Kryštof',
  'Dominik', 'Patrik', 'Štěpán', 'Michael', 'Matyáš', 'Vít', 'Aleš', 'Robert',
  'Richard', 'Bohumil', 'Rudolf', 'Oldřich', 'Emil', 'Ivan', 'Igor', 'Radim',
  'Marie', 'Jana', 'Eva', 'Hana', 'Anna', 'Lenka', 'Kateřina', 'Věra', 'Lucie',
  'Alena', 'Jaroslava', 'Petra', 'Martina', 'Jitka', 'Veronika', 'Ludmila', 'Jarmila',
  'Michaela', 'Zdeňka', 'Marcela', 'Tereza', 'Monika', 'Helena', 'Zuzana', 'Ivana',
  'Eliška', 'Adéla', 'Barbora', 'Kristýna', 'Natálie', 'Karolína', 'Klára', 'Nikola',
  'Simona', 'Denisa', 'Aneta', 'Gabriela', 'Andrea', 'Markéta', 'Pavlína', 'Šárka',
  'Dagmar', 'Blanka', 'Radka', 'Vlasta', 'Božena', 'Růžena', 'Julie', 'Rozálie',
  'Amálie', 'Viktorie', 'Antonie', 'Magdaléna', 'Alžběta', 'Vendula', 'Nela', 'Ema',
]

/** Jména, která k nám přišla ze světa a dnes je nosí tisíce lidí. */
const PRISLA_ZE_SVETA = [
  // západní Evropa a Amerika
  'Nikolas', 'Sebastian', 'Oliver', 'Kevin', 'Denis', 'Marco', 'Alex', 'Erik',
  'Max', 'Samuel', 'Matias', 'Leon', 'Nathan', 'Christian', 'Robin', 'Sam',
  'Emma', 'Sofie', 'Sophia', 'Laura', 'Nicol', 'Melissa', 'Vanessa', 'Stella',
  'Elena', 'Diana', 'Sabina', 'Nina', 'Alice', 'Amelie', 'Isabela', 'Victoria',
  'Sára', 'Ester', 'Rebeka', 'Miriam', 'Judita', 'Nikol', 'Stela', 'Emily',
  // Slovensko a Balkán
  'Zoltán', 'Attila', 'Tibor', 'Dušan', 'Branislav', 'Ľuboš', 'Marián',
  'Dragan', 'Milica', 'Jovana', 'Snežana', 'Vesna', 'Ivona', 'Danica',
  // Ukrajina, Rusko, Bělorusko
  'Oleksandr', 'Volodymyr', 'Serhii', 'Andrii', 'Vitalii', 'Dmytro', 'Ihor',
  'Vasyl', 'Mykola', 'Bohdan', 'Taras', 'Maksym', 'Yurii', 'Ruslan',
  'Oksana', 'Nataliia', 'Tetiana', 'Halyna', 'Iryna', 'Olha', 'Svitlana',
  'Kateryna', 'Ludmyla', 'Viktoriia', 'Yuliia', 'Anastasiia', 'Olena',
  'Sergej', 'Aleksej', 'Nikolaj', 'Vladislav', 'Olga', 'Tatiana', 'Galina',
  // Vietnam — jedna z největších menšin v Česku
  'Nguyen', 'Minh', 'Hoang', 'Thanh', 'Tuan', 'Nam', 'Duc', 'Long', 'Hung',
  'Lan', 'Mai', 'Linh', 'Huong', 'Trang', 'Thao', 'Hanh', 'Nga', 'Yen',
  // arabský a turecký svět
  'Mohamed', 'Ahmed', 'Ali', 'Omar', 'Hassan', 'Mustafa', 'Ibrahim', 'Yusuf',
  'Fatima', 'Amina', 'Layla', 'Sara', 'Nour', 'Zahra', 'Yasmin',
  // jižní a východní Asie
  'Rahul', 'Amit', 'Sanjay', 'Priya', 'Anita', 'Wei', 'Ming', 'Chen', 'Li',
  'Kim', 'Jun', 'Yuki', 'Hiroshi', 'Akira', 'Sakura',
  // romská jména a jména s dlouhou tradicí u nás
  'Rudolf', 'Zoran', 'Jolana', 'Renáta', 'Silvie', 'Božena', 'Emília',
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
