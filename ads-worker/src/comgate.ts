// Platební brána ComGate — protokol Payments API 1.0.
//
// Proč vlastní soubor: tohle je jediné místo, kde služba mluví s cizím
// serverem o penězích. Když je stranou, dá se otestovat bez Workeru (`fetch`
// se podstrčí parametrem) a je na jednom místě vidět, co všechno se ven
// posílá — a co se odtud nikdy nesmí dostat do logu.
//
// Pravidlo, které tenhle soubor drží: `secret` se nikdy nedostane do
// `console.log`, do odpovědi ani do chybové hlášky. Do logu jde vždycky jen
// `code`, `message` a `transId`.

/** Založení platby. Odpověď je urlencoded, ne JSON. */
const ADRESA_ZALOZENI = 'https://payments.comgate.cz/v1.0/create'

/** Dotaz na stav už založené platby — poslední slovo má vždycky brána. */
const ADRESA_STAVU = 'https://payments.comgate.cz/v1.0/status'

/** Měna, ve které prodáváme. Ceník je v korunách, jiná měna se neposílá. */
const MENA = 'CZK'

/** Kolik znaků odpovědi jsme ochotni přečíst — brána posílá pár set bajtů. */
const MAX_ODPOVED = 8 * 1024

/** Jak dlouho čekáme na bránu, než to vzdáme a nabídneme převod. */
const LIMIT_MS = 8000

export interface NastaveniBrany {
  /** identifikátor obchodníka u ComGate */
  merchant: string
  /** tajemství obchodníka — nikdy do logu ani do odpovědi */
  secret: string
  /** true = testovací provoz brány, penězi se nehne */
  test: boolean
}

export interface PozadavekPlatby {
  /** cena v haléřích — brána počítá v nejmenší jednotce měny, celé číslo */
  cenaHaleru: number
  /** krátký popis, který zákazník uvidí u platby */
  label: string
  /** naše id objednávky; vrátí se nám v notifikaci jako `refId` */
  refId: string
  email: string
}

export type VysledekZalozeni =
  | { ok: true; transId: string; redirect: string }
  | { ok: false; kod: string; zprava: string }

export type VysledekStavu =
  | { ok: true; status: string; cenaHaleru: number; mena: string }
  | { ok: false; kod: string; zprava: string }

/** Stavy platby, které protokol zná. */
export type StavPlatby = 'PAID' | 'CANCELLED' | 'PENDING'

/**
 * Rozebere odpověď brány. Není to JSON, ale urlencoded tělo
 * (`code=0&message=OK&transId=…&redirect=…`).
 *
 * Ruční rozdělování podle `&` a `=` by pohořelo na procentovém kódování
 * a na plusu v hodnotě — `redirect` je celá URL s parametry. `URLSearchParams`
 * to umí správně, tak to necháme na něm.
 */
export function rozeberOdpoved(telo: string): Record<string, string> {
  const mapa: Record<string, string> = {}
  // Brána občas přidá zalomení řádku; `URLSearchParams` by z něj udělalo
  // součást poslední hodnoty.
  for (const [klic, hodnota] of new URLSearchParams(telo.trim())) {
    mapa[klic] = hodnota.trim()
  }
  return mapa
}

/**
 * Porovnání dvou tajemství v konstantním čase.
 *
 * Obyčejné `===` skončí na prvním rozdílném znaku, a doba odpovědi tak
 * prozradí, kolik znaků útočník uhodl. Používá to jak ověření notifikace,
 * tak admin token — proto je funkce jedna a exportovaná.
 */
export function stejneTajemstvi(dane: string, ocekavane: string): boolean {
  if (!ocekavane) return false
  if (dane.length !== ocekavane.length) return false
  let rozdil = 0
  for (let i = 0; i < dane.length; i++) rozdil |= dane.charCodeAt(i) ^ ocekavane.charCodeAt(i)
  return rozdil === 0
}

