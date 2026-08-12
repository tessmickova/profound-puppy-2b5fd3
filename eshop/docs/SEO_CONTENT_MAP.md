# SEO_CONTENT_MAP.md — SEO / GEO / AEO architektura

**Stav:** NÁHLED ke schválení. Pravidlo nade vše: publikuje se jen stránka se skutečnou unikátní hodnotou. Žádný programmatic spam, žádné doorway pages, žádná fake data ve structured data.

---

## 1. URL architektura

```
/                                  homepage
/k/{kategorie}                     kategorie (gumaky, sanky, nesmeky…)
/p/{slug}                          produkt (canonical; varianty = ProductGroup, ne samostatné indexované URL)
/e/{event-hub}                     evergreen hub:      /zatmeni-slunce
/e/{event-occurrence}              konkrétní událost:  /zatmeni-slunce-2027
/magazin/{rubrika}/{slug}          content hub
/b/{bundle-slug}                   bundle landing (rodinny-balicek-bryle…)
/napoveda/{slug}                   FAQ, size guides, návody
právní: /obchodni-podminky /ochrana-osobnich-udaju /cookies /doprava-a-platba
        /vraceni-zbozi /reklamace /kontakty
```

- Clean URLs, bez diakritiky, kebab-case. Canonical všude; parametry (řazení, filtry) neindexovat.
- Event lifecycle: occurrence po skončení NEODSTRANIT — přepnout na informační retrospektivu + odkaz na hub a další occurrence; hub je evergreen a drží link equity.
- Breadcrumbs vizuálně i v BreadcrumbList.
- hreflang připraven (cs-CZ теď; sk/de/pl/en později), sitemap.xml generovaná (produkty, eventy, magazín, právní), robots.txt (disallow /admin, /api, /checkout, /kosik).

## 2. Structured data (podle aktuální dokumentace Google/schema.org, validace v PHASE 8)

| Typ | Kde | Poznámka |
|---|---|---|
| Organization + WebSite | globálně | logo, kontakt, sameAs (social) |
| BreadcrumbList | všechny stránky mimo homepage | |
| Product + Offer | product detail | price, priceCurrency CZK, availability z reálného skladu, itemCondition |
| ProductGroup + varianty | produkty s variantami (gumáky velikosti, sáňky) | hasVariant, variesBy (size/color) |
| OfferShippingDetails | product/offer | Packeta cena + doba; jen reálné hodnoty |
| MerchantReturnPolicy | jen pokud odpovídá skutečné politice | 14 dní odstoupení |
| FAQPage | jen event huby/nápověda, dle aktuálních pravidel Google | žádný FAQ markup na každé stránce |
| Article | magazín | author = redakce, datePublished/Modified |

**Nikdy:** fake reviews/ratings (review markup až s reálnými verified-purchase recenzemi), fake availability/price. Merchant Center feed (PHASE 8) čerpá ze stejných dat → nikdy nesoulad web × feed.

## 3. GEO / AEO (AI answer engines)

Každá produktová/eventová stránka explicitně odpovídá (strukturovaně — nadpisy, definiční odstavce, tabulky, `attributes_json` → viditelné parametry):
Co to je · K čemu · Pro koho · Kdy je to potřeba · Jak použít · Jak vybrat velikost · Je skladem · Kolik stojí · Kdy dorazí · Bezpečnostní vlastnosti · Čím se liší varianty.

Praktika: první odstavec stránky = přímá factual odpověď (žádný marketing úvod), parametry v sémantické tabulce, FAQ s přesnými otázkami tak, jak je lidé pokládají. Žádný keyword stuffing.

## 4. Keyword engine (interní model)

Kombinatorika `product × use_case × audience × event × problem × location × size × question` generuje **kandidáty**, ne stránky. Publikační filtr (ruční): má stránka unikátní obsah, který jinde na webu není? Odpovídá reálnému produktu? Má vyhledávací poptávku? 2× ne → nepublikovat, řešit sekcí na existující stránce.

Příklady mapování: `protikroupová plachta + SUV` → varianta/parametrická sekce na produktu, samostatná stránka jen s unikátním obsahem (rozměrová tabulka SUV, montáž). `gumáky + velikost 24` → NE samostatná stránka; ProductGroup + size guide.

## 5. Content clustery (struktura, obsah se plní až proti reálným SKU)

