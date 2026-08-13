-- Přepínače webu spravované z adminu.
--
-- Web je statický a nasazuje se přes CI — jediné místo, kde jde něco
-- vypnout hned a bez nasazení, je tahle služba. Klíče jsou omezené
-- na známý seznam v kódu; hodnota je '1' (zapnuto) nebo '0' (vypnuto).
-- Co v tabulce není, je zapnuté — výchozí stav webu se bez adminu nemění.

CREATE TABLE IF NOT EXISTS nastaveni (
  klic     TEXT PRIMARY KEY,
  hodnota  TEXT NOT NULL,
  zmeneno  TEXT NOT NULL
);
