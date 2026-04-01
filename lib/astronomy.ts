// lib/astronomy.ts
// Pure astronomical calculations for moon phase, sun position, and sky brightness
// for Czech Republic observing conditions. No external API needed.

const DEG = Math.PI / 180
const RAD = 180 / Math.PI

// ── MOON PHASE ──────────────────────────────────────────────────────────────

/** Moon illumination 0..1 and phase name */
export interface MoonInfo {
  /** 0 = new moon, 1 = full moon */
  illumination: number
  /** Phase angle in days (0..29.53) */
  age: number
  phase: 'Novoluní' | 'Dorůstající srpek' | 'První čtvrť' | 'Dorůstající měsíc' | 'Úplněk' | 'Couvající měsíc' | 'Poslední čtvrť' | 'Couvající srpek'
  icon: string
  /** How much the moon interferes with aurora observation: 0 (none) .. 1 (severe) */
  interference: number
}

export function getMoonInfo(date: Date = new Date()): MoonInfo {
  // Simplified moon phase using known new moon reference: Jan 6, 2000 18:14 UTC
  const refNew = new Date('2000-01-06T18:14:00Z').getTime()
  const synodicMonth = 29.53058770576
  const daysSinceRef = (date.getTime() - refNew) / 86400000
  const age = ((daysSinceRef % synodicMonth) + synodicMonth) % synodicMonth

  // Illumination from phase angle
  const phaseAngle = (age / synodicMonth) * 2 * Math.PI
  const illumination = (1 - Math.cos(phaseAngle)) / 2

  let phase: MoonInfo['phase']
  let icon: string
  if (age < 1.85) { phase = 'Novoluní'; icon = '🌑' }
  else if (age < 7.38) { phase = 'Dorůstající srpek'; icon = '🌒' }
  else if (age < 9.23) { phase = 'První čtvrť'; icon = '🌓' }
  else if (age < 14.77) { phase = 'Dorůstající měsíc'; icon = '🌔' }
  else if (age < 16.61) { phase = 'Úplněk'; icon = '🌕' }
  else if (age < 22.15) { phase = 'Couvající měsíc'; icon = '🌖' }
  else if (age < 23.99) { phase = 'Poslední čtvrť'; icon = '🌗' }
  else if (age < 27.68) { phase = 'Couvající srpek'; icon = '🌘' }
  else { phase = 'Novoluní'; icon = '🌑' }

  // Moon interference: bright moon near aurora direction is bad
  // Full moon = max interference, new moon = none
  const interference = Math.min(illumination * 1.2, 1)

  return { illumination, age, phase, icon, interference }
}

// ── SUN POSITION ────────────────────────────────────────────────────────────

export interface SunPosition {
  /** Solar altitude in degrees (negative = below horizon) */
  altitude: number
  /** Solar azimuth in degrees (0=N, 90=E, 180=S, 270=W) */
  azimuth: number
  /** Current sky condition */
  skyState: 'Den' | 'Občanský soumrak' | 'Námořnický soumrak' | 'Astronomický soumrak' | 'Noc'
  skyIcon: string
  /** How dark is it: 0 (full daylight, worst) .. 1 (deep night, best for aurora) */
  darkness: number
}

/** Calculate sun position for given lat/lon at given time */
export function getSunPosition(date: Date, lat: number, lon: number): SunPosition {
  const jd = toJulianDate(date)
  const T = (jd - 2451545.0) / 36525.0

  // Solar coordinates
  const L0 = (280.46646 + T * (36000.76983 + T * 0.0003032)) % 360
  const M = (357.52911 + T * (35999.05029 - T * 0.0001537)) % 360
  const Mrad = M * DEG
  const C = (1.914602 - T * (0.004817 + T * 0.000014)) * Math.sin(Mrad)
    + (0.019993 - T * 0.000101) * Math.sin(2 * Mrad)
    + 0.000289 * Math.sin(3 * Mrad)
  const sunLon = (L0 + C) % 360
  const omega = 125.04 - 1934.136 * T
  const lambda = sunLon - 0.00569 - 0.00478 * Math.sin(omega * DEG)

  // Obliquity
  const eps0 = 23.439291 - T * 0.013004
  const eps = eps0 + 0.00256 * Math.cos(omega * DEG)

  // Declination
  const sinDec = Math.sin(eps * DEG) * Math.sin(lambda * DEG)
  const dec = Math.asin(sinDec)

  // Right ascension
  const ra = Math.atan2(
    Math.cos(eps * DEG) * Math.sin(lambda * DEG),
    Math.cos(lambda * DEG)
  )

  // Hour angle
  const gmst = (280.46061837 + 360.98564736629 * (jd - 2451545.0)) % 360
  const lmst = ((gmst + lon) % 360 + 360) % 360
  const ha = (lmst - ra * RAD + 360) % 360

  // Altitude & azimuth
  const latRad = lat * DEG
  const haRad = ha * DEG
  const sinAlt = Math.sin(latRad) * Math.sin(dec) + Math.cos(latRad) * Math.cos(dec) * Math.cos(haRad)
  const altitude = Math.asin(sinAlt) * RAD

  const cosAz = (Math.sin(dec) - Math.sin(latRad) * sinAlt) / (Math.cos(latRad) * Math.cos(Math.asin(sinAlt)))
  let azimuth = Math.acos(Math.max(-1, Math.min(1, cosAz))) * RAD
  if (Math.sin(haRad) > 0) azimuth = 360 - azimuth

  // Sky state
  let skyState: SunPosition['skyState']
  let skyIcon: string
  let darkness: number
  if (altitude > 0) {
    skyState = 'Den'; skyIcon = '☀️'; darkness = 0
  } else if (altitude > -6) {
    skyState = 'Občanský soumrak'; skyIcon = '🌅'; darkness = 0.2
  } else if (altitude > -12) {
    skyState = 'Námořnický soumrak'; skyIcon = '🌆'; darkness = 0.5
  } else if (altitude > -18) {
    skyState = 'Astronomický soumrak'; skyIcon = '🌌'; darkness = 0.8
  } else {
    skyState = 'Noc'; skyIcon = '🌃'; darkness = 1.0
  }

  return { altitude, azimuth, skyState, skyIcon, darkness }
}

function toJulianDate(date: Date): number {
  return date.getTime() / 86400000 + 2440587.5
}

// ── SUNRISE / SUNSET ────────────────────────────────────────────────────────

export interface SunTimes {
  sunrise: Date | null
  sunset: Date | null
  civilDusk: Date | null
  nauticalDusk: Date | null
  astronomicalDusk: Date | null
  civilDawn: Date | null
  nauticalDawn: Date | null
  astronomicalDawn: Date | null
}

export function getSunTimes(date: Date, lat: number, lon: number): SunTimes {
  const day = new Date(date.getFullYear(), date.getMonth(), date.getDate())

  return {
    sunrise: findSunEvent(day, lat, lon, -0.833, true),
    sunset: findSunEvent(day, lat, lon, -0.833, false),
    civilDawn: findSunEvent(day, lat, lon, -6, true),
    civilDusk: findSunEvent(day, lat, lon, -6, false),
    nauticalDawn: findSunEvent(day, lat, lon, -12, true),
    nauticalDusk: findSunEvent(day, lat, lon, -12, false),
    astronomicalDawn: findSunEvent(day, lat, lon, -18, true),
    astronomicalDusk: findSunEvent(day, lat, lon, -18, false),
  }
}

function findSunEvent(day: Date, lat: number, lon: number, angle: number, isRising: boolean): Date | null {
  // Binary search for the time when sun crosses given altitude
  const start = new Date(day)
  start.setHours(isRising ? 0 : 12, 0, 0, 0)
  const end = new Date(day)
  end.setHours(isRising ? 12 : 23, 59, 59, 999)

  let lo = start.getTime()
  let hi = end.getTime()

  const altAtLo = getSunPosition(new Date(lo), lat, lon).altitude
  const altAtHi = getSunPosition(new Date(hi), lat, lon).altitude

  // Check if crossing exists
  if (isRising) {
    if (altAtLo > angle && altAtHi > angle) return null
    if (altAtLo < angle && altAtHi < angle) return null
  } else {
    if (altAtLo < angle && altAtHi < angle) return null
    if (altAtLo > angle && altAtHi > angle) return null
  }

  for (let i = 0; i < 30; i++) {
    const mid = (lo + hi) / 2
    const alt = getSunPosition(new Date(mid), lat, lon).altitude
    if ((isRising && alt < angle) || (!isRising && alt > angle)) {
      lo = mid
    } else {
      hi = mid
    }
  }

  return new Date((lo + hi) / 2)
}

// ── CZ LOCATIONS & LIGHT POLLUTION ─────────────────────────────────────────

export interface CzLocation {
  name: string
  lat: number
  lon: number
  /** Bortle scale 1-9 */
  bortle: number
  region: string
  /** Okres (district) – used for second-level filtering */
  district: string
  /** Light pollution description */
  lightPollution: 'Velmi nízké' | 'Nízké' | 'Střední' | 'Vysoké' | 'Velmi vysoké'
  /** Is this a city? */
  isCity: boolean
  /** Typical northern horizon obstruction 0..1 */
  northHorizonBlock: number
}

/** District → Region mapping for UI */
export const DISTRICTS_BY_REGION: Record<string, string[]> = {
  'Středočeský': ['Benešov', 'Beroun', 'Kladno', 'Kolín', 'Kutná Hora', 'Mělník', 'Mladá Boleslav', 'Nymburk', 'Praha', 'Příbram', 'Rakovník'],
  'Jihomoravský': ['Blansko', 'Brno-město', 'Brno-venkov', 'Břeclav', 'Hodonín', 'Vyškov', 'Znojmo'],
  'Moravskoslezský': ['Bruntál', 'Frýdek-Místek', 'Karviná', 'Nový Jičín', 'Opava', 'Ostrava-město'],
  'Plzeňský': ['Domažlice', 'Klatovy', 'Plzeň-město', 'Plzeň-jih', 'Plzeň-sever', 'Rokycany', 'Tachov'],
  'Liberecký': ['Česká Lípa', 'Jablonec nad Nisou', 'Liberec', 'Semily'],
  'Olomoucký': ['Jeseník', 'Olomouc', 'Prostějov', 'Přerov', 'Šumperk'],
  'Královéhradecký': ['Hradec Králové', 'Jičín', 'Náchod', 'Rychnov nad Kněžnou', 'Trutnov'],
  'Pardubický': ['Chrudim', 'Pardubice', 'Svitavy', 'Ústí nad Orlicí'],
  'Jihočeský': ['České Budějovice', 'Český Krumlov', 'Jindřichův Hradec', 'Písek', 'Prachatice', 'Strakonice', 'Tábor'],
  'Zlínský': ['Kroměříž', 'Uherské Hradiště', 'Vsetín', 'Zlín'],
  'Ústecký': ['Chomutov', 'Děčín', 'Litoměřice', 'Louny', 'Most', 'Teplice', 'Ústí nad Labem'],
  'Karlovarský': ['Cheb', 'Karlovy Vary', 'Sokolov'],
  'Vysočina': ['Havlíčkův Brod', 'Jihlava', 'Pelhřimov', 'Třebíč', 'Žďár nad Sázavou'],
}

