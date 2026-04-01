# AuroraDog — Polární záře monitoring pro Českou republiku

## Přehled projektu

**AuroraDog** je Next.js aplikace pro real-time monitoring polární záře v České republice (50°N). Aplikace kombinuje data z NOAA SWPC, NASA DONKI a Open-Meteo API s vlastním expertním skórovacím systémem pro přesné předpovědi viditelnosti aurory.

## Architektura

### Tech Stack
- **Frontend:** Next.js 15.1 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS, Framer Motion animace
- **Charts:** Recharts
- **Data fetching:** SWR (60s refresh)
- **Database:** Supabase (cache + realtime + subscribers)
- **Deployment:** Vercel (cron jobs)
- **Fonts:** Orbitron (display), Syne (headings), IBM Plex Mono (mono)

### Barvy aurory
- `#00ffaa` — zelená (aurora)
- `#00d4ff` — tyrkysová (teal)
- `#a855f7` — fialová (purple)
- `#ff3d9a` — růžová (pink)

## Struktura aplikace

### Stránky (`app/`)

#### `/` — Dashboard (hlavní stránka)
**Soubor:** `app/(dashboard)/page.tsx` (~550 řádků)

**Záložky:**
- 🌌 **Aurora** — hlavní dashboard s hero vizualizací, live statusem, CME dopady, předpovědí, grafy
- 📡 **Pozorování** — NASA DONKI data (CME, erupce, geomagnetické bouře)
- ☀️ **Solar** — sluneční aktivita

**Tier systém layout:**
1. **Hero** — `SpaceWeatherHero` s cinematickým transit vizuálem (Slunce → L1 → Země)
2. **LiveStatusPanel** — metriky: KP (live/3h/predicted), Bz s duration, rychlost větru, hustota, Bt, tlak, L1 travel time
3. **SidebarPanel** — komunita (Telegram, WhatsApp, Buy Me a Coffee)
4. **Tier 1** — `VisibilityScale` + `DualAnalysis` (expertní skóre) vedle sebe
5. **Tier 2** — `CmeImpactList` (jednotná tabulka CME dopadů) + `KpCarousel` (3denní předpověď)
6. **Tier 3** — Grafy 2×2 (KP, Bz, Solar Wind ×2)
7. **Tier 4** — `ObservingConditions` (lokace, skóre, faktory, obloha)

**Data:** Hook `useAuroraData()` poskytuje `kp`, `bz`, `swSpeed`, `swDensity`, `kpHistory`, `swHistory`, `cme`, `flares`, `forecast`, `donki`

#### `/admin` — Diagnostika
**Soubor:** `app/admin/page.tsx`

Interní stránka pro ladění dat, thresholdů a algoritmů. Zobrazuje:
- Raw aurora data (KP, Bz, solar wind, CME, flares)
- State machine logika
- Intensity výpočty
- Visibility thresholds tabulka
- Observing conditions pro Prahu & Jizerky
- Photo recommendations
- Journey stages (sun → transit → L1 → magnetosphere → earth)
- CZ locations databáze s Bortle hodnotami

#### `/docs` — Dokumentace
**Soubor:** `app/docs/page.tsx`

Statický glosář vysvětlující všechny pojmy:
- KP index (0–9)
- Bz magnetické pole
- Sluneční vítr (rychlost, hustota, teplota)
- CME typy a rychlosti
- G-škála (G0–G5)
- Sluneční erupce (A–X třídy)
- Lagrangeův bod L1
- Magnetosféra
- Viditelnost v ČR (KP 0–8+)
- Bortle škála (světelné znečištění)
- Měsíc a vliv na pozorování
- Tma oblohy (civil, nautical, astronomical twilight)
- Tipy pro pozorování a focení

### API endpointy (`app/api/`)

#### `/api/aurora-data` — Hlavní data
**Soubor:** `app/api/aurora-data/route.ts`

Vrací agregovaná data s cache logikou:
1. Zkusí načíst z Supabase cache (TTL 60s)
2. Pokud stale → fetch čerstvá data přes `fetchAllAuroraData()`
3. Uloží nová data do cache
4. Pokud fetch selže → vrátí stale cache

**Response:** `AggregatedData` s KP, Bz, solar wind, CME, flares, forecast, donki

#### `/api/cron/check-kp` — Cron job
**Soubor:** `app/api/cron/check-kp/route.ts`

Cron job spouštěný každou minutu (vercel.json):
- Ověří Bearer token (`CRON_SECRET`)
- Fetch čerstvá data
- Uloží do cache
- Pokud KP ≥ 3 → odesílá alerty odběratelům (Telegram, WhatsApp)

#### `/api/webhooks/telegram` — Telegram bot
**Soubor:** `app/api/webhooks/telegram/route.ts`