/** Společné odeslání na bránu. Vrací syrové tělo, nebo hodí chybu. */
async function posliNaBranu(
  adresa: string, telo: URLSearchParams, posli: typeof fetch,
): Promise<string> {
  const stopka = new AbortController()
  const casovac = setTimeout(() => stopka.abort(), LIMIT_MS)
  try {
    const odpoved = await posli(adresa, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: telo.toString(),
      signal: stopka.signal,
    })
    // Stavový kód sám o sobě nic neříká — protokol nese výsledek v těle.
    const surove = await odpoved.text()
    return surove.slice(0, MAX_ODPOVED)
  } finally {
    clearTimeout(casovac)
  }
}

/**
 * Založí platbu a vrátí adresu brány, kam se zákazník pošle.
 *
 * `prepareOnly=true` znamená, že platbu jen připravíme a zákazníka na ni
 * přesměrujeme sami — brána nám vrátí `redirect` místo toho, aby si tok
 * řídila po svém.
 */
export async function vytvorPlatbu(
  nastaveni: NastaveniBrany,
  pozadavek: PozadavekPlatby,
  posli: typeof fetch = fetch,
): Promise<VysledekZalozeni> {
  const telo = new URLSearchParams({
    merchant: nastaveni.merchant,
    secret: nastaveni.secret,
    // Celé číslo v haléřích. Desetinné místo by brána odmítla.
    price: String(Math.round(pozadavek.cenaHaleru)),
    curr: MENA,
    label: pozadavek.label,
    refId: pozadavek.refId,
    // ALL = zákazník si způsob platby vybere až v bráně.
    method: 'ALL',
    email: pozadavek.email,
    prepareOnly: 'true',
    test: nastaveni.test ? 'true' : 'false',
  })

  const surove = await posliNaBranu(ADRESA_ZALOZENI, telo, posli)
  const odpoved = rozeberOdpoved(surove)

  if (odpoved.code !== '0') {
    return { ok: false, kod: odpoved.code ?? 'bez-kodu', zprava: odpoved.message ?? '' }
  }
  if (!odpoved.redirect || !odpoved.transId) {
    return { ok: false, kod: '0', zprava: 'brána vrátila OK bez adresy platby' }
  }
  return { ok: true, transId: odpoved.transId, redirect: odpoved.redirect }
}

/**
 * Zeptá se brány, jak platba dopadla.
 *
 * Používá se jen jako doplněk k notifikaci (třeba na návratové stránce);
 * autoritou zůstává notifikace, protože ta chodí i tehdy, když se zákazník
 * z brány nikdy nevrátí.
 */
export async function overStav(
  nastaveni: NastaveniBrany,
  transId: string,
  posli: typeof fetch = fetch,
): Promise<VysledekStavu> {
  const telo = new URLSearchParams({
    merchant: nastaveni.merchant,
    secret: nastaveni.secret,
    transId,
  })

  const surove = await posliNaBranu(ADRESA_STAVU, telo, posli)
  const odpoved = rozeberOdpoved(surove)

  if (odpoved.code !== '0') {
    return { ok: false, kod: odpoved.code ?? 'bez-kodu', zprava: odpoved.message ?? '' }
  }
  return {
    ok: true,
    status: odpoved.status ?? '',
    cenaHaleru: Number(odpoved.price ?? '0'),
    mena: odpoved.curr ?? '',
  }
}

// ── notifikace (server → server) ─────────────────────────────────────────

/** Pole, která brána posílá v notifikaci o platbě. */
export interface ZpravaOPlatbe {
  merchant: string
  test: string
  price: string
  curr: string
  label: string
  refId: string
  method: string
  email: string
  transId: string
  secret: string
  status: string
}

/** Notifikace přichází jako urlencoded tělo POSTu, ne jako JSON. */
export function rozeberNotifikaci(telo: string): ZpravaOPlatbe {
  const p = rozeberOdpoved(telo)
  const pole = (klic: string) => p[klic] ?? ''
  return {
    merchant: pole('merchant'),
    test: pole('test'),
    price: pole('price'),
    curr: pole('curr'),
    label: pole('label'),
    refId: pole('refId'),
    method: pole('method'),
    email: pole('email'),
    transId: pole('transId'),
    secret: pole('secret'),
    status: pole('status'),
  }
}

