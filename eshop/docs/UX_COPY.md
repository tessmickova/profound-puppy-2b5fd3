# UX_COPY.md — Texty pro e-shop, e-maily a packaging

**Stav:** NÁHLED ke schválení. Vše `cs-CZ`, uloženo v message layeru (žádné hardcoded texty v komponentách). Tykání (konzistentně s brand voice); právní stránky vykají. `[HRANATÉ ZÁVORKY]` = dynamická data.

---

## 1. Homepage

**Hero:** „Měj to pořešené dřív, než začne shon.“
**Sub:** „Výbava na zatmění, kroupy, první sníh i velkou vodu. Vyčmucháno s předstihem.“
**CTA:** „Co se blíží“ / „Prohlédnout výbavu“

**Sekce:**
- **Co se blíží** — eventové dlaždice s countdownem: „Zatmění Slunce — za [N] dní“ + cutoff: „Objednej do [DATUM], ať to stihne dorazit.“
- **Co se teď hodí** — sezónní výběr.
- **Dobrý čuch** — kurátorský výběr (max 4–6 produktů).

Trust lišta (footer/checkout): „Odesíláme do [X] pracovních dní · Packeta po celé ČR · 14 dní na vrácení · Bezpečná platba kartou“

## 2. Product detail

Above fold: název → hlavní benefit jednou větou → cena → skladovost → varianty → CTA „Přidat do košíku“ → doprava/ETA → trust.

- Skladem: „Skladem [N] ks · Odešleme do [X] pracovních dní“ (počet jen pod prahem a pravdivý)
- Eventový produkt: „🕐 Objednej do [DATUM] — předáme dopravci před [UDÁLOST].“
- **🐺 Proč to máme** — viz BRAND_VOICE §7.
- Safety produkt: sekce „Bezpečnost a certifikace“ hned pod benefitem — dokumenty výrobce ke stažení, norma, výrobce/dovozce. Žádná tvrzení bez podkladu.
- Size guide (gumáky/sáňky): „Jak vybrat velikost“ — tabulka + „Měříš mezi velikostmi? Vezmi větší, dětská noha si to za měsíc rozmyslí.“

## 3. Košík

- Titulek: „Košík“ (žádná kreativita).
- Prázdný: „Košík je prázdný. Zatím. 🐾 → Co se teď hodí“
- Bundle radar (jen když je výhodnější): „4 ks brýlí máš levněji jako Rodinný balíček. Ušetříš [X] Kč. [Přehodit]“
- Cross-sell max 2 položky, věcně: „K sáňkám se hodí: tažný popruh.“
- Doprava zdarma (je-li): „Do dopravy zdarma zbývá [X] Kč.“
- CTA: „Pokračovat k dopravě“

## 4. Checkout (bez humoru)

Kroky: **1 Doprava a kontakt → 2 Platba → 3 Hotovo** (progress bar).

- Kontakt: „E-mail (pošleme sem potvrzení a sledování zásilky)“, „Telefon (pro dopravce)“.
- „☐ Nakupuji na firmu“ → rozbalí IČO/DIČ/název.
- Doprava: „Packeta — výdejní místo · [CENA]“ + „Vybrat výdejní místo“ (widget). Nevhodné metody: „Tenhle produkt se do boxu nevejde — vyber prosím jinou dopravu.“
- Preorder v košíku: banner „PŘEDOBJEDNÁVKA — odeslání očekáváme [DATUM]. Platíš teď, zboží odešleme, jakmile dorazí.“
- Platba: „Zaplatit [ČÁSTKA] Kč“ → „Přesměrujeme tě na zabezpečenou platební bránu.“
- Chyby inline: „Zadej prosím platný e-mail — bez něj ti nepošleme potvrzení.“

## 5. Success page

- Platba potvrzena: **„Pořešeno. 🐺“** / „Objednávku [ČÍSLO] máme a je zaplacená. Teď už je to na nás. Potvrzení letí na [EMAIL].“ + shrnutí + „Sledovat objednávku“ (tokenový odkaz).
- Webhook ještě nedorazil: „Objednávku [ČÍSLO] máme. Platbu právě ověřujeme — potvrzení dorazí e-mailem během pár minut.“ (Nikdy netvrdit „zaplaceno“ bez server-side stavu.)
- Platba selhala: „Platba neprošla. Objednávku držíme [N] minut — můžeš to zkusit znovu.“ [Zkusit znovu]

## 6. Vyprodáno

