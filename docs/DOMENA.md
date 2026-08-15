# Doména svetjmen.cz — co kam patří

Stav k 15. 8. 2026: doména **zatím neběží** (nemá delegované jmenné servery,
v DNS není nic). Až bude v Cloudflare, je zapojení jeden krok — konfigurace
je připravená, viz níž.

## Co kde poběží

Celý web je **jeden Worker** (Next.js přes OpenNext), takže landing, katalog
i správa sdílejí jednu doménu. Reklamní služba je Worker druhý a dostane
vlastní subdoménu, aby ji výpadek webu (ani naopak) nezasáhl.

| Adresa | Co to je | Kde to běží |
|---|---|---|
| `https://svetjmen.cz` | úvodní stránka a celý katalog | Worker `svetjmen` |
| `https://svetjmen.cz/deti`, `/zvirata`, `/jmena/…`, `/zeme/…` | katalog | tentýž Worker |
| `https://svetjmen.cz/sprava` | **správa** — objednávky, přepínače, audit | tentýž Worker |
| `https://svetjmen.cz/rodina`, `/oblibene`, `/analyza-vyberu` | osobní nástroje | tentýž Worker |
| `https://www.svetjmen.cz` | přesměrování na `svetjmen.cz` | Worker `svetjmen` |
| `https://reklama.svetjmen.cz` | samoobsluha pro inzerenty | Worker `svetjmen-ads` |
| `https://reklama.svetjmen.cz/api/…` | rozhraní reklam (volá ho web) | Worker `svetjmen-ads` |

Žádný projekt Cloudflare Pages v tomhle repozitáři není — všechno jsou
Workers. `netlify.toml` a `vercel.json` jsou pozůstatky a nic neřídí.

## Zapojení, krok za krokem

1. **Doménu přidat do Cloudflare** (Add a site) a u registrátora přepsat
   jmenné servery na ty, které Cloudflare přidělí. Než se to rozejde,
   `svetjmen.cz` nikam neodpovídá — je to otázka minut až hodin.

2. **Ověřit, že zóna je aktivní**: v Cloudflare musí být u domény stav
   *Active*, ne *Pending Nameserver Update*.

3. **Připojit domény k Workerům.** Buď v Cloudflare (Workers → daný Worker →
   Settings → Domains & Routes → Add → Custom Domain), nebo — jednodušeji —
   odkomentovat připravené bloky `routes` v `wrangler.jsonc`
   a `ads-worker/wrangler.toml` a nechat to na nasazení. Wrangler doménu
   připojí a **DNS záznam si založí sám**; ruční `CNAME` není potřeba.

   Token pro nasazení k tomu potřebuje oprávnění **Workers Scripts: Edit**,
   **Workers Routes: Edit** a **DNS: Edit** pro tuhle zónu.

4. **Přepnout adresy v konfiguraci** (jedním commitem, ať se nerozejdou):
   - `wrangler.jsonc` → `NEXT_PUBLIC_URL` = `https://svetjmen.cz`
   - `ads-worker/wrangler.toml` → `WEB_URL` = `https://svetjmen.cz`,
     `POVOLENE_ORIGINY` už `svetjmen.cz` obsahuje
   - `NEXT_PUBLIC_ADS_API` v `.github/workflows/nasazeni.yml`
     = `https://reklama.svetjmen.cz`

   Bez tohoto kroku by kanonické odkazy a mapa webu dál ukazovaly na
   workers.dev — dvě adresy s týmž obsahem si vzájemně kazí pozici ve
   vyhledávání.

5. **Schránky** `info@svetjmen.cz` a `reklama@svetjmen.cz` — web je uvádí
   jako kontakt na provozovatele, takže musí doručovat. Cloudflare umí
   Email Routing (přeposílání na existující schránku) zdarma.

6. **Zkontrolovat**: `npm run kontrola:seo -- https://svetjmen.cz` projde
   všech 279 adres a ověří i kanonické odkazy.

## Co je hotovo a co drhne (15. 8.)

Kroky 3 a 4 jsou udělané: `wrangler.jsonc` i `ads-worker/wrangler.toml` mají
aktivní bloky `routes` s `custom_domain = true` a nasazení proběhlo bez
chyby, takže Cloudflare domény k Workerům připojil.

Zůstává krok 1–2: `svetjmen.cz` **stále neodpovídá** (HTTP 000, jméno se
nepřeloží). Zóna v Cloudflare existuje, ale u registrátora nejsou přepsané
jmenné servery na ty, které Cloudflare přidělil — dokud je stav
*Pending Nameserver Update*, doména nikam nevede, ať je v Cloudflare
nastaveno cokoli. Ověřit se to dá v Cloudflare u domény: musí svítit
*Active*.

Pozor na jednu past, která už jednou shodila oba Workery: jakmile je
v konfiguraci `routes`, wrangler **vypne adresu na `workers.dev`**, pokud
se výslovně nenechá zapnutá. Proto tam v obou souborech je `workers_dev`
(v TOML **nad** blokem `[[routes]]`, jinak se klíč zařadí dovnitř tabulky
a wrangler konfiguraci odmítne). Dokud doména neběží, jsou adresy
`*.workers.dev` jediné funkční — vypnout se smějí až potom.

Adresy v konfiguraci (`NEXT_PUBLIC_URL`, `WEB_URL`, `NEXT_PUBLIC_ADS_API`)
zatím schválně ukazují na `workers.dev`: kanonické odkazy musí vést tam,
kde web opravdu je. Přepnou se jedním commitem, až bude zóna aktivní.
