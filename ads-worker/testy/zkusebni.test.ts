// Zkušební objednávka nesmí sáhnout na skutečný provoz.
//
// Majitelka potřebovala projít celou cestu nákupu dřív, než je zapnuté
// placení — jinak si nemůže vyzkoušet, co zákazník vlastně zažije. Zkouška
// proto zakládá objednávku ve stavu `zkusebni`.
//
// Celá bezpečnost toho nápadu stojí na dvou dotazech v SQL, které si tady
// hlídáme doslovně:
//
//   1. unikátní index na slot pokrývá jen `ceka_na_platbu` a `aktivni`,
//      takže zkouška plochu nezabere a skutečný zákazník ji pořád koupí,
//   2. výdej reklam čte jen `aktivni`, takže se zkouška nikde nezobrazí.
//
// Kdyby někdo do některého z těch výčtů `zkusebni` přidal, zkušební
// objednávky by začaly blokovat prodej nebo se ukazovat návštěvníkům.

import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const KOREN = join(import.meta.dirname, '..')
const schema = readFileSync(join(KOREN, 'schema.sql'), 'utf8')
const migrace002 = readFileSync(join(KOREN, 'migrace/002-sloty-a-idempotence.sql'), 'utf8')
const db = readFileSync(join(KOREN, 'src/db.ts'), 'utf8')
const index = readFileSync(join(KOREN, 'src/index.ts'), 'utf8')

test('zkušební objednávka nezabírá plochu — index na slot ji nevidí', () => {
  for (const [kde, text] of [['schema.sql', schema], ['migrace 002', migrace002]] as const) {
    const m = /idx_objednavky_zivy_slot[\s\S]*?WHERE stav IN \(([^)]*)\)/.exec(text)
    assert.ok(m, `${kde}: index na živý slot nenalezen`)
    const stavy = m[1]
    assert.ok(!/zkusebni/.test(stavy),
      `${kde}: 'zkusebni' je ve výčtu indexu — zkouška by zabrala plochu skutečnému zákazníkovi`)
    assert.ok(/ceka_na_platbu/.test(stavy) && /aktivni/.test(stavy),
      `${kde}: index musí dál pokrývat ceka_na_platbu i aktivni`)
  }
})

test('zkušební objednávka se nezobrazí návštěvníkům', () => {
  // Oba dotazy, které vydávají reklamy na web, se ptají na stav.
  const dotazy = db.match(/o\.stav\s*=\s*'[a-z_]+'|WHERE o\.stav\s*=\s*'[a-z_]+'/g) ?? []
  assert.ok(dotazy.length >= 2, `čekáme aspoň dva dotazy na stav, našli jsme ${dotazy.length}`)
  for (const d of dotazy) {
    assert.ok(/'aktivni'/.test(d), `dotaz vydává i jiný stav než aktivni: ${d}`)
  }
  assert.ok(!/zkusebni/.test(db),
    'db.ts zná stav zkusebni — výdej reklam o něm nemá vůbec vědět')
})

test('bez plateb projde jen zkouška, skutečná objednávka ne', () => {
  // Podmínka musí zůstat „nejde zaplatit A ZÁROVEŇ nejde o zkoušku".
  // Kdyby se `&& !chceZkusebni` ztratilo, zablokovala by se i zkouška;
  // kdyby se ztratilo `!lzeZaplatit`, prošla by objednávka bez platby.
  assert.ok(/if \(!lzeZaplatit\(env\) && !chceZkusebni\)/.test(index),
    'změnila se podmínka, která pouští zkoušku kolem pozastaveného prodeje')
  assert.ok(/chceZkusebni \? 'zkusebni' : 'ceka_na_platbu'/.test(index),
    'stav objednávky se už neodvozuje od příznaku zkoušky')
})

test('zkouška nechystá platbu ani variabilní symbol', () => {
  assert.ok(/o\.zkusebni \? null : await pripravPlatbu/.test(index),
    'zkušební objednávka by dostala pokyny k platbě — zákazník by poslal peníze nadarmo')
})
