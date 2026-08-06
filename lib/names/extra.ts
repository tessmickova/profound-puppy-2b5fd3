// Doplňky ke jménům: zdrobněliny, jmeniny (český kalendář) a unisex jména.
// Klíčem je jméno malými písmeny bez diakritiky.

/** Domácké podoby a zdrobněliny. */
export const DOMACKY: Record<string, string[]> = {
  // Česko
  jakub: ['Kuba', 'Kubík'], jan: ['Honza', 'Honzík', 'Jenda'], tomas: ['Tom', 'Tomík'],
  adam: ['Adámek', 'Áďa'], matyas: ['Maty', 'Matýsek'], vojtech: ['Vojta', 'Vojtík'],
  filip: ['Fíla', 'Filípek'], mikulas: ['Miki', 'Mikulášek'],
  eliska: ['Eli', 'Elinka'], anna: ['Anička', 'Andulka'], tereza: ['Terka', 'Terezka'],
  adela: ['Adélka', 'Áďa'], amalie: ['Amálka', 'Máli'], sofie: ['Sofi', 'Sofinka'],
  viktorie: ['Viki', 'Viktorka'], ema: ['Emička', 'Emča'],
  // Slovensko
  samuel: ['Samko', 'Samo'], oliver: ['Oli', 'Ollie'], michal: ['Miško', 'Mišo'],
  martin: ['Maťo', 'Martinko'], simon: ['Šimi', 'Šimonko'], matej: ['Maťko', 'Mates'],
  nina: ['Ninka'], natalia: ['Natálka', 'Táli'], viktoria: ['Vika', 'Viki'],
  livia: ['Livka'], zuzana: ['Zuzka', 'Zuza'], dominika: ['Domi', 'Nika'],
  // Polsko
  antoni: ['Antek', 'Toś'], aleksander: ['Olek', 'Alek'], franciszek: ['Franek'],
  stanislaw: ['Staś'], wojtek: ['Wojtuś'], zuzanna: ['Zuzia'], zofia: ['Zosia'],
  hanna: ['Hania'], maja: ['Majka'], lena: ['Lenka'], wanda: ['Wandzia'],
  // svět
  william: ['Will', 'Billy'], charlotte: ['Lottie', 'Charlie'], olivia: ['Liv', 'Livvy'],
  amelia: ['Amy', 'Millie'], george: ['Georgie'], arthur: ['Artie'], theo: ['Teddy'],
  leonardo: ['Leo'], alessandro: ['Sandro', 'Ale'], francesco: ['Fra', 'Checco'],
  alexandros: ['Alex'], georgios: ['Jorgos'], dimitris: ['Dimi'], eleni: ['Lenio'],
  louis: ['Lou'], louise: ['Lou', 'Loulou'], gabriel: ['Gab', 'Gabi'], raphael: ['Rapha'],
  emilia: ['Emi', 'Mila'], benjamin: ['Benja', 'Benji'], josefina: ['Pepa', 'Fina'],
  isabella: ['Isa', 'Bella'], catalina: ['Cata'], milagros: ['Mili'],
  elias: ['Eli'], henry: ['Hank', 'Harry'], jack: ['Jackie'], scarlett: ['Scar', 'Lettie'],
}

/** Jmeniny podle českého občanského kalendáře (jen jistá data). */
export const SVATKY_CZ: Record<string, string> = {
  jakub: '25. 7.', jan: '24. 6.', tomas: '7. 3.', adam: '24. 12.', matyas: '24. 2.',
  vojtech: '23. 4.', filip: '26. 5.', mikulas: '6. 12.',
  eliska: '5. 10.', anna: '26. 7.', tereza: '15. 10.', adela: '2. 9.',
  amalie: '10. 6.', sofie: '15. 5.', viktorie: '10. 3.', ema: '8. 4.',
}

/** Jména používaná pro kluky i holčičky. */
export const UNISEX = new Set(['kai', 'billie', 'rory', 'wren', 'maia', 'nova'])

// ── pohlaví zvířecích jmen ───────────────────────────────────────────────────
// Psi a kocouři jsou samci, fenky a kočky samice — u koní, králíků, papoušků
// a křečků je pohlaví u jména vypsané zde. Co není v seznamu, bereme jako samce.

export const SAMICE_ZVIRE = new Set([
  // koně
  'ryzka', 'hviezda', 'etoile', 'furia', 'estrela', 'kasztanka', 'belka',
  // králíci
  'mrkvicka', 'mohre', 'carota', 'pita', 'marchewka', 'pysia', 'cenoura', 'flopsy',
  // papoušci
  'lora', 'kiki', 'polly', 'kajsa', 'zuzu', 'sissa', 'kesza', 'hira',
  // křečci
  'krupka', 'biscotte', 'nocciola', 'bolita', 'kurumi', 'pacoca', 'baklava', 'pavlova',
])

/** Zvířecí jména, která stejně dobře sednou samci i samičce. */
export const UNISEX_ZVIRE = new Set([
  // koně
  'norr', 'kaze', 'hikari', 'dakota', 'waler', 'blizzard', 'cedar', 'criollo', 'aotea', 'blaze',
  // králíci
  'clover', 'skutt', 'morot', 'mochi', 'usagi', 'fulful', 'biscuit', 'gumnut',
  'snowball', 'gajar', 'sufi', 'manuka',
  // papoušci
  'pirko', 'coco', 'verde', 'pip', 'piko', 'aozora', 'sunny', 'echo', 'zabele',
  'kiwi', 'skippy', 'sirtaki', 'gadula', 'piper', 'kaka', 'tiki',
  // křečci
  'krumel', 'nibbles', 'plutten', 'chibi', 'simsim', 'tamr', 'peanut', 'timtam',
  'poutine', 'nugget', 'laddu', 'kumara',
  // psi, fenky, kocouři a kočky, kde jméno funguje pro obě pohlaví
  'shadow', 'skye', 'maru', 'kuro', 'shiro', 'yuki', 'sora', 'momo', 'tama', 'fuku',
  'koru', 'chase', 'bluey', 'ziggy', 'smokey', 'misty', 'pepper', 'oreo', 'rio',
  'winter', 'frost', 'aspen', 'nala', 'loki', 'mel', 'kea',
])
