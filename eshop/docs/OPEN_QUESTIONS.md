# OPEN_QUESTIONS.md — Co nelze zjistit z repozitáře

**Stav:** NÁHLED. Nic z tohoto neblokuje schválení náhledu ani PHASE 1–2 (vše lze stavět v test/mock režimu se značkou `REQUIRES PRODUCTION CREDENTIALS`). Blokuje až launch.

---

## 1. Rozhodnutí majitele (potřeba před PHASE 2–3)

| # | Otázka | Default, pokud nerozhodnete jinak |
|---|---|---|
| 1 | **Název značky + doména** — návrhy k prověření (ochranné známky ÚPV/EUIPO + volné .cz domény, nic z toho zatím neověřeno): *Čmuchal / Čenich / Vyčmucháno / OChlup(napřed) / Stopař* — nebo vlastní nápad | placeholder `[BRAND]`, struktura na názvu nezávislá |
| 2 | **Plátce DPH?** (`tax_mode`) | konfigurovatelné, default neplátce, přepnutí bez zásahu do kódu |
| 3 | Jméno maskota (veřejné, nesmí kolidovat s outdoor značkou Husky) | maskot bez veřejného jména, jen 🐺 |
| 4 | Rezervační TTL checkoutu | 20 minut |
| 5 | Práh „Zbývá X ks“ badge | ≤ 10 ks |
| 6 | Doprava zdarma od | vypnuto, konfigurovatelné v adminu |
| 7 | Dobírka v MVP? (Packeta COD) | ne (zjednodušuje reconciliaci); připraveno v modelu |

## 2. Účty a credentials (potřeba před PHASE 4–5, test klíče stačí)

- **Cloudflare** účet (Workers Paid $5/měs) + doména v zóně
- **Stripe** účet — test klíče pro PHASE 4, live až launch
- **Packeta** — smlouva + API klíč (má sandbox); adresa podacího místa / svozu
- **Resend** (nebo jiný) + přístup k DNS pro SPF/DKIM/DMARC
- GitHub repo pro monorepo (nové, viz PROJECT_AUDIT §3)

## 3. Právně-provozní údaje (blokuje launch, ne vývoj)

- IČO, sídlo, DIČ, zápis v živnostenském/OR → `[DOPLNIT]` placeholdery
- Kontaktní e-mail/telefon pro zákazníky, adresa pro vratky
- Obchodní podmínky, GDPR, reklamační řád — připravíme strukturu s placeholdery, **LEGAL REVIEW REQUIRED BEFORE PRODUCTION**
- Bankovní účet pro Stripe payout

## 4. Sortiment (záměrně ODLOŽENO na druhý krok dle vašeho zadání)

- Reálná SKU, dodavatelé, nákupní ceny, rozměry/hmotnosti, fotky
- Certifikace a dokumentace výrobců (zejména brýle na zatmění — ISO 12312-2 doklad od výrobce, ne od nás)
- **Produktové texty se nebudou generovat, dokud nebudou reálné podklady** — struktura, šablony a datový model budou připravené.

## 5. Otevřené technické ověření (PHASE 1, proti aktuální dokumentaci)

- Aktuální limity D1 (velikost DB, batch, latence) a Queues (throughput, DLQ chování)
- Stripe Checkout: aktuální webhook eventy a doporučený fulfillment flow
- Packeta API: aktuální verze, formát štítků, widget výdejních míst
- Google: aktuální pravidla FAQ rich results a Merchant Center požadavky
