'use client'
// app/admin/page.tsx — Admin diagnostics page
// Accessible at /admin — shows all thresholds, algorithms, and live computed values

import { useMemo } from 'react'
import { useAuroraData } from '@/lib/hooks/useAuroraData'
import { deriveSpaceWeatherState } from '@/lib/space-weather/hero/deriveSpaceWeatherState'
import { AURORA_LIKELIHOOD_LABELS, kpToGScale } from '@/lib/space-weather/hero/types'
import { deriveVisibility, VISIBILITY_INFO } from '@/lib/noaa'
import { getMoonInfo, getSunPosition, calculateObservingConditions, CZ_LOCATIONS } from '@/lib/astronomy'
import { HuskyLogo } from '@/components/HuskyLogo'

export default function AdminPage() {
  const { data, isLoading, kp, bz, swSpeed, cme, flares, donki, fetchedAt, cacheSource } = useAuroraData()
  const hero = useMemo(() => deriveSpaceWeatherState(data ?? null), [data])
  const now = useMemo(() => new Date(), [])
  const moon = useMemo(() => getMoonInfo(now), [now])
  const sun = useMemo(() => getSunPosition(now, 50.0755, 14.4378), [now])

  // Calculate observing conditions for a few representative locations
  const pragueCond = useMemo(() => calculateObservingConditions(kp, CZ_LOCATIONS[0], now), [kp, now])
  const jizeraCond = useMemo(() => {
    const jizera = CZ_LOCATIONS.find(l => l.name.includes('Jizerská'))
    return jizera ? calculateObservingConditions(kp, jizera, now) : null
  }, [kp, now])

  const vis = deriveVisibility({ kp, bz: data?.solarWind?.bz ?? null, swSpeed: data?.solarWind?.speed ?? null, hpi: data?.hpiCurrent ?? null, hasCmeImpact: (data?.cme ?? []).some(c => c.earthImpact), darkness: sun.darkness, moonIllumination: moon.illumination })
  const visInfo = VISIBILITY_INFO[vis]
  const auroraInfo = AURORA_LIKELIHOOD_LABELS[hero.auroraLikelihood]
  const gScale = kpToGScale(kp)

  if (isLoading && !data) {
    return (
      <main className="min-h-screen bg-[#03080f] text-slate-100 font-head">
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_40%_at_50%_-10%,rgba(0,200,120,0.06)_0%,transparent_70%)]" />
        </div>
        <nav className="sticky top-0 z-50 bg-[#03080f]/90 backdrop-blur-xl border-b border-white/5">
          <div className="max-w-6xl mx-auto px-4 h-14 flex items-center">
            <a href="/" className="flex items-center gap-2 no-underline">
              <HuskyLogo size={28} />
              <span className="font-display text-base font-black tracking-widest bg-gradient-to-r from-aurora-green to-aurora-teal bg-clip-text text-transparent">
                AURORADOG
              </span>
            </a>
          </div>
        </nav>
        <div className="relative z-10 max-w-6xl mx-auto px-4 py-20 text-center">
          <div className="inline-block w-6 h-6 border-2 border-aurora-teal/30 border-t-aurora-teal rounded-full animate-spin" />
          <p className="text-slate-400 mt-4 text-sm">Načítání dat…</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#03080f] text-slate-100 font-head">
      {/* ── Aurora background ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_40%_at_50%_-10%,rgba(100,0,200,0.05)_0%,transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_30%_at_20%_10%,rgba(255,61,154,0.03)_0%,transparent_60%)]" />
      </div>

      {/* ── NAV ── */}
      <nav className="sticky top-0 z-50 bg-[#03080f]/90 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-4">
          <a href="/" className="flex items-center gap-2 no-underline">
            <HuskyLogo size={28} />
            <span className="font-display text-base font-black tracking-widest bg-gradient-to-r from-aurora-green to-aurora-teal bg-clip-text text-transparent">
              AURORADOG
            </span>
          </a>
          <div className="flex gap-1 ml-4">
            <a href="/docs" className="px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent transition-all">
              📖 Slovníček
            </a>
            <span className="px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide bg-aurora-pink/10 border border-aurora-pink/30 text-aurora-pink">
              🔧 Admin
            </span>
          </div>
          <a href="/" className="ml-auto text-xs font-mono text-slate-400 hover:text-aurora-teal transition-colors">
            ← Dashboard
          </a>
        </div>
      </nav>

      {/* ── CONTENT ── */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="font-display text-2xl md:text-3xl font-black tracking-tight bg-gradient-to-r from-aurora-pink to-aurora-purple bg-clip-text text-transparent mb-2">
            🔧 Admin Diagnostics
          </h1>
          <p className="text-sm text-slate-400">
            Interní přehled algoritmů, prahů a aktuálních výpočtů. Pro validaci správnosti rozhodovací logiky.
          </p>
        </header>

        {/* ── Data Source ── */}
        <AdminSection title="📡 Zdroj dat" id="source">
          <KV label="Zdroj" value={cacheSource ?? '–'} />
          <KV label="Načteno" value={fetchedAt ? new Date(fetchedAt).toLocaleString('cs-CZ', { timeZone: 'Europe/Prague' }) : '–'} />
          <KV label="API URL" value="/api/aurora-data" />
          <KV label="Cache TTL" value="60s (LIVE_DATA_REVALIDATE_SEC)" />
          <KV label="SWR refresh" value="60s, 3 retries, 5s interval" />
          <KV label="NOAA timeout" value="8s (AbortController)" />
          <KV label="NASA timeout" value="10s (AbortController)" />
          <KV label="Fallback" value="cache → fresh → stale → 503" />
        </AdminSection>

        {/* ── Current Raw Values ── */}
        <AdminSection title="📊 Aktuální surová data (NOAA/NASA)" id="raw">
          <KV label="KP index" value={kp.toFixed(2)} highlight={kp >= 4} />
          <KV label="Bz (nT)" value={bz?.toFixed(2) ?? 'null'} highlight={(bz ?? 0) < -5} />
          <KV label="Sluneční vítr (km/s)" value={swSpeed?.toFixed(0) ?? 'null'} highlight={(swSpeed ?? 0) > 500} />
          <KV label="Hustota (/cm³)" value={data?.solarWind?.density?.toFixed(2) ?? 'null'} />
          <KV label="Bt (nT)" value={data?.solarWind?.bt?.toFixed(2) ?? 'null'} />
          <KV label="CME událostí (7d)" value={String(cme.length)} />
          <KV label="Erupcí (7d)" value={String(flares.length)} />
          <KV label="DONKI CME" value={String(donki?.cmes?.length ?? 0)} />
          <KV label="DONKI příjezdy" value={String(donki?.arrivals?.length ?? 0)} />
          <KV label="DONKI bouře" value={String(donki?.storms?.length ?? 0)} />
          {donki?.arrivals?.[0] && (
            <KV label="Nejbližší dopad CME" value={donki.arrivals[0].arrivalTime} highlight />
          )}
          {donki?.cmes?.[0] && (
            <>
              <KV label="Poslední CME start" value={donki.cmes[0].startTime} />
              <KV label="CME rychlost" value={donki.cmes[0].analysis?.speed != null ? `${donki.cmes[0].analysis.speed} km/s` : 'null'} />
              <KV label="CME typ" value={donki.cmes[0].analysis?.type ?? 'null'} />
            </>
          )}
          {flares[0] && (
            <KV label="Poslední erupce" value={`${flares[0].classType} @ ${flares[0].beginTime}`} />
          )}
        </AdminSection>

        {/* ── State Machine ── */}
        <AdminSection title="🧠 Stavový automat (deriveSpaceWeatherState)" id="state">
          <KV label="Výsledný stav" value={hero.state} highlight />
          <KV label="Aurora likelihood" value={`${hero.auroraLikelihood} — "${auroraInfo.label}"`} highlight={hero.auroraLikelihood !== 'none'} />
          <KV label="G-škála" value={`G${gScale}`} highlight={gScale > 0} />
          <KV label="Viditelnost ČR" value={`${vis} — "${visInfo.label}"`} />
          <KV label="Aktivní fáze" value={hero.activeStages.join(', ') || 'žádné'} />
          <KV label="Intenzita (0–1)" value={hero.intensity.toFixed(3)} />
          <KV label="Transit progress (0–1)" value={hero.transitProgress.toFixed(3)} />

          <h4 className="text-sm font-mono text-aurora-purple mt-4 mb-2">Rozhodovací logika (priorita shora dolů):</h4>
          <ThresholdTable rows={[
            { condition: 'KP ≥ 7 || (KP ≥ 6 && Bz < -10)', result: 'very_likely → AURORA_LIKELY_CZ', met: kp >= 7 || (kp >= 6 && (bz ?? 0) < -10) },
            { condition: 'KP ≥ 5 || (KP ≥ 4 && Bz < -8)', result: 'likely → AURORA_POSSIBLE_CZ', met: kp >= 5 || (kp >= 4 && (bz ?? 0) < -8) },
            { condition: 'KP ≥ 4 || (Bz < -5 && Wind > 500)', result: 'possible → AURORA_POSSIBLE_CZ', met: kp >= 4 || ((bz ?? 0) < -5 && (swSpeed ?? 0) > 500) },
            { condition: 'KP ≥ 5 || (KP ≥ 4 && Bz < -5)', result: 'MAGNETOSPHERE_ACTIVE', met: kp >= 5 || (kp >= 4 && (bz ?? 0) < -5) },
            { condition: 'Wind > 450 && Bz < -3', result: 'L1_IMPACT_IMMINENT', met: (swSpeed ?? 0) > 450 && (bz ?? 0) < -3 },
            { condition: 'CME arrival predicted < 48h', result: 'IN_TRANSIT', met: !!donki?.arrivals?.[0] && new Date(donki.arrivals[0].arrivalTime).getTime() > Date.now() && new Date(donki.arrivals[0].arrivalTime).getTime() - Date.now() < 48 * 3600_000 },
            { condition: 'CME type S or C', result: 'EARTH_DIRECTED_CME', met: !!donki?.cmes?.find(c => c.analysis?.type === 'S' || c.analysis?.type === 'C') },
            { condition: 'Flares or CME exist', result: 'SOLAR_EVENT_DETECTED', met: (flares.length > 0 || (donki?.cmes?.length ?? 0) > 0) },
            { condition: 'Default', result: 'QUIET', met: hero.state === 'QUIET' },
          ]} />
        </AdminSection>

        {/* ── Intensity Calculation ── */}
        <AdminSection title="📐 Výpočet intenzity" id="intensity">
          <KV label="kpNorm = min(KP/9, 1)" value={Math.min(kp / 9, 1).toFixed(4)} />
          <KV label="bzNorm = min(max(-Bz/20, 0), 1)" value={Math.min(Math.max(-(bz ?? 0) / 20, 0), 1).toFixed(4)} />
          <KV label="swNorm = min(max((Speed-300)/700, 0), 1)" value={Math.min(Math.max(((swSpeed ?? 300) - 300) / 700, 0), 1).toFixed(4)} />
          <KV label="Vzorec" value="kpNorm×0.5 + bzNorm×0.3 + swNorm×0.2" />
          <KV label="Výsledek" value={hero.intensity.toFixed(4)} highlight />
        </AdminSection>

        {/* ── Visibility Thresholds ── */}
        <AdminSection title="👁 Stupnice viditelnosti — prahy" id="visibility">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 border-b border-white/[0.06]">
                <th className="py-2">Úroveň</th>
                <th>Label</th>
                <th>Barva</th>
                <th>Aktivní?</th>
              </tr>
            </thead>
            <tbody>
              {(['none', 'photo_weak', 'photo_medium', 'photo_strong', 'eye_weak', 'eye_strong'] as const).map(level => {
                const info = VISIBILITY_INFO[level]
                return (
                  <tr key={level} className={`border-b border-white/[0.04] ${level === vis ? 'bg-white/[0.03]' : ''}`}>
                    <td className="py-1.5 font-mono">{info.icon} {level}</td>
                    <td>{info.label}</td>
                    <td><span className="inline-block w-3 h-3 rounded-full mr-1" style={{ backgroundColor: info.color }} /> {info.color}</td>
                    <td>{level === vis ? '✅ ANO' : '—'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </AdminSection>

        {/* ── Aurora Likelihood Thresholds ── */}
        <AdminSection title="🇨🇿 Aurora Likelihood — prahy" id="aurora">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 border-b border-white/[0.06]">
                <th className="py-2">Úroveň</th>
                <th>Podmínka</th>
                <th>Label</th>
                <th>Barva</th>
                <th>Aktivní?</th>
              </tr>
            </thead>
            <tbody>
              {([
                { level: 'very_likely', cond: 'KP ≥ 7 || (KP ≥ 6 && Bz < -10)' },
                { level: 'likely', cond: 'KP ≥ 5 || (KP ≥ 4 && Bz < -8)' },
                { level: 'possible', cond: 'KP ≥ 4 || (Bz < -5 && Wind > 500)' },
                { level: 'unlikely', cond: 'KP ≥ 3 || Bz < -3' },
                { level: 'none', cond: 'default' },
              ] as const).map(({ level, cond }) => {
                const info = AURORA_LIKELIHOOD_LABELS[level]
                return (
                  <tr key={level} className={`border-b border-white/[0.04] ${level === hero.auroraLikelihood ? 'bg-white/[0.03]' : ''}`}>
                    <td className="py-1.5 font-mono">{level}</td>
                    <td className="font-mono text-xs">{cond}</td>
                    <td>{info.label}</td>
                    <td><span className="inline-block w-3 h-3 rounded-full mr-1" style={{ backgroundColor: info.color }} /> {info.color}</td>
                    <td>{level === hero.auroraLikelihood ? '✅ ANO' : '—'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </AdminSection>

        {/* ── Observing Conditions ── */}
        <AdminSection title="🔭 Podmínky pozorování — aktuální výpočet" id="observing">
          <h4 className="text-sm font-mono text-aurora-teal mb-2">Astronomické podmínky (Praha, {now.toLocaleTimeString('cs-CZ', { timeZone: 'Europe/Prague' })} SEČ):</h4>
          <KV label="Slunce — výška" value={`${sun.altitude.toFixed(2)}°`} />
          <KV label="Slunce — azimut" value={`${sun.azimuth.toFixed(1)}°`} />
          <KV label="Stav oblohy" value={`${sun.skyState} (${sun.skyIcon})`} />
          <KV label="Tma (0=den, 1=noc)" value={sun.darkness.toFixed(2)} highlight={sun.darkness >= 0.8} />
          <KV label="Měsíc — fáze" value={`${moon.phase} ${moon.icon}`} />
          <KV label="Měsíc — svítivost" value={`${(moon.illumination * 100).toFixed(1)}%`} />
          <KV label="Měsíc — stáří" value={`${moon.age.toFixed(1)} dní`} />
          <KV label="Měsíc — interference" value={moon.interference.toFixed(2)} />

          <h4 className="text-sm font-mono text-aurora-teal mt-4 mb-2">Skóre pozorování — Praha (Bortle 8):</h4>
          <KV label="Celkové skóre" value={`${pragueCond.score}/100 — ${pragueCond.rating}`} highlight />
          {pragueCond.factors.map(f => (
            <KV key={f.name} label={`${f.icon} ${f.name}`} value={`${f.value} | skóre: ${f.score.toFixed(2)} | ${f.status}`} />
          ))}

          {jizeraCond && (
            <>
              <h4 className="text-sm font-mono text-aurora-teal mt-4 mb-2">Skóre pozorování — Jizerská tmavá obloha (Bortle 3):</h4>
              <KV label="Celkové skóre" value={`${jizeraCond.score}/100 — ${jizeraCond.rating}`} highlight />
              {jizeraCond.factors.map(f => (
                <KV key={f.name} label={`${f.icon} ${f.name}`} value={`${f.value} | skóre: ${f.score.toFixed(2)} | ${f.status}`} />
              ))}
            </>
          )}

          <h4 className="text-sm font-mono text-aurora-purple mt-4 mb-2">Váhy faktorů:</h4>
          <KV label="Geomagnetická aktivita (KP)" value="35%" />
          <KV label="Tma oblohy" value="25%" />
          <KV label="Měsíc" value="15%" />
          <KV label="Světelné znečištění" value="15%" />
          <KV label="Severní obzor" value="10%" />

          <h4 className="text-sm font-mono text-aurora-purple mt-4 mb-2">Rating prahy:</h4>
          <KV label="≥ 80" value="Vynikající" />
          <KV label="≥ 65" value="Velmi dobré" />
          <KV label="≥ 50" value="Dobré" />
          <KV label="≥ 35" value="Průměrné" />
          <KV label="≥ 15" value="Špatné" />
          <KV label="< 15" value="Nemožné" />
        </AdminSection>

        {/* ── Narrative ── */}
        <AdminSection title="💬 Aktuální narativ" id="narrative">
          <KV label="now" value={hero.narrative.now} />
          <KV label="next" value={hero.narrative.next} />
          <KV label="forCz" value={hero.narrative.forCz} />
        </AdminSection>

        {/* ── Photo Recommendations ── */}
        <AdminSection title="📷 Doporučení fotografie — prahy" id="photo">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 border-b border-white/[0.06]">
                <th className="py-2">Podmínka</th>
                <th>ISO</th>
                <th>Expozice</th>
                <th>Stav</th>
              </tr>
            </thead>
            <tbody>
              {[
                { cond: 'KP ≥ 7', iso: '800–1600', exp: '3–8s', met: kp >= 7 },
                { cond: 'KP ≥ 5', iso: '1600–3200', exp: '8–15s', met: kp >= 5 && kp < 7 },
                { cond: 'KP ≥ 4', iso: '3200–6400', exp: '15–25s', met: kp >= 4 && kp < 5 },
                { cond: 'KP ≥ 2', iso: '6400+', exp: '20–30s', met: kp >= 2 && kp < 4 },
                { cond: 'KP < 2', iso: '—', exp: '—', met: kp < 2 },
                { cond: 'Darkness < 0.3', iso: '—', exp: '—', met: sun.darkness < 0.3 },
              ].map((r, i) => (
                <tr key={i} className={`border-b border-white/[0.04] ${r.met ? 'bg-white/[0.03]' : ''}`}>
                  <td className="py-1.5 font-mono">{r.cond}</td>
                  <td>{r.iso}</td>
                  <td>{r.exp}</td>
                  <td>{r.met ? '✅ AKTIVNÍ' : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </AdminSection>

        {/* ── Journey Stages ── */}
        <AdminSection title="🗺️ Aktivní fáze cesty (journey stages)" id="stages">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 border-b border-white/[0.06]">
                <th className="py-2">Fáze</th>
                <th>Podmínka</th>
                <th>Aktivní?</th>
              </tr>
            </thead>
            <tbody>
              {[
                { stage: 'sun', cond: 'Flares > 0 || CMEs > 0 v DONKI' },
                { stage: 'transit', cond: 'state = IN_TRANSIT || EARTH_DIRECTED_CME' },
                { stage: 'l1', cond: 'Wind > 400 || Bz < -2' },
                { stage: 'magnetosphere', cond: 'KP ≥ 4 || state = MAGNETOSPHERE_ACTIVE/AURORA_*' },
                { stage: 'earth', cond: 'state = AURORA_POSSIBLE_CZ || AURORA_LIKELY_CZ' },
              ].map(r => (
                <tr key={r.stage} className={`border-b border-white/[0.04] ${hero.activeStages.includes(r.stage as any) ? 'bg-white/[0.03]' : ''}`}>
                  <td className="py-1.5 font-mono">{r.stage}</td>
                  <td className="font-mono text-xs">{r.cond}</td>
                  <td>{hero.activeStages.includes(r.stage as any) ? '✅ ANO' : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </AdminSection>

        {/* ── CZ Locations (sample) ── */}
        <AdminSection title="📍 CZ lokace v databázi" id="locations">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 border-b border-white/[0.06]">
                <th className="py-2">Místo</th>
                <th>Lat/Lon</th>
                <th>Bortle</th>
                <th>Světelné zn.</th>
                <th>Sev. obzor</th>
                <th>Typ</th>
              </tr>
            </thead>
            <tbody>
              {CZ_LOCATIONS.map(loc => (
                <tr key={loc.name} className="border-b border-white/[0.04]">
                  <td className="py-1">{loc.name}</td>
                  <td className="font-mono text-xs">{loc.lat.toFixed(2)}, {loc.lon.toFixed(2)}</td>
                  <td className="font-mono">{loc.bortle}</td>
                  <td>{loc.lightPollution}</td>
                  <td className="font-mono">{(loc.northHorizonBlock * 100).toFixed(0)}%</td>
                  <td>{loc.isCity ? '🏙️' : '🌲'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </AdminSection>

        <div className="mt-12 pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            Admin diagnostics — AuroraDog — data z NOAA SWPC + NASA DONKI
          </p>
          <div className="flex gap-4 text-xs">
            <a href="/" className="text-slate-400 hover:text-aurora-teal transition-colors">Dashboard</a>
            <a href="/docs" className="text-slate-400 hover:text-aurora-teal transition-colors">Docs</a>
          </div>
        </div>
      </div>
    </main>
  )
}

/* ── Helper Components ── */

function AdminSection({ title, id, children }: { title: string; id: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mb-6 bg-[#04101e]/60 border border-white/[0.08] rounded-2xl p-5">
      <h2 className="text-xs font-mono uppercase tracking-[3px] text-aurora-purple/80 mb-4 pb-2 border-b border-white/[0.06] flex items-center gap-3">
        {title} <span className="flex-1 h-px bg-white/8" />
      </h2>
      <div className="space-y-1.5">{children}</div>
    </section>
  )
}

function KV({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 py-0.5">
      <span className="text-sm text-slate-400 shrink-0">{label}</span>
      <span className={`text-sm font-mono text-right break-all ${highlight ? 'text-aurora-green font-bold' : 'text-slate-200'}`}>
        {value}
      </span>
    </div>
  )
}

function ThresholdTable({ rows }: { rows: { condition: string; result: string; met: boolean }[] }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-slate-400 border-b border-white/[0.06]">
          <th className="py-2">Podmínka</th>
          <th>Výsledek</th>
          <th>Splněno?</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} className={`border-b border-white/[0.04] ${r.met ? 'bg-green-500/[0.05]' : ''}`}>
            <td className="py-1.5 font-mono text-xs">{r.condition}</td>
            <td className="font-mono text-xs">{r.result}</td>
            <td>{r.met ? '✅' : '—'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
