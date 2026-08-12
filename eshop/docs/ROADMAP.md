# ROADMAP.md — Implementační plán

**Stav:** NÁHLED ke schválení. Fáze se dokončují sekvenčně; každá končí testy a aktualizací `IMPLEMENTATION_STATUS.md`. Nic se neoznačuje jako hotové, dokud to neprojde Definition of Done dané fáze.

---

## PHASE 0 — Discovery ✅ (tento náhled)
Audit repozitářů, PROJECT_AUDIT.md, architektura, data model, threat model, state machines, brand guide, SEO mapa, otevřené otázky.

## PHASE 1 — Architecture (po schválení, ~po založení repa)
- Založení nového monorepa, přenos `eshop/docs/*`.
- Načtení AKTUÁLNÍ dokumentace: Cloudflare (D1, Queues, Rate Limiting, Turnstile), Stripe Checkout + webhooks, Packeta API, Resend, schema.org/Google.
- Zpřesnění ARCHITECTURE.md a DATA_MODEL.md podle reálných limitů. ADR pro každé odchýlení.
**DoD:** dokumenty odpovídají aktuálním API; žádné rozhodnutí „z hlavy“.

## PHASE 2 — Foundation
- Cloudflare: účet/zóna, prostředí local/preview/production, D1 ×3, R2 ×2 buckety per env, Queues + DLQ, KV.
- Monorepo skeleton (apps/storefront, apps/core, packages/*), TypeScript strict, ESLint, Vitest + vitest-pool-workers.
- D1 migrační systém (číslované SQL migrace, žádná destruktivní migrace bez guardu), seed pro dev.
- CI/CD: GitHub Actions — lint, typecheck, unit, integration, security scan (audit + secret scan), build; deploy preview na PR, production jen z main po zelené pipeline.
- Admin auth: WebAuthn + magic link + TOTP, role, session, audit_log.
- Security headers middleware, health endpoint, logging s correlation ID.
- Backup: denní D1 export do R2 + dokumentovaný a otestovaný restore (docs/DISASTER_RECOVERY.md).
**DoD:** deploy na preview funguje; admin se přihlásí passkeyem; restore z backupu ověřen; CI blokuje červený build.

## PHASE 3 — Catalog + Inventory
- products, variants, media (R2 + generování AVIF/WebP variant, originál zachován), documents, batches.
- bundles (společné komponenty, živý výpočet dostupnosti), events + event_products, event lifecycle cron.
- Inventory ledger + variant_stock + podmíněné UPDATE, příjem skladu (PO modul), manuální korekce s důvodem.
- Admin CRUD (produkty, varianty, bundly, eventy, dodavatelé, PO), CSV import s preview/dry-run, exporty.
- Storefront: homepage, kategorie/event landing, product detail (varianty, ProductGroup markup), interní search (aliasy, diakritika), sitemap/robots/canonical/OG, i18n message layer (cs-CZ).
**DoD:** produkt lze založit v adminu a vidět na webu; bundle dostupnost správně klesá s komponentami; movements ledger sedí na stav; testy race conditions skladu zelené. **Reálný produktový obsah se neplní — jen struktura + demo SKU označená jako demo.**

## PHASE 4 — Checkout + Payments
- Cart (cookie token, server-side pricing), shipping eligibility (rozměry/hmotnost), Packeta widget výdejních míst.
- Checkout (guest default, 3 kroky, autocomplete atributy, inline validace, mobile-first, „Nakupuji na firmu“ toggle).
- stock_reservations + expiry cron; PaymentProvider abstrakce + Stripe Checkout (TEST MODE); webhook endpoint (podpis, idempotence, amount check); order state machine; discounts; purchase limits.
- Transakční e-maily 1–3 (objednávka přijata / čekáme na platbu / platba přijata) přes queue s retry + DLQ.
- Reconciliation cron (Stripe test ↔ orders).
**DoD:** kompletní nákup v test mode projde vč. webhooků; webhook 5×/replay/bad signature/expired session testy zelené; poslední kus nelze koupit dvakrát; e-mail dorazí; „REQUIRES PRODUCTION CREDENTIALS“ tam, kde chybí live přístupy.

## PHASE 5 — Fulfillment
- ShippingProvider abstrakce + Packeta adapter (create shipment, label PDF, tracking, manifest) v test/mock režimu dle dostupnosti credentials.
- Batch expedice: filtr → výběr N objednávek → hromadné štítky (merge PDF) → picking list (agregace per SKU) → packing screen (tablet) → hromadná změna stavu → tracking e-maily (šablony 4–6).
- shipment_items s batch/LOT vazbou; recall nástroj (SKU+LOT → objednávky → export).
**DoD:** 200 test objednávek lze expedovat v jednom průchodu; picking list agreguje bundly na komponenty; label mock/test funguje; recall dohledá zásilky s daným lotem.

## PHASE 6 — Backoffice
- Dashboard Today (objednávky, tržba, čeká na expedici, nezaplacené, low stock, reklamační deadliny, vratky, failed payments/integrations, DLQ).
- Returns: self-service formulář (order number + e-mail → jednorázový token), stavy, partial refund přes provider API; e-maily 8–9.
- Claims: formulář s fotkami, konfigurovatelná zákonná lhůta, deadline zvýraznění, komunikace; e-maily 10–11.
- Event demand dashboard (days-of-stock, sold 24h/7d, cutoff), low stock alerty, B2B poptávkový formulář + fronta nabídek.
- Backoffice search, exporty (orders/products/inventory/accounting/shipping/customers — PII jen oprávněným rolím, auditované).
**DoD:** vratka end-to-end vč. partial refundu v test mode; reklamace s deadline; každodenní operace do 3 kliknutí.

## PHASE 7 — Accounting
- Number series (bez děr, bez přepisů), invoice engine (tax_mode: neplátce/plátce, připraveno OSS), PDF do privátního R2, bezpečný odkaz v e-mailu.
- Dobropisy, storno přes credit note (nikdy mazání), účetní CSV export.
**DoD:** faktura se vystaví idempotentně po zaplacení; číselná řada konzistentní i při souběhu; dobropis váže na fakturu; export sedí na testovací sadu.

## PHASE 8 — SEO / Content
- Structured data (Organization, WebSite, BreadcrumbList, Product, Offer, ProductGroup, OfferShippingDetails, MerchantReturnPolicy kde odpovídá realitě, FAQ dle aktuálních pravidel) + validace.
- Event hub/occurrence stránky, content hub (magazín, rubriky dle BRAND_VOICE), keyword engine šablony, hreflang příprava.
- Cookie consent (necessary/analytics/marketing, Odmítnout viditelné, nic se nenačítá před souhlasem), privacy-conscious analytics + datová vrstva s dedup purchase.
- Právní stránky s placeholdery `[DOPLNIT …]` + `LEGAL REVIEW REQUIRED BEFORE PRODUCTION`.
**DoD:** Rich Results test bez chyb; CWV „good“ na mobile (lab); consent skutečně blokuje skripty; publikované SEO stránky jen s unikátní hodnotou.

## PHASE 9 — Security hardening
- Kompletní testovací plán z THREAT_MODEL §5 (automatizovaně), manuální abuse cases, review headers/CSP, rate limity, závislosti.
**DoD:** všechny abuse testy zelené; penetrační checklist projitý; nálezy opraveny nebo vědomě akceptovány se zdůvodněním.

## PHASE 10 — Performance / load
- Load test: 100 / 1 000 / 10 000 souběžných (k6 nebo ekvivalent) proti preview — product API, cart, checkout initiation, webhook. Nikdy proti produkčním platebním datům.
- Optimalizace dle výsledků, ověření high traffic mode.
**DoD:** checkout initiation drží cílovou latenci pod zátěží; žádný overselling pod souběhem; dokumentované limity.

## PHASE 11 — Launch readiness
- `docs/LAUNCH_CHECKLIST.md` (DNS, SSL, headers, live keys, webhook live + podpis, refund test, shipping/label test, reálný e-mail test, SPF/DKIM/DMARC, právní texty doplněné, consent, robots/sitemap, structured data, Search Console, Merchant Center, backup restore test, admin MFA, rate limits, stock test, checkout na Safari/Chrome/Firefox/iOS/Android…).
- Seznam skutečných blockerů (typicky: live credentials, právní review, reálná SKU).
**DoD:** checklist kompletní, blockery explicitně vyjmenované — žádné „hotovo“ bez ověření.

---

## Definition of Done celého projektu (§84)
Zákazník najde produkt → košík → doprava → platba v test mode → webhook změní objednávku → sklad se odečte → přijde e-mail → admin vidí objednávku → vytvoří zásilku → vytiskne label → zákazník dostane tracking → lze vratka → partial refund → reklamace → doklad → vše s audit trailem.

## Delší/rozšiřující funkce specifické pro tento typ e-shopu (nad rámec master promptu)
Zapracované do fází výše, ať se na ně nezapomene:
1. **Weather/event trigger monitoring** — napojení na ČHMÚ výstrahy / AuroraDog KP alerty jako interní signál „blíží se poptávka“ (dashboard, ne automatický marketing). *(PHASE 6+)*
2. **Zbožové feedy** — Google Merchant XML feed, připravenost pro Zboží.cz/Heureka (bez fake reviews). *(PHASE 8)*
3. **Stock notification double opt-in** — „hlídat naskladnění“ s vlastním souhlasem. *(PHASE 6)*
4. **Purchase limits / anti-scalper** pro kritické produkty (brýle). *(PHASE 4)*
5. **Preorder flow** s expected_ship_date a jasným označením. *(PHASE 4)*
6. **Delivery cutoff engine** per event (event date − carrier SLA − buffer). *(PHASE 5)*
7. **Recall modul** SKU+LOT → zákazníci. *(PHASE 5)*
8. **B2B/školy flow** (300 brýlí pro školu → nabídka/proforma). *(PHASE 6)*
9. **Status page/alerting** pro majitele (Telegram bot vzor z AuroraDog). *(PHASE 2/6)*
10. **Vícejazyčná příprava** (message layer od začátku). *(PHASE 3)*