Webhook pro Telegram bota s příkazy:
- `/start` — registrace (KP 4 default)
- `/alert kpX` — nastavení threshold (kp2–kp9)
- `/stop` — deaktivace
- `/stav` — aktuální stav

### Komponenty (`components/`)

#### ObservingConditions.tsx
Podmínky pozorování — lokace, skóre, faktory, obloha.
- **Props:** `kp`, `bz`
- **Integrace:** Open-Meteo (oblačnost), CzRegionMap (mapa), lib/astronomy.ts
- **Stav:** selectedLocation, selectedRegion, cloudCover

#### CzRegionMap.tsx
Interaktivní SVG mapa ČR s 13 kraji. Bortle color-coding, drill-down na lokace.

#### DualAnalysis.tsx
Expertní analýza — kontinuální skóre 0–100 s gauge + inline faktory.

#### VisibilityScale.tsx
Aktuální viditelnost + 2h sunset-based noční okna.

#### CmeImpactList.tsx
Jednotná tabulka CME dopadů — G-škála, erupce, příjezd, rychlost, pravděpodobnosti.

#### KpCarousel.tsx
3denní KP předpověď — kompaktní karty s G1/G2/G3 bars.

#### NotifyModal.tsx
Modální okno pro přihlášení k alertům (Telegram/WhatsApp).

#### SolarTab.tsx
Záložka sluneční aktivita — NASA DONKI data.

#### Charts (`charts/`)
- **KpChart.tsx** — KP index graf (24h, L1/Earth markers)
- **BzChart.tsx** — IMF Bz komponenta (červená/zelená, expert analýza)
- **SolarWindChart.tsx** — rychlost/hustota slunečního větru
- **EnlilChart.tsx** — ENLIL model animace (GIF)
- **HuxtChart.tsx** — HUXt model timeline

#### Space-weather/hero/
- **SpaceWeatherHero.tsx** — hlavní hero s transit vizuálem
- **LiveStatusPanel.tsx** — real-time metriky strip
- **EarthVisual.tsx** — SVG Země s magnetosférickým boundary
- **SunVisual.tsx** — animované Slunce
- **MoonVisual.tsx** — měsíc s fází
- **TransitPath.tsx** — animovaná cesta CME částic
- **CmeParticles.tsx** — částicový efekt
- **StatusNarrative.tsx** — textový popis stavu
- **CmeImpactTable.tsx** — (legacy, nahrazeno CmeImpactList)

#### Space-weather/ (další)
- **CMECard.tsx / CMEList.tsx** — NASA DONKI CME karty
- **SolarFlareCard.tsx** — erupce karty
- **GeomagneticStormCard.tsx** — geomagnetické bouře
- **NasaDonkiSection.tsx** — wrapper pro NASA záložku

### Knihovny (`lib/`)

#### noaa.ts
Komunikace s NOAA SWPC a NASA DONKI.
- **Typy:** `KpPoint`, `SolarWindPoint`, `CmeEvent`, `SolarFlare`, `ForecastDay`, `AggregatedData`
- **Funkce:** `fetchAllAuroraData()` — agreguje všechna data
- **Viditelnost:** `kpToVisibility()`, `VISIBILITY_INFO` (foto Kp≥4, horizont Kp≥5, oblouk Kp≥6, nad hlavou Kp≥7, tanec Kp≥8)
- **Likelihood:** `deriveAuroraLikelihood()` (unlikely: KP≥3 AND Bz<-5)

#### astronomy.ts
Astronomické výpočty pro pozorování.
- **Měsíc:** `getMoonInfo()` — fáze, svítivost, interference
- **Slunce:** `getSunPosition()`, `getSunTimes()` — výška, azimut, soumrak
- **Podmínky:** `calculateObservingConditions()` — vážené skóre (KP 35%, tma 25%, měsíc 15%, světlo 15%, horizont 10%)
- **Lokality:** `getLocalityProbability()` — horizont/overhead pravděpodobnost s Bz modifikátorem, Bortle penaltou
- **Focení:** `getPhotoRecommendation()` — ISO, expozice, clona, tipy
- **Databáze:** `CZ_LOCATIONS` — 90+ lokací ve 13 krajích s Bortle, světelné znečištění, severní horizont

#### supabase.ts
Supabase klient (browser + admin/service role).

#### alerts.ts
Logika odesílání alertů (Telegram, WhatsApp).

#### database.types.ts
Supabase generované TypeScript typy (tabulky: `aurora_cache`, `subscribers`).

#### hooks/
##### useAuroraData.ts
SWR hook pro client-side data fetching (60s refresh z `/api/aurora-data`).

#### space-weather/

