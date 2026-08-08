-- Schéma reklamní služby. Držíme jen to, co je potřeba k vystavení
-- inzerátu a k vyúčtování — nic víc.

DROP TABLE IF EXISTS inzeraty;
DROP TABLE IF EXISTS objednavky;
DROP TABLE IF EXISTS inzerenti;

CREATE TABLE inzerenti (
  id         TEXT PRIMARY KEY,
  firma      TEXT NOT NULL,
  ico        TEXT,
  email      TEXT NOT NULL,
  vytvoreno  TEXT NOT NULL
);

CREATE TABLE objednavky (
  id           TEXT PRIMARY KEY,
  inzerent_id  TEXT NOT NULL REFERENCES inzerenti(id),
  plocha       TEXT NOT NULL,          -- 'plocha-1' … 'plocha-20'
  obdobi       TEXT NOT NULL,          -- 'mesic' | 'dva' | 'tri'
  cena_kc      INTEGER NOT NULL,
  vs           TEXT NOT NULL,          -- variabilní symbol platby
  stav         TEXT NOT NULL,          -- 'ceka_na_platbu' | 'aktivni' | 'vyprsela' | 'zrusena'
  token        TEXT NOT NULL,          -- klíč k vlastní objednávce (úprava, logo, stav)
  idempotence  TEXT,                   -- klíč proti dvojímu odeslání formuláře
  plati_od     TEXT,
  plati_do     TEXT,
  vytvoreno    TEXT NOT NULL
);

CREATE TABLE inzeraty (
  id             TEXT PRIMARY KEY,
  objednavka_id  TEXT NOT NULL REFERENCES objednavky(id),
  znacka         TEXT NOT NULL,
  nadpis         TEXT NOT NULL,
  text           TEXT NOT NULL,
  cta            TEXT NOT NULL,
  odkaz          TEXT NOT NULL,
  ikona          TEXT,                 -- klíč ikony, když firma nemá logo
  logo_klic      TEXT                  -- klíč loga v úložišti, když logo má
);

CREATE INDEX idx_objednavky_plocha ON objednavky(plocha, stav);

-- Slot drží nejvýš jedna živá objednávka. Hlídá to databáze, takže dvě firmy
-- nemůžou koupit stejnou plochu ani při současném odeslání.
CREATE UNIQUE INDEX idx_objednavky_zivy_slot
  ON objednavky(plocha)
  WHERE stav IN ('ceka_na_platbu', 'aktivni');

-- Dvojí odeslání téhož formuláře vrátí původní objednávku, ne novou.
CREATE UNIQUE INDEX idx_objednavky_idempotence
  ON objednavky(idempotence)
  WHERE idempotence IS NOT NULL;
CREATE INDEX idx_objednavky_plati_do ON objednavky(plati_do);
CREATE INDEX idx_objednavky_token ON objednavky(token);
CREATE INDEX idx_inzeraty_objednavka ON inzeraty(objednavka_id);

-- Strop na počet zápisů z jedné adresy za hodinu. IP neukládáme čitelně,
-- jen její otisk; starší okna maže denní úklid.
CREATE TABLE limity (
  klic   TEXT PRIMARY KEY,
  pocet  INTEGER NOT NULL,
  okno   INTEGER NOT NULL
);

CREATE INDEX idx_limity_okno ON limity(okno);
