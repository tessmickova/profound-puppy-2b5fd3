// lib/space-weather/nasa/types.ts

// ── RAW API RESPONSES ─────────────────────────────────────────────────────────

export interface RawCME {
  activityID:     string
  startTime:      string
  sourceLocation: string | null
  activeRegionNum: number | null
  note:           string
  instruments:    { displayName: string }[]
  link:           string
  cmeAnalyses:    RawCMEAnalysis[] | null
  linkedEvents:   { activityID: string }[] | null
}

export interface RawCMEAnalysis {
  isMostAccurate: boolean
  time21_5:       string | null
  latitude:       number | null
  longitude:      number | null
  halfAngle:      number | null
  speed:          number | null
  type:           string | null
}

export interface RawCMEArrival {
  activityID:   string
  arrivalTime:  string
  linkedEvents: { activityID: string }[] | null
  note:         string | null
  link:         string | null
}

export interface RawFlare {
  flrID:           string
  beginTime:       string
  peakTime:        string | null
  endTime:         string | null
  classType:       string
  sourceLocation:  string | null
  activeRegionNum: number | null
  link:            string
}

export interface RawGST {
  gstID:       string
  startTime:   string
  allKpIndex:  { kpIndex: number; observedTime: string; source: string }[] | null
  link:        string | null
  linkedEvents: { activityID: string }[] | null
}

// ── NORMALIZED UI-FRIENDLY TYPES ──────────────────────────────────────────────

export interface DonkiCME {
  activityID:      string
  startTime:       string
  sourceLocation:  string | null
  activeRegionNum: number | null
  note:            string
  instruments:     string[]
  link:            string
  linkedEventIds:  string[]
  analysis: {
    isMostAccurate: boolean
    time21_5:       string | null
    latitude:       number | null
    longitude:      number | null
    halfAngle:      number | null
    speed:          number | null
    type:           string | null
  } | null
}

export interface DonkiCMEArrival {
  activityID:     string
  arrivalTime:    string
  linkedEventIds: string[]
  note:           string | null
  link:           string | null
}

export interface DonkiFlare {
  id:              string
  beginTime:       string
  peakTime:        string | null
  endTime:         string | null
  classType:       string
  sourceLocation:  string | null
  activeRegionNum: number | null
  link:            string
}

export interface DonkiGST {
  id:        string
  startTime: string
  maxKp:     number | null
  link:      string | null
}

export interface DonkiData {
  cmes:       DonkiCME[]
  arrivals:   DonkiCMEArrival[]
  flares:     DonkiFlare[]
  storms:     DonkiGST[]
  fetchedAt:  string
}
