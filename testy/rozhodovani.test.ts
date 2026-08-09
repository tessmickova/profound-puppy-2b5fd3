// Testy rozhodovacích nástrojů.
//
// Hlídáme dvě věci, které se v takovém systému kazí nejsnáz:
// 1. že se z voleb doopravdy odvodí vkus (a ne náhoda),
// 2. že jedno pravidlo nepřebije všechna ostatní.
//
// Druhý bod není teorie: příspěvek příjmení se původně sčítal jako
// absolutní číslo, takže pouhé vyplnění příjmení přeskládalo celý žebříček
// bez ohledu na to, co si člověk naklikal. Test to drží pod kontrolou.

import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { JMENA } from '../lib/names/data'
import {
  doporuc, naucSe, otestuj, popisPreferenci, porovnej, slovemSkore,
} from '../lib/names/rozhodovani'
import { NEUTRALNI_SOUZVUK, souzvukSPrijmenim } from '../lib/names/logic'
import { genitiv, hlaskovani, inicialka, osloveni, zkontrolujInicialy } from '../lib/names/cestina'

// ── učení z voleb ─────────────────────────────────────────────────────────

test('z voleb tradičních jmen vyjde příklon k tradičním', () => {
  const tradicni = JMENA.filter(j => j.kategorie === 'holka' && j.styly.includes('tradiční')).slice(0, 3)
  const moderni = JMENA.filter(j => j.kategorie === 'holka' && j.styly.includes('moderní')).slice(0, 3)
  assert.ok(tradicni.length === 3 && moderni.length === 3, 'nedost dat pro test')

  const p = naucSe(tradicni, moderni)
  assert.ok(p.modernost < -0.3, `čekali jsme příklon k tradičním, vyšlo ${p.modernost}`)
  assert.ok(popisPreferenci(p).includes('spíš tradiční jména'))
})

test('bez voleb je vkus prázdný a nic netvrdíme', () => {
  const p = naucSe([], [])
  assert.deepEqual(popisPreferenci(p), [])
})

test('preference se drží v rozsahu −1…1 i po mnoha volbách', () => {
  const vsechny = JMENA.filter(j => j.kategorie === 'holka').slice(0, 40)
  const p = naucSe(vsechny, [])
  for (const [osa, hodnota] of Object.entries(p)) {
    assert.ok(hodnota >= -1 && hodnota <= 1, `${osa} = ${hodnota} je mimo rozsah`)
  }
})

// ── doporučení ────────────────────────────────────────────────────────────

test('doporučení respektuje kategorii a vynechaná jména', () => {
  const vynechane = JMENA.find(j => j.kategorie === 'kluk')!
  const navrhy = doporuc({
    preference: naucSe([], []),
    kategorie: ['kluk'],
    vynech: [vynechane.id],
  }, 10)

  assert.equal(navrhy.length, 10)
  assert.ok(navrhy.every(d => d.jmeno.kategorie === 'kluk'))
  assert.ok(!navrhy.some(d => d.jmeno.id === vynechane.id))
})

test('příjmení výsledky doladí, ale nepřebije naučený vkus', () => {
  const tradicni = JMENA.filter(j => j.kategorie === 'holka' && j.styly.includes('tradiční')).slice(0, 4)
  const moderni = JMENA.filter(j => j.kategorie === 'holka' && j.styly.includes('moderní')).slice(0, 4)
  const preference = naucSe(tradicni, moderni)

  const bez = doporuc({ preference, kategorie: ['holka'] }, 8).map(d => d.jmeno.id)
  const s = doporuc({ preference, kategorie: ['holka'], prijmeni: 'Nováková' }, 8).map(d => d.jmeno.id)

  const spolecnych = s.filter(id => bez.includes(id)).length
  assert.ok(spolecnych >= 5, `po zadání příjmení zbyla jen ${spolecnych} z 8 původních jmen — příjmení přebilo vkus`)
})

test('u každého doporučení jde skóre vysvětlit', () => {
  const preference = naucSe(
    JMENA.filter(j => j.kategorie === 'holka' && j.styly.includes('moderní')).slice(0, 4),
    JMENA.filter(j => j.kategorie === 'holka' && j.styly.includes('tradiční')).slice(0, 4),
  )
  const navrhy = doporuc({ preference, kategorie: ['holka'], prijmeni: 'Svobodová' }, 5)
  for (const d of navrhy) {
    assert.ok(d.skore >= 0 && d.skore <= 100, `skóre ${d.skore} mimo rozsah`)
    assert.ok(d.duvody.length > 0, `${d.jmeno.jmeno} nemá žádný důvod`)
    assert.ok(typeof slovemSkore(d.skore) === 'string')
  }
})

// ── souzvuk s příjmením ───────────────────────────────────────────────────

