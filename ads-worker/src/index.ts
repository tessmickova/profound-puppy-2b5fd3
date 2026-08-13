// Reklamní služba Světa jmen.
//
// Běží úplně samostatně, mimo web se jmény. Když tahle služba spadne,
// web si toho všimne jen tím, že se nedočká odpovědi — reklamní plochy
// se schovají a obsah jede dál.
//
// Routy:
//   GET  /                          samoobsluha pro firmy
//   GET  /api/sloty                 volné plochy a ceník
//   GET  /api/reklamy?plocha=…      kreativy pro plochu (volá web)
//   GET  /api/reklamy-vse            kreativy pro všechny plochy najednou
//   POST /api/objednavka            vytvoření objednávky + inzerátu
//   GET  /api/objednavka/:token     stav objednávky
//   POST /api/objednavka/:token/logo  nahrání loga
//   GET  /logo/:klic                logo inzerenta
//   POST /api/admin/…               potvrzení platby a přehled (jen s tokenem)

import {
  dnesISO, inzeratyProPlochu, inzeratyVsech, novyId, novyVs, objednavkaPodleTokenu,
  smazStareLimity,
  obsazenost, platiDo, zhasniProsle, zrusNezaplacene,
  type Prostredi,
} from './db'
import {
  IKONY, KAPACITA, MEZE, OBDOBI, OBDOBI_PODLE_ID, PLOCHY, cena, jeObdobi,
  kapacitaPlochy, plochaPodleId, type ObdobiId,
} from './plochy'
import { samoobsluha } from './samoobsluha'

const MAX_LOGO = 200 * 1024
const POVOLENE_TYPY_LOGA = ['image/png', 'image/jpeg', 'image/webp']


/**
 * Přečte skutečný typ a rozměry obrázku z jeho hlavičky.
 * Vrací null, když to není PNG, JPEG ani WEBP — přípona ani ohlášený
 * Content-Type nás nezajímají, ty si může poslat kdokoli jaké chce.
 */
function rozeberObrazek(b: Uint8Array): { typ: string; sirka: number; vyska: number } | null {
  const be32 = (i: number) => ((b[i] << 24) | (b[i + 1] << 16) | (b[i + 2] << 8) | b[i + 3]) >>> 0
  const le16 = (i: number) => b[i] | (b[i + 1] << 8)

  // PNG: signatura a hned za ní hlavička IHDR se šířkou a výškou.
  if (b.length > 24
    && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47
    && b[4] === 0x0d && b[5] === 0x0a && b[6] === 0x1a && b[7] === 0x0a
    && b[12] === 0x49 && b[13] === 0x48 && b[14] === 0x44 && b[15] === 0x52) {
    return { typ: 'image/png', sirka: be32(16), vyska: be32(20) }
  }

  // JPEG: začíná SOI a rozměry jsou v některém ze značkovačů SOFn.
  if (b.length > 4 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) {
    let i = 2
    while (i + 9 < b.length) {
      if (b[i] !== 0xff) { i++; continue }
      const znacka = b[i + 1]
      if (znacka === 0xd8 || znacka === 0x01 || (znacka >= 0xd0 && znacka <= 0xd7)) { i += 2; continue }
      const delkaBloku = (b[i + 2] << 8) | b[i + 3]
      if (delkaBloku < 2) return null
      const jeSof = znacka >= 0xc0 && znacka <= 0xcf
        && znacka !== 0xc4 && znacka !== 0xc8 && znacka !== 0xcc
      if (jeSof) {
        return {
          typ: 'image/jpeg',
          vyska: (b[i + 5] << 8) | b[i + 6],
          sirka: (b[i + 7] << 8) | b[i + 8],
        }
      }
      i += 2 + delkaBloku
    }
    return null
  }

  // WEBP: kontejner RIFF, uvnitř VP8 / VP8L / VP8X.
  if (b.length > 30
    && b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46
    && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50) {
    const druh = String.fromCharCode(b[12], b[13], b[14], b[15])
    if (druh === 'VP8X') {
      return {
        typ: 'image/webp',
        sirka: 1 + (b[24] | (b[25] << 8) | (b[26] << 16)),
        vyska: 1 + (b[27] | (b[28] << 8) | (b[29] << 16)),
      }
    }
    if (druh === 'VP8 ') {
      return { typ: 'image/webp', sirka: le16(26) & 0x3fff, vyska: le16(28) & 0x3fff }
    }
    if (druh === 'VP8L' && b[20] === 0x2f) {
      const bity = b[21] | (b[22] << 8) | (b[23] << 16) | (b[24] << 24)
      return { typ: 'image/webp', sirka: (bity & 0x3fff) + 1, vyska: ((bity >> 14) & 0x3fff) + 1 }
    }
    return null
  }

  return null
}

