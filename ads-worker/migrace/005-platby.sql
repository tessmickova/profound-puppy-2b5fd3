-- Platby přes bránu ComGate.
--
-- Do teď objednávka nesla jen variabilní symbol a čekala, až majitelka uvidí
-- peníze na výpisu. S bránou přichází potvrzení samo — a potřebuje kam zapsat,
-- která transakce objednávku zaplatila, kolik a čím.
--
-- O idempotenci platí totéž co u migrace 004: `ADD COLUMN` v SQLite nemá
-- `IF NOT EXISTS`, takže opakovaný běh skončí na `duplicate column name`
-- a databázi nechá být. Nic se nepřepíše.

ALTER TABLE objednavky ADD COLUMN transakce_id TEXT;
ALTER TABLE objednavky ADD COLUMN zaplaceno_kc INTEGER;
ALTER TABLE objednavky ADD COLUMN zaplaceno_kdy TEXT;
ALTER TABLE objednavky ADD COLUMN zpusob_platby TEXT;

-- Jedna transakce brány patří právě jedné objednávce.
--
-- Brána notifikaci opakuje, dokud nedostane `code=0&message=OK` — může tedy
-- přijít vícekrát a klidně souběžně. Unikátní index je poslední pojistka
-- proti tomu, aby se táž platba připsala dvěma objednávkám; první obranou je
-- podmínka `stav = 'ceka_na_platbu'` v aktivaci.
CREATE UNIQUE INDEX IF NOT EXISTS idx_objednavky_transakce
  ON objednavky(transakce_id)
  WHERE transakce_id IS NOT NULL;
