# Reklamní služba Světa jmen

Samostatná aplikace, která prodává reklamní plochy a vydává kreativy webu.
Běží mimo web se jmény, aby ho její výpadek nikdy nepoložil.

## Vývoj

```bash
npm install
npm run db:schema:local     # založí lokální databázi
npm run dev                 # služba na http://localhost:8799
npm run typecheck
```

Token pro správu si ve vývoji dejte do `.dev.vars` (soubor je mimo repozitář):

```
ADMIN_TOKEN=nejaky-dlouhy-nahodny-retezec
```

Aby web ve vývoji bral reklamy odsud:

```bash
NEXT_PUBLIC_ADS_API=http://localhost:8799 npm run dev   # v kořeni repozitáře
```

## Rychlá zkouška celého toku

```bash
# 1) volné plochy a ceník
curl -s localhost:8799/api/sloty | head -c 200

# 2) objednávka (vrátí token a variabilní symbol)
curl -s -X POST localhost:8799/api/objednavka -H 'Content-Type: application/json' -d '{
  "plocha":"deti-bocni","obdobi":"pulrok","ikona":"baby",
  "firma":"Zkouška s.r.o.","email":"a@priklad.cz","znacka":"Zkouška",
  "nadpis":"Nadpis inzerátu","text":"Dvě věty o tom, co nabízíme.",
  "cta":"Zjistit víc","odkaz":"https://priklad.cz","souhlas":true}'

# 3) potvrzení platby
curl -s -X POST localhost:8799/api/admin/potvrdit \
  -H "Authorization: Bearer $ADMIN_TOKEN" -H 'Content-Type: application/json' \
  -d '{"vs":"<variabilní symbol z kroku 2>"}'

# 4) kreativa je venku
curl -s "localhost:8799/api/reklamy?plocha=deti-bocni"
```

## Správa z webu (/sprava)

Stránka `/sprava` na webu se přihlašuje týmž `ADMIN_TOKEN` a umí: přehled
objednávek, potvrzení platby podle VS, denní úklid ručně a **přepínače
webu** (reklamy, panel „Můj výběr", analýza výběru). Přepínače sedí
v tabulce `nastaveni` — na existující databázi ji založí migrace:

```bash
npm run db:migrace-003          # ostrá databáze
npm run db:migrace-003:local    # lokální vývoj
```

Endpointy: veřejné `GET /api/nastaveni` (web, cache 60 s); s tokenem
`GET /api/admin/overeni`, `GET /api/admin/prehled`,
`POST /api/admin/potvrdit`, `POST /api/admin/nastaveni`
(`{"klic":"reklamy","hodnota":false}`), `POST /api/admin/uklid`.

## Kde co je

| Soubor | Obsah |
|---|---|
| `src/index.ts` | routy, CORS, validace, denní úklid |
| `src/plochy.ts` | katalog 30 ploch, ceník, kapacita, seznam ikon |
| `src/db.ts` | dotazy do databáze, obsazenost slotů, expirace |
| `src/samoobsluha.ts` | objednávková stránka pro firmy |
| `schema.sql` | tři tabulky — inzerenti, objednávky, inzeráty |
| `wrangler.toml` | nastavení nasazení, cron, proměnné |

Podrobný popis nákupního toku, ceníku a provozu: `../docs/REKLAMY.md`.
Postup nasazení: `../docs/NASAZENI.md`.
