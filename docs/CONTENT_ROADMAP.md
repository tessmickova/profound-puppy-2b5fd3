# Plán obsahu

Pořadí je podle jednoho kritéria: **kolik nejistoty to člověku ubere.**
Ne podle toho, co se dobře píše nebo co by mohlo mít hledanost — tu
neznáme, viz `KEYWORD_MASTER.csv`.

Každá položka má napsané, čím je blokovaná. Položky blokované daty se
nezačnou psát, dokud data nebudou; obsah vyrobený kolem chybějícího faktu
je horší než chybějící stránka.

---

## Hotovo

| Stránka | Co řeší |
|---|---|
| `/vybrat-jmeno-pro-dite` | „nevíme, kde začít" — hledač dvojic |
| `/vybrat-jmeno-pro-zvire` | totéž pro osm druhů zvířat |
| `/porovnat-jmena` | „máme favority a nemůžeme se rozhodnout" |
| `/jmeno-k-prijmeni` | „jak to zní dohromady" |
| `/jak-vybrat-jmeno-kdyz-se-nemuzeme-shodnout` | neshoda ve dvou |
| `/metodika` | odkud jsou data a co znamená skóre |
| `/jmeno/[slug]` × 170 | detail jména |
| `/zeme/[kod]` × 25 | jména podle země použití |

Doplněno také **43 českých dětských jmen** (95 celkem), hlavně těch
modernějších — Mia, Ella, Laura, Stela, Tobiáš, Leo, Maxim. Bez nich měla
dobovou informaci jen tradiční jména a nabídka „co se bude dávat" vypadala
jako seznam pro prababičky.

---

## P0 — chybí a nic je neblokuje

**1. `/jmena-ktera-funguji-i-v-cizine`**
Pro rodiče, kteří žijí nebo plánují žít v zahraničí, a pro ty, které štve
představa doživotního hláskování. Data jsou v `cestina.ts` (`vCizine`,
`hlaskovani`, `bezHacku`) a nikde se neukazují mimo test jména.
*Podoba:* nástroj (napište jméno → uvidíte, jak dopadne v angličtině
a němčině) + seznam jmen, která projdou bez úprav.

**2. `/jmeno-k-sourozenci`**
Veřejná vstupní stránka pro logiku, kterou dnes umí jen `/rodina` — a ta je
`noindex`, takže na ni nikdo nepřijde z vyhledávání. Druhé dítě je přitom
druhá nejčastější situace hned po prvním.
*Podoba:* zadám jméno staršího sourozence a příjmení, dostanu návrhy
s vysvětlením, proč ladí.

**3. `/jmeno-pro-psa-na-pismeno/[pismeno]`**
Chovatelské stanice přidělují vrhu písmeno a majitel štěněte s ním přijde.
Je to úzký, ale naprosto konkrétní záměr — a filtr to už umí.
*Pozor:* 26 stránek je hranice, kde to ještě není doorway. Každá musí mít
vlastní úvod a dost jmen; písmena, kde je jmen málo (Q, X), se nevydají.

**4. Kalendář jmenin**
Data o svátcích jsou v `extra.ts`. Chybí sekce, která je zpřístupní —
a je to trvale vyhledávaný dotaz, který se opakuje každý rok.
*Podoba:* přehled po měsících + „kdo má dnes svátek".

---

## P1 — chybí, ale je co promyslet

**5. Rozcestník podle významu**
„Chci jméno, které znamená světlo / sílu / naději." Významy v datech jsou,
ale nejsou kategorizované — musela by vzniknout ruční klasifikace. Bez ní by
to bylo hledání v textu a výsledky by byly náhodné.
*Blokuje:* klasifikace významů (ruční práce nad 1 098 záznamy).

**6. Průvodce pro dva rodiče na dálku**
Sdílený užší výběr, který jde poslat odkazem, aniž by kdokoli zakládal účet.
Technicky: výběr zakódovaný v adrese, žádný server, žádná data u nás.
*Blokuje:* rozhodnutí o délce adresy a o tom, co se stane, když si dva lidé
otevřou stejný odkaz a každý ho změní.

**7. Články o skutečných situacích**
Ne „50 nejkrásnějších jmen". Spíš: co dělat, když se jméno líbí jen jednomu
z prarodičů. Jestli vadí, že jméno nosí někdo ve třídě. Jak se pozná, že
jméno „přeroste". Každý článek musí končit v nástroji, ne v dalším seznamu.
*Blokuje:* nic technicky; je to psaní, které musí být poctivé — bez
vymyšlených statistik a bez rad, na které nemáme podklad.

---

## P2 — jen s daty, jinak vůbec

**9. Nejčastější jména v ČR podle roku**
Nejsilnější dotaz v celé oblasti a zároveň ten, který se nejvíc kazí:
weby uvádějí žebříčky bez roku a bez zdroje.
*Blokuje:* data ČSÚ nebo MV ČR. Bez uvedeného zdroje a roku **nevzniká**.

**10. Původ a etymologie jmen**
`puvod` je prázdný u všech 1 243 záznamů. Země v datech znamená, kde se
jméno nosí, ne odkud pochází — a tenhle rozdíl je na webu popsaný právě
proto, aby se nezaměňoval.
*Blokuje:* doložitelný zdroj etymologie. Opsat to odjinud nejde.

**11. Jména podle plemene psa**
`breeds.ts` má 54 plemen s ručně vybranými jmény. Vlastní stránky by dávaly
smysl, ale 54 stránek generovaných ze šablony je přesně ta hranice, za
kterou začíná doorway. Vydat se dají jen ta plemena, kde je co říct nad
rámec seznamu.
*Blokuje:* rozhodnutí, kolika plemenům umíme napsat vlastní úvod.

---

## Co se psát nebude

- **„50 nejkrásnějších jmen pro holčičky"** a podobné seznamy. Existují
  tisíckrát a nikomu nepomůžou k rozhodnutí.
- **Numerologie a významy jmen podle znamení** jako tvrzení. Pokud
  numerologie na webu zůstane, tak výhradně jako zjevná zábava.
- **Stránka pro každé příjmení.** Nástroj to zvládne pro libovolné.
- **Cokoli, co potřebuje vymyšlené číslo, aby to znělo přesvědčivě.**
