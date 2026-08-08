# Reklamní služba

Samostatná aplikace v adresáři `ads-worker/`. Prodává reklamní plochy na Světě
jmen a vydává kreativy webu.

## Proč zvlášť

Reklamy jsou to nejrizikovější, co na webu je — platby, cizí obsah, cizí
odkazy. Proto mají vlastní kód, vlastní databázi a vlastní nasazení. **Když
reklamní služba spadne, web se jmény jede dál** a jen se nevykreslí reklamní
plochy. Web se služby ptá s limitem 2,5 s a při jakékoli chybě plochu vynechá.

Ověřeno: s vypnutou reklamní službou se úvodní strana vykreslila za 1,1 s,
zobrazilo se 24 karet se jmény, pásy jezdily, detail se otevřel, konzole čistá.

## Co služba umí

| Route | Metoda | K čemu |
|---|---|---|
| `/` | GET | samoobsluha pro firmy (jedna HTML stránka bez závislostí) |
| `/api/sloty` | GET | seznam ploch, volná místa a ceník |
| `/api/reklamy?plocha=…` | GET | kreativy pro plochu — tohle volá web |
| `/api/objednavka` | POST | vytvoření objednávky a inzerátu |
| `/api/objednavka/:token` | GET | stav objednávky |
| `/api/objednavka/:token/logo` | POST | nahrání loga (PNG/JPG/WEBP, max 200 kB) |
| `/logo/:klic` | GET | výdej loga |
| `/api/admin/potvrdit` | POST | potvrzení platby → kampaň se rozsvítí |
| `/api/admin/prehled` | GET | posledních 200 objednávek |
| `/api/admin/uklid` | POST | ruční spuštění úklidu |

Admin routy chtějí hlavičku `Authorization: Bearer <ADMIN_TOKEN>`; token se
porovnává v konstantním čase.

## Nákupní tok

1. **Výběr plochy.** Zákazník začíná na `/reklama`, kde je zmenšený náhled webu
   se všemi dvaceti plochami — klepnutím si vybere přesně to místo, které
   kupuje, a přepínačem „strana A / B" si prohlédne obě strany pozice.
   Odtud odejde do samoobsluhy s předvyplněnou plochou i délkou.
2. **Délka.** Jeden, dva nebo tři měsíce. Delší období zatím neprodáváme —
   dokud není jasná návštěvnost, dalo by se jen prodělat.
3. **Inzerát.** Značka, nadpis (48 znaků), text (150 znaků), tlačítko a odkaz.
   Formát je daný, náhled se překresluje při psaní. Místo ikony může firma po
   zaplacení nahrát logo.
4. **Fakturační údaje.** Firma, nepovinné IČO, e-mail. Nic dalšího neevidujeme,
   účet nevzniká.
5. **Odeslání.** Vrátí se variabilní symbol, částka a **token** — adresa
   `/api/objednavka/<token>` je zároveň přístup ke stavu kampaně a k nahrání
   loga. Objednávka je ve stavu `ceka_na_platbu` a drží slot.
6. **Platba.** Po připsání zavoláme `/api/admin/potvrdit` s variabilním
   symbolem; kampaň přejde do `aktivni`, doplní se `plati_od` a `plati_do`.
7. **Konec.** Denní úklid (cron `10 0 * * *`) přepne prošlé kampaně na
   `vyprsela` a slot se hned objeví jako volný. Nezaplacené objednávky starší
   sedmi dnů se ruší, aby neblokovaly místo.

## Ceník

Všech dvacet ploch stojí stejně: **5 000 Kč za měsíc bez DPH**. Reklama běží
na všech stránkách webu, takže rozlišovat plochy podle stránky nemá smysl —
liší se jen tím, jak vysoko ve sloupci jsou.

Násobky za období: měsíc ×1, dva měsíce ×2, tři měsíce ×3. Žádné množstevní
slevy zatím nedáváme. Cena i délky jsou v `src/plochy.ts` — mění se tam
a nikde jinde.

## Databáze

Tři tabulky (`schema.sql`), nic navíc:

- **`inzerenti`** — firma, IČO, e-mail. Jen to, bez čeho nejde vystavit faktura.
- **`objednavky`** — plocha, období, cena, variabilní symbol, stav
  (`ceka_na_platbu` / `aktivni` / `vyprsela` / `zrusena`), token, platnost od–do.
- **`inzeraty`** — značka, nadpis, text, tlačítko, odkaz a buď klíč loga
  v úložišti, nebo ikona. **Logo je to hlavní** — nahrává se rovnou při
  objednávce a na kartě je vidět místo ikony; ikona slouží jen jako náhrada,
  dokud firma logo nedodá.

Loga leží v objektovém úložišti, ne v databázi.

## Pozice, plochy a kapacita

