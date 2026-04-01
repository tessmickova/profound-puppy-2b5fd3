# API: Aurora Data

## Účel
Hlavní API endpoint pro client-side data. Vrací agregovaná data o polární záři s cache logikou.

## Soubor
`app/api/aurora-data/route.ts`

## Endpoint
`GET /api/aurora-data`

## Logika
1. Zkusit načíst z **Supabase cache** (tabulka `aurora_cache`, TTL 60s)
2. Pokud stale → fetch čerstvá data přes `fetchAllAuroraData()` z `lib/noaa.ts`
3. Uložit nová data do cache
4. Pokud fetch selže → vrátit stale cache (lepší než nic)
5. Pokud vše selže → HTTP 503

## Response (typ `AggregatedData`)
```typescript
{
  kp: number,
  bz: number | null,
  swSpeed: number | null,
  swDensity: number | null,
  kpHistory: KpPoint[],
  swHistory: SolarWindPoint[],
  cme: CmeEvent[],
  flares: SolarFlare[],
  forecast: ForecastDay[],
  donki: { ... }
}
```

## Cache
- Supabase tabulka `aurora_cache` s `updated_at` timestamp
- HTTP header: `Cache-Control: s-maxage=30, stale-while-revalidate=60`
- Client (SWR): refresh každých 60s

## Datové zdroje
- NOAA SWPC: KP, solar wind, forecast
- NASA DONKI: CME, flares, geomagnetické bouře

## Jak rozšířit
- Nové pole: přidat do `AggregatedData` typu v `lib/noaa.ts`, naplnit ve `fetchAllAuroraData()`
