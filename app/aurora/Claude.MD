# Dashboard (hlavní stránka)

## Účel
Hlavní stránka aplikace AuroraDog — real-time monitoring polární záře pro Českou republiku (50°N).

## Soubor
`app/(dashboard)/page.tsx`

## Struktura
Stránka je organizovaná do **tří záložek** (tabs):

| Záložka | Ikona | Obsah |
|---------|-------|-------|
| Aurora | 🌌 | Hero vizualizace, live status, CME dopady, výhled, grafy, podmínky pozorování |
| Pozorování | 📡 | NASA DONKI data (CME, erupce, geomagnetické bouře) |
| Solar | ☀️ | Sluneční aktivita (SolarTab) |

## Layout (tier systém)
1. **Hero** — `SpaceWeatherHero` s cinematickým transit vizuálem (Slunce → L1 → Země)
2. **LiveStatusPanel** — metriky: KP (live/3h/predicted), Bz s duration, rychlost větru, hustota, Bt, tlak, L1 travel time
3. **SidebarPanel** — komunita (Telegram, WhatsApp, Buy Me a Coffee)
4. **Tier 1** — `VisibilityScale` + `DualAnalysis` (expertní skóre) vedle sebe
5. **Tier 2** — `CmeImpactList` (jednotná tabulka CME dopadů) + `KpCarousel` (3denní předpověď)
6. **Tier 3** — Grafy 2×2 (KP, Bz, Solar Wind, ENLIL/HUXt)
7. **Tier 4** — `ObservingConditions` (lokace, skóre, faktory, obloha)

## Data
- Hook: `useAuroraData()` (SWR, 60s refresh z `/api/aurora-data`)
- Props předávané komponentám: `kp`, `bz`, `swSpeed`, `swDensity`, `kpHistory`, `swHistory`, `cme`, `flares`, `forecast`, `donki`

## Notifikace
- `NotifyModal` pro přihlášení k alertům (Telegram / WhatsApp)

## Fonty
- Orbitron (display), Syne (headings), IBM Plex Mono (mono)

## Jak rozšířit
- Nová záložka: přidat do pole `tabs` a odpovídající `TabPanel`
- Nový tier: přidat `<section>` za existující tier v Aurora záložce
- Nový graf: přidat do 2×2 gridu v Tier 3
