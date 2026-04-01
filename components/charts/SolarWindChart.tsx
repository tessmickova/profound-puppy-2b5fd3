'use client'
// components/charts/SolarWindChart.tsx
import { useMemo } from 'react'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, ReferenceDot } from 'recharts'
import type { SolarWindPoint } from '@/lib/noaa'

interface Props {
  data: SolarWindPoint[]
  type: 'bz' | 'speed' | 'density'
  label: string
  unit: string
  color: string
  good: (v: number) => boolean
  goodLabel: string
}

interface SwEventBadge {
  time: string
  label: string
  color: string
  detail: string
}

function StationDot({ cx, cy, color }: { cx: number; cy: number; color: string }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={10} fill={`${color}25`} />
      <circle cx={cx} cy={cy} r={5} fill={color} stroke="#030810" strokeWidth={1.5} />
      <text x={cx} y={cy - 14} textAnchor="middle" fill={color} fontSize={10} fontFamily="monospace" fontWeight="600">🛰️ L1</text>
    </g>
  )
}

function EarthDot({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={10} fill="rgba(0,255,170,0.15)" />
      <circle cx={cx} cy={cy} r={5} fill="#00ffaa" stroke="#030810" strokeWidth={1.5} />
      <text x={cx} y={cy - 14} textAnchor="middle" fill="#00ffaa" fontSize={10} fontFamily="monospace" fontWeight="600">🌍 Země</text>
    </g>
  )
}