test('rým s příjmením je důvod PROTI, ne pro', () => {
  // Obě slova končí na „na" — pravidlo o říkance musí sepnout.
  const s = souzvukSPrijmenim('Jana', 'Kubelíková')
  const rym = souzvukSPrijmenim('Vaňková', 'Nováková')
  assert.ok(rym.duvody.some(d => d.includes('rýmuje')), 'rým se vůbec nezachytil')
  const i = rym.duvody.findIndex(d => d.includes('rýmuje'))
  assert.equal(rym.kladne[i], false, 'rým se ukazuje jako výhoda')
  assert.equal(s.duvody.length, s.kladne.length, 'ke každému důvodu chybí znaménko')
})

test('neutrální souzvuk je skutečně výchozí hodnota', () => {
  const s = souzvukSPrijmenim('Adam', 'Novák')
  const posun = s.body - NEUTRALNI_SOUZVUK
  assert.ok(Math.abs(posun) <= 30, `posun ${posun} je nepravděpodobně velký`)
})

// ── porovnání finalistů ───────────────────────────────────────────────────

test('porovnání vrátí řádky pro obě jména a označí rozdíly', () => {
  const v = porovnej(['Eliška', 'Amálie'])
  assert.equal(v.jmena.length, 2)
  assert.ok(v.radky.length >= 5, `čekali jsme aspoň 5 řádků, přišlo ${v.radky.length}`)
  for (const r of v.radky) {
    assert.equal(r.odpovedi.length, 2, `řádek „${r.otazka}" nemá odpověď pro každé jméno`)
  }
  assert.ok(v.radky.some(r => r.odlisuje), 'žádný řádek není označený jako rozdíl')
  assert.ok(v.vCemSeLisi.length > 0)
})

test('porovnání zvládne i jméno, které v katalogu není', () => {
  const v = porovnej(['Eliška', 'Xantipa'])
  assert.equal(v.jmena.length, 2)
  assert.equal(v.jmena[1].zaznam ?? null, null, 'neznámé jméno nemá mít záznam v katalogu')
  assert.ok(v.radky.every(r => r.odpovedi.every(o => typeof o === 'string' && o.length > 0)))
})

// ── test jména s příjmením ────────────────────────────────────────────────

test('test jména pokrývá oslovení, iniciály i diakritiku', () => {
  const body = otestuj('Eliška', 'Nováková')
  const texty = body.map(b => `${b.otazka}: ${b.odpoved}`).join('\n')
  assert.ok(body.length >= 6, `čekali jsme aspoň 6 bodů, přišlo ${body.length}`)
  assert.ok(/Eliško/.test(texty), 'chybí 5. pád')
  assert.ok(/E\. N\./.test(texty), 'chybí iniciály')
  assert.ok(/Eliska/.test(texty), 'chybí podoba bez diakritiky')
  assert.ok(body.every(b => ['dobre', 'zvazte', 'neutral'].includes(b.stav)))
})

// ── česká gramatika kolem jmen ────────────────────────────────────────────

test('oslovení sedí u běžných českých vzorů', () => {
  const spravne: [string, string][] = [
    ['Eliška', 'Eliško'], ['Marie', 'Marie'], ['Jan', 'Jane'],
    ['Marek', 'Marku'], ['Patrik', 'Patriku'], ['Jiří', 'Jiří'], ['Dagmar', 'Dagmar'],
  ]
  for (const [vstup, cekano] of spravne) {
    assert.equal(osloveni(vstup), cekano, `${vstup} → ${osloveni(vstup)}, čekali jsme ${cekano}`)
  }
})

test('genitiv sedí u běžných vzorů', () => {
  const spravne: [string, string][] = [
    ['Eliška', 'Elišky'], ['Adam', 'Adama'], ['Marie', 'Marie'], ['Hugo', 'Hugo'],
  ]
  for (const [vstup, cekano] of spravne) {
    assert.equal(genitiv(vstup), cekano, `${vstup} → ${genitiv(vstup)}, čekali jsme ${cekano}`)
  }
})

test('iniciály se hlásí jen u skutečných zkratek, ne u dojmů', () => {
  assert.equal(zkontrolujInicialy(['Eliška', 'Nováková']).poznamka, null)
  assert.equal(zkontrolujInicialy(['Eliška', 'Nováková']).text, 'E. N.')
  assert.ok(zkontrolujInicialy(['Simona', 'Svobodová']).poznamka?.includes('SS'))
  assert.equal(inicialka('Šárka'), 'S')
})

test('hláskování označí cizí zápis, ale nikoho neodsoudí', () => {
  assert.equal(hlaskovani('Adam').snadne, true)
  assert.equal(hlaskovani('Maxwell').snadne, false)
  assert.ok(hlaskovani('Maxwell').duvod.length > 0)
})
