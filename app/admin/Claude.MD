# Admin / Diagnostika

## Účel
Interní diagnostická stránka pro ladění dat, thresholdů a algoritmů. Není veřejná.

## Soubor
`app/admin/page.tsx`

## Obsah stránky
1. **Data source info** — cache stav, timestamp posledního fetche, timeouty
2. **Raw aurora data** — KP, Bz, solar wind, CME, flares (surová data z NOAA/NASA)
3. **State machine** — logika určení stavu (transit, impact, quiet, storm)
4. **Intensity formulas** — výpočet intenzity
5. **Visibility thresholds** — tabulka (none → dancing) s KP prahy
6. **Aurora likelihood thresholds** — very_likely → none
7. **Observing conditions** — výpočet pro Prahu & Jizerky (moon, sun, factors)
8. **Narrative generation** — ukázka generovaného textu
9. **Photo recommendations** — doporučení pro focení podle KP úrovně
10. **Journey stages** — sun → transit → L1 → magnetosphere → earth
11. **CZ locations** — kompletní databáze lokací s Bortle hodnotami

## Data
- Volá přímo `fetchAllAuroraData()` na serveru (no caching)
- Zobrazuje raw JSON pro debugging

## Jak rozšířit
- Nová sekce: přidat do stránky jako další `<section>` blok
- Nový threshold: přidat řádek do příslušné tabulky