export function SolarWindChart({ data, type, label, unit, color, good, goodLabel }: Props) {
  const chartData = data.map(p => ({
    time: new Date(p.time_tag).toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' }),
    fullTime: new Date(p.time_tag).toLocaleString('cs-CZ', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
    value: p[type],
  }))

  const latestValue = chartData.at(-1)?.value
  const isGood = latestValue != null && good(latestValue)

  // Detekce jevů
  const events = useMemo((): SwEventBadge[] => {
    if (chartData.length < 3) return []
    const badges: SwEventBadge[] = []
    const seen = new Set<string>()

    if (type === 'speed') {
      // Peak rychlosti
      let maxIdx = 0
      for (let i = 1; i < chartData.length; i++) {
        if (chartData[i].value > chartData[maxIdx].value) maxIdx = i
      }
      const maxV = chartData[maxIdx].value
      if (maxV > 500) {
        badges.push({
          time: chartData[maxIdx].fullTime,
          label: `Max ${Math.round(maxV)} km/s`,
          color: maxV > 700 ? '#ff3d9a' : maxV > 600 ? '#ffa500' : '#00d4ff',
          detail: maxV > 700 ? 'Extrémní vítr — CME dopad' : maxV > 600 ? 'Velmi rychlý vítr — zvýšená šance' : 'Zvýšená rychlost',
        })
      }

      // Náhlý skok rychlosti (shock front)
      for (let i = 1; i < chartData.length; i++) {
        const jump = chartData[i].value - chartData[i - 1].value
        if (jump > 80 && !seen.has('shock')) {
          badges.push({
            time: chartData[i].fullTime,
            label: `Shock +${Math.round(jump)} km/s`,
            color: '#ffa500',
            detail: 'Náhlý skok rychlosti — rázová vlna (shock front)',
          })
          seen.add('shock')
        }
      }

      // HSS / CIR detekce — postupný nárůst
      const firstQuarter = chartData.slice(0, Math.floor(chartData.length / 4))
      const lastQuarter = chartData.slice(-Math.floor(chartData.length / 4))
      const avgFirst = firstQuarter.reduce((s, d) => s + d.value, 0) / (firstQuarter.length || 1)
      const avgLast = lastQuarter.reduce((s, d) => s + d.value, 0) / (lastQuarter.length || 1)
      if (avgLast - avgFirst > 100 && avgLast > 450 && !seen.has('hss')) {
        badges.push({
          time: lastQuarter[0]?.fullTime ?? '',
          label: 'Nárůst — HSS/CIR',
          color: '#48c7ff',
          detail: 'Postupný nárůst — vysokorychlostní proud z koronální díry',
        })
        seen.add('hss')
      }
    }

    if (type === 'density') {
      // Peak hustoty
      let maxIdx = 0
      for (let i = 1; i < chartData.length; i++) {
        if (chartData[i].value > chartData[maxIdx].value) maxIdx = i
      }
      const maxD = chartData[maxIdx].value
      if (maxD > 10) {
        badges.push({
          time: chartData[maxIdx].fullTime,
          label: `Max ${maxD.toFixed(0)}/cm³`,
          color: maxD > 30 ? '#ff3d9a' : maxD > 15 ? '#ffa500' : '#00d4ff',
          detail: maxD > 30 ? 'Extrémní hustota — silná tlaková událost' : maxD > 15 ? 'Vysoká hustota — substorm risk' : 'Zvýšená hustota',
        })
      }

      // Density spike (sudden jump = pressure event / CME sheath)
      for (let i = 1; i < chartData.length; i++) {
        const ratio = chartData[i].value / (chartData[i - 1].value || 1)
        if (ratio > 3 && chartData[i].value > 10 && !seen.has('spike')) {
          badges.push({
            time: chartData[i].fullTime,
            label: `Spike ×${ratio.toFixed(0)}`,
            color: '#ffa500',
            detail: 'Náhlý nárůst hustoty — tlaková událost (CME sheath)',
          })
          seen.add('spike')
        }
      }
    }

    return badges.slice(0, 4)
  }, [chartData, type])

  // Latest point = L1 station measurement (DSCOVR at L1)
  const latestIdx = chartData.length - 1
  // ~30-60 min delay to Earth, so data ~3-6 points earlier ≈ Earth-equivalent
  const earthIdx = chartData.length > 6 ? chartData.length - 6 : (chartData.length > 3 ? chartData.length - 3 : null)

  return (
    <div className="bg-[#04101e]/90 border border-white/[0.08] rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs font-mono tracking-[2px] text-slate-400 uppercase">{label}</div>
        <div className="flex items-center gap-3">
          {latestValue != null && (
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-semibold" style={{ color }}>
                {typeof latestValue === 'number' ? latestValue.toFixed(1) : latestValue} {unit}
              </span>
              {isGood && (
                <span className="text-[9px] bg-green-500/10 text-green-400 px-1.5 py-0.5 rounded border border-green-500/20">
                  {goodLabel}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={160}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id={`swGrad-${type}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.25} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
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
            contentStyle={{ background: '#04101e', border: `1px solid ${color}33`, borderRadius: 12, fontSize: 12 }}
            labelStyle={{ color: '#64748b' }}
            itemStyle={{ color }}
            formatter={(v: number) => [`${v.toFixed(1)} ${unit}`, label]}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fill={`url(#swGrad-${type})`}
            dot={false}
            activeDot={{ r: 3, fill: color }}
          />
          {/* L1 station marker — latest measurement from DSCOVR */}
          {latestIdx >= 0 && chartData[latestIdx] && (
            <ReferenceDot
              x={chartData[latestIdx].time}
              y={chartData[latestIdx].value}
              shape={(props: any) => <StationDot cx={props.cx} cy={props.cy} color={color} />}
            />
          )}
          {/* Earth marker — ~30-60 min delayed (approximate dopad na magnetosféru) */}
          {earthIdx != null && chartData[earthIdx] && (
            <ReferenceDot
              x={chartData[earthIdx].time}
              y={chartData[earthIdx].value}
              shape={(props: any) => <EarthDot cx={props.cx} cy={props.cy} />}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
      <div className="text-[10px] font-mono text-slate-400 mt-2">
        🛰️ = aktuální měření na L1 (DSCOVR) • 🌍 = přibližný dopad na magnetosféru (~30-60 min zpoždění)
      </div>
      {events.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {events.map((e, i) => (
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
    </div>
  )
}
