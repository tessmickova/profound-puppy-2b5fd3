NOAA s jednotlivými snímky modelu Enlil: https://services.swpc.noaa.gov/images/animations/enlil/. Potřebuji vytvořit komponentu, která nebude spoléhat na statický latest.gif, ale sama si "poskládá" nejnovější dostupnou sekvenci snímků.

Úkol:

Vytvoř API route (/api/enlil-sequence), která:

Pomocí fetch načte HTML obsah stránky https://services.swpc.noaa.gov/images/animations/enlil/.

Pomocí regulárního výrazu nebo cheerio vyparsuje všechny názvy souborů začínající na enlil_com2_.

Seřadí je podle datumu v názvu a vybere posledních 40–50 snímků (tvořících ucelenou animaci).

Vrátí pole URL adres těchto obrázků.

Vytvoř React komponentu EnlilPlayer.tsx:

Tato komponenta přijme pole URL z API.

Bude fungovat jako "přehrávač" – bude v rychlém sledu (např. 100ms interval) cyklit mezi obrázky, čímž vytvoří plynulou animaci přímo v prohlížeči (klasický image sequencer).

Výhoda: Menší datová náročnost než velký GIF a okamžitá aktualizace.

Logika kontroly nových dat:

Implementuj v komponentě useEffect, který každých 15 minut znovu zavolá API.

Pokud se změní název posledního souboru v poli, komponenta automaticky aktualizuje přehrávač a upozorní uživatele: "K dispozici je nová aktualizace modelu".

Požadavky na kód:

Použij framer-motion nebo jednoduchý useState/useEffect pro plynulé střídání obrázků.

Přidej tlačítka Play/Pause a posuvník pro manuální procházení času (Timeline).

Zajisti, aby se obrázky přednačítaly (Image.prefetch), aby animace necukala.

Proč je tohle řešení lepší než GIF?

Čerstvost: Jak vidíš na svém screenshotu, soubory mají v názvu přesný čas (20260319T170000). Můžeš uživateli nad animací zobrazit přesný text: "Předpověď pro: 19. března, 17:00 UTC".

Interaktivita: Uživatel si může animaci zastavit a prstem (posuvníkem) si najít přesný moment, kdy ten "mrak" narazí do Země. To laici milují.

Detekce CME: Tvůj kód může snadno zjistit, že přibylo 20 nových snímků s vysokou hustotou, a automaticky poslat push notifikaci.

Tip pro interpretaci dat:

Všimni si v názvu souboru struktury: enlil_com2_YYYYMMDDTHHMMSS.jpg.

com2 = kombinovaný model (hustota + rychlost).

YYYYMMDD = rok, měsíc, den.

THHMMSS = čas (vždy v UTC!).