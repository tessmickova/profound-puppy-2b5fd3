# Pravidla hodnocení viditelnosti polární záře pro ČR (50°N)

## Dva nezávislé systémy

Aplikace používá **dva oddělené** systémy hodnocení. Oba se zobrazují na dashboardu, ale mají odlišnou logiku.

---

## 1. Stupnice viditelnosti (`kpToVisibility`)

**Soubor:** `lib/noaa.ts` ř. 267  
**Komponenta:** `components/VisibilityScale.tsx`  
**Kde se zobrazuje:** Dashboard — sekce „Stupnice viditelnosti"

Hodnotí se **pouze podle Kp indexu**. Žádný jiný parametr (Bz, rychlost větru…) se nepoužívá.

| Úroveň | Kp práh | Label | Popis |
|---------|---------|-------|-------|
| `none` | < 2 | Neviditelná | Záře není viditelná ani kamerou |
| `photo` | ≥ 2 | Fotografická | Kamera záři zachytí – pouhé oko nevidí |
| `horizon` | ≥ 4 | Záře na obzoru | Slabá záře viditelná v temné krajině na severním obzoru |
| `arc` | ≥ 5 | Oblouk na obzoru | Jasný oblouk viditelný pouhým okem |
| `overhead` | ≥ 7 | Záře nad námi | Záře pokrývá velkou část oblohy ČR |
| `dancing` | ≥ 8 | Tančící záře! | Dramatická pohybující se záře – VZÁCNÉ |

### ⚠️ Problém

**Kp ≥ 2 jako „fotografická" je pro ČR (50°N) příliš nízký práh.** Kp 2 je běžná hodnota za klidných podmínek. Na 50° severní šířky je reálně potřeba minimálně Kp 4+ aby kamera na tmavém místě vůbec něco zachytila. Prahy by měly být:

| Doporučený práh pro 50°N | Úroveň |
|--------------------------|--------|
| Kp < 4 | Neviditelná |
| Kp ≥ 4 (+ Bz < -5) | Fotografická (za ideálních podmínek) |
| Kp ≥ 5 | Záře na obzoru |
| Kp ≥ 6 | Oblouk/jasná záře |
| Kp ≥ 7 | Záře nad hlavou |
| Kp ≥ 8+ | Tančící záře |

---

## 2. Pravděpodobnost záře v ČR (`deriveAuroraLikelihood`)

**Soubor:** `lib/space-weather/hero/deriveSpaceWeatherState.ts` ř. 73  
**Komponenta:** `components/space-weather/hero/LiveStatusPanel.tsx`  
**Kde se zobrazuje:** Hero panel — badge „🇨🇿 Záře v ČR"

Hodnotí se podle **3 parametrů**: Kp index, Bz složka magnetického pole, rychlost slunečního větru.

| Úroveň | Podmínka | Label |
|--------|----------|-------|
| `none` | Kp < 3 **A** Bz > -3 | Nepravděpodobná |
| `unlikely` | Kp ≥ 3 **NEBO** Bz < -3 | Malá šance |
| `possible` | Kp ≥ 4 **NEBO** (Bz < -5 **A** vítr > 500 km/s) | Možná |
| `likely` | Kp ≥ 5 **NEBO** (Kp ≥ 4 **A** Bz < -8) | Pravděpodobná |
| `very_likely` | Kp ≥ 7 **NEBO** (Kp ≥ 6 **A** Bz < -10) | Velmi pravděpodobná |

### ⚠️ Problém

- **`unlikely` (Malá šance) při Bz < -3:** Bz kolem -3 nT je poměrně běžná hodnota. Samotné Bz -3 bez zvýšeného Kp neznamená žádnou reálnou šanci na záři v ČR. 
- **`unlikely` při Kp ≥ 3:** Kp 3 je stále příliš nízké pro jakoukoli viditelnost na 50°N.
- Výsledek: systém zobrazuje „Malá šance" i za zcela klidných podmínek (Kp 0, Bz -3.5), což je zavádějící.

---

## 3. Stavový automat hero sekce (`deriveState`)

**Soubor:** `lib/space-weather/hero/deriveSpaceWeatherState.ts` ř. 83

Určuje hlavní stav hero vizualizace (Slunce → CME → Země):

