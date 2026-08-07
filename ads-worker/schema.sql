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
  plocha       TEXT NOT NULL,          -- např. 'deti-bocni'
  obdobi       TEXT NOT NULL,          -- 'mesic' | 'pulrok' | 'rok'
  cena_kc      INTEGER NOT NULL,
  vs           TEXT NOT NULL,          -- variabilní symbol platby
  stav         TEXT NOT NULL,          -- 'ceka_na_platbu' | 'aktivni' | 'vyprsela' | 'zrusena'
  token        TEXT NOT NULL,          -- klíč k vlastní objednávce (úprava, logo, stav)
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
CREATE INDEX idx_objednavky_plati_do ON objednavky(plati_do);
CREATE INDEX idx_objednavky_token ON objednavky(token);
CREATE INDEX idx_inzeraty_objednavka ON inzeraty(objednavka_id);
