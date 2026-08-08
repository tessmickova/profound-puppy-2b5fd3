// Jednotkové testy toho, co se dá pokazit potichu.
// Spouští se přes `npm test` (node:test + tsx, žádná další závislost).

import { strict as assert } from 'node:assert'
import { test } from 'node:test'

import { slugJmena, bezDiakritiky } from '../lib/names/slug'
import { velke } from '../lib/names/logic'
import { KATEGORIE_INFO } from '../lib/names/types'
import { ZEME } from '../lib/names/data'
import {
  CENA_MESIC_KC, OBDOBI, PLOCH, cenaKc, jeObdobi, jePlocha, plochaCislo, popisPlochy,
} from '../shared/reklama'
import { chybejiciUdaje, jeProdukcniAdresa } from '../shared/provozovatel'
import { ENTITY_SE_STRANKOU, maDostDat, VSECHNY_ENTITY } from '../lib/names/entita'

// ── adresy a normalizace ─────────────────────────────────────────────────
test('slug shazuje diakritiku a drží se malých písmen', () => {
  assert.equal(slugJmena('Eliška'), 'eliska')
  assert.equal(slugJmena('Ödön'), 'odon')
  assert.equal(slugJmena('Mary Jane'), 'mary-jane')
  assert.equal(slugJmena("D'Artagnan"), 'd-artagnan')
})

test('hledání funguje s diakritikou i bez ní', () => {
  assert.equal(bezDiakritiky('Eliška'), 'eliska')
  assert.equal(bezDiakritiky('ELIŠKA'), 'eliska')
  assert.equal(bezDiakritiky('eliska'), 'eliska')
})

test('slugy jmen se nekříží', () => {
  const podle = new Map<string, string>()
  for (const e of VSECHNY_ENTITY) {
    const drive = podle.get(e.slug)
    assert.ok(!drive || drive === e.jmeno, `kolize adresy ${e.slug}: ${drive} × ${e.jmeno}`)
    podle.set(e.slug, e.jmeno)
  }
})

// ── čeština ──────────────────────────────────────────────────────────────
test('kategorie mají 4. pád pro vazbu „jména pro …"', () => {
  assert.equal(KATEGORIE_INFO.pes.proKoho, 'psy')
  assert.equal(KATEGORIE_INFO.kocour.proKoho, 'kocoury')
  assert.equal(KATEGORIE_INFO.kralik.proKoho, 'králíky')
  assert.equal(KATEGORIE_INFO.papousek.proKoho, 'papoušky')
  assert.equal(KATEGORIE_INFO.krecek.proKoho, 'křečky')
})

// U rodu ženského je 1. a 4. pád množného čísla stejný („fenky, kočky"),
// u mužského životného ne („psi" × „psy"). Test hlídá jen ty, kde se liší —
// tam vznikala chyba „Jména pro psi".
test('mužské kategorie mají v 4. pádu jiný tvar než v 1.', () => {
  const musiSeLisit = ['pes', 'kocour', 'kralik', 'papousek', 'krecek', 'kluk'] as const
  for (const id of musiSeLisit) {
    const info = KATEGORIE_INFO[id]
    assert.notEqual(info.proKoho, info.mnozne.toLowerCase(),
      `kategorie ${id} má „jména pro ${info.proKoho}" — to je 1. pád`)
  }
})

test('vazba „jména pro …" je česky u všech kategorií', () => {
  const spravne: Record<string, string> = {
    pes: 'psy', fenka: 'fenky', kocour: 'kocoury', kocka: 'kočky', kun: 'koně',
    kralik: 'králíky', papousek: 'papoušky', krecek: 'křečky',
    kluk: 'kluky', holka: 'holčičky',
  }
  for (const [id, tvar] of Object.entries(spravne)) {
    assert.equal(KATEGORIE_INFO[id as keyof typeof KATEGORIE_INFO].proKoho, tvar)
  }
})

test('každá země má 2. pád i přídavné jméno', () => {
  for (const z of ZEME) {
    assert.ok(z.genitiv?.trim(), `${z.nazev} nemá 2. pád`)
    assert.ok(z.pridavne?.trim(), `${z.nazev} nemá přídavné jméno`)
    assert.ok(z.pridavne === z.pridavne.toLowerCase(),
      `přídavné jméno ${z.nazev} má být malým písmenem`)
  }
})

// Většina zemí se ve 2. pádu mění („Česko → Česka"). Ty, které ne, jsou
// vyjmenované — jinak by test propustil zapomenuté doplnění.
test('2. pád je doplněný ručně, ne opsaný z 1. pádu', () => {
  const stejne = new Set(['fr', 'it', 'au', 'in', 'us', 'br'])
  for (const z of ZEME) {
    if (stejne.has(z.kod)) continue
    assert.notEqual(z.genitiv, z.nazev, `2. pád ${z.nazev} je stejný jako 1. pád`)
  }
})