/**
 * Jednoduchý strop na počet zápisů z jedné adresy.
 *
 * Sídlí v D1, protože jinou sdílenou paměť služba nemá. Okno je hodina,
 * počítadlo se zvyšuje atomicky přes UPSERT — souběžné požadavky se tedy
 * nepřepíšou. IP adresu neukládáme v čitelné podobě, jen její otisk.
 */
async function prekrocenLimit(
  req: Request, env: Prostredi, akce: string, strop: number,
): Promise<boolean> {
  const ip = req.headers.get('CF-Connecting-IP') ?? req.headers.get('X-Forwarded-For') ?? 'neznama'
  const okno = Math.floor(Date.now() / 3_600_000)
  const klic = `${akce}:${okno}:${await otisk(ip)}`
  try {
    const radek = await env.DB.prepare(
      `INSERT INTO limity (klic, pocet, okno) VALUES (?1, 1, ?2)
       ON CONFLICT(klic) DO UPDATE SET pocet = pocet + 1
       RETURNING pocet`,
    ).bind(klic, okno).first<{ pocet: number }>()
    return (radek?.pocet ?? 0) > strop
  } catch (e) {
    // Když tabulka chybí (stará databáze), radši pustíme dál než abychom
    // shodili objednávky. Nedostatek se pozná v logu.
    console.error('limit se nepodařilo změřit', e)
    return false
  }
}

/** Hlavičky, které přidáváme ke každé odpovědi služby. */
const BEZPECNOSTNI_HLAVICKY: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Frame-Options': 'DENY',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains',
}

// ── pomocníci ────────────────────────────────────────────────────────────

function originy(env: Prostredi): string[] {
  return (env.POVOLENE_ORIGINY ?? '').split(',').map(s => s.trim()).filter(Boolean)
}

function hlavickyCors(req: Request, env: Prostredi): Record<string, string> {
  const origin = req.headers.get('Origin')
  if (origin && originy(env).includes(origin)) {
    return {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
      // Authorization kvůli stránce /admin na webu — posílá Bearer token.
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Vary': 'Origin',
    }
  }
  return { Vary: 'Origin' }
}

const json = (data: unknown, init: ResponseInit = {}, cors: Record<string, string> = {}) =>
  new Response(JSON.stringify(data), {
    ...init,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...cors, ...(init.headers ?? {}) },
  })

const chyba = (zprava: string, stav = 400, cors: Record<string, string> = {}) =>
  json({ chyba: zprava }, { status: stav }, cors)

/** Ořízne a ohlídá délku textu z formuláře. */
/**
 * Text z formuláře. Kromě délky řeší tři věci, na kterých se dá pohořet:
 * sjednotí Unicode (NFC), vyhodí řídicí znaky včetně CR a LF — ty by se daly
 * použít na podvržení hlavičky, když text někam doputuje do e-mailu — a
 * odstraní znaky pro obracení směru písma, kterými jde vizuálně zamaskovat
 * skutečný obsah. Délku měříme až po očištění.
 */