Web má **deset pozic**: pět v levém sloupci, pět v pravém. Každá pozice má dvě
strany a po **patnácti sekundách** se překlopí na tu druhou, kde je jiná
kampaň. Prodaných ploch je proto **dvacet** a na každé běží právě jedna
kampaň (`KAPACITA = 1`).

Číslování je to, co vidí zákazník: pozice 1 drží plochy 1 a 2, pozice 2 plochy
3 a 4 a tak dál. Liché číslo je strana A, sudé strana B.

Volné místo se počítá z aktivních objednávek i z těch, které čekají na platbu —
jinak by se plocha prodala dvakrát.

## Kde reklama na webu je

- **Široké okno (od 1240 px):** dva sloupce přišpendlené k oknu, pět pozic
  v každém. Roluje jen obsah, reklama zůstává. Šířka sloupce se počítá
  z okna (`clamp(158px, 13.5vw, 214px)`), takže se s displejem plynule
  zmenšuje a nikdy nepřeteče.
- **Užší okna, tablety a telefony:** sloupce se schovají a nastoupí lišta
  **52 px** přišpendlená úplně nahoře. Od 700 px jsou v ní dvě kampaně vedle
  sebe, pod 700 px jedna, a po **deseti sekundách** naskočí další.

Všech deset pozic se překlápí **v jednu a tu samou chvíli**. Rozházené
překlápění by znamenalo, že se návštěvníkovi koutkem oka pořád něco hýbe —
takhle se obraz jednou za patnáct sekund změní a pak je zase klid.

Rotace se zastaví při najetí myší, doteku i zaměření z klávesnice. **Tlačítko
pauzy je jen v liště nahoře** — u sloupců by pátou kartu zbytečně přebíjelo.
Kdo má v systému vypnuté animace (`prefers-reduced-motion`), uvidí prosté
prostřídání bez otáčení. Označení „reklama" je na kartě i v liště vidět
vždycky.

Sloupce mají stejný papírový podklad jako zbytek webu: překrývají odsazení
stránky a bez vlastního pozadí by po stranách prosvítalo tmavé pozadí
dokumentu, které patří AuroraDogu (sdílí stejné `<body>`).

Volná plocha se nevykreslí jako díra — ukáže se jako nabídka **„Volné místo
pro vaši reklamu"** s číslem plochy a tlačítkem *Rezervovat*. Odkaz míří
rovnou na rezervaci té konkrétní plochy (`/reklama?plocha=plocha-N`), takže
zákazník nemusí hledat, na které místo zrovna klepl; náhled si ji předvolí
i se správnou stranou pozice.

## Účet inzerenta

Účet **záměrně nemá heslo**. Rezervací vzniká objednávka a s ní přístupový
klíč — ten je zároveň účtem. Nezakládáme tím firmě profil, nesbíráme o ní nic
navíc a nemusíme řešit obnovu hesla. Klíč se ukládá do prohlížeče
(`svetjmen-inzerent-klic`), takže se příště načte sám.

Na `/reklama/ucet` firma vidí stav kampaně, pokyny k platbě a může upravit
text, tlačítko, odkaz i logo — přesně jak slibují podmínky. Plocha ani délka
se měnit nedají, tím by se obcházel ceník. Úprava jde přes
`PATCH /api/objednavka/:token` a prochází **stejnou validací jako objednávka**;
`javascript:` odkaz ani prázdný nadpis neprojdou.

## Bezpečnost

- **CORS** propouští jen originy z `POVOLENE_ORIGINY`; cizí origin nedostane
  hlavičku `Access-Control-Allow-Origin`.
- **Odkazy** projdou jen `http` a `https`; `javascript:` je odmítnutý.
- **Loga** přijímáme jen jako PNG, JPG a WEBP (ne SVG) a vydáváme
  s `X-Content-Type-Options: nosniff` a přísnou `Content-Security-Policy`.
- **Vstupy** mají pevné délkové limity a validaci na straně služby, ne jen
  ve formuláři.
- **Chyby** ven jdou bez podrobností, detail zůstane v logu.

## Provoz

Denní cron dělá úklid sám. Ručně se dá spustit:

```bash
curl -X POST https://<adresa-sluzby>/api/admin/uklid \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

Přehled objednávek:

```bash
curl https://<adresa-sluzby>/api/admin/prehled \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

Potvrzení platby (volitelně s datem začátku, jinak dnešek):

```bash
curl -X POST https://<adresa-sluzby>/api/admin/potvrdit \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"vs":"123456789"}'
```

## Co ještě chybí

- **Automatické párování plateb.** Dnes se platba potvrzuje ručně jedním
  příkazem. Napojení na bankovní výpis je další krok.
- **E-maily.** Pokyny k platbě si zatím inzerent opíše z potvrzovací obrazovky;
  odesílání e-mailů služba nedělá.
- **Úprava inzerátu inzerentem.** Podmínky ji slibují — dnes ji děláme na
  vyžádání zásahem do databáze.
