# Kontrola před zveřejněním

Co bylo ověřeno, co z toho vyšlo a co je ještě potřeba doplnit ručně.
Datum kontroly: srpen 2026.

---

## 1. Zařízení a rozlišení

Projeto devět stránek (`/`, `/deti`, `/zvirata`, `/rodina`, `/oblibene`,
`/zeme/cz`, `/reklama`, `/podminky`, `/soukromi`) na osmi šířkách:
320, 390, 412, 768, 1024, 1280, 1440 a 1920 px, telefony a tablety
s dotykem a dvojnásobnou hustotou pixelů.

| Co | Výsledek |
|---|---|
| Chyby JavaScriptu | žádné na žádné stránce ani šířce |
| Chyby v konzoli | žádné |
| Vodorovné posouvání stránky | nikde — `window.scrollX` zůstává na nule |
| Dotykové cíle pod 24 × 24 px | jen odkazy uvnitř vět (WCAG 2.5.8 je vyjímá) |

**Opraveno při kontrole:**

- srdíčka u jmen měla dotykovou plochu ~18 px — mají 30 × 30 px, vzhled
  se nezměnil (plocha přesahuje mimo ikonu záporným okrajem),
- odkazy v patičce, rozbalovací nadpisy filtru a drobečková navigace
  dostaly minimální výšku 26 px,
- textová tlačítka „Vymazat" a „Výchozí" mají výšku prstu,
- posuvníky délky jména mají 24 px,
- počítadlo na spodní liště bylo umístěné 8 px za pravým okrajem lišty;
  teď sedí uvnitř dlaždice.

**Známá kosmetika:** v emulovaném prohlížeči je spodní lišta o 8 px širší
než obsah stránky, protože `position: fixed` se měří k okraji okna včetně
pruhu posuvníku. Na skutečném telefonu je posuvník překryvný a lišta se
nad 640 px vůbec nezobrazuje, takže se to nikde neprojeví — ověřeno tím,
že stránkou nejde vodorovně posunout.

---

## 2. Soukromí a GDPR

Změřeno v prohlížeči na všech stránkách:

| Co jsme hledali | Nalezeno |
|---|---|
| Požadavky na cizí domény | **žádné** — písma i skripty jsou z vlastního serveru |
| Cookies | **žádné** |
| `sessionStorage` | prázdný |
| `localStorage` | tři záznamy, všechny zakládá sám uživatel svou akcí |

Záznamy v prohlížeči: `svet-jmen-oblibene` (uložená jména),
`svet-jmen-rodina` (členové rodiny), `svetjmen-podrobnosti` (co se má
u jmen ukazovat). Všechny tři jsou v Ochraně osobních údajů vyjmenované.

**Lišta se souhlasem není potřeba.** Ukládání do zařízení podléhá souhlasu
jen tehdy, není-li nezbytné pro službu, kterou si uživatel výslovně vyžádal.
Tady si uživatel uložení sám vyvolá — klikne na srdíčko, přidá člena rodiny,
přepne zobrazení. Nic se neukládá dopředu a nic se nesleduje.

**Doplněno do Ochrany osobních údajů:**

- výčet konkrétních záznamů v prohlížeči,
- odstavec o jménech blízkých osob (maminka, tatínek, sourozenec jsou údaje
  o jiných lidech — zůstávají v prohlížeči a mají se zadávat s jejich vědomím),
- oddíl **Děti** — od návštěvníků se nesbírá nic, takže ani u dítěte nic nevzniká.

---

## 3. Umělá inteligence a transparentnost

Web není chatbot ani generátor obsahu na přání; pořadí jmen počítá pevný
vzorec z toho, co člověk zadá do vyhledávače. Přesto jsme doplnili, co se
tady vlastně děje:

- **Doporučení počítá stroj, ne člověk** — nový oddíl v Ochraně osobních
  údajů. Je v něm napsané, že nejde o profilování osoby, že z toho nevzniká
  rozhodnutí s právním účinkem a že u každého výsledku je vysvětlení, proč se
  umístil.
- **Popisky jmen vznikly s pomocí AI** a prošly redakcí — uvedeno
  v podmínkách i v ochraně údajů.
- **Výklad čísla jména je hra**, ne věštba ani rada — bylo už dřív
  v podmínkách a v detailu jména, teď i v ochraně údajů.

Web nedělá nic z toho, co evropská pravidla pro AI zakazují nebo řadí mezi
vysoce rizikové: nerozpoznává obličeje ani emoce, nehodnotí lidi, netěží
z zranitelnosti dětí a nevydává se za člověka.

---

## 4. Reklama

- Každý inzerát je označený slovem **sponzorováno** (v úzkém sloupci
  „reklama"), označení je vidět vždy.
- Odkazy inzerentů mají `rel="sponsored nofollow noopener"`.
- Reklama se **necílí podle člověka** — inzerát patří ke stránce, ne
  k návštěvníkovi. Proto nevzniká žádný profil ani potřeba souhlasu.
- Pravidla, co odmítneme (klamavé nabídky, míření na děti jako zákazníky,
  alkohol, tabák, hazard, léčitelství), jsou v podmínkách.

---

## 5. Co ještě musí doplnit člověk

Bez těchto údajů se web nesmí spustit — právní texty by neidentifikovaly
provozovatele:

| Kde | Co vyplnit |
|---|---|
| `wrangler.jsonc` → `NEXT_PUBLIC_PROVOZOVATEL` | obchodní firma provozovatele |
| `wrangler.jsonc` → `NEXT_PUBLIC_ICO` | IČO |
| `wrangler.jsonc` → `NEXT_PUBLIC_KONTAKT` | kontaktní e-mail |
| `wrangler.jsonc` → `NEXT_PUBLIC_KONTAKT_REKLAMA` | e-mail pro inzerenty |
| `wrangler.jsonc` → `NEXT_PUBLIC_URL` | ostrá adresa webu |
| `ads-worker/wrangler.toml` → `BANKOVNI_UCET` a spol. | bankovní spojení a údaje do faktur |
| `lib/names/pravni.ts` → `platnostOd` | datum, od kterého podmínky platí |

Dál doporučujeme před spuštěním:

- **zrotovat Cloudflare API token** použitý při prvním nasazení,
- projít ceník reklamních ploch (`ads-worker/src/plochy.ts`) — čísla jsou
  odhad, ne měření,
- rozhodnout, zda web bude plátcem DPH; podmínky uvádějí ceny bez DPH.
