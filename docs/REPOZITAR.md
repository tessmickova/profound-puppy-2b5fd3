# Domovský repozitář: `tessmickova/svetjmen`

Stav k 15. 8. 2026.

Svět jmen žil ve dvou repozitářích najednou. 14. 8. to stálo pět dní práce:
nasazení postavené ze staršího repozitáře přepsalo živý web (viz
[INCIDENT-2026-08-14.md](INCIDENT-2026-08-14.md)). Tenhle dokument popisuje,
jak se to srovnalo a co zbývá udělat ručně.

## Jak to je teď

| | |
|---|---|
| domovský repozitář | `tessmickova/svetjmen` |
| vývojová větev | `claude/animal-children-names-by-country-c014s6` |
| druhý repozitář | `tessmickova/profound-puppy-2b5fd3` — jen kopie, **nenasazuje** |

Obě historie vyšly ze stejného commitu `200a1d1` a pak se rozešly. Sloučily
se zpátky: strom se vzal z větve v `profound-puppy` (obsahuje všechno, co
udělala druhá relace, jen dál rozpracované), soubory, které existovaly jen
v `svetjmen`, se doplnily zvlášť — hlídací hooky `.claude/hooks/`
a předávací zápis `docs/PREDANI-2026-08-14.md`. Nic se nezahodilo.

## Proč z kopie nic neuteče

`.github/workflows/nasazeni.yml` má podmínku:

```yaml
jobs:
  nasadit:
    if: github.repository == 'tessmickova/svetjmen'
```

Soubor je v obou repozitářích stejný, ale běh v kopii se zastaví hned
a napíše proč. Dva repozitáře nasazující týž Worker znamenají, že vyhraje
ten, který doběhl později — a přesně tak se 14. 8. přepsal živý web.

Druhá pojistka jsou hooky z `.claude/`: `nasazeni-jen-z-githubu.sh` zamítne
ruční `wrangler deploy`, dokud kód není na GitHubu, a `nahraj-na-github.sh`
po každém kroku sám nahraje hotové commity.

## Co musíte udělat vy (AI to nemůže)

1. **Tajemství do `svetjmen`.** GitHub → repozitář `svetjmen` → Settings →
   Secrets and variables → **záložka Actions** → New repository secret:
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`

   Hodnoty AI přečíst nemůže, ani ty už uložené v `profound-puppy` — musí
   se vložit ručně. Pozor na záložku: „Codespaces“ je jiné úložiště a do
   běhu Actions se odtud nedostane nic. Dokud tajemství chybí, nasazení se
   zastaví hned v prvním kroku a napíše to.

   Token, který je v `profound-puppy` uložený, prošel dřív chatem, takže se
   považuje za vyzrazený. Je to dobrá chvíle vytvořit rovnou nový
   (oprávnění: **Workers Scripts: Edit**, **D1: Edit**, **Workers Routes:
   Edit**, **DNS: Edit** pro zónu `svetjmen.cz`) a ten starý zneplatnit.

2. **Ověřit nasazení.** Ve `svetjmen` → Actions → *Nasazení na Cloudflare*
   musí běh doběhnout do zelena. Teprve pak je přesun hotový.

3. **Archivovat `profound-puppy-2b5fd3`.** GitHub → Settings → dole
   *Archive this repository*. Kód tím nezmizí, jen se repozitář uzamkne
   proti zápisu, aby v něm už nikdo — člověk ani AI — nezačal vyvíjet.
   Archivujte až po bodu 2, ne dřív.

4. **Ochrana větve** (doporučeně): ve `svetjmen` → Settings → Branches →
   Add rule na `main` a na vývojovou větev: vyžadovat úspěšné kontroly
   před sloučením.

## Kdyby bylo potřeba to vrátit

Podmínku ve workflow stačí přepsat na jiný název repozitáře. Nic jiného
není na repozitář navázané — Cloudflare Workers, D1 ani doména o GitHubu
nevědí, nasazení k nim chodí přes API token.