/** Curated list of CZ observing locations with light pollution data */
export const CZ_LOCATIONS: CzLocation[] = [

  // ══════════════════════════════════════════════════════════════════════════
  // STŘEDOČESKÝ
  // ══════════════════════════════════════════════════════════════════════════

  // ── okres Benešov ──
  { name: 'Benešov', lat: 49.7818, lon: 14.6869, bortle: 5, region: 'Středočeský', district: 'Benešov', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.3 },
  { name: 'Vlašim', lat: 49.7064, lon: 15.0067, bortle: 5, region: 'Středočeský', district: 'Benešov', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.3 },
  { name: 'Votice', lat: 49.6411, lon: 14.6381, bortle: 4, region: 'Středočeský', district: 'Benešov', lightPollution: 'Nízké', isCity: true, northHorizonBlock: 0.25 },
  { name: 'Sázava', lat: 49.8722, lon: 14.9000, bortle: 4, region: 'Středočeský', district: 'Benešov', lightPollution: 'Nízké', isCity: false, northHorizonBlock: 0.2 },

  // ── okres Beroun ──
  { name: 'Beroun', lat: 49.9639, lon: 14.0722, bortle: 6, region: 'Středočeský', district: 'Beroun', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.4 },
  { name: 'Hořovice', lat: 49.8361, lon: 13.9025, bortle: 5, region: 'Středočeský', district: 'Beroun', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.3 },
  { name: 'Králův Dvůr', lat: 49.9472, lon: 14.0353, bortle: 5, region: 'Středočeský', district: 'Beroun', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.35 },
  { name: 'Karlštejn', lat: 49.9389, lon: 14.1881, bortle: 5, region: 'Středočeský', district: 'Beroun', lightPollution: 'Střední', isCity: false, northHorizonBlock: 0.3 },

  // ── okres Kladno ──
  { name: 'Kladno', lat: 50.1472, lon: 14.1053, bortle: 7, region: 'Středočeský', district: 'Kladno', lightPollution: 'Vysoké', isCity: true, northHorizonBlock: 0.4 },
  { name: 'Slaný', lat: 50.2306, lon: 14.0872, bortle: 5, region: 'Středočeský', district: 'Kladno', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.3 },
  { name: 'Unhošť', lat: 50.0919, lon: 14.1317, bortle: 5, region: 'Středočeský', district: 'Kladno', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.3 },
  { name: 'Lidice', lat: 50.1433, lon: 14.1922, bortle: 5, region: 'Středočeský', district: 'Kladno', lightPollution: 'Střední', isCity: false, northHorizonBlock: 0.25 },

  // ── okres Kolín ──
  { name: 'Kolín', lat: 50.0282, lon: 15.1997, bortle: 6, region: 'Středočeský', district: 'Kolín', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.3 },
  { name: 'Český Brod', lat: 50.0742, lon: 14.8603, bortle: 5, region: 'Středočeský', district: 'Kolín', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.3 },
  { name: 'Pečky', lat: 50.0906, lon: 15.0358, bortle: 5, region: 'Středočeský', district: 'Kolín', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.25 },
  { name: 'Zásmuky', lat: 49.9933, lon: 14.9903, bortle: 4, region: 'Středočeský', district: 'Kolín', lightPollution: 'Nízké', isCity: false, northHorizonBlock: 0.2 },

  // ── okres Kutná Hora ──
  { name: 'Kutná Hora', lat: 49.9481, lon: 15.2681, bortle: 5, region: 'Středočeský', district: 'Kutná Hora', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.3 },
  { name: 'Čáslav', lat: 49.9106, lon: 15.3906, bortle: 5, region: 'Středočeský', district: 'Kutná Hora', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.25 },
  { name: 'Uhlířské Janovice', lat: 49.8847, lon: 15.0642, bortle: 4, region: 'Středočeský', district: 'Kutná Hora', lightPollution: 'Nízké', isCity: true, northHorizonBlock: 0.2 },
  { name: 'Zruč nad Sázavou', lat: 49.7367, lon: 15.1053, bortle: 4, region: 'Středočeský', district: 'Kutná Hora', lightPollution: 'Nízké', isCity: true, northHorizonBlock: 0.2 },

  // ── okres Mělník ──
  { name: 'Mělník', lat: 50.3506, lon: 14.4744, bortle: 6, region: 'Středočeský', district: 'Mělník', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.3 },
  { name: 'Neratovice', lat: 50.2592, lon: 14.5175, bortle: 6, region: 'Středočeský', district: 'Mělník', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.3 },
  { name: 'Mšeno', lat: 50.4328, lon: 14.6292, bortle: 4, region: 'Středočeský', district: 'Mělník', lightPollution: 'Nízké', isCity: true, northHorizonBlock: 0.2 },
  { name: 'Kokořínsko', lat: 50.4410, lon: 14.5700, bortle: 4, region: 'Středočeský', district: 'Mělník', lightPollution: 'Nízké', isCity: false, northHorizonBlock: 0.15 },

  // ── okres Mladá Boleslav ──
  { name: 'Mladá Boleslav', lat: 50.4112, lon: 14.9061, bortle: 6, region: 'Středočeský', district: 'Mladá Boleslav', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.3 },
  { name: 'Mnichovo Hradiště', lat: 50.5267, lon: 15.0078, bortle: 5, region: 'Středočeský', district: 'Mladá Boleslav', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.3 },
  { name: 'Bělá pod Bezdězem', lat: 50.5008, lon: 14.8064, bortle: 4, region: 'Středočeský', district: 'Mladá Boleslav', lightPollution: 'Nízké', isCity: true, northHorizonBlock: 0.2 },
  { name: 'Bezděz', lat: 50.5370, lon: 14.7220, bortle: 4, region: 'Středočeský', district: 'Mladá Boleslav', lightPollution: 'Nízké', isCity: false, northHorizonBlock: 0.15 },

  // ── okres Nymburk ──
  { name: 'Nymburk', lat: 50.1861, lon: 15.0414, bortle: 5, region: 'Středočeský', district: 'Nymburk', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.2 },
  { name: 'Poděbrady', lat: 50.1425, lon: 15.1189, bortle: 5, region: 'Středočeský', district: 'Nymburk', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.2 },
  { name: 'Lysá nad Labem', lat: 50.2014, lon: 14.8361, bortle: 5, region: 'Středočeský', district: 'Nymburk', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.25 },
  { name: 'Sadská', lat: 50.2042, lon: 14.9931, bortle: 4, region: 'Středočeský', district: 'Nymburk', lightPollution: 'Nízké', isCity: false, northHorizonBlock: 0.15 },

  // ── okres Praha (v rámci Střč. kraje) ──
  { name: 'Praha', lat: 50.0755, lon: 14.4378, bortle: 8, region: 'Středočeský', district: 'Praha', lightPollution: 'Velmi vysoké', isCity: true, northHorizonBlock: 0.6 },
  { name: 'Říčany', lat: 49.9919, lon: 14.6542, bortle: 6, region: 'Středočeský', district: 'Praha', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.3 },
  { name: 'Brandýs n. L.', lat: 50.1856, lon: 14.6619, bortle: 6, region: 'Středočeský', district: 'Praha', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.3 },
  { name: 'Černošice', lat: 49.9611, lon: 14.3208, bortle: 6, region: 'Středočeský', district: 'Praha', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.35 },

  // ── okres Příbram ──
  { name: 'Příbram', lat: 49.6895, lon: 14.0113, bortle: 5, region: 'Středočeský', district: 'Příbram', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.3 },
  { name: 'Dobříš', lat: 49.7808, lon: 14.1678, bortle: 5, region: 'Středočeský', district: 'Příbram', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.3 },
  { name: 'Sedlčany', lat: 49.6600, lon: 14.4269, bortle: 4, region: 'Středočeský', district: 'Příbram', lightPollution: 'Nízké', isCity: true, northHorizonBlock: 0.25 },
  { name: 'Brdy – Kolvín', lat: 49.7400, lon: 13.9300, bortle: 3, region: 'Středočeský', district: 'Příbram', lightPollution: 'Velmi nízké', isCity: false, northHorizonBlock: 0.1 },

  // ── okres Rakovník ──
  { name: 'Rakovník', lat: 50.1067, lon: 13.7333, bortle: 5, region: 'Středočeský', district: 'Rakovník', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.3 },
  { name: 'Jesenice', lat: 50.0167, lon: 13.6167, bortle: 4, region: 'Středočeský', district: 'Rakovník', lightPollution: 'Nízké', isCity: true, northHorizonBlock: 0.2 },
  { name: 'Křivoklátsko', lat: 50.0000, lon: 13.8700, bortle: 3, region: 'Středočeský', district: 'Rakovník', lightPollution: 'Velmi nízké', isCity: false, northHorizonBlock: 0.15 },

  // ══════════════════════════════════════════════════════════════════════════
  // JIHOMORAVSKÝ
  // ══════════════════════════════════════════════════════════════════════════

  // ── okres Blansko ──
  { name: 'Blansko', lat: 49.3631, lon: 16.6447, bortle: 5, region: 'Jihomoravský', district: 'Blansko', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.3 },
  { name: 'Boskovice', lat: 49.4878, lon: 16.6603, bortle: 5, region: 'Jihomoravský', district: 'Blansko', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.3 },
  { name: 'Jedovnice', lat: 49.3450, lon: 16.7500, bortle: 4, region: 'Jihomoravský', district: 'Blansko', lightPollution: 'Nízké', isCity: false, northHorizonBlock: 0.2 },
  { name: 'Sloup v Mor. krasu', lat: 49.4139, lon: 16.7417, bortle: 4, region: 'Jihomoravský', district: 'Blansko', lightPollution: 'Nízké', isCity: false, northHorizonBlock: 0.2 },

  // ── okres Brno-město ──
  { name: 'Brno', lat: 49.1951, lon: 16.6068, bortle: 7, region: 'Jihomoravský', district: 'Brno-město', lightPollution: 'Vysoké', isCity: true, northHorizonBlock: 0.5 },

  // ── okres Brno-venkov ──
  { name: 'Tišnov', lat: 49.3500, lon: 16.4242, bortle: 5, region: 'Jihomoravský', district: 'Brno-venkov', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.3 },
  { name: 'Ivančice', lat: 49.1014, lon: 16.3772, bortle: 5, region: 'Jihomoravský', district: 'Brno-venkov', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.3 },
  { name: 'Rosice', lat: 49.1833, lon: 16.3833, bortle: 5, region: 'Jihomoravský', district: 'Brno-venkov', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.3 },
  { name: 'Kuřim', lat: 49.2986, lon: 16.5314, bortle: 5, region: 'Jihomoravský', district: 'Brno-venkov', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.3 },

  // ── okres Břeclav ──
  { name: 'Břeclav', lat: 48.7586, lon: 16.8822, bortle: 5, region: 'Jihomoravský', district: 'Břeclav', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.2 },
  { name: 'Mikulov', lat: 48.8056, lon: 16.6378, bortle: 5, region: 'Jihomoravský', district: 'Břeclav', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.2 },
  { name: 'Hustopeče', lat: 48.9408, lon: 16.7361, bortle: 5, region: 'Jihomoravský', district: 'Břeclav', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.25 },
  { name: 'Pálava', lat: 48.8550, lon: 16.6400, bortle: 4, region: 'Jihomoravský', district: 'Břeclav', lightPollution: 'Nízké', isCity: false, northHorizonBlock: 0.15 },
  { name: 'Soutok (Lanžhot)', lat: 48.6333, lon: 16.9500, bortle: 4, region: 'Jihomoravský', district: 'Břeclav', lightPollution: 'Nízké', isCity: false, northHorizonBlock: 0.1 },

  // ── okres Hodonín ──
  { name: 'Hodonín', lat: 48.8490, lon: 17.1322, bortle: 5, region: 'Jihomoravský', district: 'Hodonín', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.2 },
  { name: 'Kyjov', lat: 49.0103, lon: 17.1225, bortle: 5, region: 'Jihomoravský', district: 'Hodonín', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.25 },
  { name: 'Veselí nad Moravou', lat: 48.9536, lon: 17.3764, bortle: 5, region: 'Jihomoravský', district: 'Hodonín', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.2 },
  { name: 'Mutěnice', lat: 48.9044, lon: 17.0250, bortle: 4, region: 'Jihomoravský', district: 'Hodonín', lightPollution: 'Nízké', isCity: false, northHorizonBlock: 0.15 },

  // ── okres Vyškov ──
  { name: 'Vyškov', lat: 49.2775, lon: 16.9989, bortle: 5, region: 'Jihomoravský', district: 'Vyškov', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.3 },
  { name: 'Slavkov u Brna', lat: 49.1525, lon: 16.8772, bortle: 5, region: 'Jihomoravský', district: 'Vyškov', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.3 },
  { name: 'Bučovice', lat: 49.1481, lon: 17.0019, bortle: 5, region: 'Jihomoravský', district: 'Vyškov', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.25 },
  { name: 'Drahanská vrchovina', lat: 49.3500, lon: 16.8500, bortle: 3, region: 'Jihomoravský', district: 'Vyškov', lightPollution: 'Velmi nízké', isCity: false, northHorizonBlock: 0.1 },

  // ── okres Znojmo ──
  { name: 'Znojmo', lat: 48.8555, lon: 16.0488, bortle: 5, region: 'Jihomoravský', district: 'Znojmo', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.3 },
  { name: 'Moravský Krumlov', lat: 49.0500, lon: 16.3114, bortle: 5, region: 'Jihomoravský', district: 'Znojmo', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.25 },
  { name: 'Vranov nad Dyjí', lat: 48.8897, lon: 15.8167, bortle: 4, region: 'Jihomoravský', district: 'Znojmo', lightPollution: 'Nízké', isCity: true, northHorizonBlock: 0.2 },
  { name: 'Podyjí', lat: 48.8500, lon: 15.9667, bortle: 4, region: 'Jihomoravský', district: 'Znojmo', lightPollution: 'Nízké', isCity: false, northHorizonBlock: 0.15 },

  // ══════════════════════════════════════════════════════════════════════════
  // MORAVSKOSLEZSKÝ
  // ══════════════════════════════════════════════════════════════════════════

  // ── okres Bruntál ──
  { name: 'Bruntál', lat: 49.9886, lon: 17.4653, bortle: 5, region: 'Moravskoslezský', district: 'Bruntál', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.3 },
  { name: 'Krnov', lat: 50.0897, lon: 17.7036, bortle: 5, region: 'Moravskoslezský', district: 'Bruntál', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.3 },
  { name: 'Rýmařov', lat: 49.9322, lon: 17.2717, bortle: 4, region: 'Moravskoslezský', district: 'Bruntál', lightPollution: 'Nízké', isCity: true, northHorizonBlock: 0.3 },
  { name: 'Praděd (sever)', lat: 50.0900, lon: 17.2300, bortle: 3, region: 'Moravskoslezský', district: 'Bruntál', lightPollution: 'Nízké', isCity: false, northHorizonBlock: 0.15 },

  // ── okres Frýdek-Místek ──
  { name: 'Frýdek-Místek', lat: 49.6850, lon: 18.3500, bortle: 6, region: 'Moravskoslezský', district: 'Frýdek-Místek', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.5 },
  { name: 'Palkovice', lat: 49.6333, lon: 18.3167, bortle: 4, region: 'Moravskoslezský', district: 'Frýdek-Místek', lightPollution: 'Nízké', isCity: false, northHorizonBlock: 0.2 },
  { name: 'Frýdlant nad Ostravicí', lat: 49.5881, lon: 18.3597, bortle: 5, region: 'Moravskoslezský', district: 'Frýdek-Místek', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.4 },
  { name: 'Třinec', lat: 49.6775, lon: 18.6717, bortle: 6, region: 'Moravskoslezský', district: 'Frýdek-Místek', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.5 },
  { name: 'Jablunkov', lat: 49.5728, lon: 18.7647, bortle: 5, region: 'Moravskoslezský', district: 'Frýdek-Místek', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.4 },
  { name: 'Beskydy – Lysá hora', lat: 49.5464, lon: 18.4478, bortle: 4, region: 'Moravskoslezský', district: 'Frýdek-Místek', lightPollution: 'Nízké', isCity: false, northHorizonBlock: 0.2 },

  // ── okres Karviná ──
  { name: 'Karviná', lat: 49.8543, lon: 18.5414, bortle: 7, region: 'Moravskoslezský', district: 'Karviná', lightPollution: 'Vysoké', isCity: true, northHorizonBlock: 0.4 },
  { name: 'Havířov', lat: 49.7797, lon: 18.4306, bortle: 7, region: 'Moravskoslezský', district: 'Karviná', lightPollution: 'Vysoké', isCity: true, northHorizonBlock: 0.4 },
  { name: 'Český Těšín', lat: 49.7461, lon: 18.6264, bortle: 6, region: 'Moravskoslezský', district: 'Karviná', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.35 },
  { name: 'Orlová', lat: 49.8453, lon: 18.4314, bortle: 6, region: 'Moravskoslezský', district: 'Karviná', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.4 },

  // ── okres Nový Jičín ──
  { name: 'Nový Jičín', lat: 49.5944, lon: 18.0103, bortle: 5, region: 'Moravskoslezský', district: 'Nový Jičín', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.4 },
  { name: 'Kopřivnice', lat: 49.5994, lon: 18.1447, bortle: 5, region: 'Moravskoslezský', district: 'Nový Jičín', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.4 },
  { name: 'Frenštát p. Radh.', lat: 49.5486, lon: 18.2108, bortle: 5, region: 'Moravskoslezský', district: 'Nový Jičín', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.4 },
  { name: 'Štramberk', lat: 49.5917, lon: 18.1167, bortle: 5, region: 'Moravskoslezský', district: 'Nový Jičín', lightPollution: 'Střední', isCity: false, northHorizonBlock: 0.35 },
  { name: 'Odry', lat: 49.6625, lon: 17.8328, bortle: 4, region: 'Moravskoslezský', district: 'Nový Jičín', lightPollution: 'Nízké', isCity: true, northHorizonBlock: 0.25 },

  // ── okres Opava ──
  { name: 'Opava', lat: 49.9384, lon: 17.9048, bortle: 6, region: 'Moravskoslezský', district: 'Opava', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.4 },
  { name: 'Hlučín', lat: 49.8989, lon: 18.1922, bortle: 5, region: 'Moravskoslezský', district: 'Opava', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.3 },
  { name: 'Vítkov', lat: 49.7736, lon: 17.7494, bortle: 4, region: 'Moravskoslezský', district: 'Opava', lightPollution: 'Nízké', isCity: true, northHorizonBlock: 0.25 },
  { name: 'Hradec nad Moravicí', lat: 49.8694, lon: 17.8756, bortle: 4, region: 'Moravskoslezský', district: 'Opava', lightPollution: 'Nízké', isCity: false, northHorizonBlock: 0.2 },

  // ── okres Ostrava-město ──
  { name: 'Ostrava', lat: 49.8209, lon: 18.2625, bortle: 7, region: 'Moravskoslezský', district: 'Ostrava-město', lightPollution: 'Vysoké', isCity: true, northHorizonBlock: 0.5 },
  { name: 'Ostrava-Poruba', lat: 49.8278, lon: 18.1717, bortle: 7, region: 'Moravskoslezský', district: 'Ostrava-město', lightPollution: 'Vysoké', isCity: true, northHorizonBlock: 0.45 },
  { name: 'Polanka n. Odrou', lat: 49.8000, lon: 18.1700, bortle: 5, region: 'Moravskoslezský', district: 'Ostrava-město', lightPollution: 'Střední', isCity: false, northHorizonBlock: 0.3 },

  // ══════════════════════════════════════════════════════════════════════════
  // PLZEŇSKÝ
  // ══════════════════════════════════════════════════════════════════════════

  // ── okres Domažlice ──
  { name: 'Domažlice', lat: 49.4403, lon: 12.9297, bortle: 5, region: 'Plzeňský', district: 'Domažlice', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.3 },
  { name: 'Kdyně', lat: 49.3908, lon: 13.0356, bortle: 4, region: 'Plzeňský', district: 'Domažlice', lightPollution: 'Nízké', isCity: true, northHorizonBlock: 0.25 },
  { name: 'Čerchov', lat: 49.3950, lon: 12.7880, bortle: 3, region: 'Plzeňský', district: 'Domažlice', lightPollution: 'Velmi nízké', isCity: false, northHorizonBlock: 0.15 },

  // ── okres Klatovy ──
  { name: 'Klatovy', lat: 49.3953, lon: 13.2931, bortle: 5, region: 'Plzeňský', district: 'Klatovy', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.3 },
  { name: 'Sušice', lat: 49.2311, lon: 13.5192, bortle: 5, region: 'Plzeňský', district: 'Klatovy', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.3 },
  { name: 'Horažďovice', lat: 49.3203, lon: 13.7019, bortle: 5, region: 'Plzeňský', district: 'Klatovy', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.25 },
  { name: 'Železná Ruda', lat: 49.1375, lon: 13.2353, bortle: 3, region: 'Plzeňský', district: 'Klatovy', lightPollution: 'Velmi nízké', isCity: true, northHorizonBlock: 0.3 },

  // ── okres Plzeň-město ──
  { name: 'Plzeň', lat: 49.7384, lon: 13.3736, bortle: 7, region: 'Plzeňský', district: 'Plzeň-město', lightPollution: 'Vysoké', isCity: true, northHorizonBlock: 0.4 },

  // ── okres Plzeň-jih ──
  { name: 'Přeštice', lat: 49.5708, lon: 13.3339, bortle: 5, region: 'Plzeňský', district: 'Plzeň-jih', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.25 },
  { name: 'Nepomuk', lat: 49.4867, lon: 13.5808, bortle: 4, region: 'Plzeňský', district: 'Plzeň-jih', lightPollution: 'Nízké', isCity: true, northHorizonBlock: 0.2 },
  { name: 'Blovice', lat: 49.5853, lon: 13.5406, bortle: 4, region: 'Plzeňský', district: 'Plzeň-jih', lightPollution: 'Nízké', isCity: true, northHorizonBlock: 0.2 },

  // ── okres Plzeň-sever ──
  { name: 'Kralovice', lat: 49.9856, lon: 13.4872, bortle: 4, region: 'Plzeňský', district: 'Plzeň-sever', lightPollution: 'Nízké', isCity: true, northHorizonBlock: 0.2 },
  { name: 'Manětín', lat: 49.9833, lon: 13.2333, bortle: 3, region: 'Plzeňský', district: 'Plzeň-sever', lightPollution: 'Velmi nízké', isCity: false, northHorizonBlock: 0.1 },
  { name: 'Nýřany', lat: 49.7125, lon: 13.2144, bortle: 5, region: 'Plzeňský', district: 'Plzeň-sever', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.3 },

  // ── okres Rokycany ──
  { name: 'Rokycany', lat: 49.7425, lon: 13.5953, bortle: 5, region: 'Plzeňský', district: 'Rokycany', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.3 },
  { name: 'Zbiroh', lat: 49.8597, lon: 13.7694, bortle: 4, region: 'Plzeňský', district: 'Rokycany', lightPollution: 'Nízké', isCity: true, northHorizonBlock: 0.25 },
  { name: 'Třemšín', lat: 49.5667, lon: 13.8000, bortle: 4, region: 'Plzeňský', district: 'Rokycany', lightPollution: 'Nízké', isCity: false, northHorizonBlock: 0.2 },

  // ── okres Tachov ──
  { name: 'Tachov', lat: 49.7950, lon: 12.6337, bortle: 4, region: 'Plzeňský', district: 'Tachov', lightPollution: 'Nízké', isCity: true, northHorizonBlock: 0.2 },
  { name: 'Stříbro', lat: 49.7556, lon: 13.0039, bortle: 5, region: 'Plzeňský', district: 'Tachov', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.25 },
  { name: 'Přimda', lat: 49.6700, lon: 12.6700, bortle: 3, region: 'Plzeňský', district: 'Tachov', lightPollution: 'Velmi nízké', isCity: false, northHorizonBlock: 0.15 },

  // ══════════════════════════════════════════════════════════════════════════
  // LIBERECKÝ
  // ══════════════════════════════════════════════════════════════════════════

  // ── okres Česká Lípa ──
  { name: 'Česká Lípa', lat: 50.6856, lon: 14.5375, bortle: 5, region: 'Liberecký', district: 'Česká Lípa', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.3 },
  { name: 'Nový Bor', lat: 50.7581, lon: 14.5553, bortle: 5, region: 'Liberecký', district: 'Česká Lípa', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.3 },
  { name: 'Doksy', lat: 50.5644, lon: 14.6553, bortle: 4, region: 'Liberecký', district: 'Česká Lípa', lightPollution: 'Nízké', isCity: true, northHorizonBlock: 0.2 },
  { name: 'Ralsko', lat: 50.6000, lon: 14.8000, bortle: 4, region: 'Liberecký', district: 'Česká Lípa', lightPollution: 'Nízké', isCity: false, northHorizonBlock: 0.15 },

  // ── okres Jablonec nad Nisou ──
  { name: 'Jablonec n. N.', lat: 50.7276, lon: 15.1700, bortle: 6, region: 'Liberecký', district: 'Jablonec nad Nisou', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.5 },
  { name: 'Tanvald', lat: 50.7364, lon: 15.3044, bortle: 5, region: 'Liberecký', district: 'Jablonec nad Nisou', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.4 },
  { name: 'Železný Brod', lat: 50.6422, lon: 15.2539, bortle: 5, region: 'Liberecký', district: 'Jablonec nad Nisou', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.35 },
  { name: 'Jizerská tmavá obloha', lat: 50.8333, lon: 15.2500, bortle: 3, region: 'Liberecký', district: 'Jablonec nad Nisou', lightPollution: 'Nízké', isCity: false, northHorizonBlock: 0.3 },

  // ── okres Liberec ──
  { name: 'Liberec', lat: 50.7671, lon: 15.0562, bortle: 6, region: 'Liberecký', district: 'Liberec', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.5 },
  { name: 'Frýdlant', lat: 50.9217, lon: 15.0789, bortle: 4, region: 'Liberecký', district: 'Liberec', lightPollution: 'Nízké', isCity: true, northHorizonBlock: 0.3 },
  { name: 'Hrádek nad Nisou', lat: 50.8528, lon: 14.8444, bortle: 5, region: 'Liberecký', district: 'Liberec', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.3 },
  { name: 'Chrastava', lat: 50.8167, lon: 14.9667, bortle: 5, region: 'Liberecký', district: 'Liberec', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.35 },

  // ── okres Semily ──
  { name: 'Semily', lat: 50.6024, lon: 15.3345, bortle: 5, region: 'Liberecký', district: 'Semily', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.4 },
  { name: 'Turnov', lat: 50.5872, lon: 15.1569, bortle: 5, region: 'Liberecký', district: 'Semily', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.3 },
  { name: 'Jilemnice', lat: 50.6083, lon: 15.5044, bortle: 4, region: 'Liberecký', district: 'Semily', lightPollution: 'Nízké', isCity: true, northHorizonBlock: 0.35 },
  { name: 'Kozákov', lat: 50.5850, lon: 15.2300, bortle: 4, region: 'Liberecký', district: 'Semily', lightPollution: 'Nízké', isCity: false, northHorizonBlock: 0.15 },

  // ══════════════════════════════════════════════════════════════════════════
  // OLOMOUCKÝ
  // ══════════════════════════════════════════════════════════════════════════

  // ── okres Jeseník ──
  { name: 'Jeseník', lat: 50.2292, lon: 17.2044, bortle: 4, region: 'Olomoucký', district: 'Jeseník', lightPollution: 'Nízké', isCity: true, northHorizonBlock: 0.3 },
  { name: 'Zlaté Hory', lat: 50.2633, lon: 17.3958, bortle: 4, region: 'Olomoucký', district: 'Jeseník', lightPollution: 'Nízké', isCity: true, northHorizonBlock: 0.25 },
  { name: 'Javorník', lat: 50.3908, lon: 17.0039, bortle: 4, region: 'Olomoucký', district: 'Jeseník', lightPollution: 'Nízké', isCity: true, northHorizonBlock: 0.2 },
  { name: 'Jeseníky – Praděd', lat: 50.0833, lon: 17.2333, bortle: 3, region: 'Olomoucký', district: 'Jeseník', lightPollution: 'Nízké', isCity: false, northHorizonBlock: 0.15 },

  // ── okres Olomouc ──
  { name: 'Olomouc', lat: 49.5938, lon: 17.2509, bortle: 6, region: 'Olomoucký', district: 'Olomouc', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.4 },
  { name: 'Šternberk', lat: 49.7306, lon: 17.2989, bortle: 5, region: 'Olomoucký', district: 'Olomouc', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.3 },
  { name: 'Uničov', lat: 49.7714, lon: 17.1211, bortle: 5, region: 'Olomoucký', district: 'Olomouc', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.3 },
  { name: 'Litovel', lat: 49.7014, lon: 17.0756, bortle: 4, region: 'Olomoucký', district: 'Olomouc', lightPollution: 'Nízké', isCity: true, northHorizonBlock: 0.2 },

  // ── okres Prostějov ──
  { name: 'Prostějov', lat: 49.4722, lon: 17.1119, bortle: 5, region: 'Olomoucký', district: 'Prostějov', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.3 },
  { name: 'Konice', lat: 49.5939, lon: 16.8897, bortle: 4, region: 'Olomoucký', district: 'Prostějov', lightPollution: 'Nízké', isCity: true, northHorizonBlock: 0.25 },
  { name: 'Plumlov', lat: 49.4656, lon: 16.9875, bortle: 4, region: 'Olomoucký', district: 'Prostějov', lightPollution: 'Nízké', isCity: false, northHorizonBlock: 0.2 },

  // ── okres Přerov ──
  { name: 'Přerov', lat: 49.4553, lon: 17.4514, bortle: 5, region: 'Olomoucký', district: 'Přerov', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.3 },
  { name: 'Hranice na Moravě', lat: 49.5483, lon: 17.7347, bortle: 5, region: 'Olomoucký', district: 'Přerov', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.3 },
  { name: 'Lipník nad Bečvou', lat: 49.5278, lon: 17.5869, bortle: 4, region: 'Olomoucký', district: 'Přerov', lightPollution: 'Nízké', isCity: true, northHorizonBlock: 0.2 },
  { name: 'Kojetín', lat: 49.3522, lon: 17.3022, bortle: 4, region: 'Olomoucký', district: 'Přerov', lightPollution: 'Nízké', isCity: true, northHorizonBlock: 0.2 },

  // ── okres Šumperk ──
  { name: 'Šumperk', lat: 49.9653, lon: 16.9700, bortle: 5, region: 'Olomoucký', district: 'Šumperk', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.4 },
  { name: 'Zábřeh', lat: 49.8828, lon: 16.8722, bortle: 5, region: 'Olomoucký', district: 'Šumperk', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.3 },
  { name: 'Mohelnice', lat: 49.7772, lon: 16.9189, bortle: 5, region: 'Olomoucký', district: 'Šumperk', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.3 },
  { name: 'Velké Losiny', lat: 50.0311, lon: 17.0422, bortle: 4, region: 'Olomoucký', district: 'Šumperk', lightPollution: 'Nízké', isCity: false, northHorizonBlock: 0.3 },

  // ══════════════════════════════════════════════════════════════════════════
  // KRÁLOVÉHRADECKÝ
  // ══════════════════════════════════════════════════════════════════════════

  // ── okres Hradec Králové ──
  { name: 'Hradec Králové', lat: 50.2104, lon: 15.8327, bortle: 6, region: 'Královéhradecký', district: 'Hradec Králové', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.4 },
  { name: 'Nový Bydžov', lat: 50.2414, lon: 15.4900, bortle: 5, region: 'Královéhradecký', district: 'Hradec Králové', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.25 },
  { name: 'Třebechovice p. O.', lat: 50.2011, lon: 15.9925, bortle: 4, region: 'Královéhradecký', district: 'Hradec Králové', lightPollution: 'Nízké', isCity: true, northHorizonBlock: 0.2 },
  { name: 'Chlumec n. C.', lat: 50.1536, lon: 15.4603, bortle: 4, region: 'Královéhradecký', district: 'Hradec Králové', lightPollution: 'Nízké', isCity: true, northHorizonBlock: 0.2 },

  // ── okres Jičín ──
  { name: 'Jičín', lat: 50.4372, lon: 15.3519, bortle: 5, region: 'Královéhradecký', district: 'Jičín', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.3 },
  { name: 'Hořice', lat: 50.3664, lon: 15.6308, bortle: 5, region: 'Královéhradecký', district: 'Jičín', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.25 },
  { name: 'Nová Paka', lat: 50.4950, lon: 15.5150, bortle: 5, region: 'Královéhradecký', district: 'Jičín', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.3 },
  { name: 'Prachovské skály', lat: 50.4600, lon: 15.3900, bortle: 4, region: 'Královéhradecký', district: 'Jičín', lightPollution: 'Nízké', isCity: false, northHorizonBlock: 0.15 },

  // ── okres Náchod ──
  { name: 'Náchod', lat: 50.4167, lon: 16.1628, bortle: 5, region: 'Královéhradecký', district: 'Náchod', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.3 },
  { name: 'Broumov', lat: 50.5861, lon: 16.3319, bortle: 4, region: 'Královéhradecký', district: 'Náchod', lightPollution: 'Nízké', isCity: true, northHorizonBlock: 0.3 },
  { name: 'Jaroměř', lat: 50.3567, lon: 15.9214, bortle: 5, region: 'Královéhradecký', district: 'Náchod', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.25 },
  { name: 'Adršpašské skály', lat: 50.6100, lon: 16.1200, bortle: 3, region: 'Královéhradecký', district: 'Náchod', lightPollution: 'Velmi nízké', isCity: false, northHorizonBlock: 0.2 },

  // ── okres Rychnov nad Kněžnou ──
  { name: 'Rychnov n. Kn.', lat: 50.1631, lon: 16.2756, bortle: 5, region: 'Královéhradecký', district: 'Rychnov nad Kněžnou', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.3 },
  { name: 'Dobruška', lat: 50.2917, lon: 16.1600, bortle: 5, region: 'Královéhradecký', district: 'Rychnov nad Kněžnou', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.25 },
  { name: 'Kostelec n. Orlicí', lat: 50.1228, lon: 16.2125, bortle: 5, region: 'Královéhradecký', district: 'Rychnov nad Kněžnou', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.25 },
  { name: 'Orlické hory', lat: 50.3500, lon: 16.4500, bortle: 4, region: 'Královéhradecký', district: 'Rychnov nad Kněžnou', lightPollution: 'Nízké', isCity: false, northHorizonBlock: 0.2 },

  // ── okres Trutnov ──
  { name: 'Trutnov', lat: 50.5611, lon: 15.9128, bortle: 5, region: 'Královéhradecký', district: 'Trutnov', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.5 },
  { name: 'Dvůr Králové n. L.', lat: 50.4319, lon: 15.8114, bortle: 5, region: 'Královéhradecký', district: 'Trutnov', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.3 },
  { name: 'Vrchlabí', lat: 50.6267, lon: 15.6097, bortle: 5, region: 'Královéhradecký', district: 'Trutnov', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.4 },
  { name: 'Pec pod Sněžkou', lat: 50.6925, lon: 15.7319, bortle: 4, region: 'Královéhradecký', district: 'Trutnov', lightPollution: 'Nízké', isCity: true, northHorizonBlock: 0.35 },
  { name: 'Krkonoše – Sněžka', lat: 50.7361, lon: 15.7397, bortle: 3, region: 'Královéhradecký', district: 'Trutnov', lightPollution: 'Nízké', isCity: false, northHorizonBlock: 0.15 },

  // ══════════════════════════════════════════════════════════════════════════
  // PARDUBICKÝ
  // ══════════════════════════════════════════════════════════════════════════

  // ── okres Chrudim ──
  { name: 'Chrudim', lat: 49.9511, lon: 15.7950, bortle: 5, region: 'Pardubický', district: 'Chrudim', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.3 },
  { name: 'Hlinsko', lat: 49.7619, lon: 15.9067, bortle: 4, region: 'Pardubický', district: 'Chrudim', lightPollution: 'Nízké', isCity: true, northHorizonBlock: 0.25 },
  { name: 'Skuteč', lat: 49.8417, lon: 16.0194, bortle: 4, region: 'Pardubický', district: 'Chrudim', lightPollution: 'Nízké', isCity: true, northHorizonBlock: 0.25 },
  { name: 'Přehrada Seč', lat: 49.8600, lon: 15.6500, bortle: 4, region: 'Pardubický', district: 'Chrudim', lightPollution: 'Nízké', isCity: false, northHorizonBlock: 0.2 },

  // ── okres Pardubice ──
  { name: 'Pardubice', lat: 50.0343, lon: 15.7812, bortle: 6, region: 'Pardubický', district: 'Pardubice', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.3 },
  { name: 'Přelouč', lat: 50.0397, lon: 15.5606, bortle: 5, region: 'Pardubický', district: 'Pardubice', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.25 },
  { name: 'Holice', lat: 50.0603, lon: 15.9861, bortle: 5, region: 'Pardubický', district: 'Pardubice', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.25 },
  { name: 'Lázně Bohdaneč', lat: 50.0764, lon: 15.6789, bortle: 4, region: 'Pardubický', district: 'Pardubice', lightPollution: 'Nízké', isCity: false, northHorizonBlock: 0.15 },

  // ── okres Svitavy ──
  { name: 'Svitavy', lat: 49.7558, lon: 16.4686, bortle: 5, region: 'Pardubický', district: 'Svitavy', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.3 },
  { name: 'Litomyšl', lat: 49.8681, lon: 16.3131, bortle: 5, region: 'Pardubický', district: 'Svitavy', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.25 },
  { name: 'Polička', lat: 49.7153, lon: 16.2656, bortle: 4, region: 'Pardubický', district: 'Svitavy', lightPollution: 'Nízké', isCity: true, northHorizonBlock: 0.2 },
  { name: 'Moravská Třebová', lat: 49.7589, lon: 16.6644, bortle: 5, region: 'Pardubický', district: 'Svitavy', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.3 },

  // ── okres Ústí nad Orlicí ──
  { name: 'Ústí n. Orlicí', lat: 49.9742, lon: 16.3936, bortle: 5, region: 'Pardubický', district: 'Ústí nad Orlicí', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.3 },
  { name: 'Česká Třebová', lat: 49.9042, lon: 16.4422, bortle: 5, region: 'Pardubický', district: 'Ústí nad Orlicí', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.3 },
  { name: 'Lanškroun', lat: 49.9117, lon: 16.6125, bortle: 4, region: 'Pardubický', district: 'Ústí nad Orlicí', lightPollution: 'Nízké', isCity: true, northHorizonBlock: 0.25 },
  { name: 'Letohrad', lat: 50.0356, lon: 16.4994, bortle: 4, region: 'Pardubický', district: 'Ústí nad Orlicí', lightPollution: 'Nízké', isCity: true, northHorizonBlock: 0.25 },
  { name: 'Králický Sněžník', lat: 50.2080, lon: 16.8475, bortle: 3, region: 'Pardubický', district: 'Ústí nad Orlicí', lightPollution: 'Nízké', isCity: false, northHorizonBlock: 0.15 },

  // ══════════════════════════════════════════════════════════════════════════
  // JIHOČESKÝ
  // ══════════════════════════════════════════════════════════════════════════

  // ── okres České Budějovice ──
  { name: 'České Budějovice', lat: 48.9745, lon: 14.4747, bortle: 6, region: 'Jihočeský', district: 'České Budějovice', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.4 },
  { name: 'Hluboká nad Vltavou', lat: 49.0522, lon: 14.4350, bortle: 5, region: 'Jihočeský', district: 'České Budějovice', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.3 },
  { name: 'Trhové Sviny', lat: 48.8431, lon: 14.6406, bortle: 4, region: 'Jihočeský', district: 'České Budějovice', lightPollution: 'Nízké', isCity: true, northHorizonBlock: 0.25 },
  { name: 'Lišov', lat: 49.0200, lon: 14.5800, bortle: 4, region: 'Jihočeský', district: 'České Budějovice', lightPollution: 'Nízké', isCity: false, northHorizonBlock: 0.2 },

  // ── okres Český Krumlov ──
  { name: 'Český Krumlov', lat: 48.8109, lon: 14.3153, bortle: 4, region: 'Jihočeský', district: 'Český Krumlov', lightPollution: 'Nízké', isCity: true, northHorizonBlock: 0.4 },
  { name: 'Vyšší Brod', lat: 48.6231, lon: 14.3142, bortle: 4, region: 'Jihočeský', district: 'Český Krumlov', lightPollution: 'Nízké', isCity: true, northHorizonBlock: 0.3 },
  { name: 'Kaplice', lat: 48.7392, lon: 14.4953, bortle: 4, region: 'Jihočeský', district: 'Český Krumlov', lightPollution: 'Nízké', isCity: true, northHorizonBlock: 0.25 },
  { name: 'Lipno n. Vltavou', lat: 48.6300, lon: 14.2200, bortle: 3, region: 'Jihočeský', district: 'Český Krumlov', lightPollution: 'Velmi nízké', isCity: false, northHorizonBlock: 0.15 },

  // ── okres Jindřichův Hradec ──
  { name: 'Jindřichův Hradec', lat: 49.1442, lon: 15.0028, bortle: 5, region: 'Jihočeský', district: 'Jindřichův Hradec', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.3 },
  { name: 'Třeboň', lat: 49.0036, lon: 14.7703, bortle: 4, region: 'Jihočeský', district: 'Jindřichův Hradec', lightPollution: 'Nízké', isCity: true, northHorizonBlock: 0.2 },
  { name: 'Dačice', lat: 49.0819, lon: 15.4383, bortle: 4, region: 'Jihočeský', district: 'Jindřichův Hradec', lightPollution: 'Nízké', isCity: true, northHorizonBlock: 0.2 },
  { name: 'Slavonice', lat: 48.9972, lon: 15.3517, bortle: 3, region: 'Jihočeský', district: 'Jindřichův Hradec', lightPollution: 'Velmi nízké', isCity: true, northHorizonBlock: 0.15 },

  // ── okres Písek ──
  { name: 'Písek', lat: 49.3089, lon: 14.1478, bortle: 5, region: 'Jihočeský', district: 'Písek', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.3 },
  { name: 'Milevsko', lat: 49.4503, lon: 14.3603, bortle: 5, region: 'Jihočeský', district: 'Písek', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.25 },
  { name: 'Protivín', lat: 49.2006, lon: 14.2156, bortle: 4, region: 'Jihočeský', district: 'Písek', lightPollution: 'Nízké', isCity: true, northHorizonBlock: 0.2 },

  // ── okres Prachatice ──
  { name: 'Prachatice', lat: 49.0128, lon: 13.9975, bortle: 4, region: 'Jihočeský', district: 'Prachatice', lightPollution: 'Nízké', isCity: true, northHorizonBlock: 0.3 },
  { name: 'Vimperk', lat: 49.0583, lon: 13.7833, bortle: 4, region: 'Jihočeský', district: 'Prachatice', lightPollution: 'Nízké', isCity: true, northHorizonBlock: 0.3 },
  { name: 'Volary', lat: 48.9094, lon: 13.8886, bortle: 3, region: 'Jihočeský', district: 'Prachatice', lightPollution: 'Velmi nízké', isCity: true, northHorizonBlock: 0.2 },
  { name: 'Šumava – Boubín', lat: 48.9728, lon: 13.8097, bortle: 3, region: 'Jihočeský', district: 'Prachatice', lightPollution: 'Nízké', isCity: false, northHorizonBlock: 0.2 },
  { name: 'Šumava – Březník', lat: 49.0050, lon: 13.4750, bortle: 2, region: 'Jihočeský', district: 'Prachatice', lightPollution: 'Velmi nízké', isCity: false, northHorizonBlock: 0.15 },

  // ── okres Strakonice ──
  { name: 'Strakonice', lat: 49.2614, lon: 13.9022, bortle: 5, region: 'Jihočeský', district: 'Strakonice', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.3 },
  { name: 'Blatná', lat: 49.4253, lon: 13.8819, bortle: 4, region: 'Jihočeský', district: 'Strakonice', lightPollution: 'Nízké', isCity: true, northHorizonBlock: 0.2 },
  { name: 'Volyně', lat: 49.1656, lon: 13.8858, bortle: 4, region: 'Jihočeský', district: 'Strakonice', lightPollution: 'Nízké', isCity: true, northHorizonBlock: 0.2 },

  // ── okres Tábor ──
  { name: 'Tábor', lat: 49.4147, lon: 14.6781, bortle: 5, region: 'Jihočeský', district: 'Tábor', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.3 },
  { name: 'Soběslav', lat: 49.2611, lon: 14.7186, bortle: 5, region: 'Jihočeský', district: 'Tábor', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.25 },
  { name: 'Mladá Vožice', lat: 49.5331, lon: 14.8108, bortle: 4, region: 'Jihočeský', district: 'Tábor', lightPollution: 'Nízké', isCity: true, northHorizonBlock: 0.2 },
  { name: 'Bechyně', lat: 49.2964, lon: 14.4681, bortle: 4, region: 'Jihočeský', district: 'Tábor', lightPollution: 'Nízké', isCity: true, northHorizonBlock: 0.2 },

  // ══════════════════════════════════════════════════════════════════════════
  // ZLÍNSKÝ
  // ══════════════════════════════════════════════════════════════════════════

  // ── okres Kroměříž ──
  { name: 'Kroměříž', lat: 49.2976, lon: 17.3932, bortle: 5, region: 'Zlínský', district: 'Kroměříž', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.3 },
  { name: 'Holešov', lat: 49.3333, lon: 17.5783, bortle: 5, region: 'Zlínský', district: 'Kroměříž', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.3 },
  { name: 'Bystřice p. Hostýnem', lat: 49.3978, lon: 17.6719, bortle: 4, region: 'Zlínský', district: 'Kroměříž', lightPollution: 'Nízké', isCity: true, northHorizonBlock: 0.3 },
  { name: 'Chropyně', lat: 49.3572, lon: 17.3639, bortle: 4, region: 'Zlínský', district: 'Kroměříž', lightPollution: 'Nízké', isCity: false, northHorizonBlock: 0.2 },

  // ── okres Uherské Hradiště ──
  { name: 'Uherské Hradiště', lat: 49.0700, lon: 17.4597, bortle: 5, region: 'Zlínský', district: 'Uherské Hradiště', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.3 },
  { name: 'Uherský Brod', lat: 49.0247, lon: 17.6483, bortle: 5, region: 'Zlínský', district: 'Uherské Hradiště', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.3 },
  { name: 'Bojkovice', lat: 49.0383, lon: 17.7608, bortle: 4, region: 'Zlínský', district: 'Uherské Hradiště', lightPollution: 'Nízké', isCity: true, northHorizonBlock: 0.3 },
  { name: 'Bílé Karpaty', lat: 48.9500, lon: 17.7500, bortle: 4, region: 'Zlínský', district: 'Uherské Hradiště', lightPollution: 'Nízké', isCity: false, northHorizonBlock: 0.2 },

  // ── okres Vsetín ──
  { name: 'Vsetín', lat: 49.3388, lon: 17.9961, bortle: 5, region: 'Zlínský', district: 'Vsetín', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.5 },
  { name: 'Valašské Meziříčí', lat: 49.4717, lon: 17.9711, bortle: 5, region: 'Zlínský', district: 'Vsetín', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.4 },
  { name: 'Rožnov p. Radh.', lat: 49.4586, lon: 18.1431, bortle: 5, region: 'Zlínský', district: 'Vsetín', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.4 },
  { name: 'Velké Karlovice', lat: 49.3567, lon: 18.2731, bortle: 4, region: 'Zlínský', district: 'Vsetín', lightPollution: 'Nízké', isCity: false, northHorizonBlock: 0.3 },

  // ── okres Zlín ──
  { name: 'Zlín', lat: 49.2265, lon: 17.6670, bortle: 6, region: 'Zlínský', district: 'Zlín', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.5 },
  { name: 'Otrokovice', lat: 49.2094, lon: 17.5303, bortle: 5, region: 'Zlínský', district: 'Zlín', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.3 },
  { name: 'Vizovice', lat: 49.2203, lon: 17.8531, bortle: 5, region: 'Zlínský', district: 'Zlín', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.4 },
  { name: 'Luhačovice', lat: 49.1028, lon: 17.7597, bortle: 4, region: 'Zlínský', district: 'Zlín', lightPollution: 'Nízké', isCity: true, northHorizonBlock: 0.3 },

  // ══════════════════════════════════════════════════════════════════════════
  // ÚSTECKÝ
  // ══════════════════════════════════════════════════════════════════════════

  // ── okres Chomutov ──
  { name: 'Chomutov', lat: 50.4611, lon: 13.4175, bortle: 5, region: 'Ústecký', district: 'Chomutov', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.4 },
  { name: 'Jirkov', lat: 50.4997, lon: 13.4475, bortle: 5, region: 'Ústecký', district: 'Chomutov', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.4 },
  { name: 'Kadaň', lat: 50.3781, lon: 13.2714, bortle: 5, region: 'Ústecký', district: 'Chomutov', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.3 },
  { name: 'Hora Sv. Šebestiána', lat: 50.5600, lon: 13.2400, bortle: 3, region: 'Ústecký', district: 'Chomutov', lightPollution: 'Velmi nízké', isCity: false, northHorizonBlock: 0.2 },

  // ── okres Děčín ──
  { name: 'Děčín', lat: 50.7814, lon: 14.2149, bortle: 5, region: 'Ústecký', district: 'Děčín', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.5 },
  { name: 'Rumburk', lat: 50.9517, lon: 14.5561, bortle: 5, region: 'Ústecký', district: 'Děčín', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.3 },
  { name: 'Varnsdorf', lat: 50.9114, lon: 14.6181, bortle: 5, region: 'Ústecký', district: 'Děčín', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.3 },
  { name: 'České Švýcarsko', lat: 50.8600, lon: 14.2900, bortle: 3, region: 'Ústecký', district: 'Děčín', lightPollution: 'Velmi nízké', isCity: false, northHorizonBlock: 0.2 },

  // ── okres Litoměřice ──
  { name: 'Litoměřice', lat: 50.5341, lon: 14.1318, bortle: 5, region: 'Ústecký', district: 'Litoměřice', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.4 },
  { name: 'Roudnice n. Labem', lat: 50.4253, lon: 14.2619, bortle: 5, region: 'Ústecký', district: 'Litoměřice', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.3 },
  { name: 'Lovosice', lat: 50.5153, lon: 14.0514, bortle: 5, region: 'Ústecký', district: 'Litoměřice', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.35 },
  { name: 'České středohoří', lat: 50.5500, lon: 13.9500, bortle: 4, region: 'Ústecký', district: 'Litoměřice', lightPollution: 'Nízké', isCity: false, northHorizonBlock: 0.3 },

  // ── okres Louny ──
  { name: 'Louny', lat: 50.3572, lon: 13.7939, bortle: 5, region: 'Ústecký', district: 'Louny', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.3 },
  { name: 'Žatec', lat: 50.3264, lon: 13.5464, bortle: 5, region: 'Ústecký', district: 'Louny', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.3 },
  { name: 'Podbořany', lat: 50.2306, lon: 13.4122, bortle: 4, region: 'Ústecký', district: 'Louny', lightPollution: 'Nízké', isCity: true, northHorizonBlock: 0.2 },
  { name: 'Raná u Loun', lat: 50.3900, lon: 13.7500, bortle: 4, region: 'Ústecký', district: 'Louny', lightPollution: 'Nízké', isCity: false, northHorizonBlock: 0.15 },

  // ── okres Most ──
  { name: 'Most', lat: 50.5031, lon: 13.6367, bortle: 6, region: 'Ústecký', district: 'Most', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.4 },
  { name: 'Litvínov', lat: 50.6006, lon: 13.6111, bortle: 5, region: 'Ústecký', district: 'Most', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.4 },
  { name: 'Hora Sv. Kateřiny', lat: 50.6100, lon: 13.5100, bortle: 4, region: 'Ústecký', district: 'Most', lightPollution: 'Nízké', isCity: false, northHorizonBlock: 0.25 },

  // ── okres Teplice ──
  { name: 'Teplice', lat: 50.6406, lon: 13.8247, bortle: 6, region: 'Ústecký', district: 'Teplice', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.5 },
  { name: 'Duchcov', lat: 50.6036, lon: 13.7461, bortle: 5, region: 'Ústecký', district: 'Teplice', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.4 },
  { name: 'Krupka', lat: 50.6861, lon: 13.8669, bortle: 5, region: 'Ústecký', district: 'Teplice', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.4 },
  { name: 'Dubí', lat: 50.6842, lon: 13.7844, bortle: 4, region: 'Ústecký', district: 'Teplice', lightPollution: 'Nízké', isCity: true, northHorizonBlock: 0.35 },

  // ── okres Ústí nad Labem ──
  { name: 'Ústí nad Labem', lat: 50.6607, lon: 14.0323, bortle: 6, region: 'Ústecký', district: 'Ústí nad Labem', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.5 },
  { name: 'Chabařovice', lat: 50.6739, lon: 13.9381, bortle: 5, region: 'Ústecký', district: 'Ústí nad Labem', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.4 },
  { name: 'Velké Březno', lat: 50.6672, lon: 14.1306, bortle: 5, region: 'Ústecký', district: 'Ústí nad Labem', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.35 },

  // ══════════════════════════════════════════════════════════════════════════
  // KARLOVARSKÝ
  // ══════════════════════════════════════════════════════════════════════════

  // ── okres Cheb ──
  { name: 'Cheb', lat: 50.0797, lon: 12.3714, bortle: 5, region: 'Karlovarský', district: 'Cheb', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.3 },
  { name: 'Aš', lat: 50.2239, lon: 12.1947, bortle: 5, region: 'Karlovarský', district: 'Cheb', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.3 },
  { name: 'Mariánské Lázně', lat: 49.9647, lon: 12.7011, bortle: 4, region: 'Karlovarský', district: 'Cheb', lightPollution: 'Nízké', isCity: true, northHorizonBlock: 0.3 },
  { name: 'SOOS', lat: 50.1500, lon: 12.4000, bortle: 3, region: 'Karlovarský', district: 'Cheb', lightPollution: 'Velmi nízké', isCity: false, northHorizonBlock: 0.1 },

  // ── okres Karlovy Vary ──
  { name: 'Karlovy Vary', lat: 50.2325, lon: 12.8714, bortle: 5, region: 'Karlovarský', district: 'Karlovy Vary', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.5 },
  { name: 'Ostrov', lat: 50.3069, lon: 12.9381, bortle: 5, region: 'Karlovarský', district: 'Karlovy Vary', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.35 },
  { name: 'Jáchymov', lat: 50.3714, lon: 12.9111, bortle: 4, region: 'Karlovarský', district: 'Karlovy Vary', lightPollution: 'Nízké', isCity: true, northHorizonBlock: 0.35 },
  { name: 'Slavkovský les', lat: 50.0500, lon: 12.8000, bortle: 3, region: 'Karlovarský', district: 'Karlovy Vary', lightPollution: 'Velmi nízké', isCity: false, northHorizonBlock: 0.15 },

  // ── okres Sokolov ──
  { name: 'Sokolov', lat: 50.1814, lon: 12.6400, bortle: 5, region: 'Karlovarský', district: 'Sokolov', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.4 },
  { name: 'Loket', lat: 50.1850, lon: 12.7520, bortle: 4, region: 'Karlovarský', district: 'Sokolov', lightPollution: 'Nízké', isCity: true, northHorizonBlock: 0.3 },
  { name: 'Kraslice', lat: 50.3228, lon: 12.5178, bortle: 4, region: 'Karlovarský', district: 'Sokolov', lightPollution: 'Nízké', isCity: true, northHorizonBlock: 0.3 },
  { name: 'Horní Slavkov', lat: 50.1389, lon: 12.8086, bortle: 4, region: 'Karlovarský', district: 'Sokolov', lightPollution: 'Nízké', isCity: true, northHorizonBlock: 0.25 },

  // ══════════════════════════════════════════════════════════════════════════
  // VYSOČINA
  // ══════════════════════════════════════════════════════════════════════════

  // ── okres Havlíčkův Brod ──
  { name: 'Havlíčkův Brod', lat: 49.6078, lon: 15.5808, bortle: 5, region: 'Vysočina', district: 'Havlíčkův Brod', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.3 },
  { name: 'Ledeč nad Sázavou', lat: 49.6925, lon: 15.2778, bortle: 4, region: 'Vysočina', district: 'Havlíčkův Brod', lightPollution: 'Nízké', isCity: true, northHorizonBlock: 0.25 },
  { name: 'Světlá n. Sázavou', lat: 49.6694, lon: 15.4053, bortle: 4, region: 'Vysočina', district: 'Havlíčkův Brod', lightPollution: 'Nízké', isCity: true, northHorizonBlock: 0.2 },
  { name: 'Lipnice nad Sázavou', lat: 49.6167, lon: 15.4167, bortle: 4, region: 'Vysočina', district: 'Havlíčkův Brod', lightPollution: 'Nízké', isCity: false, northHorizonBlock: 0.15 },

  // ── okres Jihlava ──
  { name: 'Jihlava', lat: 49.3961, lon: 15.5912, bortle: 5, region: 'Vysočina', district: 'Jihlava', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.3 },
  { name: 'Telč', lat: 49.1844, lon: 15.4528, bortle: 4, region: 'Vysočina', district: 'Jihlava', lightPollution: 'Nízké', isCity: true, northHorizonBlock: 0.2 },
  { name: 'Polná', lat: 49.4869, lon: 15.7194, bortle: 4, region: 'Vysočina', district: 'Jihlava', lightPollution: 'Nízké', isCity: true, northHorizonBlock: 0.2 },
  { name: 'Čeřínek', lat: 49.3800, lon: 15.5200, bortle: 4, region: 'Vysočina', district: 'Jihlava', lightPollution: 'Nízké', isCity: false, northHorizonBlock: 0.15 },

  // ── okres Pelhřimov ──
  { name: 'Pelhřimov', lat: 49.4314, lon: 15.2231, bortle: 5, region: 'Vysočina', district: 'Pelhřimov', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.3 },
  { name: 'Humpolec', lat: 49.5414, lon: 15.3592, bortle: 5, region: 'Vysočina', district: 'Pelhřimov', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.25 },
  { name: 'Pacov', lat: 49.4706, lon: 15.0019, bortle: 4, region: 'Vysočina', district: 'Pelhřimov', lightPollution: 'Nízké', isCity: true, northHorizonBlock: 0.2 },
  { name: 'Křemešník', lat: 49.4000, lon: 15.2700, bortle: 4, region: 'Vysočina', district: 'Pelhřimov', lightPollution: 'Nízké', isCity: false, northHorizonBlock: 0.15 },

  // ── okres Třebíč ──
  { name: 'Třebíč', lat: 49.2148, lon: 15.8819, bortle: 5, region: 'Vysočina', district: 'Třebíč', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.3 },
  { name: 'Moravské Budějovice', lat: 49.0514, lon: 15.8097, bortle: 4, region: 'Vysočina', district: 'Třebíč', lightPollution: 'Nízké', isCity: true, northHorizonBlock: 0.2 },
  { name: 'Náměšť nad Oslavou', lat: 49.2106, lon: 16.1592, bortle: 4, region: 'Vysočina', district: 'Třebíč', lightPollution: 'Nízké', isCity: true, northHorizonBlock: 0.2 },
  { name: 'Dalešická přehrada', lat: 49.1300, lon: 16.1100, bortle: 3, region: 'Vysočina', district: 'Třebíč', lightPollution: 'Velmi nízké', isCity: false, northHorizonBlock: 0.1 },

  // ── okres Žďár nad Sázavou ──
  { name: 'Žďár nad Sázavou', lat: 49.5628, lon: 15.9392, bortle: 5, region: 'Vysočina', district: 'Žďár nad Sázavou', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.3 },
  { name: 'Bystřice n. Pernšt.', lat: 49.5231, lon: 16.2614, bortle: 4, region: 'Vysočina', district: 'Žďár nad Sázavou', lightPollution: 'Nízké', isCity: true, northHorizonBlock: 0.25 },
  { name: 'Velké Meziříčí', lat: 49.3553, lon: 16.0122, bortle: 5, region: 'Vysočina', district: 'Žďár nad Sázavou', lightPollution: 'Střední', isCity: true, northHorizonBlock: 0.25 },
  { name: 'Nové Město na Moravě', lat: 49.5611, lon: 16.0739, bortle: 4, region: 'Vysočina', district: 'Žďár nad Sázavou', lightPollution: 'Nízké', isCity: true, northHorizonBlock: 0.2 },
  { name: 'Žďárské vrchy', lat: 49.5833, lon: 15.9333, bortle: 4, region: 'Vysočina', district: 'Žďár nad Sázavou', lightPollution: 'Nízké', isCity: false, northHorizonBlock: 0.15 },
]

