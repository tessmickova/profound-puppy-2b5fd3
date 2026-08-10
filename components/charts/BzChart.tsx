'use client'
// components/charts/BzChart.tsx — Single Bz line that changes color at zero + expert duration zones
import { useMemo } from 'react'
import { ResponsiveContainer, ComposedChart, Area, Line, XAxis, YAxis, Tooltip, ReferenceLine, ReferenceDot, ReferenceArea } from 'recharts'
import type { SolarWindPoint } from '@/lib/noaa'

interface Props {
  data: SolarWindPoint[]
}

function StationDot({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={8} fill="rgba(0,212,255,0.15)" />
      <circle cx={cx} cy={cy} r={4} fill="#00d4ff" stroke="#030810" strokeWidth={1.5} />
      <text x={cx} y={cy - 12} textAnchor="middle" fill="#00d4ff" fontSize={9} fontFamily="monospace" fontWeight="600">🛰️ L1</text>
    </g>
  )
}

function EarthDot({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={8} fill="rgba(0,255,170,0.12)" />
      <circle cx={cx} cy={cy} r={4} fill="#00ffaa" stroke="#030810" strokeWidth={1.5} />
      <text x={cx} y={cy - 12} textAnchor="middle" fill="#00ffaa" fontSize={9} fontFamily="monospace" fontWeight="600">🌍</text>
    </g>
  )
}

/** Find sustained Bz-south periods for expert analysis zones */
function findSouthPeriods(data: { time: string; bz: number }[]): { startTime: string; endTime: string; minBz: number; minutes: number; label: string; color: string }[] {
  const periods: { startTime: string; endTime: string; minBz: number; minutes: number; label: string; color: string }[] = []
  let periodStart = -1
  let gapCount = 0

  for (let i = 0; i < data.length; i++) {
    if (data[i].bz < 0) {
      if (periodStart === -1) periodStart = i
      gapCount = 0
    } else {
      if (periodStart !== -1) {
        gapCount++
        if (gapCount > 3) {
          const endIdx = i - gapCount
          const minutes = endIdx - periodStart + 1
          if (minutes >= 15) {
            const slice = data.slice(periodStart, endIdx + 1)
            const minBz = Math.min(...slice.map(d => d.bz))
            let label = ''
            let color = 'rgba(0,212,255,0.06)'
            if (minutes >= 60) { label = `${minutes}′ silná`; color = 'rgba(0,255,170,0.12)' }
            else if (minutes >= 30) { label = `${minutes}′ dobrá`; color = 'rgba(0,212,255,0.10)' }
            else { label = `${minutes}′`; color = 'rgba(100,200,255,0.06)' }
            periods.push({ startTime: data[periodStart].time, endTime: data[endIdx].time, minBz, minutes, label, color })
          }
          periodStart = -1
          gapCount = 0
        }
      }
    }
  }
  // Handle trailing period
  if (periodStart !== -1) {
    const endIdx = data.length - 1
    const minutes = endIdx - periodStart + 1
    if (minutes >= 15) {
      const slice = data.slice(periodStart, endIdx + 1)
      const minBz = Math.min(...slice.map(d => d.bz))
      let label = ''
      let color = 'rgba(0,212,255,0.06)'
      if (minutes >= 60) { label = `${minutes}′ ⚡`; color = 'rgba(0,255,170,0.12)' }
      else if (minutes >= 30) { label = `${minutes}′ 🟡`; color = 'rgba(0,212,255,0.10)' }
      else { label = `${minutes}′`; color = 'rgba(100,200,255,0.06)' }
      periods.push({ startTime: data[periodStart].time, endTime: data[endIdx].time, minBz, minutes, label, color })
    }
  }
  return periods
}

interface BzEventBadge {
  time: string
  label: string
  color: string
  detail: string
}