function text(hodnota: unknown, max: number): string {
  if (typeof hodnota !== 'string') return ''
  // Osamocené půlky náhradních párů nejsou platný text. `normalize` je
  // nevyhodí — musíme si na ně posvítit sami, jinak by prošly až do
  // databáze a odtud do JSON odpovědi.
  if (/[\ud800-\udbff](?![\udc00-\udfff])|(?<![\ud800-\udbff])[\udc00-\udfff]/.test(hodnota)) {
    return ''
  }
  let t: string
  try {
    t = hodnota.normalize('NFC')
  } catch {
    return ''
  }
  t = t
    // řídicí znaky C0 i C1 (včetně \r a \n) a znaky pro obracení směru písma
    .replace(/[\u0000-\u001f\u007f-\u009f\u202a-\u202e\u2066-\u2069]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return [...t].slice(0, max).join('')
}

/**
 * Odkaz inzerenta. Pustíme jen http(s) — `javascript:`, `data:`, `file:`,
 * `blob:` a spol. by z reklamy udělaly nástroj útoku. Zároveň odmítneme
 * adresy s přihlašovacími údaji (`https://user:heslo@…`), kterými jde
 * návštěvníka zmást, a adresy bez skutečného hostitele.
 */
function odkazOk(url: string): boolean {
  let u: URL
  try {
    u = new URL(url)
  } catch {
    return false
  }
  if (u.protocol !== 'https:' && u.protocol !== 'http:') return false
  if (u.username || u.password) return false
  if (!u.hostname || !u.hostname.includes('.')) return false
  return true
}

const emailOk = (e: string) =>
  e.length <= 120 && /^[^\s@,;:<>"']+@[^\s@,;:<>"']+\.[a-zA-Z]{2,}$/.test(e)

/** Největší tělo objednávky, které jsme ochotni přečíst. */
const MAX_TELO = 16 * 1024

/** Krátký otisk textu — slouží jen jako klíč idempotence, ne jako tajemství. */
async function otisk(vstup: string): Promise<string> {
  const data = new TextEncoder().encode(vstup)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return [...new Uint8Array(hash)].slice(0, 16)
    .map(b => b.toString(16).padStart(2, '0')).join('')
}

function jeAdmin(req: Request, env: Prostredi): boolean {
  const ocekavano = env.ADMIN_TOKEN
  if (!ocekavano) return false
  const hlavicka = req.headers.get('Authorization') ?? ''
  const dany = hlavicka.replace(/^Bearer\s+/i, '')
  if (dany.length !== ocekavano.length) return false
  // Porovnání v konstantním čase, ať se token nedá uhodnout po znacích.
  let rozdil = 0
  for (let i = 0; i < dany.length; i++) rozdil |= dany.charCodeAt(i) ^ ocekavano.charCodeAt(i)
  return rozdil === 0
}

// ── čtení pro web ────────────────────────────────────────────────────────

async function dejReklamy(url: URL, env: Prostredi, cors: Record<string, string>) {
  const plocha = url.searchParams.get('plocha') ?? ''
  if (!plochaPodleId(plocha)) return chyba('Neznámá plocha.', 404, cors)

  const radky = await inzeratyProPlochu(env, plocha)
  const zaklad = `${url.origin}/logo/`
  const inzeraty = radky.map(r => ({
    id: r.id,
    znacka: r.znacka,
    nadpis: r.nadpis,
    text: r.text,
    cta: r.cta,
    odkaz: r.odkaz,
    ikona: r.logo_klic ? null : (r.ikona ?? 'sparkles'),
    logo: r.logo_klic ? zaklad + r.logo_klic : null,
  }))

  return json({ plocha, inzeraty }, {
    // Krátká cache stačí: kampaň se rozsvítí nejpozději za pět minut.
    headers: { 'Cache-Control': 'public, max-age=300' },
  }, cors)
}

/**
 * Všechny plochy jedním dotazem. Web má dvacet ploch a ptát se dvacetkrát by
 * bylo zbytečně drahé — tohle je jeden dotaz do databáze a jedna odpověď.
 */
async function dejVsechnyReklamy(url: URL, env: Prostredi, cors: Record<string, string>) {
  const zaklad = `${url.origin}/logo/`
  const vse = await inzeratyVsech(env)
  const plochy: Record<string, unknown[]> = {}
  for (const p of PLOCHY) {
    plochy[p.id] = (vse[p.id] ?? []).map(r => ({
      id: r.id,
      znacka: r.znacka,
      nadpis: r.nadpis,
      text: r.text,
      cta: r.cta,
      odkaz: r.odkaz,
      ikona: r.logo_klic ? null : (r.ikona ?? 'sparkles'),
      logo: r.logo_klic ? zaklad + r.logo_klic : null,
    }))
  }
  return json({ plochy }, {
    headers: { 'Cache-Control': 'public, max-age=300' },
  }, cors)
}

async function dejSloty(env: Prostredi, cors: Record<string, string>) {
  const obsazeno = await obsazenost(env)
  return json({
    kapacita: KAPACITA,
    obdobi: OBDOBI.map(o => ({ id: o.id, nazev: o.nazev, dnu: o.dnu })),
    ikony: IKONY,
    plochy: PLOCHY.map(p => ({
      id: p.id,
      nazev: p.nazev,
      stranka: p.stranka,
      cislo: p.cislo,
      kapacita: kapacitaPlochy(p),
      volno: Math.max(0, kapacitaPlochy(p) - (obsazeno[p.id] ?? 0)),
      ceny: Object.fromEntries(OBDOBI.map(o => [o.id, cena(p, o.id)])),
    })),
  }, {}, cors)
}

// ── objednávka ───────────────────────────────────────────────────────────

interface ZalozenaObjednavka {
  token: string
  plocha: string
  obdobi: string
  cena_kc: number
  vs: string
}

/** Objednávka založená dřív týmž klíčem — pro opakované odeslání formuláře. */
async function najdiPodleIdempotence(env: Prostredi, klic: string) {
  return env.DB.prepare(
    'SELECT token, plocha, obdobi, cena_kc, vs FROM objednavky WHERE idempotence = ?1',
  ).bind(klic).first<ZalozenaObjednavka>()
}

/** Odpověď na založenou objednávku. Stejná poprvé i při opakování. */
function odpovedNaObjednavku(
  o: ZalozenaObjednavka, env: Prostredi, cors: Record<string, string>,
) {
  const plocha = plochaPodleId(o.plocha)
  return json({
    token: o.token,
    stav: 'ceka_na_platbu',
    plocha: plocha?.nazev ?? o.plocha,
    obdobi: OBDOBI_PODLE_ID[o.obdobi as ObdobiId]?.nazev ?? o.obdobi,
    cena_kc: o.cena_kc,
    platba: {
      ucet: env.BANKOVNI_UCET,
      vs: o.vs,
      prijemce: env.PROVOZOVATEL,
      zprava: `Reklama ${o.plocha}`,
    },
    kontakt: env.PROVOZOVATEL_EMAIL,
  }, {}, cors)
}

async function vytvorObjednavku(req: Request, env: Prostredi, cors: Record<string, string>) {
  // Formulář má pár set znaků; cokoli většího je pokus o zahlcení.
  const delka = Number(req.headers.get('Content-Length') ?? '0')
  if (delka > MAX_TELO) return chyba('Data formuláře jsou příliš velká.', 413, cors)

  let telo: Record<string, unknown>
  try {
    const surove = await req.text()
    if (surove.length > MAX_TELO) return chyba('Data formuláře jsou příliš velká.', 413, cors)
    const rozbalene: unknown = JSON.parse(surove)
    if (!rozbalene || typeof rozbalene !== 'object' || Array.isArray(rozbalene)) {
      return chyba('Nečitelná data formuláře.', 400, cors)
    }
    telo = rozbalene as Record<string, unknown>
  } catch {
    return chyba('Nečitelná data formuláře.', 400, cors)
  }

  const plocha = plochaPodleId(text(telo.plocha, 40))
  if (!plocha) return chyba('Vyberte prosím plochu ze seznamu.', 400, cors)

  const obdobi = text(telo.obdobi, 10)
  if (!jeObdobi(obdobi)) return chyba('Vyberte délku kampaně.', 400, cors)

  const firma = text(telo.firma, MEZE.firma)
  const email = text(telo.email, MEZE.email)
  const ico = text(telo.ico, MEZE.ico).replace(/\s/g, '')
  const znacka = text(telo.znacka, MEZE.znacka)
  const nadpis = text(telo.nadpis, MEZE.nadpis)
  const popis = text(telo.text, MEZE.text)
  const cta = text(telo.cta, MEZE.cta)
  const odkaz = text(telo.odkaz, MEZE.odkaz)
  const ikona = text(telo.ikona, 20) || 'sparkles'

  if (firma.length < 2) return chyba('Vyplňte název firmy.', 400, cors)
  if (!emailOk(email)) return chyba('Vyplňte platný e-mail.', 400, cors)
  if (ico && !/^\d{8}$/.test(ico)) return chyba('IČO má osm číslic.', 400, cors)
  if (znacka.length < 2) return chyba('Vyplňte jméno značky, které se u inzerátu ukáže.', 400, cors)
  if (nadpis.length < 6) return chyba('Nadpis je moc krátký.', 400, cors)
  if (popis.length < 20) return chyba('Text inzerátu je moc krátký.', 400, cors)
  if (cta.length < 3) return chyba('Vyplňte text tlačítka.', 400, cors)
  if (!odkazOk(odkaz)) return chyba('Odkaz musí být běžná adresa začínající http:// nebo https://', 400, cors)
  if (!(IKONY as readonly string[]).includes(ikona)) return chyba('Neznámá ikona.', 400, cors)
  if (telo.souhlas !== true) return chyba('Bez souhlasu s podmínkami to nejde odeslat.', 400, cors)

  // Klíč idempotence: dvojklik ani obnovení stránky nesmí založit dvě
  // objednávky. Když ho klient nepošle, odvodíme ho z toho, co objednává —
  // stejná firma, stejná plocha, stejné období = stejná objednávka.
  const zHlavicky = text(req.headers.get('Idempotency-Key'), 64)
  const klicIdempotence = zHlavicky || (await otisk([email, plocha.id, obdobi, nadpis].join('|')))

  const jizJe = await najdiPodleIdempotence(env, klicIdempotence)
  if (jizJe) return odpovedNaObjednavku(jizJe, env, cors)

  // Rychlá kontrola, ať zákazník dostane hezkou hlášku místo chyby databáze.
  // O skutečnou výlučnost se stará unikátní index — mezi tímhle čtením
  // a zápisem se totiž může vklínit jiná objednávka.
  const obsazeno = await obsazenost(env)
  if ((obsazeno[plocha.id] ?? 0) >= kapacitaPlochy(plocha)) {
    return chyba('Tahle plocha je právě obsazená. Vyberte prosím jinou.', 409, cors)
  }

  const ted = new Date().toISOString()
  const inzerentId = novyId()
  const objednavkaId = novyId()
  const inzeratId = novyId()
  const token = novyId(24)
  const vs = novyVs()
  const castka = cena(plocha, obdobi)

  try {
    // D1 dávku provede v jedné transakci: buď projde všechno, nebo nic.
    // Unikátní index `idx_objednavky_zivy_slot` zaručí, že plochu dostane
    // jen jedna z případných souběžných objednávek.
    await env.DB.batch([
      env.DB.prepare(
        'INSERT INTO inzerenti (id, firma, ico, email, vytvoreno) VALUES (?1, ?2, ?3, ?4, ?5)',
      ).bind(inzerentId, firma, ico || null, email, ted),
      env.DB.prepare(
        `INSERT INTO objednavky (id, inzerent_id, plocha, obdobi, cena_kc, vs, stav, token, idempotence, vytvoreno)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, 'ceka_na_platbu', ?7, ?8, ?9)`,
      ).bind(objednavkaId, inzerentId, plocha.id, obdobi, castka, vs, token, klicIdempotence, ted),
      env.DB.prepare(
        `INSERT INTO inzeraty (id, objednavka_id, znacka, nadpis, text, cta, odkaz, ikona)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)`,
      ).bind(inzeratId, objednavkaId, znacka, nadpis, popis, cta, odkaz, ikona),
    ])
  } catch (e) {
    const zprava = e instanceof Error ? e.message : ''
    // Druhá objednávka na stejnou plochu narazí na unikátní index.
    if (/idx_objednavky_zivy_slot|UNIQUE/i.test(zprava)) {
      const znovu = await najdiPodleIdempotence(env, klicIdempotence)
      if (znovu) return odpovedNaObjednavku(znovu, env, cors)
      return chyba('Tahle plocha je právě obsazená. Vyberte prosím jinou.', 409, cors)
    }
    // Ven jde jen obecná hláška — podrobnosti zůstávají v logu služby.
    console.error('objednávka selhala', e)
    return chyba('Objednávku se nepodařilo uložit. Zkuste to prosím znovu.', 500, cors)
  }

  return odpovedNaObjednavku(
    { token, plocha: plocha.id, obdobi, cena_kc: castka, vs }, env, cors,
  )
}

async function dejObjednavku(token: string, env: Prostredi, url: URL, cors: Record<string, string>) {
  const o = await objednavkaPodleTokenu(env, token)
  if (!o) return chyba('Objednávku neznáme.', 404, cors)

  const i = await env.DB.prepare('SELECT * FROM inzeraty WHERE objednavka_id = ?1')
    .bind(o.id).first<{ znacka: string; nadpis: string; text: string; cta: string; odkaz: string; ikona: string | null; logo_klic: string | null }>()

  return json({
    stav: o.stav,
    plocha: plochaPodleId(o.plocha)?.nazev ?? o.plocha,
    obdobi: OBDOBI_PODLE_ID[o.obdobi as ObdobiId]?.nazev ?? o.obdobi,
    cena_kc: o.cena_kc,
    vs: o.vs,
    plati_od: o.plati_od,
    plati_do: o.plati_do,
    platba: {
      ucet: env.BANKOVNI_UCET,
      vs: o.vs,
      prijemce: env.PROVOZOVATEL,
      zprava: `Reklama ${o.plocha}`,
    },
    kontakt: env.PROVOZOVATEL_EMAIL,
    inzerat: i ? {
      znacka: i.znacka, nadpis: i.nadpis, text: i.text, cta: i.cta, odkaz: i.odkaz,
      ikona: i.logo_klic ? null : i.ikona,
      logo: i.logo_klic ? `${url.origin}/logo/${i.logo_klic}` : null,
    } : null,
  }, {}, cors)
}

async function nahrajLogo(req: Request, token: string, env: Prostredi, cors: Record<string, string>) {
  const o = await objednavkaPodleTokenu(env, token)
  if (!o) return chyba('Objednávku neznáme.', 404, cors)
  if (o.stav === 'zrusena' || o.stav === 'vyprsela') return chyba('Kampaň už neběží.', 409, cors)

  const ohlaseny = (req.headers.get('Content-Type') ?? '').split(';')[0].trim()
  if (!POVOLENE_TYPY_LOGA.includes(ohlaseny)) {
    return chyba('Logo pošlete jako PNG, JPG nebo WEBP.', 415, cors)
  }

  const ohlasenaDelka = Number(req.headers.get('Content-Length') ?? '0')
  if (ohlasenaDelka > MAX_LOGO) return chyba('Logo smí mít nejvýš 200 kB.', 413, cors)

  const data = await req.arrayBuffer()
  if (data.byteLength === 0) return chyba('Prázdný soubor.', 400, cors)
  if (data.byteLength > MAX_LOGO) return chyba('Logo smí mít nejvýš 200 kB.', 413, cors)

  // Hlavičce Content-Type nevěříme: soubor si přečteme sami. Přejmenované
  // `.png`, HTML vydávané za obrázek ani SVG se dovnitř nedostanou.
  const rozbor = rozeberObrazek(new Uint8Array(data))
  if (!rozbor) return chyba('Tohle není platný PNG, JPG ani WEBP obrázek.', 415, cors)
  if (rozbor.typ !== ohlaseny) return chyba('Typ souboru neodpovídá jeho obsahu.', 415, cors)
  if (rozbor.sirka > MEZE.logoPx || rozbor.vyska > MEZE.logoPx) {
    return chyba('Logo smí mít nejvýš ' + MEZE.logoPx + ' × ' + MEZE.logoPx + ' bodů.', 413, cors)
  }

  const pripona = rozbor.typ === 'image/png' ? 'png' : rozbor.typ === 'image/webp' ? 'webp' : 'jpg'
  // Název tvoříme sami z id objednávky a náhody — jméno souboru od uživatele
  // se nikdy nedostane do cesty v úložišti.
  const klic = `${o.id}-${novyId(6)}.${pripona}`
  await env.LOGA.put(klic, data, { httpMetadata: { contentType: rozbor.typ } })

  const stare = await env.DB.prepare('SELECT logo_klic FROM inzeraty WHERE objednavka_id = ?1')
    .bind(o.id).first<{ logo_klic: string | null }>()
  await env.DB.prepare('UPDATE inzeraty SET logo_klic = ?1 WHERE objednavka_id = ?2')
    .bind(klic, o.id).run()
  if (stare?.logo_klic) await env.LOGA.delete(stare.logo_klic)

  return json({ logo: klic }, {}, cors)
}

async function dejLogo(klic: string, env: Prostredi) {
  const objekt = await env.LOGA.get(klic)
  if (!objekt) return new Response('Logo nenalezeno.', { status: 404 })
  return new Response(objekt.body, {
    headers: {
      'Content-Type': objekt.httpMetadata?.contentType ?? 'application/octet-stream',
      'Cache-Control': 'public, max-age=86400',
      'Content-Security-Policy': "default-src 'none'; sandbox",
      'X-Content-Type-Options': 'nosniff',
    },
  })
}

/**
 * Úprava textu běžící kampaně.
 *
 * Podmínky slibují, že text i odkaz jde během kampaně změnit; plocha ani
 * délka se měnit nedají — to by se obcházel ceník. Prochází stejnou
 * validací jako objednávka, protože vstup je stejně nedůvěryhodný.
 */
async function upravInzerat(
  req: Request, token: string, env: Prostredi, cors: Record<string, string>,
) {
  const o = await objednavkaPodleTokenu(env, token)
  if (!o) return chyba('Objednávku neznáme.', 404, cors)
  if (o.stav === 'zrusena' || o.stav === 'vyprsela') return chyba('Kampaň už neběží.', 409, cors)

  const delka = Number(req.headers.get('Content-Length') ?? '0')
  if (delka > MAX_TELO) return chyba('Data formuláře jsou příliš velká.', 413, cors)

  let telo: Record<string, unknown>
  try {
    const surove = await req.text()
    if (surove.length > MAX_TELO) return chyba('Data formuláře jsou příliš velká.', 413, cors)
    const rozbalene: unknown = JSON.parse(surove)
    if (!rozbalene || typeof rozbalene !== 'object' || Array.isArray(rozbalene)) {
      return chyba('Nečitelná data formuláře.', 400, cors)
    }
    telo = rozbalene as Record<string, unknown>
  } catch {
    return chyba('Nečitelná data formuláře.', 400, cors)
  }

  const znacka = text(telo.znacka, MEZE.znacka)
  const nadpis = text(telo.nadpis, MEZE.nadpis)
  const popis = text(telo.text, MEZE.text)
  const cta = text(telo.cta, MEZE.cta)
  const odkaz = text(telo.odkaz, MEZE.odkaz)

  if (znacka.length < 2) return chyba('Vyplňte jméno značky.', 400, cors)
  if (nadpis.length < 6) return chyba('Nadpis je moc krátký.', 400, cors)
  if (popis.length < 20) return chyba('Text inzerátu je moc krátký.', 400, cors)
  if (cta.length < 3) return chyba('Vyplňte text tlačítka.', 400, cors)
  if (!odkazOk(odkaz)) return chyba('Odkaz musí být běžná adresa začínající http:// nebo https://', 400, cors)

  await env.DB.prepare(
    `UPDATE inzeraty SET znacka = ?1, nadpis = ?2, text = ?3, cta = ?4, odkaz = ?5
      WHERE objednavka_id = ?6`,
  ).bind(znacka, nadpis, popis, cta, odkaz, o.id).run()

  return json({ ulozeno: true }, {}, cors)
}

// ── přepínače webu ───────────────────────────────────────────────────────
//
// Web je statický; tohle je jediné místo, kde jde funkci vypnout hned,
// bez nasazování. Klíče jsou pevný seznam — admin nemůže založit cizí
// a databáze se nezaplní smetím. Co není uložené, je zapnuté.

const PREPINACE = ['reklamy', 'vyber_panel', 'analyza_vyberu'] as const

async function dejNastaveni(env: Prostredi, cors: Record<string, string>) {
  const stav: Record<string, boolean> = Object.fromEntries(PREPINACE.map(k => [k, true]))
  try {
    const { results } = await env.DB.prepare('SELECT klic, hodnota FROM nastaveni').all<{ klic: string; hodnota: string }>()
    for (const r of results ?? []) {
      if ((PREPINACE as readonly string[]).includes(r.klic)) stav[r.klic] = r.hodnota !== '0'
    }
  } catch (e) {
    // Stará databáze bez tabulky — web pojede s výchozím „vše zapnuto".
    console.error('nastaveni se nepodarilo precist', e)
  }
  return json({ nastaveni: stav }, {
    // Minutová cache: vypnutí se projeví rychle a služba nedostává
    // dotaz od každého návštěvníka zvlášť.
    headers: { 'Cache-Control': 'public, max-age=60' },
  }, cors)
}

async function zapisNastaveni(req: Request, env: Prostredi, cors: Record<string, string>) {
  let telo: { klic?: unknown; hodnota?: unknown }
  try { telo = await req.json() } catch { return chyba('Nečitelná data.', 400, cors) }

  const klic = text(telo.klic, 40)
  if (!(PREPINACE as readonly string[]).includes(klic)) return chyba('Neznámý přepínač.', 400, cors)
  if (typeof telo.hodnota !== 'boolean') return chyba('Hodnota musí být ano/ne.', 400, cors)

  await env.DB.prepare(
    `INSERT INTO nastaveni (klic, hodnota, zmeneno) VALUES (?1, ?2, ?3)
     ON CONFLICT(klic) DO UPDATE SET hodnota = ?2, zmeneno = ?3`,
  ).bind(klic, telo.hodnota ? '1' : '0', new Date().toISOString()).run()

  return json({ ulozeno: true, klic, hodnota: telo.hodnota }, {}, cors)
}

// ── správa ───────────────────────────────────────────────────────────────

async function potvrdPlatbu(req: Request, env: Prostredi, cors: Record<string, string> = {}) {
  let telo: { vs?: string; od?: string }
  try { telo = await req.json() } catch { return chyba('Nečitelná data.', 400, cors) }

  const vs = text(telo.vs, 12)
  if (!vs) return chyba('Chybí variabilní symbol.', 400, cors)

  const o = await env.DB.prepare("SELECT * FROM objednavky WHERE vs = ?1 AND stav = 'ceka_na_platbu'")
    .bind(vs).first<{ id: string; obdobi: string }>()
  if (!o) return chyba('K tomuhle symbolu nečeká žádná objednávka.', 404, cors)

  const od = text(telo.od, 10) || dnesISO()
  const do_ = platiDo(od, o.obdobi as ObdobiId)
  await env.DB.prepare("UPDATE objednavky SET stav = 'aktivni', plati_od = ?1, plati_do = ?2 WHERE id = ?3")
    .bind(od, do_, o.id).run()

  return json({ stav: 'aktivni', plati_od: od, plati_do: do_ }, {}, cors)
}

async function prehled(env: Prostredi, cors: Record<string, string> = {}) {
  const { results } = await env.DB.prepare(
    `SELECT o.id, o.plocha, o.obdobi, o.cena_kc, o.vs, o.stav, o.plati_od, o.plati_do,
            n.firma, n.email, i.znacka, i.nadpis
       FROM objednavky o
       JOIN inzerenti n ON n.id = o.inzerent_id
       LEFT JOIN inzeraty i ON i.objednavka_id = o.id
      ORDER BY o.vytvoreno DESC
      LIMIT 200`,
  ).all()
  return json({ objednavky: results ?? [] }, {}, cors)
}

// ── router ───────────────────────────────────────────────────────────────

/** Router služby. Hlavičky doplňuje `fetch` níž, ať jsou u každé odpovědi. */
async function obsluz(req: Request, env: Prostredi): Promise<Response> {
    const url = new URL(req.url)
    const cesta = url.pathname.replace(/\/+$/, '') || '/'
    const cors = hlavickyCors(req, env)

    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors })

    try {
      if (req.method === 'GET' && cesta === '/') {
        return new Response(samoobsluha(env), {
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        })
      }

      if (req.method === 'GET' && cesta === '/api/reklamy') return dejReklamy(url, env, cors)
      if (req.method === 'GET' && cesta === '/api/reklamy-vse') return dejVsechnyReklamy(url, env, cors)
      if (req.method === 'GET' && cesta === '/api/sloty') return dejSloty(env, cors)
      if (req.method === 'GET' && cesta === '/api/nastaveni') return dejNastaveni(env, cors)
      if (req.method === 'POST' && cesta === '/api/objednavka') {
        if (await prekrocenLimit(req, env, 'objednavka', 10)) {
          return chyba('Příliš mnoho pokusů. Zkuste to prosím za hodinu.', 429, cors)
        }
        return vytvorObjednavku(req, env, cors)
      }

      const logo = cesta.match(/^\/api\/objednavka\/([a-z0-9]+)\/logo$/)
      if (req.method === 'POST' && logo) {
        if (await prekrocenLimit(req, env, 'logo', 20)) {
          return chyba('Příliš mnoho pokusů. Zkuste to prosím za hodinu.', 429, cors)
        }
        return nahrajLogo(req, logo[1], env, cors)
      }

      const stav = cesta.match(/^\/api\/objednavka\/([a-z0-9]+)$/)
      if (req.method === 'GET' && stav) return dejObjednavku(stav[1], env, url, cors)
      if (req.method === 'PATCH' && stav) {
        if (await prekrocenLimit(req, env, 'uprava', 30)) {
          return chyba('Příliš mnoho pokusů. Zkuste to prosím za hodinu.', 429, cors)
        }
        return upravInzerat(req, stav[1], env, cors)
      }

      const souborLoga = cesta.match(/^\/logo\/([a-z0-9-]+\.(?:png|jpg|webp))$/)
      if (req.method === 'GET' && souborLoga) return dejLogo(souborLoga[1], env)

      if (cesta.startsWith('/api/admin/')) {
        // Admin volá i stránka /admin na webu — potřebuje CORS jako ostatní.
        if (!jeAdmin(req, env)) return chyba('Nemáte oprávnění.', 401, cors)
        if (req.method === 'GET' && cesta === '/api/admin/overeni') return json({ ok: true }, {}, cors)
        if (req.method === 'POST' && cesta === '/api/admin/potvrdit') return potvrdPlatbu(req, env, cors)
        if (req.method === 'GET' && cesta === '/api/admin/prehled') return prehled(env, cors)
        if (req.method === 'POST' && cesta === '/api/admin/nastaveni') return zapisNastaveni(req, env, cors)
        if (req.method === 'POST' && cesta === '/api/admin/uklid') {
          const prosle = await zhasniProsle(env)
          const zrusene = await zrusNezaplacene(env)
          return json({ prosle, zrusene }, {}, cors)
        }
      }

      return chyba('Tady nic není.', 404, cors)
    } catch (e) {
      // Detail chyby si necháme v logu, ven jde jen holá informace.
      console.error('reklamni sluzba:', e)
      return chyba('Něco se pokazilo, zkuste to prosím znovu.', 500, cors)
    }
}

export default {
  async fetch(req: Request, env: Prostredi): Promise<Response> {
    const puvodni = await obsluz(req, env)
    // Response z Workeru bývá zmrazená — hlavičky doplníme na kopii.
    const odpoved = new Response(puvodni.body, puvodni)
    for (const [k, v] of Object.entries(BEZPECNOSTNI_HLAVICKY)) {
      if (!odpoved.headers.has(k)) odpoved.headers.set(k, v)
    }
    return odpoved
  },

  // Denní úklid: prošlé kampaně zhasnou a jejich slot se nabídne jako volný.
  async scheduled(_udalost: ScheduledController, env: Prostredi): Promise<void> {
    const prosle = await zhasniProsle(env)
    const zrusene = await zrusNezaplacene(env)
    const limity = await smazStareLimity(env)
    console.log(`uklid: vyprselo ${prosle}, zruseno nezaplacenych ${zrusene}, limitu smazano ${limity}`)
  },
}
