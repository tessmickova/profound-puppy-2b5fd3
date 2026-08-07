// Údaje, které se opakují v podmínkách a v ochraně osobních údajů.
// Držíme je na jednom místě, ať se nikde nerozejdou.

export const PRAVNI = {
  provozovatel: process.env.NEXT_PUBLIC_PROVOZOVATEL ?? 'Svět jmen',
  ico: process.env.NEXT_PUBLIC_ICO ?? '',
  email: process.env.NEXT_PUBLIC_KONTAKT ?? 'info@jmenaprodeti.cz',
  emailReklama: process.env.NEXT_PUBLIC_KONTAKT_REKLAMA ?? 'reklama@jmenaprodeti.cz',
  platnostOd: '1. 9. 2026',
}

/** Adresa samoobsluhy reklamní služby. Prázdná = služba ještě neběží. */
export const ADRESA_REKLAM = process.env.NEXT_PUBLIC_ADS_API ?? ''
