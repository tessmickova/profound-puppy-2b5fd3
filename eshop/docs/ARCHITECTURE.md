# ARCHITECTURE.md — Cílová architektura

**Stav:** NÁHLED ke schválení. Neimplementováno.

---

## 1. Shrnutí rozhodnutí

| Vrstva | Volba | Proč |
|---|---|---|
| Frontend storefront | **Astro 5 + Cloudflare adapter** | minimum JS, content-first SEO, islands jen kde nutno |
| Admin UI | Astro SSR stránky pod `/admin` (stejný projekt, oddělený layout + auth middleware) | žádný druhý framework, server-rendered = bezpečnější default |
| API / business logika | **Cloudflare Worker (Hono + Zod)** — samostatný „commerce core“ worker | jeden zdroj pravdy pro ceny/sklad; Astro s ním mluví přes service binding (bez veřejné HTTP latence) |
| Databáze | **Cloudflare D1** (SQLite) | pay-per-use, transakce/batch, dostatečné pro 10–30 produktů a burst čtení přes cache |
| Object storage | **Cloudflare R2** — 2 buckety: `public-assets` (obrázky přes CDN), `private-docs` (faktury, přílohy reklamací, exporty; přístup jen přes signed URL/Worker) | privátní dokumenty nikdy ve veřejném bucketu |
| Async jobs | **Cloudflare Queues** (+ DLQ) | e-maily, PDF, Packeta API, retry, analytika — nic z toho neblokuje checkout |
| Cron | Workers Cron Triggers | expirace rezervací, reconciliation, health checky, event lifecycle |
| KV | Cloudflare KV | veřejná cache (produktová data pro API), feature flags (`high_traffic_mode`), Turnstile/rate-limit pomocné čítače |
| Platby | **Stripe Checkout (hosted)** za `PaymentProvider` abstrakcí | PCI scope minimální; Comgate/GoPay jako budoucí adaptéry |
| Doprava | **Packeta/Zásilkovna** za `ShippingProvider` abstrakcí | oficiální API pro vlastní integrace; Balíkovna/PPL/DPD/GLS později |
| E-mail | **Resend** za `EmailProvider` abstrakcí | transactional; SPF/DKIM/DMARC povinně |
| Bot/abuse | Cloudflare WAF + Workers Rate Limiting + **Turnstile jen na abuse-rizikových místech** (return lookup, stock notify, B2B formulář) — NE v běžném checkoutu | |
| CI/CD | GitHub Actions → `wrangler deploy`; oddělené prostředí local / preview / production | oddělené D1, R2, klíče, webhooky |

## 2. Astro vs Next.js — zdůvodnění

Vybráno **Astro**. Kritéria z master promptu:

- **SEO + minimum JS:** 90 % webu jsou obsahové stránky (event landing pages, produkty, magazín, právní stránky). Astro je renderuje jako čisté HTML s nulovým klientským JS; interaktivní jsou jen ostrovy (košík, výběr varianty, Packeta widget, checkout formulář). Next.js posílá React runtime na každou stránku.
- **Rychlost / Core Web Vitals:** statické/prerenderované stránky z CDN edge = nejlepší možné LCP. Přesně to potřebujeme pro traffic burst (10 000 lidí na landing page zatmění = cache hit, ne render).
- **Cloudflare kompatibilita:** oficiální `@astrojs/cloudflare` adapter, první-třídní podpora Workers. Next.js na Cloudflare (OpenNext) je funkční, ale složitější a s většími cold starty.
- **Jednoduchost + údržba:** jeden mentální model (HTML + ostrovy), méně závislostí, menší upgrade treadmill než Next.js.
- **Bezpečnost:** méně klientského kódu = menší attack surface; server endpoints jen tam, kde jsou potřeba.

Next.js by dával smysl při těžce interaktivním admin SPA nebo sdílení React ekosystému — admin je ale CRUD + batch akce, což SSR formuláře + malé ostrovy zvládnou lépe a bezpečněji.

