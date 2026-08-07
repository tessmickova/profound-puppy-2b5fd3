# Návrh domény pro Svět jmen

> Zapsáno 7. 8. 2026. Cíl: doména, kterou lidé hledají přirozeně a stejně dobře
> za pět let jako dnes. Dostupnost ověřena jen orientačně přes DNS (chybějící
> A záznam ≠ jistá volnost) — před nákupem je potřeba whois u registrátora.

## Doporučené pořadí

### 1. `jmenaprodeti.cz` — nejsilnější pro vyhledávání

Přesná shoda s dotazem, který lidé píší nejčastěji a bez ohledu na dobu:
„jména pro děti". Evergreen téma s poptávkou po celý rok, nezávislé na trendech.

- **Pro:** okamžitě srozumitelné, přesná shoda s hlavním dotazem, dobře se říká
  do telefonu i předává mezi rodiči.
- **Proti:** nepokrývá zvířecí část webu — ta by působila jako přílepek.
- **DNS:** bez A záznamu (indikace volnosti).

### 2. `jaksejmenovat.cz` — nejlepší pro AI a hlasové hledání

Otázková doména. Odpovídá tomu, jak se lidé ptají hlasových asistentů
i jazykových modelů: „jak pojmenovat psa", „jak se má jmenovat naše dcera".

- **Pro:** funguje pro lidi i zvířata zároveň, přirozeně sedí k rozhovorovému
  vyhledávání, které roste; zapamatovatelná.
- **Proti:** delší k napsání, slabší přesná shoda s krátkými dotazy.
- **DNS:** bez A záznamu.

### 3. `svetjmen.cz` — nejlepší jako značka

Kratší, pokrývá celý rozsah webu (děti i zvířata, 19 zemí) a nepřipoutá web
k jedné kategorii, kdyby přibyly další sekce.

- **Pro:** krátká, dobře se buduje jako značka, odpovídá názvu webu.
- **Proti:** bez přesné shody s vyhledávanými dotazy — návštěvnost musí přijít
  z obsahu, ne z domény.
- **DNS:** bez A záznamu.

## Doporučení

Koupit **`jmenaprodeti.cz` i `svetjmen.cz`**: první jako hlavní doménu kvůli
vyhledávání, druhou jako značku a trvalé přesměrování. `jaksejmenovat.cz` má
smysl přikoupit, pokud se web bude víc opírat o odpovědi pro AI asistenty.

Doména se v projektu nastavuje jednou proměnnou — `NEXT_PUBLIC_URL`, viz
`lib/names/seo.ts`. Změna se sama promítne do sitemap, robots i canonical URL.

## Zvážené a odložené

| Doména | Proč ne |
|---|---|
| `jmena.cz` | obsazená (má A záznam) |
| `nasejmena.cz` | obsazená |
| `vyberjmeno.cz` | obsazená |
| `jmenoprodite.cz` | obsazená |
| `jmenarodiny.cz` | volná, ale zužuje web jen na rodinný profil |
| `jmenologie.cz` | volná, zní odborně a odrazuje běžné rodiče |
