# STATE_MACHINES.md — Stavové automaty

**Stav:** NÁHLED ke schválení. Statusy jsou explicitní enum, přechody pouze přes doménovou funkci `transition(entity, event)` — nikde v kódu se nesmí zapsat status přímo. Každý přechod → `order_events` (timestamp, actor, previous, next, metadata).

---

## 1. Order status (hlavní)

```
draft ──checkout_submitted──▶ awaiting_payment
awaiting_payment ──payment_confirmed(webhook)──▶ paid
awaiting_payment ──payment_failed──▶ payment_failed ──retry──▶ awaiting_payment
awaiting_payment ──session_expired/cancel──▶ cancelled          (+ release rezervací)
payment_failed   ──timeout──▶ cancelled                          (+ release rezervací)
paid ──fulfillment_started──▶ processing ──▶ ready_to_ship ──handover──▶ shipped ──▶ delivered
paid|processing ──admin_cancel──▶ cancelled (+ refund + vrácení skladu)
delivered ──return_completed──▶ returned | partially_returned
kterýkoli po paid ──refund_completed──▶ refunded | partially_refunded
```

Zakázané přechody vyhazují chybu (např. `shipped → awaiting_payment`). `cancelled`, `refunded`, `returned` jsou terminální (kromě partial variant).

## 2. Payment status (oddělený, per payment záznam)

```
created ──redirect──▶ pending ──webhook:paid──▶ paid
pending ──webhook:failed──▶ failed
pending ──expired──▶ expired
paid ──refund──▶ partially_refunded ──▶ refunded
```

**Pravidla:**
- `order.paid` nastavuje VÝHRADNĚ ověřený webhook (podpis + idempotence), nikdy `/payment/success` redirect. Success page čte server-side stav a umí zobrazit „platbu ověřujeme“ (webhook ještě nedorazil).
- Webhook může předběhnout redirect i přijít 5× — výsledek identický (processed_events).
- Reconciliation cron porovnává provider↔local a hlásí: paid+unpaid, paid+missing, duplicate, refund mismatch.

## 3. Fulfillment status

```
none ──▶ queued ──label_created──▶ labeled ──handed_over──▶ in_transit ──▶ delivered
in_transit ──▶ returned_to_sender ──▶ (admin: refund / re-ship)
```

## 4. Rezervace skladu

```
active ──order_paid──▶ consumed        (physical -= qty, reserved -= qty, movement: sale)
active ──expires_at < now──▶ expired   (reserved -= qty, movement: release)
active ──cart/checkout cancel──▶ released
```

Expiry cron běží každou minutu; každý přechod je podmíněný UPDATE na `status='active'` → nikdy dvojité vrácení.

## 5. Return (vratka / odstoupení)

```
requested ──admin──▶ approved ──zboží dorazilo──▶ received ──▶ inspected
inspected ──▶ refund_pending ──provider refund OK──▶ refunded
requested|inspected ──▶ rejected
```
Refund vždy přes PaymentProvider API, podpora partial. Vrácené kusy → `inventory_movements(return)` (nebo `damage`).

## 6. Claim (reklamace)

```
received ──▶ assessing ──▶ approved(repair|replacement|refund) ──▶ resolved
assessing ──▶ rejected(zdůvodnění) ──▶ resolved
```
`statutory_deadline_at` = `filed_at + settings.claim_deadline_days` (konfigurovatelné, NE hardcoded). Dashboard zvýrazňuje < 7 dní do deadline.

## 7. Checkout flow (sekvenčně)

```
KOŠÍK (server počítá ceny)
 → DOPRAVA + KONTAKT (eligibility podle rozměrů/hmotnosti; Packeta widget pro výdejní místo)
 → shrnutí → [Zaplatit]
 → server: validace → rezervace skladu (podmíněné UPDATE batch) → order(draft→awaiting_payment)
   → PaymentProvider.createPayment() → redirect na hosted checkout
 → webhook paid → consumed rezervace, order paid, queue: invoice + email + fulfillment
 → success page: zobrazí server-side stav
```

Frontend posílá jen `SKU + quantity + shipping_method + pickup_point + kontakt`. Ceny, DPH, slevy, dopravu i total počítá výhradně server.

## 8. Event lifecycle

```
upcoming ──event_date se blíží──▶ active ──event_date prošlo──▶ passed
passed ──má další occurrence──▶ recurring (hub zůstává evergreen, založí se nový event)
passed ──bez pokračování──▶ archived (SEO stránka zůstává, přepne se na informační režim)
```
Countdown server-consistent (Europe/Prague), po `passed` se nikdy nezobrazují záporná čísla. Delivery cutoff = `event_date - carrier_SLA - warehouse_buffer` → „Objednejte do X, abychom zásilku předali dopravci před událostí.“ Rozlišuje se „odešleme do“ vs „dopravce předpokládá doručení“.
