// Testy platební brány.
//
// Netestujeme ComGate, ale naše rozhodování o cizích penězích: jak čteme
// jejich odpověď a kdy notifikaci uznáme. Obojí jsou čisté funkce, takže
// běží bez Workeru, bez databáze a bez sítě — `fetch` se podstrčí parametrem.
//
// Spouští se `npm test` v adresáři ads-worker (node:test + tsx).

import { strict as assert } from 'node:assert'
import { test } from 'node:test'

import {
  overNotifikaci, overStav, rozeberNotifikaci, rozeberOdpoved, stejneTajemstvi, vytvorPlatbu,
  type NastaveniBrany, type ObjednavkaKPlatbe, type ZpravaOPlatbe,
} from '../src/comgate'

/** Testovací nastavení. Skutečné hodnoty do repozitáře nepatří. */
const BRANA: NastaveniBrany = {
  merchant: '123456',
  secret: 'zkusebni-tajemstvi-brany',
  test: true,
}

/** Objednávka za 5 000 Kč, tedy 500 000 haléřů. */
const OBJEDNAVKA: ObjednavkaKPlatbe = {
  id: 'objednavka1',
  cena_kc: 5000,
  stav: 'ceka_na_platbu',
  transakce_id: null,
}

function zprava(zmeny: Partial<ZpravaOPlatbe> = {}): ZpravaOPlatbe {
  return {
    merchant: BRANA.merchant,
    test: 'true',
    price: '500000',
    curr: 'CZK',
    label: 'Reklama 3',
    refId: OBJEDNAVKA.id,
    method: 'CARD_CZ_CSOB_2',
    email: 'firma@priklad.cz',
    transId: 'AB12-CD34-EF56',
    secret: BRANA.secret,
    status: 'PAID',
    ...zmeny,
  }
}

/** Odpověď brány předstíráme; `fetch` je parametr právě kvůli tomuhle. */
function falesnyFetch(telo: string, stav = 200) {
  const volani: { adresa: string; pole: URLSearchParams }[] = []
  const posli = (async (adresa: string | URL | Request, init?: RequestInit) => {
    volani.push({
      adresa: String(adresa),
      pole: new URLSearchParams(String(init?.body ?? '')),
    })
    return new Response(telo, { status: stav })
  }) as unknown as typeof fetch
  return { posli, volani }
}

// ── parser odpovědi ──────────────────────────────────────────────────────

test('odpověď brány je urlencoded, ne JSON', () => {
  const p = rozeberOdpoved(
    'code=0&message=OK&transId=AB12-CD34&redirect='
    + 'https%3A%2F%2Fpayments.comgate.cz%2Fclient%2Finstructions%2Findex%3Fid%3DAB12-CD34',
  )
  assert.equal(p.code, '0')
  assert.equal(p.message, 'OK')
  assert.equal(p.transId, 'AB12-CD34')
  // Adresa má vlastní parametry — ruční dělení podle `&` by ji roztrhlo.
  assert.equal(p.redirect, 'https://payments.comgate.cz/client/instructions/index?id=AB12-CD34')
})

test('parser rozumí plusu i procentům v hlášce', () => {
  const p = rozeberOdpoved('code=1400&message=Chybn%C3%A1+cena')
  assert.equal(p.code, '1400')
  assert.equal(p.message, 'Chybná cena')
})

test('zalomení řádku na konci odpovědi nepatří do poslední hodnoty', () => {
  const p = rozeberOdpoved('code=0&message=OK&transId=XY99\n')
  assert.equal(p.transId, 'XY99')
})

test('prázdná odpověď nespadne, jen nic neobsahuje', () => {
  assert.deepEqual(rozeberOdpoved(''), {})
})

// ── založení platby ──────────────────────────────────────────────────────

test('platba se zakládá v haléřích a jen s poli protokolu', async () => {
  const { posli, volani } = falesnyFetch('code=0&message=OK&transId=T1&redirect=https%3A%2F%2Fbrana%2Fplat')
  const v = await vytvorPlatbu(BRANA, {
    cenaHaleru: 5000 * 100,
    label: 'Reklama 3',
    refId: 'objednavka1',
    email: 'firma@priklad.cz',
  }, posli)

  assert.equal(v.ok, true)
  assert.equal(v.ok && v.transId, 'T1')
  assert.equal(v.ok && v.redirect, 'https://brana/plat')

  const pole = volani[0].pole
  assert.equal(volani[0].adresa, 'https://payments.comgate.cz/v1.0/create')
  assert.equal(pole.get('price'), '500000', 'cena musí jít v haléřích jako celé číslo')
  assert.equal(pole.get('curr'), 'CZK')
  assert.equal(pole.get('method'), 'ALL')
  assert.equal(pole.get('prepareOnly'), 'true')
  assert.equal(pole.get('test'), 'true')
  assert.equal(pole.get('refId'), 'objednavka1')
  assert.equal(pole.get('merchant'), BRANA.merchant)
})

