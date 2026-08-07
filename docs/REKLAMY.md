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

1. **Výběr plochy.** Samoobsluha ukáže všech 31 ploch, kolik je na které volno
   a cenu za měsíc. Obsazená plocha se nedá vybrat.
2. **Délka.** Měsíc, 6 měsíců (jeden měsíc zdarma) nebo rok (tři měsíce zdarma).
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

Cena vychází z toho, kolik lidí plochu uvidí. Za měsíc bez DPH: pruh nahoře na
telefonu 3 200 Kč, úvodní strana 1 400–2 400 Kč, stránky dětí a zvířat
1 200–2 000 Kč, rodinný profil 1 100–1 500 Kč, uložená jména 900–1 300 Kč,
stránky zemí 800–1 200 Kč.

Násobky za období: měsíc ×1, půl roku ×5, rok ×9. Ceník je jedna tabulka
v `src/plochy.ts` — mění se tam a nikde jinde.

## Databáze

Tři tabulky (`schema.sql`), nic navíc:

- **`inzerenti`** — firma, IČO, e-mail. Jen to, bez čeho nejde vystavit faktura.
- **`objednavky`** — plocha, období, cena, variabilní symbol, stav
  (`ceka_na_platbu` / `aktivni` / `vyprsela` / `zrusena`), token, platnost od–do.
- **`inzeraty`** — značka, nadpis, text, tlačítko, odkaz a buď ikona, nebo klíč
  loga v úložišti.

Loga leží v objektovém úložišti, ne v databázi.

## Kapacita a sloty

Na jedné ploše se střídají nejvýš **čtyři** kampaně (`KAPACITA` v `plochy.ts`),
každá je vidět 30 sekund. Plocha si může říct o vlastní počet — pátý parametr
u `p(...)`; čte se přes `kapacitaPlochy()`. Volné místo se počítá z aktivních
objednávek i z těch, které čekají na platbu — jinak by se plocha prodala
dvakrát.

## Pruh nahoře na telefonu (`mobil-pas`)

Jediná plocha, která běží na **všech** stránkách, a jediná, která se
nepřeklápí: je připnutá úplně nahoře nad hlavičkou a jede v ní pomalý pás
(150 s na smyčku, zhruba čtyřikrát pomaleji než pásy jmen). Vidět je z inzerátu
jen **název firmy a text tlačítka** — celý blok je odkaz, takže pruh funguje
jako CTA. Vejde se do něj **deset** kampaní najednou, proto stojí víc než
ostatní plochy. Na displeji od 640 px se pruh vůbec nevykresluje, tam má
reklama postranní sloupce.

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
