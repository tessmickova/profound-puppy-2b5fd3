// Testy zápisu jmen: české a světové podoby.
//
// Vzniklo to z konkrétní připomínky: „sem tam maminky chtějí i nějaké,
// co znějí zahraničně — třeba Melanie, Theodor." Katalog měl vždycky jen
// jednu podobu, takže kdo hledal Theodora, nenašel nic — a přitom
// v katalogu Teodor je.

import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { JMENA } from '../lib/names/data'
import { najdi } from '../lib/names/rejstrik'
import {
  JMENA_S_VARIANTOU, SVETOVA_JMENA, variantyZapisu, znejeSvetove,
} from '../lib/names/zapis'

const ceskaDetska = new Set(
  JMENA.filter(j => j.zeme === 'cz' && (j.kategorie === 'kluk' || j.kategorie === 'holka'))
    .map(j => j.jmeno),
)

test('kdo hledá cizí podobu, najde tu českou', () => {
  const pary: [string, string][] = [
    ['Theodor', 'Teodor'],
    ['Melanie', 'Melánie'],
    ['Sofia', 'Sofie'],
    ['Sebastian', 'Sebastián'],
    ['Nicolas', 'Mikuláš'],
    ['Elizabeth', 'Alžběta'],
  ]
  for (const [hledane, ocekavane] of pary) {
    const nalezene = najdi(hledane, 8).map(p => p.j)
    assert.ok(nalezene.includes(ocekavane),
      `„${hledane}" nenašlo ${ocekavane} — našlo: ${nalezene.join(', ') || '(nic)'}`)
  }
})

test('varianta není samostatné české dětské jméno', () => {
  // Jinak by „jiný zápis" odkazoval na cizí kartu s vlastním významem.
  for (const jmeno of JMENA_S_VARIANTOU) {
    for (const varianta of variantyZapisu(jmeno)) {
      assert.ok(!ceskaDetska.has(varianta),
        `„${varianta}" je vedená jako zápis jména ${jmeno}, ale je to samostatné jméno`)
    }
  }
})

test('varianta se neopakuje a neshoduje se s vlastním jménem', () => {
  for (const jmeno of JMENA_S_VARIANTOU) {
    const v = variantyZapisu(jmeno)
    assert.ok(!v.includes(jmeno), `${jmeno} je uvedené jako varianta sebe sama`)
    assert.equal(new Set(v).size, v.length, `${jmeno} má zdvojenou variantu`)
  }
})

test('všechna evidovaná jména v katalogu skutečně jsou', () => {
  for (const jmeno of [...JMENA_S_VARIANTOU, ...SVETOVA_JMENA]) {
    assert.ok(ceskaDetska.has(jmeno), `„${jmeno}" v datech jako české dětské jméno není`)
  }
})

test('světový zvuk se hlásí jen u českých dětských jmen', () => {
  for (const j of JMENA) {
    if (j.zeme === 'cz' && (j.kategorie === 'kluk' || j.kategorie === 'holka')) continue
    assert.equal(znejeSvetove(j), false,
      `${j.jmeno} (${j.zeme}/${j.kategorie}) je označené jako světově znějící`)
  }
})

test('světově znějících jmen je dost na vlastní sekci', () => {
  const kolik = JMENA.filter(znejeSvetove).length
  assert.ok(kolik >= 12, `jen ${kolik} světově znějících jmen — na sekci to nestačí`)
})

test('Theodor a Melanie, které maminky chtějí, web zná', () => {
  assert.deepEqual(variantyZapisu('Teodor'), ['Theodor'])
  assert.deepEqual(variantyZapisu('Melánie'), ['Melanie'])
})
