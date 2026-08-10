'use client'
// components/charts/KpChart.tsx
import { useMemo } from 'react'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, ReferenceLine, ReferenceDot } from 'recharts'
import type { KpPoint } from '@/lib/noaa'

interface Props {
  data: KpPoint[]
}

interface EventBadge {
  time: string
  label: string
  color: string
  detail: string
}

/** Custom dot renderer for the station/Earth markers on the chart */
function StationDot({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={11} fill="rgba(0,212,255,0.15)" />
      <circle cx={cx} cy={cy} r={5.5} fill="#00d4ff" stroke="#030810" strokeWidth={1.5} />
      <text x={cx} y={cy - 15} textAnchor="middle" fill="#00d4ff" fontSize={10} fontFamily="monospace" fontWeight="600">🛰️ L1</text>
    </g>
  )
}

function EarthDot({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={11} fill="rgba(0,255,170,0.15)" />
      <circle cx={cx} cy={cy} r={5.5} fill="#00ffaa" stroke="#030810" strokeWidth={1.5} />
      <text x={cx} y={cy - 15} textAnchor="middle" fill="#00ffaa" fontSize={10} fontFamily="monospace" fontWeight="600">🌍 Země</text>
    </g>
  )
}

export function KpChart({ data }: Props) {
  const chartData = data.map(p => ({
    time: new Date(p.time_tag).toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' }),
    fullTime: new Date(p.time_tag).toLocaleString('cs-CZ', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
    kp: p.kp_index,
    ts: new Date(p.time_tag).getTime(),
  }))

  // Detekce jevů v KP datech
  const events = useMemo((): EventBadge[] => {
    if (chartData.length < 3) return []
    const badges: EventBadge[] = []
    const seen = new Set<string>()

    for (let i = 0; i < chartData.length; i++) {
      const { kp, fullTime } = chartData[i]

      // G-scale bouře
      if (kp >= 7 && !seen.has('G3+')) {
        badges.push({ time: fullTime, label: `G3+ bouře (Kp ${kp})`, color: '#ff3d9a', detail: 'Silná bouře — záře okem z ČR' })
        seen.add('G3+')
      } else if (kp >= 5 && !seen.has('G1+')) {
        badges.push({ time: fullTime, label: `G1 bouře (Kp ${kp})`, color: '#ffa500', detail: 'Geomagnetická bouře — šance na foto' })
        seen.add('G1+')
      }

      // Rychlý nárůst KP
      if (i >= 2) {
        const rise = kp - chartData[i - 2].kp
        if (rise >= 3 && !seen.has('rapid-rise')) {
          badges.push({ time: fullTime, label: `Rychlý nárůst +${rise}`, color: '#00d4ff', detail: 'Prudký vzestup KP — možný dopad CME' })
          seen.add('rapid-rise')
        }
      }

      // Peak za celé období
      if (i > 0 && i < chartData.length - 1 && kp >= 4) {
        const isPeak = kp > chartData[i - 1].kp && kp >= chartData[i + 1].kp
        if (isPeak && !seen.has(`peak-${Math.floor(kp)}`)) {
          badges.push({ time: fullTime, label: `Peak Kp ${kp}`, color: kp >= 5 ? '#ffa500' : '#00d4ff', detail: kp >= 5 ? 'Lokální maximum — práh pro ČR' : 'Zvýšená aktivita' })
          seen.add(`peak-${Math.floor(kp)}`)
        }
      }
    }

    return badges.slice(0, 4)
  }, [chartData])

  // Find the latest data point (= Earth measurement for Kp)
  const latestIdx = chartData.length - 1
  // L1 data arrives ~30-60 min before Kp is computed. Show the point ~45 min ahead conceptually.
  // We mark the latest point as "Earth" and the one ~45 min before as approximate "L1 measured" time.
  const l1Idx = chartData.length > 3 ? chartData.length - 3 : null

  return (
    <div className="bg-[#04101e]/90 border border-white/8 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs font-mono tracking-[2px] text-aurora-teal/80 uppercase">
          KP Index (24h)
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-[10px] font-mono text-aurora-teal/80">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-aurora-teal" /> L1 stanice
          </span>
          <span className="flex items-center gap-1 text-[10px] font-mono text-aurora-green/80">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-aurora-green" /> Země (Kp)
          </span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="kpGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00d4ff" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#00d4ff" stopOpacity={0} />
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
            domain={[0, 9]}
            tick={{ fill: '#6b8aad', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            width={25}
          />
          <Tooltip
            contentStyle={{ background: '#04101e', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 12, fontSize: 12 }}
            labelStyle={{ color: '#64748b' }}
            itemStyle={{ color: '#00d4ff' }}
          />
          <ReferenceLine y={5} stroke="rgba(255,165,0,0.3)" strokeDasharray="3 3" label={{ value: 'G1', fill: '#ffa500', fontSize: 9, position: 'right' }} />
          <ReferenceLine y={7} stroke="rgba(255,61,154,0.3)" strokeDasharray="3 3" label={{ value: 'G3', fill: '#ff3d9a', fontSize: 9, position: 'right' }} />
          <Area
            type="monotone"
            dataKey="kp"
            stroke="#00d4ff"
            strokeWidth={2}
            fill="url(#kpGrad)"
            dot={false}
            activeDot={{ r: 3, fill: '#00d4ff' }}
          />
          {/* Earth marker — latest Kp measurement */}
          {latestIdx >= 0 && chartData[latestIdx] && (
            <ReferenceDot
              x={chartData[latestIdx].time}
              y={chartData[latestIdx].kp}
              shape={(props: any) => <EarthDot cx={props.cx} cy={props.cy} />}
            />
          )}
          {/* L1 station marker — approximate earlier measurement */}
          {l1Idx != null && chartData[l1Idx] && (
            <ReferenceDot
              x={chartData[l1Idx].time}
              y={chartData[l1Idx].kp}
              shape={(props: any) => <StationDot cx={props.cx} cy={props.cy} />}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
      <div className="text-[10px] font-mono text-slate-400 mt-2">
        🛰️ L1 = DSCOVR/ACE (~1.5 mil km od Země) • 🌍 = měření na Zemi (Kp index ~3h rozlišení)
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
