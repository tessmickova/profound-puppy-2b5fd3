# Správa Světa jmen — příručka majitelky

Všechno důležité je vidět na stránce **`/sprava`** přímo na webu: objednávky
reklamy, přepínače funkcí a stálý audit (bezpečnost, právo, peníze,
doporučení). Tenhle soubor popisuje jen to, co se dělá mimo web.

## Zprovoznění správy (jednorázově)

1. **Nastavit admin token** — jediný klíč k živé správě:

   ```bash
   cd ads-worker
   npx wrangler secret put ADMIN_TOKEN     # vložit dlouhý náhodný řetězec
   ```

   Token uložte do správce hesel. Bez něj admin API odmítá všechno.

2. **Doplnit databázi** o to, co v kódu přibylo, a nasadit službu:

   ```bash
   cd ads-worker
   npm run db:migrace     # pustí všechny migrace v pořadí, opakovat nevadí
   npm run deploy
   ```

   **Po migraci `004` čekají na schválení i kampaně, které do té chvíle
   běžely.** Je to schválně — bezpečný směr je radši nic neukázat. Projděte
   je jednou na `/sprava` a schvalte.

3. **Zapnout platbu kartou** — nepovinné. Bez toho se prodává převodem
   s variabilním symbolem, přesně jako dosud.

   ```bash
   cd ads-worker
   npx wrangler secret put COMGATE_SECRET   # tajemství z portálu ComGate
   ```

   K tomu vyplnit `COMGATE_MERCHANT` ve `wrangler.toml` (sekce `[vars]`)
   a v portálu ComGate nastavit dvě adresy — v kódu být nemůžou:

   - notifikace: `https://<adresa-sluzby>/api/platba/notifikace`
   - návrat: `https://<adresa-sluzby>/api/platba/navrat`

   Nechte `COMGATE_TEST = "true"`, projděte celou objednávku nanečisto,
   a teprve pak přepněte na `"false"`. Skutečné tajemství nikdy nepatří
   do repozitáře, jen do `wrangler secret`.

4. **Vyměnit vyzrazené tokeny** (Cloudflare API token, GitHub token) —
   podrobný postup je v auditu na `/sprava`, sekce Bezpečnost.

5. **Doplnit skutečné údaje provozovatele** — patička webu
   (`components/names/Paticka.tsx`) a `ads-worker/wrangler.toml`
   (účet, firma, IČO, sídlo, e-mail). Bez toho neprodávat reklamu.

6. **Zapnout ochranu větve** na GitHubu (Settings → Branches): vyžadovat
   pull request s vaším schválením. Od té chvíle AI může jen navrhovat —
   do produkce nic nedoputuje bez vašeho kliknutí.

## Běžný provoz

- **Přišla nová objednávka** → `/sprava` → „Čeká na schválení". Přečtěte
  text a **klikněte na cílový odkaz** — text bývá v pořádku a odkaz vede
  jinam. Pak Schválit, nebo Zamítnout s důvodem (inzerent ho uvidí ve svém
  účtu a text opraví). Do schválení není inzerát na webu vidět, ani když je
  zaplacený. Po schválení se objeví do 5 minut.
- **Inzerent si upravil text** → kreativa se sama vrátí mezi čekající.
  Je to schválně: jinak by stačilo nechat si schválit slušný inzerát
  a hned nato do něj napsat cokoli.
- **Došla platba převodem** → `/sprava` → u objednávky „Platba došla".
  Platby kartou přes bránu se potvrzují samy, klikat na ně nemusíte.
- **Něco chci vypnout** (reklamy, panel, analýzu) → `/sprava` → Přepínače.
  Projeví se do minuty, nic se nemaže.
- **Nasazení webu** — samo při každém pushi do větve; průběh je v GitHub
  → Actions. Reklamní služba se nasazuje ručně (`npm run deploy`
  v `ads-worker`), protože se mění zřídka.
- **Kdo se stará o prošlé kampaně** — nikdo, cron je zhasíná denně po
  půlnoci sám. Tlačítko „Uklidit prošlé" v adminu je jen pro netrpělivé.

## Kde co najdu

| Co | Kde |
|---|---|
| Audit (bezpečnost, právo, peníze, doporučení) | web `/sprava`, zdroj `lib/names/audit.ts` |
| Objednávky a přepínače | web `/sprava` (potřeba ADMIN_TOKEN) |
| Nákupní tok reklamy, ceník | `docs/REKLAMY.md` |
| Nasazení a tajemství | `docs/NASAZENI.md` |
| Kontrola před spuštěním | `docs/PRED-SPUSTENIM.md` |

Audit v `lib/names/audit.ts` je součást repozitáře: každá jeho změna
projde Gitem a je dohledatelná v historii. Když se něco vyřeší (třeba
rotace tokenů), přepněte položce stav na `podchyceno` — klidně požádejte
AI, ale změna projde vaším schválením jako každá jiná.