// ── PER-LOCALITY AURORA PROBABILITY ─────────────────────────────────────────

export interface LocalityProbability {
  /** Probability of seeing aurora overhead (zenithal, very rare for CZ) 0..100 */
  overhead: number
  /** Probability of seeing aurora on northern horizon (photographically or visually) 0..100 */
  horizon: number
  /** Text summary */
  summary: string
}

/**
 * Estimate aurora visibility probability for a given location based on KP, Bz, and local conditions.
 * Czech Republic is at ~49-51°N magnetic latitude — aurora is typically on the horizon.
 * Overhead aurora requires extreme events (KP 8+).
 */
export function getLocalityProbability(
  kp: number,
  bz: number,
  location: CzLocation,
  isDark: boolean,
): LocalityProbability {
  // Base horizon probability from KP (for ~50°N geomagnetic latitude)
  // KP 4 ~5%, KP 5 ~15%, KP 6 ~35%, KP 7 ~60%, KP 8 ~80%, KP 9 ~95%
  let hBase = 0
  if (kp >= 9) hBase = 95
  else if (kp >= 8) hBase = 80
  else if (kp >= 7) hBase = 60
  else if (kp >= 6) hBase = 35
  else if (kp >= 5) hBase = 15
  else if (kp >= 4) hBase = 5
  else hBase = 0

  // Bz modifier: strong southward boosts chance
  if (bz < -10) hBase = Math.min(100, hBase * 1.4)
  else if (bz < -5) hBase = Math.min(100, hBase * 1.2)
  else if (bz > 2) hBase *= 0.5 // northward kills it

  // Bortle penalty: high light pollution greatly reduces visual probability
  const bortlePenalty = Math.max(0, (location.bortle - 3) * 0.08)
  hBase *= (1 - bortlePenalty)

  // Horizon blockage penalty
  hBase *= (1 - location.northHorizonBlock * 0.7)

  // Darkness penalty
  if (!isDark) hBase *= 0.1

  // Overhead probability: aurora needs to reach ~50° geomagnetic = very rare
  // Only at extreme KP 8+
  let oBase = 0
  if (kp >= 9) oBase = 20
  else if (kp >= 8) oBase = 5
  else oBase = 0

  if (bz < -15) oBase = Math.min(100, oBase * 1.5)
  if (!isDark) oBase *= 0.1

  const horizon = Math.round(Math.min(100, Math.max(0, hBase)))
  const overhead = Math.round(Math.min(100, Math.max(0, oBase)))

  let summary: string
  if (horizon >= 50) summary = 'Vysoká šance na záři u severního horizontu'
  else if (horizon >= 20) summary = 'Možnost zachytit polární záři na fotkách'
  else if (horizon >= 5) summary = 'Slabá šance, nutný tmavý sever a dobrá optika'
  else summary = 'Velmi nepravděpodobné z této lokace'

  return { overhead, horizon, summary }
}