## 3. Topologie

```
                        ┌─────────────────────────────┐
   zákazník ──HTTPS──▶  │ Cloudflare CDN / WAF / cache │
                        └──────────────┬──────────────┘
                                       │
                    ┌──────────────────┴──────────────────┐
                    │  Worker: storefront (Astro SSR/SSG)  │
                    │  - veřejné stránky (cache-friendly)  │
                    │  - /admin (SSR, auth middleware)     │
                    └──────────────────┬──────────────────┘
                                       │ service binding (RPC)
                    ┌──────────────────┴──────────────────┐
                    │  Worker: commerce-core (Hono)        │
                    │  - cart / checkout / pricing         │
                    │  - inventory + rezervace             │
                    │  - orders, returns, claims           │
                    │  - admin API (role-based)            │
                    │  - webhooks: /wh/stripe, /wh/packeta │
                    │  - queue consumers + cron handlers   │
                    └───┬──────┬──────┬──────┬─────────────┘
                        │      │      │      │
                       D1     R2×2  Queues  KV
                        │                │
                        │           ┌────┴─────┐
                        │           │ DLQ +    │
                        │           │ alerting │
                        │           └──────────┘
   Stripe ──webhook──▶ /wh/stripe (verifikace podpisu, idempotence)
   Packeta ◀──API──── queue consumer (label, tracking)
   Resend  ◀──API──── queue consumer (transactional mail)
```

Monorepo:

```
/
├── apps/
│   ├── storefront/        # Astro (storefront + admin UI)
│   └── core/              # Hono worker (API, webhooks, queues, cron)
├── packages/
│   ├── db/                # D1 schéma, migrace, typed queries
│   ├── domain/            # čisté TS: money, state machines, pricing, inventory
│   ├── providers/         # PaymentProvider, ShippingProvider, EmailProvider + adaptéry
│   └── i18n/              # message layer (cs-CZ default, připraveno sk/de/pl/en)
├── docs/
└── .github/workflows/
```

`packages/domain` je bez závislostí na Cloudflare → unit testy běží v čistém Vitestu; workers-specifické věci se testují přes `@cloudflare/vitest-pool-workers` a Miniflare.

## 4. Klíčové mechanismy

### 4.1 Peníze
Integer minor units (haléře): `99 Kč = 9900`. Typ `Money = { amount: number; currency: 'CZK' }` v `packages/domain`, žádný float nikde. DPH počítáno na halíř s dokumentovaným zaokrouhlením (per-řádek, konfigurovatelně).

### 4.2 Sklad bez oversellingu (D1)
D1 nemá interaktivní transakce, ale má `batch()` (atomická sekvence) a SQLite sémantiku jednoho writeru. Rezervace = **podmíněný UPDATE**:

```sql
UPDATE variant_stock
SET reserved = reserved + ?qty
WHERE variant_id = ?id
  AND (physical - reserved - safety_stock) >= ?qty;
```

Pokud `changes() = 0` → není dostupné → checkout vrátí sold-out. Bundle = batch podmíněných UPDATE nad všemi komponentami; když jediný selže, celý batch se odvolá (D1 batch je transakční). Každá změna se zapisuje do `inventory_movements` (append-only ledger) — stav skladu je vždy rekonstruovatelný.

### 4.3 Rezervace
Checkout vytvoří `stock_reservations` s `expires_at = now + 20 min`. Cron každou minutu expirované rezervace atomicky vrací (`reserved -= qty`, movement `release`). Webhook `paid` → rezervace se promění v odečet (`physical -= qty`, `reserved -= qty`, movement `sale`). Vše idempotentní přes `reservation.status`.

### 4.4 Idempotence
Každý webhook a queue job nese idempotency key (Stripe `event.id`, `order_id + akce`). Tabulka `processed_events (id PK, processed_at)` — `INSERT OR IGNORE`; když řádek existoval, job skončí úspěchem bez efektu. Platí pro: webhook, odečet skladu, fakturu, zásilku, e-mail, refund.

