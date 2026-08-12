# DATA_MODEL.md — ER model (D1 / SQLite)

**Stav:** NÁHLED ke schválení. Konvence: PK = `id` (ULID text), časy ISO-8601 UTC, peníze INTEGER haléře, boolean INTEGER 0/1, FK s `ON DELETE RESTRICT` (default) — mazání řeší anonymizace/retention, ne kaskády.

---

## 1. Přehled domén

```
KATALOG      products ─ product_variants ─ product_media ─ product_documents ─ product_batches
             bundles ─ bundle_items          events ─ event_products
SKLAD        inventory_locations ─ variant_stock ─ inventory_movements ─ stock_reservations
             suppliers ─ purchase_orders ─ purchase_order_items
PRODEJ       carts ─ cart_items    orders ─ order_items ─ order_events
             payments ─ payment_events     discounts
FULFILLMENT  shipments ─ shipment_events   packaging_types
PO PRODEJI   returns ─ return_items        claims ─ claim_events
ÚČETNICTVÍ   invoices ─ invoice_lines ─ credit_notes ─ number_series
ZÁKAZNÍK     customers ─ addresses ─ consents ─ customer_tokens ─ stock_notifications
SYSTÉM       admin_users ─ roles ─ admin_credentials ─ audit_log ─ settings
             email_events ─ processed_events ─ b2b_requests
```

## 2. Katalog

### products
`id, sku*, name, slug*, status(draft|active|archived|recalled), product_type(simple|variant_parent), description_md, short_benefit, category_id, supplier_id→suppliers, supplier_sku, vat_rate_pct, preorder_allowed, preorder_eta_date, recommended_package_type→packaging_types, safety_critical(bool), manufacturer, importer, distributor, model_designation, applicable_standard, recall_status(none|watch|recalled), attributes_json` *(strukturované atributy pro AI/SEO: purpose, audience, age_suitability, material, compatibility…)*, `created_at, updated_at`

- Cena a rozměry žijí na **variantě** (i simple produkt má 1 default variantu) → jednotný pricing/stock model.
- `attributes_json` je stroje-čitelný (klíč→hodnota s typem), ne prose.

### product_variants
`id, product_id→, sku* UNIQUE, ean, name_suffix("vel. 24 / modrá"), options_json({size:"24",color:"modrá"}), selling_price_minor, purchase_price_minor, vat_rate_pct(NULL=dědí z produktu), weight_g, length_mm, width_mm, height_mm, status, shelf_location, position`

### product_media
`id, product_id→, variant_id→?, r2_key, alt_text, position, is_primary, width, height, original_r2_key`

### product_documents
`id, product_id→, type(certificate|declaration_of_conformity|instructions|warnings|safety_sheet|supplier_doc), title, r2_key, public(bool), valid_from, valid_to`

### product_batches  *(šarže — kritické pro recall)*
`id, variant_id→, lot_code, supplier_id→, received_at, purchase_order_id→?, quantity_received, notes`
- Odečet při expedici zapisuje `batch_id` do `shipment_items` → dohledatelnost „komu odešel lot X“.

### bundles
`id, sku* UNIQUE, name, slug, status, selling_price_minor, vat_rate_pct, description_md, badge(text?), position`
### bundle_items
`id, bundle_id→, variant_id→, quantity` — **bundle nemá vlastní sklad**; dostupnost = `MIN(floor(available(variant)/quantity))` počítáno vždy živě.

### events
`id, slug*("zatmeni-slunce-2027"), hub_slug("zatmeni-slunce"), name, status(upcoming|active|passed|recurring|archived), event_date, event_end_date?, timezone("Europe/Prague"), countdown_enabled, description_md, faq_json, seo_title, seo_description, delivery_cutoff_buffer_days`
### event_products
`event_id→, product_id→, position, PRIMARY KEY(event_id, product_id)` — produkt může být ve více eventech.

## 3. Sklad

### inventory_locations
`id, code("MAIN"), name, address_json` — MVP jedna lokace, model na víc připraven.

### variant_stock  *(aktuální stav — vždy odvoditelný z ledgeru, držený pro rychlé podmíněné UPDATE)*
`variant_id→ PK, location_id→ PK, physical, reserved, safety_stock, incoming, reorder_point`
- `available = physical - reserved - safety_stock` (počítáno, neukládáno).
- CHECK `physical >= 0 AND reserved >= 0 AND reserved <= physical`.