test('velké() zvedne první písmeno i s diakritikou', () => {
  assert.equal(velke('česká'), 'Česká')
  assert.equal(velke(''), '')
})

// ── reklamní config ──────────────────────────────────────────────────────
test('ceny se počítají z jednoho ceníku', () => {
  assert.equal(cenaKc('mesic'), CENA_MESIC_KC)
  assert.equal(cenaKc('dva'), CENA_MESIC_KC * 2)
  assert.equal(cenaKc('tri'), CENA_MESIC_KC * 3)
})

test('neznámé období se nepustí dál', () => {
  assert.ok(jeObdobi('mesic'))
  assert.ok(!jeObdobi('rok'))
  assert.ok(!jeObdobi('pulrok'))
  assert.ok(!jeObdobi(null))
})

test('plochy jdou 1 až PLOCH a nic mimo', () => {
  assert.ok(jePlocha('plocha-1'))
  assert.ok(jePlocha(`plocha-${PLOCH}`))
  assert.ok(!jePlocha(`plocha-${PLOCH + 1}`))
  assert.ok(!jePlocha('plocha-0'))
  assert.ok(!jePlocha('plocha-01x'))
  assert.ok(!jePlocha('../../etc/passwd'))
  assert.equal(plochaCislo('plocha-7'), 7)
  assert.equal(plochaCislo('nesmysl'), 0)
})

test('popis plochy sedí na sloupce a strany', () => {
  assert.match(popisPlochy(1), /levý sloupec, 1\. shora — strana A/)
  assert.match(popisPlochy(2), /levý sloupec, 1\. shora — strana B/)
  assert.match(popisPlochy(20), /pravý sloupec, 5\. shora — strana B/)
})

test('období jsou jen 1–3 měsíce', () => {
  assert.deepEqual(OBDOBI.map(o => o.id), ['mesic', 'dva', 'tri'])
  assert.ok(OBDOBI.every(o => o.dnu <= 90))
})

// ── produkční config ─────────────────────────────────────────────────────
test('zástupné údaje projdou kontrolou jako chybějící', () => {
  const chybi = chybejiciUdaje({
    nazev: 'VYPLNIT s.r.o.', ico: '00000000', dic: '', platceDph: false,
    sidlo: 'VYPLNIT — sídlo', email: 'VYPLNIT@example.com',
    emailReklama: 'VYPLNIT@example.com', ucet: 'VYPLNIT/0000',
  })
  assert.ok(chybi.includes('nazev'))
  assert.ok(chybi.includes('ico'))
  assert.ok(chybi.includes('sidlo'))
})

test('doplněné údaje projdou', () => {
  const chybi = chybejiciUdaje({
    nazev: 'Ukázka s.r.o.', ico: '12345678', dic: '', platceDph: false,
    sidlo: 'Ukázková 1, Praha', email: 'info@example.com',
    emailReklama: 'reklama@example.com', ucet: '123456789/0800',
  })
  assert.deepEqual(chybi, [])
})

test('plátce DPH bez DIČ neprojde', () => {
  const chybi = chybejiciUdaje({
    nazev: 'Ukázka s.r.o.', ico: '12345678', dic: '', platceDph: true,
    sidlo: 'Ukázková 1, Praha', email: 'info@example.com',
    emailReklama: 'reklama@example.com', ucet: '123456789/0800',
  })
  assert.ok(chybi.includes('dic'))
})

test('náhledové adresy nejsou produkční', () => {
  assert.ok(!jeProdukcniAdresa('http://localhost:3000'))
  assert.ok(!jeProdukcniAdresa('https://neco.workers.dev') === false)
  assert.ok(!jeProdukcniAdresa('https://127.0.0.1'))
  assert.ok(jeProdukcniAdresa('https://svetjmen.cz'))
})

// ── entity ───────────────────────────────────────────────────────────────
test('vlastní stránku dostane jen jméno s dostatkem dat', () => {
  assert.ok(ENTITY_SE_STRANKOU.length > 0)
  assert.ok(ENTITY_SE_STRANKOU.length < VSECHNY_ENTITY.length,
    'stránku nesmí dostat úplně všechno — to by byly doorway pages')
  for (const e of ENTITY_SE_STRANKOU) assert.ok(maDostDat(e))
})

test('prázdný význam na stránku nestačí', () => {
  assert.ok(!maDostDat({
    slug: 'x', jmeno: 'X', vyskyty: [], kategorie: ['kluk'], zeme: ['cz'],
    vyznam: '', domacky: [], oblibenost: 50, slabiky: 1, delka: 1,
    jeLidske: true, jeZvireci: false,
  }))
})
