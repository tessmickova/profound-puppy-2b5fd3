# Knihovny (lib/)

## Přehled
Backend logika, datové typy, API klienti a výpočetní jádra aplikace.

## Hlavní soubory

### noaa.ts
Komunikace s NOAA SWPC a NASA DONKI API.
- **Typy:** `KpPoint`, `SolarWindPoint`, `CmeEvent`, `SolarFlare`, `ForecastDay`, `AggregatedData`
- **Funkce:** `fetchAllAuroraData()` — agreguje všechna data z obou API
- **Viditelnost:** `kpToVisibility()`, `VISIBILITY_INFO` s prahy pro ČR (50°N)
  - Foto: KP ≥ 4, Horizont: KP ≥ 5, Oblouk: KP ≥ 6, Nad hlavou: KP ≥ 7, Tanec: KP ≥ 8
- **Likelihood:** `deriveAuroraLikelihood()` — unlikely vyžaduje KP ≥ 3 AND Bz < -5

### astronomy.ts
Astronomické výpočty pro pozorování.
- **Měsíc:** `getMoonInfo()` — fáze, svítivost, interference
- **Slunce:** `getSunPosition()`, `getSunTimes()` — výška, azimut, soumrak, západ/východ
- **Podmínky:** `calculateObservingConditions()` — vážené skóre (KP 35%, tma 25%, měsíc 15%, světlo 15%, horizont 10%)
- **Lokality:** `getLocalityProbability()` — horizont/overhead pravděpodobnost s Bz modifikátorem, Bortle penaltou
- **Focení:** `getPhotoRecommendation()` — ISO, expozice, clona, tipy
- **Databáze:** `CZ_LOCATIONS` — 90+ lokací ve 13 krajích s Bortle, světelné znečištění, severní horizont

### supabase.ts
Supabase klient (browser + admin/service role).
- `createSupabaseBrowser()`, `createSupabaseAdmin()`, `supabase()` (singleton)

### alerts.ts
Logika odesílání alertů (Telegram, WhatsApp).

### database.types.ts
Supabase generované TypeScript typy (tabulky: `aurora_cache`, `subscribers`).

## hooks/
### useAuroraData.ts
SWR hook pro client-side data fetching.
- Refresh: 60s interval
- Endpoint: `/api/aurora-data`
- Vrací: všechna aurora data + loading/error stavy

## space-weather/

### expertScore.ts
Expertní skórovací engine — kontinuální 0–100 skóre pro ČR.
- **Váhy:** Bz 30%, rychlost 18%, bzDuration 17%, KP 15%, hustota 12%, Bt 8%
- **Bonusy:** rychlý pokles Bz +5, tlaková událost +8
- **Penalty:** Bz severní ×0.3, měsíc až -25%, denní světlo až -60%
- **Výstup:** skóre, český label, vysvětlení, trend, faktory, L1 delay

### formatters.ts
Formátovací utility pro českou lokalizaci.

### hero/
| Soubor | Popis |
|--------|-------|
| deriveSpaceWeatherState.ts | State machine — derivace stavu (quiet/transit/impact/storm) + aurora likelihood |
| getCurrentStory.ts | Generování příběhu pro StatusNarrative |
| types.ts | TypeScript typy pro hero systém |

### nasa/
| Soubor | Popis |
|--------|-------|
| fetchNasaDonki.ts | Wrapper pro NASA DONKI API volání |
| getCME.ts | CME data parser |
| getCMEArrival.ts | Arrival estimates |
| getFlares.ts | Solar flare parser |
| getGeomagneticStorms.ts | Geomagnetické bouře parser |
| index.ts | Re-export barrel |
| types.ts | NASA DONKI typy |
