// lib/observationSpots.ts
// Top 5 konkrétních pozorovacích míst pro každou lokalitu v CZ_LOCATIONS.
// Místa vybrána na základě: tmavé oblohy, volný severní horizont, přístupnost,
// terén vhodný pro stativ, minimální světelné znečištění z okolí.

export interface ObservationSpot {
  /** Název místa / orientačního bodu */
  name: string
  /** Stručný popis proč je místo vhodné */
  why: string
  /** GPS souřadnice */
  lat: number
  lon: number
}

/**
 * Mapa: klíč = name z CZ_LOCATIONS, hodnota = 5 doporučených pozorovacích míst.
 * Každé místo je konkrétní bod (rozhledna, kopec, louka, hráz, parkoviště…),
 * kde je dobrý výhled na sever, nízké světelné znečištění a snadný přístup.
 */
export const OBSERVATION_SPOTS: Record<string, ObservationSpot[]> = {

  // ══════════════════════════════════════════════════════════════════════════
  // STŘEDOČESKÝ
  // ══════════════════════════════════════════════════════════════════════════

  'Praha': [
    { name: 'Petřín – Hladová zeď', why: 'Volný výhled na sever přes Hradčany, terasa nad městem', lat: 50.0812, lon: 14.3935 },
    { name: 'Divoká Šárka – vstup u Džbánu', why: 'Údolí stíní městské osvětlení, otevřený sever', lat: 50.0950, lon: 14.3330 },
    { name: 'Ládví – vyhlídka u vysílače', why: 'Nejvyšší bod severní Prahy, panorama na sever', lat: 50.1230, lon: 14.4600 },
    { name: 'Hostivařská přehrada – severní břeh', why: 'Vodní plocha bez zástavby na severu, tmavší obloha', lat: 50.0540, lon: 14.5350 },
    { name: 'Letiště Točná – okraj plošiny', why: 'Opuštěná plocha, minimální překážky na horizontu', lat: 49.9990, lon: 14.3870 },
  ],

  'Kladno': [
    { name: 'Halda Tuchlovice', why: 'Vyvýšený bod bez zástavby, panoramatický výhled', lat: 50.1350, lon: 13.9930 },
    { name: 'Slanský vrch – rozhledna', why: 'Rozhledna s 360° výhledem, dobrý sever', lat: 50.2280, lon: 14.0870 },
    { name: 'Lidice – memoriál (pole nad vsí)', why: 'Otevřená krajina severně, minimální světla', lat: 50.1580, lon: 14.1890 },
    { name: 'Lánská obora – okraj u silnice', why: 'Lesní rezervace, výhled v průsecích, tmavá obloha', lat: 50.0840, lon: 13.9500 },
    { name: 'Unhošť – pole u Háje', why: 'Rovná zemědělská krajina, volný horizont na sever', lat: 50.0920, lon: 14.1300 },
  ],

  'Mladá Boleslav': [
    { name: 'Chlum u Mladé Boleslavi – vrch', why: 'Kopec 306 m nad městem, výhled na sever k Jizerským horám', lat: 50.4400, lon: 14.9100 },
    { name: 'Bakov nad Jizerou – lávka přes Jizeru', why: 'Vodní plocha redukuje rozptyl, otevřený severní obzor', lat: 50.4830, lon: 14.9420 },
    { name: 'Bezděz – úbočí hradu', why: 'Ikonická silueta, z parkoviště volný výhled na SZ', lat: 50.5370, lon: 14.7220 },
    { name: 'Letiště Mladá Boleslav – okraj', why: 'Rovná plocha bez překážek, tmavší periferie', lat: 50.4250, lon: 14.8900 },
    { name: 'Strenický rybník – hráz', why: 'Odraz světla na hladině, klid, nízké okolní osvětlení', lat: 50.3650, lon: 14.8300 },
  ],

  'Kolín': [
    { name: 'Veltrubský kopec', why: 'Otevřené pole nad Labem, volný sever', lat: 50.0580, lon: 15.1600 },
    { name: 'Býchory – polní cesta u rybníka', why: 'Rovina, žádná zástavba na severu, tmavý horizont', lat: 50.0100, lon: 15.2700 },
    { name: 'Ratboř – nad vsí', why: 'Mírná vyvýšenina s panoramatem, minimální světla', lat: 49.9800, lon: 15.2200 },
    { name: 'Ovčáry – pole severně od obce', why: 'Maximální otevřenost, rovný terén pro stativ', lat: 50.0750, lon: 15.2500 },
    { name: 'Labský břeh u Velkého Oseka', why: 'Říční niva, přírodní tma, výhled podél toku na SSZ', lat: 50.1100, lon: 15.1800 },
  ],

  'Kutná Hora': [
    { name: 'Kuklík – rozhledna', why: 'Rozhledna na kopci, 360° výhled, dobrá tma', lat: 49.9300, lon: 15.3200 },
    { name: 'Kaňk – vrch nad městem', why: 'Historické místo, otevřený výhled na sever přes pole', lat: 49.9650, lon: 15.2800 },
    { name: 'Opatovický rybník – hráz', why: 'Vodní hladina, odlesky aurory, klid', lat: 49.9100, lon: 15.3500 },
    { name: 'Malešov – pole nad vsí', why: 'Rovina bez zástavby, minimální světelné znečištění', lat: 49.8900, lon: 15.2100 },
    { name: 'Sedlec – pole za klášterem', why: 'Nízká zástavba, otevřený severní horizont', lat: 49.9700, lon: 15.2700 },
  ],

  'Příbram': [
    { name: 'Svatá Hora – vyhlídka', why: 'Poutní místo na kopci, výhled přes Příbramskou kotlinu', lat: 49.6950, lon: 14.0000 },
    { name: 'Třemošná – pole nad obcí', why: 'Otevřená rovina nad údolím, tmavý sever', lat: 49.7200, lon: 14.0300 },
    { name: 'Letiště Dlouhá Lhota', why: 'Malé letiště, rovný horizont, minimální světla', lat: 49.7100, lon: 14.0600 },
    { name: 'Brdy – Kolvín (okraj VÚ)', why: 'Bývalý vojenský prostor, extrémně tmavá obloha', lat: 49.7400, lon: 13.9300 },
    { name: 'Tochovice – rybník u obce', why: 'Vodní hladina, nízké okolní osvětlení', lat: 49.6500, lon: 13.9600 },
  ],

  'Mělník': [
    { name: 'Soutok Labe a Vltavy – vyhlídka', why: 'Ikonické místo, vodní plochy, severní výhled podél Labe', lat: 50.3510, lon: 14.4740 },
    { name: 'Říp – úbočí', why: 'Kopec v rovině, z úbočí panorama na SSZ, tmavší okolí', lat: 50.3870, lon: 14.2900 },
    { name: 'Kokořínsko – vyhlídka Kokořín', why: 'Přírodní park, skálové útvary, nízké znečištění', lat: 50.4410, lon: 14.5700 },
    { name: 'Vehlovice – pole nad vsí', why: 'Rovina, otevřený sever, bez rušivých světel', lat: 50.3800, lon: 14.5100 },
    { name: 'Vidim – kopec nad obcí', why: 'Vyvýšenina v Kokořínsku, tmavá obloha', lat: 50.4200, lon: 14.5600 },
  ],

  'Beroun': [
    { name: 'Městská hora – vrch nad Berounem', why: 'Dominantní kopec, výhled na sever přes údolí Berounky', lat: 49.9700, lon: 14.0600 },
    { name: 'Tetín – vyhlídka nad Berounkou', why: 'Skalní ostroh s panoramatem, nízké znečištění od města', lat: 49.9570, lon: 14.1000 },
    { name: 'Karlštejn – pole nad hradem', why: 'Nad údolím, z pol severní výhled, dostupné parkoviště', lat: 49.9370, lon: 14.1880 },
    { name: 'Zdice – pole za nádražím', why: 'Rovná krajina, volný horizont na sever', lat: 49.9100, lon: 13.9800 },
    { name: 'Svárov – okraj lesa', why: 'Les stíní Beroun, otevřený výhled na SZ', lat: 49.9850, lon: 14.0350 },
  ],

  // ══════════════════════════════════════════════════════════════════════════
  // JIHOMORAVSKÝ
  // ══════════════════════════════════════════════════════════════════════════

  'Brno': [
    { name: 'Hády – lom (vyhlídka)', why: 'Nejvyšší bod východního Brna, volný SV výhled, odvráceno od centra', lat: 49.2200, lon: 16.6700 },
    { name: 'Brněnská přehrada – hráz', why: 'Vodní plocha redukuje rozptyl, severní panorama nad přehradou', lat: 49.2360, lon: 16.5120 },
    { name: 'Babí lom u Lelekovic', why: 'Vyhlídka v lese 15 min z Brna, tmavý sever', lat: 49.2800, lon: 16.5500 },
    { name: 'Palackého vrch (Žlutý kopec)', why: 'Park nad městem, přístupný v noci, záře na S horizontu', lat: 49.1970, lon: 16.5880 },
    { name: 'Podkomorské lesy – Újezd u Brna rozcestí', why: 'Lesní cesty, 12 km od centra, Bortle 5–6', lat: 49.1500, lon: 16.7500 },
  ],

  'Znojmo': [
    { name: 'Kraví hora u Znojma', why: 'Vyvýšenina nad Dyjí, výhled na sever přes pole', lat: 48.8700, lon: 16.0300 },
    { name: 'Šobes – vyhlídka nad vinicí', why: 'Národní přírodní památka, tmavá obloha, sever podél Dyje', lat: 48.8200, lon: 15.9700 },
    { name: 'Konice – pole nad vsí', why: 'Rovina, žádná zástavba na severu, zemědělská krajina', lat: 48.8900, lon: 16.0800 },
    { name: 'Hnánice – vinařská vyhlídka', why: 'Okraj NP Podyjí, tmavá obloha, panorama', lat: 48.7900, lon: 15.9900 },
    { name: 'Havranické vřesoviště', why: 'Otevřená step, 360° horizont, minimální osvětlení', lat: 48.8100, lon: 16.0100 },
  ],

  'Hodonín': [
    { name: 'Mutěnické kopce – vinice', why: 'Otevřená vyvýšenina, výhled na SZ, tmavá obloha', lat: 48.9100, lon: 17.0300 },
    { name: 'Hodonínská Dúbrava – okraj lesa', why: 'Přírodní rezervace, minimální světla z okolí', lat: 48.8700, lon: 17.0800 },
    { name: 'Ratíškovice – pole nad rybníkem', why: 'Rovina, vodní plocha zlepšuje kontrast', lat: 48.9050, lon: 17.1600 },
    { name: 'Čejkovice – nad Templářskými sklepy', why: 'Vinařský kopec, otevřený sever', lat: 48.9200, lon: 16.9600 },
    { name: 'Lužní les u Tvrdonic', why: 'Přírodní oblast, tmavý horizont k severu', lat: 48.7600, lon: 17.0700 },
  ],

  'Břeclav': [
    { name: 'Soutok – soutok Moravy a Dyje', why: 'Nejjižnější bod ČR, lužní lesy, extrémně tmavá obloha', lat: 48.6100, lon: 16.9600 },
    { name: 'Lednické rybníky – hráz Nesytu', why: 'Největší rybník na Moravě, vodní plocha, volný sever', lat: 48.7700, lon: 16.7200 },
    { name: 'Pohansko – pole za zámečkem', why: 'Otevřená rovina, bez zástavby, tmavý horizont', lat: 48.7300, lon: 16.8700 },
    { name: 'Bulhary – vinařské kopce', why: 'Vyvýšenina nad Pálavou, severní výhled', lat: 48.8000, lon: 16.7500 },
    { name: 'Mikulčice – u hradiska', why: 'Rovná niva, historické místo, žádné rušivé osvětlení', lat: 48.8050, lon: 17.0500 },
  ],

  'Blansko': [
    { name: 'Hořice u Blanska – kopec nad vsí', why: 'Výhled na sever přes Moravský kras, tmavá obloha', lat: 49.3900, lon: 16.6800 },
    { name: 'Veselice – vyhlídka Macocha', why: 'Nad propastí, otevřený horizontu, turistický bod', lat: 49.3720, lon: 16.7300 },
    { name: 'Jedovnice – hráz rybníka Olšovec', why: 'Vodní plocha, klidné místo, severní výhled', lat: 49.3450, lon: 16.7500 },
    { name: 'Skalní mlýn – parkoviště', why: 'Údolí stíní záři Blanska, tmavý sever', lat: 49.3620, lon: 16.7100 },
    { name: 'Rudice – pole nad vesnicí', why: 'Krasová plošina, minimální zástavba, tmavá obloha', lat: 49.3500, lon: 16.7400 },
  ],

  'Vyškov': [
    { name: 'Drysice – pole nad obcí', why: 'Rovina, otevřený severní horizont, bez zástavby', lat: 49.3100, lon: 17.0200 },
    { name: 'Dědice – vyvýšenina na západ', why: 'Kopec mimo město, stíněno od osvětlení Vyškova', lat: 49.2800, lon: 16.9600 },
    { name: 'Hostěradské rybníky', why: 'Vodní plochy, klid, nízké okolní osvětlení', lat: 49.2600, lon: 17.0500 },
    { name: 'Račice – pole u letiště', why: 'Rovná plocha, minimální překážky na horizontu', lat: 49.2500, lon: 16.9800 },
    { name: 'Drahanská vrchovina – Hamiltony', why: 'Okraj vojenského prostoru, tmavá obloha', lat: 49.3500, lon: 16.8500 },
  ],

  'Podyjí': [
    { name: 'Hardeggská vyhlídka', why: 'Skalní vyhlídka nad Dyjí, panorama na S, tmavé nebe', lat: 48.8550, lon: 15.8600 },
    { name: 'Vranov – hráz přehrady', why: 'Vodní plocha, výhled na sever podél údolí', lat: 48.8900, lon: 15.8200 },
    { name: 'Znojmo – Kraví hora (okraj NP)', why: 'Přechod NP a města, dobrý výhled', lat: 48.8650, lon: 16.0200 },
    { name: 'Čížov – přírodní cesta', why: 'Vstupní brána NP, rozhledna, tmavá obloha', lat: 48.8600, lon: 15.9000 },
    { name: 'Podmolí – louka nad řekou', why: 'Otevřená louka, les stíní obce, výhled na SZ', lat: 48.8500, lon: 15.8500 },
  ],

  'Soutok (Lanžhot)': [
    { name: 'Soutok Moravy a Dyje – most', why: 'Přesně na soutoku, vodní odraz, extrémní tma (Bortle 3–4)', lat: 48.6200, lon: 16.9700 },
    { name: 'Cahnov – pralesy', why: 'Pralesní rezervace, nulové osvětlení, panorama', lat: 48.6300, lon: 16.9400 },
    { name: 'Pohansko – lovecký zámeček', why: 'Izolované místo v lužních lesích, volný horizont', lat: 48.7200, lon: 16.8900 },
    { name: 'Ranšpurk – prales', why: 'NPR, nejstarší lužní pralesy v ČR, absolutní tma', lat: 48.6700, lon: 16.9400 },
    { name: 'Lanžhot – hráz rybníka', why: 'Na okraji obce, severní výhled přes nivu', lat: 48.7250, lon: 16.9700 },
  ],

  'Pálava': [
    { name: 'Děvín – vrchol', why: 'Nejvyšší bod Pálavy (554 m), 360° panorama', lat: 48.8690, lon: 16.6380 },
    { name: 'Stolová hora', why: 'Plochý vrchol, výhled na sever přes vinice', lat: 48.8640, lon: 16.6550 },
    { name: 'Klentnice – vyhlídka Sirotčí hrádek', why: 'Skalní bod, tmavý sever přes Pavlovské kopce', lat: 48.8580, lon: 16.6300 },
    { name: 'Dolní Věstonice – nad přehradou', why: 'Vodní plocha, nízké osvětlení, odraz aurory', lat: 48.8800, lon: 16.6500 },
    { name: 'Milovická pastvina', why: 'Otevřená step s divokými koňmi, minimální osvětlení', lat: 48.8400, lon: 16.6900 },
  ],

  // ══════════════════════════════════════════════════════════════════════════
  // MORAVSKOSLEZSKÝ
  // ══════════════════════════════════════════════════════════════════════════

  'Palkovice': [
    { name: 'Palkovické hůrky – rozhledna', why: 'Vrchol nad Palkovicemi, 360° panorama, Bortle 4', lat: 49.6400, lon: 18.3300 },
    { name: 'Myslík – louka nad údolím', why: 'Otevřený sever direction k Ostravě, kopec odfiltruje záři města', lat: 49.6500, lon: 18.3100 },
    { name: 'Hukvaldy – hrad (parkoviště pod hradem)', why: 'Vyvýšenina, les stíní světlo FM, severní pohled', lat: 49.6250, lon: 18.2250 },
    { name: 'Kozlovice – Ondřejník (sedlo)', why: 'Beskydské sedlo, tmavá obloha, přístupné z P.', lat: 49.5900, lon: 18.3600 },
    { name: 'Chlebovice – pole nad obcí', why: 'Otevřená zemědělská krajina, sever bez překážek', lat: 49.6600, lon: 18.3400 },
  ],

  'Ostrava': [
    { name: 'Halda Ema', why: 'Unikátní industriální kopec, 360° výhled nad městem', lat: 49.8350, lon: 18.2900 },
    { name: 'Landek park – vyhlídka', why: 'Skalní ostroh nad soutokem Odry a Ostravice, SZ výhled', lat: 49.8500, lon: 18.2800 },
    { name: 'Polanka n. O. – pole za vsí', why: 'Západní okraj Ostravy, tmavší sever', lat: 49.8000, lon: 18.1700 },
    { name: 'Proskovice – hráz rybníka', why: 'Vodní plocha jižně od centra, severní výhled přes město', lat: 49.7800, lon: 18.2300 },
    { name: 'Krásné Pole – okraj lesa', why: 'Severozápadní výběžek, les blokuje městské světlo', lat: 49.8400, lon: 18.2100 },
  ],

  'Opava': [
    { name: 'Hynčice – kopec nad obcí (směr Bruntál)', why: 'Vyvýšenina severně od Opavy, tmavý sever', lat: 49.9600, lon: 17.8500 },
    { name: 'Raduň – zámecký park', why: 'Otevřený park, nízké osvětlení, výhled na S', lat: 49.9050, lon: 17.8900 },
    { name: 'Stěbořice – pole nad vsí', why: 'Rovina, žádná zástavba na severu', lat: 49.9200, lon: 17.7800 },
    { name: 'Hradec nad Moravicí – vyhlídka u zámku', why: 'Zámecký kopec, panorama na SZ', lat: 49.8700, lon: 17.8800 },
    { name: 'Budišov n. B. – cesta na Svatý Kopeček', why: 'Les a louka, tmavý sever, přístupné', lat: 49.9300, lon: 17.6300 },
  ],

  'Frýdek-Místek': [
    { name: 'Skalice – pole nad přehradou Olešná', why: 'Vodní plocha, otevřený sever, hladina odráží záři', lat: 49.6700, lon: 18.3200 },
    { name: 'Lískovec – kopec u vodojemu', why: 'Vyvýšenina na okraji města, výhled na S přes FM', lat: 49.6800, lon: 18.3600 },
    { name: 'Staré Město – pole za ulicí Bezručovou', why: 'Zemědělská krajina, severní horizont bez zástavby', lat: 49.7000, lon: 18.3700 },
    { name: 'Baška – Godula (úbočí)', why: 'Beskydské úbočí, tmavá obloha, výhled na SSZ', lat: 49.6300, lon: 18.3500 },
    { name: 'Sviadnov – polní cesta na sever', why: 'Rovina mezi FM a Ostravou, otevřený horizont', lat: 49.7100, lon: 18.3200 },
  ],

  'Karviná': [
    { name: 'Darkov – lázně (parkoviště)', why: 'Lázeňský park, méně osvětlení, severní výhled', lat: 49.8600, lon: 18.5200 },
    { name: 'Louky n. O. – pole', why: 'Severozápadní okraj, rovina, tmavší obloha', lat: 49.8700, lon: 18.5000 },
    { name: 'Dětmarovice – hráz rybníka', why: 'Vodní plocha na severním okraji karvinského okresu', lat: 49.9000, lon: 18.4600 },
    { name: 'Petrovice u K. – kopec nad vsí', why: 'Vyvýšenina na hranici s Polskem, otevřený S', lat: 49.9100, lon: 18.5500 },
    { name: 'Stonava – pole u silnice na Horní Suchá', why: 'Otevřená krajina, nízké osvětlení', lat: 49.8450, lon: 18.5100 },
  ],

  'Nový Jičín': [
    { name: 'Svinec – kopec (432 m)', why: 'Izolovaný vrch, 360° výhled, nízké Bortle', lat: 49.6100, lon: 17.9600 },
    { name: 'Štramberk – Trúba (rozhledna)', why: 'Věž nad městem, panorama na sever', lat: 49.5920, lon: 18.1170 },
    { name: 'Hladké Životice – pole', why: 'Rovina, minimální zástavba, tmavý sever', lat: 49.6300, lon: 17.9100 },
    { name: 'Hodslavice – kopec nad rodištěm Palackého', why: 'Podhorská obec, výhled na SSZ', lat: 49.5400, lon: 18.0200 },
    { name: 'Starý Jičín – hrad', why: 'Hradní zřícenina na kopci, panoramatický výhled', lat: 49.5850, lon: 17.9800 },
  ],

  'Beskydy – Lysá hora': [
    { name: 'Lysá hora – vrchol (1323 m)', why: 'Nejvyšší bod Beskyd, nad oblačností, fenomenální tma', lat: 49.5464, lon: 18.4478 },
    { name: 'Smrk – horská louka pod vrcholem', why: 'Druhý nejvyšší beskydský kopec, otevřený S', lat: 49.5100, lon: 18.5200 },
    { name: 'Pustevny – Radhošť sedlo', why: 'Přístupné horské sedlo, tmavá obloha, parkoviště', lat: 49.5050, lon: 18.2600 },
    { name: 'Bílý Kříž – horská stanice', why: 'Klimatická stanice v Beskydech, Bortle 3, volný horizont', lat: 49.4950, lon: 18.5400 },
    { name: 'Visalaje – horská chata', why: 'Izolovaná poloha, tmavé nebe, výhled na SSV', lat: 49.4870, lon: 18.2900 },
  ],

  'Praděd (sever)': [
    { name: 'Praděd – vrchol (1491 m)', why: 'Nejvyšší bod Jeseníků, above treeline, Bortle 2–3', lat: 50.0830, lon: 17.2310 },
    { name: 'Petrovy kameny', why: 'Skalní útvar pod Pradědem, otevřený sever', lat: 50.0750, lon: 17.2350 },
    { name: 'Ovčárna – horská chata', why: 'Horské sedlo, přístupné, tmavá obloha', lat: 50.0700, lon: 17.2500 },
    { name: 'Švýcárna – úbočí Velkého Děda', why: 'Horská bouda, izolovaná poloha, Bortle 3', lat: 50.0900, lon: 17.2100 },
    { name: 'Velký Máj – horská louka', why: 'Otevřená louka nad hranicí lesa, panorama na S', lat: 50.0800, lon: 17.2000 },
  ],

  // ══════════════════════════════════════════════════════════════════════════
  // PLZEŇSKÝ
  // ══════════════════════════════════════════════════════════════════════════

  'Plzeň': [
    { name: 'Chlum u Plzně – rozhledna', why: 'Rozhledna SZ od Plzně, panorama, les stíní město', lat: 49.7700, lon: 13.3200 },
    { name: 'Bolevecké rybníky – severní hráz', why: 'Vodní plochy na S okraji města, tmavší obloha', lat: 49.7650, lon: 13.3500 },
    { name: 'Radyně – hrad', why: 'Kopec nad Starým Plzencem, výhled SZ, tmavý horizont', lat: 49.7100, lon: 13.4200 },
    { name: 'Křimice – pole za obcí', why: 'Rovina na SZ okraji, volný severní horizont', lat: 49.7600, lon: 13.3100 },
    { name: 'Šlovice – louka nad údolím', why: 'Nad Berounkou, les blokuje městskou záři', lat: 49.7400, lon: 13.2900 },
  ],

  'Klatovy': [
    { name: 'Čerchov – úbočí (sedlo)', why: 'Horský hřeben, tmavá obloha, přístupné z parkoviště', lat: 49.3700, lon: 12.7900 },
    { name: 'Doubrava – pole nad městem', why: 'Mírná vyvýšenina, výhled na S přes krajinu', lat: 49.4100, lon: 13.2900 },
    { name: 'Klenová – hrad a galerie', why: 'Kopec nad Klatovskem, panoramatický výhled', lat: 49.3500, lon: 13.2000 },
    { name: 'Úborsko – okraj lesa', why: 'Šumavské předhůří, tmavá obloha, volný S', lat: 49.3300, lon: 13.2500 },
    { name: 'Švihov – hráz rybníka u hradu', why: 'Vodní plocha, nízké okolní osvětlení', lat: 49.4800, lon: 13.2800 },
  ],

  'Domažlice': [
    { name: 'Čerchov – rozhledna (1042 m)', why: 'Nejvyšší bod Českého lesa, Bortle 3, panorama', lat: 49.3950, lon: 12.7880 },
    { name: 'Baldov – vyhlídka', why: 'Kopec nad Domažlicemi, výhled na SZ', lat: 49.4500, lon: 12.9100 },
    { name: 'Klenčí p.Č. – pole za vsí', why: 'Podhorská krajina, volný severní horizont', lat: 49.4000, lon: 12.8100 },
    { name: 'Přimda – hrad', why: 'Nejstarší kamenný hrad v ČR, vyvýšený, tmavá obloha', lat: 49.6700, lon: 12.6700 },
    { name: 'Kout na Šumavě – louka', why: 'Šumavské předhůří, nízké znečištění, otevřený terén', lat: 49.3700, lon: 13.0200 },
  ],

  'Rokycany': [
    { name: 'Kotel – kopec u Kařezu', why: 'Vyvýšenina mezi Rokycany a Příbramí, tmavý sever', lat: 49.7200, lon: 13.6200 },
    { name: 'Klabava – hráz přehrady', why: 'Vodní plocha, klidné místo, nízké osvětlení', lat: 49.7500, lon: 13.5200 },
    { name: 'Osek – pole nad obcí', why: 'Rovina, otevřený severní horizont', lat: 49.7600, lon: 13.5500 },
    { name: 'Zbiroh – zámek (parkoviště)', why: 'Kopec nad údolím, panorama na S', lat: 49.8600, lon: 13.7700 },
    { name: 'Strašice – okraj brdských lesů', why: 'Na hranici CHKO Brdy, tmavá obloha', lat: 49.7350, lon: 13.7600 },
  ],

  'Tachov': [
    { name: 'Přimda – hradní vrch', why: 'Ostroh s ruinou hradu, panorama na S, tmavá obloha', lat: 49.6700, lon: 12.6700 },
    { name: 'Český les – Dyleň (940 m)', why: 'Horský hřeben, extrémně tmavá obloha, volný S', lat: 49.9600, lon: 12.6400 },
    { name: 'Bor – pole za městem', why: 'Rovná krajina, minimální zástavba na S', lat: 49.7100, lon: 12.7700 },
    { name: 'Stříbro – kopec nad Mží', why: 'Nad říčním údolím, severní výhled', lat: 49.7600, lon: 13.0000 },
    { name: 'Planá – pole u dálnice (noc klid)', why: 'Otevřená krajina, nízké Bortle', lat: 49.8700, lon: 12.7400 },
  ],

  'Třemšín': [
    { name: 'Třemšín – rozhledna (827 m)', why: 'Vrchol Brd, rozhledna, Bortle 3–4, panorama', lat: 49.5690, lon: 13.7980 },
    { name: 'Valdek – hrad (úbočí)', why: 'Zřícenina v lesích, tmavá obloha, klid', lat: 49.5450, lon: 13.7700 },
    { name: 'Zaječov – pole nad vsí', why: 'Otevřený terén na okraji Brd, výhled SZ', lat: 49.5800, lon: 13.7600 },
    { name: 'Jince – údolí Litavky', why: 'Přemostění tratě, otevřený sever', lat: 49.6200, lon: 14.0000 },
    { name: 'Záběhlá – louka u potoka', why: 'Izolovaná osada v Brdech, extrémní tma', lat: 49.5600, lon: 13.8200 },
  ],

  'Manětín': [
    { name: 'Manětín – kopec nad zámkem', why: 'Barokní město, vyvýšenina, Bortle 3, otevřený S', lat: 49.9900, lon: 13.2300 },
    { name: 'Rabštejn nad Střelou – nad kaňonem', why: 'Nejmenší město ČR, skalní ostroh, nulové osvětlení', lat: 50.0200, lon: 13.2800 },
    { name: 'Nečtiny – pole nad vsí', why: 'Zemědělská krajina, volný sever, Bortle 2–3', lat: 49.9700, lon: 13.1600 },
    { name: 'Žihle – rybník u obce', why: 'Vodní plocha, odraz, tmavá obloha', lat: 50.0400, lon: 13.3700 },
    { name: 'Vladměřice – okraj lesa', why: 'Les blokuje rozptýlené světlo Plzně, panorama S', lat: 49.9600, lon: 13.2600 },
  ],

  // ══════════════════════════════════════════════════════════════════════════
  // LIBERECKÝ
  // ══════════════════════════════════════════════════════════════════════════

  'Liberec': [
    { name: 'Ještěd – parkoviště pod hotelem', why: 'Ikonický kopec, nad inverzí, severní horizont přes Polsko', lat: 50.7330, lon: 15.0060 },
    { name: 'Rudolfov – vyhlídka', why: 'Lesní kopec severně od města, tmavší obloha', lat: 50.7900, lon: 15.0400 },
    { name: 'Bedřichovské rybníky', why: 'Jizerské hory, vodní plochy, tmavá obloha', lat: 50.7800, lon: 15.1100 },
    { name: 'Liberecký hřeben – Kryštofovo Údolí', why: 'Výhled na S přes údolí, les stíní město', lat: 50.7600, lon: 14.9400 },
    { name: 'Vesec – pole na JZ okraji', why: 'Otevřená rovina, dál od centra, volný sever', lat: 50.7300, lon: 15.0200 },
  ],

  'Jablonec n. N.': [
    { name: 'Černostudniční hřeben – rozhledna', why: 'Jizerské hory, Bortle 4, panorama na S', lat: 50.7700, lon: 15.2200 },
    { name: 'Prosečský hřeben', why: 'Lesní hřeben, výhled na SZ, tmavá obloha', lat: 50.7200, lon: 15.1200 },
    { name: 'Tanvaldský Špičák – sedlo', why: 'Horské sedlo, volný severní horizont', lat: 50.7400, lon: 15.2600 },
    { name: 'Bedřichov – u přehrady', why: 'Vodní plocha v horách, klidné místo', lat: 50.7700, lon: 15.1500 },
    { name: 'Lučany n.N. – pole za vsí', why: 'Podhorská krajina, volný sever', lat: 50.7100, lon: 15.2400 },
  ],

  'Česká Lípa': [
    { name: 'Ronov – hrad (zřícenina)', why: 'Čedičový kopec, panorama 360°, tmavá obloha', lat: 50.7100, lon: 14.5600 },
    { name: 'Máchovo jezero – Staré Splavy', why: 'Vodní plocha, odraz, nízké osvětlení okolí', lat: 50.5850, lon: 14.6400 },
    { name: 'Ralsko – vrch (696 m)', why: 'Bývalý vojenský prostor, extrémní tma, volný S', lat: 50.6600, lon: 14.7800 },
    { name: 'Sloup – skalní hrad', why: 'Pískovcová plošina, výhled, tmavé okolí', lat: 50.7300, lon: 14.5800 },
    { name: 'Zahrádky – pole u silnice', why: 'Rovina, otevřený severní horizont', lat: 50.6700, lon: 14.5200 },
  ],

  'Semily': [
    { name: 'Kozákov – rozhledna (744 m)', why: 'Nejlepší vyhlídka v Českém ráji, 360° panorama', lat: 50.5850, lon: 15.2300 },
    { name: 'Bozkov – nad jeskyněmi', why: 'Vyvýšenina, les stíní Semily, tmavý S', lat: 50.5650, lon: 15.3400 },
    { name: 'Riegrova stezka – vyhlídka nad Jizerou', why: 'Skalní ostroh, údolí, severní výhled', lat: 50.5600, lon: 15.3400 },
    { name: 'Turnov – Hlavatice (kopec)', why: 'Okraj Českého ráje, tmavá obloha, výhled', lat: 50.5800, lon: 15.1600 },
    { name: 'Vysoké n.J. – pole', why: 'Otevřená podhorská krajina, nízké Bortle', lat: 50.5400, lon: 15.3700 },
  ],

  'Jizerská tmavá obloha': [
    { name: 'Jizerka – osada', why: 'Nejznámější dark-sky místo ČR, Bortle 2–3, ploché rašeliniště', lat: 50.8300, lon: 15.3400 },
    { name: 'Smědava – chata u přehrady', why: 'Horská chata, vodní plocha, extrémní tma', lat: 50.8400, lon: 15.2700 },
    { name: 'Bílá Desná – přehrada', why: 'Izolovaná vodní plocha v horách, nulové osvětlení', lat: 50.8100, lon: 15.2900 },
    { name: 'Nová Louka – rašeliniště', why: 'Otevřené rašeliniště, severní panorama', lat: 50.8000, lon: 15.2200 },
    { name: 'Kristiánov – polánka', why: 'Horská polanka, les kolem, tmavý koridor na S', lat: 50.8200, lon: 15.2500 },
  ],

  'Ralsko': [
    { name: 'Ralsko – vrch (696 m)', why: 'Dominantní čedičový kužel, 360° výhled, Bortle 3–4', lat: 50.6000, lon: 14.8000 },
    { name: 'Kuřivody – bývalá kasárna', why: 'Opuštěná vojenská oblast, nulové osvětlení', lat: 50.6200, lon: 14.8200 },
    { name: 'Hradčany – letiště (okraj)', why: 'Obrovská rovná plocha, minimální překážky', lat: 50.6300, lon: 14.7400 },
    { name: 'Bělá p. B. – pole za obcí', why: 'Okraj přírodního parku, tmavá obloha, volný S', lat: 50.5700, lon: 14.8100 },
    { name: 'Vranov – lesy', why: 'Lesní cesty v bývalém VÚ, absolutní tma', lat: 50.6100, lon: 14.7600 },
  ],

  // ══════════════════════════════════════════════════════════════════════════
  // OLOMOUCKÝ
  // ══════════════════════════════════════════════════════════════════════════

  'Olomouc': [
    { name: 'Svatý Kopeček – vyhlídka', why: 'Kopec nad Olomoucí, bazilika, výhled na SSZ', lat: 49.6200, lon: 17.3300 },
    { name: 'Radíkov – pole nad obcí', why: 'Severně od Olomouce, rovina, tmavší obloha', lat: 49.6500, lon: 17.2600 },
    { name: 'Bystrovany – pole za vsí', why: 'Otevřená krajina, volný severní horizont', lat: 49.5800, lon: 17.3100 },
    { name: 'Babice – okraj štěrkopískovny', why: 'Vodní plochy a otevřený terén, nízké osvětlení', lat: 49.5500, lon: 17.2200 },
    { name: 'Kožušany – louka', why: 'Rovina na SV od Olomouce, volný S', lat: 49.6100, lon: 17.3500 },
  ],

  'Prostějov': [
    { name: 'Kosíř – kopec (442 m)', why: 'Nejvyšší bod Prostějovska, rozhledna, panorama', lat: 49.5200, lon: 17.0500 },
    { name: 'Plumlov – přehrada (hráz)', why: 'Vodní plocha, severní výhled, klidné místo', lat: 49.4700, lon: 16.9900 },
    { name: 'Určice – pole za vsí', why: 'Rovina, otevřený sever', lat: 49.4900, lon: 17.0600 },
    { name: 'Myslejovice – kopec nad obcí', why: 'Drahanská vrchovina, tmavší obloha', lat: 49.4500, lon: 16.9700 },
    { name: 'Vícov – okraj lesa', why: 'Lesní stínění Prostějova, otevřený S', lat: 49.4800, lon: 16.9700 },
  ],

  'Přerov': [
    { name: 'Čechy p.K. – pole na severu', why: 'Rovina, volný severní horizont, nízké osvětlení', lat: 49.4900, lon: 17.4500 },
    { name: 'Hranice n.M. – Propast Hranická', why: 'Přírodní oblast, les stíní městská světla', lat: 49.5300, lon: 17.7400 },
    { name: 'Kojetín – pole za městem', why: 'Otevřená Haná, rovina, tmavé severní nebe', lat: 49.3500, lon: 17.2900 },
    { name: 'Dluhonice – hráz u Bečvy', why: 'Říční niva, vodní plochy, nízké okolní osvětlení', lat: 49.4700, lon: 17.4400 },
    { name: 'Želatovice – pole', why: 'Rovina jihovýchodně, volný sever nad polem', lat: 49.4300, lon: 17.4700 },
  ],

  'Šumperk': [
    { name: 'Háj nad Šumperkem – rozhledna', why: 'Vyvýšenina, panorama Jeseníků, tmavý S', lat: 49.9800, lon: 16.9500 },
    { name: 'Velké Losiny – nad lázněmi', why: 'Podhorské údolí, les stíní město, klid', lat: 50.0300, lon: 17.0400 },
    { name: 'Branná – pole nad řekou', why: 'Přechod do hor, otevřený sever', lat: 50.0700, lon: 17.0100 },
    { name: 'Rapotín – louka u řeky Desné', why: 'Vodní tok, nízká zástavba, tmavší obloha', lat: 49.9800, lon: 17.0100 },
    { name: 'Kouty n.D. – parkoviště u lanovky', why: 'Horské údolí, tmavá obloha, Bortle 4', lat: 50.0800, lon: 17.0700 },
  ],

  'Jeseník': [
    { name: 'Rejvíz – rašeliniště', why: 'Přírodní rezervace, tmavé nebe, Bortle 3, panorama', lat: 50.2200, lon: 17.3100 },
    { name: 'Ramzová – sedlo', why: 'Horské sedlo, přístupné, severní výhled do Polska', lat: 50.2000, lon: 17.0800 },
    { name: 'Lipová-lázně – Lesní bar', why: 'Podhorská poloha, les stíní osvětlení, volný S', lat: 50.2300, lon: 17.1400 },
    { name: 'Zlaté Hory – pole za městem', why: 'Okraj Jeseníků, rovina otevřená na sever', lat: 50.2600, lon: 17.3900 },
    { name: 'Bělá p.P. – u přehrady', why: 'Vodní plocha, tmavé okolí, severní panorama', lat: 50.2400, lon: 17.2200 },
  ],

  'Jeseníky – Praděd': [
    { name: 'Praděd – pod vysílačem', why: 'Nejvyšší bod Moravy, Bortle 2–3, okružní výhled', lat: 50.0830, lon: 17.2310 },
    { name: 'Velká kotlina – vyhlídka', why: 'Ledovcový kar, otevřený na S, unikátní místo', lat: 50.0600, lon: 17.2400 },
    { name: 'Petrovy kameny', why: 'Mrazový srub pod Pradědem, mytologické místo, tmavé nebe', lat: 50.0750, lon: 17.2350 },
    { name: 'Ovčárna – parkoviště', why: 'Nejvýše položené parkoviště v Jeseníkách, Bortle 3', lat: 50.0700, lon: 17.2500 },
    { name: 'Dlouhé stráně – horní nádrž', why: 'Umělé jezero na hřebeni, fenomenální tma a výhled', lat: 50.0900, lon: 17.1800 },
  ],

  // ══════════════════════════════════════════════════════════════════════════
  // KRÁLOVÉHRADECKÝ
  // ══════════════════════════════════════════════════════════════════════════

  'Hradec Králové': [
    { name: 'Nový Hradec Králové – lesopark', why: 'Jižní okraj města, les stíní osvětlení, volný S', lat: 50.1900, lon: 15.8400 },
    { name: 'Stěžery – pole za vsí', why: 'Rovina, otevřený sever směrem ke Krkonoším', lat: 50.2350, lon: 15.8000 },
    { name: 'Černilov – polní cesta', why: 'SV od města, zemědělská krajina, tmavší obloha', lat: 50.2500, lon: 15.9200 },
    { name: 'Kuks – nad barokním areálem', why: 'Kopec nad Labem, výhled na S, nízké osvětlení', lat: 50.3900, lon: 15.8800 },
    { name: 'Chlum u H.K. – bojiště 1866', why: 'Historická vyvýšenina, otevřené pole, panorama', lat: 50.3100, lon: 15.8700 },
  ],

  'Trutnov': [
    { name: 'Janské Lázně – parkoviště u lanovky', why: 'Podhorská poloha, severní výhled do Krkonoš', lat: 50.6300, lon: 15.7800 },
    { name: 'Žacléř – pole nad obcí', why: 'Podkrkonošská krajina, volný S přes hřeben', lat: 50.6600, lon: 16.0500 },
    { name: 'Trutnov – Horní Staré Město (kopec)', why: 'Vyvýšenina nad městem, výhled na SSZ', lat: 50.5800, lon: 15.8900 },
    { name: 'Královecký Špičák – vyhlídka', why: 'Horský hřeben, tmavá obloha, panorama', lat: 50.5400, lon: 15.8500 },
    { name: 'Hajnice – louka nad vsí', why: 'Podhorská louka, klidné místo, tmavé nebe', lat: 50.5950, lon: 15.8300 },
  ],

  'Náchod': [
    { name: 'Dobrošov – pevnostní areál', why: 'Vyvýšenina, historický fort, panorama na S', lat: 50.4400, lon: 16.1300 },
    { name: 'Bražec – pole nad vsí', why: 'Otevřená krajina, severní výhled', lat: 50.4500, lon: 16.1800 },
    { name: 'Adršpašské skály – parkoviště', why: 'Skalní město, les stíní záři, Bortle 4', lat: 50.6100, lon: 16.1200 },
    { name: 'Hronov – kopec u nádraží', why: 'Mírná vyvýšenina, výhled SSZ', lat: 50.4800, lon: 16.1800 },
    { name: 'Polsko-český hřeben u Machova', why: 'Hraniční hřeben, tmavé nebe, volný S přes Polsko', lat: 50.5300, lon: 16.2800 },
  ],

  'Jičín': [
    { name: 'Prachovské skály – vyhlídka', why: 'Skalní město v Českém ráji, tmavá obloha, Bortle 4', lat: 50.4600, lon: 15.3900 },
    { name: 'Trosky – pod hradem', why: 'Ikonické věže, kopec s panoramatem, nízké osvětlení', lat: 50.5150, lon: 15.2300 },
    { name: 'Velíš – kopec (429 m)', why: 'Vyhaslá sopka, panoramatický výhled 360°', lat: 50.4100, lon: 15.3600 },
    { name: 'Zebín – kopec u Jičína', why: 'Čedičový vrch, výhled ze sedla, volný sever', lat: 50.4350, lon: 15.3700 },
    { name: 'Jinolice – pole za vsí', why: 'Rovina pod Českým rájem, otevřený severní horizont', lat: 50.4700, lon: 15.3600 },
  ],

  'Rychnov n. Kn.': [
    { name: 'Sněžné – nad přehradou Pastviny', why: 'Vodní plocha v Orlických horách, tmavé nebe, S výhled', lat: 50.1300, lon: 16.5400 },
    { name: 'Potštejn – hrad', why: 'Kopec nad Divokou Orlicí, panorama', lat: 50.0800, lon: 16.3200 },
    { name: 'Solnice – pole za městem', why: 'Rovina, otevřený sever k Orlickým horám', lat: 50.2100, lon: 16.2400 },
    { name: 'Kunvald – pole nad vsí', why: 'Podhorská krajina, tmavá obloha, nízké Bortle', lat: 50.1700, lon: 16.5000 },
    { name: 'Vamberk – vyhlídka na Merklovice', why: 'Kopec nad městem, výhled SSZ', lat: 50.1200, lon: 16.3000 },
  ],

  'Krkonoše – Sněžka': [
    { name: 'Sněžka – pod českou boudou', why: 'Nejvyšší hora ČR (1603 m), nad inverzí, Bortle 2–3', lat: 50.7360, lon: 15.7400 },
    { name: 'Luční bouda – okolí', why: 'Nejvýše položená bouda, otevřené louky, fenomální tma', lat: 50.7250, lon: 15.6900 },
    { name: 'Pomezní Boudy – nad sedlem', why: 'Hraniční hřeben, výhled na S přes Polsko', lat: 50.7400, lon: 15.8500 },
    { name: 'Petrova bouda – rašeliniště', why: 'Horské rašeliniště, otevřený horizont, Bortle 3', lat: 50.7200, lon: 15.6200 },
    { name: 'Malá Úpa – pod Sněžkou', why: 'Horská vesnice, přístupné parkoviště, tmavé nebe', lat: 50.7300, lon: 15.8100 },
  ],

  'Orlické hory': [
    { name: 'Velká Deštná – rozhledna (1115 m)', why: 'Nejvyšší bod Orlických hor, panorama 360°, Bortle 3', lat: 50.3200, lon: 16.3900 },
    { name: 'Šerlich – sedlo (1027 m)', why: 'Horské sedlo, přístupné, otevřený S přes Polsko', lat: 50.3500, lon: 16.3700 },
    { name: 'Masarykova chata – u rozhledny', why: 'Horský hřeben, tmavá obloha, Bortle 3', lat: 50.3300, lon: 16.4200 },
    { name: 'Zemská brána – skalní soutěska', why: 'Říční údolí, přirozené stínění, nízké znečištění', lat: 50.2600, lon: 16.4600 },
    { name: 'Říčky v Orl.h. – parkoviště u sjezdovek', why: 'Podhorská poloha, tmavé okolí, volný horizont', lat: 50.2500, lon: 16.4800 },
  ],

  // ══════════════════════════════════════════════════════════════════════════
  // PARDUBICKÝ
  // ══════════════════════════════════════════════════════════════════════════

  'Pardubice': [
    { name: 'Kunětická Hora – hrad', why: 'Ostroh nad Labem, 360° výhled z kopce, volný sever', lat: 50.0700, lon: 15.8100 },
    { name: 'Lázně Bohdaneč – hráz rybníka', why: 'Rybniční soustava, vodní plocha, nízké osvětlení', lat: 50.0800, lon: 15.6800 },
    { name: 'Sezemice – pole za vsí', why: 'Rovina, otevřený sever k Orlickým horám', lat: 50.0700, lon: 15.8500 },
    { name: 'Semín – u labského soutoku', why: 'Říční niva, vodní odraz, tmavší obloha', lat: 50.0500, lon: 15.6800 },
    { name: 'Starý Ježov – okraj lesa', why: 'Les stíní pardubickou záři, otevřený S', lat: 50.0600, lon: 15.7200 },
  ],

  'Chrudim': [
    { name: 'Medlešice – pole nad obcí', why: 'Rovina, otevřený severní horizont', lat: 49.9700, lon: 15.7500 },
    { name: 'Rabštejnská Lhota – nad přehradou Seč', why: 'Vodní plocha, tmavé okolí, Bortle 4–5', lat: 49.8600, lon: 15.6500 },
    { name: 'Kočí – kopec u kostela', why: 'Vyvýšenina, panorama na S, gotický kostel', lat: 49.9400, lon: 15.8400 },
    { name: 'Žďárec u Skutče – pole', why: 'Železnohorské předhůří, tmavá obloha', lat: 49.8400, lon: 16.0300 },
    { name: 'Lichnice – hrad (zřícenina)', why: 'Ostroh v Železných horách, panorama, Bortle 4', lat: 49.8500, lon: 15.5900 },
  ],

  'Ústí n. Orlicí': [
    { name: 'Andrlův chlum – rozhledna', why: 'Dominantní kopec, 360° rozhled, nízké Bortle', lat: 49.9700, lon: 16.4000 },
    { name: 'Lanšperk – hrad', why: 'Zřícenina na kopci, panorama, tmavá obloha', lat: 50.0100, lon: 16.5500 },
    { name: 'Česká Třebová – Kozlov (kopec)', why: 'Vyvýšenina nad železničním uzlem, výhled SSZ', lat: 49.9100, lon: 16.4300 },
    { name: 'Letohrad – pole nad obcí', why: 'Podhorská krajina, otevřený S k horám', lat: 50.0400, lon: 16.5000 },
    { name: 'Choceň – vyhlídka nad Tichou Orlicí', why: 'Říční údolí, les stíní město, severní koridor', lat: 50.0050, lon: 16.2200 },
  ],

  'Svitavy': [
    { name: 'Moravská Třebová – hrad', why: 'Kopec nad městem, panorama SZ, nízké znečištění', lat: 49.7600, lon: 16.6600 },
    { name: 'Opatov – pole nad vsí', why: 'Rovina, otevřený sever, zemědělská krajina', lat: 49.7800, lon: 16.4300 },
    { name: 'Radiměř – kopec na severu', why: 'Vyvýšenina, výhled do Jeseníků, Bortle 4', lat: 49.7400, lon: 16.5500 },
    { name: 'Polička – bastion (hradby)', why: 'Hradby nad městem, malé záře, výhled S', lat: 49.7100, lon: 16.2700 },
    { name: 'Květná – pole u silnice', why: 'Rovina, volný sever, minimální zástavba', lat: 49.7200, lon: 16.4000 },
  ],

  'Králický Sněžník': [
    { name: 'Králický Sněžník – vrchol (1423 m)', why: 'Třetí nejvyšší hora ČR, Bortle 2–3, panorama', lat: 50.2080, lon: 16.8475 },
    { name: 'Pod Králickým Sněžníkem – horská louka', why: 'Otevřená louka nad hranicí lesa, fenomenální tma', lat: 50.2000, lon: 16.8300 },
    { name: 'Velká Morava – pramenná oblast', why: 'Izolované horské údolí, nulové osvětlení', lat: 50.1900, lon: 16.8700 },
    { name: 'Dolní Morava – Stezka v oblacích', why: 'Vyhlídková věž, přístupná, panoramatický výhled', lat: 50.1500, lon: 16.8300 },
    { name: 'Horní Morava – parkoviště u běžeckých tras', why: 'Horské sedlo, otevřený S přes hřeben', lat: 50.1700, lon: 16.8500 },
  ],

  // ══════════════════════════════════════════════════════════════════════════
  // JIHOČESKÝ
  // ══════════════════════════════════════════════════════════════════════════

  'České Budějovice': [
    { name: 'Hluboká n.V. – obora (okraj)', why: 'Zámecký park, les stíní město, volný S', lat: 49.0500, lon: 14.4400 },
    { name: 'Dobrovodská stráň – kopec', why: 'Vyvýšenina SV od centra, panorama', lat: 49.0100, lon: 14.5100 },
    { name: 'Vrbenské rybníky – hráz', why: 'Vodní plochy, odraz, tmavší obloha od severu', lat: 48.9900, lon: 14.4300 },
    { name: 'Rudolfov – kopec u obce', why: 'SV od města, výhled na S, nižší záře', lat: 48.9900, lon: 14.5500 },
    { name: 'Lišov – pole za obcí', why: 'Rovina, otevřený sever, zemědělská krajina', lat: 49.0200, lon: 14.5800 },
  ],

  'Tábor': [
    { name: 'Klokoty – poutní kostel', why: 'Kopec nad Táborem, severní výhled přes krajinu', lat: 49.4000, lon: 14.6500 },
    { name: 'Chýnov – jeskyně (parkoviště)', why: 'Přírodní oblast, les stíní město, klid', lat: 49.4000, lon: 14.8300 },
    { name: 'Sezimovo Ústí – pole nad Lužnicí', why: 'Říční niva, otevřený S, vodní plochy', lat: 49.3800, lon: 14.6900 },
    { name: 'Mladá Vožice – kopec nad městem', why: 'Zřícenina na kopci, panorama', lat: 49.5300, lon: 14.8100 },
    { name: 'Košice – pole u silnice', why: 'Rovina, volný severní horizont', lat: 49.4400, lon: 14.6500 },
  ],

  'Písek': [
    { name: 'Velký Mehelník – rozhledna', why: 'Kopec v Píseckých horách, Bortle 4, panorama', lat: 49.3800, lon: 14.0800 },
    { name: 'Zvíkov – hrad nad soutokem', why: 'Ostroh nad Vltavou a Otavou, tmavé okolí', lat: 49.4400, lon: 14.1900 },
    { name: 'Orlík n.V. – přehrada (hráz)', why: 'Vodní plocha, severní výhled podél údolí', lat: 49.5100, lon: 14.1700 },
    { name: 'Protivín – pole za městem', why: 'Rovina, otevřený sever', lat: 49.2000, lon: 14.2200 },
    { name: 'Živec – louka u potoka', why: 'Klidné místo, nízké osvětlení, volný horizont', lat: 49.3600, lon: 14.1200 },
  ],

  'Strakonice': [
    { name: 'Kuřidlo – rozhledna (636 m)', why: 'Kopec v Pošumaví, panorama 360°, tmavá obloha', lat: 49.2200, lon: 13.7800 },
    { name: 'Rábí – hrad', why: 'Největší hradní zřícenina v ČR, kopec, panorama', lat: 49.2800, lon: 13.6200 },
    { name: 'Chelčice – pole nad vsí', why: 'Rovina, historická krajina, otevřený S', lat: 49.1500, lon: 14.0600 },
    { name: 'Blatná – zámek (okolní rybníky)', why: 'Vodní plochy, nízké osvětlení, klid', lat: 49.4200, lon: 13.8800 },
    { name: 'Katovice – louka nad Otavou', why: 'Říční niva, les stíní Strakonice, severní koridor', lat: 49.2600, lon: 13.8400 },
  ],

  'Český Krumlov': [
    { name: 'křížový vrch – vyhlídka', why: 'Kopec nad Vltavou, panorama na S, nízké osvětlení', lat: 48.8200, lon: 14.3100 },
    { name: 'Kleť – rozhledna (1084 m)', why: 'Nejvyšší bod Blanského lesa, Bortle 3–4, skvělý výhled', lat: 48.8700, lon: 14.2800 },
    { name: 'Zlatá Koruna – klášter (nad obcí)', why: 'Vyvýšenina nad meandrem Vltavy, tmavý S', lat: 48.8550, lon: 14.3650 },
    { name: 'Vyšší Brod – nad klášterem', why: 'Šumavské předhůří, tmavá obloha, volný horizont', lat: 48.6200, lon: 14.3100 },
    { name: 'Lipno – hráz přehrady', why: 'Obrovská vodní plocha, odraz aurory, tmavá obloha', lat: 48.6300, lon: 14.2200 },
  ],

  'Prachatice': [
    { name: 'Libín – rozhledna (1096 m)', why: 'Kopec nad Prachaticemi, panorama, Bortle 3–4', lat: 49.0300, lon: 13.9600 },
    { name: 'Husinec – pole nad Blanicí', why: 'Říční údolí, otevřený sever, nízké osvětlení', lat: 49.0600, lon: 13.9800 },
    { name: 'Netolice – Kratochvíle (okolí zámku)', why: 'Renesanční zámek, park, tmavé okolí', lat: 49.0500, lon: 14.2000 },
    { name: 'Volary – železniční most', why: 'Šumavské předhůří, otevřená krajina, Bortle 3', lat: 48.9100, lon: 13.8900 },
    { name: 'Stožec – pole za obcí', why: 'Okraj NP Šumava, extrémní tma, volný výhled', lat: 48.8600, lon: 13.8200 },
  ],

  'Šumava – Boubín': [
    { name: 'Boubín – rozhledna (1362 m)', why: 'Šumavský vrchol, prales, Bortle 2–3, fenomenální tma', lat: 48.9730, lon: 13.8100 },
    { name: 'Idina Pila – louka', why: 'Lesní mýtina, potok, absolutní tma, klid', lat: 48.9900, lon: 13.8300 },
    { name: 'Zátoň – pole nad Vltavou', why: 'Říční údolí, výhled na S, nízké znečištění', lat: 48.9800, lon: 13.8600 },
    { name: 'Kubova Huť – nádraží (pole za vsí)', why: 'Nejvýše položená vesnice v ČR, extrémní tma', lat: 48.9900, lon: 13.7600 },
    { name: 'Včelná p.B. – rašeliniště', why: 'Šumavské rašeliniště, otevřený horizont, Bortle 2', lat: 48.9700, lon: 13.7900 },
  ],

  'Šumava – Březník': [
    { name: 'Březník – horská louka', why: 'Nejmenší Bortle v ČR (2), absolutní tma, SRT Dark Sky Park', lat: 49.0050, lon: 13.4750 },
    { name: 'Modrava – Filipova Huť', why: 'Horská osada, rašeliniště kolem, nulové osvětlení', lat: 49.0300, lon: 13.4900 },
    { name: 'Kvilda – pole za obcí', why: 'Nejvýše položená obec Šumavy, Bortle 2, panorama', lat: 49.0200, lon: 13.5800 },
    { name: 'Rokytecká slať – povalový chodník', why: 'Rašeliniště, otevřený horizont, absolutní tma', lat: 49.0250, lon: 13.4500 },
    { name: 'Čeňkova Pila – u Vydry', why: 'Říční údolí, les stíní ze všech stran, vodní odraz', lat: 49.0600, lon: 13.4600 },
  ],

  // ══════════════════════════════════════════════════════════════════════════
  // ZLÍNSKÝ
  // ══════════════════════════════════════════════════════════════════════════

  'Zlín': [
    { name: 'Tlustá hora – vyhlídka', why: 'Kopec nad Zlínem, panorama na S, les stíní město', lat: 49.2400, lon: 17.6800 },
    { name: 'Kostelec – pole nad obcí', why: 'Severně od Zlína, otevřený horizont', lat: 49.2800, lon: 17.6900 },
    { name: 'Vizovice – louka nad přehradou', why: 'Vodní plocha, klidné místo, tmavší obloha', lat: 49.2200, lon: 17.8500 },
    { name: 'Hostýnské vrchy – Tesák', why: 'Horský hřeben, Bortle 4, panorama na SSZ', lat: 49.3500, lon: 17.8200 },
    { name: 'Fryšták – pole za obcí', why: 'Předhorská rovina, volný sever', lat: 49.2800, lon: 17.6500 },
  ],

  'Vsetín': [
    { name: 'Cáb – horské sedlo', why: 'Beskydy–Javorníky, Bortle 4, otevřený SSZ', lat: 49.3400, lon: 18.1100 },
    { name: 'Semetín – louka nad údolím', why: 'Nad Bečvou, les stíní Vsetín, tmavá obloha', lat: 49.3600, lon: 17.9600 },
    { name: 'Hovězí – pole nad vsí', why: 'Valašská krajina, otevřený sever', lat: 49.3200, lon: 18.0500 },
    { name: 'Horní Lideč – kopec u hranice', why: 'Blízko slovenského pomezí, tmavé nebe', lat: 49.1900, lon: 18.0600 },
    { name: 'Velké Karlovice – pod Soláněm', why: 'Horská vesnice, Bortle 4, údolí stíní záři', lat: 49.3600, lon: 18.2700 },
  ],

  'Kroměříž': [
    { name: 'Barbořice – pole nad Kroměříží', why: 'Rovina, otevřený severní horizont přes Haná', lat: 49.3200, lon: 17.3800 },
    { name: 'Chropyně – rybníky', why: 'Rybniční soustava, vodní plochy, nízké osvětlení', lat: 49.3600, lon: 17.3700 },
    { name: 'Holešov – zámecký park', why: 'Park na okraji města, méně světel, severní koridor', lat: 49.3400, lon: 17.5800 },
    { name: 'Hostýn – poutní vrch (736 m)', why: 'Bazilika na kopci, 360° panorama, tmavá obloha', lat: 49.3700, lon: 17.7000 },
    { name: 'Záhlinice – mokřady', why: 'Přírodní rezervace, nulové osvětlení, rovina', lat: 49.2800, lon: 17.4800 },
  ],

  'Uherské Hradiště': [
    { name: 'Buchlovice – pod Buchlovem', why: 'Kopec s hradem, výhled na S, tmavé okolí', lat: 49.0850, lon: 17.3400 },
    { name: 'Kunovice – letiště (okraj)', why: 'Rovná plocha, minimální překážky na horizontu', lat: 49.0300, lon: 17.4700 },
    { name: 'Polešovice – pole nad obcí', why: 'Zemědělská krajina, otevřený sever', lat: 49.0400, lon: 17.3500 },
    { name: 'Ostrožská Nová Ves – hráz rybníka', why: 'Vodní plocha, nízké osvětlení', lat: 49.0100, lon: 17.4300 },
    { name: 'Chřiby – Brdo (587 m)', why: 'Lesní hřeben, tmavá obloha, výhled ze svahu na S', lat: 49.1200, lon: 17.3600 },
  ],

  'Bílé Karpaty': [
    { name: 'Velká Javořina – vrchol (970 m)', why: 'Nejvyšší bod Bílých Karpat, panorama na SSZ, Bortle 3–4', lat: 48.8600, lon: 17.6700 },
    { name: 'Porážky – orchidejová louka', why: 'Kvé​tná louka UNESCO, otevřený terén, tmavá obloha', lat: 48.9200, lon: 17.7400 },
    { name: 'Lopeník – sedlo', why: 'Horské sedlo, volný sever přes Moravu', lat: 48.8900, lon: 17.7600 },
    { name: 'Bojkovice – kopec nad obcí', why: 'Podhorská poloha, výhled SSZ, nízké osvětlení', lat: 49.0400, lon: 17.7600 },
    { name: 'Starý Hrozenkov – pole u potoka', why: 'Hraniční obec, tmavé nebe, minimální zástavba', lat: 48.9000, lon: 17.8900 },
  ],

  // ══════════════════════════════════════════════════════════════════════════
  // ÚSTECKÝ
  // ══════════════════════════════════════════════════════════════════════════

  'Ústí nad Labem': [
    { name: 'Střekov – hrad', why: 'Skalní ostroh nad Labem, výhled na SSZ podél řeky', lat: 50.6500, lon: 14.0400 },
    { name: 'Erbenova vyhlídka', why: 'Klasická vyhlídka nad městem, severní panorama', lat: 50.6700, lon: 14.0200 },
    { name: 'Brná n. L. – louka nad vsí', why: 'Labské údolí, les stíní město, severní koridor', lat: 50.6800, lon: 14.0800 },
    { name: 'Vaňov – pole nad obcí', why: 'Okraj Středohoří, tmavší obloha, výhled S', lat: 50.6300, lon: 14.0700 },
    { name: 'Zubrnice – skanzen (okolí)', why: 'Podhorská vesnice, nízké osvětlení, klid', lat: 50.6900, lon: 14.1500 },
  ],

  'Most': [
    { name: 'Hněvín – hrad (rekonstrukce)', why: 'Kopec nad městem, panorama na S přes Podkrušnohoří', lat: 50.5100, lon: 13.6400 },
    { name: 'Matylda – jezero (hráz)', why: 'Rekultivované jezero, vodní plocha, severní výhled', lat: 50.5200, lon: 13.6100 },
    { name: 'Hora Svaté Kateřiny – vrch', why: 'Krušnohorská obec, tmavá obloha, Bortle 4', lat: 50.6100, lon: 13.5100 },
    { name: 'Jezeří – zámek (vyhlídka)', why: 'Zámek nad lomem, panorama, historický bod', lat: 50.5500, lon: 13.5300 },
    { name: 'Litvínov – pole za obcí Janov', why: 'Otevřená krajina, volný sever k horám', lat: 50.6000, lon: 13.6200 },
  ],

  'Teplice': [
    { name: 'Doubravka – hrad', why: 'Kopec nad Teplicemi, výhled na S přes Podkrušnohoří', lat: 50.6600, lon: 13.8300 },
    { name: 'Krupka – úbočí Komáří vížky', why: 'Krušnohorský hřeben, tmavá obloha, panorama', lat: 50.6900, lon: 13.8700 },
    { name: 'Bořislav – pole nad obcí', why: 'Středohoří, otevřený severní výhled', lat: 50.6200, lon: 13.8600 },
    { name: 'Duchcov – zámecký park (okraj)', why: 'Park na okraji města, nižší záře, volný S', lat: 50.6000, lon: 13.7400 },
    { name: 'Osek – klášter (okolí)', why: 'Historický klášter, les za zády, pohled na S', lat: 50.6200, lon: 13.6900 },
  ],

  'Děčín': [
    { name: 'Sněžník – rozhledna (723 m)', why: 'Nejvyšší bod Děčínska, panorama přes Polsko, Bortle 3–4', lat: 50.7900, lon: 14.0900 },
    { name: 'Pastýřská stěna – vyhlídka', why: 'Skalní stěna nad Labem, severní výhled do Německa', lat: 50.7800, lon: 14.2100 },
    { name: 'Tisá – skalní město (parkoviště)', why: 'Pískovcové labyrinty, tmavá obloha, klid', lat: 50.7700, lon: 14.0300 },
    { name: 'Vysoká Lípa – vyhlídky', why: 'České Švýcarsko, tmavá obloha, panorama SSZ', lat: 50.8600, lon: 14.2900 },
    { name: 'Dolní Žleb – u řeky', why: 'Labské údolí na hranici, výhled S do Německa', lat: 50.8300, lon: 14.2100 },
  ],

  'Chomutov': [
    { name: 'Jezerka – hrad', why: 'Kopec v Podkrušnohoří, panorama na S k horám', lat: 50.5000, lon: 13.5200 },
    { name: 'Nechranická přehrada – hráz', why: 'Vodní plocha, volný sever, nízké osvětlení', lat: 50.3700, lon: 13.3900 },
    { name: 'Hora Sv.Šebestiána – obec', why: 'Krušnohorská obec, tmavá obloha, výhled S', lat: 50.5600, lon: 13.2400 },
    { name: 'Boleboř – pole za obcí', why: 'Izolovaná poloha v Krušných horách, Bortle 3–4', lat: 50.5400, lon: 13.3500 },
    { name: 'Údlice – pole u silnice', why: 'Rovina, otevřený sever, zemědělská krajina', lat: 50.4800, lon: 13.4600 },
  ],

  'Litoměřice': [
    { name: 'Radobýl – vrch (399 m)', why: 'Čedičový kužel, panorama nad soutokem, Bortle 4', lat: 50.5300, lon: 14.0800 },
    { name: 'Porta Bohemica – vyhlídka', why: 'Skalní soutěska Labe, výhled S do údolí', lat: 50.5600, lon: 14.0300 },
    { name: 'Kamýk – kopec nad Litoměřicemi', why: 'Kopec ve Středohoří, výhled na SSZ', lat: 50.5400, lon: 14.1000 },
    { name: 'Třebenice – u sopky Boreč', why: 'Čedičový vrch, tmavé okolí, minimální zástavba', lat: 50.4800, lon: 14.0000 },
    { name: 'Terezín – pole za pevností', why: 'Rovina, otevřený horizont, historické místo', lat: 50.5100, lon: 14.1500 },
  ],

  'České středohoří': [
    { name: 'Milešovka – rozhledna (837 m)', why: 'Nejvyšší bod Středohoří, nejlepší výhled v ČR, Bortle 3–4', lat: 50.5550, lon: 13.9320 },
    { name: 'Boreč – čedičový vrch', why: 'Přírodní rezervace, panorama, tmavá obloha', lat: 50.4800, lon: 14.0000 },
    { name: 'Lovoš – kopec (570 m)', why: 'Ikonický kužel, výhled na SSZ, přístupný', lat: 50.5200, lon: 14.0200 },
    { name: 'Ostrý – vyhlídka', why: 'Čedičový hrot, panorama na sever k Labi', lat: 50.5700, lon: 13.9500 },
    { name: 'Kletečná – louka u paty kopce', why: 'Otevřená louka, severní obzor, Bortle 4', lat: 50.5300, lon: 13.9600 },
  ],

  // ══════════════════════════════════════════════════════════════════════════
  // KARLOVARSKÝ
  // ══════════════════════════════════════════════════════════════════════════

  'Karlovy Vary': [
    { name: 'Vrch Tři kříže (641 m)', why: 'Kopec nad městem, výhled přes Ohři na S', lat: 50.2400, lon: 12.8500 },
    { name: 'Svatošské skály – vyhlídka', why: 'Skalní útvar nad Ohří, tmavý les, severní koridor', lat: 50.2100, lon: 12.8800 },
    { name: 'Loket – hrad', why: 'Hradní ostroh, meandr Ohře, panorama SZ', lat: 50.1850, lon: 12.7520 },
    { name: 'Kyselka – u minerálního pramene', why: 'Údolí Ohře, les stíní město, klidné místo', lat: 50.2700, lon: 12.9900 },
    { name: 'Bečov n.T. – hrad (okolí)', why: 'Hrad nad řekou, tmavé okolí, výhled', lat: 50.0850, lon: 12.8360 },
  ],

  'Cheb': [
    { name: 'SOOS – přírodní rezervace', why: 'Rašeliniště s mofetami, nulové osvětlení, Bortle 3–4', lat: 50.1500, lon: 12.4000 },
    { name: 'Komorní hůrka – sopka', why: 'Nejmladší česká sopka, otevřená krajina, výhled S', lat: 50.1300, lon: 12.3100 },
    { name: 'Jesenice – přehrada (hráz)', why: 'Velká vodní plocha, odraz, severní výhled', lat: 50.1700, lon: 12.5500 },
    { name: 'Hazlov – pole za obcí', why: 'Hraniční krajina, tmavé nebe, rovina', lat: 50.1100, lon: 12.2500 },
    { name: 'Skalka – přehrada', why: 'Vodní plocha na Ohři, klidné místo, nízké osvětlení', lat: 50.0800, lon: 12.4600 },
  ],

  'Sokolov': [
    { name: 'Loket – hrad (nad meandrem)', why: 'Středověký hrad, panorama SZ, tmavé okolí', lat: 50.1850, lon: 12.7520 },
    { name: 'Medový vrch – rekultivace', why: 'Bývalý lom, vyvýšenina, 360° výhled', lat: 50.2000, lon: 12.6600 },
    { name: 'Krajková – pole za obcí', why: 'Otevřená krajina, volný sever, nízké Bortle', lat: 50.2300, lon: 12.6000 },
    { name: 'Horní Slavkov – kopec nad městem', why: 'Podhorská poloha, výhled na S do Slavkovského lesa', lat: 50.1400, lon: 12.8100 },
    { name: 'Svatava – u řeky', why: 'Říční údolí, les stíní Sokolov, klidné místo', lat: 50.2100, lon: 12.6500 },
  ],

  'Slavkovský les': [
    { name: 'Kladská – rašeliniště', why: 'Horské rašeliniště, Bortle 2–3, otevřený horizont, naučná stezka', lat: 50.0100, lon: 12.6800 },
    { name: 'Kynžvart – zámek (okolní lesy)', why: 'Hluboké lesy, nulové osvětlení, panorama S', lat: 50.0100, lon: 12.6200 },
    { name: 'Lázně Kynžvart – u rybníka', why: 'Vodní plocha v lese, absolutní tma', lat: 50.0000, lon: 12.6100 },
    { name: 'Mariánské Lázně – Hamelika (rozhledna)', why: 'Nad městem, les filtruje záři, výhled S', lat: 49.9700, lon: 12.7000 },
    { name: 'Teplá – klášter (pole za klášterem)', why: 'Historický klášter, izolovaná poloha, nízké Bortle', lat: 49.9800, lon: 12.8700 },
  ],

  // ══════════════════════════════════════════════════════════════════════════
  // VYSOČINA
  // ══════════════════════════════════════════════════════════════════════════

  'Jihlava': [
    { name: 'Čeřínek – rozhledna (761 m)', why: 'Nejvyšší bod Jihlavska, panorama 360°, Bortle 4', lat: 49.3800, lon: 15.5200 },
    { name: 'Kostelec – pole nad vsí', why: 'Mírná vyvýšenina, otevřený sever, nízké osvětlení', lat: 49.4200, lon: 15.5600 },
    { name: 'Stará Říše – klášter (okolí)', why: 'Izolovaný klášter, tmavé okolí, klid', lat: 49.2100, lon: 15.5900 },
    { name: 'Jihlavský Stříbrný vrch – vyhlídka', why: 'Kopec nad městem, výhled na S', lat: 49.4100, lon: 15.5800 },
    { name: 'Brtnice – kopec u hradu', why: 'Historický hrad, vyvýšenina, nízké záře', lat: 49.3000, lon: 15.6800 },
  ],

  'Třebíč': [
    { name: 'Hrotovice – kopec nad obcí', why: 'Vyvýšenina, výhled na SSZ, nízké osvětlení', lat: 49.1100, lon: 16.0600 },
    { name: 'Dalešická přehrada – hráz', why: 'Velká vodní plocha, odraz, tmavé okolí', lat: 49.1300, lon: 16.1100 },
    { name: 'Mohelno – hadcová step', why: 'Přírodní rezervace, otevřený terén, nízké Bortle', lat: 49.1100, lon: 16.1900 },
    { name: 'Náměšť n.O. – pole nad zámkem', why: 'Rovina, severní horizont bez překážek', lat: 49.2100, lon: 16.1700 },
    { name: 'Okříšky – polní cesta na S', why: 'Zemědělská krajina, volný sever', lat: 49.2200, lon: 15.7700 },
  ],

  'Žďár nad Sázavou': [
    { name: 'Zelená hora – UNESCO', why: 'Poutní kostel na kopci, panorama kolem, symbolické místo', lat: 49.5700, lon: 15.9400 },
    { name: 'Fryšavské louky', why: 'Otevřené louky, Bortle 3–4, minimální zástavba', lat: 49.5700, lon: 16.0400 },
    { name: 'Velké Dářko – hráz rybníka', why: 'Největší rybník Vysočiny, vodní plocha, odraz', lat: 49.5600, lon: 15.8900 },
    { name: 'Žákova hora – okraj pralesa', why: 'Pralesní rezervace, tmavá obloha, Bortle 3', lat: 49.6400, lon: 16.0700 },
    { name: 'Sázava – údolí nad pramenem', why: 'Pramen řeky, izolovaná poloha, absolutní klid', lat: 49.5500, lon: 15.9700 },
  ],

  'Havlíčkův Brod': [
    { name: 'Stvořidla – soutěska Sázavy', why: 'Říční soutěska, les stíní okolí, klidné místo', lat: 49.5900, lon: 15.5200 },
    { name: 'Lipnice n.S. – hrad', why: 'Mohutný hrad na kopci, panorama SZ, tmavé okolí', lat: 49.6200, lon: 15.4200 },
    { name: 'Pohled – kopec nad obcí', why: 'Mírná vyvýšenina, volný sever, nízké osvětlení', lat: 49.5800, lon: 15.5500 },
    { name: 'Květnov – polní cesta', why: 'Zemědělská krajina, otevřený horizont', lat: 49.6200, lon: 15.6200 },
    { name: 'Bartoušov – louka u Sázavy', why: 'Říční niva, vodní odraz, tmavé okolí', lat: 49.6000, lon: 15.5700 },
  ],

  'Pelhřimov': [
    { name: 'Křemešník – poutní kostel (765 m)', why: 'Vrchol s kostelem, Bortle 4, panorama 360°', lat: 49.4000, lon: 15.2700 },
    { name: 'Želiv – klášter (okolí)', why: 'Premonstrátský klášter, přehrada, klid, tmavé nebe', lat: 49.4400, lon: 15.2200 },
    { name: 'Červená Řečice – kopec za vsí', why: 'Vyvýšenina, severní výhled přes krajinu', lat: 49.3400, lon: 15.2700 },
    { name: 'Kamenice n.L. – pole', why: 'Rovina, otevřený sever, nízké osvětlení', lat: 49.3600, lon: 15.0800 },
    { name: 'Bohdalov – louka u rybníka', why: 'Vodní plocha, les filtruje záře měst', lat: 49.4800, lon: 15.9100 },
  ],

  'Žďárské vrchy': [
    { name: 'Devět skal – vrchol (836 m)', why: 'Skalní vyhlídka, Bortle 3, tmavá obloha, panorama S', lat: 49.6600, lon: 16.0800 },
    { name: 'Žákova hora – prales', why: 'Pralesní rezervace, absolutní tma, Bortle 2–3', lat: 49.6400, lon: 16.0700 },
    { name: 'Fryšavské rašeliniště', why: 'Horské rašeliniště, otevřený horizont, nulové osvětlení', lat: 49.5700, lon: 16.0400 },
    { name: 'Velké Dářko – jižní hráz', why: 'Největší rybník Vysočiny, vodní odraz, klid', lat: 49.5500, lon: 15.8900 },
    { name: 'Radostín – pole nad vsí', why: 'Otevřená krajina, severní panorama, CHKO', lat: 49.5900, lon: 15.9800 },
  ],

  // ══════════════════════════════════════════════════════════════════════════
  // STŘEDOČESKÝ – doplnění
  // ══════════════════════════════════════════════════════════════════════════

  'Benešov': [
    { name: 'Konopiště – pole nad rybníkem', why: 'Zámecký park, vodní plocha, severní výhled', lat: 49.7750, lon: 14.6600 },
    { name: 'Křížový vrch – vyhlídka', why: 'Kopec JZ od města, panorama na sever', lat: 49.7700, lon: 14.6700 },
    { name: 'Bystřice – pole u řeky Sázavy', why: 'Říční niva, otevřený sever, nízké osvětlení', lat: 49.7400, lon: 14.6600 },
    { name: 'Neveklov – kopec nad obcí', why: 'Vyvýšenina, zemědělská krajina, volný S', lat: 49.7500, lon: 14.5300 },
    { name: 'Tvoršovice – polní cesta', why: 'Rovina, minimální zástavba, otevřený horizont', lat: 49.7900, lon: 14.7200 },
  ],

  'Vlašim': [
    { name: 'Blaník – úbočí (638 m)', why: 'Legendární kopec, otevřený sever, Bortle 4', lat: 49.6600, lon: 14.9700 },
    { name: 'Vlašimský zámecký park – severní okraj', why: 'Rozsáhlý park, les stíní město, výhled S', lat: 49.7100, lon: 15.0200 },
    { name: 'Kondrac – pole nad vsí', why: 'Otevřená krajina pod Blaníkem, nízké osvětlení', lat: 49.6800, lon: 14.9600 },
    { name: 'Louňovice p.B. – hráz rybníka', why: 'Vodní plocha, odraz, tmavý horizont', lat: 49.6500, lon: 14.9200 },
    { name: 'Ostrov – louka u potoka', why: 'Posázaví, klidné místo, volný sever', lat: 49.6900, lon: 15.0500 },
  ],

  'Votice': [
    { name: 'Svatý Jan – kopec nad městem', why: 'Vyvýšenina, panorama na S, nízké osvětlení', lat: 49.6500, lon: 14.6400 },
    { name: 'Olbramovice – pole za nádražím', why: 'Rovina, volný sever, zemědělská krajina', lat: 49.6200, lon: 14.6100 },
    { name: 'Janov – louka nad údolím', why: 'Les stíní Votice, otevřený severní výhled', lat: 49.6600, lon: 14.6200 },
    { name: 'Zvěstov – pole u lesa', why: 'Okraj lesa, tmavá obloha, minimální zástavba', lat: 49.6000, lon: 14.6800 },
    { name: 'Miličín – kopec za obcí', why: 'Vyvýšenina na okraji Českomoravské vrchoviny, Bortle 4', lat: 49.5700, lon: 14.6100 },
  ],

  'Sázava': [
    { name: 'Sázavský klášter – nad řekou', why: 'Historický klášter, říční údolí, nízké osvětlení', lat: 49.8700, lon: 14.9000 },
    { name: 'Talmberk – hrad (zřícenina)', why: 'Skalní ostroh nad Sázavou, panorama S', lat: 49.8600, lon: 14.9200 },
    { name: 'Černé Budy – pole nad vsí', why: 'Otevřená krajina, volný sever, Bortle 4', lat: 49.8800, lon: 14.8800 },
    { name: 'Čeřenice – louka u řeky', why: 'Říční niva, vodní odraz, klidné místo', lat: 49.8500, lon: 14.9100 },
    { name: 'Hradec (kostel) – kopec', why: 'Vyvýšenina nad Sázavou, severní výhled', lat: 49.8900, lon: 14.9300 },
  ],

  'Hořovice': [
    { name: 'Hořovice – kopec nad zámkem', why: 'Vyvýšenina, panorama na S přes Berounsko', lat: 49.8400, lon: 13.9000 },
    { name: 'Komárov – pole za obcí', why: 'Rovina, otevřený sever, nízké osvětlení', lat: 49.8000, lon: 13.8700 },
    { name: 'Žebrák – hrad (okolí)', why: 'Kopec s hradem, výhled SZ, les stíní světla', lat: 49.8700, lon: 13.8900 },
    { name: 'Tlustice – louka nad vsí', why: 'Podhorská krajina, tmavá obloha, klid', lat: 49.8200, lon: 13.9200 },
    { name: 'Rpety – pole u lesa', why: 'Okraj brdských lesů, minimální zástavba', lat: 49.7800, lon: 13.9100 },
  ],

  'Králův Dvůr': [
    { name: 'Králův Dvůr – kopec u lomu', why: 'Vyvýšenina nad lomy, výhled na S', lat: 49.9500, lon: 14.0300 },
    { name: 'Počaply – pole nad vsí', why: 'Rovina, volný sever, nízké okolní osvětlení', lat: 49.9600, lon: 14.0100 },
    { name: 'Trubská – okraj lesa', why: 'Les blokuje záři města, otevřený S', lat: 49.9300, lon: 14.0500 },
    { name: 'Popovice – polní cesta', why: 'Zemědělská krajina, minimální zástavba', lat: 49.9400, lon: 14.0200 },
    { name: 'Suchomasty – louka u potoka', why: 'Klidné místo, vodní tok, volný horizont', lat: 49.9200, lon: 14.0600 },
  ],

  'Karlštejn': [
    { name: 'Karlštejn – pole nad hradem', why: 'Otevřená krajina nad údolím, panorama na S', lat: 49.9400, lon: 14.1900 },
    { name: 'Budňany – louka u potoka', why: 'Údolí Berounky, les stíní okolí, klid', lat: 49.9350, lon: 14.1800 },
    { name: 'Mořina – pole za obcí', why: 'Rovina, volný sever, nízké osvětlení', lat: 49.9500, lon: 14.1600 },
    { name: 'Sv.Jan p.S. – kopec', why: 'Vyvýšenina v Českém krasu, tmavá obloha', lat: 49.9300, lon: 14.1700 },
    { name: 'Amerika – lom (okolí)', why: 'Opuštěný lom, skalní stěny stíní, unikátní místo', lat: 49.9350, lon: 14.2000 },
  ],

  'Slaný': [
    { name: 'Slánská hora – vyhlídka', why: 'Čedičový vrch, panorama na S přes Polabí', lat: 50.2300, lon: 14.0900 },
    { name: 'Kvíc – pole nad obcí', why: 'Rovina, otevřený severní horizont', lat: 50.2500, lon: 14.0800 },
    { name: 'Velvary – hráz rybníka', why: 'Vodní plocha, nízké osvětlení, volný S', lat: 50.2800, lon: 14.1800 },
    { name: 'Žižice – louka u potoka', why: 'Klidné místo, zemědělská krajina', lat: 50.2400, lon: 14.1200 },
    { name: 'Vraný – pole za šlechtickou alejí', why: 'Alej stromů na okraji, otevřený S za ní', lat: 50.2600, lon: 14.0500 },
  ],

  'Unhošť': [
    { name: 'Unhošť – pole severně od obce', why: 'Rovina, otevřený sever, bez zástavby', lat: 50.1000, lon: 14.1300 },
    { name: 'Kyšice – louka za vsí', why: 'Zemědělská krajina, nízké osvětlení', lat: 50.0800, lon: 14.1100 },
    { name: 'Červený Újezd – kopec', why: 'Mírná vyvýšenina, výhled SZ', lat: 50.0700, lon: 14.1500 },
    { name: 'Malé Přítočno – pole', why: 'Rovina, minimální zástavba, volný S', lat: 50.0900, lon: 14.1600 },
    { name: 'Pavlov – okraj lesa', why: 'Les stíní Kladno, severní koridor', lat: 50.1100, lon: 14.1200 },
  ],

  'Lidice': [
    { name: 'Lidice – memoriál (pole za ním)', why: 'Otevřená krajina, silný symbolický prostor, volný S', lat: 50.1450, lon: 14.1920 },
    { name: 'Ležáky – louka nad údolím', why: 'Klidné místo, severní výhled', lat: 50.1500, lon: 14.1850 },
    { name: 'Buštěhrad – pole za zámkem', why: 'Rovina, nízké osvětlení, otevřený horizont', lat: 50.1600, lon: 14.1700 },
    { name: 'Makotřasy – pole u lesa', why: 'Okraj lesa, tmavší obloha, volný S', lat: 50.1350, lon: 14.2000 },
    { name: 'Hřebeč – kopec nad obcí', why: 'Vyvýšenina, panorama SZ', lat: 50.1550, lon: 14.2100 },
  ],

  'Český Brod': [
    { name: 'Český Brod – pole severně', why: 'Rovina, otevřený sever, Polabí', lat: 50.0800, lon: 14.8600 },
    { name: 'Přistoupim – louka u potoka', why: 'Říční niva, klidné místo, nízké osvětlení', lat: 50.0600, lon: 14.8800 },
    { name: 'Tuchoraz – pole za obcí', why: 'Zemědělská krajina, volný horizont', lat: 50.0900, lon: 14.8400 },
    { name: 'Rostoklaty – polní cesta', why: 'Rovina, otevřený S, minimální zástavba', lat: 50.0700, lon: 14.8200 },
    { name: 'Liblice – hráz rybníka', why: 'Vodní plocha, odraz, klid', lat: 50.0650, lon: 14.9000 },
  ],

  'Pečky': [
    { name: 'Pečky – pole severně u tratě', why: 'Rovina, otevřený sever, železniční krajina', lat: 50.0950, lon: 15.0400 },
    { name: 'Velim – pole za obcí', why: 'Otevřená Polabská rovina, volný horizont', lat: 50.0700, lon: 15.1000 },
    { name: 'Radim – louka u potoka', why: 'Klidné místo, nízké osvětlení', lat: 50.0800, lon: 15.0100 },
    { name: 'Plaňany – pole', why: 'Rovina, minimální zástavba na S', lat: 50.0600, lon: 15.0200 },
    { name: 'Cerhenice – polní cesta', why: 'Zemědělská krajina, volný sever', lat: 50.0550, lon: 15.0800 },
  ],

  'Zásmuky': [
    { name: 'Zásmuky – zámecký park (okraj)', why: 'Park na okraji městečka, nízké osvětlení, klid', lat: 49.9950, lon: 14.9900 },
    { name: 'Bečváry – pole nad vsí', why: 'Otevřená rovina, volný S, Bortle 4', lat: 50.0000, lon: 15.0100 },
    { name: 'Krychnov – louka', why: 'Klidné místo, les na JZ, otevřený S', lat: 49.9800, lon: 14.9700 },
    { name: 'Horka – polní cesta', why: 'Zemědělská krajina, minimální zástavba', lat: 50.0100, lon: 14.9800 },
    { name: 'Žandov – pole u lesa', why: 'Okraj lesa, tmavší obloha, panorama', lat: 49.9900, lon: 15.0200 },
  ],

  'Čáslav': [
    { name: 'Čáslav – kopec Hrádek', why: 'Vyvýšenina východně, výhled na SSZ', lat: 49.9100, lon: 15.4000 },
    { name: 'Žleby – nad zámkem', why: 'Zámecký kopec, panorama, nízké osvětlení', lat: 49.8800, lon: 15.4900 },
    { name: 'Chotusice – pole za obcí', why: 'Rovina, otevřený sever', lat: 49.9200, lon: 15.3700 },
    { name: 'Třebešice – louka u rybníka', why: 'Vodní plocha, klid, tmavý horizont', lat: 49.8900, lon: 15.4200 },
    { name: 'Výčapy – polní cesta', why: 'Zemědělská krajina, volný S, Bortle 4', lat: 49.9000, lon: 15.3500 },
  ],

  'Uhlířské Janovice': [
    { name: 'Uhlířské Janovice – kopec nad městem', why: 'Vyvýšenina, výhled na S, nízké osvětlení', lat: 49.8900, lon: 15.0600 },
    { name: 'Zbizuby – pole nad vsí', why: 'Otevřená krajina, volný sever', lat: 49.8700, lon: 15.0800 },
    { name: 'Kamenné Mosty – louka u potoka', why: 'Říční niva, klid, tmavé okolí', lat: 49.8800, lon: 15.0400 },
    { name: 'Rataje n.S. – hrad nad řekou', why: 'Skalní ostroh nad Sázavou, panorama', lat: 49.8500, lon: 14.9600 },
    { name: 'Pertoltice – pole', why: 'Zemědělská krajina, minimální zástavba, Bortle 4', lat: 49.9000, lon: 15.0300 },
  ],

  'Zruč nad Sázavou': [
    { name: 'Zruč n.S. – zámek (kopec)', why: 'Vyvýšenina nad Sázavou, severní výhled', lat: 49.7400, lon: 15.1100 },
    { name: 'Kácov – hráz rybníka', why: 'Vodní plocha, odraz, klidné místo', lat: 49.7700, lon: 15.0200 },
    { name: 'Dolní Kralovice – pole', why: 'Rovina u přehrady Švihov, otevřený S', lat: 49.7100, lon: 15.0800 },
    { name: 'Vlastějovice – louka u řeky', why: 'Říční niva Sázavy, nízké osvětlení', lat: 49.7300, lon: 15.1400 },
    { name: 'Ježov – okraj lesa', why: 'Les stíní zári, severní koridor, Bortle 4', lat: 49.7200, lon: 15.0500 },
  ],

  'Neratovice': [
    { name: 'Neratovice – pole severně u Labe', why: 'Labská rovina, otevřený S, vodní plochy', lat: 50.2700, lon: 14.5200 },
    { name: 'Obříství – hráz u soutoku', why: 'Soutok Labe a Vltavy, vodní plocha, odraz', lat: 50.2800, lon: 14.4800 },
    { name: 'Libiš – pole za obcí', why: 'Rovina, volný sever, zemědělská krajina', lat: 50.2600, lon: 14.5000 },
    { name: 'Byškovice – louka u potoka', why: 'Klidné místo, nízké osvětlení', lat: 50.2500, lon: 14.5300 },
    { name: 'Kostelec n.L. – pole', why: 'Polabí, otevřený horizont, volný S', lat: 50.2300, lon: 14.5800 },
  ],

  'Mšeno': [
    { name: 'Mšeno – Romanov (vyhlídka)', why: 'Skalní vyhlídka v Kokořínsku, tmavá obloha', lat: 50.4400, lon: 14.6300 },
    { name: 'Brusné – pole nad vsí', why: 'Vyvýšenina, otevřený S, Bortle 4', lat: 50.4500, lon: 14.6500 },
    { name: 'Lobeč – louka nad údolím', why: 'Kokořínské údolí, les stíní záři, klid', lat: 50.4200, lon: 14.6100 },
    { name: 'Kanina – polní cesta', why: 'Zemědělská krajina, volný sever', lat: 50.4300, lon: 14.6400 },
    { name: 'Houska – hrad (okolí)', why: 'Záhadný hrad v lesích, tmavé nebe, Bortle 3–4', lat: 50.4900, lon: 14.6300 },
  ],

  'Kokořínsko': [
    { name: 'Kokořín – vyhlídka nad hradem', why: 'Skalní vyhlídka, panorama, tmavé pískovcové údolí', lat: 50.4420, lon: 14.5700 },
    { name: 'Vidim – kopec nad obcí', why: 'Vyvýšenina, otevřený S, les stíní okolí', lat: 50.4200, lon: 14.5600 },
    { name: 'Nedamov – skalní rozcestí', why: 'Pískovcové skály, nulové osvětlení, Bortle 3–4', lat: 50.4500, lon: 14.5800 },
    { name: 'Harasov – louka u potoka', why: 'Říční údolí, klid, tmavá obloha', lat: 50.4300, lon: 14.5500 },
    { name: 'Vojtěchov – pole na plošině', why: 'Otevřená plošina nad pískovci, volný S', lat: 50.4600, lon: 14.5900 },
  ],

  'Mnichovo Hradiště': [
    { name: 'Mnichovo Hradiště – kopec nad zámkem', why: 'Vyvýšenina, výhled S, nízké osvětlení', lat: 50.5300, lon: 15.0100 },
    { name: 'Klášter Hradiště – pole za klášterem', why: 'Otevřená krajina, volný sever', lat: 50.5200, lon: 15.0200 },
    { name: 'Žďár – louka nad údolím', why: 'Podhorská krajina, les stíní město', lat: 50.5400, lon: 15.0300 },
    { name: 'Boseň – pole za vsí', why: 'Zemědělská krajina, nízké osvětlení, Bortle 4', lat: 50.5100, lon: 14.9800 },
    { name: 'Dneboh – vyhlídka', why: 'Český ráj, skalní vyhlídka, tmavá obloha', lat: 50.5500, lon: 15.0600 },
  ],

  'Bělá pod Bezdězem': [
    { name: 'Bezděz – úbočí hradu', why: 'Ikonický hrad, z parkoviště výhled na SZ, Bortle 4', lat: 50.5350, lon: 14.7200 },
    { name: 'Bělá p.B. – pole severně', why: 'Rovina, otevřený S k Jizerským horám', lat: 50.5100, lon: 14.8100 },
    { name: 'Máchovo jezero – Doksy (břeh)', why: 'Vodní plocha, odraz, nízké osvětlení', lat: 50.5800, lon: 14.6600 },
    { name: 'Plužná – louka u potoka', why: 'Klidné místo, les na JZ stíní záři', lat: 50.5200, lon: 14.7800 },
    { name: 'Bezdědice – pole', why: 'Otevřená krajina, volný sever, Bortle 4', lat: 50.5000, lon: 14.7500 },
  ],

  'Bezděz': [
    { name: 'Bezděz – parkoviště pod hradem', why: 'Pod ikonickým hradem, otevřený SZ, Bortle 4', lat: 50.5350, lon: 14.7200 },
    { name: 'Velký Bezděz – kopec (604 m)', why: 'Dominantní kopec, panorama 360°', lat: 50.5380, lon: 14.7180 },
    { name: 'Malý Bezděz – sedlo', why: 'Sedlo mezi kopci, otevřený S', lat: 50.5320, lon: 14.7220 },
    { name: 'Doksy – Staré Splavy (břeh)', why: 'Vodní plocha, severní výhled přes jezero', lat: 50.5700, lon: 14.6500 },
    { name: 'Houska – přístupová cesta', why: 'Lesní cesta, tmavé nebe, Bortle 3–4', lat: 50.4900, lon: 14.6300 },
  ],

  'Nymburk': [
    { name: 'Nymburk – pole severně za Labem', why: 'Polabí, otevřený sever, rovina', lat: 50.1950, lon: 15.0400 },
    { name: 'Poděbradka – hráz rybníka', why: 'Vodní plocha, odraz, klidné místo', lat: 50.1800, lon: 15.0600 },
    { name: 'Bobnice – pole za vsí', why: 'Zemědělská krajina, volný horizont', lat: 50.2000, lon: 15.0200 },
    { name: 'Krchleby – louka u potoka', why: 'Rovina, nízké osvětlení, klid', lat: 50.1700, lon: 15.0800 },
    { name: 'Kostomlaty n.L. – pole', why: 'Polabská rovina, otevřený S', lat: 50.2100, lon: 15.0100 },
  ],

  'Poděbrady': [
    { name: 'Poděbrady – labský břeh (severní)', why: 'Vodní plocha, říční niva, otevřený S', lat: 50.1500, lon: 15.1200 },
    { name: 'Pátek – pole za obcí', why: 'Rovina, volný sever, nízké osvětlení', lat: 50.1600, lon: 15.0800 },
    { name: 'Choťánky – louka u Labe', why: 'Říční niva, klid, tmavší obloha', lat: 50.1400, lon: 15.1400 },
    { name: 'Libice n.C. – pole', why: 'Soutok Cidliny a Labe, vodní krajina', lat: 50.1300, lon: 15.1700 },
    { name: 'Odřepsy – polní cesta', why: 'Zemědělská krajina, otevřený horizont', lat: 50.1200, lon: 15.0900 },
  ],

  'Lysá nad Labem': [
    { name: 'Lysá n.L. – zámecký park (okraj)', why: 'Park, nižší záře, volný sever', lat: 50.2050, lon: 14.8400 },
    { name: 'Čelákovice – pole za obcí', why: 'Polabí, rovina, otevřený S', lat: 50.1600, lon: 14.7500 },
    { name: 'Přerov n.L. – Labská niva', why: 'Říční niva, vodní plochy, odraz', lat: 50.1700, lon: 14.8200 },
    { name: 'Semice – pole u potoka', why: 'Klidné místo, nízké osvětlení', lat: 50.2200, lon: 14.8600 },
    { name: 'Stratov – louka', why: 'Polabská rovina, volný horizont, Bortle 5', lat: 50.2300, lon: 14.8800 },
  ],

  'Sadská': [
    { name: 'Sadská – pole severně od obce', why: 'Rovina, otevřený S, minimální zástavba, Bortle 4', lat: 50.2100, lon: 14.9900 },
    { name: 'Zvěřínek – louka u lesa', why: 'Les blokuje záři, volný sever', lat: 50.2000, lon: 15.0100 },
    { name: 'Žehuň – obora (okraj)', why: 'Přírodní rezervace, tmavé nebe, klid', lat: 50.1600, lon: 15.0300 },
    { name: 'Choťovice – pole', why: 'Zemědělská krajina, nízké osvětlení', lat: 50.1800, lon: 15.0500 },
    { name: 'Ratenice – polní cesta', why: 'Rovina, volný horizont na S', lat: 50.1900, lon: 14.9700 },
  ],

  'Říčany': [
    { name: 'Říčany – pole severně za městem', why: 'Otevřená krajina, volný S, Bortle 6', lat: 50.0000, lon: 14.6600 },
    { name: 'Vojkov – louka nad údolím', why: 'Údolí stíní Prahu, výhled na SSZ', lat: 49.9700, lon: 14.6400 },
    { name: 'Mnichovice – pole za obcí', why: 'Rovina, nízké osvětlení, volný sever', lat: 49.9400, lon: 14.7100 },
    { name: 'Ondřejov – hvězdárna (okolí)', why: 'Astronomická tradice, observatoř, Bortle 5', lat: 49.9100, lon: 14.7800 },
    { name: 'Tehov – kopec nad obcí', why: 'Mírná vyvýšenina, panorama', lat: 49.9800, lon: 14.6800 },
  ],

  'Brandýs n. L.': [
    { name: 'Brandýs n.L. – pole za zámkem', why: 'Labská rovina, otevřený S', lat: 50.1900, lon: 14.6600 },
    { name: 'Stará Boleslav – pole u baziliky', why: 'Historické místo, rovina, volný sever', lat: 50.1950, lon: 14.6800 },
    { name: 'Zápy – louka u Labe', why: 'Říční niva, vodní plocha, odraz', lat: 50.2000, lon: 14.6400 },
    { name: 'Toušeň – pole za vsí', why: 'Rovina, otevřený horizont, nízké osvětlení', lat: 50.1700, lon: 14.7200 },
    { name: 'Jenštejn – kopec u hradu', why: 'Vyvýšenina, výhled na SSZ', lat: 50.1600, lon: 14.6200 },
  ],

  'Černošice': [
    { name: 'Černošice – kopec nad Berounkou', why: 'Vyvýšenina, výhled přes údolí, les stíní Prahu', lat: 49.9650, lon: 14.3200 },
    { name: 'Karlík – vyhlídka nad Berounkou', why: 'Skalní ostroh, výhled SZ', lat: 49.9500, lon: 14.2900 },
    { name: 'Dobřichovice – pole nad vsí', why: 'Kopec, panorama, nízké osvětlení', lat: 49.9300, lon: 14.2700 },
    { name: 'Všenory – louka u potoka', why: 'Údolí, klid, les stíní záři Prahy', lat: 49.9400, lon: 14.3100 },
    { name: 'Vonoklasy – pole', why: 'Otevřená krajina JZ od Prahy, výhled S', lat: 49.9700, lon: 14.2800 },
  ],

  'Dobříš': [
    { name: 'Dobříš – zámecký park (severní okraj)', why: 'Rozsáhlý park, les stíní město, klid', lat: 49.7850, lon: 14.1700 },
    { name: 'Borotice – pole nad vsí', why: 'Otevřená krajina, volný S, Bortle 5', lat: 49.8000, lon: 14.1500 },
    { name: 'Stará Huť – okraj brdských lesů', why: 'Přechod do Brd, tmavší obloha', lat: 49.7600, lon: 14.1900 },
    { name: 'Nová Ves p.P. – louka', why: 'Klidné místo, nízké osvětlení', lat: 49.7700, lon: 14.2100 },
    { name: 'Obořiště – pole u potoka', why: 'Zemědělská krajina, volný sever', lat: 49.7500, lon: 14.1600 },
  ],

  'Sedlčany': [
    { name: 'Sedlčany – kopec za nemocnicí', why: 'Vyvýšenina, panorama S, nízké osvětlení', lat: 49.6650, lon: 14.4300 },
    { name: 'Příčovy – louka nad Vltavou', why: 'Říční údolí, výhled na S, klid', lat: 49.6800, lon: 14.4100 },
    { name: 'Krásná Hora n.V. – pole', why: 'Rovina, otevřený S, Bortle 4', lat: 49.6300, lon: 14.2800 },
    { name: 'Vysoký Chlumec – hrad', why: 'Kopec s hradem, panorama, tmavé okolí', lat: 49.6100, lon: 14.4500 },
    { name: 'Petrovice – polní cesta', why: 'Zemědělská krajina, volný horizont', lat: 49.6500, lon: 14.4600 },
  ],

  'Brdy – Kolvín': [
    { name: 'Kolvín – vrchol (718 m)', why: 'Brdský vrch, Bortle 3, extrémní tma', lat: 49.7400, lon: 13.9300 },
    { name: 'Třemšín – rozhledna (827 m)', why: 'Sousední brdský vrchol, panorama 360°', lat: 49.5700, lon: 13.7980 },
    { name: 'Tok – brdská louka', why: 'Otevřená louka v lesích, absolutní tma', lat: 49.7200, lon: 13.9100 },
    { name: 'Obecnice – okraj Brd', why: 'Přechod do Brd, les blokuje osvětlení', lat: 49.7100, lon: 13.9500 },
    { name: 'Bohutín – pole u potoka', why: 'Klidné místo na okraji CHKO, volný S', lat: 49.6900, lon: 13.9700 },
  ],

  'Rakovník': [
    { name: 'Rakovník – kopec nad pivovarem', why: 'Vyvýšenina, výhled S, nízké osvětlení', lat: 50.1100, lon: 13.7300 },
    { name: 'Lišany – pole za obcí', why: 'Rovina, otevřený sever, zemědělská krajina', lat: 50.1300, lon: 13.7500 },
    { name: 'Krušovice – louka u potoka', why: 'Klidné místo, nízké okolní osvětlení', lat: 50.1200, lon: 13.7100 },
    { name: 'Čistá – pole nad vsí', why: 'Otevřená krajina, volný S, Bortle 4', lat: 50.0800, lon: 13.6900 },
    { name: 'Kněževes – kopec', why: 'Mírná vyvýšenina, panorama SZ', lat: 50.1400, lon: 13.7000 },
  ],

  'Jesenice': [
    { name: 'Jesenice – hráz rybníka', why: 'Vodní plocha, odraz, klidné místo', lat: 50.0200, lon: 13.6200 },
    { name: 'Krašovice – pole nad obcí', why: 'Otevřená krajina, volný S', lat: 50.0100, lon: 13.6400 },
    { name: 'Krakovec – hrad (zřícenina)', why: 'Historický hrad, les stíní okolí, Bortle 4', lat: 50.0400, lon: 13.6000 },
    { name: 'Broumy – louka u potoka', why: 'Klidné místo, nízké osvětlení, klid', lat: 49.9900, lon: 13.8000 },
    { name: 'Městečko – polní cesta', why: 'Rovina, otevřený horizont na S', lat: 50.0000, lon: 13.6500 },
  ],

  'Křivoklátsko': [
    { name: 'Křivoklát – vyhlídka nad Berounkou', why: 'Hluboký les, říční údolí, Bortle 3', lat: 50.0100, lon: 13.8700 },
    { name: 'Skryje – pole nad obcí', why: 'Izolovaná obec v CHKO, otevřený S', lat: 49.9600, lon: 13.7600 },
    { name: 'Branov – louka u řeky', why: 'Berounka, vodní odraz, absolutní klid', lat: 49.9700, lon: 13.8300 },
    { name: 'Pustověty – lesní louka', why: 'Otevřená mýtina v lese, nulové osvětlení', lat: 50.0200, lon: 13.8500 },
    { name: 'Velká Buková – pole nad vsí', why: 'CHKO, tmavé nebe, volný horizont', lat: 50.0300, lon: 13.8200 },
  ],

  // ══════════════════════════════════════════════════════════════════════════
  // JIHOMORAVSKÝ – doplnění
  // ══════════════════════════════════════════════════════════════════════════

  'Boskovice': [
    { name: 'Boskovice – hrad (zřícenina)', why: 'Kopec nad městem, panorama na S, Bortle 5', lat: 49.4900, lon: 16.6600 },
    { name: 'Letovice – pole nad přehradou', why: 'Vodní plocha, severní výhled, klid', lat: 49.5500, lon: 16.5700 },
    { name: 'Jevíčko – pole za obcí', why: 'Rovina, otevřený S, nízké osvětlení', lat: 49.6300, lon: 16.7100 },
    { name: 'Kunštát – zámek (okolí)', why: 'Kopec nad údolím, panorama SZ', lat: 49.5100, lon: 16.5200 },
    { name: 'Skalice n.S. – louka', why: 'Klidné místo, les stíní město', lat: 49.4700, lon: 16.6800 },
  ],

  'Jedovnice': [
    { name: 'Jedovnice – hráz rybníka Olšovec', why: 'Vodní plocha, odraz, klidné místo', lat: 49.3450, lon: 16.7500 },
    { name: 'Rudice – krasová plošina', why: 'Moravský kras, minimální zástavba, Bortle 4', lat: 49.3500, lon: 16.7400 },
    { name: 'Kotvrdovice – pole nad vsí', why: 'Otevřená krajina, volný S', lat: 49.3300, lon: 16.7600 },
    { name: 'Ostrov u Macochy – pole', why: 'Krasová rovina, nízké osvětlení', lat: 49.3700, lon: 16.7600 },
    { name: 'Vilémovice – louka u silnice', why: 'Podkrasová krajina, tmavé nebe, klid', lat: 49.3600, lon: 16.7300 },
  ],

  'Sloup v Mor. krasu': [
    { name: 'Sloup – jeskyně (parkoviště nad)', why: 'Krasová plošina, les stíní okolí, Bortle 4', lat: 49.4150, lon: 16.7400 },
    { name: 'Holštejn – nad propastí', why: 'Skalní most, unikátní místo, tmavé nebe', lat: 49.4000, lon: 16.7600 },
    { name: 'Šošůvka – pole nad vsí', why: 'Otevřená krajina, volný S', lat: 49.4050, lon: 16.7300 },
    { name: 'Ostrov – louka u řeky Punkvy', why: 'Říční údolí, klidné místo, nízké osvětlení', lat: 49.3800, lon: 16.7500 },
    { name: 'Baldovec – polní cesta', why: 'Zemědělská krajina, Bortle 4, panorama', lat: 49.4200, lon: 16.7200 },
  ],

  'Tišnov': [
    { name: 'Tišnov – Květnice (kopec)', why: 'Přírodní rezervace nad městem, výhled SSZ', lat: 49.3550, lon: 16.4200 },
    { name: 'Předklášteří – Porta coeli (okolí)', why: 'Klášter, park, nízké osvětlení', lat: 49.3600, lon: 16.4100 },
    { name: 'Lomnice – pole nad obcí', why: 'Otevřená krajina, volný S, Bortle 5', lat: 49.4000, lon: 16.4100 },
    { name: 'Nedvědice – hrad (úbočí)', why: 'Pernštejn nedaleko, les stíní záři', lat: 49.4500, lon: 16.3400 },
    { name: 'Deblín – louka u lesa', why: 'Klidné místo, tmavá obloha, panorama', lat: 49.3400, lon: 16.3600 },
  ],

  'Ivančice': [
    { name: 'Ivančice – kopec nad Jihlavou', why: 'Říční údolí, vyvýšenina, volný S', lat: 49.1050, lon: 16.3800 },
    { name: 'Oslavany – pole nad řekou', why: 'Říční niva, otevřený sever', lat: 49.1200, lon: 16.3300 },
    { name: 'Řeznovice – louka', why: 'Klidné místo, nízké osvětlení, Bortle 5', lat: 49.0900, lon: 16.4100 },
    { name: 'Dolní Kounice – kopec nad klášterem', why: 'Rosa Coeli, vyvýšenina, panorama SZ', lat: 49.0700, lon: 16.4600 },
    { name: 'Letkovice – pole za vsí', why: 'Zemědělská krajina, volný horizont', lat: 49.0800, lon: 16.3500 },
  ],

  'Rosice': [
    { name: 'Rosice – hrad (kopec)', why: 'Vyvýšenina, výhled na S, nízké osvětlení', lat: 49.1850, lon: 16.3850 },
    { name: 'Zastávka – pole za obcí', why: 'Rovina, otevřený S, Bortle 5', lat: 49.1900, lon: 16.3600 },
    { name: 'Říčany – louka u potoka', why: 'Klidné místo, les stíní záři Brna', lat: 49.2100, lon: 16.4000 },
    { name: 'Zbýšov – pole nad obcí', why: 'Mírná vyvýšenina, volný sever', lat: 49.1600, lon: 16.3700 },
    { name: 'Tetčice – okraj lesa', why: 'Les blokuje záři, severní koridor', lat: 49.1700, lon: 16.3400 },
  ],

  'Kuřim': [
    { name: 'Kuřim – pole severně od města', why: 'Rovina, otevřený S, Bortle 5', lat: 49.3050, lon: 16.5300 },
    { name: 'Lelekovice – Babí lom', why: 'Vyhlídka, les stíní Brno, tmavé nebe', lat: 49.2800, lon: 16.5500 },
    { name: 'Lipůvka – louka nad údolím', why: 'Podhorská krajina, volný SSZ', lat: 49.3200, lon: 16.5700 },
    { name: 'Čebín – kopec nad obcí', why: 'Vyvýšenina, panorama, nízké osvětlení', lat: 49.3100, lon: 16.4800 },
    { name: 'Jinačovice – pole u lesa', why: 'Okraj lesa, severní koridor, klid', lat: 49.2700, lon: 16.5100 },
  ],

  'Mikulov': [
    { name: 'Svatý kopeček – vyhlídka', why: 'Kopec nad Mikulovem, panorama na S přes vinice', lat: 48.8100, lon: 16.6400 },
    { name: 'Turold – kopec nad městem', why: 'Krasový vrch, 360° výhled', lat: 48.8000, lon: 16.6300 },
    { name: 'Sedlec – Rendez-vous (okolí)', why: 'Lednický park, otevřená krajina, nízké osvětlení', lat: 48.7800, lon: 16.7300 },
    { name: 'Bavory – vinařský kopec', why: 'Vinice na kopci, severní výhled', lat: 48.8200, lon: 16.6700 },
    { name: 'Nový Přerov – pole za vsí', why: 'Rovina, volný S, zemědělská krajina', lat: 48.7500, lon: 16.6000 },
  ],

  'Hustopeče': [
    { name: 'Hustopeče – kopec nad vinicí', why: 'Vinařský kopec, výhled na SSZ', lat: 48.9450, lon: 16.7400 },
    { name: 'Bořetice – vinice Na Kraví hoře', why: 'Vyvýšenina, panorama, nízké osvětlení', lat: 48.9300, lon: 16.8300 },
    { name: 'Velké Pavlovice – vinařská louka', why: 'Vinná oblast, otevřený S, Bortle 5', lat: 48.9000, lon: 16.8200 },
    { name: 'Nikolčice – pole za vsí', why: 'Rovina, volný sever', lat: 48.9200, lon: 16.7100 },
    { name: 'Strachotín – nad Věstonickou přehradou', why: 'Vodní plocha, odraz, severní horizont', lat: 48.8800, lon: 16.6500 },
  ],

  'Kyjov': [
    { name: 'Kyjov – kopec nad městem (SZ)', why: 'Vyvýšenina, výhled na SZ přes Moravu', lat: 49.0150, lon: 17.1200 },
    { name: 'Svatobořice – pole za vsí', why: 'Rovina, otevřený S, nízké osvětlení', lat: 48.9700, lon: 17.0900 },
    { name: 'Milotice – zámek (okolí)', why: 'Barokní zámek, park, tmavé okolí', lat: 48.9600, lon: 17.1400 },
    { name: 'Bohuslavice – louka', why: 'Klidné místo, les stíní záři, volný S', lat: 49.0000, lon: 17.0700 },
    { name: 'Kelčany – polní cesta', why: 'Zemědělská krajina, otevřený horizont', lat: 49.0300, lon: 17.1000 },
  ],

  'Veselí nad Moravou': [
    { name: 'Veselí n.M. – hráz nad Moravou', why: 'Říční niva, vodní plocha, otevřený S', lat: 48.9550, lon: 17.3800 },
    { name: 'Strážnice – zámek (okolí)', why: 'Park u zámku, folklorní tradice, nízké osvětlení', lat: 48.9000, lon: 17.3200 },
    { name: 'Blatnice p.Sv.A. – pole', why: 'Úpatí Bílých Karpat, otevřený S', lat: 48.9200, lon: 17.4200 },
    { name: 'Vnorovy – louka u řeky', why: 'Říční niva Moravy, klid, tmavá obloha', lat: 48.9400, lon: 17.3500 },
    { name: 'Žeravice – pole za vsí', why: 'Zemědělská krajina, volný horizont', lat: 48.9300, lon: 17.3000 },
  ],

  'Mutěnice': [
    { name: 'Mutěnice – vinařský kopec', why: 'Vinná oblast, otevřený SZ, Bortle 4', lat: 48.9050, lon: 17.0250 },
    { name: 'Dubňany – pole za obcí', why: 'Rovina, volný S, nízké osvětlení', lat: 48.9200, lon: 17.0800 },
    { name: 'Hovorany – louka u potoka', why: 'Klidné místo, zemědělská krajina', lat: 48.9300, lon: 17.0100 },
    { name: 'Čejkovice – nad Templářskými sklepy', why: 'Vinařský kopec, panorama S', lat: 48.9100, lon: 16.9600 },
    { name: 'Prušánky – pole u lesa', why: 'Okraj lesa, tmavší obloha, volný S', lat: 48.8800, lon: 17.0400 },
  ],

  'Slavkov u Brna': [
    { name: 'Slavkov – Mohyla míru (Pratecký kopec)', why: 'Historický kopec, panorama 360°, symbolické místo', lat: 49.1300, lon: 16.8600 },
    { name: 'Slavkov – zámek (park)', why: 'Barokní park, nízké osvětlení, výhled S', lat: 49.1530, lon: 16.8770 },
    { name: 'Hodějice – pole za vsí', why: 'Rovina, otevřený S, zemědělská krajina', lat: 49.1100, lon: 16.8900 },
    { name: 'Křenovice – louka u potoka', why: 'Klidné místo, nízké osvětlení', lat: 49.1700, lon: 16.8500 },
    { name: 'Rousínov – pole severně', why: 'Vyškovská brána, otevřený horizont', lat: 49.2000, lon: 16.8800 },
  ],

  'Bučovice': [
    { name: 'Bučovice – zámek (okolí)', why: 'Renesanční zámek, park, nízké osvětlení', lat: 49.1500, lon: 17.0000 },
    { name: 'Kloboučky – pole nad vsí', why: 'Vyvýšenina, výhled na SZ, Bortle 5', lat: 49.1600, lon: 17.0200 },
    { name: 'Ždánice – pole za obcí', why: 'Ždánický les, otevřený S', lat: 49.0700, lon: 17.0300 },
    { name: 'Nesovice – louka', why: 'Klidné místo, volný horizont', lat: 49.1400, lon: 16.9700 },
    { name: 'Letošov – polní cesta', why: 'Zemědělská krajina, nízké osvětlení', lat: 49.1300, lon: 17.0400 },
  ],

  'Drahanská vrchovina': [
    { name: 'Drahany – kopec nad obcí', why: 'Vrchovina, Bortle 3, extrémní tma', lat: 49.3550, lon: 16.8500 },
    { name: 'Hamiltony – louka', why: 'Bývalý vojenský prostor, nulové osvětlení', lat: 49.3700, lon: 16.8300 },
    { name: 'Laškov – pole nad vsí', why: 'Otevřená krajina, volný S, Bortle 3', lat: 49.5200, lon: 16.9200 },
    { name: 'Bousín – lesní louka', why: 'Mýtina v lesích, absolutní tma', lat: 49.4500, lon: 16.8700 },
    { name: 'Niva – polní cesta', why: 'Zemědělská vyvýšenina, panorama S', lat: 49.4000, lon: 16.8600 },
  ],

  'Moravský Krumlov': [
    { name: 'Moravský Krumlov – kopec nad městem', why: 'Vyvýšenina, výhled na S, Bortle 5', lat: 49.0550, lon: 16.3100 },
    { name: 'Rakšice – pole za obcí', why: 'Rovina, otevřený S, nízké osvětlení', lat: 49.0800, lon: 16.3300 },
    { name: 'Vedrovice – louka nad vsí', why: 'Podhorská krajina, volný S', lat: 49.0300, lon: 16.3400 },
    { name: 'Miroslavské kopce – step', why: 'Přírodní rezervace, otevřený horizont', lat: 48.9500, lon: 16.3200 },
    { name: 'Jamolice – pole u potoka', why: 'Zemědělská krajina, klidné místo, Bortle 4', lat: 49.0600, lon: 16.2700 },
  ],

  'Vranov nad Dyjí': [
    { name: 'Vranov – hráz přehrady', why: 'Velká vodní plocha, odraz, výhled S', lat: 48.8900, lon: 15.8200 },
    { name: 'Šumná – pole nad obcí', why: 'Vyvýšenina, volný S, Bortle 4', lat: 48.8700, lon: 15.7800 },
    { name: 'Vranovská pláž', why: 'Břeh přehrady, vodní odraz, klid', lat: 48.8850, lon: 15.8400 },
    { name: 'Bítov – hrad (okolí)', why: 'Ostroh nad přehradou, panorama', lat: 48.9500, lon: 15.6900 },
    { name: 'Onšov – pole za vsí', why: 'Izolovaná obec, nízké osvětlení, Bortle 4', lat: 48.9200, lon: 15.7500 },
  ],

  // ══════════════════════════════════════════════════════════════════════════
  // MORAVSKOSLEZSKÝ – doplnění
  // ══════════════════════════════════════════════════════════════════════════

  'Bruntál': [
    { name: 'Bruntál – kopec nad zámkem', why: 'Vyvýšenina, výhled na S k Jeseníkům, Bortle 5', lat: 49.9900, lon: 17.4650 },
    { name: 'Světlá Hora – pole za obcí', why: 'Podhorská krajina, tmavá obloha', lat: 50.0200, lon: 17.4000 },
    { name: 'Horní Město – kopec nad vsí', why: 'Drahanská vrchovina, volný S, Bortle 4', lat: 49.9400, lon: 17.3500 },
    { name: 'Razová – vodní nádrž (hráz)', why: 'Vodní plocha, odraz, klidné místo', lat: 49.9600, lon: 17.5200 },
    { name: 'Andělská Hora – hrad', why: 'Zřícenina na kopci, panorama SZ', lat: 49.9700, lon: 17.4000 },
  ],

  'Krnov': [
    { name: 'Krnov – Cvilín (kopec)', why: 'Poutní místo nad městem, výhled na S do Polska', lat: 50.0950, lon: 17.7000 },
    { name: 'Linhartovy – pole za obcí', why: 'Otevřená krajina, volný S přes hranici', lat: 50.1200, lon: 17.6800 },
    { name: 'Úvalno – louka u potoka', why: 'Klidné místo, nízké osvětlení', lat: 50.0700, lon: 17.7300 },
    { name: 'Dalešice – pole', why: 'Zemědělská krajina, Bortle 4, volný S', lat: 50.1100, lon: 17.7500 },
    { name: 'Osoblaha – kopec nad vsí', why: 'Hraniční oblast, tmavé nebe, panorama', lat: 50.2700, lon: 17.7100 },
  ],

  'Rýmařov': [
    { name: 'Rýmařov – kopec nad městem', why: 'Vyvýšenina, výhled na S, Bortle 4', lat: 49.9350, lon: 17.2700 },
    { name: 'Břidličná – pole za vsí', why: 'Podhorská krajina, otevřený S', lat: 49.9100, lon: 17.3700 },
    { name: 'Malá Morávka – parkoviště', why: 'Horské údolí pod Pradědem, tmavé nebe', lat: 50.0500, lon: 17.2600 },
    { name: 'Stará Ves – louka u potoka', why: 'Klidné místo, nízké osvětlení, Bortle 4', lat: 49.9200, lon: 17.3100 },
    { name: 'Dolní Moravice – pole', why: 'Jesenické předhůří, volný S k horám', lat: 49.9800, lon: 17.3000 },
  ],

  'Frýdlant nad Ostravicí': [
    { name: 'Frýdlant n.O. – kopec u zámku', why: 'Vyvýšenina, výhled na S přes město', lat: 49.5900, lon: 18.3600 },
    { name: 'Ostravice – pole u řeky', why: 'Říční údolí, les stíní záři, Bortle 5', lat: 49.5600, lon: 18.3900 },
    { name: 'Pržno – louka nad vsí', why: 'Podhorská krajina, volný SSZ', lat: 49.5700, lon: 18.3400 },
    { name: 'Čeladná – Kamenec (sedlo)', why: 'Beskydské sedlo, tmavá obloha, výhled', lat: 49.5500, lon: 18.3200 },
    { name: 'Malenovice – pole za obcí', why: 'Otevřená krajina, severní horizont', lat: 49.5800, lon: 18.3100 },
  ],

  'Třinec': [
    { name: 'Třinec – Jahodná (kopec)', why: 'Vyvýšenina, výhled SSZ, les stíní hutní záři', lat: 49.6800, lon: 18.6700 },
    { name: 'Vendryně – pole nad vsí', why: 'Podhorská krajina, volný S', lat: 49.6500, lon: 18.6900 },
    { name: 'Bystřice – louka u řeky Olše', why: 'Říční niva, klid, nízké osvětlení', lat: 49.6300, lon: 18.7100 },
    { name: 'Ropice – pole za obcí', why: 'Rovina, otevřený S, Bortle 5', lat: 49.6900, lon: 18.6200 },
    { name: 'Nýdek – nad lázněmi', why: 'Podhorská poloha, tmavší obloha', lat: 49.6600, lon: 18.7500 },
  ],

  'Jablunkov': [
    { name: 'Jablunkov – kopec nad nádražím', why: 'Vyvýšenina, výhled SSZ přes údolí', lat: 49.5750, lon: 18.7650 },
    { name: 'Mosty u Jabl. – pole za obcí', why: 'Podhorská krajina, volný S, Bortle 5', lat: 49.5500, lon: 18.7800 },
    { name: 'Bukovec – louka nad vsí', why: 'Beskydy, les stíní města, tmavé nebe', lat: 49.5300, lon: 18.8000 },
    { name: 'Hrčava – pole u hranic', why: 'Trojmezí CZ/SK/PL, izolovaná poloha', lat: 49.5100, lon: 18.8400 },
    { name: 'Návsí – louka u řeky', why: 'Říční niva, klidné místo', lat: 49.5900, lon: 18.7400 },
  ],

  'Havířov': [
    { name: 'Havířov – Těrlicko (hráz přehrady)', why: 'Vodní plocha, odraz, severní výhled', lat: 49.7500, lon: 18.4800 },
    { name: 'Bludovice – kopec nad vsí', why: 'Vyvýšenina, les stíní městskou záři', lat: 49.7600, lon: 18.4500 },
    { name: 'Šenov – pole za obcí', why: 'Otevřená krajina, volný SSZ', lat: 49.7900, lon: 18.3800 },
    { name: 'Horní Suchá – louka', why: 'Klidné místo, nízké osvětlení', lat: 49.7800, lon: 18.4700 },
    { name: 'Životice – memoriál (pole)', why: 'Historické místo, rovina, volný S', lat: 49.7400, lon: 18.4400 },
  ],

  'Český Těšín': [
    { name: 'Český Těšín – kopec nad řekou Olší', why: 'Vyvýšenina, výhled na S, hraniční krajina', lat: 49.7500, lon: 18.6300 },
    { name: 'Chotěbuz – pole za vsí', why: 'Otevřená krajina, volný sever', lat: 49.7300, lon: 18.5800 },
    { name: 'Stanislavice – louka', why: 'Klidné místo, Bortle 5, nízké osvětlení', lat: 49.7400, lon: 18.6100 },
    { name: 'Koňákov – pole u lesa', why: 'Les stíní městskou záři, otevřený S', lat: 49.7600, lon: 18.6500 },
    { name: 'Mistřovice – polní cesta', why: 'Zemědělská krajina, volný horizont', lat: 49.7200, lon: 18.6400 },
  ],

  'Orlová': [
    { name: 'Orlová – kopec Žermanice', why: 'Přehrada Žermanice, vodní plocha, výhled S', lat: 49.8200, lon: 18.4300 },
    { name: 'Lazy – pole severně', why: 'Otevřená krajina, volný S', lat: 49.8500, lon: 18.4100 },
    { name: 'Doubrava – louka za obcí', why: 'Klidné místo, nízké osvětlení', lat: 49.8600, lon: 18.4500 },
    { name: 'Petřvald – pole u lesa', why: 'Les blokuje záři, Bortle 5', lat: 49.8300, lon: 18.3800 },
    { name: 'Poruba – polní cesta na okraji', why: 'Zemědělská krajina, otevřený horizont', lat: 49.8400, lon: 18.4600 },
  ],

  'Kopřivnice': [
    { name: 'Kopřivnice – Štramberk (Trúba rozhledna)', why: 'Skalní věž, panorama 360°, Bortle 5', lat: 49.5920, lon: 18.1170 },
    { name: 'Příbor – pole za městem', why: 'Rovina, otevřený S, Bortle 5', lat: 49.6400, lon: 18.1500 },
    { name: 'Vlčovice – louka nad údolím', why: 'Podhorská krajina, les stíní město', lat: 49.6100, lon: 18.1200 },
    { name: 'Závišice – pole za vsí', why: 'Zemědělská krajina, volný S', lat: 49.6200, lon: 18.0900 },
    { name: 'Mniší – kopec nad obcí', why: 'Vyvýšenina, panorama SSZ', lat: 49.6000, lon: 18.1600 },
  ],

  'Frenštát p. Radh.': [
    { name: 'Frenštát – Pustevny (sedlo)', why: 'Beskydské sedlo, tmavá obloha, Bortle 4', lat: 49.5050, lon: 18.2600 },
    { name: 'Trojanovice – louka pod Radhoštěm', why: 'Podhorská louka, výhled SZ, klid', lat: 49.5200, lon: 18.2400 },
    { name: 'Tichá – pole za vsí', why: 'Otevřená krajina, volný S', lat: 49.5700, lon: 18.2200 },
    { name: 'Kunčice p.O. – louka', why: 'Podhorská krajina, nízké osvětlení', lat: 49.5400, lon: 18.2700 },
    { name: 'Bordovice – pole nad vsí', why: 'Mírná vyvýšenina, panorama SSZ, Bortle 5', lat: 49.5800, lon: 18.2000 },
  ],

  'Štramberk': [
    { name: 'Štramberk – Trúba (rozhledna)', why: 'Hradní věž, panorama na S, Bortle 5', lat: 49.5920, lon: 18.1170 },
    { name: 'Libotín – pole nad vsí', why: 'Otevřená krajina, volný S', lat: 49.5800, lon: 18.1300 },
    { name: 'Závišice – louka u lesa', why: 'Les stíní záři, otevřený SSZ', lat: 49.6100, lon: 18.0900 },
    { name: 'Bílá Hora – úbočí', why: 'Vyvýšenina, výhled SZ, Bortle 5', lat: 49.5700, lon: 18.1200 },
    { name: 'Ženklava – pole za obcí', why: 'Zemědělská krajina, nízké osvětlení', lat: 49.5600, lon: 18.1400 },
  ],

  'Odry': [
    { name: 'Odry – kopec nad městem', why: 'Vyvýšenina, výhled SSZ, Bortle 4', lat: 49.6650, lon: 17.8300 },
    { name: 'Vražné – pole za vsí', why: 'Otevřená krajina, nízké osvětlení', lat: 49.6800, lon: 17.8500 },
    { name: 'Tošovice – louka nad údolím', why: 'Podhorská krajina, klid, tmavá obloha', lat: 49.6500, lon: 17.8000 },
    { name: 'Dobešov – pole', why: 'Zemědělská krajina, volný S, Bortle 4', lat: 49.7000, lon: 17.8200 },
    { name: 'Spálov – hráz rybníka', why: 'Vodní plocha, odraz, klidné místo', lat: 49.6400, lon: 17.8700 },
  ],

  'Hlučín': [
    { name: 'Hlučín – kopec Vinná hora', why: 'Vyvýšenina, výhled na S do Polska, Bortle 5', lat: 49.9000, lon: 18.1900 },
    { name: 'Hať – pole za obcí', why: 'Hraniční krajina, otevřený S', lat: 49.9400, lon: 18.2400 },
    { name: 'Kozmice – louka u rybníka', why: 'Vodní plocha, klid, nízké osvětlení', lat: 49.8800, lon: 18.2100 },
    { name: 'Darkovičky – pole', why: 'Rovina, volný S, zemědělská krajina', lat: 49.9100, lon: 18.1700 },
    { name: 'Pišť – okraj lesa', why: 'Les stíní Ostravskou záři, severní koridor', lat: 49.9600, lon: 18.2300 },
  ],

  'Vítkov': [
    { name: 'Vítkov – kopec nad městem', why: 'Vyvýšenina, výhled SSZ, Bortle 4', lat: 49.7750, lon: 17.7500 },
    { name: 'Budišov n.B. – pole za obcí', why: 'Otevřená krajina, volný S', lat: 49.7900, lon: 17.6300 },
    { name: 'Město Albrechtice – louka', why: 'Klidné místo, podhorská krajina', lat: 50.1600, lon: 17.5700 },
    { name: 'Březová – pole nad vsí', why: 'Mírná vyvýšenina, nízké osvětlení', lat: 49.7500, lon: 17.7200 },
    { name: 'Klokočov – polní cesta', why: 'Zemědělská krajina, volný S, Bortle 4', lat: 49.7600, lon: 17.7800 },
  ],

  'Hradec nad Moravicí': [
    { name: 'Hradec n.M. – u Bílého zámku', why: 'Zámecký kopec, panorama SZ, Bortle 4', lat: 49.8700, lon: 17.8800 },
    { name: 'Jakartovice – pole nad vsí', why: 'Otevřená krajina, volný S', lat: 49.8500, lon: 17.8200 },
    { name: 'Branka u Opavy – louka u řeky', why: 'Říční niva, klid, nízké osvětlení', lat: 49.8800, lon: 17.8500 },
    { name: 'Vršovice – pole za obcí', why: 'Zemědělská krajina, Bortle 4', lat: 49.8600, lon: 17.8600 },
    { name: 'Fulnek – kopec nad městem', why: 'Vyvýšenina, panorama SSZ', lat: 49.7100, lon: 17.9000 },
  ],

  'Ostrava-Poruba': [
    { name: 'Ostrava-Poruba – park Čs. letců', why: 'Park na okraji, les stíní záři', lat: 49.8300, lon: 18.1700 },
    { name: 'Klimkovice – pole za obcí', why: 'Otevřená krajina, volný SSZ', lat: 49.7900, lon: 18.1300 },
    { name: 'Vřesina – louka nad vsí', why: 'Podhorská krajina, les stíní Ostravu', lat: 49.8100, lon: 18.1500 },
    { name: 'Krásné Pole – okraj lesa', why: 'Les blokuje osvětlení centra, Bortle 5', lat: 49.8400, lon: 18.2100 },
    { name: 'Čavisov – pole u lesa', why: 'Klidné místo, nízké osvětlení', lat: 49.7800, lon: 18.1800 },
  ],

  'Polanka n. Odrou': [
    { name: 'Polanka – pole severně', why: 'Otevřená krajina, volný S, Bortle 5', lat: 49.8050, lon: 18.1700 },
    { name: 'Klimkovice – lázně (okolí)', why: 'Lázeňský park, les stíní Ostravu', lat: 49.7900, lon: 18.1200 },
    { name: 'Stará Bělá – louka u řeky', why: 'Říční niva Odry, klid', lat: 49.7700, lon: 18.2100 },
    { name: 'Velká Polom – pole za vsí', why: 'Zemědělská krajina, nízké osvětlení', lat: 49.8100, lon: 18.1000 },
    { name: 'Hrabství – polní cesta', why: 'Rovina, volný S, Bortle 5', lat: 49.8200, lon: 18.1400 },
  ],

  // === Plzeňský kraj ===

  'Kdyně': [
    { name: 'Kdyně – pole u Nemanice', why: 'Otevřená krajina SZ od města, Bortle 4', lat: 49.4050, lon: 13.0200 },
    { name: 'Všeruby – louky nad vsí', why: 'Příhraniční oblast, minimální osvětlení', lat: 49.3700, lon: 12.9700 },
    { name: 'Kout na Šumavě – pole u lesa', why: 'Tmavá oblast, volný S horizont', lat: 49.4000, lon: 13.0800 },
    { name: 'Pocinovice – rozcestí u rybníka', why: 'Vlhká louka, klid, Bortle 4', lat: 49.3600, lon: 13.0900 },
    { name: 'Koráb (vrch) – rozhledna', why: 'Vyvýšený bod, panorama na S', lat: 49.4100, lon: 13.0500 },
  ],

  'Čerchov': [
    { name: 'Čerchov – vrcholová plošina', why: 'Nejwyšší bod Českého lesa, Bortle 3', lat: 49.3950, lon: 12.7880 },
    { name: 'Capartice – louka pod Čerchovem', why: 'Tmavá příhraniční oblast, volný S', lat: 49.4000, lon: 12.7600 },
    { name: 'Klenčí pod Čerchovem – pole', why: 'Otevřená krajina, nízké osvětlení', lat: 49.4100, lon: 12.8200 },
    { name: 'Pec pod Čerchovem – lesní mýtina', why: 'Les stíní okolní záři, Bortle 3', lat: 49.3900, lon: 12.8000 },
    { name: 'Díly – pole nad vsí', why: 'Vyvýšená plocha, krásný rozhled na S', lat: 49.3800, lon: 12.7700 },
  ],

  'Sušice': [
    { name: 'Sušice – Svatobor (rozhledna)', why: 'Vyvýšený bod, les stíní město', lat: 49.2400, lon: 13.5000 },
    { name: 'Hrádek u Sušice – pole', why: 'Otevřená krajina, volný S, Bortle 4', lat: 49.2600, lon: 13.4800 },
    { name: 'Žichovice – louka u Otavy', why: 'Říční údolí, nízké osvětlení', lat: 49.2700, lon: 13.5500 },
    { name: 'Annín – pole nad vsí', why: 'Podhorská krajina, tmavá obloha', lat: 49.2200, lon: 13.4700 },
    { name: 'Dlouhá Ves – louka za vsí', why: 'Klidná oblast, Bortle 4, volný S', lat: 49.2100, lon: 13.4500 },
  ],

  'Horažďovice': [
    { name: 'Horažďovice – Prácheňsko (kopec)', why: 'Vyvýšený bod, panorama na S', lat: 49.3300, lon: 13.7000 },
    { name: 'Chanovec – pole u lesa', why: 'Otevřená krajina, les stíní záři', lat: 49.3400, lon: 13.7200 },
    { name: 'Velké Hydčice – louka u Otavy', why: 'Říční krajina, nízké osvětlení', lat: 49.3100, lon: 13.6700 },
    { name: 'Kejnice – pole nad vsí', why: 'Vyvýšená plocha, volný S', lat: 49.3500, lon: 13.6800 },
    { name: 'Malý Bor – louka za obcí', why: 'Klidná oblast, Bortle 4', lat: 49.3000, lon: 13.7300 },
  ],

  'Železná Ruda': [
    { name: 'Železná Ruda – Pancíř (vrchol)', why: 'Vysoká poloha, Bortle 3, výhled na S', lat: 49.1700, lon: 13.2200 },
    { name: 'Špičák – parkoviště u sjezdovky', why: 'Vyvýšený bod, les stíní záři', lat: 49.1600, lon: 13.2000 },
    { name: 'Prášily – louka u pramene Křemelné', why: 'Šumavská divočina, Bortle 2–3', lat: 49.1100, lon: 13.3800 },
    { name: 'Hojsova Stráž – pole za obcí', why: 'Podhorská obec, tmavá obloha', lat: 49.1900, lon: 13.2600 },
    { name: 'Debrník – louka u hranic', why: 'Hraniční oblast, minimální záře', lat: 49.1300, lon: 13.2100 },
  ],

  'Přeštice': [
    { name: 'Přeštice – pole severně od města', why: 'Otevřená rovina, volný S', lat: 49.5900, lon: 13.3300 },
    { name: 'Dolce – louka u rybníka', why: 'Rybniční krajina, klid', lat: 49.5800, lon: 13.3600 },
    { name: 'Předenice – pole za vsí', why: 'Zemědělská krajina, Bortle 4', lat: 49.5700, lon: 13.3100 },
    { name: 'Lužany – zámecký park (okraj)', why: 'Parkový areál, les stíní záři', lat: 49.5600, lon: 13.3500 },
    { name: 'Oplot – pole nad obcí', why: 'Mírný svah, volný S horizont', lat: 49.6000, lon: 13.3000 },
  ],

  'Nepomuk': [
    { name: 'Nepomuk – Zelená Hora (kopec)', why: 'Vyvýšený bod, rozhled na S', lat: 49.4900, lon: 13.5800 },
    { name: 'Neurazy – pole u lesa', why: 'Otevřená louka, les stíní záři', lat: 49.5000, lon: 13.5500 },
    { name: 'Žinkovy – louka nad přehradou', why: 'Klidné místo, nízké osvětlení', lat: 49.5100, lon: 13.5400 },
    { name: 'Myslív – pole za vsí', why: 'Zemědělská krajina, Bortle 4', lat: 49.4700, lon: 13.6000 },
    { name: 'Klášter – louka u kláštera', why: 'Historické místo, volný S', lat: 49.4800, lon: 13.5700 },
  ],

  'Blovice': [
    { name: 'Blovice – pole severně', why: 'Otevřená krajina, volný S, Bortle 4', lat: 49.6000, lon: 13.5400 },
    { name: 'Seč – louka nad vsí', why: 'Podhorská krajina, les stíní Plzeň', lat: 49.6100, lon: 13.5200 },
    { name: 'Střížovice – pole u lesa', why: 'Klidná oblast, nízké osvětlení', lat: 49.5900, lon: 13.5600 },
    { name: 'Spálené Poříčí – louka u řeky', why: 'Říční údolí, tmavá obloha', lat: 49.6200, lon: 13.6000 },
    { name: 'Letiny – pole za obcí', why: 'Zemědělská krajina, volný S', lat: 49.5800, lon: 13.5100 },
  ],

  'Kralovice': [
    { name: 'Kralovice – pole severně u Berounky', why: 'Otevřená krajina, volný S, Bortle 4', lat: 50.0000, lon: 13.4900 },
    { name: 'Hadačka – louka nad vsí', why: 'Vyvýšená plocha, nízké osvětlení', lat: 49.9900, lon: 13.4700 },
    { name: 'Čistá – pole za vsí', why: 'Klidná oblast, volný S horizont', lat: 50.0100, lon: 13.5100 },
    { name: 'Plasy – klášterní louky', why: 'Les stíní okolní záři, Bortle 4', lat: 49.9700, lon: 13.3900 },
    { name: 'Mladotice – louka u jezera', why: 'Přírodní jezero, tmavá obloha', lat: 50.0200, lon: 13.4600 },
  ],

  'Nýřany': [
    { name: 'Nýřany – pole SZ od města', why: 'Otevřená krajina, volný S', lat: 49.7300, lon: 13.2000 },
    { name: 'Zbůch – louka za vsí', why: 'Zemědělská krajina, Bortle 5', lat: 49.7200, lon: 13.2300 },
    { name: 'Heřmanova Huť – pole u lesa', why: 'Les stíní záři Plzně', lat: 49.7400, lon: 13.1800 },
    { name: 'Tlučná – pole za obcí', why: 'Okraj aglomerace, volný SZ', lat: 49.7100, lon: 13.2500 },
    { name: 'Blatnice – louka nad vsí', why: 'Klidná oblast, Bortle 5', lat: 49.7500, lon: 13.1900 },
  ],

  'Zbiroh': [
    { name: 'Zbiroh – pole na hřebeni', why: 'Vyvýšená krajina, Bortle 4, volný S', lat: 49.8700, lon: 13.7700 },
    { name: 'Skořice – louka u lesa', why: 'Otevřená hrana lesa, nízké osvětlení', lat: 49.8500, lon: 13.7500 },
    { name: 'Cerhovice – pole severně', why: 'Zemědělská krajina, volný S', lat: 49.8600, lon: 13.7200 },
    { name: 'Komárov – louka nad vsí', why: 'Klidná oblast, les stíní záři', lat: 49.8100, lon: 13.8600 },
    { name: 'Terešov – pole za vsí', why: 'Brdská krajina, tmavá obloha', lat: 49.8400, lon: 13.8000 },
  ],

  'Stříbro': [
    { name: 'Stříbro – pole severně u Mže', why: 'Říční krajina, volný S, Bortle 5', lat: 49.7700, lon: 13.0000 },
    { name: 'Kladruby – klášterní louky', why: 'Klidná oblast, les stíní záři', lat: 49.7200, lon: 12.9900 },
    { name: 'Kostelec – pole za vsí', why: 'Otevřená krajina, nízké osvětlení', lat: 49.7800, lon: 13.0200 },
    { name: 'Sytno – louka u lesa', why: 'Lesnatá oblast, Bortle 4', lat: 49.7500, lon: 12.9700 },
    { name: 'Schwarzenberg – pole nad vsí', why: 'Vyvýšená plocha, volný S', lat: 49.7600, lon: 13.0300 },
  ],

  'Přimda': [
    { name: 'Přimda – hrad (okolí)', why: 'Vyvýšený bod, Bortle 3, panorama na S', lat: 49.6700, lon: 12.6700 },
    { name: 'Rozvadov – pole u hranic', why: 'Hraniční oblast, minimální záře', lat: 49.6800, lon: 12.5500 },
    { name: 'Přimda – louky JZ od obce', why: 'Otevřená krajina, les stíní záři', lat: 49.6600, lon: 12.6500 },
    { name: 'Nové Domky – pole za vsí', why: 'Klidná oblast, tmavá obloha', lat: 49.6900, lon: 12.6300 },
    { name: 'Česká Kubice – louka u lesa', why: 'Šumavské podhůří, Bortle 3', lat: 49.6500, lon: 12.6800 },
  ],

  // === Liberecký kraj ===

  'Nový Bor': [
    { name: 'Nový Bor – Klíč (vrch)', why: 'Čedičový kopec, panorama na S, Bortle 4', lat: 50.7800, lon: 14.5300 },
    { name: 'Sloup v Čechách – pole u skály', why: 'Skalní útvar, otevřený S obzor', lat: 50.7300, lon: 14.5800 },
    { name: 'Svor – louky nad vsí', why: 'Lužické hory, nízké osvětlení', lat: 50.7900, lon: 14.4900 },
    { name: 'Cvikov – pole za městem', why: 'Podhorská krajina, Bortle 4', lat: 50.7700, lon: 14.6300 },
    { name: 'Chotovice – louka u lesa', why: 'Klidná oblast, volný S', lat: 50.7600, lon: 14.5500 },
  ],

  'Doksy': [
    { name: 'Doksy – Máchovo jezero (břeh)', why: 'Vodní hladina, otevřený S obzor', lat: 50.5700, lon: 14.6500 },
    { name: 'Bezděz – louky pod hradem', why: 'Ikonický kopec, Bortle 4', lat: 50.5400, lon: 14.7200 },
    { name: 'Staré Splavy – pláž (sever)', why: 'Písčitá pláž, volný S přes jezero', lat: 50.5800, lon: 14.6300 },
    { name: 'Bělá pod Bezdězem – pole', why: 'Otevřená krajina, les stíní záři', lat: 50.5000, lon: 14.8100 },
    { name: 'Zbyny – louka u rybníka', why: 'Rybniční krajina, klid, Bortle 4', lat: 50.5600, lon: 14.6800 },
  ],

  'Tanvald': [
    { name: 'Tanvald – Tanvaldský Špičák', why: 'Vyvýšený bod, rozhled na S, Bortle 4', lat: 50.7500, lon: 15.3200 },
    { name: 'Smržovka – pole nad městem', why: 'Podhorská krajina, volný SZ', lat: 50.7400, lon: 15.2500 },
    { name: 'Desná – louka u Desné (řeka)', why: 'Horské údolí, tmavá obloha', lat: 50.7600, lon: 15.3400 },
    { name: 'Kořenov – sedlo nad obcí', why: 'Jizerské hory, Bortle 4', lat: 50.7700, lon: 15.3700 },
    { name: 'Velké Hamry – pole za vsí', why: 'Otevřená krajina, nízké osvětlení', lat: 50.7200, lon: 15.2800 },
  ],

  'Železný Brod': [
    { name: 'Železný Brod – Vrch Baba', why: 'Vyhlídka nad městem, volný S', lat: 50.6500, lon: 15.2500 },
    { name: 'Malá Skála – nad Jizerou', why: 'Skalní kaňon, tmavá obloha', lat: 50.6300, lon: 15.2100 },
    { name: 'Líšný – pole za vsí', why: 'Otevřená krajina, Bortle 5, klid', lat: 50.6600, lon: 15.2700 },
    { name: 'Koberovy – louka nad vsí', why: 'Podhorská krajina, nízké osvětlení', lat: 50.6200, lon: 15.2300 },
    { name: 'Pěnčín – pole u lesa', why: 'Les stíní záři, volný S', lat: 50.6700, lon: 15.2200 },
  ],

  'Frýdlant': [
    { name: 'Frýdlant – pole SZ od města', why: 'Frýdlantský výběžek, otevřený S, Bortle 4', lat: 50.9400, lon: 15.0600 },
    { name: 'Pertoltice – louka u hranic', why: 'Hraniční oblast, minimální záře', lat: 50.9800, lon: 15.0200 },
    { name: 'Hejnice – louky nad klášterem', why: 'Podhorská krajina, Bortle 3–4', lat: 50.9500, lon: 15.1800 },
    { name: 'Dětřichov – pole za vsí', why: 'Klidná oblast, volný S horizont', lat: 50.9200, lon: 15.0400 },
    { name: 'Raspenava – louka u Smědé', why: 'Říční krajina, nízké osvětlení', lat: 50.9300, lon: 15.1200 },
  ],

  'Hrádek nad Nisou': [
    { name: 'Hrádek n. Nisou – Trojzemí', why: 'Výběžek CZ–DE–PL, otevřený S, Bortle 4', lat: 50.8700, lon: 14.8400 },
    { name: 'Chotyně – pole u Nisy', why: 'Říční krajina, volný S horizont', lat: 50.8500, lon: 14.8600 },
    { name: 'Oldřichov v Hájích – louka', why: 'Podhorská obec, nízké osvětlení', lat: 50.8400, lon: 15.0200 },
    { name: 'Grabštejn – louka u zámku', why: 'Klidné místo, les stíní záři', lat: 50.8600, lon: 14.8800 },
    { name: 'Václavice – pole za vsí', why: 'Zemědělská krajina, Bortle 5', lat: 50.8800, lon: 14.8200 },
  ],

  'Chrastava': [
    { name: 'Chrastava – pole SZ od města', why: 'Otevřená krajina, volný S, Bortle 5', lat: 50.8300, lon: 14.9500 },
    { name: 'Nová Ves – louka nad vsí', why: 'Podhorská krajina, nízké osvětlení', lat: 50.8400, lon: 14.9700 },
    { name: 'Bílý Kostel n. Nisou – pole', why: 'Zemědělská krajina, volný S', lat: 50.8500, lon: 14.9200 },
    { name: 'Andělská Hora – vrch', why: 'Vyvýšený bod, rozhled, les stíní záři', lat: 50.8200, lon: 14.9800 },
    { name: 'Mníšek – louka u lesa', why: 'Klidná oblast, tmavá obloha', lat: 50.8100, lon: 14.9400 },
  ],

  'Turnov': [
    { name: 'Turnov – Hlavatice (kopec)', why: 'Vyvýšený bod, panorama na S, Bortle 4', lat: 50.6000, lon: 15.1500 },
    { name: 'Hrubá Skála – vyhlídka', why: 'Skalní město, tmavá obloha', lat: 50.5700, lon: 15.1900 },
    { name: 'Mašov – pole za vsí', why: 'Otevřená krajina, volný S', lat: 50.6100, lon: 15.1700 },
    { name: 'Ktová – louky nad Jizerou', why: 'Říční údolí, nízké osvětlení', lat: 50.5800, lon: 15.1400 },
    { name: 'Přepeře – pole nad obcí', why: 'Zemědělská krajina, Bortle 5', lat: 50.6200, lon: 15.1300 },
  ],

  'Jilemnice': [
    { name: 'Jilemnice – Žalý (rozhledna)', why: 'Krkonošské předhůří, Bortle 4, výhled na S', lat: 50.6200, lon: 15.5400 },
    { name: 'Poniklá – louky za vsí', why: 'Podhorská obec, tmavá obloha', lat: 50.6300, lon: 15.4800 },
    { name: 'Víchová n. Jizerou – louka', why: 'Říční krajina, nízké osvětlení', lat: 50.6000, lon: 15.4600 },
    { name: 'Horní Branná – pole severně', why: 'Klidná oblast, les stíní záři', lat: 50.6400, lon: 15.5600 },
    { name: 'Martinice v Krkonoších – pole', why: 'Klidná podhorská obec, Bortle 4', lat: 50.5800, lon: 15.5200 },
  ],

  'Kozákov': [
    { name: 'Kozákov – vrcholová plošina', why: 'Rozhledna 744 m, Bortle 3–4, panorama na S', lat: 50.5850, lon: 15.2300 },
    { name: 'Loktuše – louka pod Kozákovem', why: 'Klidná oblast, les stíní záři', lat: 50.5700, lon: 15.2400 },
    { name: 'Volavec – pole u lesa', why: 'Otevřená krajina, volný S', lat: 50.5900, lon: 15.2100 },
    { name: 'Lestkov – louka nad vsí', why: 'Podhorská krajina, nízké osvětlení', lat: 50.5800, lon: 15.2500 },
    { name: 'Radostná p. Kozákovem – pole', why: 'Klidné místo, Bortle 4', lat: 50.5750, lon: 15.2200 },
  ],

  // === Olomoucký kraj ===

  'Šternberk': [
    { name: 'Šternberk – Ecce homo (kopec)', why: 'Vyvýšený bod, rozhled na S, Bortle 5', lat: 49.7400, lon: 17.3000 },
    { name: 'Lužice – pole za vsí', why: 'Otevřená krajina, nízké osvětlení', lat: 49.7500, lon: 17.2800 },
    { name: 'Babice – louka u potoka', why: 'Klidná oblast, volný S', lat: 49.7300, lon: 17.3200 },
    { name: 'Hnojice – pole nad obcí', why: 'Zemědělská krajina, Bortle 4', lat: 49.7200, lon: 17.2600 },
    { name: 'Domašov u Šternberka – louka', why: 'Podhorská obec, les stíní záři', lat: 49.7600, lon: 17.2500 },
  ],

  'Uničov': [
    { name: 'Uničov – pole severně', why: 'Otevřená rovina, volný S, Bortle 5', lat: 49.7900, lon: 17.1200 },
    { name: 'Medlov – louka u lesa', why: 'Zemědělská krajina, les stíní záři', lat: 49.7800, lon: 17.0900 },
    { name: 'Paseka – pole za vsí', why: 'Podhorská obec, nízké osvětlení', lat: 49.8000, lon: 17.1500 },
    { name: 'Újezd u Uničova – louka', why: 'Klidná oblast, volný S', lat: 49.8100, lon: 17.1000 },
    { name: 'Lazce – pole u rybníka', why: 'Rybniční krajina, Bortle 4', lat: 49.7700, lon: 17.1300 },
  ],

  'Litovel': [
    { name: 'Litovel – Moravské Sahary (louky)', why: 'Chráněné luhy, Bortle 4, volný S', lat: 49.7100, lon: 17.0800 },
    { name: 'Červenka – pole za vsí', why: 'Otevřená krajina, nízké osvětlení', lat: 49.7200, lon: 17.0600 },
    { name: 'Nasobůrky – louka u Moravy', why: 'Říční niva, klid', lat: 49.7000, lon: 17.0500 },
    { name: 'Nová Ves u Litovle – pole', why: 'Zemědělská krajina, Bortle 4', lat: 49.7300, lon: 17.1000 },
    { name: 'Myslechovice – louka nad vsí', why: 'Klidná oblast, volný S horizont', lat: 49.7400, lon: 17.0700 },
  ],

  'Konice': [
    { name: 'Konice – pole severně', why: 'Otevřená krajina, Bortle 4, volný S', lat: 49.6100, lon: 16.8900 },
    { name: 'Jeseneček – louka u lesa', why: 'Drahanská vrchovina, tmavá obloha', lat: 49.6000, lon: 16.8700 },
    { name: 'Brodek u Konice – pole', why: 'Zemědělská krajina, nízké osvětlení', lat: 49.6200, lon: 16.9100 },
    { name: 'Ochoz – louka nad vsí', why: 'Klidná oblast, les stíní záři', lat: 49.5800, lon: 16.8800 },
    { name: 'Bohuslavice – pole za vsí', why: 'Otevřená krajina, volný S', lat: 49.6300, lon: 16.9200 },
  ],

  'Plumlov': [
    { name: 'Plumlov – přehrada (hráz)', why: 'Vodní plocha, otevřený S obzor, Bortle 4', lat: 49.4700, lon: 16.9900 },
    { name: 'Ohrozim – louka u lesa', why: 'Drahanská vrchovina, tmavá obloha', lat: 49.4600, lon: 16.9700 },
    { name: 'Mostkovice – pole nad obcí', why: 'Vyvýšená plocha, nízké osvětlení', lat: 49.4800, lon: 17.0100 },
    { name: 'Drahany – pole u obce', why: 'Vysočina, Bortle 3–4', lat: 49.4500, lon: 16.9500 },
    { name: 'Prostějovičky – louka', why: 'Klidná oblast, volný S', lat: 49.4900, lon: 16.9800 },
  ],

  'Hranice na Moravě': [
    { name: 'Hranice – Bečva (břeh)', why: 'Říční krajina, otevřený S, Bortle 5', lat: 49.5600, lon: 17.7300 },
    { name: 'Teplice n. Bečvou – lázně okolí', why: 'Lázeňska krajina, les stíní záři', lat: 49.5300, lon: 17.7500 },
    { name: 'Potštát – pole nad městysem', why: 'Vyvýšená oblast, tmavá obloha', lat: 49.5700, lon: 17.6800 },
    { name: 'Paršovice – louka za vsí', why: 'Klidná oblast, nízké osvětlení', lat: 49.5500, lon: 17.7100 },
    { name: 'Drahotuše – pole u Bečvy', why: 'Říční niva, volný S', lat: 49.5400, lon: 17.7600 },
  ],

  'Lipník nad Bečvou': [
    { name: 'Lipník n. B. – Moravská brána pole', why: 'Průsmyk, otevřený S, Bortle 4', lat: 49.5400, lon: 17.5900 },
    { name: 'Osek nad Bečvou – louka', why: 'Říční krajina, nízké osvětlení', lat: 49.5200, lon: 17.5700 },
    { name: 'Hlinsko – pole u lesa', why: 'Zemědělská krajina, les stíní záři', lat: 49.5500, lon: 17.6100 },
    { name: 'Týn nad Bečvou – louka u řeky', why: 'Klidné místo, volný S', lat: 49.5300, lon: 17.5500 },
    { name: 'Dolní Újezd – pole za vsí', why: 'Otevřená krajina, Bortle 4', lat: 49.5600, lon: 17.6000 },
  ],

  'Kojetín': [
    { name: 'Kojetín – pole severně', why: 'Hanuš krajina, otevřený S, Bortle 4', lat: 49.3700, lon: 17.3000 },
    { name: 'Uhřičice – louka u Moravy', why: 'Říční niva, nízké osvětlení', lat: 49.3600, lon: 17.2800 },
    { name: 'Měrovice – pole za vsí', why: 'Zemědělská krajina, volný S', lat: 49.3500, lon: 17.3200 },
    { name: 'Křenovice – louka u lesa', why: 'Klidná oblast, les stíní záři', lat: 49.3800, lon: 17.2900 },
    { name: 'Lobodice – pole u rybníka', why: 'Rybníky, vlhký klid, Bortle 4', lat: 49.3400, lon: 17.3100 },
  ],

  'Zábřeh': [
    { name: 'Zábřeh – pole severně u Moravské Sázavy', why: 'Říční krajina, volný S, Bortle 5', lat: 49.9000, lon: 16.8700 },
    { name: 'Hoštejn – louka u hradu', why: 'Údolí Moravské Sázavy, tmavá obloha', lat: 49.9100, lon: 16.8200 },
    { name: 'Postřelmov – pole za obcí', why: 'Otevřená krajina, nízké osvětlení', lat: 49.9200, lon: 16.9100 },
    { name: 'Lesnice – louka nad vsí', why: 'Klidná oblast, les stíní záři', lat: 49.8900, lon: 16.8500 },
    { name: 'Jedlí – pole u lesa', why: 'Podhorská krajina, Bortle 4', lat: 49.8800, lon: 16.8400 },
  ],

  'Mohelnice': [
    { name: 'Mohelnice – pole severně', why: 'Otevřená Hanácká krajina, volný S, Bortle 5', lat: 49.7900, lon: 16.9200 },
    { name: 'Třeština – louka za vsí', why: 'Zemědělská krajina, nízké osvětlení', lat: 49.8000, lon: 16.9000 },
    { name: 'Líšnice – pole u lesa', why: 'Les stíní záři, Bortle 4', lat: 49.7800, lon: 16.9400 },
    { name: 'Krchleby – louka nad vsí', why: 'Klidná oblast, volný S', lat: 49.8100, lon: 16.8900 },
    { name: 'Stavenice – pole za obcí', why: 'Podhorská krajina, tmavá obloha', lat: 49.7700, lon: 16.9100 },
  ],

  'Velké Losiny': [
    { name: 'Velké Losiny – Karlov (vrch)', why: 'Jesenické podhůří, Bortle 3–4, výhled na S', lat: 50.0400, lon: 17.0500 },
    { name: 'Loučná nad Desnou – údolí', why: 'Horské údolí, tmavá obloha', lat: 50.0600, lon: 17.0700 },
    { name: 'Rapotín – pole za vsí', why: 'Otevřená krajina, volný S', lat: 50.0200, lon: 17.0200 },
    { name: 'Kouty nad Desnou – louka', why: 'Vysokohorská poloha, Bortle 3', lat: 50.0800, lon: 17.0900 },
    { name: 'Vikýřovice – pole u Desné', why: 'Říční krajina, nízké osvětlení', lat: 50.0100, lon: 17.0300 },
  ],

  'Zlaté Hory': [
    { name: 'Zlaté Hory – Biskupská kupa (vrch)', why: 'Vysoký bod Jeseníků, Bortle 3, panorama na S', lat: 50.2800, lon: 17.4200 },
    { name: 'Rejvíz – rašeliniště (okolí)', why: 'Přírodní rezervace, minimální záře', lat: 50.2600, lon: 17.3500 },
    { name: 'Heřmanovice – louka za vsí', why: 'Podhorská obec, tmavá obloha', lat: 50.2500, lon: 17.3000 },
    { name: 'Ondřejovice – pole u potoka', why: 'Klidná oblast, volný S', lat: 50.2700, lon: 17.4000 },
    { name: 'Supíkovice – louka nad vsí', why: 'Otevřená krajina, Bortle 4', lat: 50.2900, lon: 17.4400 },
  ],

  'Javorník': [
    { name: 'Javorník – Jánský vrch (okolí hradu)', why: 'Vyvýšený bod, panorama na S, Bortle 4', lat: 50.3900, lon: 17.0100 },
    { name: 'Bílá Voda – pole u hranic', why: 'Hraniční oblast, minimální záře', lat: 50.4200, lon: 17.0200 },
    { name: 'Bernartice – louka za vsí', why: 'Podhorská obec, tmavá obloha', lat: 50.3700, lon: 16.9700 },
    { name: 'Uhelná – pole nad vsí', why: 'Otevřená krajina, volný S', lat: 50.3800, lon: 17.0400 },
    { name: 'Vlčice – louka u potoka', why: 'Klidná oblast, nízké osvětlení', lat: 50.4000, lon: 17.0000 },
  ],

  // === Královéhradecký kraj ===

  'Nový Bydžov': [
    { name: 'Nový Bydžov – pole severně', why: 'Polabská rovina, otevřený S, Bortle 5', lat: 50.2600, lon: 15.4900 },
    { name: 'Smidary – louka u Cidliny', why: 'Říční krajina, nízké osvětlení', lat: 50.2500, lon: 15.4700 },
    { name: 'Prasek – pole za vsí', why: 'Zemědělská krajina, volný S', lat: 50.2400, lon: 15.5100 },
    { name: 'Skřivany – louka nad obcí', why: 'Klidná oblast, Bortle 5', lat: 50.2300, lon: 15.5300 },
    { name: 'Měník – pole u lesa', why: 'Otevřená krajina, les remíz stíní záři', lat: 50.2700, lon: 15.5000 },
  ],

  'Třebechovice p. O.': [
    { name: 'Třebechovice – pole severně', why: 'Otevřená krajina, volný S, Bortle 4', lat: 50.2200, lon: 15.9900 },
    { name: 'Ledce – louka za vsí', why: 'Klidná oblast, nízké osvětlení', lat: 50.2100, lon: 15.9700 },
    { name: 'Nepasice – pole u lesa', why: 'Les stíní záři Hradce', lat: 50.2000, lon: 16.0100 },
    { name: 'Polánky n. Dědinou – louka', why: 'Říční krajina, volný S', lat: 50.2300, lon: 16.0200 },
    { name: 'Blešno – pole za obcí', why: 'Zemědělská krajina, Bortle 4', lat: 50.2400, lon: 15.9800 },
  ],

  'Chlumec n. C.': [
    { name: 'Chlumec n. C. – pole severně', why: 'Polabská rovina, otevřený S, Bortle 4', lat: 50.1700, lon: 15.4600 },
    { name: 'Pamětník – louka za vsí', why: 'Klidná oblast, nízké osvětlení', lat: 50.1600, lon: 15.4400 },
    { name: 'Olešnice – pole u lesa', why: 'Zemědělská krajina, les stíní záři', lat: 50.1800, lon: 15.4800 },
    { name: 'Kladruby n. Labem – louka', why: 'Říční niva, volný S', lat: 50.1500, lon: 15.4700 },
    { name: 'Káranice – pole nad vsí', why: 'Otevřená krajina, Bortle 4', lat: 50.1900, lon: 15.4500 },
  ],

  'Hořice': [
    { name: 'Hořice – Chlum (kopec)', why: 'Vyvýšený bod, rozhled na S, Bortle 4', lat: 50.3800, lon: 15.6300 },
    { name: 'Třebnouševes – pole za vsí', why: 'Otevřená krajina, nízké osvětlení', lat: 50.3700, lon: 15.6100 },
    { name: 'Chloumek – louka nad obcí', why: 'Klidná oblast, volný S', lat: 50.3500, lon: 15.6500 },
    { name: 'Ostroměř – pole u lesa', why: 'Les stíní záři, Bortle 5', lat: 50.3600, lon: 15.5800 },
    { name: 'Cerekvice n. Bystřicí – louka', why: 'Podhorská krajina, tmavá obloha', lat: 50.3900, lon: 15.6600 },
  ],

  'Nová Paka': [
    { name: 'Nová Paka – Kumburk (zřícenina)', why: 'Vyvýšený bod, panorama na S, Bortle 4', lat: 50.5100, lon: 15.5000 },
    { name: 'Stará Paka – louka za obcí', why: 'Podhorská krajina, nízké osvětlení', lat: 50.5000, lon: 15.4700 },
    { name: 'Vidochov – pole nad vsí', why: 'Otevřená krajina, volný S', lat: 50.5200, lon: 15.5300 },
    { name: 'Úhlejov – louka u potoka', why: 'Klidná oblast, les stíní záři', lat: 50.4800, lon: 15.5200 },
    { name: 'Levínská Olešnice – pole', why: 'Zemědělská krajina, Bortle 5', lat: 50.5300, lon: 15.4800 },
  ],

  'Prachovské skály': [
    { name: 'Prachovské skály – vyhlídka Míru', why: 'Skalní město, Bortle 3–4, panorama na S', lat: 50.4600, lon: 15.3900 },
    { name: 'Pařezská Lhota – pole za vsí', why: 'Otevřená krajina, nízké osvětlení', lat: 50.4500, lon: 15.3700 },
    { name: 'Jinolice – louka nad vsí', why: 'Podhorská krajina, tmavá obloha', lat: 50.4700, lon: 15.4100 },
    { name: 'Holín – pole u lesa', why: 'Les stíní záři, volný S', lat: 50.4400, lon: 15.3600 },
    { name: 'Brada – louka u stezky', why: 'Klidná oblast, Bortle 4', lat: 50.4800, lon: 15.4000 },
  ],

  'Broumov': [
    { name: 'Broumov – Broumovské stěny (vyhlídka)', why: 'Pískovcový hřbet, Bortle 3–4, výhled na S', lat: 50.5900, lon: 16.3500 },
    { name: 'Martínkovice – pole za vsí', why: 'Podhorská krajina, nízké osvětlení', lat: 50.5700, lon: 16.3100 },
    { name: 'Křinice – louka u řeky', why: 'Říční krajina, volný S', lat: 50.6000, lon: 16.3600 },
    { name: 'Otovice – pole nad vsí', why: 'Otevřená krajina, Bortle 4', lat: 50.5600, lon: 16.3300 },
    { name: 'Vernéřovice – louka u lesa', why: 'Klidná oblast, les stíní záři', lat: 50.5800, lon: 16.3200 },
  ],

  'Jaroměř': [
    { name: 'Jaroměř – soutok Labe a Úpy (okolí)', why: 'Říční krajina, otevřený S, Bortle 5', lat: 50.3700, lon: 15.9200 },
    { name: 'Josefov – louky u pevnosti', why: 'Historická krajina, volný S', lat: 50.3400, lon: 15.9400 },
    { name: 'Čáslavky – pole za vsí', why: 'Zemědělská krajina, nízké osvětlení', lat: 50.3800, lon: 15.9000 },
    { name: 'Velichovky – louka nad obcí', why: 'Lázeňská krajina, klid', lat: 50.3600, lon: 15.8800 },
    { name: 'Smiřice – pole u Labe', why: 'Říční niva, Bortle 5', lat: 50.3300, lon: 15.8600 },
  ],

  'Adršpašské skály': [
    { name: 'Adršpach – Metuje (okolí skal)', why: 'Skalní město, Bortle 3, tmavá obloha', lat: 50.6100, lon: 16.1200 },
    { name: 'Teplice n. Metují – pole u řeky', why: 'Říční krajina, volný S', lat: 50.5900, lon: 16.1700 },
    { name: 'Zdoňov – louka nad vsí', why: 'Podhorská obec, nízké osvětlení', lat: 50.6200, lon: 16.1500 },
    { name: 'Machov – pole za vsí', why: 'Broumovský výběžek, tmavá obloha', lat: 50.6000, lon: 16.2900 },
    { name: 'Janovice u Broumova – louka', why: 'Klidná oblast, Bortle 3–4', lat: 50.6300, lon: 16.1400 },
  ],

  'Dobruška': [
    { name: 'Dobruška – pole severně', why: 'Otevřená krajina, volný S, Bortle 5', lat: 50.3100, lon: 16.1600 },
    { name: 'Opočno – zámecký park (okolí)', why: 'Parkový areál, les stíní záři', lat: 50.2800, lon: 16.1100 },
    { name: 'Pohoří – louka za vsí', why: 'Podorlická krajina, nízké osvětlení', lat: 50.3000, lon: 16.1800 },
    { name: 'Přepychy – pole nad obcí', why: 'Zemědělská krajina, Bortle 4', lat: 50.2700, lon: 16.1400 },
    { name: 'Podbřezí – louka u potoka', why: 'Klidná oblast, volný S', lat: 50.3200, lon: 16.1700 },
  ],

  'Kostelec n. Orlicí': [
    { name: 'Kostelec n. O. – pole severně', why: 'Orlická rovina, volný S, Bortle 5', lat: 50.1400, lon: 16.2100 },
    { name: 'Častolovice – louka u zámku', why: 'Parkový areál, nízké osvětlení', lat: 50.1300, lon: 16.1800 },
    { name: 'Doudleby n. Orlicí – pole', why: 'Otevřená krajina, les stíní záři', lat: 50.1200, lon: 16.2300 },
    { name: 'Tutleky – louka nad vsí', why: 'Klidná oblast, volný S', lat: 50.1500, lon: 16.2000 },
    { name: 'Vamberk – pole u řeky', why: 'Říční krajina Divoké Orlice, Bortle 5', lat: 50.1100, lon: 16.2900 },
  ],

  'Dvůr Králové n. L.': [
    { name: 'Dvůr Králové – pole SZ od města', why: 'Otevřená krajina, volný S, Bortle 5', lat: 50.4500, lon: 15.8000 },
    { name: 'Kuks – louky u hospitálu', why: 'Historická krajina, Labe, klid', lat: 50.4000, lon: 15.8900 },
    { name: 'Bílá Třemešná – pole', why: 'Zemědělská krajina, nízké osvětlení', lat: 50.4600, lon: 15.8300 },
    { name: 'Stanovice – louka u lesa', why: 'Les stíní záři, volný S', lat: 50.4400, lon: 15.7800 },
    { name: 'Kohoutov – pole za vsí', why: 'Podhorská krajina, Bortle 4', lat: 50.4300, lon: 15.7600 },
  ],

  'Vrchlabí': [
    { name: 'Vrchlabí – Žalý (rozhledna)', why: 'Krkonošské předhůří, Bortle 4, výhled na S', lat: 50.6400, lon: 15.5800 },
    { name: 'Benecko – louky nad obcí', why: 'Lyžařská oblast, tmavá obloha', lat: 50.6700, lon: 15.5500 },
    { name: 'Strážné – pole za vsí', why: 'Horské údolí, nízké osvětlení', lat: 50.6500, lon: 15.6300 },
    { name: 'Dolní Lánov – louka u Labe', why: 'Říční krajina, Bortle 5', lat: 50.6100, lon: 15.6100 },
    { name: 'Lánov – pole nad obcí', why: 'Podhorská krajina, volný SZ', lat: 50.6300, lon: 15.6500 },
  ],

  'Pec pod Sněžkou': [
    { name: 'Pec p. Sn. – Výrovka (chata)', why: 'Krkonoše, vysoká poloha, Bortle 3–4', lat: 50.7100, lon: 15.7300 },
    { name: 'Velká Úpa – louka nad obcí', why: 'Horská obec, tmavá obloha', lat: 50.7000, lon: 15.7500 },
    { name: 'Černý Důl – pole za vsí', why: 'Horské údolí, nízké osvětlení', lat: 50.6700, lon: 15.7100 },
    { name: 'Janské Lázně – sedlo (okolí)', why: 'Lázeňská oblast, les stíní záři', lat: 50.6300, lon: 15.7700 },
    { name: 'Svoboda n. Úpou – louka u řeky', why: 'Říční údolí, Bortle 4', lat: 50.6200, lon: 15.8100 },
  ],

  // === Pardubický kraj ===

  'Hlinsko': [
    { name: 'Hlinsko – Rataje (kopec)', why: 'Vyvýšený bod, Bortle 4, výhled na S', lat: 49.7700, lon: 15.9100 },
    { name: 'Vítanov – louka za vsí', why: 'Podhorská krajina, tmavá obloha', lat: 49.7800, lon: 15.8800 },
    { name: 'Blatno – pole nad vsí', why: 'Otevřená krajina, nízké osvětlení', lat: 49.7600, lon: 15.9300 },
    { name: 'Hamry – louka u lesa', why: 'Žďárské vrchy, les stíní záři', lat: 49.7500, lon: 15.8500 },
    { name: 'Studnice – pole za obcí', why: 'Klidná oblast, volný S', lat: 49.7900, lon: 15.9200 },
  ],

  'Skuteč': [
    { name: 'Skuteč – pole severně', why: 'Otevřená krajina, Bortle 4, volný S', lat: 49.8600, lon: 16.0200 },
    { name: 'Hroubovice – louka za vsí', why: 'Klidná oblast, nízké osvětlení', lat: 49.8500, lon: 16.0000 },
    { name: 'Předhradí – pole u lesa', why: 'Les stíní záři, Bortle 4', lat: 49.8400, lon: 16.0400 },
    { name: 'Vrbatův Kostelec – louka', why: 'Podhorská krajina, volný S', lat: 49.8700, lon: 15.9800 },
    { name: 'Leština – pole za obcí', why: 'Zemědělská krajina, tmavá obloha', lat: 49.8300, lon: 16.0100 },
  ],

  'Přehrada Seč': [
    { name: 'Seč – hráz přehrady', why: 'Vodní plocha, otevřený S obzor, Bortle 4', lat: 49.8600, lon: 15.6500 },
    { name: 'Seč – Oheb (zřícenina)', why: 'Vyvýšený bod, panorama, tmavá obloha', lat: 49.8500, lon: 15.6300 },
    { name: 'Proseč – louky nad přehradou', why: 'Klidná oblast, nízké osvětlení', lat: 49.8700, lon: 15.6700 },
    { name: 'Hoješín – pole u přehrady', why: 'Přehradní krajina, les stíní záři', lat: 49.8400, lon: 15.6600 },
    { name: 'Počátky – louka za vsí', why: 'Železnohorská krajina, Bortle 3–4', lat: 49.8800, lon: 15.6400 },
  ],

  'Přelouč': [
    { name: 'Přelouč – pole severně u Labe', why: 'Polabská rovina, otevřený S, Bortle 5', lat: 50.0500, lon: 15.5600 },
    { name: 'Břehy – louka u řeky', why: 'Říční krajina, nízké osvětlení', lat: 50.0400, lon: 15.5300 },
    { name: 'Lhota pod Přeloučí – pole', why: 'Zemědělská krajina, volný S', lat: 50.0300, lon: 15.5800 },
    { name: 'Sopřeč – louka u lesa', why: 'Les stíní záři, Bortle 4', lat: 50.0600, lon: 15.5400 },
    { name: 'Semín – pole za vsí', why: 'Klidná oblast, otevřený obzor', lat: 50.0200, lon: 15.5700 },
  ],

  'Holice': [
    { name: 'Holice – pole severně', why: 'Otevřená krajina, volný S, Bortle 5', lat: 50.0800, lon: 15.9900 },
    { name: 'Horní Ředice – louka za vsí', why: 'Zemědělská krajina, nízké osvětlení', lat: 50.0700, lon: 15.9600 },
    { name: 'Ostřetín – pole u lesa', why: 'Les stíní záři, Bortle 4', lat: 50.0600, lon: 16.0100 },
    { name: 'Poběžovice – louka nad obcí', why: 'Klidná oblast, volný S', lat: 50.0900, lon: 15.9700 },
    { name: 'Dolní Roveň – pole za obcí', why: 'Otevřená krajina, tmavá obloha', lat: 50.0500, lon: 15.9800 },
  ],

  'Lázně Bohdaneč': [
    { name: 'Lázně Bohdaneč – rybníky (hráz)', why: 'Rybniční soustava, Bortle 4, otevřený S', lat: 50.0800, lon: 15.6800 },
    { name: 'Libišany – louka za vsí', why: 'Klidná oblast, rybníky, nízké osvětlení', lat: 50.0900, lon: 15.7000 },
    { name: 'Staré Ždánice – pole u rybníka', why: 'Rybniční krajina, tmavá obloha', lat: 50.0700, lon: 15.6600 },
    { name: 'Živanice – louka u Labe', why: 'Říční niva, volný S', lat: 50.0600, lon: 15.6900 },
    { name: 'Rybitví – pole za obcí', why: 'Zemědělská krajina, Bortle 4', lat: 50.1000, lon: 15.7100 },
  ],

  'Litomyšl': [
    { name: 'Litomyšl – Nedošínský háj (okolí)', why: 'Přírodní rezervace, les stíní záři, Bortle 4', lat: 49.8800, lon: 16.3100 },
    { name: 'Budislav – pole za vsí', why: 'Podhorská krajina, nízké osvětlení', lat: 49.8700, lon: 16.2800 },
    { name: 'Osík – louka nad obcí', why: 'Vyvýšená plocha, volný S', lat: 49.8600, lon: 16.3300 },
    { name: 'Mikuleč – pole u lesa', why: 'Klidná oblast, Bortle 4', lat: 49.8500, lon: 16.3500 },
    { name: 'Cerekvice n. Loučnou – louka', why: 'Zemědělská krajina, tmavá obloha', lat: 49.8900, lon: 16.2900 },
  ],

  'Polička': [
    { name: 'Polička – Liboháje (kopec)', why: 'Vyvýšený bod, Bortle 4, výhled na S', lat: 49.7300, lon: 16.2700 },
    { name: 'Pomezí – louka za vsí', why: 'Podhorská krajina, tmavá obloha', lat: 49.7200, lon: 16.2400 },
    { name: 'Telecí – pole nad vsí', why: 'Otevřená krajina, nízké osvětlení', lat: 49.7100, lon: 16.2900 },
    { name: 'Jedlová – louka u lesa', why: 'Les stíní záři, Bortle 3–4', lat: 49.7000, lon: 16.2500 },
    { name: 'Sádek – pole za obcí', why: 'Klidná oblast, volný S', lat: 49.7400, lon: 16.2800 },
  ],

  'Moravská Třebová': [
    { name: 'Moravská Třebová – pole severně', why: 'Otevřená krajina, volný S, Bortle 5', lat: 49.7700, lon: 16.6600 },
    { name: 'Staré Město – louka za vsí', why: 'Zemědělská krajina, nízké osvětlení', lat: 49.7600, lon: 16.6400 },
    { name: 'Rychnov na Moravě – pole', why: 'Podhorská krajina, les stíní záři', lat: 49.7800, lon: 16.6800 },
    { name: 'Kunčina – louka nad vsí', why: 'Klidná oblast, Bortle 4', lat: 49.7500, lon: 16.6300 },
    { name: 'Borušov – pole u potoka', why: 'Otevřená krajina, volný S', lat: 49.7900, lon: 16.6900 },
  ],

  'Česká Třebová': [
    { name: 'Česká Třebová – Kozlov (kopec)', why: 'Vyvýšený bod, rozhled na S, Bortle 5', lat: 49.9200, lon: 16.4400 },
    { name: 'Rybník – louka za vsí', why: 'Podhorská krajina, nízké osvětlení', lat: 49.9100, lon: 16.4600 },
    { name: 'Přívrat – pole nad obcí', why: 'Otevřená krajina, volný S', lat: 49.9300, lon: 16.4200 },
    { name: 'Třebovice – louka u Třebůvky', why: 'Říční krajina, les stíní záři', lat: 49.9000, lon: 16.4800 },
    { name: 'Semanín – pole za vsí', why: 'Klidná oblast, Bortle 4', lat: 49.8900, lon: 16.4300 },
  ],

  'Lanškroun': [
    { name: 'Lanškroun – pole severně', why: 'Podhorská krajina, Bortle 4, volný S', lat: 49.9300, lon: 16.6100 },
    { name: 'Rudoltice – louka u rybníka', why: 'Rybniční krajina, nízké osvětlení', lat: 49.9200, lon: 16.5900 },
    { name: 'Dolní Čermná – pole nad vsí', why: 'Otevřená krajina, tmavá obloha', lat: 49.9400, lon: 16.6300 },
    { name: 'Albrechtice – louka za vsí', why: 'Klidná oblast, volný S', lat: 49.9100, lon: 16.5700 },
    { name: 'Sázava – pole u potoka', why: 'Podhorská krajina, Bortle 4', lat: 49.9500, lon: 16.6400 },
  ],

  'Letohrad': [
    { name: 'Letohrad – pole severně', why: 'Orlické podhůří, Bortle 4, volný S', lat: 50.0500, lon: 16.5000 },
    { name: 'Kunvald – louka nad vsí', why: 'Podhorská obec, tmavá obloha', lat: 50.0700, lon: 16.5200 },
    { name: 'Ústí nad Orlicí – pole u Třebovky', why: 'Říční krajina, nízké osvětlení', lat: 50.0400, lon: 16.4800 },
    { name: 'Lukavice – louka za obcí', why: 'Klidná oblast, volný S', lat: 50.0600, lon: 16.5300 },
    { name: 'Nekoř – pole u lesa', why: 'Orlické hory, les stíní záři', lat: 50.0800, lon: 16.5500 },
  ],

  // === Jihočeský kraj ===

  'Hluboká nad Vltavou': [
    { name: 'Hluboká – Munický rybník (hráz)', why: 'Rybniční krajina, otevřený S, Bortle 5', lat: 49.0600, lon: 14.4400 },
    { name: 'Bavorovice – louka u Vltavy', why: 'Říční niva, nízké osvětlení', lat: 49.0500, lon: 14.4200 },
    { name: 'Hosín – pole nad obcí', why: 'Vyvýšená plocha, volný S', lat: 49.0700, lon: 14.4600 },
    { name: 'Ohrada – okolí zámku', why: 'Zámecký areál, les stíní záři', lat: 49.0400, lon: 14.4300 },
    { name: 'Dívčice – pole za vsí', why: 'Zemědělská krajina, Bortle 4', lat: 49.0800, lon: 14.4500 },
  ],

  'Trhové Sviny': [
    { name: 'Trhové Sviny – Žár (kopec)', why: 'Vyvýšený bod, Bortle 4, výhled na S', lat: 48.8600, lon: 14.6400 },
    { name: 'Nové Hrady (okolí) – louky', why: 'Novohradské hory, tmavá obloha', lat: 48.7900, lon: 14.7800 },
    { name: 'Žumberk – pole za vsí', why: 'Klidná oblast, nízké osvětlení', lat: 48.8400, lon: 14.6200 },
    { name: 'Horní Stropnice – louka', why: 'Podhorská krajina, volný S', lat: 48.8200, lon: 14.7200 },
    { name: 'Olešnice – pole u lesa', why: 'Les stíní záři, Bortle 3–4', lat: 48.8500, lon: 14.6600 },
  ],

  'Lišov': [
    { name: 'Lišov – pole severně', why: 'Otevřená krajina, Bortle 4, volný S', lat: 49.0300, lon: 14.5800 },
    { name: 'Štěpánovice – louka za vsí', why: 'Zemědělská krajina, nízké osvětlení', lat: 49.0400, lon: 14.5600 },
    { name: 'Mazelov – pole u rybníka', why: 'Rybniční krajina, klid', lat: 49.0200, lon: 14.6000 },
    { name: 'Zvíkov – louka nad obcí', why: 'Klidná oblast, les stíní záři', lat: 49.0100, lon: 14.5700 },
    { name: 'Rudolfov – pole za obcí', why: 'Okraj Budějovic, Bortle 5', lat: 49.0000, lon: 14.5500 },
  ],

  'Vyšší Brod': [
    { name: 'Vyšší Brod – Čertova stěna (okolí)', why: 'Vltavské údolí, Bortle 4, tmavá obloha', lat: 48.6300, lon: 14.3100 },
    { name: 'Rožmberk n. Vltavou – louka', why: 'Říční meandry, nízké osvětlení', lat: 48.6600, lon: 14.3700 },
    { name: 'Loučovice – pole nad obcí', why: 'Podhorská krajina, volný S', lat: 48.6200, lon: 14.2900 },
    { name: 'Studánky – louka u lesa', why: 'Šumavské podhůří, tmavá obloha', lat: 48.6100, lon: 14.3300 },
    { name: 'Kapličky – pole za vsí', why: 'Klidná oblast, Bortle 3–4', lat: 48.6400, lon: 14.3000 },
  ],

  'Kaplice': [
    { name: 'Kaplice – pole severně', why: 'Malšiny, otevřená krajina, Bortle 4, volný S', lat: 48.7500, lon: 14.5000 },
    { name: 'Velešín – louka za městem', why: 'Podhorská krajina, nízké osvětlení', lat: 48.7800, lon: 14.4600 },
    { name: 'Malonty – pole u hranic', why: 'Hraniční oblast, tmavá obloha', lat: 48.6800, lon: 14.5900 },
    { name: 'Dolní Dvořiště – louka za vsí', why: 'Novohradská oblast, Bortle 3', lat: 48.6600, lon: 14.4800 },
    { name: 'Besednice – pole nad vsí', why: 'Klidná oblast, volný S', lat: 48.7300, lon: 14.5200 },
  ],

  'Lipno n. Vltavou': [
    { name: 'Lipno – přehrada (hráz)', why: 'Vodní plocha, otevřený S obzor, Bortle 3', lat: 48.6300, lon: 14.2200 },
    { name: 'Frymburk – louka u jezera', why: 'Lipenská krajina, tmavá obloha', lat: 48.6600, lon: 14.1700 },
    { name: 'Přední Výtoň – pole nad obcí', why: 'Šumavská krajina, minimální záře', lat: 48.6400, lon: 14.1400 },
    { name: 'Černá v Pošumaví – louka u přehrady', why: 'Přehradní krajina, Bortle 3', lat: 48.7400, lon: 14.1100 },
    { name: 'Horní Planá – pole za městem', why: 'Vltavická krajina, volný S', lat: 48.7700, lon: 14.0300 },
  ],

  'Jindřichův Hradec': [
    { name: 'J. Hradec – Vajgar (břeh rybníka)', why: 'Vodní plocha, otevřený S, Bortle 5', lat: 49.1500, lon: 15.0000 },
    { name: 'Kardašova Řečice – pole', why: 'Rybniční krajina, nízké osvětlení', lat: 49.1800, lon: 15.0600 },
    { name: 'Nová Bystřice – louky u hranic', why: 'Hraniční oblast, tmavá obloha', lat: 49.0200, lon: 15.1000 },
    { name: 'Kunžak – pole nad obcí', why: 'Klidná oblast, Bortle 4', lat: 49.1100, lon: 15.1900 },
    { name: 'Děbolín – louka za vsí', why: 'Zemědělská krajina, volný S', lat: 49.1600, lon: 14.9700 },
  ],

  'Třeboň': [
    { name: 'Třeboň – Svět (hráz rybníka)', why: 'Rybniční soustava, Bortle 4, otevřený S', lat: 49.0000, lon: 14.7700 },
    { name: 'Stará Hlína – louka u rybníka', why: 'Rybniční krajina, nízké osvětlení', lat: 48.9800, lon: 14.7500 },
    { name: 'Chlum u Třeboně – pole', why: 'Blížení k hranicím, tmavá obloha', lat: 48.9500, lon: 14.8300 },
    { name: 'Branná – louka za vsí', why: 'Klidná oblast, volný S, Bortle 3–4', lat: 49.0100, lon: 14.7900 },
    { name: 'Lužnice – pole u řeky', why: 'Říční krajina, les stíní záři', lat: 49.0200, lon: 14.7600 },
  ],

  'Dačice': [
    { name: 'Dačice – pole severně', why: 'Otevřená krajina, Bortle 4, volný S', lat: 49.1000, lon: 15.4400 },
    { name: 'Kostelní Vydří – louka u kláštera', why: 'Klidné místo, les stíní záři', lat: 49.0900, lon: 15.4200 },
    { name: 'Peč – pole za vsí', why: 'Zemědělská krajina, nízké osvětlení', lat: 49.0800, lon: 15.4600 },
    { name: 'Budíškovice – louka nad vsí', why: 'Vyvýšená plocha, volný S', lat: 49.1100, lon: 15.4100 },
    { name: 'Cizkrajov – pole u potoka', why: 'Podhorská krajina, Bortle 4', lat: 49.0700, lon: 15.4300 },
  ],

  'Slavonice': [
    { name: 'Slavonice – pole SZ od města', why: 'Hraniční oblast, Bortle 3, otevřený S', lat: 49.0100, lon: 15.3500 },
    { name: 'Maříž – louka u hranic', why: 'Česko-rakouské pomezí, minimální záře', lat: 48.9800, lon: 15.3200 },
    { name: 'Písečné – pole nad vsí', why: 'Klidná oblast, tmavá obloha', lat: 49.0000, lon: 15.3700 },
    { name: 'Slavětín – louka za obcí', why: 'Zemědělská krajina, volný S', lat: 49.0200, lon: 15.3400 },
    { name: 'Stálkov – pole u lesa', why: 'Les stíní záři, Bortle 3', lat: 48.9900, lon: 15.3600 },
  ],

  'Milevsko': [
    { name: 'Milevsko – pole severně', why: 'Otevřená krajina, volný S, Bortle 5', lat: 49.4700, lon: 14.3600 },
    { name: 'Přeborov – louka za vsí', why: 'Zemědělská krajina, nízké osvětlení', lat: 49.4600, lon: 14.3400 },
    { name: 'Sepekov – pole u lesa', why: 'Les stíní záři, Bortle 4', lat: 49.4500, lon: 14.3800 },
    { name: 'Bernartice – louka nad obcí', why: 'Vyvýšená plocha, volný S', lat: 49.4400, lon: 14.3500 },
    { name: 'Kovářov – pole za vsí', why: 'Klidná oblast, tmavá obloha', lat: 49.4800, lon: 14.2800 },
  ],

  'Protivín': [
    { name: 'Protivín – pole severně', why: 'Otevřená krajina, Bortle 4, volný S', lat: 49.2100, lon: 14.2200 },
    { name: 'Skočice – louka za vsí', why: 'Zemědělská krajina, nízké osvětlení', lat: 49.2200, lon: 14.2000 },
    { name: 'Heřmaň – pole u rybníka', why: 'Rybniční krajina, klid', lat: 49.2000, lon: 14.2400 },
    { name: 'Vodňany – louka u Blanice', why: 'Říční krajina, Bortle 4', lat: 49.1800, lon: 14.1800 },
    { name: 'Krašlovice – pole nad vsí', why: 'Klidná oblast, volný S', lat: 49.2300, lon: 14.2100 },
  ],

  'Vimperk': [
    { name: 'Vimperk – Boubín (okolí pralesa)', why: 'Šumava, Bortle 3, tmavá obloha', lat: 49.0000, lon: 13.8100 },
    { name: 'Kubova Huť – pole nad obcí', why: 'Nejvýše položená obec ČR, Bortle 2–3', lat: 49.0200, lon: 13.7600 },
    { name: 'Zátoň – louka u Vltavy', why: 'Říční krajina, nízké osvětlení', lat: 49.0500, lon: 13.8000 },
    { name: 'Čkyně – pole za obcí', why: 'Šumavské podhůří, les stíní záři', lat: 49.0900, lon: 13.8300 },
    { name: 'Pravětín – louka nad vsí', why: 'Klidná oblast, volný S', lat: 49.0700, lon: 13.7800 },
  ],

  'Volary': [
    { name: 'Volary – Soumarský Most (louky)', why: 'Šumavské rašeliniště, Bortle 2–3, minimální záře', lat: 48.9200, lon: 13.8700 },
    { name: 'Zbytiny – pole za vsí', why: 'Podhorská obec, tmavá obloha', lat: 48.9400, lon: 13.8500 },
    { name: 'Nová Pec – louka u Lipna', why: 'Lipenská krajina, Bortle 3', lat: 48.7700, lon: 13.9400 },
    { name: 'Lenora – pole nad vsí', why: 'Šumavská obec, nízké osvětlení', lat: 49.0000, lon: 13.7900 },
    { name: 'Stožec – louka u nádraží', why: 'NP Šumava, minimální záře, Bortle 2', lat: 48.8700, lon: 13.8300 },
  ],

  'Blatná': [
    { name: 'Blatná – pole severně', why: 'Otevřená krajina, Bortle 4, volný S', lat: 49.4400, lon: 13.8800 },
    { name: 'Lnáře – louka u rybníka', why: 'Rybniční krajina, nízké osvětlení', lat: 49.4300, lon: 13.8600 },
    { name: 'Kadov – pole za vsí', why: 'Klidná oblast, volný S', lat: 49.4500, lon: 13.9000 },
    { name: 'Hajany – louka nad obcí', why: 'Zemědělská krajina, les stíní záři', lat: 49.4200, lon: 13.8500 },
    { name: 'Buzice – pole u lesa', why: 'Podhorská krajina, Bortle 4', lat: 49.4100, lon: 13.8700 },
  ],

  'Volyně': [
    { name: 'Volyně – pole severně', why: 'Otevřená krajina, Bortle 4, volný S', lat: 49.1800, lon: 13.8900 },
    { name: 'Nihošovice – louka za vsí', why: 'Klidná oblast, nízké osvětlení', lat: 49.1900, lon: 13.8700 },
    { name: 'Nemětice – pole u lesa', why: 'Les stíní záři, Bortle 4', lat: 49.1700, lon: 13.9100 },
    { name: 'Předslavice – louka nad vsí', why: 'Podhorská krajina, volný S', lat: 49.1600, lon: 13.8600 },
    { name: 'Litochovice – pole za obcí', why: 'Zemědělská krajina, tmavá obloha', lat: 49.2000, lon: 13.8800 },
  ],

  'Soběslav': [
    { name: 'Soběslav – pole severně u Lužnice', why: 'Říční krajina, otevřený S, Bortle 5', lat: 49.2700, lon: 14.7200 },
    { name: 'Řípec – louka u rybníka', why: 'Rybniční krajina, nízké osvětlení', lat: 49.2600, lon: 14.7400 },
    { name: 'Klenovice – pole za vsí', why: 'Klidná oblast, volný S', lat: 49.2800, lon: 14.7000 },
    { name: 'Veselí n. Lužnicí – louka', why: 'Říční niva, Bortle 5', lat: 49.2500, lon: 14.6900 },
    { name: 'Dráchov – pole nad vsí', why: 'Zemědělská krajina, les stíní záři', lat: 49.2900, lon: 14.7300 },
  ],

  'Mladá Vožice': [
    { name: 'Mladá Vožice – pole severně', why: 'Otevřená krajina, Bortle 4, volný S', lat: 49.5500, lon: 14.8100 },
    { name: 'Šebířov – louka za vsí', why: 'Klidná oblast, nízké osvětlení', lat: 49.5400, lon: 14.7900 },
    { name: 'Smilovy Hory – pole na hřebeni', why: 'Vyvýšená plocha, tmavá obloha', lat: 49.5300, lon: 14.8300 },
    { name: 'Ratibořice – louka nad vsí', why: 'Podhorská krajina, volný S', lat: 49.5600, lon: 14.8000 },
    { name: 'Choustník – pole u hradu', why: 'Okolí zříceniny, les stíní záři', lat: 49.5200, lon: 14.8200 },
  ],

  'Bechyně': [
    { name: 'Bechyně – Lužnice (břeh u mostu)', why: 'Říční krajina, otevřený S, Bortle 4', lat: 49.3000, lon: 14.4700 },
    { name: 'Opařany – pole za obcí', why: 'Zemědělská krajina, nízké osvětlení', lat: 49.3300, lon: 14.4800 },
    { name: 'Sudoměřice u Bechyně – louka', why: 'Klidná oblast, volný S', lat: 49.2900, lon: 14.4500 },
    { name: 'Hněvkovice – přehrada (okolí)', why: 'Vodní plocha, Bortle 4', lat: 49.3100, lon: 14.4200 },
    { name: 'Želeč – pole nad vsí', why: 'Vyvýšená plocha, tmavá obloha', lat: 49.3200, lon: 14.4600 },
  ],

  // === Zlínský kraj ===

  'Holešov': [
    { name: 'Holešov – pole severně u Rusavy', why: 'Říční krajina, otevřený S, Bortle 5', lat: 49.3500, lon: 17.5800 },
    { name: 'Bořenovice – louka za vsí', why: 'Podhorská krajina, nízké osvětlení', lat: 49.3400, lon: 17.5600 },
    { name: 'Prusinovice – pole nad obcí', why: 'Vyvýšená plocha, volný S', lat: 49.3200, lon: 17.6000 },
    { name: 'Martinice – louka u potoka', why: 'Klidná oblast, les stíní záři', lat: 49.3600, lon: 17.5500 },
    { name: 'Žalkovice – pole za vsí', why: 'Zemědělská krajina, Bortle 5', lat: 49.3300, lon: 17.6100 },
  ],

  'Bystřice p. Hostýnem': [
    { name: 'Bystřice p. H. – Hostýn (vrch)', why: 'Vyvýšený bod, panorama na S, Bortle 4', lat: 49.4100, lon: 17.6700 },
    { name: 'Chvalčov – louka u lesa', why: 'Hostýnské vrchy, tmavá obloha', lat: 49.4000, lon: 17.6500 },
    { name: 'Rusava – pole za vsí', why: 'Horská obec, nízké osvětlení', lat: 49.3800, lon: 17.6900 },
    { name: 'Loukov – louka nad vsí', why: 'Klidná oblast, volný S', lat: 49.4200, lon: 17.6400 },
    { name: 'Slavkov p. Hostýnem – pole', why: 'Podhorská krajina, Bortle 4', lat: 49.3900, lon: 17.6800 },
  ],

  'Chropyně': [
    { name: 'Chropyně – rybníky (hráz)', why: 'Rybniční soustava, otevřený S, Bortle 4', lat: 49.3600, lon: 17.3600 },
    { name: 'Záříčí – louka u Moravy', why: 'Říční niva, nízké osvětlení', lat: 49.3700, lon: 17.3400 },
    { name: 'Plešovec – pole za vsí', why: 'Zemědělská krajina, volný S', lat: 49.3500, lon: 17.3800 },
    { name: 'Kyselovice – louka nad vsí', why: 'Klidná oblast, les stíní záři', lat: 49.3400, lon: 17.3500 },
    { name: 'Věžky – pole u rybníka', why: 'Rybniční krajina, Bortle 4', lat: 49.3800, lon: 17.3700 },
  ],

  'Uherský Brod': [
    { name: 'Uherský Brod – pole severně', why: 'Otevřená krajina, volný S, Bortle 5', lat: 49.0400, lon: 17.6500 },
    { name: 'Korytná – louka za vsí', why: 'Bílé Karpaty, tmavá obloha', lat: 49.0300, lon: 17.6700 },
    { name: 'Bánov – pole nad obcí', why: 'Podhorská krajina, nízké osvětlení', lat: 49.0200, lon: 17.6300 },
    { name: 'Nivnice – louka u potoka', why: 'Klidná oblast, volný S', lat: 49.0100, lon: 17.6100 },
    { name: 'Prakšice – pole za vsí', why: 'Zemědělská krajina, Bortle 4', lat: 49.0500, lon: 17.6800 },
  ],

  'Bojkovice': [
    { name: 'Bojkovice – Šanov (vrch)', why: 'Bílé Karpaty, Bortle 4, výhled na S', lat: 49.0500, lon: 17.7600 },
    { name: 'Komňa – louka za vsí', why: 'Klidná oblast, tmavá obloha', lat: 49.0400, lon: 17.7800 },
    { name: 'Pitín – pole nad obcí', why: 'Podhorská krajina, nízké osvětlení', lat: 49.0300, lon: 17.7400 },
    { name: 'Hostětín – louka u lesa', why: 'Přírodní oblast, les stíní záři', lat: 49.0600, lon: 17.7700 },
    { name: 'Nezdenice – pole za vsí', why: 'Moravsko-slovenské pomezí, Bortle 3–4', lat: 49.0200, lon: 17.7500 },
  ],

  'Valašské Meziříčí': [
    { name: 'Valašské Meziříčí – pole SZ', why: 'Otevřená krajina, volný S, Bortle 5', lat: 49.4900, lon: 17.9700 },
    { name: 'Kelč – louka za městysem', why: 'Zemědělská krajina, nízké osvětlení', lat: 49.5000, lon: 17.9200 },
    { name: 'Branky – pole u potoka', why: 'Klidná oblast, les stíní záři', lat: 49.4800, lon: 17.9900 },
    { name: 'Lešná – louka u ZOO (okolí)', why: 'Parkový areál, volný S', lat: 49.4600, lon: 17.9500 },
    { name: 'Poličná – pole za vsí', why: 'Podhorská krajina, Bortle 5', lat: 49.4700, lon: 17.9400 },
  ],

  'Rožnov p. Radh.': [
    { name: 'Rožnov – Radhošť (sedlo)', why: 'Beskydy, Bortle 4, výhled na S', lat: 49.4800, lon: 18.1400 },
    { name: 'Dolní Bečva – louka u Bečvy', why: 'Říční údolí, les stíní záři', lat: 49.4600, lon: 18.1600 },
    { name: 'Prostřední Bečva – pole', why: 'Horská obec, tmavá obloha', lat: 49.4500, lon: 18.1800 },
    { name: 'Vigantice – louka nad vsí', why: 'Podhorská krajina, nízké osvětlení', lat: 49.4700, lon: 18.1200 },
    { name: 'Hutisko-Solanec – pole za vsí', why: 'Beskydy, Bortle 3–4', lat: 49.4300, lon: 18.2000 },
  ],

  'Velké Karlovice': [
    { name: 'Velké Karlovice – Soláň (sedlo)', why: 'Beskydy, Bortle 3, výhled na S', lat: 49.3700, lon: 18.2700 },
    { name: 'Karolinka – louka nad přehradou', why: 'Přehradní krajina, tmavá obloha', lat: 49.3600, lon: 18.2400 },
    { name: 'Nový Hrozenkov – pole za vsí', why: 'Horská obec, nízké osvětlení', lat: 49.3400, lon: 18.2000 },
    { name: 'Léskové – louka u potoka', why: 'Klidná oblast, les stíní záři', lat: 49.3800, lon: 18.2900 },
    { name: 'Podťaté – pole nad vsí', why: 'Valašská krajina, Bortle 3–4', lat: 49.3500, lon: 18.2600 },
  ],

  'Otrokovice': [
    { name: 'Otrokovice – Baťův kanál (břeh)', why: 'Říční krajina, otevřený S, Bortle 5', lat: 49.2200, lon: 17.5300 },
    { name: 'Napajedla – louka u Moravy', why: 'Říční niva, nízké osvětlení', lat: 49.1700, lon: 17.5100 },
    { name: 'Tlumačov – pole za obcí', why: 'Zemědělská krajina, volný S', lat: 49.2300, lon: 17.5000 },
    { name: 'Halenkovice – louka nad vsí', why: 'Podhorská krajina, les stíní záři', lat: 49.2100, lon: 17.5500 },
    { name: 'Bělov – pole u lesa', why: 'Klidná oblast, Bortle 5', lat: 49.2000, lon: 17.5200 },
  ],

  'Vizovice': [
    { name: 'Vizovice – Vizovická přehrada (hráz)', why: 'Vodní plocha, Bortle 5, otevřený obzor', lat: 49.2300, lon: 17.8500 },
    { name: 'Slušovice – pole za městem', why: 'Podhorská krajina, nízké osvětlení', lat: 49.2400, lon: 17.8000 },
    { name: 'Zádveřice – louka u potoka', why: 'Údolí, les stíní záři', lat: 49.2200, lon: 17.8300 },
    { name: 'Bratřejov – pole nad vsí', why: 'Vyvýšená plocha, volný S', lat: 49.2100, lon: 17.8700 },
    { name: 'Jasenná – louka za vsí', why: 'Klidná oblast, Bortle 4', lat: 49.2000, lon: 17.8200 },
  ],

  'Luhačovice': [
    { name: 'Luhačovice – přehrada (hráz)', why: 'Vodní plocha, Bortle 4, otevřený S', lat: 49.1100, lon: 17.7600 },
    { name: 'Pozlovice – louka za vsí', why: 'Lázeňská krajina, les stíní záři', lat: 49.1000, lon: 17.7400 },
    { name: 'Polichno – pole na hřebeni', why: 'Vyvýšená plocha, volný S', lat: 49.1200, lon: 17.7800 },
    { name: 'Biskupice – louka nad vsí', why: 'Klidná oblast, nízké osvětlení', lat: 49.0900, lon: 17.7500 },
    { name: 'Ludkovice – pole u potoka', why: 'Podhorská krajina, Bortle 4', lat: 49.0800, lon: 17.7700 },
  ],

  // === Ústecký kraj ===

  'Jirkov': [
    { name: 'Jirkov – Červený Hrádek (park)', why: 'Zámecký park, les stíní záři, Bortle 5', lat: 50.5100, lon: 13.4500 },
    { name: 'Boleboř – louky nad obcí', why: 'Krušnohoří, tmavá obloha', lat: 50.5400, lon: 13.4200 },
    { name: 'Otvice – pole za vsí', why: 'Otevřená krajina, volný S', lat: 50.4900, lon: 13.4700 },
    { name: 'Březenec – louka u lesa', why: 'Podhorská oblast, Bortle 4', lat: 50.5200, lon: 13.4300 },
    { name: 'Vysoká Pec – pole nad vsí', why: 'Horské podhůří, nízké osvětlení', lat: 50.5300, lon: 13.4100 },
  ],

  'Kadaň': [
    { name: 'Kadaň – Úhošť (kopec)', why: 'Čedičový vrch, rozhled na S, Bortle 4', lat: 50.3900, lon: 13.2700 },
    { name: 'Radonice – pole za vsí', why: 'Otevřená krajina, nízké osvětlení', lat: 50.3700, lon: 13.2500 },
    { name: 'Prunéřov – louka u řeky', why: 'Říční krajina Ohře, volný S', lat: 50.3800, lon: 13.2900 },
    { name: 'Rokle – pole nad vsí', why: 'Klidná oblast, Bortle 4', lat: 50.3600, lon: 13.2800 },
    { name: 'Klášterec n. Ohří – louka u lesa', why: 'Les stíní záři, volný SZ', lat: 50.3900, lon: 13.1700 },
  ],

  'Hora Sv. Šebestiána': [
    { name: 'Hora Sv. Šebestiána – náves', why: 'Krušnohoří, Bortle 3, vysoká poloha, panorama na S', lat: 50.5600, lon: 13.2400 },
    { name: 'Načetín – louka za vsí', why: 'Příhraniční oblast, minimální záře', lat: 50.5700, lon: 13.2200 },
    { name: 'Kalek – pole u lesa', why: 'Krušné hory, tmavá obloha', lat: 50.5800, lon: 13.2600 },
    { name: 'Výsluní – louka nad obcí', why: 'Horská obec, Bortle 3–4', lat: 50.5400, lon: 13.2300 },
    { name: 'Měděnec – pole za vsí', why: 'Krušnohorská oblast, nízké osvětlení', lat: 50.4200, lon: 13.1000 },
  ],

  'Rumburk': [
    { name: 'Rumburk – Dymník (rozhledna)', why: 'Vyvýšený bod, Bortle 4, výhled na S', lat: 50.9600, lon: 14.5700 },
    { name: 'Jiříkov – pole u hranic', why: 'Hraniční oblast, nízké osvětlení', lat: 50.9800, lon: 14.5600 },
    { name: 'Krásná Lípa – louka za městem', why: 'Šluknovský výběžek, volný S', lat: 50.9200, lon: 14.5200 },
    { name: 'Doubice – pole u lesa', why: 'NP České Švýcarsko, tmavá obloha', lat: 50.9000, lon: 14.4800 },
    { name: 'Mikulášovice – louka za obcí', why: 'Příhraniční obec, Bortle 4', lat: 50.9700, lon: 14.3600 },
  ],

  'Varnsdorf': [
    { name: 'Varnsdorf – Špičák (rozhledna)', why: 'Vyvýšený bod, rozhled na S, Bortle 5', lat: 50.9200, lon: 14.6200 },
    { name: 'Chřibská – louka za městem', why: 'Údolí Kamenice, tmavá obloha', lat: 50.8700, lon: 14.4900 },
    { name: 'Dolní Podluží – pole za vsí', why: 'Lužické hory, nízké osvětlení', lat: 50.8900, lon: 14.5800 },
    { name: 'Studánka – louka u lesa', why: 'Les stíní záři, Bortle 4', lat: 50.9300, lon: 14.6400 },
    { name: 'Seifhennersdorf (předpolí) – pole', why: 'Otevřená hraniční krajina, volný S', lat: 50.9400, lon: 14.6100 },
  ],

  'České Švýcarsko': [
    { name: 'Mezná – louka nad vsí', why: 'NP České Švýcarsko, Bortle 3, minimální záře', lat: 50.8700, lon: 14.2800 },
    { name: 'Jetřichovice – pole u skal', why: 'Skalní krajina, tmavá obloha', lat: 50.8600, lon: 14.3700 },
    { name: 'Vysoká Lípa – louky nad obcí', why: 'Otevřený obzor, volný S', lat: 50.8500, lon: 14.3200 },
    { name: 'Růžová – pole na hřebeni', why: 'Vyvýšená plocha, nízké osvětlení', lat: 50.8300, lon: 14.2700 },
    { name: 'Srbská Kamenice – louka', why: 'Klidná oblast, Bortle 3, les stíní záři', lat: 50.8400, lon: 14.3400 },
  ],

  'Roudnice n. Labem': [
    { name: 'Roudnice – Říp (vrch)', why: 'Ikonický kopec, Bortle 4, otevřený S obzor', lat: 50.3900, lon: 14.2900 },
    { name: 'Doksany – louky u Ohře', why: 'Říční krajina, nízké osvětlení', lat: 50.4500, lon: 14.1700 },
    { name: 'Budyně n. Ohří – pole', why: 'Otevřená krajina, volný S', lat: 50.4100, lon: 14.1200 },
    { name: 'Chodouny – louka za vsí', why: 'Zemědělská krajina, Bortle 5', lat: 50.4200, lon: 14.2600 },
    { name: 'Vědomice – pole nad obcí', why: 'Polabská rovina, otevřený obzor', lat: 50.4300, lon: 14.2400 },
  ],

  'Lovosice': [
    { name: 'Lovosice – Lovoš (vrch)', why: 'České středohoří, Bortle 4, panorama na S', lat: 50.5300, lon: 14.0300 },
    { name: 'Malé Žernoseky – louka u Labe', why: 'Říční krajina, nízké osvětlení', lat: 50.5400, lon: 14.0600 },
    { name: 'Čížkovice – pole za obcí', why: 'Otevřená krajina, volný S', lat: 50.5000, lon: 14.0700 },
    { name: 'Oparno – louka u hradu', why: 'Středohorská krajina, tmavá obloha', lat: 50.5500, lon: 14.0100 },
    { name: 'Třebenice – pole nad městem', why: 'Vyvýšená plocha, Bortle 4', lat: 50.4700, lon: 14.0000 },
  ],

  'Louny': [
    { name: 'Louny – pole severně u Ohře', why: 'Říční krajina, otevřený S, Bortle 5', lat: 50.3700, lon: 13.7900 },
    { name: 'Lenešice – louka za obcí', why: 'Zemědělská krajina, nízké osvětlení', lat: 50.3600, lon: 13.8100 },
    { name: 'Dobroměřice – pole u rybníka', why: 'Rybniční krajina, volný S', lat: 50.3500, lon: 13.8300 },
    { name: 'Cítoliby – louka nad vsí', why: 'Klidná oblast, Bortle 5', lat: 50.3400, lon: 13.8000 },
    { name: 'Peruc – pole za vsí', why: 'Otevřená krajina, les stíní záři', lat: 50.3800, lon: 13.7600 },
  ],

  'Žatec': [
    { name: 'Žatec – pole severně', why: 'Otevřená chmelařská krajina, volný S, Bortle 5', lat: 50.3400, lon: 13.5500 },
    { name: 'Staňkovice – louka za vsí', why: 'Zemědělská krajina, nízké osvětlení', lat: 50.3300, lon: 13.5200 },
    { name: 'Libořice – pole u potoka', why: 'Klidná oblast, volný S', lat: 50.3500, lon: 13.5700 },
    { name: 'Holedeč – louka u Ohře', why: 'Říční krajina, Bortle 5', lat: 50.3200, lon: 13.5900 },
    { name: 'Měcholupy – pole za obcí', why: 'Otevřená krajina, les stíní záři', lat: 50.3600, lon: 13.5300 },
  ],

  'Podbořany': [
    { name: 'Podbořany – pole severně', why: 'Zemědělská krajina, Bortle 4, volný S', lat: 50.2500, lon: 13.4100 },
    { name: 'Blšany – louka za vsí', why: 'Klidná oblast, nízké osvětlení', lat: 50.2400, lon: 13.4300 },
    { name: 'Vroutek – pole nad vsí', why: 'Otevřená krajina, volný S', lat: 50.2300, lon: 13.3800 },
    { name: 'Jesenice – louka u potoka', why: 'Podhorská krajina, Bortle 4', lat: 50.2200, lon: 13.4000 },
    { name: 'Kryry – pole za městem', why: 'Zemědělská krajina, tmavá obloha', lat: 50.1700, lon: 13.4400 },
  ],

  'Raná u Loun': [
    { name: 'Raná – vrcholová plošina', why: 'Čedičový vrch, Bortle 3–4, panorama na S', lat: 50.3900, lon: 13.7500 },
    { name: 'Raná – pole pod kopcem (sever)', why: 'Otevřený S obzor, paraglidingové místo', lat: 50.4000, lon: 13.7400 },
    { name: 'Smolnice – louka za vsí', why: 'Klidná oblast, nízké osvětlení', lat: 50.3800, lon: 13.7600 },
    { name: 'Koštice – pole u Ohře', why: 'Říční krajina, Bortle 4', lat: 50.3700, lon: 13.7700 },
    { name: 'Břvany – louka nad vsí', why: 'Zemědělská krajina, volný S', lat: 50.4100, lon: 13.7300 },
  ],

  'Litvínov': [
    { name: 'Litvínov – Mezihoří (kopec)', why: 'Krušnohoří, vyvýšený bod, Bortle 4', lat: 50.6200, lon: 13.6100 },
    { name: 'Klíny – louka u sjezdovky', why: 'Horská obec, tmavá obloha', lat: 50.6400, lon: 13.5600 },
    { name: 'Hora Sv. Kateřiny – pole za obcí', why: 'Krušné hory, nízké osvětlení', lat: 50.6100, lon: 13.5100 },
    { name: 'Český Jiřetín – louka u lesa', why: 'Les stíní záři, Bortle 3–4', lat: 50.6600, lon: 13.5400 },
    { name: 'Hamr – pole nad obcí', why: 'Krušnohorská obec, volný S', lat: 50.6300, lon: 13.6300 },
  ],

  'Hora Sv. Kateřiny': [
    { name: 'Hora Sv. Kateřiny – louky u nádraží', why: 'Krušné hory, Bortle 3, tmavá obloha', lat: 50.6100, lon: 13.5100 },
    { name: 'Brandov – pole u hranic', why: 'Hraniční oblast, minimální záře', lat: 50.6300, lon: 13.4800 },
    { name: 'Klíny (východ) – louka', why: 'Horská obec, nízké osvětlení', lat: 50.6400, lon: 13.5400 },
    { name: 'Fláje – přehrada (okolí)', why: 'Vodní plocha, Bortle 3', lat: 50.6500, lon: 13.5700 },
    { name: 'Český Jiřetín – pole nad vsí', why: 'Podhorská obec, volný S', lat: 50.6600, lon: 13.5300 },
  ],

  'Duchcov': [
    { name: 'Duchcov – pole severně', why: 'Otevřená krajina, volný S, Bortle 5', lat: 50.6200, lon: 13.7500 },
    { name: 'Lahošť – louka za vsí', why: 'Klidná oblast, nízké osvětlení', lat: 50.6100, lon: 13.7200 },
    { name: 'Jeníkov – pole u lesa', why: 'Les stíní záři, Bortle 4', lat: 50.5900, lon: 13.7700 },
    { name: 'Osek – louka u kláštera', why: 'Historické místo, les stíní záři', lat: 50.6300, lon: 13.7000 },
    { name: 'Háj – pole za obcí', why: 'Podkrušnohoří, volný S', lat: 50.6000, lon: 13.7300 },
  ],

  'Krupka': [
    { name: 'Krupka – Komáří vížka (rozhledna)', why: 'Krušnohoří, Bortle 4, vysoký bod', lat: 50.7100, lon: 13.8700 },
    { name: 'Cínovec – pole u hranic', why: 'Hraniční oblast, nízké osvětlení', lat: 50.7300, lon: 13.7700 },
    { name: 'Fojtovice – louka za vsí', why: 'Horská obec, tmavá obloha', lat: 50.7000, lon: 13.8900 },
    { name: 'Bohosudov – pole nad obcí', why: 'Podkrušnohoří, volný S', lat: 50.6800, lon: 13.8500 },
    { name: 'Unčín – louka u potoka', why: 'Klidná oblast, Bortle 4', lat: 50.6900, lon: 13.8800 },
  ],

  'Dubí': [
    { name: 'Dubí – Cínovec (okolí)', why: 'Krušnohoří, Bortle 4, tmavá obloha', lat: 50.7300, lon: 13.7800 },
    { name: 'Moldava – louka u hranic', why: 'Hraniční oblast, minimální záře', lat: 50.7200, lon: 13.6700 },
    { name: 'Mstišov – pole za vsí', why: 'Podhorská krajina, nízké osvětlení', lat: 50.7000, lon: 13.8000 },
    { name: 'Novosedlice – louka nad obcí', why: 'Klidná oblast, volný S', lat: 50.7100, lon: 13.7900 },
    { name: 'Mikulov (Krušné hory) – pole', why: 'Horská obec, Bortle 3–4', lat: 50.7400, lon: 13.7500 },
  ],

  'Chabařovice': [
    { name: 'Chabařovice – Milada (jezero)', why: 'Rekultivované jezero, otevřený S, Bortle 5', lat: 50.6800, lon: 13.9400 },
    { name: 'Roudníky – pole nad vsí', why: 'Vyvýšená plocha, volný S', lat: 50.6700, lon: 13.9200 },
    { name: 'Přestanov – louka za obcí', why: 'Klidná oblast, nízké osvětlení', lat: 50.6900, lon: 13.9600 },
    { name: 'Všebořice – pole u lesa', why: 'Les stíní záři, Bortle 5', lat: 50.6600, lon: 13.9500 },
    { name: 'Trmice – louka u jezera', why: 'Jezero Milada, otevřený obzor', lat: 50.6500, lon: 13.9800 },
  ],

  'Velké Březno': [
    { name: 'Velké Březno – pole severně u Labe', why: 'Labské údolí, otevřený S, Bortle 5', lat: 50.6800, lon: 14.1300 },
    { name: 'Zubrnice – louka nad vsí', why: 'Podhorská krajina, nízké osvětlení', lat: 50.6500, lon: 14.1800 },
    { name: 'Neštěmice – pole za obcí', why: 'Okraj Ústí, les stíní záři', lat: 50.6700, lon: 14.1000 },
    { name: 'Povrly – louka u Labe', why: 'Říční krajina, volný S', lat: 50.6900, lon: 14.1600 },
    { name: 'Svádov – pole nad vsí', why: 'Klidná oblast, Bortle 5', lat: 50.6600, lon: 14.1500 },
  ],

  // === Karlovarský kraj ===

  'Aš': [
    { name: 'Aš – Háj (rozhledna)', why: 'Nejzápadnější CZ, Bortle 4, výhled na S', lat: 50.2300, lon: 12.1900 },
    { name: 'Podhradí – louka u hranic', why: 'Příhraniční oblast, nízké osvětlení', lat: 50.2500, lon: 12.1700 },
    { name: 'Krásná – pole za vsí', why: 'Otevřená krajina, volný S', lat: 50.2100, lon: 12.2100 },
    { name: 'Mokřiny – louka u potoka', why: 'Klidná oblast, Bortle 5', lat: 50.2400, lon: 12.2000 },
    { name: 'Trojmezí – pole u hranic', why: 'Trojmezí CZ–DE–DE, minimální záře', lat: 50.2600, lon: 12.1600 },
  ],

  'Mariánské Lázně': [
    { name: 'Mariánské Lázně – Krakonoš (vrch)', why: 'Slavkovský les, Bortle 4, výhled na S', lat: 49.9800, lon: 12.7000 },
    { name: 'Kladská – rašeliniště (okolí)', why: 'Přírodní rezervace, tmavá obloha', lat: 50.0200, lon: 12.6800 },
    { name: 'Lázně Kynžvart – louky', why: 'Lázeňská krajina, les stíní záři', lat: 50.0100, lon: 12.6300 },
    { name: 'Mnichov – pole za vsí', why: 'Klidná oblast, nízké osvětlení', lat: 49.9700, lon: 12.6500 },
    { name: 'Vlkovice – louka nad obcí', why: 'Podhorská krajina, Bortle 4', lat: 49.9500, lon: 12.7200 },
  ],

  'SOOS': [
    { name: 'SOOS – přírodní rezervace (okraj)', why: 'Rašeliniště, Bortle 3, minimální záře', lat: 50.1500, lon: 12.4000 },
    { name: 'Nový Drahov – pole za vsí', why: 'Otevřená krajina, tmavá obloha', lat: 50.1600, lon: 12.3800 },
    { name: 'Vonšov – louka u potoka', why: 'Klidná oblast, les stíní záři', lat: 50.1400, lon: 12.4200 },
    { name: 'Kateřina – pole nad vsí', why: 'Vyvýšená plocha, volný S', lat: 50.1300, lon: 12.4100 },
    { name: 'Hartoušov – louka u lesa', why: 'Přírodní oblast, Bortle 3', lat: 50.1700, lon: 12.3900 },
  ],

  'Ostrov': [
    { name: 'Ostrov – pole SZ od města', why: 'Otevřená krajina, volný S, Bortle 5', lat: 50.3200, lon: 12.9300 },
    { name: 'Hroznětín – louka za městem', why: 'Podhorská krajina, nízké osvětlení', lat: 50.3300, lon: 12.8900 },
    { name: 'Abertamy – pole nad obcí', why: 'Krušnohoří, tmavá obloha', lat: 50.3700, lon: 12.8200 },
    { name: 'Merklín – louka u lesa', why: 'Les stíní záři, Bortle 4', lat: 50.3100, lon: 12.9500 },
    { name: 'Pernink – pole za vsí', why: 'Horská obec, minimální záře', lat: 50.3600, lon: 12.7600 },
  ],

  'Jáchymov': [
    { name: 'Jáchymov – Klínovec (sedlo)', why: 'Krušné hory, Bortle 3–4, vysoká poloha', lat: 50.3900, lon: 12.9100 },
    { name: 'Boží Dar – louka u sjezdovky', why: 'Horská obec, tmavá obloha', lat: 50.4000, lon: 12.9200 },
    { name: 'Abertamy – pole na hřebeni', why: 'Krušnohorský hřeben, nízké osvětlení', lat: 50.3700, lon: 12.8100 },
    { name: 'Potůčky – louka u hranic', why: 'Hraniční oblast, minimální záře', lat: 50.4200, lon: 12.7700 },
    { name: 'Horní Blatná – pole za obcí', why: 'Krušnohoří, Bortle 3', lat: 50.3900, lon: 12.7700 },
  ],

  'Loket': [
    { name: 'Loket – pole severně u Ohře', why: 'Říční meandry, Bortle 4, otevřený S', lat: 50.2000, lon: 12.7500 },
    { name: 'Horní Slavkov – louky (okolí)', why: 'Slavkovský les, nízké osvětlení', lat: 50.1400, lon: 12.8100 },
    { name: 'Nové Sedlo – pole za obcí', why: 'Otevřená krajina, volný S', lat: 50.2100, lon: 12.7300 },
    { name: 'Staré Sedlo – louka nad vsí', why: 'Klidná oblast, les stíní záři', lat: 50.1900, lon: 12.7700 },
    { name: 'Rovná – pole u lesa', why: 'Slavkovský les, Bortle 4', lat: 50.1600, lon: 12.7900 },
  ],

  'Kraslice': [
    { name: 'Kraslice – pole SZ od města', why: 'Krušnohoří, Bortle 4, volný S', lat: 50.3400, lon: 12.5200 },
    { name: 'Stříbrná – louka za vsí', why: 'Podhorská obec, tmavá obloha', lat: 50.3200, lon: 12.4700 },
    { name: 'Bublava – pole u sjezdovky', why: 'Horská obec, nízké osvětlení', lat: 50.3600, lon: 12.5000 },
    { name: 'Rotava – louka u řeky', why: 'Říční krajina, les stíní záři', lat: 50.2900, lon: 12.5700 },
    { name: 'Přebuz – pole nad obcí', why: 'Krušné hory, Bortle 3, minimální záře', lat: 50.3700, lon: 12.6200 },
  ],

  'Horní Slavkov': [
    { name: 'Horní Slavkov – Slavkovský les (louka)', why: 'CHKO, Bortle 3–4, tmavá obloha', lat: 50.1400, lon: 12.8100 },
    { name: 'Krásno – pole u lesa', why: 'Cínový les, nízké osvětlení', lat: 50.1200, lon: 12.7800 },
    { name: 'Ležnička – louka za vsí', why: 'Klidná oblast, volný S', lat: 50.1500, lon: 12.8300 },
    { name: 'Bečov n. Teplou – pole nad městem', why: 'Historické město, les stíní záři', lat: 50.0800, lon: 12.8400 },
    { name: 'Nová Role – louka u lesa', why: 'Slavkovský les, Bortle 4', lat: 50.1800, lon: 12.7800 },
  ],

  // === Vysočina ===

  'Ledeč nad Sázavou': [
    { name: 'Ledeč n. S. – pole severně', why: 'Údolí Sázavy, Bortle 4, otevřený S', lat: 49.7100, lon: 15.2800 },
    { name: 'Kožlí – louka za vsí', why: 'Klidná oblast, nízké osvětlení', lat: 49.6900, lon: 15.2600 },
    { name: 'Dolní Město – pole u lesa', why: 'Les stíní záři, Bortle 4', lat: 49.7200, lon: 15.3000 },
    { name: 'Borovnice – louka nad vsí', why: 'Podhorská krajina, volný S', lat: 49.7000, lon: 15.2500 },
    { name: 'Číhošť – pole za obcí', why: 'Zemědělská krajina, tmavá obloha', lat: 49.7300, lon: 15.2700 },
  ],

  'Světlá n. Sázavou': [
    { name: 'Světlá – pole severně u Sázavy', why: 'Říční krajina, otevřený S, Bortle 4', lat: 49.6800, lon: 15.4100 },
    { name: 'Kochánov – louka za vsí', why: 'Klidná oblast, nízké osvětlení', lat: 49.6700, lon: 15.3900 },
    { name: 'Dolní Březinka – pole', why: 'Zemědělská krajina, les stíní záři', lat: 49.6900, lon: 15.4300 },
    { name: 'Trpišovice – louka nad vsí', why: 'Podhorská krajina, Bortle 4', lat: 49.6600, lon: 15.4000 },
    { name: 'Lipnička – pole u lesa', why: 'Otevřená krajina, volný S', lat: 49.6500, lon: 15.3800 },
  ],

  'Lipnice nad Sázavou': [
    { name: 'Lipnice – hrad (okolí)', why: 'Vyvýšený bod, Bortle 3–4, panorama na S', lat: 49.6200, lon: 15.4200 },
    { name: 'Dolní Město – pole za vsí', why: 'Klidná oblast, tmavá obloha', lat: 49.6300, lon: 15.4000 },
    { name: 'Kouty – louka nad vsí', why: 'Otevřená krajina, nízké osvětlení', lat: 49.6100, lon: 15.4400 },
    { name: 'Kejžlice – pole u potoka', why: 'Podhorská krajina, volný S', lat: 49.6400, lon: 15.3800 },
    { name: 'Hradec – louka u lesa', why: 'Les stíní záři, Bortle 4', lat: 49.6000, lon: 15.4100 },
  ],

  'Telč': [
    { name: 'Telč – Roštejn (okolí hradu, S)', why: 'UNESCO město, Bortle 4, les stíní záři', lat: 49.2000, lon: 15.4500 },
    { name: 'Mysliboř – louka u rybníka', why: 'Rybniční krajina, nízké osvětlení', lat: 49.1900, lon: 15.4700 },
    { name: 'Mrákotín – pole za vsí', why: 'Klidná oblast, volný S', lat: 49.2100, lon: 15.4300 },
    { name: 'Radkov – louka nad obcí', why: 'Zemědělská krajina, Bortle 4', lat: 49.1800, lon: 15.4800 },
    { name: 'Krahulčí – pole u lesa', why: 'Podhorská krajina, tmavá obloha', lat: 49.1700, lon: 15.4600 },
  ],

  'Polná': [
    { name: 'Polná – pole severně', why: 'Otevřená krajina, Bortle 4, volný S', lat: 49.5000, lon: 15.7200 },
    { name: 'Dobronín – louka za vsí', why: 'Klidná oblast, nízké osvětlení', lat: 49.4800, lon: 15.7400 },
    { name: 'Štoky – pole u lesa', why: 'Les stíní záři, Bortle 4', lat: 49.5100, lon: 15.7000 },
    { name: 'Přibyslav – louka nad městem', why: 'Podhorská krajina, volný S', lat: 49.4700, lon: 15.7500 },
    { name: 'Nížkov – pole za obcí', why: 'Zemědělská krajina, tmavá obloha', lat: 49.5200, lon: 15.7100 },
  ],

  'Čeřínek': [
    { name: 'Čeřínek – rozhledna (vrchol)', why: 'Vysočina, Bortle 3–4, 761 m, panorama na S', lat: 49.3800, lon: 15.5200 },
    { name: 'Jihlávka – louka pod Čeřínkem', why: 'Klidná oblast, tmavá obloha', lat: 49.3700, lon: 15.5000 },
    { name: 'Červená Řečice – pole za městem', why: 'Podhorská krajina, nízké osvětlení', lat: 49.3900, lon: 15.4800 },
    { name: 'Cejle – louka nad vsí', why: 'Les stíní záři, Bortle 4', lat: 49.4000, lon: 15.5400 },
    { name: 'Batelov – pole u lesa', why: 'Otevřená krajina, volný S', lat: 49.3600, lon: 15.5100 },
  ],

  'Humpolec': [
    { name: 'Humpolec – Orlík (zřícenina u města)', why: 'Vyvýšený bod, Bortle 4, výhled na S', lat: 49.5500, lon: 15.3600 },
    { name: 'Lipnice – pole za obcí', why: 'Podhorská krajina, nízké osvětlení', lat: 49.5600, lon: 15.3400 },
    { name: 'Kletečná – louka u potoka', why: 'Klidná oblast, les stíní záři', lat: 49.5400, lon: 15.3800 },
    { name: 'Pavlov – pole nad vsí', why: 'Zemědělská krajina, volný S', lat: 49.5300, lon: 15.3500 },
    { name: 'Herálec – louka za vsí', why: 'Otevřená krajina, Bortle 4', lat: 49.5200, lon: 15.3700 },
  ],

  'Pacov': [
    { name: 'Pacov – pole severně', why: 'Otevřená krajina, Bortle 4, volný S', lat: 49.4800, lon: 15.0000 },
    { name: 'Salačova Lhota – louka za vsí', why: 'Klidná oblast, nízké osvětlení', lat: 49.4700, lon: 14.9800 },
    { name: 'Bratřice – pole u lesa', why: 'Les stíní záři, Bortle 4', lat: 49.4900, lon: 15.0200 },
    { name: 'Lukavec – louka nad městem', why: 'Podhorská krajina, volný S', lat: 49.5000, lon: 15.0100 },
    { name: 'Eš – pole za obcí', why: 'Zemědělská krajina, tmavá obloha', lat: 49.4600, lon: 14.9900 },
  ],

  'Křemešník': [
    { name: 'Křemešník – kaple (okolí)', why: 'Vysočina, Bortle 3–4, 765 m, výhled na S', lat: 49.4000, lon: 15.2700 },
    { name: 'Fryšava – louka pod Křemešníkem', why: 'Podhorská obec, tmavá obloha', lat: 49.3900, lon: 15.2500 },
    { name: 'Kamenice – pole za vsí', why: 'Otevřená krajina, nízké osvětlení', lat: 49.4100, lon: 15.2900 },
    { name: 'Žirov – louka nad vsí', why: 'Klidná oblast, volný S', lat: 49.3800, lon: 15.2600 },
    { name: 'Vyskytná – pole u lesa', why: 'Les stíní záři, Bortle 4', lat: 49.4200, lon: 15.2800 },
  ],

  'Moravské Budějovice': [
    { name: 'Moravské Budějovice – pole severně', why: 'Otevřená krajina, Bortle 4, volný S', lat: 49.0600, lon: 15.8100 },
    { name: 'Blížkovice – louka za vsí', why: 'Klidná oblast, nízké osvětlení', lat: 49.0500, lon: 15.7800 },
    { name: 'Jemnice – pole nad městem', why: 'Podhorská krajina, les stíní záři', lat: 49.0200, lon: 15.5700 },
    { name: 'Lesonice – louka u lesa', why: 'Zemědělská krajina, Bortle 4', lat: 49.0700, lon: 15.8300 },
    { name: 'Jaroměřice n. Rokytnou – pole', why: 'Otevřená krajina, volný S', lat: 49.1000, lon: 15.8900 },
  ],

  'Náměšť nad Oslavou': [
    { name: 'Náměšť n. O. – pole severně', why: 'Oslava, otevřený S, Bortle 4', lat: 49.2200, lon: 16.1600 },
    { name: 'Kralice n. Oslavou – louka', why: 'Historické místo, les stíní záři', lat: 49.2100, lon: 16.1300 },
    { name: 'Jinošov – pole nad vsí', why: 'Klidná oblast, nízké osvětlení', lat: 49.2300, lon: 16.1800 },
    { name: 'Studenec – louka u potoka', why: 'Zemědělská krajina, Bortle 4', lat: 49.2000, lon: 16.1400 },
    { name: 'Mohelno – pole za vsí', why: 'Hadcová step, tmavá obloha', lat: 49.1100, lon: 16.1900 },
  ],

  'Dalešická přehrada': [
    { name: 'Dalešice – přehrada (hráz)', why: 'Vodní plocha, Bortle 3, otevřený S obzor', lat: 49.1300, lon: 16.1100 },
    { name: 'Kramolín – louka u přehrady', why: 'Přehradní krajina, minimální záře', lat: 49.1400, lon: 16.0900 },
    { name: 'Hartvíkovice – pole nad vsí', why: 'Klidná oblast, les stíní záři', lat: 49.1200, lon: 16.1300 },
    { name: 'Koněšín – louka za vsí', why: 'Podhorská krajina, Bortle 3', lat: 49.1500, lon: 16.0700 },
    { name: 'Stropešín – pole u lesa', why: 'Otevřená krajina, tmavá obloha', lat: 49.1100, lon: 16.0800 },
  ],

  'Bystřice n. Pernšt.': [
    { name: 'Bystřice n. P. – pole severně', why: 'Vysočina, Bortle 4, otevřený S', lat: 49.5400, lon: 16.2600 },
    { name: 'Vír – louka u přehrady', why: 'Údolí Svratky, tmavá obloha', lat: 49.5600, lon: 16.3200 },
    { name: 'Dalečín – pole za vsí', why: 'Podhorská krajina, nízké osvětlení', lat: 49.5500, lon: 16.2400 },
    { name: 'Nedvědice – louka u hradu Pernštejn', why: 'Historická krajina, les stíní záři', lat: 49.4500, lon: 16.3400 },
    { name: 'Rozsochy – pole nad vsí', why: 'Klidná oblast, Bortle 4', lat: 49.5300, lon: 16.2800 },
  ],

  'Velké Meziříčí': [
    { name: 'Velké Meziříčí – pole severně', why: 'Otevřená krajina, volný S, Bortle 5', lat: 49.3700, lon: 16.0100 },
    { name: 'Lavičky – louka za vsí', why: 'Klidná oblast, nízké osvětlení', lat: 49.3600, lon: 15.9900 },
    { name: 'Oslavice – pole u Oslavy', why: 'Říční krajina, les stíní záři', lat: 49.3500, lon: 16.0300 },
    { name: 'Měřín – louka nad městem', why: 'Vysočina, Bortle 4', lat: 49.3900, lon: 15.9800 },
    { name: 'Uhřínov – pole za vsí', why: 'Zemědělská krajina, volný S', lat: 49.3800, lon: 16.0200 },
  ],

  'Nové Město na Moravě': [
    { name: 'Nové Město n. M. – Vysočina Aréna (okolí)', why: 'Bortle 4, otevřená krajina, volný S', lat: 49.5700, lon: 16.0700 },
    { name: 'Fryšava p. Žákovou horou – louka', why: 'Žďárské vrchy, tmavá obloha', lat: 49.6000, lon: 16.0500 },
    { name: 'Kadov – pole za vsí', why: 'Podhorská krajina, nízké osvětlení', lat: 49.5800, lon: 16.0900 },
    { name: 'Jimramov – louka u Svratky', why: 'Říční krajina, les stíní záři', lat: 49.6300, lon: 16.2300 },
    { name: 'Bobrová – pole nad vsí', why: 'Klidná oblast, Bortle 3–4', lat: 49.5200, lon: 16.0700 },
  ],
}
