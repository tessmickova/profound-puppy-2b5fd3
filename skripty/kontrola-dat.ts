// Kontrola datasetu jmen.
//
// Běží před buildem. Kritická chyba build zastaví — nemá smysl vydat web,
// který má dvě jména se stejným id nebo odkazuje na neexistující zemi.
// Drobnosti jen vypíše, ať je vidět, co je do budoucna k opravě.

import { JMENA, ZEME } from '../lib/names/data'
import { VSECHNA_PLEMENA } from '../lib/names/breeds'
import { VSECHNY_ENTITY, ENTITY_SE_STRANKOU } from '../lib/names/entita'
import { slugJmena } from '../lib/names/slug'
import { KATEGORIE_INFO } from '../lib/names/types'

const kriticke: string[] = []
const drobnosti: string[] = []

const kodyZemi = new Set(ZEME.map(z => z.kod))
const kategorie = new Set(Object.keys(KATEGORIE_INFO))

// ── jména ────────────────────────────────────────────────────────────────
const videnaId = new Set<string>()
const dvojice = new Set<string>()

for (const j of JMENA) {
  if (videnaId.has(j.id)) kriticke.push(`duplicitní id: ${j.id}`)
  videnaId.add(j.id)

  if (!j.jmeno.trim()) kriticke.push(`prázdné jméno u id ${j.id}`)
  if (j.jmeno !== j.jmeno.normalize('NFC')) {
    kriticke.push(`jméno není v NFC: ${j.jmeno} (${j.id})`)
  }
  if (!kodyZemi.has(j.zeme)) kriticke.push(`neznámá země „${j.zeme}" u ${j.jmeno} (${j.id})`)
  if (!kategorie.has(j.kategorie)) kriticke.push(`neznámá kategorie „${j.kategorie}" u ${j.id}`)
  if (!slugJmena(j.jmeno)) kriticke.push(`z jména „${j.jmeno}" nevznikne adresa (${j.id})`)

  if (!Number.isInteger(j.popularita) || j.popularita < 0 || j.popularita > 100) {
    kriticke.push(`oblíbenost mimo 0–100: ${j.jmeno} = ${j.popularita}`)
  }
  if (j.delka !== j.jmeno.replace(/\s/g, '').length) {
    drobnosti.push(`délka nesedí: ${j.jmeno} má ${j.delka}, spočítáno ${j.jmeno.replace(/\s/g, '').length}`)
  }
  if (j.slabiky < 1) drobnosti.push(`nulový počet slabik: ${j.jmeno}`)
  if (!j.vyznam.trim()) drobnosti.push(`chybí význam: ${j.jmeno} (${j.id})`)
  if (j.mesice.some(m => m < 1 || m > 12)) kriticke.push(`neplatný měsíc u ${j.jmeno}`)
  if (j.svatek && !/^\d{1,2}\.\s?\d{1,2}\.$/.test(j.svatek)) {
    drobnosti.push(`svátek v jiném tvaru než „1. 2.": ${j.jmeno} = ${j.svatek}`)
  }

  const klic = `${j.zeme}|${j.kategorie}|${slugJmena(j.jmeno)}`
  if (dvojice.has(klic)) kriticke.push(`stejné jméno dvakrát v jedné zemi a kategorii: ${klic}`)
  dvojice.add(klic)
}

// ── adresy detailů ───────────────────────────────────────────────────────
const slugy = new Map<string, string>()
for (const e of VSECHNY_ENTITY) {
  const drive = slugy.get(e.slug)
  if (drive && drive !== e.jmeno) {
    kriticke.push(`dvě různá jména mají stejnou adresu /jmeno/${e.slug}: ${drive} a ${e.jmeno}`)
  }
  slugy.set(e.slug, e.jmeno)
}

// ── plemena ──────────────────────────────────────────────────────────────
const podleJmena = new Map<string, Set<string>>()
for (const j of JMENA) {
  const k = slugJmena(j.jmeno)
  if (!podleJmena.has(k)) podleJmena.set(k, new Set())
  podleJmena.get(k)!.add(j.kategorie)
}

for (const p of VSECHNA_PLEMENA) {
  if (!kodyZemi.has(p.puvod)) kriticke.push(`plemeno ${p.nazev} má neznámou zemi původu „${p.puvod}"`)
  for (const d of p.doporucena ?? []) {
    const kat = podleJmena.get(slugJmena(d))
    if (!kat) {
      kriticke.push(`plemeno ${p.nazev} doporučuje jméno „${d}", které v katalogu není`)
      continue
    }
    const ocekavane = p.druh === 'pes' ? ['pes', 'fenka'] : ['kocour', 'kocka']
    if (!ocekavane.some(o => kat.has(o))) {
      kriticke.push(`plemeno ${p.nazev} (${p.druh}) doporučuje „${d}", které je vedené jen jako ${[...kat].join(', ')}`)
    }
  }
}

// ── výsledek ─────────────────────────────────────────────────────────────
console.log(`Kontrola dat: ${JMENA.length} jmen, ${VSECHNY_ENTITY.length} entit, `
  + `${ENTITY_SE_STRANKOU.length} s vlastní stránkou, ${VSECHNA_PLEMENA.length} plemen.`)

if (drobnosti.length) {
  console.log(`\nDrobnosti k opravě (${drobnosti.length}):`)
  for (const d of drobnosti.slice(0, 25)) console.log('  · ' + d)
  if (drobnosti.length > 25) console.log(`  … a dalších ${drobnosti.length - 25}`)
}

if (kriticke.length) {
  console.error(`\nKRITICKÉ CHYBY V DATECH (${kriticke.length}):`)
  for (const k of kriticke.slice(0, 40)) console.error('  ✗ ' + k)
  if (kriticke.length > 40) console.error(`  … a dalších ${kriticke.length - 40}`)
  console.error('\nBuild zastaven. Opravte data a spusťte znovu.')
  process.exit(1)
}

console.log('\nData jsou v pořádku.')
