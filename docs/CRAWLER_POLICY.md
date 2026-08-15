# Politika vůči robotům

Zdroj pravdy je `app/robots.ts`. Tenhle dokument vysvětluje **proč** je
nastavené to, co je nastavené — z `robots.txt` samotného to poznat nejde.

---

## 1. Roboty jazykových modelů pouštíme dovnitř. Záměrně.

Většina webů je dnes buď zavírá, nebo o nich nepřemýšlí. Svět jmen je pouští
dovnitř, protože chce být **citovaný ve chvíli, kdy se člověk zeptá
asistenta**, ne až když otevře vyhledávač. Otázky typu „jaké jméno pro
štěně border kolie" nebo „co znamená jméno Eliška" jsou přesně to, na co
tenhle web umí odpovědět líp než obecný model.

Co za to dáváme: obsah, který je stejně veřejný jako pro Google.
Co za to chceme: uvedení zdroje. Vynutit ho nejde, ale dá se pro něj udělat
maximum — viz `AI_QUERY_MAP.md`, oddíl o citovatelnosti.

Jmenovitě povolení roboti (`AI_ROBOTI` v `app/robots.ts`):

| Robot | Kdo za ním stojí | K čemu slouží |
|---|---|---|
| `GPTBot` | OpenAI | trénink |
| `OAI-SearchBot` | OpenAI | index pro ChatGPT search |
| `ChatGPT-User` | OpenAI | načtení stránky na přání uživatele |
| `ClaudeBot`, `anthropic-ai`, `Claude-Web` | Anthropic | trénink a načítání |
| `Claude-User`, `Claude-SearchBot` | Anthropic | uživatelský dotaz, vyhledávací index |
| `PerplexityBot`, `Perplexity-User` | Perplexity | index a uživatelský dotaz |
| `Google-Extended` | Google | trénink Gemini (odděleně od vyhledávání) |
| `Applebot`, `Applebot-Extended` | Apple | Siri, Spotlight, trénink |
| `Bingbot` | Microsoft | vyhledávání + podklad pro ChatGPT search |
| `SeznamBot` | Seznam | české vyhledávání |
| `Amazonbot`, `meta-externalagent`, `cohere-ai`, `CCBot`, `YouBot`, `Diffbot`, `DuckAssistBot`, `MistralAI-User` | různí | index a trénink |

**Proč jmenovitě, když je `User-agent: *` už povolený:** část těchhle robotů
čte jen svůj vlastní záznam a obecný `*` ignoruje. Bez jmenovitého zápisu by
se chovali podle vlastního výchozího nastavení, ne podle našeho.

---

## 2. Co je zavřené pro všechny

```
/oblibene        osobní výběr návštěvníka
/rodina          rodinný profil
/analyza-vyberu  rozbor vlastního výběru
/sprava          správa webu
/*?*             jakákoli adresa s parametrem
```

(Do 15. 8. 2026 tu byly i `/admin`, `/docs` a `/aurora` — patřily druhému
projektu, který odsud odešel, viz `ODSTRANENI-AURORADOG.md`.)

`/*?*` je nejdůležitější řádek celého souboru. Filtry katalogu běží přes
parametry (`?kategorie=…&zeme=…&styl=…`) a jejich kombinací jsou desítky
tisíc. Bez tohohle zákazu by crawler chodil donekonečna po stránkách, které
se od sebe liší pořadím dvaceti karet, a rozpočet na procházení by se
utratil za duplicity místo za nové jméno.

Osobní nástroje mají navíc `noindex` v hlavičce — `robots.txt` totiž
nezakazuje indexaci, jen procházení. Adresa, na kterou vede odkaz odjinud,
se do indexu dostane i tak.

---

## 3. Náhled se nezpřístupňuje vůbec

```js
if (JE_NAHLED) return { rules: [{ userAgent: '*', disallow: '/' }] }
```

`JE_NAHLED` je pravda na `workers.dev`, na `localhost` a všude, kde
`NEXT_PUBLIC_URL` není `https://`. Na náhledu se nevydává ani mapa webu, ani
ověřovací soubor pro IndexNow.

Důvod: dvě adresy s totožným obsahem si konkurují a vyhledávač si vybere
sám, kterou ukáže. Prohrát vlastní doménu s vývojovou adresou je snadné a
špatně se to napravuje.

---

## 4. Rychlost procházení

Neomezujeme ji. `Crawl-delay` v `robots.txt` není a nebude:

- Google ho ignoruje
- web je staticky předgenerovaný na Cloudflare, takže procházení nic nestojí
- 296 adres není zátěž pro nikoho

Kdyby některý robot začal dělat problémy, řeší se to na úrovni Cloudflare
(rate limiting podle User-Agentu), ne v `robots.txt` — ten je jen doporučení
a robot, který dělá problémy, ho stejně nectí.

---

## 5. Cloudflare do robotů mluvit nesmí

Cloudflare umí robota řešit sám — **AI Crawl Control** (dřív AI Audit)
s volbou *Managed robots.txt*, a k tomu přepínače *Block AI bots* / *Block
AI Scrapers and Crawlers*. Když jsou zapnuté, Cloudflare buď podstrčí
vlastní `robots.txt`, nebo roboty zablokuje ještě dřív, než dojdou
k Workeru — a náš soubor pak neplatí, ať v něm stojí cokoli.

**Pro tenhle web to musí být vypnuté.** Cloudflare ve výchozím nastavení
roboty jazykových modelů **blokuje**, kdežto my je podle oddílu 1 pouštíme
dovnitř schválně — celá strategie citovatelnosti stojí na tom, že se web
dostane do odpovědí asistentů. Zapnutá ochrana v Cloudflare by ji tiše
zrušila a nikde by to nebylo vidět: v repozitáři by dál stálo „povoleno".

Kde to je: Cloudflare → doména `svetjmen.cz` → **AI Crawl Control**
(v starším rozhraní Security → Bots). Vypnout *Managed robots.txt*
i blokování AI robotů. *Bot Fight Mode* nechat vypnutý taky — hází
výzvy i legitimním vyhledávacím robotům.

Ověření, že platí náš soubor a ne cizí:

```bash
curl -s https://svetjmen.cz/robots.txt | head -20
```

Musí začínat `User-Agent: *` a `Allow: /` a obsahovat jmenovitý seznam
robotů z oddílu 1. Když tam přibyly řádky, které v `app/robots.ts` nejsou
(typicky blok zakazující `GPTBot` a spol.), přidává je Cloudflare.

---

## 6. Kdy tenhle soubor měnit

- **Přibude nový AI robot** → doplnit do `AI_ROBOTI` v `app/robots.ts`
  a do tabulky výš. Zatím je politika „pouštíme všechny, kdo se představí".
- **Zavedeme placenou část webu** → zavřít ji všem, včetně AI robotů.
  Dnes žádná není.
- **Někdo bude obsah kopírovat bez uvedení zdroje** → tehdy má smysl
  konkrétního robota zavřít. Preventivně ne; zavřený robot znamená nulovou
  citovanost, ne lepší.