// ── OBSERVING SCORE ─────────────────────────────────────────────────────────

export interface ObservingConditions {
  /** Overall score 0..100 */
  score: number
  /** Rating text */
  rating: 'Vynikající' | 'Velmi dobré' | 'Dobré' | 'Průměrné' | 'Špatné' | 'Nemožné'
  ratingColor: string
  /** Individual factor scores */
  factors: ObservingFactor[]
  /** Camera recommendation */
  photoRec: PhotoRecommendation
}

export interface ObservingFactor {
  name: string
  icon: string
  value: string
  score: number  // 0..1
  detail: string
  status: 'good' | 'ok' | 'bad'
}

export interface PhotoRecommendation {
  possible: boolean
  iso: string
  shutter: string
  aperture: string
  focalLength: string
  tips: string[]
}

export function calculateObservingConditions(
  kp: number,
  location: CzLocation,
  date: Date = new Date(),
  addCityPollution: boolean = false,
): ObservingConditions {
  const moon = getMoonInfo(date)
  const sun = getSunPosition(date, location.lat, location.lon)
  const sunTimes = getSunTimes(date, location.lat, location.lon)

  // Effective Bortle (increase if city pollution filter is on for non-city locations)
  const effectiveBortle = addCityPollution ? Math.min(location.bortle + 2, 9) : location.bortle

  // Factor 1: KP strength (most important)
  const kpScore = Math.min(kp / 7, 1)
  const kpStatus: 'good' | 'ok' | 'bad' = kp >= 5 ? 'good' : kp >= 3 ? 'ok' : 'bad'
  const kpDetail = kp >= 7 ? 'Extrémní bouře – záře viditelná i z měst'
    : kp >= 5 ? 'Silná bouře – viditelná pouhým okem z ČR'
    : kp >= 4 ? 'Střední aktivita – možná na severním obzoru'
    : kp >= 3 ? 'Slabá aktivita – pouze fotograficky'
    : 'Klidné podmínky – záře z ČR nepravděpodobná'

  // Factor 2: Sky darkness
  const darknessScore = sun.darkness
  const darknessStatus: 'good' | 'ok' | 'bad' = darknessScore >= 0.8 ? 'good' : darknessScore >= 0.4 ? 'ok' : 'bad'
  const sunAltText = sun.altitude > 0
    ? `Slunce ${sun.altitude.toFixed(1)}° nad obzorem`
    : `Slunce ${Math.abs(sun.altitude).toFixed(1)}° pod obzorem`
  const darknessDetail = `${sun.skyState} • ${sunAltText}`

  // Factor 3: Moon interference
  const moonScore = 1 - moon.interference
  const moonStatus: 'good' | 'ok' | 'bad' = moonScore >= 0.7 ? 'good' : moonScore >= 0.4 ? 'ok' : 'bad'
  const moonDetail = `${moon.phase} • svítivost ${Math.round(moon.illumination * 100)}%`

  // Factor 4: Light pollution
  const bortleScore = Math.max(0, (9 - effectiveBortle) / 8)
  const bortleStatus: 'good' | 'ok' | 'bad' = effectiveBortle <= 4 ? 'good' : effectiveBortle <= 6 ? 'ok' : 'bad'
  const bortleDetail = `Bortle ${effectiveBortle} • ${location.lightPollution} světelné znečištění`

  // Factor 5: Northern horizon
  const northScore = 1 - location.northHorizonBlock
  const northStatus: 'good' | 'ok' | 'bad' = northScore >= 0.8 ? 'good' : northScore >= 0.5 ? 'ok' : 'bad'
  const blockPct = Math.round(location.northHorizonBlock * 100)
  const northDetail = blockPct <= 15 ? 'Volný severní obzor'
    : blockPct <= 30 ? 'Mírné překážky na severním obzoru'
    : blockPct <= 50 ? 'Částečně zastíněný severní obzor'
    : 'Severní obzor značně zastíněn (město, terén)'

  // Sunset info
  let sunTimesText = ''
  if (sunTimes.sunset) {
    const fmt = (d: Date) => d.toLocaleTimeString('cs-CZ', { timeZone: 'Europe/Prague', hour: '2-digit', minute: '2-digit' })
    sunTimesText = sunTimes.sunset ? `Západ ${fmt(sunTimes.sunset)}` : ''
    if (sunTimes.astronomicalDusk) sunTimesText += ` • Astro. soumrak ${fmt(sunTimes.astronomicalDusk)}`
  }

  const factors: ObservingFactor[] = [
    { name: 'Geomagnetická aktivita', icon: '⚡', value: `KP ${kp.toFixed(1)}`, score: kpScore, detail: kpDetail, status: kpStatus },
    { name: 'Tma oblohy', icon: sun.skyIcon, value: sun.skyState, score: darknessScore, detail: darknessDetail + (sunTimesText ? ` • ${sunTimesText}` : ''), status: darknessStatus },
    { name: 'Měsíc', icon: moon.icon, value: `${Math.round(moon.illumination * 100)}%`, score: moonScore, detail: moonDetail, status: moonStatus },
    { name: 'Světelné znečištění', icon: '💡', value: `Bortle ${effectiveBortle}`, score: bortleScore, detail: bortleDetail, status: bortleStatus },
    { name: 'Severní obzor', icon: '🧭', value: blockPct <= 20 ? 'Volný' : blockPct <= 50 ? 'Částečný' : 'Zastíněný', score: northScore, detail: northDetail, status: northStatus },
  ]

  // Weighted overall score
  const weights = [0.35, 0.25, 0.15, 0.15, 0.10]
  const totalScore = Math.round(
    factors.reduce((acc, f, i) => acc + f.score * weights[i], 0) * 100
  )

  let rating: ObservingConditions['rating']
  let ratingColor: string
  if (totalScore >= 80) { rating = 'Vynikající'; ratingColor = '#00ffaa' }
  else if (totalScore >= 65) { rating = 'Velmi dobré'; ratingColor = '#88ff44' }
  else if (totalScore >= 50) { rating = 'Dobré'; ratingColor = '#ffa500' }
  else if (totalScore >= 35) { rating = 'Průměrné'; ratingColor = '#ff8c00' }
  else if (totalScore >= 15) { rating = 'Špatné'; ratingColor = '#ff3d9a' }
  else { rating = 'Nemožné'; ratingColor = '#4a6080' }

  const photoRec = getPhotoRecommendation(kp, effectiveBortle, darknessScore, moon.illumination)

  return { score: totalScore, rating, ratingColor, factors, photoRec }
}

