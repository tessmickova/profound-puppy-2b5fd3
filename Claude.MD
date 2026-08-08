# Repozitář — Svět jmen + AuroraDog

V repozitáři jsou **dvě aplikace a jedna samostatná služba**:

| Co | Kde | K čemu |
|---|---|---|
| **Svět jmen** | kořen webu (`/`, `/deti`, `/zvirata`, `/rodina`, `/zeme/*`, …) | hlavní projekt — výběr jmen pro děti a zvířata |
| **AuroraDog** | `/aurora` (+ `/admin`, `/docs`, `/api/*`) | starší projekt, sledování polární záře; běží dál beze změn |
| **Reklamní služba** | adresář `ads-worker/`, vlastní nasazení | prodej a výdej nativních reklam pro Svět jmen |

Obě aplikace sdílejí jeden Next.js projekt (App Router, React 19, TypeScript,
Tailwind). Reklamní služba je **záměrně oddělená** — vlastní kód, vlastní
databáze, vlastní nasazení. Když spadne, web se jmény jede dál, jen se
nevykreslí reklamní plochy.

---

# Svět jmen

## Co web dělá

Pomáhá vybrat jméno pro dítě nebo pro zvíře. Bez registrace, zdarma, bez
sbírání údajů — všechno, co si uživatel uloží, zůstává v jeho prohlížeči.

Datová základna: **1243 jmen z 25 zemí** na šesti kontinentech (Kluci 199,
Holčičky 197, Psi 173, Fenky 155, Kocouři 117, Kočky 128, Koně 83, Králíci 66,
Papoušci 63, Křečci 62) a **54 plemen** s ručně vybranými jmény.

## Stránky (`app/`)

| Cesta | Soubor | Obsah |
|---|---|---|
| `/` | `app/page.tsx` | rodinný vyhledávač uprostřed, jezdící pásy jmen, nejoblíbenější jména, rozcestník |
| `/deti` | `app/deti/page.tsx` | filtr + režim „nejlepší shoda"; pásy lidských jmen |
| `/zvirata` | `app/zvirata/page.tsx` | filtr podle druhu, plemene a způsobu života; pásy zvířecích jmen |
| `/zeme/[kod]` | `app/zeme/[kod]/page.tsx` | jména jedné země (25 statických stránek) |
| `/rodina` | `app/rodina/page.tsx` | rodinný profil — naklikaná rodina včetně zvířat a doporučení k ní |
| `/oblibene` | `app/oblibene/page.tsx` | uložená jména (srdíčka) |
| `/reklama` | `app/reklama/page.tsx` | nabídka reklamních ploch, odkaz do samoobsluhy |
| `/podminky` | `app/podminky/page.tsx` | podmínky používání včetně pravidel inzerce |
| `/soukromi` | `app/soukromi/page.tsx` | ochrana osobních údajů |

Mapa světa na úvodu **už není** — země jsou jen ve filtru a v patičce.
Úvodní strana patří obsahu, reklamy jsou po stranách.

## Komponenty (`components/names/`)

- **Shell.tsx** — hlavička s navigací, spodní lišta na mobilu (5 položek
  s počítadly), patička a `DetailPanel`.
- **Rozvrzeni.tsx** — obsah drží střed, reklamní plochy jsou v lepivých
  postranních sloupcích (od 1180 px). Na mobilu jsou plochy až pod obsahem.
  Varianta `uzsi` pro stránky, které už mají vlastní sloupec s filtrem.
- **NameCard.tsx** — záměrně střídmá karta: jméno, původ, štítek, srdíčko.
  Celá karta je tlačítko, které otevře detail.
- **DetailPanel.tsx** — panel vyjíždějící zprava (na mobilu zespoda) s významem,
  rychlou heslovitou analýzou, numerologií a líbivostí. Zavírá se křížkem,
  Escapem i klikem mimo.
- **RodinnyVyhledavac.tsx** — vyhledávač uprostřed úvodní strany: příjmení,
  maminka, tatínek, sourozenec. Není schovaný ve filtru.
- **FiltrUI.tsx** — kompaktní filtr: segmentované přepínače, čipy, mřížka písmen.
- **DetiFinder.tsx / ZvirataFinder.tsx** — napojení filtru na data a výsledky.
- **PasyJmen.tsx** — dvě řady jezdících mini-boxů (horní vpravo, spodní vlevo),
  jen jména a nic víc. `druh="lide"` nebo `"zvirata"` mění barevný tón.