### A. Zatmění Slunce — vlajkový cluster
```
/zatmeni-slunce                      evergreen hub (co, kdy, jak bezpečně)
/zatmeni-slunce-2027                 occurrence (countdown, viditelnost ČR, cutoff)
/p/bryle-na-zatmeni-slunce           produkt + ProductGroup bundlů
/b/rodinny-balicek | /b/pro-skoly    bundle landings (4×/6×/10×/30×/100×)
/napoveda/jak-bezpecne-pozorovat-zatmeni
/magazin/…/jak-fotit-zatmeni-mobilem  (filtr na mobil/fotoaparát/dalekohled = produkty)
/zatmeni-pro-skoly                   B2B landing → poptávkový formulář
```
Primární: brýle na zatmění slunce (2027), certifikované brýle, ISO 12312-2, kde koupit… Long-tail: pro děti/rodinu/školu/třídu, 30/100 ks, lze přes sluneční brýle (odpověď: NE — safety obsah má přednost před SEO).

### B. Kroupy
`/e/kroupy` hub + produkt s variantami S/M/L/SUV. Keywords: protikroupová plachta (na auto), ochrana auta před kroupami, kryt SUV/kombi/malé auto, jak ochránit auto před kroupami / při supercele. Landing per typ auta JEN pokud existuje odpovídající produkt a unikátní obsah.

### C. Povodně
`/e/povodne` hub + bundle landings per problém: `/b/ochrana-dveri`, `/b/ochrana-garaze`, `/b/ochrana-sklepa`. Keywords: protipovodňové pytle (bez písku, samonafukovací, absorpční), bariéra do dveří, ochrana garáže/sklepa, mobilní protipovodňová bariéra. **Krizový režim obsahu:** při reálné povodni hub zobrazuje praktické info bez prodejního tónu.

### D. Komáři/hmyz
Keywords: moskytiérová bunda, síťka na hlavu proti komárům, ochrana do lesa, síť proti pakomárům/drobnému hmyzu, invaze komárů.

### E. Ledovka
Keywords: nesmeky (na boty/na led/pro seniory/pro děti/na turistiku/na město), protiskluzové návleky, jak neuklouznout na ledu. Size guide povinný.

### F. Dřevěné sáňky
Keywords: dřevěné sáňky (pro děti, s opěrkou, pro dvouleté/tříleté dítě, pro dvě děti, tradiční, české, s tažným popruhem). Obsah: **skutečný selection guide** — věk × délka × opěrka × počet dětí.

### G. Gumáky
Keywords: dětské gumáky/holínky, do školky/na zahradu/do lesa, jak vybrat velikost, kolik rezervy. **NE 30 stránek per velikost** — ProductGroup + jeden size guide.

### H. Festival
festivalová/jednorázová pláštěnka, špunty do uší na koncert, ochrana sluchu, voděodolný obal na mobil, kapesní/ruční ventilátor, chladicí ručník.

### I. Astronomie
solární filtr (dalekohled/teleskop/fotoaparát/mobil), příslušenství na pozorování komety. Bezpečnost před SEO — vždy.

### J. Sníh/zima
rozmrazovač skel/zámků, sněhové řetězy, nouzová zimní sada do auta, termofólie.

## 6. Magazín (rubriky = BRAND_VOICE §16)

Kategorie: Astronomie · Extrémní počasí · Zima · Děti venku · Praktické návody. Články přirozeně linkují produkty (max 1 CTA blok/článek), u safety témat citované zdroje (ČHMÚ, výrobce, normy). Publikační tempo řízené eventy (před zatměním astronomická série atd.).

## 7. Performance rozpočet (SEO ranking faktor)

LCP < 2,0 s mobile (hero obrázek: AVIF/WebP, width/height, fetchpriority=high, NIKDY lazy), CLS < 0,1 (rezervované rozměry), JS < 50 kB na obsahových stránkách (ostrovy jen košík/varianty/widget), fonty: 1–2 rodiny, `font-display: swap`, self-hosted subset. Obrázky pod foldem lazy, responsive `srcset`.

## 8. Anti-spam zásady (potvrzení zadání)

Žádné doorway pages, žádné AI-generované texty bez lidské kontroly a reálného podkladu, žádné near-duplicate stránky, noindex na filtry/parametry/interní vyhledávání, konsolidace přes canonical. **Produktový obsah se píše až proti reálnému SKU a dokumentaci výrobce** — do té doby jen struktura a šablony.
