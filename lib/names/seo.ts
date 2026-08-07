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
