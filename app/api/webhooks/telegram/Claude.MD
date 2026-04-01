# API: Telegram Webhook

## Účel
Webhook handler pro Telegram bota — registrace odběratelů, správa alertů, dotazy na aktuální stav.

## Soubor
`app/api/webhooks/telegram/route.ts`

## Endpoint
`POST /api/webhooks/telegram`

## Příkazy bota

| Příkaz | Funkce |
|--------|--------|
| `/start` | Registrace — výchozí threshold KP 4 |
| `/alert kpX` | Nastavení vlastního prahu (kp2–kp9) |
| `/stop` | Deaktivace alertů |
| `/stav` | Aktuální KP, Bz, rychlost větru |

## Databáze
- Tabulka `subscribers` v Supabase
- Pole: `chat_id`, `channel` ('telegram'), `threshold`, `active`, `created_at`
- Upsert na `chat_id` + `channel`

## Response formát
HTML formatted messages pro Telegram (bold, italic, emoji).

## Env proměnné
- `TELEGRAM_BOT_TOKEN` — pro odesílání zpráv přes `api.telegram.org`

## Jak rozšířit
- Nový příkaz: přidat `case` do switch v POST handleru
- Nový formát zprávy: upravit HTML template v příslušném case
