// Test pravidla, na kterém stojí celé schvalování:
// každá změna kreativy shodí schválení zpátky na nulu.
//
// Bez něj by si firma nechala schválit slušný inzerát a hned nato do něj
// napsala cokoli — schvalování by bylo jen dekorace. Je to jednořádkové
// pravidlo v jednom SQL, a přesně proto ho hlídá stroj a ne dobrá paměť.
//
// Worker tu neběží: `env` je atrapa, která zaznamená, co se do databáze
// poslalo, a odpoví předem daným řádkem.

import { strict as assert } from 'node:assert'
import { test } from 'node:test'

import { upravInzerat } from '../src/index'
import type { Prostredi } from '../src/db'

interface Zaznam { sql: string; parametry: unknown[] }

/**
 * Atrapa D1. Umí jen to, co potřebuje `upravInzerat`: `prepare().bind()`
 * a pak `first()` nebo `run()`. Každé volání si zapíše, ať se dá potom
 * zkontrolovat, co přesně by se do databáze zapsalo.
 */
function atrapaDb(radek: unknown) {
  const zaznamy: Zaznam[] = []
  const db = {
    prepare(sql: string) {
      return {
        bind(...parametry: unknown[]) {
          zaznamy.push({ sql, parametry })
          return {
            first: async () => radek,
            run: async () => ({ meta: { changes: 1 } }),
            all: async () => ({ results: [] }),
          }
        },
      }
    },
  }
  return { db, zaznamy }
}

const OBJEDNAVKA = {
  id: 'objednavka1',
  plocha: 'plocha-3',
  obdobi: 'mesic',
  stav: 'aktivni',
  token: 'token-inzerenta',
}

const KREATIVA = {
  znacka: 'Známkárna',
  nadpis: 'Gravírovaná známka na obojek',
  text: 'Jméno i telefon vyrytý do nerezu. Vyrobíme do druhého dne.',
  cta: 'Vybrat známku',
  odkaz: 'https://priklad.cz',
}

function pozadavek(telo: unknown): Request {
  return new Request('https://sluzba/api/objednavka/token-inzerenta', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(telo),
  })
}

/** Poslední UPDATE, který by šel do tabulky inzerátů. */
const posledniUprava = (zaznamy: Zaznam[]) =>
  zaznamy.filter(z => /UPDATE inzeraty/.test(z.sql)).at(-1)

test('úprava textu shodí schválení na nulu', async () => {
  const { db, zaznamy } = atrapaDb(OBJEDNAVKA)
  const env = { DB: db } as unknown as Prostredi

  const odpoved = await upravInzerat(pozadavek(KREATIVA), OBJEDNAVKA.token, env, {})
  assert.equal(odpoved.status, 200)

  const uprava = posledniUprava(zaznamy)
  assert.ok(uprava, 'inzerát se měl uložit')
  assert.match(uprava.sql, /schvaleno\s*=\s*0/, 'úprava musí shodit schválení')
})

test('úprava zároveň smaže starý důvod zamítnutí', async () => {
  // Jinak by inzerentovi u opraveného textu pořád svítilo staré „zamítnuto".
  const { db, zaznamy } = atrapaDb(OBJEDNAVKA)
  const env = { DB: db } as unknown as Prostredi

  await upravInzerat(pozadavek(KREATIVA), OBJEDNAVKA.token, env, {})

  const uprava = posledniUprava(zaznamy)
  assert.ok(uprava)
  assert.match(uprava.sql, /zamitnuto_duvod\s*=\s*NULL/)
  assert.match(uprava.sql, /schvaleno_kdy\s*=\s*NULL/)
})

test('odpověď říká inzerentovi, že kreativa čeká na nové schválení', async () => {
  const { db } = atrapaDb(OBJEDNAVKA)
  const env = { DB: db } as unknown as Prostredi

  const odpoved = await upravInzerat(pozadavek(KREATIVA), OBJEDNAVKA.token, env, {})
  const telo = await odpoved.json() as { ulozeno?: boolean; schvaleno?: number }
  assert.equal(telo.ulozeno, true)
  assert.equal(telo.schvaleno, 0)
})

test('neplatná úprava se neuloží, takže schválení nezmizí', async () => {
  // Kdyby validace neplatný odkaz pustila, shodila by schválení běžící
  // kampaně kvůli změně, která se stejně neuloží.
  const { db, zaznamy } = atrapaDb(OBJEDNAVKA)
  const env = { DB: db } as unknown as Prostredi

  const odpoved = await upravInzerat(
    pozadavek({ ...KREATIVA, odkaz: 'javascript:alert(1)' }), OBJEDNAVKA.token, env, {},
  )
  assert.equal(odpoved.status, 400)
  assert.equal(posledniUprava(zaznamy), undefined, 'nic se nemělo zapsat')
})

test('úprava cizím klíčem neexistující objednávky nic nezapíše', async () => {
  const { db, zaznamy } = atrapaDb(null)
  const env = { DB: db } as unknown as Prostredi

  const odpoved = await upravInzerat(pozadavek(KREATIVA), 'cizi-klic', env, {})
  assert.equal(odpoved.status, 404)
  assert.equal(posledniUprava(zaznamy), undefined)
})

test('do skončené kampaně se nedá psát', async () => {
  const { db, zaznamy } = atrapaDb({ ...OBJEDNAVKA, stav: 'vyprsela' })
  const env = { DB: db } as unknown as Prostredi

  const odpoved = await upravInzerat(pozadavek(KREATIVA), OBJEDNAVKA.token, env, {})
  assert.equal(odpoved.status, 409)
  assert.equal(posledniUprava(zaznamy), undefined)
})