// ── PHOTO RECOMMENDATIONS ───────────────────────────────────────────────────

function getPhotoRecommendation(
  kp: number,
  bortle: number,
  darkness: number,
  moonIllum: number,
): PhotoRecommendation {
  if (darkness < 0.3) {
    return {
      possible: false,
      iso: '-', shutter: '-', aperture: '-', focalLength: '-',
      tips: ['Počkej na astronomický soumrak nebo noc', 'Slunce je příliš vysoko pro jakoukoliv detekci záře'],
    }
  }

  if (kp < 2) {
    return {
      possible: false,
      iso: '-', shutter: '-', aperture: '-', focalLength: '-',
      tips: ['KP index je příliš nízký pro viditelnou záři z ČR', 'Sleduj předpověď — podmínky se mohou změnit'],
    }
  }

  const tips: string[] = []

  // Base settings depend on KP and light conditions
  let iso: string
  let shutter: string
  let aperture = 'f/2.8 nebo nižší'
  let focalLength = '14–24mm (širokoúhlý)'

  if (kp >= 7) {
    iso = 'ISO 800–1600'
    shutter = '3–8s'
    tips.push('Silná záře — kratší expozice, aby se zachovaly detaily')
    tips.push('Záře může být viditelná i z okraje měst')
  } else if (kp >= 5) {
    iso = 'ISO 1600–3200'
    shutter = '8–15s'
    tips.push('Dobrá šance na zachycení záře pouhým okem')
    tips.push('Zamiř na sever, ideálně 10–30° nad obzorem')
  } else if (kp >= 4) {
    iso = 'ISO 3200–6400'
    shutter = '15–25s'
    tips.push('Záře bude slabá — dlouhá expozice je klíčová')
    tips.push('Focení ze stativu, nejlépe s dálkovou spouští')
  } else {
    iso = 'ISO 6400+'
    shutter = '20–30s'
    tips.push('Pouze fotograficky zaznamenatelná záře')
    tips.push('Maximální expozice, minimální clona')
  }

  if (bortle >= 7) {
    tips.push('Vysoké světelné znečištění — jeď mimo město pro lepší výsledky')
    tips.push('Použij anti-light-pollution filtr na objektivu')
  } else if (bortle >= 5) {
    tips.push('Střední světelné znečištění — zorné pole směrem od města')
  }

  if (moonIllum > 0.6) {
    tips.push(`Měsíc svítí na ${Math.round(moonIllum * 100)}% — foť směrem od měsíce`)
    tips.push('Zvyš kontrast v postprocesu pro vylepšení záře')
  }

  tips.push('Vypni stabilizaci objektivu (na stativu)')
  tips.push('Foť v RAW pro maximální postprodukční možnosti')

  return { possible: true, iso, shutter, aperture, focalLength, tips }
}
