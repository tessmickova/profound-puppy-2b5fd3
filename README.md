# Svět jmen

Web, který pomáhá vybrat jméno — pro dítě i pro zvíře. Ukáže, jak jméno ladí
s příjmením a se jmény sourozenců, co znamená, jak je oblíbené a jak zní ve
světě. Česky, bez vymyšlených statistik: každé doporučení umí říct proč.

**Tohle je domovský repozitář projektu.** Nasazuje se jen odsud — viz
[docs/REPOZITAR.md](docs/REPOZITAR.md).

## Kde to běží

| Adresa | Co to je |
|---|---|
| `svetjmen.cz` | web — hlavní adresa |
| `reklama.svetjmen.cz` | reklamní služba |
| `*.tereza-holtzerova.workers.dev` | tytéž dva Workery jako záloha, viz [docs/DOMENA.md](docs/DOMENA.md) |
| `/sprava` | správa: objednávky reklam, přepínače funkcí, audit projektu |

Technicky: Next.js 16 + React 19 + Tailwind 4, sestavené přes OpenNext
a běžící na Cloudflare Workers. Reklamní služba je samostatný Worker nad
D1 a R2. Žádný Vercel, Netlify ani Pages — jen Workers.

## Práce s projektem

```bash
npm install
npm run dev            # vývojový server
npm run kontrola       # typy + kontrola dat + testy (totéž, co pouští CI)
npm run cf:build       # sestavení pro Cloudflare
npm run kontrola:seo -- https://svetjmen.cz
```

Nasazuje **výhradně** GitHub Actions při pushi do `main` nebo do vývojové
větve. Ručně `wrangler deploy` nespouštějte: hook `.claude/hooks/` ho
zamítne, dokud kód není na GitHubu — po incidentu ze 14. 8. 2026, kdy
nasazení ze zastaralého repozitáře přepsalo novější živý web
([docs/INCIDENT-2026-08-14.md](docs/INCIDENT-2026-08-14.md)).

## Tajemství

Do repozitáře nikdy nepatří žádný token ani heslo.

| Kam | Co |
|---|---|
| GitHub → Settings → Secrets → **Actions** | `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` |
| `wrangler secret put` v `ads-worker/` | `ADMIN_TOKEN`, `COMGATE_SECRET` |

## Dokumentace

| Soubor | O čem |
|---|---|
| [REPOZITAR.md](docs/REPOZITAR.md) | domovský repozitář a co zbývá udělat ručně |
| [NASAZENI.md](docs/NASAZENI.md) | jak se nasazuje |
| [DOMENA.md](docs/DOMENA.md) | zapojení `svetjmen.cz` |
| [REKLAMY.md](docs/REKLAMY.md) | prodej a schvalování inzerce |
| [SPRAVA.md](docs/SPRAVA.md) | co umí `/sprava` |
| [PRED-SPUSTENIM.md](docs/PRED-SPUSTENIM.md) | co musí být hotové před ostrým provozem |
| [INCIDENT-2026-08-14.md](docs/INCIDENT-2026-08-14.md) | co se stalo a jaká pravidla z toho platí |
| [ODSTRANENI-AURORADOG.md](docs/ODSTRANENI-AURORADOG.md) | druhý projekt, který odsud odešel, a jak ho vrátit |