| Stav | Podmínka |
|------|----------|
| `AURORA_LIKELY_CZ` | auroraLikelihood = `very_likely` |
| `AURORA_POSSIBLE_CZ` | auroraLikelihood = `likely` nebo `possible` |
| `MAGNETOSPHERE_ACTIVE` | Kp ≥ 5 nebo (Kp ≥ 4 a Bz < -5) |
| `L1_IMPACT_IMMINENT` | vítr > 450 km/s a Bz < -3 |
| `IN_TRANSIT` | CME arrival předpověď do 48h |
| `EARTH_DIRECTED_CME` | CME typu S nebo C detekováno |
| `SOLAR_EVENT_DETECTED` | Jakákoli nedávná erupce/CME |
| `QUIET` | Nic z výše uvedeného |

---

## 4. Použité datové zdroje

| Parametr | Zdroj | Aktualizace |
|----------|-------|-------------|
| **Kp index** | NOAA SWPC (`/products/noaa-planetary-k-index/`) | ~3h (official), realtime (estimated) |
| **Bz** (IMF severojižní složka) | NOAA SWPC solar wind realtime | ~1 min |
| **Rychlost slunečního větru** | NOAA SWPC solar wind realtime | ~1 min |
| **Hustota slunečního větru** | NOAA SWPC solar wind realtime | ~1 min |
| **CME data** | NASA DONKI API | denně |
| **CME arrivals** | NASA DONKI API | denně |
| **Erupce (flares)** | NASA DONKI API | denně |
| **Geomagnetické bouře** | NASA DONKI API | denně |

---

## 5. Co které hodnoty parametrů znamenají

### Kp index (0–9)
- **0–1:** Klid, žádná geomagnetická aktivita
- **2–3:** Nízká aktivita, záře viditelná jen za polárním kruhem
- **4:** G0 — na 50°N teoreticky fotografická šance za ideálních podmínek
- **5:** G1 (minor storm) — na 50°N první reálná šance na vizuální záři
- **6:** G2 (moderate) — záře viditelná na severním obzoru v ČR
- **7:** G3 (strong) — jasná záře, potenciálně i nad hlavou
- **8:** G4 (severe) — výrazná záře po celé obloze
- **9:** G5 (extreme) — extrémně vzácné, záře viditelná i ve středních šířkách

### Bz (nT — nanotesla)
- **> 0:** Severní orientace IMF — „štít" magnetosféry drží, záři ztěžuje
- **0 až -3:** Normální/slabě jižní — běžný stav
- **-3 až -5:** Mírně jižní — začíná propouštění částic
- **-5 až -10:** Silně jižní — výrazně zvyšuje šanci na záři
- **< -10:** Extrémně jižní — klíčové pro bouři na středních šířkách
- **Důležité:** Bz -1 je zcela běžná hodnota a NEMÁ být považována za signál záře

### Rychlost slunečního větru (km/s)
- **300–400:** Normální klidný vítr
- **400–500:** Mírně zvýšený
- **500–700:** Vysokorychlostní proud (CIR/CH HSS)
- **> 700:** Velmi rychlý — typicky CME-driven bouře
- **> 1000:** Extrémní — pouze při silných CME

---

## 6. Doporučené opravy prahů

### `kpToVisibility` — zvýšit prahy pro ČR:
```typescript
export function kpToVisibility(kp: number): VisibilityLevel {
  if (kp >= 8)   return 'dancing'
  if (kp >= 7)   return 'overhead'
  if (kp >= 6)   return 'arc'
  if (kp >= 5)   return 'horizon'
  if (kp >= 4)   return 'photo'    // bylo: kp >= 2
  return 'none'
}
```

### `deriveAuroraLikelihood` — zpřísnit podmínky:
```typescript
function deriveAuroraLikelihood(kp, bz, swSpeed): AuroraLikelihood {
  if (kp >= 7 || (kp >= 6 && (bz ?? 0) < -10)) return 'very_likely'
  if (kp >= 5 || (kp >= 4 && (bz ?? 0) < -8))  return 'likely'
  if (kp >= 4 || (kp >= 3 && (bz ?? 0) < -8 && (swSpeed ?? 0) > 500)) return 'possible'
  if (kp >= 3 && (bz ?? 0) < -5) return 'unlikely'  // bylo: kp >= 3 NEBO bz < -3
  return 'none'
}
```

Klíčové změny:
- `photo` až od Kp ≥ 4 (místo 2)
- `unlikely` vyžaduje Kp ≥ 3 **A** Bz < -5 (místo OR Bz < -3)
- `possible` vyžaduje silnější kombinaci než dosud
