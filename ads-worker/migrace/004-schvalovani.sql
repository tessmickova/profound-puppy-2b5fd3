-- Schválení kreativy majitelkou. Zaplacení ≠ zveřejnění.
--
-- Do teď platilo, že zaplacená objednávka rovnou svítí na webu. To je špatně:
-- text a odkaz píše cizí firma a odpovědnost za to, co návštěvník uvidí, nese
-- provozovatel. Kreativa se proto zobrazí až tehdy, když ji někdo přečte
-- a schválí.
--
-- Proč sloupce u `inzeraty` a ne vlastní tabulka `schvaleni`: schválení je
-- vlastnost té konkrétní kreativy, ne samostatná entita. A hlavně — o zobrazení
-- rozhoduje jediný dotaz v `src/db.ts`. Kdyby stav ležel ve druhé tabulce,
-- musel by se na ni v tom dotazu nezapomenout připojit JOINem; zapomenutý JOIN
-- je tiché selhání (kreativa se ukáže neschválená), zapomenutý sloupec je
-- hlasitá chyba už při dotazu. Volíme to, co selže nahlas.
--
-- O idempotenci: SQLite (a tedy D1) nezná `ADD COLUMN IF NOT EXISTS`. Migrace
-- je psaná tak, že opakované spuštění nemůže uškodit — první příkaz skončí
-- hláškou `duplicate column name: schvaleno`, dávka se zastaví a databáze
-- zůstane přesně v tom stavu, v jakém byla, tedy hotová. Žádné schválení se
-- nepřepíše, nic se nesmaže. Tu chybu při druhém běhu je bezpečné ignorovat.
-- (Kdyby migrace kdy skončila v půli, ukáže `PRAGMA table_info(inzeraty);`,
-- které sloupce chybí, a doplní se jednotlivě.)
--
-- POZOR na následek: hned po migraci mají všechny kreativy `schvaleno = 0`,
-- tedy i ty, které dnes běží. Je to schválně — bezpečný směr je „radši nic
-- neukázat". Po migraci je potřeba běžící kampaně v adminu schválit.

ALTER TABLE inzeraty ADD COLUMN schvaleno INTEGER NOT NULL DEFAULT 0;
ALTER TABLE inzeraty ADD COLUMN zamitnuto_duvod TEXT;
ALTER TABLE inzeraty ADD COLUMN schvaleno_kdy TEXT;

-- Admin se ptá „co čeká na schválení" při každém načtení přehledu —
-- ať kvůli tomu nemusí projít celou tabulku.
CREATE INDEX IF NOT EXISTS idx_inzeraty_schvaleno ON inzeraty(schvaleno);