- **NadpisSekce.tsx** — nadpis s ikonou v barevném čtverečku; lidé chladná modrá
  s kojencem, zvířata teplá okrová s tlapkou.
- **Vyber.tsx** — vlastní rozbalovací nabídka místo systémového `<select>`.
  Ovládá se klávesnicí (šipky, Enter, Esc, psaní), má `role="listbox"`
  a vypadá jako zbytek webu. Systémový select už není nikde. Před otevřením si
  změří místo nad spouští a pod ní a při nedostatku dole se rozbalí nahoru —
  na telefonu jinak poslední položky mizely pod spodní lištou.
- **ShodaKarta.tsx** — karta nalezené shody s pevným pořadím řádků.
- **VolbaPodrobnosti.tsx** — přepínače toho, co se u jmen ukazuje.
- **RychleOdpovedi.tsx** — krátké odpovědi na časté otázky; text je vidět
  na stránce a zároveň jde stránkou jako strukturovaná data.
- **ReklamniRam.tsx** — celá reklama na webu. Na širokém okně dva sloupce
  přišpendlené k oknu po pěti pozicích, jinak lišta 52 px úplně nahoře.
  Pozice se po 15 s překlápí na druhou stranu, lišta se střídá po 10 s.
- **VyberPlochy.tsx** — náhled ploch na `/reklama`: zmenšený web, ve kterém si
  zákazník klepnutím vybere konkrétní místo a délku 1–3 měsíce.
- **RodinaProfil.tsx**, **OblibeneSeznam.tsx**, **Paticka.tsx**.

## Knihovna (`lib/names/`)

| Soubor | Obsah |
|---|---|
| `types.ts` | `Jmeno`, `Kategorie`, `Plemeno`, `PohlaviZvirete`, popisné mapy |
| `data.ts` | všechna jména, země, kontinenty; helper `pridej()` dopočítá slabiky a délku |
| `breeds.ts` | 54 plemen (36 psích, 18 kočičích), u každého `doporucena` — ručně vybraná jména (husky: Balto, Togo, Yukon…) |
| `extra.ts` | domácké tvary, svátky, unisex, pohlaví zvířecích jmen |
| `logic.ts` | mozek webu — filtr, řazení, souzvuk s příjmením, rodinná harmonie, numerologie, rychlá analýza, volatelnost, kolize s povely |
| `vCesku.ts` | jména do jezdících pásů — 247 lidských, 157 zvířecích (ručně vybraný seznam, ne strojová data) |
| `oblibene.ts`, `rodina.ts`, `detail.ts` | stav v prohlížeči přes `useSyncExternalStore` |
| `seo.ts` | JSON-LD (WebSite, FAQPage, ItemList, BreadcrumbList), časté dotazy |
| `pravni.ts` | údaje provozovatele sdílené právními stránkami |
| `podrobnosti.ts` | co se má u nalezených jmen ukazovat — volba se pamatuje v prohlížeči |
| `reklamy.ts` | typ `Inzerat` + ukázkové kreativy pro vývoj |
| `reklamniServer.ts` | jediné místo, kde web ví o reklamní službě |

### Jak se počítá „nejlepší shoda"

`najdiNejlepsiShody()` váží složky: souzvuk s příjmením (přechod hlásek, rytmus
slabik, rým), soulad se jmény rodičů a sourozence, měsíc narození, styl, energie
a oblíbenost. Vrací skóre 0–100 a české vysvětlení, proč zrovna tohle jméno.

`rodinnaHarmonie()` navíc vrací štítek — „ladí s oběma rodiči" nebo
„ladí s celou rodinou" —, když jméno sedí k víc členům najednou.

## SEO a AI SEO

- JSON-LD na všech typech stránek, `app/sitemap.ts`, `app/robots.ts`
  (povolené GPTBot, ClaudeBot, PerplexityBot), `public/llms.txt`.
- Mobile first: obsah je v DOM první, reklamy až za ním.
- Animace všude respektují `prefers-reduced-motion`.

---

# Reklamy

## Jak to funguje na webu

Reklama má vlastní rám kolem obsahu, do stránek nezasahuje. Na širokém okně
(od 1240 px) jsou to **dva sloupce přišpendlené k oknu** po pěti pozicích:
roluje jen obsah, reklama zůstává. Na užších oknech, tabletech a telefonech
se sloupce schovají a nastoupí **lišta 52 px úplně nahoře** — od 700 px se
dvěma kampaněmi vedle sebe, pod 700 px s jednou.

