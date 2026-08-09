# Strategie viditelnosti ve vyhledávání

Stav ke dni poslední úpravy tohoto souboru. Čísla v něm jsou buď spočítaná
z repozitáře, nebo označená jako neznámá. **Nikde tu není odhad hledanosti
vydávaný za měření** — k žádnému nástroji, který ji měří, teď přístup není.

---

## 1. Čím se dá vyhrát a čím ne

Katalogy jmen v češtině existují a mají náskok v odkazech i ve stáří domény.
Souboj o dotaz „jména pro holčičky" je souboj o pozici, kterou drží weby
s tisíci zpětných odkazů. Dá se do něj jít, ale vyhraje se leda za roky.

Co ty katalogy **nedělají**: nepomůžou člověku dojít k rozhodnutí. Ukážou
seznam. Rodič, který má tři finalisty a hádá se o ně s partnerem, na nich
nenajde nic použitelného.

Strategie proto zní: **vyhrát rozhodovací dotazy, ne katalogové.**

| | Katalogové dotazy | Rozhodovací dotazy |
|---|---|---|
| Příklad | „jména pro kluky" | „nemůžeme se shodnout na jménu" |
| Konkurence | vysoká, zavedená | téměř žádná |
| Co uspokojí | dlouhý seznam | nástroj nebo postup |
| Naše šance | nízká zpočátku | vysoká hned |
| Co z toho máme | návštěva bez záměru | člověk, který se vrátí |

Katalog přesto zůstává. Není to konkurenční zbraň, je to **důkaz, že
nástrojům je z čeho počítat** — a zdroj vnitřních odkazů.

---

## 2. Vrstvy indexace

Web má 218 indexovatelných adres ve čtyřech vrstvách. Mapa webu je podle
nich rozdělená (`/sitemap/0.xml` až `/sitemap/3.xml`), takže Search Console
hlásí pokrytí za každou vrstvu zvlášť.

| Vrstva | Adres | Co to je | Priorita |
|---|---|---|---|
| `nastroje` | 10 | rozhodovací nástroje, úvod, právní stránky | nejvyšší |
| `katalog` | 12 | `/deti`, `/zvirata`, deset kategorií | vysoká |
| `jmena` | 170 | detaily jmen, která projdou datovou branou | střední |
| `zeme` | 26 | země použití | nízká |

**Datová brána** (`maDostDat()` v `lib/names/entita.ts`) je záměrné omezení:
z 1 098 unikátních jmen má vlastní stránku 170. Zbylých 928 nemá dost
vlastního obsahu na to, aby stránka nebyla tenká. Až se data doplní, brána
je pustí dál sama — dokud se nedoplní, tisíc skoro stejných stránek
nevznikne.

Co se **neindexuje** a proč:

- `/oblibene`, `/rodina` — osobní nástroje, obsah patří jednomu člověku
- `/*?*` — filtry přes parametry; jinak by crawler chodil donekonečna po
  kombinacích `?zeme=…&styl=…` a katalog by se v indexu množil sám ze sebe
- celý web na `workers.dev` a `localhost` — náhled nesmí konkurovat produkci

---

## 3. Google, Seznam, Bing

**Google.** Rozhoduje o většině návštěvnosti. Nic zvláštního nepotřebuje
kromě toho, co web už má: rozdělené mapy webu, canonical na každé stránce,
strukturovaná data a serverem vykreslené HTML.

**Seznam.** V Česku pořád nezanedbatelný, hlavně u starších uživatelů —
tedy i u prarodičů, kteří jméno vnoučete řeší s rodiči. `SeznamBot` je
v `robots.txt` jmenovitě povolený. Seznam navíc podporuje IndexNow, takže
ho pokrývá `npm run indexnow`.

**Bing.** Sám o sobě malý, ale je to **zdroj dat pro ChatGPT search**.
Viditelnost v Bingu se dnes propisuje do odpovědí jazykových modelů, takže
se vyplatí víc, než by jeho podíl napovídal. IndexNow je primárně jeho
protokol.

Pořadí prací: Google (mapy webu, obsah) → Bing (IndexNow, kvůli AI) →
Seznam (IndexNow zdarma navrch).

---

## 4. Mobil napřed

Většina lidí vybírá jméno na telefonu, často vleže večer. Z toho plyne pár
tvrdých pravidel, která web dodržuje a která se testují:

- žádné vodorovné posouvání na žádné šířce od 320 px výš
- stránka dává smysl **bez JavaScriptu** — hlavní nadpis, text i odkazy se
  vykreslí na serveru
- nástroj je nad prvním ohybem, vysvětlování až pod ním
- klepací cíle aspoň 24 px (výjimka: odkazy uvnitř věty, kde to WCAG 2.2
  povoluje)

Testovací matice, kterou opravdu projíždíme: **320, 360, 390, 414, 768,
1024, 1280 px**, Chromium. Safari na iOS a Chrome na Androidu se v tomhle
prostředí spustit nedají — jejich odlišnosti (výška lišty prohlížeče,
`100vh`) proto řešíme dynamickými jednotkami, ne testem.

---

## 5. Co měřit

Bez analytiky (žádná se zatím nenasadila) je jediný zdroj čísel **Search
Console** a **Bing Webmaster Tools**. Doporučené pořadí zavedení:

1. Search Console — ověření domény, odeslání `/sitemap.xml`
2. Bing Webmaster Tools — import ze Search Console
3. `INDEXNOW_KEY` do prostředí, po nasazení `npm run indexnow`

Až budou první data, doplní se do `KEYWORD_MASTER.csv` sloupce `objem`
a `zdroj_objemu`. Do té doby zůstávají `neznamy` — viz úvod.

**Severka:** počet lidí, kteří dojdou k rozhodnutí. Měřitelná náhrada:
podíl návštěv, ve kterých člověk použije rozhodovací nástroj (porovnání,
test s příjmením, hledač dvojic) a uloží si aspoň jedno jméno. Ne počet
zobrazených stránek — ten roste, i když je web k ničemu.

---

## 6. Co záměrně neděláme

- **Doorway stránky.** „Jméno k příjmení Novák", „…Svoboda", „…Dvořák" —
  jednou šablonou by šly vyrobit tisíce. Neuděláme to. Nástroj to zvládne
  pro libovolné příjmení a stránka navíc by nepřidala nic než adresu.
- **Vymýšlená čísla.** Hledanost, procenta shody, „87 % rodičů volí".
- **Obsah pro robota.** Text, který by na stránce nedával smysl člověku,
  na web nepatří ani kvůli strukturovaným datům.
- **Zeď na e-mail.** Nic z toho, co web umí, se neschovává za registraci.
