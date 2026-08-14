// Katalog bez duplicit: jméno používané ve víc zemích je jedna položka
// s vlaječkami, ne několik stejných karet pod sebou.

import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { unikatniPodleJmena } from '../lib/names/entita'
import { JMENA } from '../lib/names/data'
import { serad } from '../lib/names/logic'
import { slugJmena } from '../lib/names/slug'

test('unikatniPodleJmena sloučí výskyty téhož jména', () => {
  const holky = JMENA.filter(j => j.kategorie === 'holka')
  const unikatni = unikatniPodleJmena(serad(holky, 'popularita'))

  const slugy = unikatni.map(u => slugJmena(u.jmeno.jmeno))
  assert.equal(new Set(slugy).size, slugy.length, 'žádné jméno se nesmí opakovat')
  assert.ok(unikatni.length < holky.length, 'sloučení musí něco sloučit (Alice, Sofia…)')
})

test('sloučená položka nese všechny země výskytu', () => {
  const holky = JMENA.filter(j => j.kategorie === 'holka')
  const alice = unikatniPodleJmena(holky).find(u => slugJmena(u.jmeno.jmeno) === 'alice')
  assert.ok(alice, 'Alice je v datech vícekrát')
  assert.ok(alice!.zeme.length >= 2, `Alice má nést více zemí, má: ${alice!.zeme.join(',')}`)
  assert.equal(new Set(alice!.zeme).size, alice!.zeme.length)
})

test('pořadí vstupu se zachová — reprezentant je nejoblíbenější výskyt', () => {
  const holky = serad(JMENA.filter(j => j.kategorie === 'holka'), 'popularita')
  const unikatni = unikatniPodleJmena(holky)
  for (let i = 1; i < Math.min(unikatni.length, 30); i++) {
    assert.ok(
      unikatni[i - 1].jmeno.popularita >= unikatni[i].jmeno.popularita,
      'seřazení podle popularity musí přežít deduplikaci',
    )
  }
})