### inventory_movements  *(append-only ledger — NIKDY update/delete)*
`id, variant_id→, location_id→, type(purchase|sale|reservation|release|return|damage|manual_correction|recall_hold), quantity_delta, batch_id→?, reference_type(order|purchase_order|return|manual), reference_id, reason(povinný u manual_correction), actor(admin_user_id|system), created_at`

### stock_reservations
`id, cart_id→, order_id→?, variant_id→, quantity, status(active|consumed|released|expired), expires_at, created_at`
- Index na `(status, expires_at)` pro expiry cron.

### suppliers
`id, name, contact_json, currency, lead_time_days, moq, notes`
### purchase_orders
`id, supplier_id→, status(draft|ordered|partially_received|received|cancelled), ordered_at, expected_at, notes`
### purchase_order_items
`id, purchase_order_id→, variant_id→, quantity_ordered, quantity_received, purchase_price_minor, lot_code?`
- Příjem → `inventory_movements(purchase)` + `product_batches` u safety-critical zboží.

## 4. Prodej

### carts
`id, token_hash* (cookie token — v DB jen hash), status(active|converted|abandoned|expired), currency, created_at, updated_at`
### cart_items
`id, cart_id→, variant_id→?, bundle_id→?, quantity, CHECK(variant XOR bundle)` — **žádná cena**; cenu vždy počítá server při čtení košíku i při checkoutu.

### orders
`id, order_number* UNIQUE (lidské, sekvenční per rok: 2026-00001), status (viz STATE_MACHINES), payment_status, fulfillment_status, return_status, customer_id→?, email, phone, billing_json, shipping_json, is_company, company_name?, ico?, dic?,`
**immutable snapshot:** `items_total_minor, shipping_price_minor, payment_fee_minor, discount_minor, total_minor, vat_breakdown_json, currency, terms_version_id→settings_versions, shipping_method, pickup_point_json?, delivery_cutoff_note?, locale, created_at, paid_at?, shipped_at?`
### order_items  *(snapshot v momentu nákupu — bez FK závislosti na aktuální ceně)*
`id, order_id→, variant_id→?, bundle_id→?, sku, product_name, variant_label, quantity, unit_price_minor, vat_rate_pct, discount_minor, line_total_minor, is_preorder, expected_ship_date?, component_breakdown_json (u bundlu: rozpad na SKU×qty pro sklad/picking)`
### order_events  *(append-only)*
`id, order_id→, timestamp, actor(system|admin:id|customer|webhook:stripe), previous_state, next_state, state_domain(order|payment|fulfillment|return), metadata_json`

### payments
`id, order_id→, provider(stripe|comgate|gopay), provider_session_id, provider_payment_id?, status(created|pending|paid|failed|expired|refunded|partially_refunded), amount_minor, currency, refunded_minor DEFAULT 0, idempotency_key* UNIQUE, created_at, paid_at?`
### payment_events
`id, payment_id→, provider_event_id* UNIQUE (idempotence), type, payload_redacted_json, signature_verified(bool), created_at`

### discounts
`id, code* UNIQUE (case-insensitive), type(percent|fixed|free_shipping), value, min_order_minor?, valid_from, valid_to, max_uses, used_count, per_customer_limit, applies_to_json(SKU/kategorie?), active`
- Validace výhradně server-side; použití zapisováno do order snapshotu.

## 5. Fulfillment

### packaging_types
`id, code(envelope_s|box_m|oversized|…), name, max_weight_g?, dims`
### shipments
`id, order_id→, provider(packeta|balikovna|ppl|dpd|gls), status(pending|label_created|handed_over|in_transit|delivered|returned_to_sender|cancelled), pickup_point_id?, tracking_number?, label_r2_key?, provider_shipment_id?, idempotency_key* UNIQUE, batch_id? (expedice-dávka), created_at`
### shipment_items
`id, shipment_id→, order_item_id→, variant_id→, quantity, batch_id→? (lot pro recall)`
### shipment_events
`id, shipment_id→, timestamp, status, raw_status, metadata_json`
### shipping_methods  *(admin konfigurace)*
`id, provider, code, name, active, price_minor, free_from_minor?, max_weight_g?, max_dims_mm_json?, cod_supported` — eligibility se počítá z rozměrů/hmotnosti položek (sáňky ≠ Z-BOX).

## 6. Po prodeji

### returns
`id, order_id→, status(requested|approved|received|inspected|refund_pending|refunded|rejected), type(withdrawal|other), token_hash, requested_at, resolved_at?, refund_payment_id→?, notes`
### return_items
`id, return_id→, order_item_id→, quantity, reason?, condition_on_receipt?`

