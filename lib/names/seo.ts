// Sdílené SEO údaje. Doména se mění jednou proměnnou, ať se nemusí hledat
// po celém projektu.

export const WEB = {
  url: process.env.NEXT_PUBLIC_URL ?? 'https://jmenaprodeti.cz',
  nazev: 'Svět jmen',
  popis:
    'Jména pro děti i zvířata podle zemí celého světa — s významem, oblíbeností, '
    + 'jmeninami a chytrým výběrem podle příjmení, rodiny a plemene.',
  jazyk: 'cs-CZ',
}

/** Otázky, na které se web přímo ptá — čte je Google i jazykové modely. */
export const CASTE_DOTAZY: { otazka: string; odpoved: string }[] = [
  {
    otazka: 'Jak vybrat jméno, které ladí s příjmením?',
    odpoved:
      'Sledujte tři věci: přechod mezi jménem a příjmením (nesmí na sebe narazit dvě '
      + 'stejné hlásky), celkový rytmus (příjemné jsou čtyři až šest slabik dohromady) '
      + 'a rým — pokud jméno i příjmení končí stejně, zní dvojice jako říkanka. '
      + 'Svět jmen tohle spočítá a seřadí jména podle výsledného skóre.',
  },
  {
    otazka: 'Jaké jméno se hodí k sourozenci nebo k rodičům?',
    odpoved:
      'Jména v jedné rodině mají sdílet styl a původ, ale lišit se rytmem a nejlépe '
      + 'i první hláskou, aby se doma nepletla. Zadejte jméno maminky, tatínka '
      + 'i sourozence a dostanete jména se štítkem, s kým konkrétně ladí.',
  },
  {
    otazka: 'Jaké jméno je pro psa nejlepší?',
    odpoved:
      'Kynologové doporučují jména o jedné až dvou slabikách, která končí samohláskou '
      + '— pes je slyší nejlépe. Vyhněte se jménům znějícím jako povel (Ne, Fuj, Sedni). '
      + 'Filtr „dobře se volá" tato pravidla používá automaticky.',
  },
  {
    otazka: 'Jak najít jméno podle plemene psa?',
    odpoved:
      'Ke každému z 28 plemen máme ručně vybraná jména podle jeho původu, povahy '
      + 'a historie — sibiřský husky dostane zimní a severská jména (Balto, Togo, '
      + 'Yukon, Odin), bígl Snoopyho, shiba inu japonská jména.',
  },
  {
    otazka: 'Kolik jmen katalog obsahuje?',
    odpoved:
      'Přes 1000 jmen z 25 zemí na šesti kontinentech — pro holčičky, kluky, psy, '
      + 'fenky, kocoury, kočky, koně, králíky, papoušky i křečky. U každého jména '
      + 'je význam, oblíbenost, styl a délka.',
  },
]

export function jsonLdWeb() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: WEB.nazev,
    url: WEB.url,
    description: WEB.popis,
    inLanguage: WEB.jazyk,
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${WEB.url}/deti?hledat={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  }
}

export function jsonLdDotazy() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: CASTE_DOTAZY.map(d => ({
      '@type': 'Question',
      name: d.otazka,
      acceptedAnswer: { '@type': 'Answer', text: d.odpoved },
    })),
  }
}

/** Seznam jmen jako ItemList — vyhledávače z něj čtou konkrétní položky. */
export function jsonLdSeznam(nazev: string, url: string, jmena: { jmeno: string; vyznam: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: nazev,
    url,
    numberOfItems: jmena.length,
    itemListElement: jmena.slice(0, 25).map((j, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: j.jmeno,
      description: j.vyznam,
    })),
  }
}

export function jsonLdDrobky(cesta: { nazev: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: cesta.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.nazev,
      item: `${WEB.url}${c.url}`,
    })),
  }
}

// ── AI vyhledávání ───────────────────────────────────────────────────────────
// Jazykové modely odpovídají z toho, co na stránce najdou jako hotovou větu,
// a ověřují si to proti strukturovaným datům. Proto stejnou informaci dáváme
// dvakrát: jednou jako čitelný text (viditelné odpovědi na stránkách)
// a jednou jako JSON-LD.

/** Krátké odpovědi, které se dají citovat celé. Text je zároveň vidět na webu. */
export interface Odpoved { otazka: string; odpoved: string }

export const ODPOVEDI_DETI: Odpoved[] = [
  {
    otazka: 'Jak poznám, že jméno sedí k příjmení?',
    odpoved:
      'Jméno sedí k příjmení, když se na jejich rozhraní nesrazí dvě stejné hlásky '
      + '(Anna Adamcová), dohromady mají čtyři až šest slabik a nekončí stejně, '
      + 'aby dvojice nezněla jako říkanka. Svět jmen tyhle tři věci spočítá a vrátí '
      + 'skóre 0–100 s vysvětlením.',
  },
  {
    otazka: 'Jaká jsou nejoblíbenější česká jména pro holčičky a kluky?',
    odpoved:
      'Dlouhodobě vedou u holčiček Eliška, Anna, Sofie, Tereza a Adéla, u kluků Jakub, '
      + 'Jan, Tomáš, Adam a Matyáš. Katalog jich nabízí přes tisíc z 25 zemí, včetně '
      + 'jmen, která se v Česku používají, ale nejsou úplně běžná.',
  },
  {
    otazka: 'Musí být jméno v kalendáři?',
    odpoved:
      'Nemusí. Matrika zapíše jakékoli existující jméno, které není zdrobnělina '
      + 'a jde u něj rozeznat pohlaví. Jméno mimo kalendář znamená jen to, že dítě '
      + 'nebude mít oficiální svátek.',
  },
  {
    otazka: 'Jak sladit jméno s jménem sourozence?',
    odpoved:
      'Sourozenecká jména mají sdílet styl a původ, ale lišit se rytmem a nejlépe '
      + 'i první hláskou — jinak se doma pletou. Zadejte jméno prvního dítěte '
      + 'a dostanete jména, která k němu ladí, i s důvodem proč.',
  },
]

