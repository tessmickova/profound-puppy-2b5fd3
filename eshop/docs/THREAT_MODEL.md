# THREAT_MODEL.md

**Stav:** NÁHLED ke schválení. Cíl: defense-in-depth, minimalizace blast radius. Revize proti aktuálnímu OWASP Top 10 proběhne znovu v PHASE 9.

---

## 1. Aktiva (co chráníme, seřazeno dle priority zadání §92)

1. **Bezpečnost lidí** — pravdivost bezpečnostních informací (brýle na zatmění!), recall schopnost.
2. **Správnost plateb a objednávek** — nikdo nezaplatí špatnou částku, žádná objednávka se neztratí ani nezdvojí.
3. **Osobní údaje zákazníků** — e-maily, adresy, telefony, historie nákupů.
4. **Sklad** — žádný overselling, žádná tichá manipulace.
5. **Admin přístup** — plná kontrola nad obchodem.
6. **Dostupnost v burstu** — výpadek během eventu = ztráta celé sezóny.

## 2. Aktéři hrozeb

| Aktér | Motivace | Typické útoky |
|---|---|---|
| Oportunistický bot/scanner | plošné skenování | SQLi, výchozí admin cesty, credential stuffing |
| Podvodný „zákazník“ | zboží zdarma / levněji | manipulace ceny/kupónu, fake payment success, replay webhooků, zneužití refund/return flow |
| Scalper | skoupit limitované zboží (brýle před zatměním) | boti v checkoutu, obcházení purchase limits |
| Konkurence/vandal | poškodit v sezóně | DoS na checkout, vyčerpání skladu falešnými rezervacemi |
| Zvědavý uživatel | cizí data | IDOR (`/order/1234`), enumerace tokenů |
| Insider (role) | překročení oprávnění | warehouse čte finanční exporty, export PII |
| Kompromitovaný dodavatel/závislost | supply chain | otrávený npm balíček, únik secrets |

## 3. Hlavní hrozby a mitigace (STRIDE výběr)

### T1 — Falešné potvrzení platby (Spoofing) — KRITICKÉ
*Útok:* volání success URL, podvržený webhook, replay starého webhooku.
*Mitigace:* order.paid nastavuje jen webhook s **ověřeným podpisem** (Stripe signature, tolerance timestampu), idempotence přes `provider_event_id UNIQUE`, částka+měna z webhooku se porovná s objednávkou (mismatch → alert, ne paid), success page pouze čte stav. Reconciliation cron jako druhá nezávislá kontrola.

### T2 — Manipulace ceny/kupónu (Tampering) — KRITICKÉ
*Útok:* klient pošle vlastní cenu, záporné množství, cizí kupón, kupón 100×.
*Mitigace:* klient posílá jen SKU+qty; server počítá vše. Zod validace: qty INTEGER 1..limit. Kupón validován server-side (platnost, počet užití, min. objednávka) v témže batchi jako objednávka. Purchase limits per e-mail/IP u kritických produktů.

### T3 — Race condition posledního kusu (Tampering/DoS)
*Útok:* dva současné checkouty; nebo bot vytváří rezervace a nechává je propadnout (inventory exhaustion).
*Mitigace:* podmíněný UPDATE s `changes()` kontrolou (viz ARCHITECTURE §4.2). Proti rezervační DoS: rezervace až po odeslání kontaktů (ne při přidání do košíku), TTL 20 min, rate limit na checkout initiation, Turnstile až při anomálním objemu (high traffic mode), limit aktivních rezervací per IP/e-mail.

### T4 — IDOR na objednávky/doklady (Information Disclosure)
*Útok:* `/order/1234`, uhádnutí URL faktury v R2.
*Mitigace:* žádné sekvenční ID v URL; 128bit tokeny, v DB jen hash, expirace, jednorázovost pro citlivé akce. R2 privátní bucket, přístup jen přes Worker se signed URL s krátkou platností. Admin API ověřuje vlastnictví entity, ne jen přihlášení.

