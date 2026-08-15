# AuroraDog odsud odešel (15. 8. 2026)

Tenhle repozitář původně obsahoval dva nesouvisející projekty najednou:
**Svět jmen** a **AuroraDog** (předpověď polární záře). Sdílely jeden
Next.js projekt, jeden `<body>`, jeden `globals.css` a jeden Worker —
takže po připojení domény byl AuroraDog dosažitelný i na `svetjmen.cz`
(`/aurora`, `/admin`, `/docs`, `/api/…`).

AuroraDog má mít vlastní repozitář. Odsud je proto **kompletně pryč**.

## Jak to vrátit

Kód nikam nezmizel, je v historii gitu. Poslední commit, kde AuroraDog
ještě celý je:

```
3b091a9  Do robots patří i /sprava a /analyza-vyberu
```

Obnovení celého projektu do pracovní kopie:

```bash
git checkout 3b091a9 -- app/aurora app/admin app/api app/docs \
  components/charts components/space-weather \
  lib/hooks lib/space-weather supabase vercel.json
git show 3b091a9:package.json > package.json   # kvůli závislostem
```

Jednotlivý soubor:

```bash
git show 3b091a9:components/AuroraChecklist.tsx
```

Hezčí je ale vzít celý stav a založit z něj nový repozitář:

```bash
git worktree add ../auroradog 3b091a9
```

## Co se smazalo

93 souborů:

| Cesta | Co to bylo |
|---|---|
| `app/aurora/` | hlavní stránka předpovědi |
| `app/admin/` | diagnostická stránka AuroraDogu |
| `app/docs/` | slovníček pojmů |
| `app/api/` | **všechny** routy: `aurora-data`, `aurora-news`, `cron/check-kp`, `enlil-sequence`, `sightings`, `solar-imagery`, `webhooks/telegram` |
| `components/*.tsx` | 17 komponent (AuroraChecklist, AuroralOvalMap, CloudRadar, CzRegionMap, HuskyLogo, KpCarousel, MagnetospherePanel, …) |
| `components/charts/`, `components/space-weather/` | grafy a karty kosmického počasí |
| `lib/hooks/`, `lib/space-weather/` | hooky a výpočty |
| `lib/{alerts,astronomy,database.types,noaa,observationSpots,supabase}.ts` | data a integrace |
| `supabase/migrations/` | schéma databáze AuroraDogu |
| `vercel.json` | cron `/api/cron/check-kp` každých 5 minut |

Svět jmen žádný soubor odsud neimportoval — ověřeno v obou směrech před
smazáním. Ze všech složek mimo `lib/names` a `components/names` používal
jediný soubor: `lib/config.ts`, který zůstává.

### A ještě zbytky, které po něm zůstaly jinde

- **`package.json`** — pryč `@supabase/ssr`, `@supabase/supabase-js`,
  `clsx`, `date-fns`, `framer-motion`, `recharts`, `swr`. Ani jeden z nich
  se ve Světě jmen nepoužíval. Zbývají `lucide-react`, `react-hot-toast`,
  `next`, `react`, `react-dom`. Balíček se jmenuje `svetjmen`, ne `auroradog`.
- **`app/layout.tsx`** — pryč fonty Orbitron a IBM Plex Mono (Svět jmen ani
  jeden nepoužíval, stahovaly se na každé načtení) a skript, který četl
  `auroradog_theme` a `auroradog_fontscale` z úložiště prohlížeče.
- **`app/globals.css`** — pryč 194 řádků: tmavý motiv, přebití pro světlý
  režim, zvětšování písma a animace hrdiny (Slunce, Země, CME). Nahradil je
  22řádkový základ v papírové paletě Světa jmen. Ověřeno, že Svět jmen
  nepoužíval ani jednu proměnnou motivu (`--page-bg`, `--text-primary`, …)
  ani utilitu `dark:`.
- **`app/robots.ts`** — ze zakázaných adres zmizely `/aurora`, `/admin`
  a `/docs`; už neexistují.

## Co se **ne**smazalo

- **Workery a data v Cloudflare.** Tady šlo jen o zdrojový kód. Co běží
  v Cloudflare pod AuroraDogem, zůstává nedotčené — smazat se to musí tam,
  ručně, a jen když se to má opravdu zrušit.
- **Jméno „Aurora" v katalogu jmen.** Je to skutečné jméno (jitřenka,
  polární záře) a patří do dat. Stejně tak sibiřský husky mezi plemeny.
  S projektem AuroraDog to nesouvisí.

## Proč to bylo potřeba

Dva projekty v jednom repozitáři byly příčina incidentu ze 14. 8.
(viz [INCIDENT-2026-08-14.md](INCIDENT-2026-08-14.md)) a po připojení
domény by z `svetjmen.cz` šla obsluhovat cizí administrace a cizí API.
Roboti to sice nesměli indexovat, ale veřejně dosažitelné to bylo.