export const ODPOVEDI_ZVIRATA: Odpoved[] = [
  {
    otazka: 'Jaké jméno pro psa se nejlíp volá?',
    odpoved:
      'Nejlíp se volají jména o jedné až dvou slabikách, která končí samohláskou — '
      + 'Ben, Aya, Rocky. Pes je slyší i na dálku a v hluku. Vyhněte se jménům '
      + 'znějícím jako povel: Ne, Fuj, Sedni, Lehni.',
  },
  {
    otazka: 'Jaká jména se hodí pro sibiřského huskyho?',
    odpoved:
      'Huskymu sedí zimní a severská jména po hrdinech tažných psů a severské '
      + 'mytologii: Balto, Togo, Yukon, Tundra, Denali, Chinook, Aurora, Odin, '
      + 'Thor, Ylva, Neve a Aspen.',
  },
  {
    otazka: 'Jak vybrat jméno pro kočku?',
    odpoved:
      'Kočky reagují nejlíp na jména se sykavkou nebo vysokým vokálem na konci — '
      + 'Micka, Lucy, Kiki. Dvě slabiky stačí. Jméno by se nemělo plést s běžnými '
      + 'slovy, která doma padají každý den.',
  },
  {
    otazka: 'Může mít zvíře unisex jméno?',
    odpoved:
      'Ano, a je to praktické. Katalog rozlišuje jména pro samce, samice a unisex, '
      + 'takže se dá vybrat i jméno, které padne bez ohledu na pohlaví — Kiwi, Rezek, '
      + 'Šiška nebo Mango.',
  },
]

/** Kdo za webem stojí — pomáhá modelům spojit obsah s konkrétním zdrojem. */
export function jsonLdProvozovatel() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: WEB.nazev,
    url: WEB.url,
    description: WEB.popis,
    areaServed: 'CZ',
    knowsLanguage: ['cs', 'sk'],
    knowsAbout: [
      'jména pro děti', 'jména pro zvířata', 'význam jmen', 'jmeniny',
      'původ jmen', 'jména podle zemí', 'jména pro psy', 'jména pro kočky',
    ],
  }
}

/**
 * Jména jako slovník pojmů. Model si tak z jedné stránky odnese dvojice
 * jméno → význam, ne jen seznam slov.
 */
export function jsonLdSlovnik(
  nazev: string,
  url: string,
  jmena: { jmeno: string; vyznam: string; zeme?: string }[],
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'DefinedTermSet',
    name: nazev,
    url,
    inLanguage: WEB.jazyk,
    hasDefinedTerm: jmena.slice(0, 60).map(j => ({
      '@type': 'DefinedTerm',
      name: j.jmeno,
      description: j.vyznam,
      inDefinedTermSet: url,
    })),
  }
}

/** Otázky a odpovědi z konkrétní stránky — text je i viditelný. */
export function jsonLdOdpovedi(odpovedi: Odpoved[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    inLanguage: WEB.jazyk,
    mainEntity: odpovedi.map(d => ({
      '@type': 'Question',
      name: d.otazka,
      acceptedAnswer: { '@type': 'Answer', text: d.odpoved },
    })),
  }
}

/** Postup, jak jméno vybrat. Modely mají rády očíslované kroky. */
export function jsonLdPostup() {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'Jak vybrat jméno, které sedí k celé rodině',
    inLanguage: WEB.jazyk,
    totalTime: 'PT5M',
    step: [
      { '@type': 'HowToStep', position: 1, name: 'Zadejte příjmení', text: 'Podle příjmení se spočítá souzvuk — přechod hlásek, rytmus slabik a rým.' },
      { '@type': 'HowToStep', position: 2, name: 'Doplňte jména v rodině', text: 'Jméno maminky, tatínka i sourozence. Jméno, které ladí s víc členy, dostane štítek.' },
      { '@type': 'HowToStep', position: 3, name: 'Přidejte měsíc narození', text: 'Jména se svátkem nebo sezónou v daném měsíci se posunou nahoru.' },
      { '@type': 'HowToStep', position: 4, name: 'Zvolte styl a zemi', text: 'Tradiční, přírodní, mytologická či moderní jména; inspirace z 25 zemí.' },
      { '@type': 'HowToStep', position: 5, name: 'Projděte výsledky', text: 'Jména jsou seřazená podle shody a u každého je vysvětlení, proč sedí.' },
    ],
  }
}