##### expertScore.ts
Expertní skórovací engine — kontinuální 0–100 skóre pro ČR.
- **Váhy:** Bz 30%, rychlost 18%, bzDuration 17%, KP 15%, hustota 12%, Bt 8%
- **Bonusy:** rychlý pokles Bz +5, tlaková událost +8
- **Penalty:** Bz severní ×0.3, měsíc až -25%, denní světlo až -60%
- **Výstup:** skóre, český label, vysvětlení, trend, faktory, L1 delay

##### formatters.ts
Formátovací utility pro českou lokalizaci.

##### hero/
- **deriveSpaceWeatherState.ts** — state machine (quiet/transit/impact/storm) + aurora likelihood
- **getCurrentStory.ts** — generování příběhu pro StatusNarrative
- **types.ts** — TypeScript typy

##### nasa/
- **fetchNasaDonki.ts** — wrapper pro NASA DONKI API
- **getCME.ts** — CME data parser
- **getCMEArrival.ts** — arrival estimates
- **getFlares.ts** — solar flare parser
- **getGeomagneticStorms.ts** — geomagnetic storms parser
- **index.ts** — re-export barrel
- **types.ts** — NASA DONKI typy

## Data flow

1. **Cron job** (každou minutu) → fetch data → uloží do Supabase cache → odesílá alerty
2. **Client** → `useAuroraData()` → SWR → `/api/aurora-data` → cache nebo fresh data
3. **Dashboard** → zobrazuje data v tier systému s real-time updates

## Datové zdroje

- **NOAA SWPC:** KP index, solar wind, forecast
- **NASA DONKI:** CME, solar flares, geomagnetic storms
- **Open-Meteo:** cloud cover pro lokace
- **Supabase:** cache + subscribers databáze

## Alert systém

- **Telegram Bot API** — příkazy, HTML zprávy
- **WhatsApp Business API** — Meta Graph API
- **Thresholds:** KP 2–9, custom per uživatel
- **Kanály:** Telegram chat, WhatsApp business

## Deployment

- **Vercel:** hosting + cron jobs
- **Env proměnné:** Supabase, NOAA, NASA, Telegram, WhatsApp, cron secret
- **Build:** Next.js production build

## Jak rozšířit

- **Nová záložka:** přidat do pole `tabs` v page.tsx
- **Nový tier:** přidat `<section>` za existující tier
- **Nový graf:** přidat do 2×2 gridu v Tier 3
- **Nová metrika:** přidat do `AggregatedData` typu, naplnit ve `fetchAllAuroraData()`
- **Nový alert kanál:** přidat dispatch logiku v cron route

## Expertní algoritmy

### Viditelnost aurory v ČR (50°N)
- **Foto:** KP ≥ 4
- **Horizont:** KP ≥ 5
- **Oblouk:** KP ≥ 6
- **Nad hlavou:** KP ≥ 7
- **Tanec:** KP ≥ 8

### Aurora likelihood
- **Very likely:** KP ≥ 6 OR (KP ≥ 4 AND Bz < -10)
- **Likely:** KP ≥ 4 OR (KP ≥ 3 AND Bz < -8)
- **Possible:** KP ≥ 3 OR (KP ≥ 2 AND Bz < -5)
- **Unlikely:** KP ≥ 3 AND Bz < -5

### Expert skóre (0–100)
Vážený systém pro přesné předpovědi viditelnosti aurory v ČR s ohledem na geografickou polohu (50°N).

## Lokality ČR

90+ lokací ve 13 krajích s:
- **Bortle škála** (1–9, světelné znečištění)
- **Světelné znečištění** (velmi nízké → velmi vysoké)
- **Severní horizont** (0–1, blokace)
- **Souřadnice** (lat/lon pro astronomické výpočty)

## Fotografické doporučení

Automatické výpočty pro focení aurory:
- **ISO:** 800–6400
- **Expozice:** 1–30s
- **Clona:** f/2.8–f/5.6
- **Ohnisko:** 16–50mm
- **Tipy:** podle podmínek (měsíc, světlo, oblačnost)

## Monitoring a údržba

- **Cache TTL:** 60s (Supabase)
- **Cron job:** každou minutu (KP alerts)
- **Error handling:** stale-while-revalidate
- **Logging:** Vercel dashboard
- **Performance:** SWR caching, lazy loading

## Poznámky k vývoju

- **Next.js 15.1:** App Router, React 19
- **TypeScript:** striktní typování
- **Tailwind:** utility-first CSS
- **Framer Motion:** smooth animace
- **Recharts:** responsive charts
- **date-fns:** česká lokalizace
- **clsx:** conditional classes

## Kontakt

Pro otázky nebo příspěvky: auroradog.cz</content>
<parameter name="filePath">/Users/terezaholtzerova/Desktop/Aurora bot/files/auroradog/Claude.MD