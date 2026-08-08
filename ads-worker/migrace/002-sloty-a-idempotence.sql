-- Rezervace slotu bez závodu a idempotentní objednávka.
--
-- Do teď se nejdřív přečetla obsazenost a teprve pak vložila objednávka —
-- dvě firmy odesílající ve stejnou vteřinu tak mohly koupit stejnou plochu.
-- Částečný unikátní index to řeší v databázi: živou objednávku smí mít
-- na jedné ploše jen jedna. Vložení druhé skončí chybou omezení, kterou
-- služba přeloží na 409.

CREATE UNIQUE INDEX IF NOT EXISTS idx_objednavky_zivy_slot
  ON objednavky(plocha)
  WHERE stav IN ('ceka_na_platbu', 'aktivni');

-- Klíč idempotence: dvojí odeslání téhož formuláře (dvojklik, obnovení
-- stránky, opakování při výpadku sítě) nesmí vytvořit dvě objednávky.
ALTER TABLE objednavky ADD COLUMN idempotence TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_objednavky_idempotence
  ON objednavky(idempotence)
  WHERE idempotence IS NOT NULL;

-- Strop na počet zápisů z jedné adresy za hodinu. IP neukládáme čitelně,
-- jen její otisk, a starší okna maže denní úklid.
CREATE TABLE IF NOT EXISTS limity (
  klic   TEXT PRIMARY KEY,
  pocet  INTEGER NOT NULL,
  okno   INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_limity_okno ON limity(okno);
