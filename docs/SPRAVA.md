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

2. **Založit tabulku přepínačů** na ostré databázi a nasadit službu:

   ```bash
   cd ads-worker
   npm run db:migrace
   npm run deploy
   ```

3. **Vyměnit vyzrazené tokeny** (Cloudflare API token, GitHub token) —
   podrobný postup je v auditu na `/sprava`, sekce Bezpečnost.

4. **Doplnit skutečné údaje provozovatele** — patička webu
   (`components/names/Paticka.tsx`) a `ads-worker/wrangler.toml`
   (účet, firma, IČO, sídlo, e-mail). Bez toho neprodávat reklamu.

5. **Zapnout ochranu větve** na GitHubu (Settings → Branches): vyžadovat
   pull request s vaším schválením. Od té chvíle AI může jen navrhovat —
   do produkce nic nedoputuje bez vašeho kliknutí.

## Běžný provoz

- **Došla platba za reklamu** → `/sprava` → u objednávky „Platba došla".
  Kampaň se rozsvítí do 5 minut.
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