test('nenulový kód znamená, že platba nevznikla', async () => {
  const { posli } = falesnyFetch('code=1400&message=Chybn%C3%A1+cena')
  const v = await vytvorPlatbu(BRANA, {
    cenaHaleru: 1, label: 'x', refId: 'objednavka1', email: 'a@b.cz',
  }, posli)
  assert.equal(v.ok, false)
  assert.equal(!v.ok && v.kod, '1400')
})

test('OK bez adresy platby je taky selhání — nebylo by kam poslat zákazníka', async () => {
  const { posli } = falesnyFetch('code=0&message=OK')
  const v = await vytvorPlatbu(BRANA, {
    cenaHaleru: 1, label: 'x', refId: 'objednavka1', email: 'a@b.cz',
  }, posli)
  assert.equal(v.ok, false)
})

test('ověření stavu se ptá na transakci a vrací částku i měnu', async () => {
  const { posli, volani } = falesnyFetch('code=0&message=OK&status=PAID&price=500000&curr=CZK')
  const v = await overStav(BRANA, 'AB12', posli)
  assert.equal(volani[0].adresa, 'https://payments.comgate.cz/v1.0/status')
  assert.equal(volani[0].pole.get('transId'), 'AB12')
  assert.equal(v.ok && v.status, 'PAID')
  assert.equal(v.ok && v.cenaHaleru, 500000)
  assert.equal(v.ok && v.mena, 'CZK')
})

// ── porovnání tajemství ──────────────────────────────────────────────────

test('tajemství sedí jen když sedí celé', () => {
  assert.equal(stejneTajemstvi('abc', 'abc'), true)
  assert.equal(stejneTajemstvi('abd', 'abc'), false)
  assert.equal(stejneTajemstvi('ab', 'abc'), false, 'kratší předpona nesmí projít')
  assert.equal(stejneTajemstvi('abcd', 'abc'), false)
  assert.equal(stejneTajemstvi('', ''), false, 'nenastavené tajemství nesmí pouštět nikoho')
})

// ── ověření notifikace ───────────────────────────────────────────────────

test('poctivá notifikace o zaplacení kampaň aktivuje', () => {
  const v = overNotifikaci(zprava(), BRANA, OBJEDNAVKA)
  assert.equal(v.ok, true)
  assert.equal(v.ok && v.aktivovat, true)
})

test('špatné tajemství neaktivuje nic', () => {
  const v = overNotifikaci(zprava({ secret: 'uhodnute-tajemstvi' }), BRANA, OBJEDNAVKA)
  assert.equal(v.ok, false)
  assert.match(!v.ok ? v.duvod : '', /tajemstv/)
})

test('prázdné tajemství ve zprávě taky neprojde', () => {
  const v = overNotifikaci(zprava({ secret: '' }), BRANA, OBJEDNAVKA)
  assert.equal(v.ok, false)
})

test('cizí refId nemá co aktivovat', () => {
  // Objednávku k tomu refId jsme v databázi nenašli — `null`.
  const v = overNotifikaci(zprava({ refId: 'cizi-objednavka' }), BRANA, null)
  assert.equal(v.ok, false)
  assert.match(!v.ok ? v.duvod : '', /refId/)
})

test('notifikace od jiného obchodníka se zahodí', () => {
  const v = overNotifikaci(zprava({ merchant: '999999' }), BRANA, OBJEDNAVKA)
  assert.equal(v.ok, false)
})

test('nesouhlasící částka kampaň nespustí', () => {
  // Zaplaceno o korunu míň, než objednávka stojí.
  const v = overNotifikaci(zprava({ price: '499900' }), BRANA, OBJEDNAVKA)
  assert.equal(v.ok, false)
  assert.match(!v.ok ? v.duvod : '', /částka/)
})