export function BzChart({ data }: Props) {
  const chartData = useMemo(() => data.map(p => ({
    time: new Date(p.time_tag).toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' }),
    fullTime: new Date(p.time_tag).toLocaleString('cs-CZ', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
    bz: p.bz,
    // For area fill: separate pos/neg for gradient fills
    bzFillPos: p.bz >= 0 ? p.bz : 0,
    bzFillNeg: p.bz < 0 ? p.bz : 0,
  })), [data])

  const southPeriods = useMemo(() => findSouthPeriods(chartData), [chartData])

  const latestBz = chartData.at(-1)?.bz ?? 0
  const latestIdx = chartData.length - 1
  const earthIdx = chartData.length > 6 ? chartData.length - 6 : (chartData.length > 3 ? chartData.length - 3 : null)

  // Detekce klíčových jevů v Bz datech
  const bzEvents = useMemo((): BzEventBadge[] => {
    if (chartData.length < 3) return []
    const badges: BzEventBadge[] = []
    const seen = new Set<string>()

    // Najdi nejhlubší Bz propad
    let minBzIdx = 0
    for (let i = 1; i < chartData.length; i++) {
      if (chartData[i].bz < chartData[minBzIdx].bz) minBzIdx = i
    }
    const minBz = chartData[minBzIdx].bz
    if (minBz < -5) {
      badges.push({
        time: chartData[minBzIdx].fullTime,
        label: `Min Bz ${minBz.toFixed(0)} nT`,
        color: minBz < -15 ? '#a855f7' : minBz < -10 ? '#ff3d9a' : '#00ffaa',
        detail: minBz < -15 ? 'Extrémní jižní Bz — otevřená magnetosféra' : minBz < -10 ? 'Silně jižní — ideální pro záři' : 'Mírně jižní — šance pro foto',
      })
    }

    // Detekuj přechody z + do -
    for (let i = 1; i < chartData.length; i++) {
      if (chartData[i - 1].bz > 1 && chartData[i].bz < -2 && !seen.has('reversal')) {
        badges.push({
          time: chartData[i].fullTime,
          label: 'Bz otočka → jih',
          color: '#00d4ff',
          detail: 'Přechod na jižní Bz — magnetosféra se otevírá',
        })
        seen.add('reversal')
      }
      if (chartData[i - 1].bz < -2 && chartData[i].bz > 1 && !seen.has('reversal-north')) {
        badges.push({
          time: chartData[i].fullTime,
          label: 'Bz otočka → sever',
          color: '#64748b',
          detail: 'Přechod na severní Bz — magnetosféra se zavírá',
        })
        seen.add('reversal-north')
      }
    }

    // Nejdelší jižní perioda
    if (southPeriods.length > 0) {
      const longest = southPeriods.reduce((a, b) => a.minutes > b.minutes ? a : b)
      if (longest.minutes >= 20) {
        badges.push({
          time: longest.startTime,
          label: `Jižní ${longest.minutes}′ (min ${longest.minBz.toFixed(0)} nT)`,
          color: longest.minutes >= 60 ? '#00ffaa' : '#00d4ff',
          detail: longest.minutes >= 60 ? 'Dlouhá aktivace — ideální pro záři na 50°N' : 'Dobrá perioda — sledujte vývoj',
        })
      }
    }

    return badges.slice(0, 4)
  }, [chartData, southPeriods])

  // Expert summary
  const longestSouth = southPeriods.length > 0 ? Math.max(...southPeriods.map(p => p.minutes)) : 0
  let expertText = ''
  if (longestSouth >= 60) expertText = `⚡ Silná aktivace: Bz jižně ${longestSouth}+ min — ideální pro záři na 50°N`
  else if (longestSouth >= 30) expertText = `🟡 Dobrá aktivace: ${longestSouth} min jižního Bz — šance na focení`
  else if (longestSouth >= 15) expertText = `Krátké periody jižního Bz (${longestSouth} min) — pozorujte vývoj`
  else if (latestBz < 0) expertText = 'Bz krátkodobě záporné — zatím bez dostatečné doby trvání'
  else expertText = 'Bz v plusu — magnetosféra uzavřena'

  return (
    <div className="bg-[#04101e]/90 border border-white/[0.08] rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs font-mono tracking-[2px] text-slate-400 uppercase">Bz složka (IMF)</div>
        <div className="flex items-center gap-2">
          <span className={`font-mono text-sm font-semibold ${latestBz < -5 ? 'text-aurora-green' : latestBz < 0 ? 'text-aurora-teal' : 'text-slate-400'}`}>
            {latestBz.toFixed(1)} nT
          </span>
          {latestBz < -5 && (
            <span className="text-[9px] bg-aurora-green/10 text-aurora-green px-1.5 py-0.5 rounded border border-aurora-green/20">
              záporná = záře
            </span>
          )}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={170}>
        <ComposedChart data={chartData}>
          <defs>
            <linearGradient id="bzGradPos" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#64748b" stopOpacity={0.15} />
              <stop offset="100%" stopColor="#64748b" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="bzGradNeg" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#00ffaa" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#00ffaa" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="time"
            tick={{ fill: '#6b8aad', fontSize: 10 }}
            axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fill: '#6b8aad', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            width={35}
          />
          <Tooltip
            contentStyle={{ background: '#04101e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }}
            labelStyle={{ color: '#64748b' }}
            // Recharts 3 predava hodnotu jako `ValueType | undefined`,
            // takze si ji musime overit sami — driv byla typovana jako
            // `number` a `toFixed` se volalo naslepo.
            formatter={(v, name) => {
              if (name === 'bzFillPos' || name === 'bzFillNeg') return null
              return typeof v === 'number' ? [`${v.toFixed(1)} nT`, 'Bz'] : null
            }}
          />
          {/* Zero reference line */}
          <ReferenceLine y={0} stroke="rgba(255,255,255,0.15)" strokeDasharray="3 3" />
          {/* -5 nT threshold for aurora */}
          <ReferenceLine y={-5} stroke="rgba(0,255,170,0.3)" strokeDasharray="4 4" label={{ value: '-5 nT', position: 'left', fill: '#00ffaa', fontSize: 9 }} />

          {/* Expert analysis zones — sustained Bz south periods */}
          {southPeriods.map((p, i) => (
            <ReferenceArea
              key={i}
              x1={p.startTime}
              x2={p.endTime}
              fill={p.color}
              label={{ value: p.label, position: 'insideTop', fill: 'rgba(255,255,255,0.3)', fontSize: 8 }}
            />
          ))}

          {/* Gradient fills */}
          <Area type="monotone" dataKey="bzFillPos" stroke="none" fill="url(#bzGradPos)" isAnimationActive={false} />
          <Area type="monotone" dataKey="bzFillNeg" stroke="none" fill="url(#bzGradNeg)" isAnimationActive={false} />

          {/* Single Bz line — color changes per segment via stroke coloring */}
          <Line
            type="monotone"
            dataKey="bz"
            stroke={latestBz < 0 ? '#00ffaa' : '#64748b'}
            strokeWidth={2}
            dot={(props: any) => {
              const { cx, cy, payload, index } = props
              if (!payload || index === undefined) return <g key={index} />
              const color = payload.bz < 0 ? '#00ffaa' : '#64748b'
              // Only show dots at color boundaries
              if (index > 0 && chartData[index - 1]) {
                const prevSign = chartData[index - 1].bz < 0
                const curSign = payload.bz < 0
                if (prevSign !== curSign) {
                  return <circle key={index} cx={cx} cy={cy} r={3} fill={color} stroke="#030810" strokeWidth={1} />
                }
              }
              return <g key={index} />
            }}
            activeDot={{ r: 3, fill: latestBz < 0 ? '#00ffaa' : '#64748b' }}
            isAnimationActive={false}
          />
          {latestIdx >= 0 && chartData[latestIdx] && (
            <ReferenceDot
              x={chartData[latestIdx].time}
              y={chartData[latestIdx].bz}
              shape={(props: any) => <StationDot cx={props.cx} cy={props.cy} />}
            />
          )}
          {earthIdx != null && chartData[earthIdx] && (
            <ReferenceDot
              x={chartData[earthIdx].time}
              y={chartData[earthIdx].bz}
              shape={(props: any) => <EarthDot cx={props.cx} cy={props.cy} />}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
      {/* Expert analysis text */}
      <div className="mt-2 px-1">
        <p className="text-[11px] font-mono text-slate-400 leading-relaxed">{expertText}</p>
      </div>
      {bzEvents.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {bzEvents.map((e, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 text-[9px] font-mono px-2 py-0.5 rounded-md border"
              style={{ color: e.color, borderColor: `${e.color}33`, backgroundColor: `${e.color}0d` }}
              title={`${e.time} — ${e.detail}`}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: e.color }} />
              {e.time} {e.label}
            </span>
          ))}
        </div>
      )}
      <div className="flex items-center gap-4 text-[10px] font-mono text-slate-500 mt-1.5">
        <span><span className="inline-block w-3 h-0.5 bg-slate-500 mr-1 align-middle" /> Bz+ (sever)</span>
        <span><span className="inline-block w-3 h-0.5 bg-aurora-green mr-1 align-middle" /> Bz− (jih = záře)</span>
        <span className="ml-auto">🛰️ L1 • 🌍 ~{chartData.length > 6 ? '30-60' : '?'} min zpoždění</span>
      </div>
    </div>
  )
}
