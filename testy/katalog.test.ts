// Katalog ukazuje jména, ne řádky databáze.
//
// Vzniklo z konkrétní stížnosti: na stránce holčičích jmen byla Alice
// několikrát, Sofia/Sofía jako samostatné položky a Ema dvakrát. Jsou to
// výskyty téhož jména v různých zemích — patří na jednu kartu s vlaječkami.

import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { JMENA } from '../lib/names/data'
import { unikatniPodleJmena } from '../lib/names/entita'
import { serad } from '../lib/names/logic'
import { slugJmena } from '../lib/names/slug'
import { VYHLEDY, odkazVyhledu, vyhledPodleId } from '../lib/names/vyhledy'

test('deduplikace nechá každé jméno jen jednou', () => {
  const holcici = JMENA.filter(j => j.kategorie === 'holka')
  const unikatni = unikatniPodleJmena(holcici)
  const slugy = unikatni.map(u => slugJmena(u.jmeno.jmeno))
  assert.equal(new Set(slugy).size, slugy.length, 've výpisu je jméno vícekrát')
  assert.ok(unikatni.length < holcici.length, 'katalog nemá žádné duplicity — test by pak nic nehlídal')
})

test('deduplikace posbírá všechny země jednoho jména', () => {
  const vsechna = JMENA.filter(j => j.kategorie === 'holka' || j.kategorie === 'kluk')
  const unikatni = unikatniPodleJmena(vsechna)
  const vicezeme = unikatni.find(u => u.zeme.length > 1)
  assert.ok(vicezeme, 'žádné jméno se nepoužívá ve víc zemích?')
  assert.equal(new Set(vicezeme!.zeme).size, vicezeme!.zeme.length, 'země se opakují')
  const vyskyty = vsechna.filter(j => slugJmena(j.jmeno) === slugJmena(vicezeme!.jmeno.jmeno))
  assert.equal(vicezeme!.zeme.length, new Set(vyskyty.map(j => j.zeme)).size)
})

test('deduplikace zachová pořadí — reprezentant je nejsilnější výskyt', () => {
  const serazena = serad(JMENA.filter(j => j.kategorie === 'kluk'), 'popularita')
  const unikatni = unikatniPodleJmena(serazena)
  for (let i = 1; i < unikatni.length; i++) {
    assert.ok(
      unikatni[i - 1].jmeno.popularita >= unikatni[i].jmeno.popularita,
      `pořadí se rozsypalo u ${unikatni[i].jmeno.jmeno}`,
    )
  }
})

// ── pojmenované výběry ───────────────────────────────────────────────────
//
// Odkaz „zobrazit všechna" u sekce musí otevřít tutéž skupinu, ne obecný
// katalog. Sekce i filtr proto čtou pravidlo ze stejného seznamu.

test('každý výběr má neprázdný obsah a použitelný odkaz', () => {
  for (const v of VYHLEDY) {
    const sedici = JMENA.filter(j => {
      const jeDite = j.kategorie === 'kluk' || j.kategorie === 'holka'
      return (v.druh === 'deti' ? jeDite : !jeDite) && v.sedi(j)
    })
    assert.ok(sedici.length >= 6, `výběr ${v.id} má jen ${sedici.length} jmen — sekce by zela prázdnotou`)
    const odkaz = odkazVyhledu(v)
    assert.ok(odkaz.includes(`filtr=${v.id}`), `odkaz výběru ${v.id} nenese kontext`)
    assert.ok(odkaz.startsWith(v.druh === 'deti' ? '/deti' : '/zvirata'))
  }
})

test('id výběrů se neopakují a dají se dohledat', () => {
  const ids = VYHLEDY.map(v => v.id)
  assert.equal(new Set(ids).size, ids.length)
  for (const id of ids) assert.equal(vyhledPodleId(id)?.id, id)
  assert.equal(vyhledPodleId('neexistuje'), undefined)
  assert.equal(vyhledPodleId(null), undefined)
})