/** To málo z objednávky, co potřebuje ověření notifikace. */
export interface ObjednavkaKPlatbe {
  id: string
  /** cena v korunách bez DPH, tak jak ji objednávka nese */
  cena_kc: number
  stav: string
  transakce_id: string | null
}

export type VysledekNotifikace =
  | { ok: false; duvod: string }
  | { ok: true; aktivovat: boolean; duvod: string }

/**
 * Rozhodne, co s došlou notifikací.
 *
 * Je to čistá funkce schválně: o penězích se rozhoduje podle pravidel, které
 * jde přečíst i otestovat bez databáze a bez sítě. Notifikaci pouštíme dál
 * jen tehdy, když sedí tajemství, obchodník, měna, částka i objednávka —
 * cokoli jiného je buď podvrh, nebo naše chyba, a v obou případech se
 * nesmí nic aktivovat.
 *
 * Pozor: `ok: false` neznamená „odpověz chybou". Bráně se odpovídá vždycky
 * `code=0`, jinak notifikaci opakuje donekonečna; `ok: false` znamená
 * „nic nedělej a zapiš to do logu".
 */
export function overNotifikaci(
  zprava: ZpravaOPlatbe,
  nastaveni: NastaveniBrany,
  objednavka: ObjednavkaKPlatbe | null,
): VysledekNotifikace {
  // Tajemství první — bez něj je zbytek zprávy jen text od cizího člověka.
  if (!stejneTajemstvi(zprava.secret, nastaveni.secret)) {
    return { ok: false, duvod: 'nesedí tajemství brány' }
  }
  if (zprava.merchant && zprava.merchant !== nastaveni.merchant) {
    return { ok: false, duvod: 'notifikace patří jinému obchodníkovi' }
  }
  // `refId` je naše id objednávky. Cizí nebo vymyšlené id neaktivuje nic.
  if (!objednavka) return { ok: false, duvod: 'k refId žádná objednávka není' }
  if (zprava.curr !== MENA) return { ok: false, duvod: `jiná měna než ${MENA}` }

  const ocekavanoHaleru = objednavka.cena_kc * 100
  const zaplacenoHaleru = Number(zprava.price)
  if (!Number.isFinite(zaplacenoHaleru) || zaplacenoHaleru !== ocekavanoHaleru) {
    // Nesouhlasící částka je vážná věc: buď se zákazník pokusil zaplatit
    // méně, nebo se změnil ceník mezi objednávkou a platbou. Ani jedno
    // nesmí kampaň rozsvítit, obojí patří majitelce na stůl.
    return { ok: false, duvod: 'nesouhlasí částka' }
  }

  if (zprava.status !== 'PAID') {
    // CANCELLED i PENDING necháváme být: objednávka dál čeká na platbu
    // a po sedmi dnech ji smete běžný úklid.
    return { ok: true, aktivovat: false, duvod: `platba je ve stavu ${zprava.status}` }
  }

  // Brána notifikaci opakuje, dokud nedostane `code=0&message=OK`. Podruhé
  // už není co aktivovat — objednávka je zaplacená a slot běží.
  if (objednavka.transakce_id && objednavka.transakce_id === zprava.transId
    && objednavka.stav !== 'ceka_na_platbu') {
    return { ok: true, aktivovat: false, duvod: 'tuhle platbu už máme zapsanou' }
  }
  if (objednavka.stav !== 'ceka_na_platbu') {
    return { ok: true, aktivovat: false, duvod: `objednávka je ve stavu ${objednavka.stav}` }
  }

  return { ok: true, aktivovat: true, duvod: 'zaplaceno' }
}

/**
 * Odpověď, kterou brána čeká. Cokoli jiného — i poctivá chybová stránka —
 * pro ni znamená „nedoručeno" a notifikaci pošle znovu.
 */
export function odpovedProBranu(): Response {
  return new Response('code=0&message=OK', {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
}
