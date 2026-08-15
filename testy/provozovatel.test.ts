// Údaje o provozovateli — jediná věc na webu, kterou si nesmíme vymyslet.
//
// Chybné IČO nebo účet, na který nedorazí peníze, není kosmetická vada:
// je to nepravdivý údaj v obchodním styku. Testy proto hlídají, že
// zástupné hodnoty nikdy neprojdou jako skutečné a že se dvě kopie
// týchž údajů (web × reklamní služba) nerozejdou.

import { strict as assert } from 'node:assert'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import {
  PROVOZOVATEL_UDAJE, ZASTUPNA, chybejiciPlatba, chybejiciTotoznost,
  chybejiciUdaje, jePlatneIco,
} from '../shared/provozovatel'

test('IČO provozovatele má platnou kontrolní číslici', () => {
  assert.ok(jePlatneIco(PROVOZOVATEL_UDAJE.ico), `${PROVOZOVATEL_UDAJE.ico} není platné IČO`)
})

test('kontrola IČO odhalí překlep, ne jen špatný počet číslic', () => {
  assert.ok(jePlatneIco('07347219'))
  // prohozené číslice — délka i tvar sedí, kontrolní číslice ne
  assert.ok(!jePlatneIco('07347291'))
  assert.ok(!jePlatneIco('12345678'))
  assert.ok(!jePlatneIco('0734721'), 'sedm číslic nesmí projít')
  assert.ok(!jePlatneIco('00000000'))
})

test('totožnost provozovatele je doplněná — web ji smí vypsat', () => {
  assert.deepEqual(chybejiciTotoznost(PROVOZOVATEL_UDAJE), [])
})

test('zástupné hodnoty se nikdy nevydávají za skutečné', () => {
  const zastupny = {
    ...PROVOZOVATEL_UDAJE,
    nazev: `${ZASTUPNA} s.r.o.`,
    ico: '00000000',
    sidlo: `${ZASTUPNA} — sídlo`,
  }
  const chybi = chybejiciTotoznost(zastupny)
  for (const pole of ['nazev', 'ico', 'sidlo']) {
    assert.ok(chybi.includes(pole), `${pole} se zástupnou hodnotou prošlo jako vyplněné`)
  }
})

test('bez bankovního účtu se nesmí prodávat reklama', () => {
  // Dokud majitelka nemá podnikatelský účet, tohle musí zůstat červené.
  assert.ok(
    chybejiciPlatba(PROVOZOVATEL_UDAJE).includes('ucet'),
    'účet je vyplněný — pak je potřeba tenhle test přepsat, ne smazat',
  )
  const sUctem = { ...PROVOZOVATEL_UDAJE, ucet: '123456789/0800' }
  assert.deepEqual(chybejiciPlatba(sUctem), [])
})

test('chybejiciUdaje spojí obojí — totožnost i platbu', () => {
  const vse = chybejiciUdaje(PROVOZOVATEL_UDAJE)
  assert.deepEqual(vse, [...chybejiciTotoznost(PROVOZOVATEL_UDAJE), ...chybejiciPlatba(PROVOZOVATEL_UDAJE)])
})

// ── web × reklamní služba ────────────────────────────────────────────────
//
// Reklamní služba běží jako samostatný Worker a údaje má ve vlastním
// `wrangler.toml`. Kdyby se rozešly, faktura by tvrdila něco jiného než
// patička. Nastavení proto porovnáváme přímo se zdrojem pravdy.

const tomlHodnota = (obsah: string, klic: string): string | null => {
  const m = new RegExp(`^${klic}\\s*=\\s*"([^"]*)"`, 'm').exec(obsah)
  return m ? m[1] : null
}

test('reklamní služba má tytéž údaje o provozovateli jako web', () => {
  const toml = readFileSync(new URL('../ads-worker/wrangler.toml', import.meta.url), 'utf8')
  assert.equal(tomlHodnota(toml, 'PROVOZOVATEL'), PROVOZOVATEL_UDAJE.nazev)
  assert.equal(tomlHodnota(toml, 'PROVOZOVATEL_ICO'), PROVOZOVATEL_UDAJE.ico)
  assert.equal(tomlHodnota(toml, 'PROVOZOVATEL_SIDLO'), PROVOZOVATEL_UDAJE.sidlo)
  assert.equal(tomlHodnota(toml, 'PROVOZOVATEL_EMAIL'), PROVOZOVATEL_UDAJE.emailReklama)
})

test('web má tytéž údaje ve wrangler.jsonc jako v kódu', () => {
  // Runtime proměnná přebíjí výchozí hodnotu z kódu, takže se rozejít nesmí.
  const jsonc = readFileSync(new URL('../wrangler.jsonc', import.meta.url), 'utf8')
  const hodnota = (klic: string) => new RegExp(`"${klic}"\\s*:\\s*"([^"]*)"`).exec(jsonc)?.[1] ?? null
  assert.equal(hodnota('NEXT_PUBLIC_PROVOZOVATEL'), PROVOZOVATEL_UDAJE.nazev)
  assert.equal(hodnota('NEXT_PUBLIC_ICO'), PROVOZOVATEL_UDAJE.ico)
  assert.equal(hodnota('NEXT_PUBLIC_SIDLO'), PROVOZOVATEL_UDAJE.sidlo)
})
