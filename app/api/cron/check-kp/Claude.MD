# API: Cron Check-KP

## Účel
Cron job spouštěný Vercelem — kontroluje KP index a posílá alerty odběratelům.

## Soubor
`app/api/cron/check-kp/route.ts`

## Endpoint
`GET /api/cron/check-kp`

## Autorizace
Bearer token v hlavičce `Authorization` — musí odpovídat `CRON_SECRET` env proměnné.

## Logika
1. Ověřit Bearer token
2. Fetch čerstvá aurora data (`fetchAllAuroraData()`)
3. Uložit do Supabase cache
4. Pokud KP ≥ 3 → načíst odběratele z `subscribers` tabulky
5. Pro každého odběratele s `threshold ≤ aktuální KP` → odeslat alert
6. Kanály: Telegram Bot API, WhatsApp Business API

## Konfigurace (vercel.json)
```json
{
  "crons": [{
    "path": "/api/cron/check-kp",
    "schedule": "* * * * *"
  }]
}
```
Spouští se **každou minutu**.

## Env proměnné
- `CRON_SECRET` — autorizační token
- `TELEGRAM_BOT_TOKEN` — Telegram Bot API token
- `WHATSAPP_TOKEN` — WhatsApp Business API token

## Jak rozšířit
- Nový alertovací kanál: přidat dispatch logiku za Telegram/WhatsApp
- Změna threshold: upravit default v `/start` handleru Telegram webhooku
