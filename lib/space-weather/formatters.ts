// lib/space-weather/formatters.ts

const CZ_TZ = 'Europe/Prague'

// ── CZECH LOCAL TIME (PRIMARY) ────────────────────────────────────────────────

/** Format to Czech local time: "15:40 SEČ" */
export function formatCzTime(iso: string | null): string {
  if (!iso) return '–'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return '–'
  return d.toLocaleTimeString('cs-CZ', { timeZone: CZ_TZ, hour: '2-digit', minute: '2-digit' }) + ' SEČ'
}

/** Format to Czech local datetime: "10. bře 15:40 SEČ" */
export function formatCzDateTime(iso: string | null): string {
  if (!iso) return '–'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return '–'
  return d.toLocaleDateString('cs-CZ', {
    timeZone: CZ_TZ, day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  }) + ' SEČ'
}

/** Format both Czech and UTC: primary + secondary */
export function formatDualTime(iso: string | null): { cz: string; utc: string } {
  if (!iso) return { cz: '–', utc: '–' }
  const d = new Date(iso)
  if (isNaN(d.getTime())) return { cz: '–', utc: '–' }
  return {
    cz:  d.toLocaleTimeString('cs-CZ', { timeZone: CZ_TZ, hour: '2-digit', minute: '2-digit' }) + ' SEČ',
    utc: d.toLocaleTimeString('cs-CZ', { timeZone: 'UTC', hour: '2-digit', minute: '2-digit' }) + ' UTC',
  }
}

// ── UTC FORMATTERS ────────────────────────────────────────────────────────────

/** Format UTC datetime string to a friendly localized format */
export function formatUtcDateTime(iso: string | null): string {
  if (!iso) return '–'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return '–'
  return d.toLocaleDateString('cs-CZ', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  }) + ' UTC'
}

/** Format UTC time only */
export function formatUtcTime(iso: string | null): string {
  if (!iso) return '–'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return '–'
  return d.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' }) + ' UTC'
}

/** Format date only */
export function formatDate(iso: string | null): string {
  if (!iso) return '–'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return '–'
  return d.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short' })
}

/** Format active region number: 14373 → "AR14373" */
export function formatActiveRegion(num: number | null): string {
  if (num == null) return '–'
  return `AR${num}`
}

/** Truncate text with ellipsis */
export function truncateText(text: string, maxLength = 120): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trimEnd() + '…'
}

/** Format lat/lon: (22, -41) → "lat 22°, lon -41°" */
export function formatLatLon(lat: number | null, lon: number | null): string {
  if (lat == null && lon == null) return '–'
  const parts: string[] = []
  if (lat != null) parts.push(`lat ${lat}°`)
  if (lon != null) parts.push(`lon ${lon}°`)
  return parts.join(', ')
}

/** Format speed: 332 → "332 km/s" */
export function formatSpeed(speed: number | null): string {
  if (speed == null) return '–'
  return `${Math.round(speed)} km/s`
}

/** Format KP index: 5.3 → "KP 5.3" */
export function formatKp(kp: number | null): string {
  if (kp == null) return '–'
  return `KP ${kp.toFixed(1)}`
}

/** Extract max KP from an array of { kpIndex } */
export function extractMaxKp(entries: { kpIndex: number }[]): number | null {
  if (!entries || entries.length === 0) return null
  return Math.max(...entries.map(e => e.kpIndex))
}
