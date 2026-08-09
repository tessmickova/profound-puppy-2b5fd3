// Testy dobového zařazení jmen.
//
// Vzniklo to jako oprava konkrétní chyby: Denisa vycházela jako „originál",
// protože se štítek počítal z redakčního skóre líbivosti (`popularita <= 80`).
// Denisa ale není vzácné jméno — je to běžné české jméno generace dnešních
// maminek. Testy hlídají, aby se ty dvě osy zase nespletly.

import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { JMENA } from '../lib/names/data'
import {
  jeDoznivajici, jeStalice, jeVrchol, jeVyhled, jeVzacne,
} from '../lib/names/logic'
import { ROK_REVIZE, VYHLED, vlnaJmena, ZARAZENA_JMENA } from '../lib/names/vlny'
import { VLNA_INFO } from '../lib/names/types'

const najdi = (jmeno: string) => {
  const j = JMENA.find(x => x.jmeno === jmeno && x.zeme === 'cz'
    && (x.kategorie === 'kluk' || x.kategorie === 'holka'))
  assert.ok(j, `v datech chybí české dětské jméno ${jmeno}`)
  return j
}

test('Denisa není vzácné jméno — je to jméno generace rodičů', () => {
  const denisa = najdi('Denisa')
  assert.equal(jeVzacne(denisa), false, 'Denisa se zase označuje jako vzácná')
  assert.equal(jeDoznivajici(denisa), true)
  assert.equal(vlnaJmena(denisa), 'dozniva')
})

test('další běžná jména generace rodičů nejsou vzácná', () => {
  for (const jmeno of ['Blanka', 'Ludmila', 'Zuzana', 'Richard', 'Veronika']) {
    assert.equal(jeVzacne(najdi(jmeno)), false, `${jmeno} vychází jako vzácné jméno`)
  }
})

test('Ludmila se vrací, není to odkvetlá klasika ani novinka', () => {
  const l = najdi('Ludmila')
  assert.equal(vlnaJmena(l), 'retro')
  assert.equal(jeVyhled(l), true, 'jména, která se vracejí, patří do výhledu')
})

test('vzácné je jen to, co je vzácné doopravdy', () => {
  const vzacna = JMENA.filter(jeVzacne).map(j => j.jmeno)
  assert.ok(vzacna.includes('Kryšpín'), 'Kryšpín mezi vzácnými chybí')
  assert.ok(!vzacna.includes('Denisa'))
  assert.ok(!vzacna.includes('Zuzana'))
})

test('výhled obsahuje jen jména, kterých přibývá nebo se vracejí', () => {
  const vyhled = JMENA.filter(jeVyhled)
  assert.ok(vyhled.length >= 5, `výhled má jen ${vyhled.length} jmen`)
  for (const j of vyhled) {
    const v = vlnaJmena(j)
    assert.ok(v === 'stoupa' || v === 'retro', `${j.jmeno} má vlnu ${v}, do výhledu nepatří`)
  }
  // Do výhledu nesmí spadnout ani nejčastější jména, ani ta odcházející.
  assert.ok(!vyhled.some(jeVrchol))
  assert.ok(!vyhled.some(jeDoznivajici))
})

test('kategorie se nepřekrývají — jméno je právě v jedné vlně', () => {
  for (const j of JMENA) {
    const kolik = [jeVrchol, jeStalice, jeVzacne, jeDoznivajici].filter(f => f(j)).length
    assert.ok(kolik <= 1, `${j.jmeno} spadá do víc vln najednou`)
  }
})

test('cizí a zvířecí jména se dobově nezařazují', () => {
  const cizi = JMENA.filter(j => j.zeme !== 'cz' || !['kluk', 'holka'].includes(j.kategorie))
  for (const j of cizi) {
    assert.equal(vlnaJmena(j), undefined,
      `${j.jmeno} (${j.zeme}/${j.kategorie}) dostalo vlnu, i když o jeho době nic nevíme`)
  }
})

test('každá zapsaná vlna má odpovídající jméno v datech', () => {
  const ceska = new Set(JMENA.filter(j => j.zeme === 'cz'
    && (j.kategorie === 'kluk' || j.kategorie === 'holka')).map(j => j.jmeno))
  for (const jmeno of ZARAZENA_JMENA) {
    assert.ok(ceska.has(jmeno), `vlna zapsaná pro „${jmeno}", takové jméno ale v datech není`)
  }
})

test('každá vlna má štítek, popis i barvu', () => {
  for (const [vlna, info] of Object.entries(VLNA_INFO)) {
    assert.ok(info.stitek.length > 0, `${vlna} nemá štítek`)
    assert.ok(info.popis.length > 20, `${vlna} nemá pořádný popis`)
    assert.ok(info.trida.includes('bg-'), `${vlna} nemá barvu`)
  }
})

test('výhled je ukotvený v čase', () => {
  assert.equal(VYHLED[0], ROK_REVIZE)
  assert.equal(VYHLED[1], ROK_REVIZE + 1)
  assert.ok(ROK_REVIZE >= 2026, 'rok revize vypadá zastarale')
})
