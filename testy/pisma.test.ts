// Písma si nosíme s sebou.
//
// Do 15. 8. 2026 se stahovala při každém sestavení z Google Fonts. Písmo
// se zapeklo do výstupu, takže návštěvník na Google nechodil — ale build
// ano, a když Google neodpověděl, nasazení spadlo (`module-not-found`
// na Baloo 2). Stalo se to uprostřed vydání.
//
// Testy hlídají tři věci, na kterých to stojí:
//   1. soubory jsou v repozitáři a nejsou prázdné,
//   2. na Google se odnikud nesahá,
//   3. `unicode-range` je u každého řezu — bez něj by čeština ztratila háčky.

import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const KOREN = join(import.meta.dirname, '..')
const css = readFileSync(join(KOREN, 'app/globals.css'), 'utf8')

test('soubory písem jsou v repozitáři a mají obsah', () => {
  const ocekavane = [
    'baloo2-latin.woff2', 'baloo2-latin-ext.woff2',
    'nunito-latin.woff2', 'nunito-latin-ext.woff2',
  ]
  const jsou = readdirSync(join(KOREN, 'public/pisma'))
  for (const soubor of ocekavane) {
    assert.ok(jsou.includes(soubor), `chybí public/pisma/${soubor}`)
    const velikost = statSync(join(KOREN, 'public/pisma', soubor)).size
    assert.ok(velikost > 10_000, `${soubor} má jen ${velikost} B — nejspíš se nestáhl celý`)
  }
})

test('sestavení nesahá na Google Fonts', () => {
  // V komentářích se Google zmiňovat smí (vysvětlují, proč to tak je);
  // v kódu, který se vykoná, ne.
  const bezKomentaru = css.replace(/\/\*[\s\S]*?\*\//g, '')
  assert.ok(!/fonts\.(googleapis|gstatic)\.com/.test(bezKomentaru),
    'globals.css odkazuje na Google Fonts')

  const layout = readFileSync(join(KOREN, 'app/layout.tsx'), 'utf8')
  assert.ok(!/next\/font\/google/.test(layout),
    'layout.tsx používá next/font/google — build by zase závisel na Googlu')
})

test('každý řez má unicode-range, jinak by čeština přišla o háčky', () => {
  const rezy = css.match(/@font-face\s*\{[^}]*\}/g) ?? []
  assert.equal(rezy.length, 4, `čekáme 4 řezy, je jich ${rezy.length}`)
  for (const rez of rezy) {
    const rodina = rez.match(/font-family:\s*'([^']+)'/)?.[1]
    assert.ok(/unicode-range:/.test(rez), `${rodina}: chybí unicode-range`)
    assert.ok(/url\('\/pisma\/[a-z0-9-]+\.woff2'\)/.test(rez), `${rodina}: nečte se z /pisma/`)
    assert.ok(/font-display:\s*swap/.test(rez), `${rodina}: chybí font-display: swap`)
  }
})

test('české znaky spadají do rozsahu, který latin-ext pokrývá', () => {
  // Č U+010C, ě U+011B, ř U+0159, š U+0161, ž U+017E, ů U+016F — všechny
  // leží v U+0100-02BA, tedy v `latin-ext`. Kdyby se ten řez z CSS ztratil,
  // vykreslily by se náhradním písmem a nadpisy by se rozjely.
  const ext = (css.match(/@font-face\s*\{[^}]*latin-ext[^}]*\}/g) ?? [])
  assert.equal(ext.length, 2, 'chybí latin-ext řez pro některé písmo')
  for (const znak of ['Č', 'ě', 'ř', 'š', 'ž', 'ů']) {
    const kod = znak.codePointAt(0)!
    assert.ok(kod >= 0x0100 && kod <= 0x02ba, `${znak} (U+${kod.toString(16)}) leží mimo latin-ext`)
  }
})
