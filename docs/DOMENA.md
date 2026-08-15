# Doména svetjmen.cz — co kam patří

Stav k 15. 8. 2026: zóna je v Cloudflare **Active**, domény jsou připojené
k Workerům a web se nasazuje na `svetjmen.cz` jako na hlavní adresu.

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
Workers. `vercel.json` je pozůstatek a nic neřídí (`netlify.toml` je pryč).

## Zapojení, krok za krokem

(Kroky 1–4 a 6 jsou hotové, zůstávají **schránky, krok 5**. Popis nechávám
kvůli tomu, aby se dal postup zopakovat u další domény.)

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

## Hotovo (15. 8.)

Adresy v konfiguraci ukazují na doménu:

| Kde | Hodnota |
|---|---|
| `wrangler.jsonc` → `NEXT_PUBLIC_URL` | `https://svetjmen.cz` |
| `wrangler.jsonc` → `NEXT_PUBLIC_ADS_API` | `https://reklama.svetjmen.cz` |
| `ads-worker/wrangler.toml` → `WEB_URL` | `https://svetjmen.cz` |
| `nasazeni.yml` → `NEXT_PUBLIC_ADS_API` | `https://reklama.svetjmen.cz` |

Tím se web zároveň přestal tvářit jako náhled: `JE_NAHLED` v `lib/config.ts`
pozná produkci podle adresy, takže se teprve teď vydává mapa webu a robots
povoluje indexování.

Adresy `*.workers.dev` zůstávají funkční jako záloha. Druhá kopie webu
v indexu z nich nevzniká — kanonické odkazy z nich vedou na `svetjmen.cz`.

Nasazení si doménu ověřuje samo: krok *Kontrola domény* v `nasazeni.yml`
zkusí `svetjmen.cz`, `www.svetjmen.cz` i `reklama.svetjmen.cz` **před**
sestavením. Kdyby doména vypadla, nenasadí se nic a poběží dál to, co běželo.

## Past, která už jednou shodila oba Workery

Jakmile je v konfiguraci `routes`, wrangler **vypne adresu na `workers.dev`**,
pokud se výslovně nenechá zapnutá. Proto je v obou souborech `workers_dev`
— a v TOML **nad** blokem `[[routes]]`: pod ním by se klíč zařadil dovnitř
tabulky trasy a wrangler by konfiguraci odmítl. Obojí se stalo 15. 8.
a web byl kvůli tomu chvíli nedostupný.
