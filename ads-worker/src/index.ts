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
  obsazenost, platiDo, zhasniProsle, zrusNezaplacene,
  type Prostredi,
} from './db'
import { IKONY, KAPACITA, OBDOBI, PLOCHY, cena, kapacitaPlochy, plochaPodleId, type Obdobi } from './plochy'
import { samoobsluha } from './samoobsluha'

const MAX_LOGO = 200 * 1024
const POVOLENE_TYPY_LOGA = ['image/png', 'image/jpeg', 'image/webp']

// ── pomocníci ────────────────────────────────────────────────────────────

function originy(env: Prostredi): string[] {
  return (env.POVOLENE_ORIGINY ?? '').split(',').map(s => s.trim()).filter(Boolean)
}

function hlavickyCors(req: Request, env: Prostredi): Record<string, string> {
  const origin = req.headers.get('Origin')
  if (origin && originy(env).includes(origin)) {
    return {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
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
function text(hodnota: unknown, max: number): string {
  return typeof hodnota === 'string' ? hodnota.trim().slice(0, max) : ''
}

/** Odkaz pustíme dál jen když je to obyčejné http(s). */
function odkazOk(url: string): boolean {
  try {
    const u = new URL(url)
    return u.protocol === 'https:' || u.protocol === 'http:'
  } catch {
    return false
  }
}

const emailOk = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e)

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
    obdobi: Object.entries(OBDOBI).map(([id, o]) => ({ id, nazev: o.nazev, dnu: o.dnu })),
    ikony: IKONY,
    plochy: PLOCHY.map(p => ({
      id: p.id,
      nazev: p.nazev,
      stranka: p.stranka,
      pozice: p.pozice,
      strana: p.strana,
      kapacita: kapacitaPlochy(p),
      volno: Math.max(0, kapacitaPlochy(p) - (obsazeno[p.id] ?? 0)),
      ceny: Object.fromEntries(
        (Object.keys(OBDOBI) as Obdobi[]).map(o => [o, cena(p, o)]),
      ),
    })),
  }, {}, cors)
}

// ── objednávka ───────────────────────────────────────────────────────────

async function vytvorObjednavku(req: Request, env: Prostredi, cors: Record<string, string>) {
  let telo: Record<string, unknown>
  try {
    telo = await req.json()
  } catch {
    return chyba('Nečitelná data formuláře.', 400, cors)
  }

  const plocha = plochaPodleId(text(telo.plocha, 40))
  if (!plocha) return chyba('Vyberte prosím plochu ze seznamu.', 400, cors)

  const obdobi = text(telo.obdobi, 10) as Obdobi
  if (!(obdobi in OBDOBI)) return chyba('Vyberte délku kampaně.', 400, cors)

  const firma = text(telo.firma, 80)
  const email = text(telo.email, 120)
  const ico = text(telo.ico, 12)
  const znacka = text(telo.znacka, 32)
  const nadpis = text(telo.nadpis, 48)
  const popis = text(telo.text, 150)
  const cta = text(telo.cta, 24)
  const odkaz = text(telo.odkaz, 300)
  const ikona = text(telo.ikona, 20) || 'sparkles'

  if (firma.length < 2) return chyba('Vyplňte název firmy.', 400, cors)
  if (!emailOk(email)) return chyba('Vyplňte platný e-mail.', 400, cors)
  if (ico && !/^\d{6,10}$/.test(ico)) return chyba('IČO má jen číslice.', 400, cors)
  if (znacka.length < 2) return chyba('Vyplňte jméno značky, které se u inzerátu ukáže.', 400, cors)
  if (nadpis.length < 6) return chyba('Nadpis je moc krátký.', 400, cors)
  if (popis.length < 20) return chyba('Text inzerátu je moc krátký.', 400, cors)
  if (cta.length < 3) return chyba('Vyplňte text tlačítka.', 400, cors)
  if (!odkazOk(odkaz)) return chyba('Odkaz musí začínat http:// nebo https://', 400, cors)
  if (!(IKONY as readonly string[]).includes(ikona)) return chyba('Neznámá ikona.', 400, cors)
  if (telo.souhlas !== true) return chyba('Bez souhlasu s podmínkami to nejde odeslat.', 400, cors)

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

  await env.DB.batch([
    env.DB.prepare(
      'INSERT INTO inzerenti (id, firma, ico, email, vytvoreno) VALUES (?1, ?2, ?3, ?4, ?5)',
    ).bind(inzerentId, firma, ico || null, email, ted),
    env.DB.prepare(
      `INSERT INTO objednavky (id, inzerent_id, plocha, obdobi, cena_kc, vs, stav, token, vytvoreno)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, 'ceka_na_platbu', ?7, ?8)`,
    ).bind(objednavkaId, inzerentId, plocha.id, obdobi, castka, vs, token, ted),
    env.DB.prepare(
      `INSERT INTO inzeraty (id, objednavka_id, znacka, nadpis, text, cta, odkaz, ikona)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)`,
    ).bind(inzeratId, objednavkaId, znacka, nadpis, popis, cta, odkaz, ikona),
  ])

  return json({
    token,
    stav: 'ceka_na_platbu',
    plocha: plocha.nazev,
    obdobi: OBDOBI[obdobi].nazev,
    cena_kc: castka,
    platba: {
      ucet: env.BANKOVNI_UCET,
      vs,
      prijemce: env.PROVOZOVATEL,
      zprava: `Reklama ${plocha.id}`,
    },
    kontakt: env.PROVOZOVATEL_EMAIL,
  }, { status: 201 }, cors)
}

