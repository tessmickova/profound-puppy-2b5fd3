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
npm run db:migrace          # ostrá databáze (pustí všechny v pořadí)
npm run db:migrace:local    # lokální vývoj
```

Endpointy: veřejné `GET /api/nastaveni` (web, cache 60 s); s tokenem
`GET /api/admin/overeni`, `GET /api/admin/prehled`,
`POST /api/admin/potvrdit`, `POST /api/admin/schvalit` (`{"id":"…"}`),
`POST /api/admin/zamitnout` (`{"id":"…","duvod":"…"}`),
`POST /api/admin/nastaveni` (`{"klic":"reklamy","hodnota":false}`),
`POST /api/admin/uklid`.

## Schvalování kreativ

**Zaplacení není zveřejnění.** Zaplacená objednávka přejde do stavu `aktivni`
a drží plochu, ale inzerát se na webu neobjeví, dokud nemá `inzeraty.schvaleno
= 1`. Rozhoduje o tom jediná podmínka ve dvou dotazech v `src/db.ts` — kdyby
odtud vypadla, schvalování v adminu by bylo jen dekorace.

Každá úprava textu (`PATCH /api/objednavka/:token`) i výměna loga sráží
schválení zpátky na nulu. Bez toho by stačilo nechat si schválit slušný
inzerát a hned nato do něj napsat cokoli.

## Platby přes ComGate

Brána je **nepovinná**. Bez `COMGATE_MERCHANT` nebo bez `COMGATE_SECRET` se
vůbec nepoužije a služba prodává dál na převod s variabilním symbolem —
stejně jako dřív. Když brána je a zrovna neodpoví, objednávka se přesto uloží
a zákazník dostane bankovní pokyny.

| Route | Metoda | K čemu |
|---|---|---|
| `/api/platba/notifikace` | POST | zpráva z brány (server→server), **jediná autorita o zaplacení** |
| `/api/platba/navrat?refId=…` | GET | stránka pro zákazníka po návratu z brány; **nic neaktivuje** |

Notifikace nemá admin token — volá ji cizí server. Ověřuje se místo něj
`secret` brány (porovnáním v konstantním čase), obchodník, měna, že `refId`
je naše objednávka a že `price` v haléřích sedí na cenu objednávky.
Odpovídá se vždycky `code=0&message=OK`, i při odmítnutí: cokoli jiného pro
bránu znamená „nedoručeno" a notifikaci opakuje donekonečna. Důvod odmítnutí
zůstane v logu (`npx wrangler tail`), tajemství tam nikdy.

Nastavení do `wrangler.toml` → `[vars]`: `COMGATE_MERCHANT`, `COMGATE_TEST`.
Tajemství zvlášť: `npx wrangler secret put COMGATE_SECRET`. V portálu ComGate
je ještě potřeba vyplnit adresy notifikace a návratu — v kódu být nemůžou.

## Testy

```bash
npm test          # node:test přes tsx, bez sítě a bez databáze
```

Pokrývají to, co se dá pokazit potichu: parser urlencoded odpovědi brány,
ověření notifikace (špatné tajemství, cizí `refId`, nesouhlasící částka,
opakovaná notifikace) a pravidlo, že úprava inzerátu shodí schválení.

## Kde co je

| Soubor | Obsah |
|---|---|
| `src/index.ts` | routy, CORS, validace, schvalování, notifikace, denní úklid |
| `src/plochy.ts` | katalog 30 ploch, ceník, kapacita, seznam ikon |
| `src/db.ts` | dotazy do databáze, obsazenost slotů, expirace |
| `src/comgate.ts` | platební brána — založení platby, ověření notifikace |
| `src/samoobsluha.ts` | objednávková stránka pro firmy + návrat z brány |
| `schema.sql` | tři tabulky — inzerenti, objednávky, inzeráty |
| `migrace/` | přírůstkové změny schématu pro už běžící databázi |
| `testy/` | testy brány a schvalování (`npm test`) |
| `wrangler.toml` | nastavení nasazení, cron, proměnné |

Podrobný popis nákupního toku, ceníku a provozu: `../docs/REKLAMY.md`.
Postup nasazení: `../docs/NASAZENI.md`.