### T5 — Převzetí adminu (Elevation of Privilege) — KRITICKÉ
*Mitigace:* WebAuthn passkeys (phishing-resistant), fallback magic link + TOTP, rate limit + lockout, admin session krátká + HttpOnly + Secure + SameSite=Lax, role vynucené na API vrstvě (ne UI), audit_log všech kritických akcí, žádný sdílený účet. Volitelně Cloudflare Access před `/admin` jako druhá vrstva.

### T6 — XSS / injection (Tampering)
*Mitigace:* Astro escapuje default; žádné `set:html` s uživatelským vstupem; admin poznámky/reklamační texty renderovat jako text. Striktní CSP (nonce, žádný unsafe-inline), parameterized queries všude (D1 bindings), Zod na každém vstupu, output encoding, upload reklamačních fotek: whitelist content-type, přegenerování obrázku, privátní bucket, žádné vykonávání.

### T7 — CSRF
*Mitigace:* SameSite cookies + CSRF token na mutující admin/checkout formuláře + kontrola Origin headeru na API.

### T8 — Neautorizovaný refund (EoP)
*Mitigace:* refund jen role owner/admin, dvojité potvrzení částky, audit_log, denní limit → alert, refund idempotency key.

### T9 — DoS / burst zneužití (Denial of Service)
*Mitigace:* statické stránky z CDN (útok na cache nic nestojí), Workers Rate Limiting na `/api/cart`, `/api/checkout`, webhook endpointy, WAF managed rules, high traffic mode. Checkout má prioritu — availability endpoint degraduje na cached hodnoty dřív, než by padl checkout.

### T10 — Únik secrets (Information Disclosure)
*Mitigace:* Cloudflare secrets (nikdy v repu/bundle), `.env` gitignored, `.env.example` jen jména, secret scanning v CI, logy bez tokenů/PII (redakce payloadů v `payment_events.payload_redacted_json`), oddělené test/live klíče per prostředí.

### T11 — Supply chain
*Mitigace:* minimum závislostí, commitnutý lockfile, `npm audit`/Dependabot v CI, pinované GitHub Actions, review nových závislostí.

### T12 — E-mail spoofing naší domény
*Mitigace:* SPF, DKIM, DMARC (p=quarantine→reject), oddělená subdoména pro transactional mail, žádné odkazy na IP/cizí domény v mailech.

### T13 — Ztráta dat (Repudiation/Availability)
*Mitigace:* denní D1 export do R2 (verzovaný, oddělený účet/scope), append-only ledgery (inventory_movements, order_events, audit_log), pravidelný test obnovy (netestovaný backup ≠ backup). RPO 24 h (cíl 1 h přes Time Travel), RTO 4 h. Detaily v DISASTER_RECOVERY (PHASE 2).

### T14 — Falešná bezpečnostní tvrzení (safety) — KRITICKÉ, reputačně-právní
*Mitigace:* certifikace/normy jen z dokumentace výrobce (product_documents), žádný AI-generovaný safety text bez podkladu, recall workflow: SKU+LOT → dotčené zásilky → export kontaktů → notifikace. `LEGAL REVIEW REQUIRED BEFORE PRODUCTION` na všech právních textech.

## 4. Security headers & platformní baseline

HTTPS only + HSTS (preload po ověření), CSP (default-src 'self', nonce skripty), X-Content-Type-Options: nosniff, Referrer-Policy: strict-origin-when-cross-origin, Permissions-Policy (kamera/mikrofon/geolokace off), Secure+HttpOnly cookies, SameSite=Lax (checkout) / Strict (admin). Turnstile POUZE: return lookup, stock notify, B2B formulář, anomální checkout objem — ne v běžném checkoutu.

## 5. Testovací plán (PHASE 9 — automatizované abuse testy)

SQLi (parametrizace), XSS (reflected/stored v admin), CSRF, auth bypass, IDOR (cizí order token, cizí faktura), rate-limit abuse, kupón manipulace (expirace, násobné užití, cizí scope), price manipulation (vlastní cena v payloadu), qty ≤ 0 / non-integer, stock race (paralelní checkout posledního kusu), webhook replay + duplicate + bad signature + amount mismatch, fake payment success (redirect bez webhooku), unauthorized refund (role warehouse), unauthorized admin endpoint bez session/s nižší rolí, reservation exhaustion, token enumeration (timing-safe compare).
