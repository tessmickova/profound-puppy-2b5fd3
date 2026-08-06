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
