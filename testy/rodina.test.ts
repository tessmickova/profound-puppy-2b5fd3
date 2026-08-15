// Rodinný profil — jeden zdroj pravdy pro úvod, /deti i /rodina.
//
// Hlídá hlavně dvě věci, na kterých se dá tiše pohořet: že zápis dřív, než
// si kdokoli data vyžádal, nepřepíše uloženou rodinu, a že poškozený
// záznam v prohlížeči web nepoloží.

import { strict as assert } from 'node:assert'
import { beforeEach, test } from 'node:test'

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

const CESTA = new URL('../lib/names/rodina.ts', import.meta.url).href
let poradi = 0
const nactiModul = () =>
  import(`${CESTA}?t=${poradi++}`) as Promise<typeof import('../lib/names/rodina')>

const clenove = () => JSON.parse(uloziste.getItem('svet-jmen-rodina') ?? '[]')

beforeEach(() => {
  uloziste.clear()
  uloziste.odmitejZapis = false
})

test('člen se přidá i odebere', async () => {
  const m = await nactiModul()
  m.pridejClena('Tereza', 'maminka')
  const [prvni] = clenove()
  assert.equal(prvni.jmeno, 'Tereza')
  assert.equal(prvni.role, 'maminka')
  m.odeberClena(prvni.id)
  assert.deepEqual(clenove(), [])
})

test('prázdné jméno se nepřidá', async () => {
  const m = await nactiModul()
  m.pridejClena('   ', 'maminka')
  assert.deepEqual(clenove(), [])
})

test('zápis před prvním čtením nepřepíše uloženou rodinu', async () => {
  uloziste.setItem('svet-jmen-rodina', JSON.stringify([
    { id: 'a', jmeno: 'Vojtěch', role: 'syn' },
  ]))
  const m = await nactiModul()
  // Žádná komponenta se zatím nepřihlásila k odběru — přesto se nesmí
  // stát, že přidání druhého člena zahodí toho prvního.
  m.pridejClena('Tereza', 'maminka')
  const jmena = clenove().map((c: { jmeno: string }) => c.jmeno)
  assert.deepEqual(jmena, ['Vojtěch', 'Tereza'])
})

test('příjmení se ukládá zvlášť a přežije přidání člena', async () => {
  const m = await nactiModul()
  m.nastavPrijmeni('Nováková')
  m.pridejClena('Martin', 'tatinek')
  assert.equal(uloziste.getItem('svet-jmen-prijmeni'), 'Nováková')
  assert.equal(clenove().length, 1)
})

test('poškozený záznam web nepoloží', async () => {
  uloziste.setItem('svet-jmen-rodina', '{tohle není pole')
  const m = await nactiModul()
  m.pridejClena('Ema', 'dcera')
  assert.equal(clenove().length, 1)
})

test('cizí tvar dat se přečte bezpečně', async () => {
  uloziste.setItem('svet-jmen-rodina', JSON.stringify([
    { id: 'a', jmeno: 'Ema', role: 'dcera' },
    'nesmysl',
    { jmeno: 'bez id' },
    null,
  ]))
  const m = await nactiModul()
  m.nastavPrijmeni('Novákovi')
  assert.deepEqual(clenove().map((c: { jmeno: string }) => c.jmeno), ['Ema'])
})

test('úprava podle role: založí, přejmenuje i odebere', async () => {
  const m = await nactiModul()
  m.nastavPodleRole(['maminka'], 'maminka', 'Jana')
  assert.equal(clenove()[0].jmeno, 'Jana')

  m.nastavPodleRole(['maminka'], 'maminka', 'Tereza')
  assert.equal(clenove().length, 1)
  assert.equal(clenove()[0].jmeno, 'Tereza')

  m.nastavPodleRole(['maminka'], 'maminka', '')
  assert.deepEqual(clenove(), [])
})

test('nedostupné úložiště (soukromý režim) nespadne', async () => {
  uloziste.odmitejZapis = true
  const m = await nactiModul()
  assert.doesNotThrow(() => m.pridejClena('Ema', 'dcera'))
})
