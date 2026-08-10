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

Datová základna: **1286 jmen z 25 zemí** na šesti kontinentech a **54 plemen**
s ručně vybranými jmény. Aktuální rozpad vypisuje `npm run kontrola:data`.

Českých dětských jmen je 101 — tolik jich má dobové zařazení (`vlna`). Sada
záměrně obsahuje i modernější jména (Mia, Ella, Laura, Tobiáš, Leo, Maxim),
protože bez nich vypadala nabídka „co se bude dávat" jako seznam pro
prababičky.

### Zápis jména (`zapis.ts`)

Část rodičů nehledá jiné jméno, ale **jiný zápis**: Teodor, nebo Theodor?
Sofie, nebo Sofia? `pridej()` v `data.ts` klíčuje jména bez diakritiky, takže
druhý zápis by jako samostatný záznam **tiše zapadl** — varianta je proto
vlastnost jména, ne další jméno.

Varianty se propisují na tři místa: do detailu jména („Píše se také"), do
rejstříku (kdo napíše „Theodor", najde Teodora) a do brány `maDostDat()` —
doložená varianta je konkrétní obsah, ne vata, takže jméno kvůli ní může mít
vlastní stránku. Do tabulky **nepatří překlady**: Jan a John jsou příbuzná
jména, ne dva zápisy jednoho.

## Stránky (`app/`)

| Cesta | Soubor | Obsah |
|---|---|---|
| `/` | `app/page.tsx` | hlavní prvek je rodinný nástroj (jméno ladící k rodině), pak rozcestník a objevování |
| `/vybrat-jmeno-pro-dite` | `app/vybrat-jmeno-pro-dite/page.tsx` | „nevím, kde začít" — hledač dvojic pro děti |
| `/vybrat-jmeno-pro-zvire` | `app/vybrat-jmeno-pro-zvire/page.tsx` | totéž pro osm druhů zvířat |
| `/porovnat-jmena` | `app/porovnat-jmena/page.tsx` | porovnání 2–5 finalistů vedle sebe |
| `/jmeno-k-prijmeni` | `app/jmeno-k-prijmeni/page.tsx` | test celého jména s příjmením |
| `/jak-vybrat-jmeno-kdyz-se-nemuzeme-shodnout` | tamtéž `/page.tsx` | postup pro dvojici, která se neshodne, + porovnání |
| `/deti` | `app/deti/page.tsx` | filtr + režim „nejlepší shoda"; pásy lidských jmen |
| `/zvirata` | `app/zvirata/page.tsx` | filtr podle druhu, plemene a způsobu života; pásy zvířecích jmen |
| `/zeme/[kod]` | `app/zeme/[kod]/page.tsx` | jména jedné země (25 statických stránek) |
| `/rodina` | `app/rodina/page.tsx` | rodinný profil — naklikaná rodina včetně zvířat a doporučení k ní |
| `/oblibene` | `app/oblibene/page.tsx` | uložená jména (srdíčka) |
| `/reklama` | `app/reklama/page.tsx` | nabídka reklamních ploch, odkaz do samoobsluhy |
| `/podminky` | `app/podminky/page.tsx` | podmínky používání včetně pravidel inzerce |
| `/soukromi` | `app/soukromi/page.tsx` | ochrana osobních údajů |

Mapa světa na úvodu **už není** — země jsou jen ve filtru a v patičce.
Na úvodu není ani vyhledávání v katalogu: kdo neví, kde začít, se seznamem
ani našeptávačem nepohne. První otázka je „koho pojmenováváte", druhá
„kde v rozhodování jste" a obojí vede rovnou do nástroje.

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
- **Hledani.tsx** — hledání konkrétního jména v hlavičce; funguje s diakritikou
  i bez ní, našeptává, ovládá se klávesnicí.
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
- **RodinaHero.tsx** — hlavní prvek úvodní stránky. Příjmení, maminka,
  tatínek, sourozenec => jména, která k rodině ladí, u každého s důvody.
  Tím se web liší od katalogů, takže to nesmí být schované v podstránce.
- **Ilustrace.tsx** — vlastní kreslené SVG (štěně, koťátko, miminko,
  rodina + drobné značky do nadpisů). Ne ikony z knihovny: na rozcestníku
  „miminko x zvíře" nesou čárové ikonky nulovou emoci. Průhledné pozadí,
  žádný externí požadavek (CSP by cizí obrázek stejně zablokovala), ostré
  na každém displeji a vlastní práce, takže žádné licence. Objem dělají
  vrstvené přechody a měkký stín, ne obrys.
- **Hledac.tsx** — „nevím, kde začít": nabízí kontrastní dvojice jmen a z voleb
  odvodí vkus. První návrhy ukáže **po třech kolech**, ne až na konci — nikdo
  nemusí dojít do konce kvízu. U každého návrhu je rozklikávací „proč mi ho
  doporučujete?" s jednotlivými pravidly.
- **PorovnaniJmen.tsx** — 2 až 5 finalistů ve strukturované tabulce plus věta
  „v čem se skutečně liší". Vítěze nevyhlašuje.
- **TestJmena.tsx** — praktický test celého jména: oslovení, skloňování,
  iniciály, hláskování, podoba bez diakritiky, zvuk v cizině. Stavy jsou
  `dobre / zvazte / neutral` — nikdy „špatně".
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
| `vyber.ts` | osobní výběr návštěvníka — uložená i vyřazená jména |
| `reklamy.ts` | typ `Inzerat` + ukázkové kreativy pro vývoj |
| `reklamniServer.ts` | jediné místo, kde web ví o reklamní službě |
| `rozhodovani.ts` | rozhodovací jádro — odhad vkusu z voleb, doporučení s důvody, porovnání finalistů, test jména |
| `cestina.ts` | oslovení (5. pád), genitiv, iniciály, hláskování, podoba bez diakritiky, zvuk v cizině |
| `vlny.ts` | dobové zařazení jmen — kde jméno stojí na české vlně (redakční, s rokem revize) |
| `zapis.ts` | český a světový zápis téhož jména (Teodor/Theodor) + štítek „zní světově" |
| `adresy.ts` | jediný seznam veřejných adres; sdílí ho mapa webu, IndexNow i kontrola SEO |

### Jak se počítá „nejlepší shoda"

`najdiNejlepsiShody()` váží složky: souzvuk s příjmením (přechod hlásek, rytmus
slabik, rým), soulad se jmény rodičů a sourozence, měsíc narození, styl, energie
a oblíbenost. Vrací skóre 0–100 a české vysvětlení, proč zrovna tohle jméno.

`rodinnaHarmonie()` navíc vrací štítek — „ladí s oběma rodiči" nebo
„ladí s celou rodinou" —, když jméno sedí k víc členům najednou.

### Dobové zařazení jmen (`vlny.ts`)

Štítek „originál" se dřív počítal jako `popularita <= 80`. `popularita` je
ale **redakční skóre líbivosti, ne četnost** — a tak vycházela *Denisa* jako
originální jméno. Denisa není vzácná ani trochu; jen se dávala generaci
dnešních maminek. Stejně dopadly Blanka, Ludmila, Zuzana, Richard.

Jsou to dvě nezávislé osy a do jednoho čísla se nevejdou:

    jak je jméno vzácné  ×  v které době se dávalo

Proto má jméno vlastní `vlna`: `vrchol`, `stoupa`, `retro`, `stalice`,
`dozniva`, `vzacne`. Z ní se počítají všechny štítky i rychlé filtry
(`jeVyhled`, `jeVrchol`, `jeStalice`, `jeVzacne`, `jeDoznivajici`).

Tři pravidla, která se nesmí porušit:

- **`undefined` znamená „nevíme", ne „průměrné".** Jméno bez vlny se
  neoznačuje. Vlnu mají zatím jen česká dětská jména — cizí záznamy popisují
  jméno v jeho zemi a o módě zvířecích jmen žádná data nejsou.
- **Je to redakční zařazení, ne statistika.** Data ČSÚ v repozitáři nejsou
  a nikde se netvrdí, že z nich vycházíme.
- **Vždy s rokem.** `ROK_REVIZE` se vypisuje uživateli; bez něj by za dvě
  sezóny nikdo nepoznal, že zařazení zestaralo.

Kontrola dat hlásí překlep v klíči jako kritickou chybu — jinak by se štítek
tiše nezobrazil. Testy v `testy/vlny.test.ts` hlídají mimo jiné přímo Denisu.

### Jak se počítá doporučení v hledači

`naucSe()` položí každé vybrané i odmítnuté jméno na pět os (modernost,
mezinárodnost, neobvyklost, délka, výraznost) a zprůměruje je; odmítnutí váží
1,4×, protože „tohle rozhodně ne" je jistější informace než „tohle je hezké".

`doporuc()` startuje na 60 bodech a každá osa přidá nebo ubere podle shody.
Dvě pravidla, na kterých záleží víc, než je vidět:

- **Osy jsou spojité tam, kde jsou v datech čísla** (oblíbenost, slabiky).
  Se škatulkami „běžné / vzácné" stovky jmen skončily na stejném skóre a
  o pořadí pak rozhodla první drobnost, která se připočetla.
- **Příjmení jméno doladí, nepřebije vkus.** Připočítává se *odchylka* od
  `NEUTRALNI_SOUZVUK` (70), ne absolutní souzvuk. Než se to opravilo, stačilo
  vyplnit příjmení a žebříček se přeskládal podle rytmu slabik bez ohledu na
  to, co si člověk naklikal. Hlídá to test v `testy/rozhodovani.test.ts`.

Skóre **není pravděpodobnost** a nikde se tak nepodává. `slovemSkore()` ho
převádí na slovní zařazení a u každého jména je rozepsané, z čeho vzniklo.

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

Všech deset pozic se překlápí **naráz**, ne jedna po druhé — jinak by se
koutkem oka pořád něco hýbalo. Rotace se zastaví při najetí myší, doteku
i zaměření klávesnicí; tlačítko pauzy je **jen v liště nahoře**. Při
`prefers-reduced-motion` se nic neotáčí. Označení „reklama" je vidět vždycky,
odkazy mají `rel="sponsored nofollow noopener"`. Na kartě je **logo firmy**;
ikona je jen náhrada, dokud ho firma nenahraje. Volná plocha se ukáže jako
nabídka „Volné místo pro vaši reklamu" s odkazem rovnou na rezervaci té
konkrétní plochy. Rezervací vzniká účet inzerenta bez hesla — přístupovým
klíčem se na `/reklama/ucet` dostane ke stavu kampaně, platbě i úpravě textu.

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

## Rozvržení a vzduch kolem reklamy

Reklamní sloupce jsou přišpendlené k oknu, ale **nelepí na jeho hranu**:
`--reklamni-okraj` je odsune od kraje displeje a `--reklamni-mezera` je
oddělí od obsahu. Obsah se pak posune o celý blok
`okraj + sloupec + mezera`. Bez toho oko čte sloupec jako součást stránky
a inzerát se ztratí; nalepený na hranu navíc působí jako chyba vykreslení.

Mřížka sekcí na úvodu (`.mrizka-sekce`) má **pevný počet sloupců 1 / 2 / 3**,
ne `auto-fill`. Šest karet se do každé varianty vejde beze zbytku, takže
nikdy nevznikne řádek s jednou osamělou kartou a prázdnem vedle ní.
V katalogu, kde je počet jmen libovolný, `auto-fill` zůstává.

## Verze a upgrade

Web běží na **Next.js 16, React 19, Tailwind 4 a TypeScript 7**, sestavuje se
Turbopackem a nasazuje přes `@opennextjs/cloudflare`. `npm outdated` má být
prázdné; když není, upgrade patří do samostatného commitu.

Tři věci, které se při přechodu z předchozích major verzí rozbily tiše —
build ani testy je nenahlásily:

- **Tailwind 4 dává utility do vrstvy `utilities`, a nezavrstvené CSS
  přebíjí kterékoli zavrstvené.** Vlastní styly v `globals.css` proto musí
  zůstat v `@layer components`. Bez toho přestane platit `sm:hidden`
  a spodní mobilní lišta se ukáže i na širokém displeji.
- **Next.js 16 předává `id` v `sitemap.ts` jako Promise.** Bez `await`
  vyjdou všechny dílčí mapy prázdné a build mlčí.
- **Next.js 16 si zabírá adresu `/sitemap.xml`** pro konvenci metadat, takže
  vlastní handler na ní build odmítne. Rejstřík dílčích map je proto na
  `/sitemap-index.xml` a `robots.txt` ukazuje tam.

Kontrola SEO (`npm run kontrola:seo`) chytí první dva body zpětně — proto se
po každém upgradu spouští.

## Konvence

- Kód, komentáře i identifikátory jsou **česky**. Komentář vysvětluje *proč*,
  ne *co*.
- Nové jméno se přidává do `lib/names/data.ts` přes `pridej()`, ne ručně —
  slabiky a délka se dopočítají samy.
- Nová stránka: přidat do `app/sitemap.ts` a do patičky.
- Nová reklamní plocha: doplnit do `ads-worker/src/plochy.ts` **a** předat
  její jméno komponentě `Rozvrzeni` na příslušné stránce.