Každá pozice má **dvě strany** a po **15 sekundách** se překlopí na tu druhou.
Pozic je deset, prodaných ploch tedy **dvacet**, každá za **5 000 Kč/měsíc**
a na **1–3 měsíce**. V liště se kampaně střídají po **10 sekundách**.

Rotace se zastaví při najetí myší, doteku i zaměření klávesnicí a dá se vypnout
tlačítkem pauzy; při `prefers-reduced-motion` se nic neotáčí. Označení
„reklama" je vidět vždycky, odkazy mají `rel="sponsored nofollow noopener"`.
Volná plocha se ukáže jako nabídka „Tady může být vaše značka" s odkazem
na `/reklama`.

Seznam ploch a ceník je v `ads-worker/src/plochy.ts`, vykreslení v
`components/names/ReklamniRam.tsx`, prodejní náhled v `VyberPlochy.tsx`.

## Jak web přijde ke kreativám

`lib/names/reklamniServer.ts` zavolá reklamní službu s limitem 2,5 s a odpověď
si podrží na jedno načtení stránky. Když služba neodpoví nebo nemá co poslat,
komponenta vrátí `null` a plocha se prostě nevykreslí. **Obsah tím není nijak
dotčený** — ověřeno s vypnutou službou: stránka se vykreslila za 1,1 s, filtr
i detail fungovaly, konzole čistá.

Bez proměnné `NEXT_PUBLIC_ADS_API` (typicky ve vývoji) běží ukázkové kreativy
z `lib/names/reklamy.ts`.

## Reklamní služba (`ads-worker/`)

Vlastní aplikace s vlastní databází — podrobnosti v **`docs/REKLAMY.md`**.
Ve zkratce: firma si v samoobsluze proklikne volnou plochu, délku
(měsíc / 6 měsíců / rok), naklikáme inzerát s náhledem a odešle objednávku.
Po připsání platby kampaň zapneme; **na konci období se sama vypne** a slot se
nabídne jako volný. Nic se neobnovuje automaticky.

---

# AuroraDog (`/aurora`)

Starší projekt v tomtéž repozitáři, funguje beze změn. Sledování polární záře
v ČR (50° s. š.) z dat NOAA SWPC, NASA DONKI a Open-Meteo s vlastním
skórovacím systémem.

- **Stránky:** `/aurora` (dashboard), `/admin` (diagnostika), `/docs` (glosář)
- **API:** `/api/aurora-data`, `/api/cron/check-kp`, `/api/webhooks/telegram`,
  `/api/sightings`, `/api/solar-imagery`, `/api/enlil-sequence`, `/api/aurora-news`
- **Komponenty:** `components/` mimo `components/names/`
- **Knihovny:** `lib/noaa.ts`, `lib/astronomy.ts`, `lib/supabase.ts`,
  `lib/alerts.ts`, `lib/space-weather/*`
- **Data:** Supabase (cache 60 s + odběratelé), alerty na Telegram a WhatsApp
- **Prahy viditelnosti:** foto KP ≥ 4, horizont ≥ 5, oblouk ≥ 6, nad hlavou ≥ 7,
  tanec ≥ 8 (podrobně v `docs/VISIBILITY_THRESHOLDS.md`)

---

# Vývoj

```bash
npm install
npm run dev            # web na http://localhost:3000
npx tsc --noEmit       # kontrola typů (ads-worker je vyloučený, má vlastní)
npx next build         # produkční build
```

Reklamní služba se vyvíjí zvlášť:

```bash
cd ads-worker && npm install
npm run db:schema:local   # založí lokální databázi
npm run dev               # služba na http://localhost:8799
```

Aby web ve vývoji bral reklamy ze služby:
`NEXT_PUBLIC_ADS_API=http://localhost:8799 npm run dev`

Nasazení, proměnné prostředí a postup krok za krokem: **`docs/NASAZENI.md`**.
Kontrola před spuštěním (zařízení, GDPR, AI, co ještě vyplnit):
**`docs/PRED-SPUSTENIM.md`**. Doporučené domény: **`docs/DOMENY.md`**.

## Konvence

- Kód, komentáře i identifikátory jsou **česky**. Komentář vysvětluje *proč*,
  ne *co*.
- Nové jméno se přidává do `lib/names/data.ts` přes `pridej()`, ne ručně —
  slabiky a délka se dopočítají samy.
- Nová stránka: přidat do `app/sitemap.ts` a do patičky.
- Nová reklamní plocha: doplnit do `ads-worker/src/plochy.ts` **a** předat
  její jméno komponentě `Rozvrzeni` na příslušné stránce.