„**VYPRODÁNO.** Tenhle kousek zmizel rychle.“
- „👀 Podobná věc: [alternativa]“ (jen skutečně relevantní)
- „🔔 Dej mi vědět, až bude zpět“ → e-mail + samostatný souhlas: „☐ Souhlasím se zasláním jednoho upozornění na naskladnění.“ (double opt-in)
- Známé datum doskladnění → „Čekáme doskladnění kolem [DATUM].“ Neznámé → žádné datum, žádné sliby.

## 7. Stavové stránky

- 404: „Tady nic nevyčmucháme. 🐺 Zkus to jinudy.“ + odkazy Domů / Co se blíží / Hledání.
- 500: „Něco se pokazilo u nás. Už na tom děláme — zkus to prosím za chvíli.“ (bez humoru)
- Údržba/high traffic degradace: „Je tu nával. Stránka může být pomalejší, objednávky fungují normálně.“

## 8. Vratka (self-service)

Vstup: „Vrácení zboží — zadej číslo objednávky a e-mail, pošleme ti bezpečný odkaz.“
Formulář: výběr položek + množství, důvod nepovinný („Pomůže nám to, ale nemusíš.“), odstoupení vs reklamace rozcestník.
Potvrzení: „Žádost máme. Do [N] dnů se ozveme s dalším postupem.“
Po refundu: „Peníze jsou na cestě zpět — podle banky dorazí do [X] dní.“

## 9. Reklamace

„Něco není v pořádku? Pojďme to vyřešit.“ — číslo objednávky, produkt, popis, fotky (drag&drop), preferované řešení (oprava/výměna/peníze).
Potvrzení: „Reklamaci jsme přijali [DATUM]. Vyřídíme ji nejpozději do [ZÁKONNÁ LHŮTA — konfigurace]. Průběh sleduj na [odkaz].“ Věcně, empaticky, nula hlášek.

## 10. Transakční e-maily (HTML + plain text, funkční bez obrázků)

Vzor: předmět / první řádek / tělo. Vždy: číslo objednávky, obsah, částky, odkazy. Personality max. 1 věta.

1. **Objednávka přijata** — „Objednávku máme ✓ [ČÍSLO]“ / „Držíme ti zboží a čekáme na platbu.“
2. **Čekáme na platbu** — „Chybí už jen platba — objednávka [ČÍSLO]“ / „Rezervaci držíme do [ČAS]. [Zaplatit]“
3. **Platba přijata** — „Pořešeno ✓ Platba dorazila“ / „Teď už je to na nás. Doklad: [bezpečný odkaz].“
4. **Připravujeme** — „Balíme objednávku [ČÍSLO]“
5. **Odesláno** — „Mazá to k tobě 🐺 [ČÍSLO]“ / dopravce, tracking, obsah, očekávané doručení („dopravce předpokládá…“).
6. **Tracking/doručení** — dle dopravce.
7. **Zrušena** — „Objednávka [ČÍSLO] zrušena“ / důvod, co s penězi.
8. **Refund proveden** — „Peníze jsou na cestě zpět“ / částka, kanál, lhůta banky.
9. **Vratka přijata** — „Vrácení evidujeme“ / co dál, adresa, lhůta.
10. **Reklamace přijata** — „Reklamaci řešíme“ / číslo, lhůta, odkaz na průběh.
11. **Reklamace vyřízena** — „Reklamace vyřízena“ / výsledek, další kroky.

Patička: identifikace provozovatele, kontakty, odkaz na podmínky. Transakční maily NIKDY nemíchat s marketingem.

## 11. Packaging

- Kartička v balíku: „**O chlup napřed.** Díky, že nakupuješ dřív, než začne shon. 🐺“ + rub: kontakt, vratky, QR na „moje objednávka“.
- Samolepka: husky hlava / tlapka.
- U safety produktů: tištěné pokyny výrobce mají přednost před brand kartičkou.

## 12. Mikrocopy zásady

- Tlačítka = akce („Zaplatit 348 Kč“, ne „Odeslat“).
- Chyby říkají, co udělat, ne co je špatně za trest.
- Žádné dark patterns: viditelné „Odmítnout“ u cookies, žádné předzaškrtnuté souhlasy, žádné skryté poplatky (doprava vidět nejpozději v kroku 1 checkoutu).
- Autocomplete atributy na všech polích (`email`, `tel`, `given-name`, `family-name`, `postal-code`, `street-address`…).
- Accessibility: labels vždy, chybové hlášky propojené `aria-describedby`, kontrast AA, focus viditelný.
