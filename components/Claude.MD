# Komponenty

## Přehled
Všechny UI komponenty aplikace AuroraDog. Všechny jsou `'use client'`.

## Hlavní komponenty

### ObservingConditions.tsx
Podmínky pozorování — lokace, skóre, faktory, oblačnost, doporučení na focení.
- **Props:** `kp`, `bz`
- **Integrace:** Open-Meteo (oblačnost), CzRegionMap (mapa), lib/astronomy.ts (výpočty)
- **Stav:** selectedLocation, selectedRegion, cloudCover

### CzRegionMap.tsx
Interaktivní SVG mapa ČR s 13 kraji. Bortle color-coding, drill-down na lokace.
- **Props:** selectedRegion, onSelectRegion, selectedLocation, onSelectLocation

### DualAnalysis.tsx
Expertní analýza — kontinuální skóre 0–100 s gauge + inline faktory.
- **Props:** kp, bz, swSpeed, swDensity, solarWindHistory
- **Integrace:** lib/space-weather/expertScore.ts

### VisibilityScale.tsx
Aktuální viditelnost + 2h sunset-based noční okna.
- **Props:** kp

### CmeImpactList.tsx
Jednotná tabulka CME dopadů — G-škála, erupce, příjezd, rychlost, pravděpodobnosti.
- **Props:** cme (CmeEvent[]), forecast (ForecastDay[])

### KpCarousel.tsx
3denní KP předpověď — kompaktní karty s G1/G2/G3 bars.
- **Props:** forecast (ForecastDay[])

### NotifyModal.tsx
Modální okno pro přihlášení k alertům (Telegram/WhatsApp).

### SolarTab.tsx
Záložka sluneční aktivita — NASA DONKI data.

## charts/
| Soubor | Popis |
|--------|-------|
| KpChart.tsx | KP index graf (Recharts) |
| BzChart.tsx | Bz magnetické pole — barva čáry se mění podle hodnoty |
| SolarWindChart.tsx | Rychlost a hustota slunečního větru |
| EnlilChart.tsx | ENLIL model vizualizace |
| HuxtChart.tsx | HUXt model vizualizace |

## space-weather/hero/
| Soubor | Popis |
|--------|-------|
| SpaceWeatherHero.tsx | Hlavní hero komponenta s transit vizuálem |
| LiveStatusPanel.tsx | Real-time metriky strip (KP, Bz, vítr, magnetosféra) |
| EarthVisual.tsx | SVG Země s magnetosférickým boundary |
| SunVisual.tsx | SVG animované Slunce |
| MoonVisual.tsx | Měsíc s realistickou fází |
| TransitPath.tsx | Animovaná cesta CME částic Slunce → Země |
| CmeParticles.tsx | Částicový efekt CME |
| StatusNarrative.tsx | Textový popis aktuálního stavu |
| MetricCard.tsx / MetricStrip.tsx | Stavební bloky pro metriky |
| CmeImpactTable.tsx | (prázdný/legacy — nahrazeno CmeImpactList) |

## space-weather/ (další)
| Soubor | Popis |
|--------|-------|
| CMECard.tsx / CMEList.tsx | NASA DONKI CME karty |
| CMEArrivalCard.tsx | Karta příjezdu CME |
| SolarFlareCard.tsx | Karta sluneční erupce |
| GeomagneticStormCard.tsx | Karta geomagnetické bouře |
| NasaDonkiSection.tsx | Wrapper pro NASA DONKI záložku |
| DataBadge.tsx / EmptyState.tsx / SectionHeader.tsx | Utility komponenty |
