// Testy sdíleného rodinného profilu: jeden zdroj pravdy pro úvodní
// stránku, /deti i /rodina — členové, příjmení a úpravy podle role.

import { strict as assert } from 'node:assert'
import { beforeEach, test } from 'node:test'

class Uloziste {
  private data = new Map<string, string>()
  getItem(k: string) { return this.data.get(k) ?? null }
  setItem(k: string, v: string) { this.data.set(k, v) }
  removeItem(k: string) { this.data.delete(k) }
  clear() { this.data.clear() }
}

const uloziste = new Uloziste()
;(globalThis as { localStorage?: unknown }).localStorage = uloziste

import * as m from '../lib/names/rodina'

async function nactiModul() { return m }

beforeEach(() => {
  uloziste.clear()
  m._znovuNactiProTesty()
})

test('člen se přidá a uloží do localStorage', async () => {
  const m = await nactiModul()
  m.pridejClena('Tereza', 'maminka')
  const data = JSON.parse(uloziste.getItem('svet-jmen-rodina')!)
  assert.equal(data.length, 1)
  assert.equal(data[0].jmeno, 'Tereza')
  assert.equal(data[0].role, 'maminka')
})

test('prázdné jméno se nepřidá', async () => {
  const m = await nactiModul()
  m.pridejClena('   ', 'maminka')
  assert.equal(uloziste.getItem('svet-jmen-rodina'), null)
})

test('příjmení se ukládá zvlášť a přežije', async () => {
  const m = await nactiModul()
  m.nastavPrijmeni('Nováková')
  assert.equal(uloziste.getItem('svet-jmen-prijmeni'), 'Nováková')
})

test('nastavPodleRole: vytvoří, přepíše a smaže člena', async () => {
  const m = await nactiModul()
  // vytvoření — žádná maminka není
  m.nastavPodleRole(['maminka'], 'maminka', 'Jana')
  let data = JSON.parse(uloziste.getItem('svet-jmen-rodina')!)
  assert.equal(data.length, 1)
  assert.equal(data[0].jmeno, 'Jana')

  // přepsání téhož člena — nesmí vzniknout druhý záznam
  m.nastavPodleRole(['maminka'], 'maminka', 'Marie')
  data = JSON.parse(uloziste.getItem('svet-jmen-rodina')!)
  assert.equal(data.length, 1)
  assert.equal(data[0].jmeno, 'Marie')

  // prázdné jméno člena odebere
  m.nastavPodleRole(['maminka'], 'maminka', '')
  data = JSON.parse(uloziste.getItem('svet-jmen-rodina')!)
  assert.equal(data.length, 0)
})

test('sourozenec: najde dceru i syna, nového zakládá jako dítě', async () => {
  const m = await nactiModul()
  m.pridejClena('Vanesa', 'dcera')
  m.nastavPodleRole(m.ROLE_DETI, 'dite', 'Eliška')
  const data = JSON.parse(uloziste.getItem('svet-jmen-rodina')!)
  assert.equal(data.length, 1)          // upravil existující dceru
  assert.equal(data[0].jmeno, 'Eliška')
  assert.equal(data[0].role, 'dcera')   // role zůstává

  m.nastavPodleRole(['tatinek'], 'tatinek', 'Petr')
  m.nastavPodleRole(m.ROLE_DETI, 'dite', '')  // smaže dceru, tatínka nechá
  const po = JSON.parse(uloziste.getItem('svet-jmen-rodina')!)
  assert.equal(po.length, 1)
  assert.equal(po[0].role, 'tatinek')
})

test('poškozená data v úložišti web neshodí', async () => {
  uloziste.setItem('svet-jmen-rodina', '{rozbité json')
  const m = await nactiModul()
  m.pridejClena('Rex', 'pes')
  const data = JSON.parse(uloziste.getItem('svet-jmen-rodina')!)
  assert.equal(data.length, 1)
})
