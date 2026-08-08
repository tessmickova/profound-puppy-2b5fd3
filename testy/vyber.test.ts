// Testy osobního výběru: uložená a vyřazená jména.
//
// Úložiště prohlížeče předstíráme, ať se dá otestovat i přechod ze starého
// záznamu, který obsahoval jen srdíčka.

import { strict as assert } from 'node:assert'
import { beforeEach, test } from 'node:test'

/** Minimální náhrada localStorage, která umí i selhat jako soukromý režim. */
class Uloziste {
  private data = new Map<string, string>()
  odmitejZapis = false
  getItem(k: string) { return this.data.get(k) ?? null }
  setItem(k: string, v: string) {
    if (this.odmitejZapis) throw new Error('odmítnuto')
    this.data.set(k, v)
  }
  removeItem(k: string) { this.data.delete(k) }
  clear() { this.data.clear() }
}

const uloziste = new Uloziste()
;(globalThis as { localStorage?: unknown }).localStorage = uloziste

// Modul si data z úložiště načte jen jednou. V testech ho proto načítáme
// pokaždé znovu — jinak by druhý test pracoval s pamětí z prvního.
// `?t=` je jediný způsob, jak obejít keš modulů, a musí být absolutní cesta.
const CESTA = new URL('../lib/names/vyber.ts', import.meta.url).href

async function nactiModul() {
  return import(`${CESTA}?t=${poradi++}`) as Promise<typeof import('../lib/names/vyber')>
}

let poradi = 0

beforeEach(() => {
  uloziste.clear()
  uloziste.odmitejZapis = false
})

test('srdíčko se dá přidat i odebrat', async () => {
  const m = await nactiModul()
  m.prepniOblibene('cz-holka-1')
  assert.deepEqual(JSON.parse(uloziste.getItem('svet-jmen-vyber')!).oblibena, ['cz-holka-1'])
  m.prepniOblibene('cz-holka-1')
  assert.deepEqual(JSON.parse(uloziste.getItem('svet-jmen-vyber')!).oblibena, [])
})

test('vyřazení se dá vzít zpátky', async () => {
  const m = await nactiModul()
  m.prepniVyrazene('cz-kluk-2')
  assert.deepEqual(JSON.parse(uloziste.getItem('svet-jmen-vyber')!).vyrazena, ['cz-kluk-2'])
  m.prepniVyrazene('cz-kluk-2')
  assert.deepEqual(JSON.parse(uloziste.getItem('svet-jmen-vyber')!).vyrazena, [])
})

test('jméno nemůže být zároveň uložené a vyřazené', async () => {
  const m = await nactiModul()
  m.prepniOblibene('x')
  m.prepniVyrazene('x')
  const d = JSON.parse(uloziste.getItem('svet-jmen-vyber')!)
  assert.deepEqual(d.oblibena, [])
  assert.deepEqual(d.vyrazena, ['x'])

  m.prepniOblibene('x')
  const d2 = JSON.parse(uloziste.getItem('svet-jmen-vyber')!)
  assert.deepEqual(d2.oblibena, ['x'])
  assert.deepEqual(d2.vyrazena, [])
})

test('vrátit všechna vyřazená', async () => {
  const m = await nactiModul()
  m.prepniVyrazene('a')
  m.prepniVyrazene('b')
  m.vratVsechnaVyrazena()
  assert.deepEqual(JSON.parse(uloziste.getItem('svet-jmen-vyber')!).vyrazena, [])
})

test('starý záznam se srdíčky se přenese, nic se neztratí', async () => {
  uloziste.setItem('svet-jmen-oblibene', JSON.stringify(['cz-holka-1', 'cz-kluk-3']))
  const m = await nactiModul()
  // První zápis modul donutí načíst dosavadní stav.
  m.prepniVyrazene('cz-pes-0')
  const d = JSON.parse(uloziste.getItem('svet-jmen-vyber')!)
  assert.deepEqual(d.oblibena, ['cz-holka-1', 'cz-kluk-3'])
  assert.deepEqual(d.vyrazena, ['cz-pes-0'])
})

test('poškozený záznam web nepoloží', async () => {
  uloziste.setItem('svet-jmen-vyber', '{tohle není JSON')
  const m = await nactiModul()
  m.prepniOblibene('x')
  assert.deepEqual(JSON.parse(uloziste.getItem('svet-jmen-vyber')!).oblibena, ['x'])
})

test('cizí tvar dat se přečte bezpečně', async () => {
  uloziste.setItem('svet-jmen-vyber', JSON.stringify({ v: 1, oblibena: 'nesmysl', vyrazena: [1, 'a', null] }))
  const m = await nactiModul()
  m.prepniOblibene('y')
  const d = JSON.parse(uloziste.getItem('svet-jmen-vyber')!)
  assert.deepEqual(d.oblibena, ['y'])
  // Z pole zůstanou jen řetězce; čísla ani null do výběru nepatří.
  assert.deepEqual(d.vyrazena, ['a'])
})

test('nedostupné úložiště (soukromý režim) nespadne', async () => {
  uloziste.odmitejZapis = true
  const m = await nactiModul()
  assert.doesNotThrow(() => m.prepniOblibene('z'))
})
