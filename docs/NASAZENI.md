# Nasazení

Nasazují se **dvě věci zvlášť**: web a reklamní služba. To je záměr — reklamy
se dají nasadit, vypnout i rozbít bez dopadu na web.

> **Nasazení se z tohoto prostředí nedá spustit.** Vývojová relace nemá povolený
> odchozí provoz na `api.cloudflare.com`, `dash.cloudflare.com` ani
> `workers.dev` (proxy vrací 403). Všechno níž je připravené a ověřené lokálně
> na stejném běhovém prostředí, ale příkazy `deploy` musí spustit člověk
> s přístupem k účtu.

---

## Než začnete

```bash
export CLOUDFLARE_ACCOUNT_ID=<id účtu>
export CLOUDFLARE_API_TOKEN=<token>
```

**Token nikdy nepatří do repozitáře** — ani do `wrangler.toml`, ani do
`wrangler.jsonc`. Jen do proměnné prostředí nebo do správce tajemství.

Token potřebuje tato oprávnění:

| Oprávnění | Na co |
|---|---|
| Account · Workers Scripts · Edit | nasazení webu i reklamní služby |
| Account · Workers KV Storage · Edit | mezipaměť Next.js |
| Account · Workers R2 Storage · Edit | úložiště log inzerentů |
| Account · D1 · Edit | databáze objednávek |
| Account · Account Settings · Read | ověření účtu |
| Zone · Workers Routes · Edit | vlastní doména (až ji nasměrujete) |

Chybí-li kterékoli z nich, `wrangler` skončí chybou 10000 nebo 9109 —
v tu chvíli doplňte oprávnění a spusťte příkaz znovu.

---

## 1. Web

Postavený na Next.js, do edge runtime ho převádí adaptér nakonfigurovaný
v `open-next.config.ts`; nastavení nasazení je ve `wrangler.jsonc`.

```bash
npm install
npx opennextjs-cloudflare build     # build + převod
npx wrangler deploy                 # nasazení
```

Než pustíte `deploy`, ve `wrangler.jsonc` vyplňte:

- `NEXT_PUBLIC_URL` — ostrá adresa webu,
- `NEXT_PUBLIC_ADS_API` — adresa reklamní služby (viz krok 2); dokud ji
  neznáte, nechte prázdnou a reklamy se prostě nevykreslí,
- `NEXT_PUBLIC_PROVOZOVATEL`, `NEXT_PUBLIC_ICO`, `NEXT_PUBLIC_KONTAKT`,
  `NEXT_PUBLIC_KONTAKT_REKLAMA` — údaje do podmínek a ochrany údajů.

Tajemství pro AuroraDog (Supabase, NASA, Telegram, WhatsApp, `CRON_SECRET`)
nastavte jednotlivě:

```bash
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
```

Lokální ověření na stejném běhovém prostředí, jaké běží v produkci:

```bash
npx opennextjs-cloudflare build && npx wrangler dev --local
```

Ověřeno takto: `/`, `/deti`, `/zvirata`, `/zeme/cz`, `/podminky`, `/soukromi`,
`/reklama`, `/aurora` i `/sitemap.xml` vracejí 200 a mapa stránek obsahuje
všech 33 adres.

---

## 2. Reklamní služba

```bash
cd ads-worker
npm install

# databáze objednávek — vypíše ID, které patří do wrangler.toml
npx wrangler d1 create svetjmen-ads

# úložiště log
npx wrangler r2 bucket create svetjmen-ads-loga

# tabulky
npm run db:schema

# token pro správu (dlouhý náhodný řetězec, nikam ho nezapisujte)
npx wrangler secret put ADMIN_TOKEN

npm run deploy
```

Ve `wrangler.toml` před nasazením vyplňte:

- `database_id` z výstupu `d1 create`,
- `POVOLENE_ORIGINY` — odkud smí web volat API (víc domén oddělte čárkou;
  cizí origin nedostane povolení),
- `BANKOVNI_UCET`, `PROVOZOVATEL`, `PROVOZOVATEL_ICO`, `PROVOZOVATEL_EMAIL` —
  jdou do pokynů k platbě a do patičky samoobsluhy.

Denní úklid prošlých kampaní je nastavený jako cron `10 0 * * *` a spustí se
sám. Nic dalšího nastavovat netřeba.

Nakonec doplňte adresu služby do `NEXT_PUBLIC_ADS_API` ve `wrangler.jsonc`
a web nasaďte znovu.

### Ověření po nasazení

```bash
curl https://<adresa-sluzby>/api/sloty | head -c 200      # ceník a volná místa
curl https://<adresa-sluzby>/api/reklamy?plocha=deti-bocni
open  https://<adresa-sluzby>/                            # samoobsluha
```

---

## 3. Vlastní domény

- web → kořenová doména,
- reklamní služba → vlastní název, například `reklama.<doména>`.

Obě se nastavují v panelu účtu jako route k příslušné službě. Po nasměrování
domény reklamní služby nezapomeňte na `POVOLENE_ORIGINY` — bez ostré domény
v seznamu web kreativy nedostane.

---

## Rotace tokenu

API token použitý při prvním nasazení **zrušte a vytvořte nový**, jakmile
projde první nasazení — a hlavně dřív, než se web pustí do ostrého provozu.
Token, který někdy prošel chatem, e-mailem nebo tiketem, se považuje za
prozrazený.

---

## Starší nasazení

V repozitáři zůstávají `vercel.json` a `netlify.toml` z dřívějška. Pro
Cloudflare se nepoužívají; smažte je, až bude přechod hotový.