async function dejObjednavku(token: string, env: Prostredi, url: URL, cors: Record<string, string>) {
  const o = await objednavkaPodleTokenu(env, token)
  if (!o) return chyba('Objednávku neznáme.', 404, cors)

  const i = await env.DB.prepare('SELECT * FROM inzeraty WHERE objednavka_id = ?1')
    .bind(o.id).first<{ znacka: string; nadpis: string; text: string; cta: string; odkaz: string; ikona: string | null; logo_klic: string | null }>()

  return json({
    stav: o.stav,
    plocha: plochaPodleId(o.plocha)?.nazev ?? o.plocha,
    obdobi: OBDOBI[o.obdobi as Obdobi]?.nazev ?? o.obdobi,
    cena_kc: o.cena_kc,
    vs: o.vs,
    plati_od: o.plati_od,
    plati_do: o.plati_do,
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

  const typ = (req.headers.get('Content-Type') ?? '').split(';')[0].trim()
  if (!POVOLENE_TYPY_LOGA.includes(typ)) {
    return chyba('Logo pošlete jako PNG, JPG nebo WEBP.', 415, cors)
  }

  const data = await req.arrayBuffer()
  if (data.byteLength === 0) return chyba('Prázdný soubor.', 400, cors)
  if (data.byteLength > MAX_LOGO) return chyba('Logo smí mít nejvýš 200 kB.', 413, cors)

  const pripona = typ === 'image/png' ? 'png' : typ === 'image/webp' ? 'webp' : 'jpg'
  const klic = `${o.id}-${novyId(6)}.${pripona}`
  await env.LOGA.put(klic, data, { httpMetadata: { contentType: typ } })

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

// ── správa ───────────────────────────────────────────────────────────────

async function potvrdPlatbu(req: Request, env: Prostredi) {
  let telo: { vs?: string; od?: string }
  try { telo = await req.json() } catch { return chyba('Nečitelná data.') }

  const vs = text(telo.vs, 12)
  if (!vs) return chyba('Chybí variabilní symbol.')

  const o = await env.DB.prepare("SELECT * FROM objednavky WHERE vs = ?1 AND stav = 'ceka_na_platbu'")
    .bind(vs).first<{ id: string; obdobi: string }>()
  if (!o) return chyba('K tomuhle symbolu nečeká žádná objednávka.', 404)

  const od = text(telo.od, 10) || dnesISO()
  const do_ = platiDo(od, o.obdobi as Obdobi)
  await env.DB.prepare("UPDATE objednavky SET stav = 'aktivni', plati_od = ?1, plati_do = ?2 WHERE id = ?3")
    .bind(od, do_, o.id).run()

  return json({ stav: 'aktivni', plati_od: od, plati_do: do_ })
}

async function prehled(env: Prostredi) {
  const { results } = await env.DB.prepare(
    `SELECT o.id, o.plocha, o.obdobi, o.cena_kc, o.vs, o.stav, o.plati_od, o.plati_do,
            n.firma, n.email, i.znacka, i.nadpis
       FROM objednavky o
       JOIN inzerenti n ON n.id = o.inzerent_id
       LEFT JOIN inzeraty i ON i.objednavka_id = o.id
      ORDER BY o.vytvoreno DESC
      LIMIT 200`,
  ).all()
  return json({ objednavky: results ?? [] })
}

// ── router ───────────────────────────────────────────────────────────────

export default {
  async fetch(req: Request, env: Prostredi): Promise<Response> {
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
      if (req.method === 'POST' && cesta === '/api/objednavka') return vytvorObjednavku(req, env, cors)

      const logo = cesta.match(/^\/api\/objednavka\/([a-z0-9]+)\/logo$/)
      if (req.method === 'POST' && logo) return nahrajLogo(req, logo[1], env, cors)

      const stav = cesta.match(/^\/api\/objednavka\/([a-z0-9]+)$/)
      if (req.method === 'GET' && stav) return dejObjednavku(stav[1], env, url, cors)

      const souborLoga = cesta.match(/^\/logo\/([a-z0-9-]+\.(?:png|jpg|webp))$/)
      if (req.method === 'GET' && souborLoga) return dejLogo(souborLoga[1], env)

      if (cesta.startsWith('/api/admin/')) {
        if (!jeAdmin(req, env)) return chyba('Nemáte oprávnění.', 401)
        if (req.method === 'POST' && cesta === '/api/admin/potvrdit') return potvrdPlatbu(req, env)
        if (req.method === 'GET' && cesta === '/api/admin/prehled') return prehled(env)
        if (req.method === 'POST' && cesta === '/api/admin/uklid') {
          const prosle = await zhasniProsle(env)
          const zrusene = await zrusNezaplacene(env)
          return json({ prosle, zrusene })
        }
      }

      return chyba('Tady nic není.', 404, cors)
    } catch (e) {
      // Detail chyby si necháme v logu, ven jde jen holá informace.
      console.error('reklamni sluzba:', e)
      return chyba('Něco se pokazilo, zkuste to prosím znovu.', 500, cors)
    }
  },

  // Denní úklid: prošlé kampaně zhasnou a jejich slot se nabídne jako volný.
  async scheduled(_udalost: ScheduledController, env: Prostredi): Promise<void> {
    const prosle = await zhasniProsle(env)
    const zrusene = await zrusNezaplacene(env)
    console.log(`uklid: vyprselo ${prosle}, zruseno nezaplacenych ${zrusene}`)
  },
}