test('částka v korunách místo haléřů je taky nesouhlasící částka', () => {
  const v = overNotifikaci(zprava({ price: '5000' }), BRANA, OBJEDNAVKA)
  assert.equal(v.ok, false)
})

test('nečíselná částka neprojde', () => {
  const v = overNotifikaci(zprava({ price: 'hodně' }), BRANA, OBJEDNAVKA)
  assert.equal(v.ok, false)
})

test('jiná měna neprojde, i když číslo sedí', () => {
  const v = overNotifikaci(zprava({ curr: 'EUR' }), BRANA, OBJEDNAVKA)
  assert.equal(v.ok, false)
})

test('zrušená i čekající platba nechá objednávku být', () => {
  for (const stav of ['CANCELLED', 'PENDING']) {
    const v = overNotifikaci(zprava({ status: stav }), BRANA, OBJEDNAVKA)
    assert.equal(v.ok, true, `${stav} není chyba, jen se nic neděje`)
    assert.equal(v.ok && v.aktivovat, false)
  }
})

test('opakovaná notifikace o téže platbě už neaktivuje (idempotence)', () => {
  const z = zprava()
  // První notifikace prošla: objednávka je aktivní a nese id transakce.
  const poZaplaceni: ObjednavkaKPlatbe = {
    ...OBJEDNAVKA, stav: 'aktivni', transakce_id: z.transId,
  }
  const v = overNotifikaci(z, BRANA, poZaplaceni)
  // Uznáme ji (bráně odpovíme `code=0`, aby přestala posílat), ale
  // neaktivujeme podruhé.
  assert.equal(v.ok, true)
  assert.equal(v.ok && v.aktivovat, false)
  assert.match(v.ok ? v.duvod : '', /už máme zapsanou/)
})

test('druhá platba na už aktivní objednávku ji nepřepíše', () => {
  const jina: ObjednavkaKPlatbe = { ...OBJEDNAVKA, stav: 'aktivni', transakce_id: 'STARA' }
  const v = overNotifikaci(zprava({ transId: 'NOVA' }), BRANA, jina)
  assert.equal(v.ok, true)
  assert.equal(v.ok && v.aktivovat, false)
})

test('zrušená objednávka se platbou neoživí', () => {
  const zrusena: ObjednavkaKPlatbe = { ...OBJEDNAVKA, stav: 'zrusena' }
  const v = overNotifikaci(zprava(), BRANA, zrusena)
  assert.equal(v.ok && v.aktivovat, false)
})

test('důvod pro log nikdy neobsahuje tajemství brány', () => {
  // Do logu jde `duvod`. Kdyby v něm někdy skončil secret, vyzradilo by ho
  // první nahlédnutí do `wrangler tail`.
  const pripady = [
    zprava({ secret: 'uhodnute' }),
    zprava({ price: '1' }),
    zprava({ curr: 'EUR' }),
    zprava({ status: 'CANCELLED' }),
  ]
  for (const z of pripady) {
    const v = overNotifikaci(z, BRANA, OBJEDNAVKA)
    const duvod = v.ok ? v.duvod : v.duvod
    assert.ok(!duvod.includes(BRANA.secret), 'tajemství se nesmí dostat do hlášky')
    assert.ok(!duvod.includes(z.secret) || z.secret === '', 'ani to poslané')
  }
})

// ── parser notifikace ────────────────────────────────────────────────────

test('notifikace se čte z urlencoded těla POSTu', () => {
  const z = rozeberNotifikaci(
    'merchant=123456&test=true&price=500000&curr=CZK&label=Reklama+3'
    + '&refId=objednavka1&method=CARD_CZ_CSOB_2&email=firma%40priklad.cz'
    + '&transId=AB12-CD34&secret=zkusebni-tajemstvi-brany&status=PAID',
  )
  assert.equal(z.refId, 'objednavka1')
  assert.equal(z.email, 'firma@priklad.cz')
  assert.equal(z.label, 'Reklama 3')
  assert.equal(z.status, 'PAID')
})

test('chybějící pole notifikace jsou prázdná, ne undefined', () => {
  const z = rozeberNotifikaci('status=PAID')
  assert.equal(z.secret, '')
  assert.equal(z.refId, '')
  // A taková notifikace samozřejmě neprojde ověřením.
  assert.equal(overNotifikaci(z, BRANA, OBJEDNAVKA).ok, false)
})
