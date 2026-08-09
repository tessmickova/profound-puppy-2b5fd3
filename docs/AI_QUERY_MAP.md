# Mapa dotazů pro AI odpovědi

Jak se web chová, když se člověk neptá vyhledávače, ale asistenta. Jiná
situace než klasické SEO: **není tam žebříček deseti odkazů**. Buď je web
v odpovědi uvedený jako zdroj, nebo o něm nikdo neví.

---

## 1. Co rozhoduje o citaci

Z toho, jak vyhledávací roboti jazykových modelů fungují, plyne pár věcí,
které se dají ovlivnit:

1. **Odpověď musí být v HTML, ne v JavaScriptu.** Robot často nespouští
   skripty. Proto je celý web serverem vykreslený a nástroje mají smysluplný
   výchozí stav i bez JS.
2. **Tvrzení musí být na jednom místě, ne poskládané ze tří odstavců.**
   Model cituje úsek, ne stránku.
3. **U tvrzení musí být vidět, odkud je.** Věta „Eliška je zdrobnělina
   Alžběty" bez zdroje je stejně dobrá jako totéž na kterémkoli jiném webu.
   Věta s odkazem na metodiku a s uvedením, že jde o redakční zpracování,
   má navrch.
4. **Čísla musí být ukotvená v čase.** „Nejčastější jméno" bez roku je
   nepoužitelné a model to pozná.

Co **nefunguje**: opakování klíčových slov, značkování obsahu, který na
stránce není, ani stránky psané pro robota. Modely to nepoznají jako
kvalitu, poznají to jako šum.

---

## 2. Typické dotazy a co na ně web má

| Dotaz uživatele asistentovi | Co má web | Stav |
|---|---|---|
| „Co znamená jméno Eliška?" | `/jmeno/eliska` — význam, svátek, domácké tvary, země použití | hotovo |
| „Jak se řekne Eliško v 5. pádu?" | `cestina.ts` → `osloveni()`, ukázané na `/jmeno-k-prijmeni` | hotovo |
| „Jaké jméno se hodí k příjmení Nováková?" | `/jmeno-k-prijmeni` — nástroj pro libovolné příjmení | hotovo |
| „Eliška, nebo Amálie?" | `/porovnat-jmena` — strukturované porovnání | hotovo |
| „S partnerem se neshodneme na jménu, co s tím?" | `/jak-vybrat-jmeno-kdyz-se-nemuzeme-shodnout` — postup se strukturovanými daty HowTo | hotovo |
| „Jaká jsou norská jména pro holčičky?" | `/zeme/no` | hotovo |
| „Jak pojmenovat border kolii?" | data plemen v `breeds.ts`, ale **bez vlastní stránky** | chybí |
| „Jaká byla nejčastější jména v ČR v roce 2024?" | nic — a nic nevznikne bez dat ČSÚ | chybí, blokované daty |
| „Kdy má svátek Eliška?" | data v `extra.ts`, kalendář jako sekce chybí | chybí |
| „Jaké jméno funguje i v zahraničí?" | `vCizine()` v kódu, vstupní stránka chybí | chybí |

Řádky „chybí" jsou fronta práce, ne omluva. Řádek „blokované daty" znamená,
že se **nezačne psát dřív, než bude zdroj** — vymyšlený žebříček by byl
horší než žádný.

---

## 3. Vrstva zdrojů u každého tvrzení

Web rozlišuje tři druhy tvrzení a každý se podává jinak:

**Ověřitelný fakt.** Význam jména, jazyk původu, datum svátku. Podává se
jako tvrzení a v metodice je napsáno, odkud je a jak vzniklo (redakční
zpracování, ne strojový import).

**Výsledek pravidla.** Oslovení v 5. pádu, genitiv, iniciály, souzvuk
s příjmením, skóre shody. Podává se **spolu s pravidlem**: u každého
doporučení je rozklikávací „proč mi ho doporučujete?" s jednotlivými
pravidly a poznámkou, že skóre je jejich součet, ne pravděpodobnost.

**Odhad.** Jak jméno zazní v angličtině, jestli se bude hláskovat. Podává se
jako odhad podle pravopisu — „počítejte s vysvětlováním", ne „bude problém".

Tohle rozlišení není kosmetika. Model, který cituje web tvrdící „87 %
rodičů je spokojených", cituje smyšlené číslo a při ověření to praskne
oběma. Model, který cituje „skóre je součet pravidel, která jsou vypsaná",
cituje něco, co obstojí.

---

## 4. Strukturovaná data, která web vydává

| Typ | Kde | K čemu |
|---|---|---|
| `WebSite` + `SearchAction` | layout | identita webu |
| `Organization` | layout | `knowsAbout` — o čem web je |
| `FAQPage` | úvod, `/deti`, `/zvirata` | otázky, které jsou na stránce vidět |
| `HowTo` | `/deti`, `/jak-vybrat-jmeno-kdyz-se-nemuzeme-shodnout` | postup, který je na stránce vidět |
| `DefinedTermSet` | `/deti`, `/zvirata` | jména jako pojmy s významem |
| `ItemList` | úvod, kategorie | žebříčky |
| `BreadcrumbList` | vnitřní stránky | zařazení v hierarchii |

Pravidlo, které se dodržuje bez výjimky: **do strukturovaných dat jde jen
to, co je na stránce vidět.** Značkovat neviditelný obsah je porušení
pravidel Googlu a modelům to nepomůže vůbec.

---

## 5. Vztahy mezi entitami

Jméno není řetězec, je to entita. Kde to jde, web vazby vyjadřuje:

- jméno ↔ **země použití** (`/zeme/[kod]`) — pozor, *použití*, ne původu
- jméno ↔ **kategorie** (`/jmena/[slug]`)
- jméno ↔ **domácké tvary** a **svátek**
- jméno ↔ **podobná jména** (stejná kategorie, blízké osy vkusu)

Co chybí a je to znát: **původ** (`puvod`) je prázdný u všech 1 243 záznamů.
Země v datech znamená, kde se jméno běžně nosí. Dokud se `puvod` nedoplní
z doložitelného zdroje, web o etymologii netvrdí nic — a to je správně, ale
je to díra v pokrytí dotazů typu „odkud pochází jméno Tereza".

---

## 6. Jak si ověřit, že to funguje

Automaticky to změřit nejde — API, které by řeklo „jak často tě cituje
ChatGPT", neexistuje. Co jde:

1. **Ruční test sady dotazů** z tabulky v oddílu 2, jednou za čtvrtletí,
   v ChatGPT, Claude, Perplexity a Google AI Overviews. Zapsat, jestli je
   web citovaný, a když ne, který web ano a čím to má lepší.
2. **Bing Webmaster Tools** — ChatGPT search stojí na Bingu, takže pokles
   viditelnosti tam je předzvěst poklesu v citacích.
3. **Serverové logy** — návštěvy `OAI-SearchBot`, `Claude-SearchBot`
   a `PerplexityBot` ukazují aspoň to, že roboti chodí.