### 4.5 Cache strategie
- Veřejné stránky: `Cache-Control` + Cloudflare cache, produktová dostupnost přes malý JSON endpoint (`/api/availability`) s krátkou TTL (10–30 s) — stránka může být cachovaná dlouho, dostupnost je čerstvá.
- **Nikdy necachovat:** `/checkout*`, `/api/cart*`, `/admin*`, `/api/admin*`, cokoliv s cookie identitou. Vynuceno middleware (explicitní `no-store`) + Cloudflare cache rules.

### 4.6 High traffic mode
Feature flag v KV. Zapnutí: delší TTL veřejné cache, vypnutí necheckoutových dynamických prvků (related products, recently viewed), statická dostupnost („skladem / vyprodáno“ místo přesných čísel), zvýrazněný delivery cutoff. Checkout beze změny. Má reálný technický přínos (méně D1 čtení v burstu), není placebo.

### 4.7 Admin auth
Passkeys/WebAuthn (primární) + magic link s TOTP jako fallback. Role: `owner`, `admin`, `warehouse`, `customer_support`, `accountant` — least privilege, vynucené v commerce-core (ne jen v UI). Všechny kritické operace → `audit_log`.

### 4.8 Order lookup pro zákazníka
Žádné `/order/1234`. Odkazy s kryptografickým tokenem (128bit random, hash v DB, expirace) nebo e-mail verification (jednorázový magic link). Volitelný „účet“ = passwordless magic link, žádná hesla zákazníků v systému.

### 4.9 Observabilita
- `/health` endpoint (D1, R2, Queues, poslední webhook, poslední úspěšný e-mail).
- Cron: reconciliation Stripe↔orders (viz PAYMENTS sekce ROADMAP), detekce záporného skladu, DLQ depth, faktury bez PDF.
- Critical alert kanál: e-mail + volitelně Telegram (vzor z AuroraDog). „Stripe webhook > 6 h ticho při otevřených objednávkách“ = alert.
- Logy: correlation ID = `order_id`/`request_id`; nikdy hesla, tokeny, payment payloady, PII minimalizovat.

## 5. Ekonomika provozu (fixní náklady mimo sezónu)

| Položka | Cena |
|---|---|
| Workers Paid plan (nutný pro Queues + vyšší D1 limity) | **$5/měs** |
| D1, R2, KV, Queues v rámci free/included kvót při mimosezónním provozu | ~0 |
| Doména `.cz` | ~150–300 Kč/rok |
| Resend | free tier (3 000 mailů/měs) → platí se až v sezóně |
| Stripe | žádný paušál, jen % z transakce |
| Packeta | žádný paušál, platí se za zásilky |
| **Celkem mimo sezónu** | **≈ 130 Kč/měsíc** |

V sezóně rostou náklady lineárně s provozem (requesty, queue messages, e-maily) — pay-as-you-go, žádný skok. Žádný server, který by běžel naprázdno.

## 6. Čemu se vyhýbáme (potvrzení zadání)

Žádné microservices, Kubernetes, Redis, GraphQL, Elasticsearch (search nad 30 produkty = SQL LIKE + aliasy + normalizace diakritiky), žádný povinný účet, žádný custom payment processing, minimum npm závislostí (Hono, Zod, Astro, pdf-lib/@react-pdf ekvivalent pro Workers, Stripe SDK — a tím to zhruba končí).

## 7. Body k validaci proti aktuální dokumentaci (PHASE 2, před implementací)

Před psaním kódu se načte **aktuální** oficiální dokumentace (zásada §86): Cloudflare (D1 limity/transakce, Queues, Rate Limiting API, Turnstile), Stripe (Checkout Sessions, webhooks, refunds), Packeta API, Resend API, schema.org/Google Merchant (Product, Offer, ProductGroup, OfferShippingDetails, MerchantReturnPolicy). Tento dokument se pak zpřesní.
