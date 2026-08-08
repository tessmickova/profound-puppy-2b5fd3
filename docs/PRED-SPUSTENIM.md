# Před spuštěním do produkce

Web se dá nasadit jako náhled kdykoli. **Produkční build ale schválně spadne**,
dokud nejsou doplněné údaje níž — jinak by na webu i na fakturách zůstalo
`VYPLNIT s.r.o.` a `IČO 00000000`.

Zkontrolovat se to dá takhle:

```bash
NEXT_PUBLIC_PRODUKCE=1 npm run build
```

## Co musí doplnit majitel projektu

Všechno na jednom místě — proměnné v `wrangler.jsonc` (klíč `vars`) pro web
a v `ads-worker/wrangler.toml` (sekce `[vars]`) pro reklamní službu.
Žádný z těch údajů si nevymýšlíme.

| Proměnná | Kde | Co to je |
|---|---|---|
| `NEXT_PUBLIC_URL` | web | skutečná produkční doména přes `https://` |
| `NEXT_PUBLIC_PROVOZOVATEL` | web + služba (`PROVOZOVATEL`) | obchodní firma z rejstříku |
| `NEXT_PUBLIC_ICO` | web + služba (`PROVOZOVATEL_ICO`) | IČO, osm číslic |
| `NEXT_PUBLIC_SIDLO` | web + služba (`PROVOZOVATEL_SIDLO`) | sídlo tak, jak patří na fakturu |
| `NEXT_PUBLIC_DIC` | web + služba (`PROVOZOVATEL_DIC`) | DIČ; prázdné, když nejste plátci |
| `NEXT_PUBLIC_PLATCE_DPH` | web | `1` = plátce DPH, `0` = neplátce |
| `NEXT_PUBLIC_KONTAKT` | web | kontaktní e-mail |
| `NEXT_PUBLIC_KONTAKT_REKLAMA` | web + služba (`PROVOZOVATEL_EMAIL`) | e-mail pro inzerenty |
| `NEXT_PUBLIC_UCET` | web + služba (`BANKOVNI_UCET`) | číslo účtu pro platby za reklamu |
| `WEB_URL` | služba | adresa webu — odsud vedou odkazy na podmínky a soukromí |
| `POVOLENE_ORIGINY` | služba | domény, ze kterých smí web volat API |

Navíc:

```bash
cd ads-worker && npx wrangler secret put ADMIN_TOKEN
```

Bez `ADMIN_TOKEN` admin routy všechno odmítají — nedá se tedy potvrdit platba
a rozsvítit kampaň.

## Co ještě patří k právníkovi

Tyhle věci jsme v textech označili, ale doplnit je musí člověk:

- **Zpracovatelská smlouva s Cloudflare** — odkaz do `/soukromi`. Web běží na
  Cloudflare Workers, D1 a R2, takže zpracování může proběhnout i mimo EU.
  Tvrzení „všechna data zůstávají v EU" jsme z textu odstranili, protože
  u téhle architektury není pravdivé.
- **Další zpracovatelé** — poskytovatel e-mailu, účetní software.
- **DPH** — v podmínkách se text mění podle `NEXT_PUBLIC_PLATCE_DPH`.
  Zkontrolujte, že sedí.
- **Reklama je B2B.** V podmínkách je uvedeno, že se prodává jen podnikatelům
  a spotřebitelské odstoupení do 14 dnů se neuplatní. Nechte si to potvrdit.

## Doména a náhled

Dokud `NEXT_PUBLIC_URL` míří na `workers.dev` nebo `localhost`, web se
**sám označí za náhled**: `robots.txt` zakáže indexaci celého webu a mapa
stránek je prázdná. Vedle produkční domény tak nemůže vzniknout druhá
indexovatelná kopie. Po překlopení domény stačí změnit tuhle jedinou
proměnnou.
