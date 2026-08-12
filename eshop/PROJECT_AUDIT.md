# PROJECT_AUDIT.md — PHASE 0: Discovery

**Datum auditu:** 2026-08-12
**Stav:** NÁHLED — čeká na schválení před implementací

---

## 1. Co bylo auditováno

V session jsou dostupné dva repozitáře:

| Repo | Obsah | Vztah k e-shopu |
|---|---|---|
| `tessmickova/profound-puppy-2b5fd3` | **AuroraDog** — Next.js 15 aplikace pro monitoring polární záře v ČR (auroradog.cz). Supabase, Vercel/Netlify, Telegram/WhatsApp alerty. Obsahuje husky logo (`components/HuskyLogo.tsx`). | Brandově příbuzný projekt (husky, astronomické eventy, komunita). **Není to e-shop.** |
| `tessmickova/district22` | **marketplace** — Next.js 16 + Prisma + Postgres katalog/marketplace projekt s vlastními CI, testy, seedy. | Nesouvisí. Obsahuje ale použitelné vzory (CI workflow, backup skripty, migrace přes historii, testy kritické logiky). |

## 2. Závěr auditu

**E-shop je greenfield projekt.** Žádný existující kód není vhodný jako základ:

- AuroraDog je postavený na Next.js + Supabase + Vercel — cílová architektura e-shopu je Cloudflare Workers + D1 + R2 + Queues. Sdílení kódu by přineslo jen komplexitu.
- Marketplace používá Prisma + Postgres (server s trvalými náklady) — v rozporu s ekonomickou prioritou „mimo sezónu ≈ 0 Kč/měsíc“.

**Co se z existujících projektů PŘEBÍRÁ:**

1. **Brand DNA z AuroraDog** — husky maskot, česká komunita kolem přírodních/astronomických událostí, důvěryhodný „scout“ positioning. E-shop je přirozené komerční prodloužení (AuroraDog čmuchá aurory → e-shop čmuchá, co se bude hodit). Pozor: nesmí vzniknout záměna se značkou oblečení Husky (viz BRAND_VOICE.md §11).
2. **Provozní vzory z district22** — CI na každý push, backup před migrací, historie migrací místo `db push`, testy nad kritickou logikou, git hooks.
3. **Eventová data z AuroraDog** — do budoucna může AuroraDog fungovat jako trigger/acquisition kanál (KP alert → „nesmeky na noční pozorování“, zatmění → brýle). To je marketingová synergie, ne technická závislost.

## 3. Doporučení: nové repo

Po schválení náhledu doporučuji **nové samostatné repo** (monorepo) + nový Cloudflare účet/zónu. Důvody:

- oddělený deploy lifecycle, oddělené secrets, oddělený blast radius,
- AuroraDog zůstane netknutý,
- e-shop potřebuje vlastní CI/CD pipeline s D1 migracemi.

Tento náhled je zatím uložen ve složce `eshop/` v repu profound-puppy (větev `claude/event-driven-eshop-cz-okjtzy`), aby šel po schválení přenést jedním `git mv`.

## 4. Co z repozitářů NELZE zjistit (blokery pro pozdější fáze, ne pro náhled)

Viz `docs/OPEN_QUESTIONS.md`. Shrnutí:

- název značky a doména e-shopu,
- IČO / sídlo / plátcovství DPH provozovatele (`tax_mode`),
- Cloudflare účet, Stripe účet, Packeta účet, Resend/e-mail doména,
- reálný sortiment (SKU, dodavatelé, certifikace, rozměry) — **produktový obsah se záměrně neplní, dokud nebudou reálná SKU a dokumentace výrobců**,
- skladová adresa a podací místo pro Packeta.

## 5. Struktura náhledu

```
eshop/
├── PROJECT_AUDIT.md          ← tento soubor
├── IMPLEMENTATION_STATUS.md  ← stav fází
└── docs/
    ├── ARCHITECTURE.md       ← cílová architektura + volba Astro vs Next.js + náklady
    ├── DATA_MODEL.md         ← ER model, všechny tabulky, constraints
    ├── STATE_MACHINES.md     ← order/payment/fulfillment/return/claim automaty
    ├── THREAT_MODEL.md       ← threat model, mitigace, security testy
    ├── ROADMAP.md            ← implementační fáze 0–11, Definition of Done
    ├── BRAND_VOICE.md        ← husky brand systém, slovník, pravidla
    ├── UX_COPY.md            ← copy pro celý e-shop + e-maily + packaging
    ├── SEO_CONTENT_MAP.md    ← SEO/GEO/AEO architektura, keyword engine, clustery
    └── OPEN_QUESTIONS.md     ← co musí dodat provozovatel
```
