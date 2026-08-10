'use client'
// components/CloudRadar.tsx — Live cloud/rain radar zoomed to user's location using RainViewer API (free)
import { useState, useEffect, useMemo, useRef } from 'react'
import type { GeoPosition } from '@/lib/hooks/useGeolocation'

interface Props {
  position: GeoPosition | null
}

interface RainViewerData {
  radar: { past: { path: string; time: number }[]; nowcast: { path: string; time: number }[] }
  satellite: { infrared: { path: string; time: number }[] }
}

// Convert lat/lon to tile coordinates for a given zoom level
function latLonToTile(lat: number, lon: number, zoom: number): { x: number; y: number } {
  const n = Math.pow(2, zoom)
  const x = Math.floor((lon + 180) / 360 * n)
  const latRad = lat * Math.PI / 180
  const y = Math.floor((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * n)
  return { x, y }
}

// Convert tile coordinates back to lat/lon (top-left corner)
function tileToBounds(x: number, y: number, zoom: number): { nLat: number; sLat: number; wLon: number; eLon: number } {
  const n = Math.pow(2, zoom)
  const wLon = x / n * 360 - 180
  const eLon = (x + 1) / n * 360 - 180
  const nLat = Math.atan(Math.sinh(Math.PI * (1 - 2 * y / n))) * 180 / Math.PI
  const sLat = Math.atan(Math.sinh(Math.PI * (1 - 2 * (y + 1) / n))) * 180 / Math.PI
  return { nLat, sLat, wLon, eLon }
}

const TILE_BASE = 'https://tilecache.rainviewer.com'
const OSM_TILE = 'https://tile.openstreetmap.org'

export function CloudRadar({ position }: Props) {
  const [radarData, setRadarData] = useState<RainViewerData | null>(null)
  const [frameIdx, setFrameIdx] = useState(0)
  const [showSatellite, setShowSatellite] = useState(true) // satellite = clouds, radar = rain
  const animRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const lat = position?.lat ?? 49.8  // CZ center default
  const lon = position?.lon ?? 15.5

  // Zoom level 8 gives ~km-level detail covering a ~100km area around the user
  const zoom = 8
  const centerTile = useMemo(() => latLonToTile(lat, lon, zoom), [lat, lon])

  // Fetch available radar/satellite frames from RainViewer
  useEffect(() => {
    let cancelled = false
    fetch('https://api.rainviewer.com/public/weather-maps.json')
      .then(r => r.json())
      .then((data: RainViewerData) => {
        if (!cancelled) {
          setRadarData(data)
          // Start at the latest frame
          const frames = showSatellite
            ? data.satellite.infrared
            : [...data.radar.past, ...data.radar.nowcast]
          setFrameIdx(Math.max(0, frames.length - 1))
        }
      })
      .catch(() => {})
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const frames = useMemo(() => {
    if (!radarData) return []
    return showSatellite
      ? radarData.satellite.infrared
      : [...radarData.radar.past, ...radarData.radar.nowcast]
  }, [radarData, showSatellite])

  // Auto-animate through frames
  useEffect(() => {
    if (animRef.current) clearInterval(animRef.current)
    if (frames.length <= 1) return
    animRef.current = setInterval(() => {
      setFrameIdx(prev => (prev + 1) % frames.length)
    }, 800)
    return () => { if (animRef.current) clearInterval(animRef.current) }
  }, [frames.length])

  const currentFrame = frames[frameIdx]
  const frameTime = currentFrame ? new Date(currentFrame.time * 1000).toLocaleTimeString('cs-CZ', {
    timeZone: 'Europe/Prague', hour: '2-digit', minute: '2-digit',
  }) : ''

  // Build 3x3 tile grid centered on user for smooth coverage
  const tiles = useMemo(() => {
    const result: { x: number; y: number; gridX: number; gridY: number }[] = []
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        result.push({ x: centerTile.x + dx, y: centerTile.y + dy, gridX: dx + 1, gridY: dy + 1 })
      }
    }
    return result
  }, [centerTile])

  return (
    <div className="bg-[#04101e]/90 border border-white/8 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs font-mono tracking-[2px] text-slate-500 uppercase flex items-center gap-2">
          ☁️ Radar oblačnosti
          {position && <span className="text-[10px] text-aurora-teal normal-case tracking-normal">📍 vaše poloha</span>}
          <span className="flex-1 h-px bg-white/5 ml-2" />
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => { setShowSatellite(true); setFrameIdx(0) }}
            className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all border ${
              showSatellite
                ? 'bg-aurora-teal/15 text-aurora-teal border-aurora-teal/30'
                : 'text-slate-400 border-white/6 hover:bg-white/5'
            }`}
          >
            🛰️ Oblačnost
          </button>
          <button
            onClick={() => { setShowSatellite(false); setFrameIdx(0) }}
            className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all border ${
              !showSatellite
                ? 'bg-aurora-teal/15 text-aurora-teal border-aurora-teal/30'
                : 'text-slate-400 border-white/6 hover:bg-white/5'
            }`}
          >
            🌧️ Srážky
          </button>
        </div>
      </div>

      {/* Map container — 3x3 tile grid */}
      <div className="relative w-full aspect-3/2 rounded-xl overflow-hidden bg-[#0a1929] border border-white/6">
        {/* OSM base tiles */}
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
          {tiles.map(t => (
            <img
              key={`osm-${t.x}-${t.y}`}
              src={`${OSM_TILE}/${zoom}/${t.x}/${t.y}.png`}
              alt=""
              className="w-full h-full object-cover opacity-30"
              style={{ filter: 'brightness(0.3) saturate(0.3) hue-rotate(180deg)' }}
              loading="lazy"
            />
          ))}
        </div>

        {/* Radar/satellite overlay */}
        {currentFrame && (
          <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
            {tiles.map(t => (
              <img
                key={`overlay-${t.x}-${t.y}-${currentFrame.time}`}
                src={`${TILE_BASE}${currentFrame.path}/256/${zoom}/${t.x}/${t.y}/${showSatellite ? '0/0_0.png' : '2/1_1.png'}`}
                alt=""
                className="w-full h-full object-cover"
                style={{ opacity: showSatellite ? 0.7 : 0.8 }}
                loading="lazy"
              />
            ))}
          </div>
        )}

        {/* User position marker */}
        {position && (
          <div
            className="absolute w-3 h-3 -ml-1.5 -mt-1.5 rounded-full bg-aurora-teal shadow-[0_0_10px_#00d4ff] z-10 border border-white/30"
            style={{
              left: '50%',
              top: '50%',
            }}
          />
        )}

        {/* Time indicator */}
        <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-xs rounded-lg px-2.5 py-1 z-10">
          <span className="text-[11px] font-mono text-slate-200">{frameTime}</span>
          <span className="text-[10px] font-mono text-slate-400 ml-1.5">
            {showSatellite ? 'IR satelit' : frameIdx >= (radarData?.radar.past.length ?? 0) ? 'předpověď' : 'radar'}
          </span>
        </div>

        {/* Frame progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/5">
          <div
            className="h-full bg-aurora-teal transition-all duration-300"
            style={{ width: `${frames.length > 0 ? ((frameIdx + 1) / frames.length) * 100 : 0}%` }}
          />
        </div>
      </div>

      <p className="text-[10px] text-slate-500 mt-2">
        Data: RainViewer API • {showSatellite ? 'Infračervený satelit — světlé = vysoká oblačnost' : 'Radarové srážky — jasné barvy = silnější srážky'}
        • Pro pozorování polární záře potřebujete jasnou oblohu.
      </p>
    </div>
  )
}