### claims  *(reklamace — samostatný modul)*
`id, order_id→?, order_item_id→?, status(received|assessing|approved|rejected|resolved), preferred_resolution(repair|replacement|refund), description, photos_r2_keys_json, filed_at, statutory_deadline_at (počítáno z konfigurovatelné lhůty v settings — NIKDY hardcoded), resolved_at?, resolution?, customer_email`
### claim_events
`id, claim_id→, timestamp, actor, type(status_change|message|internal_note), body, metadata_json`

## 7. Účetnictví

### number_series  *(konzistentní číselné řady — žádné díry, žádné přepisy)*
`series_code(invoice_2026|credit_note_2026|order_2026) PK, prefix, next_number` — výdej čísla = podmíněný UPDATE `next_number = next_number + 1` v batchi s INSERTem dokladu.
### invoices
`id, invoice_number* UNIQUE, order_id→, type(invoice|proforma), tax_mode_snapshot(non_vat_payer|vat_payer), issue_date, taxable_date, due_date, supplier_snapshot_json (naše IČO/DIČ/sídlo v momentu vystavení), customer_snapshot_json, lines_json, vat_summary_json, total_minor, pdf_r2_key?, status(issued|cancelled_by_credit_note), idempotency_key* UNIQUE`
### credit_notes
`id, credit_note_number* UNIQUE, invoice_id→, reason, lines_json, total_minor, pdf_r2_key?, issue_date`
- Export CSV: date, doc number, customer, VAT base, VAT, gross, payment provider, payment ID.

## 8. Zákazník & privacy

### customers  *(PII odděleně od provozu; orders drží kopii nutnou pro daňové doklady)*
`id, email* UNIQUE, phone?, name?, created_at, anonymized_at?`
### addresses
`id, customer_id→, type(billing|shipping), address_json, last_used_at`
### customer_tokens  *(magic link / order lookup)*
`id, customer_id→?, order_id→?, purpose(order_view|return|claim|account|stock_notify_confirm), token_hash* , expires_at, used_at?, single_use(bool)`
### consents
`id, customer_id→?, email, type(marketing_email|stock_notification|analytics), granted(bool), timestamp, source(checkout|footer|soldout_page), consent_version, proof_json(IP prefix, user-agent zkráceně), revoked_at?`
### stock_notifications
`id, variant_id→, email, consent_id→, status(pending_confirm|active|sent|cancelled), created_at`

Retention policy (konfigurovatelná v `settings`): objednávky/doklady dle zákonných lhůt (default 10 let doklady), marketingové souhlasy do odvolání, carts 90 dní, logy 30–90 dní, tokeny dle expirace. GDPR export = join přes `customers.id`; anonymizace přepíše PII v `customers/addresses`, doklady zůstávají (zákonná povinnost).

## 9. Systém

### admin_users
`id, email* UNIQUE, name, role(owner|admin|warehouse|customer_support|accountant), active, totp_secret_enc?, created_at`
### admin_credentials  *(WebAuthn)*
`id, admin_user_id→, credential_id*, public_key, transports, sign_count, created_at, last_used_at`
### audit_log  *(append-only)*
`id, timestamp, admin_user_id→?, action, entity_type, entity_id, before_json?, after_json?, ip_prefix, correlation_id`
- Povinné pro: manuální korekce skladu, refundy, změny cen, exporty s PII, změny rolí, změny settings, recall akce.
### settings
`key PK, value_json, version, updated_at, updated_by→` — `tax_mode`, reklamační lhůty, rezervační TTL, retention, obchodní podmínky verze, high_traffic_mode default…
### email_events
`id, order_id→?, template, recipient_hash, status(queued|sent|failed|dlq), provider_message_id?, attempts, last_error?, created_at, sent_at?`
### processed_events  *(globální idempotence)*
`id PK (provider:event_id | job key), processed_at`
### b2b_requests
`id, organization, ico?, contact_name, email, phone?, quantity, product_interest, deadline?, note, status(new|quoted|won|lost), quote_r2_key?, created_at`

## 10. Indexy (výběr kritických)

- `orders(status, created_at)`, `orders(email)`, `orders(order_number)`
- `stock_reservations(status, expires_at)`
- `inventory_movements(variant_id, created_at)`
- `shipment_items(batch_id)` — recall lookup
- `payment_events(provider_event_id)` UNIQUE — webhook dedup
- `customer_tokens(token_hash)`, `discounts(code)`
- FTS-lite pro admin search: `orders(email, phone, tracking)` + `products(name, sku)`; storefront search = normalizovaná tabulka `search_terms(term, product_id)` s aliasy a bez diakritiky.
