// Plemena psů a koček s vlastnostmi, podle kterých se párují vhodná jména.

import type { Plemeno } from './types'

export const PLEMENA_PSU: Plemeno[] = [
  { nazev: 'Labradorský retrívr',       druh: 'pes', velikost: 'velké',   energie: 'živá',     styly: ['hravé', 'sportovní'],      puvod: 'gb', popis: 'Věčné štěně s dobrým srdcem — hodí se přátelská, hravá jména.' },
  { nazev: 'Zlatý retrívr',             druh: 'pes', velikost: 'velké',   energie: 'vyvážená', styly: ['hravé', 'tradiční'],       puvod: 'gb', popis: 'Rodinný dobrák — sluší mu hřejivá, laskavá jména.' },
  { nazev: 'Německý ovčák',             druh: 'pes', velikost: 'velké',   energie: 'živá',     styly: ['tradiční', 'královské'],   puvod: 'de', popis: 'Ochránce a pracant — nese důstojná, pevná jména.' },
  { nazev: 'Francouzský buldoček',      druh: 'pes', velikost: 'malé',    energie: 'klidná',   styly: ['hravé', 'elegantní'],      puvod: 'fr', popis: 'Gaučový šarmér — sedí mu vtipná i pařížsky elegantní jména.' },
  { nazev: 'Čivava',                    druh: 'pes', velikost: 'malé',    energie: 'živá',     styly: ['hravé', 'moderní'],        puvod: 'es', popis: 'Malé tělo, velké ego — kontrastní a temperamentní jména fungují skvěle.' },
  { nazev: 'Jezevčík',                  druh: 'pes', velikost: 'malé',    energie: 'vyvážená', styly: ['tradiční', 'hravé'],       puvod: 'de', popis: 'Tvrdohlavý lovec v malém balení — klasická i šibalská jména.' },
  { nazev: 'Pudl',                      druh: 'pes', velikost: 'střední', energie: 'vyvážená', styly: ['elegantní', 'moderní'],    puvod: 'fr', popis: 'Inteligence a noblesa — elegantní jména jsou sázka na jistotu.' },
  { nazev: 'Border kolie',              druh: 'pes', velikost: 'střední', energie: 'živá',     styly: ['sportovní', 'přírodní'],   puvod: 'gb', popis: 'Nejchytřejší pes světa — krátká, akční jména na povel.' },
  { nazev: 'Jack Russell teriér',       druh: 'pes', velikost: 'malé',    energie: 'živá',     styly: ['hravé', 'sportovní'],      puvod: 'gb', popis: 'Neřízená střela — jméno musí stíhat jeho tempo.' },
  { nazev: 'Yorkšírský teriér',         druh: 'pes', velikost: 'malé',    energie: 'živá',     styly: ['elegantní', 'hravé'],      puvod: 'gb', popis: 'Mašle a kuráž — drobná elegantní jména.' },
  { nazev: 'Mops',                      druh: 'pes', velikost: 'malé',    energie: 'klidná',   styly: ['hravé'],                   puvod: 'de', popis: 'Chrochtavý pohodář — roztomilá a vtipná jména.' },
  { nazev: 'Bígl',                      druh: 'pes', velikost: 'střední', energie: 'živá',     styly: ['hravé', 'tradiční'],       puvod: 'gb', popis: 'Nos na stopě, uši ve větru — veselá jména.' },
  { nazev: 'Sibiřský husky',            druh: 'pes', velikost: 'velké',   energie: 'živá',     styly: ['přírodní', 'mytologické'], puvod: 'se', popis: 'Vlčí vzhled, toulavé srdce — severská a přírodní jména.' },
  { nazev: 'Bernský salašnický pes',    druh: 'pes', velikost: 'velké',   energie: 'klidná',   styly: ['tradiční', 'přírodní'],    puvod: 'de', popis: 'Huňatý dobrák z hor — klidná, hřejivá jména.' },
  { nazev: 'Kavalír King Charles španěl', druh: 'pes', velikost: 'malé',  energie: 'klidná',   styly: ['královské', 'elegantní'],  puvod: 'gb', popis: 'Královský mazel — vznešená jména má v rodokmenu.' },
  { nazev: 'Německá doga',              druh: 'pes', velikost: 'velké',   energie: 'klidná',   styly: ['královské', 'tradiční'],   puvod: 'de', popis: 'Něžný obr — velkolepé jméno unese levou zadní.' },
  { nazev: 'Shiba inu',                 druh: 'pes', velikost: 'střední', energie: 'vyvážená', styly: ['přírodní', 'tradiční'],    puvod: 'jp', popis: 'Liščí samuraj s vlastní hlavou — japonská jména mu sluší nejvíc.' },
  { nazev: 'Australský ovčák',          druh: 'pes', velikost: 'střední', energie: 'živá',     styly: ['sportovní', 'přírodní'],   puvod: 'au', popis: 'Pastevec s modrýma očima — akční jména z divočiny.' },
]

export const PLEMENA_KOCEK: Plemeno[] = [
  { nazev: 'Britská krátkosrstá', druh: 'kocka', energie: 'klidná',   styly: ['tradiční', 'královské'],   puvod: 'gb', popis: 'Plyšový gentleman — důstojná britská jména.' },
  { nazev: 'Mainská mývalí',      druh: 'kocka', energie: 'vyvážená', styly: ['přírodní', 'mytologické'], puvod: 'us', popis: 'Něžný obr — velká jména pro velkou kočku.' },
  { nazev: 'Siamská',             druh: 'kocka', energie: 'živá',     styly: ['elegantní', 'moderní'],    puvod: 'jp', popis: 'Upovídaná elegance — melodická exotická jména.' },
  { nazev: 'Ragdoll',             druh: 'kocka', energie: 'klidná',   styly: ['elegantní', 'hravé'],      puvod: 'us', popis: 'Hadrová panenka na klíně — něžná mazlivá jména.' },
  { nazev: 'Perská',              druh: 'kocka', energie: 'klidná',   styly: ['královské', 'elegantní'],  puvod: 'eg', popis: 'Aristokratka s hřívou — vznešená orientální jména.' },
  { nazev: 'Bengálská',           druh: 'kocka', energie: 'živá',     styly: ['přírodní', 'sportovní'],   puvod: 'us', popis: 'Leopard v obýváku — divoká přírodní jména.' },
  { nazev: 'Norská lesní',        druh: 'kocka', energie: 'vyvážená', styly: ['mytologické', 'přírodní'], puvod: 'se', popis: 'Vikingská kočka — severská mytologie jak dělaná.' },
  { nazev: 'Ruská modrá',         druh: 'kocka', energie: 'klidná',   styly: ['elegantní'],               puvod: 'se', popis: 'Stříbrná tichost — jemná elegantní jména.' },
  { nazev: 'Sphynx',              druh: 'kocka', energie: 'živá',     styly: ['mytologické', 'moderní'],  puvod: 'eg', popis: 'Bezsrstá záhada — egyptská jména jsou povinnost.' },
  { nazev: 'Evropská krátkosrstá', druh: 'kocka', energie: 'vyvážená', styly: ['tradiční', 'hravé'],      puvod: 'cz', popis: 'Domácí poklad — klasická jména od Mikeše po Micku.' },
]

export const VSECHNA_PLEMENA = [...PLEMENA_PSU, ...PLEMENA_KOCEK]
