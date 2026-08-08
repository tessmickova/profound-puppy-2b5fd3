'use client'
// app/(dashboard)/page.tsx
import { useState, useMemo }     from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Orbitron, Syne, IBM_Plex_Mono } from 'next/font/google'
import { useAuroraData }         from '@/lib/hooks/useAuroraData'
import { useViewMode }           from '@/lib/hooks/useViewMode'
import { useGeolocation }        from '@/lib/hooks/useGeolocation'
import { useDashboardWidgets }   from '@/lib/hooks/useDashboardWidgets'
import { usePreferences }        from '@/lib/hooks/usePreferences'
import { SpaceWeatherHero }      from '@/components/space-weather/hero/SpaceWeatherHero'
import { LiveStatusPanel }       from '@/components/space-weather/hero/LiveStatusPanel'
import { KpChart }               from '@/components/charts/KpChart'
import { SolarWindChart }        from '@/components/charts/SolarWindChart'
import { BzChart }               from '@/components/charts/BzChart'
import { SolarImageryPanel }     from '@/components/charts/SolarImageryPanel'
import { KpCarousel }            from '@/components/KpCarousel'
import { DualAnalysis }          from '@/components/DualAnalysis'
import { ObservingConditions }   from '@/components/ObservingConditions'
import { CmeImpactList }         from '@/components/CmeImpactList'
import { NotifyModal }           from '@/components/NotifyModal'
import { SolarTab }              from '@/components/SolarTab'
import { HuskyLogo }             from '@/components/HuskyLogo'
import { CommunitySightings }    from '@/components/CommunitySightings'
import { ViewModeSwitch }        from '@/components/ViewModeSwitch'
import { WidgetMenu }            from '@/components/WidgetMenu'
import { CloudRadar }            from '@/components/CloudRadar'
import { AuroralOvalMap }        from '@/components/AuroralOvalMap'
import { AuroraNewsFeed }       from '@/components/AuroraNewsFeed'

import { formatDistanceToNow }   from 'date-fns'
import { cs }                    from 'date-fns/locale'
import { RefreshCw, Bell, Sun, Moon, Type } from 'lucide-react'
import toast                     from 'react-hot-toast'
import clsx                      from 'clsx'

const orbitron = Orbitron({ subsets: ['latin'], variable: '--font-orbitron', weight: ['400','700','900'] })
const syne     = Syne({ subsets: ['latin'], variable: '--font-nadpis', weight: ['400','600','700','800'] })
const ibm      = IBM_Plex_Mono({ subsets: ['latin'], variable: '--font-ibm-mono', weight: ['300','400','600'] })

const TABS = [
  { id: 'aurora',    label: '🌌 Aurora',            live: true  },
  { id: 'observe',   label: '📡 Pozorování',         live: false },
  { id: 'solar',     label: '☀️ Sluneční aktivita',  live: false },
]

export default function Home() {
  const [tab,          setTab]          = useState('aurora')
  const [notifyOpen,   setNotifyOpen]   = useState(false)
  const { data, isLoading, error, refresh, kp, bz, swSpeed, swDensity,
          kpHistory, swHistory, cme, flares, forecast, donki, hpiCurrent, hpiHistory, dstCurrent, dstHistory, auroralOval, fetchedAt, cacheSource } = useAuroraData()
  const { mode, setMode, toggle: toggleMode, isAdvanced } = useViewMode()
  const { position } = useGeolocation(true)
  const { activeWidgets, isVisible, toggleWidget, toggleWidth, getWidth } = useDashboardWidgets(isAdvanced)
  const { theme, toggleTheme, isLight, fontScale, toggleFontScale, isLarge } = usePreferences()

  const ago = useMemo(() =>
    fetchedAt ? formatDistanceToNow(new Date(fetchedAt), { addSuffix: true, locale: cs }) : null,
    [fetchedAt]
  )

  const handleRefresh = () => {
    refresh()
    toast.success('Data obnovena!', { style: {
      background: isLight ? '#ffffff' : '#04101e',
      color: isLight ? '#1a1a2e' : '#e0f0ff',
      border: `1px solid ${isLight ? 'rgba(0,0,0,0.1)' : 'rgba(0,212,255,0.2)'}`,
    } })
  }

  return (
    <div className={`${orbitron.variable} ${syne.variable} ${ibm.variable} min-h-screen bg-[#03080f] text-slate-100 font-head`}>

      {/* Aurora background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_40%_at_50%_-10%,rgba(0,200,120,0.07)_0%,transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_30%_at_80%_10%,rgba(100,0,200,0.05)_0%,transparent_60%)]" />
        <div
          className={clsx(
            'absolute top-0 left-0 right-0 h-32 transition-opacity duration-1000',
            kp >= 5 ? 'opacity-100' : kp >= 3 ? 'opacity-40' : 'opacity-10'
          )}
          style={{
            background: kp >= 7
              ? 'linear-gradient(180deg, rgba(168,85,247,0.2) 0%, rgba(255,61,154,0.1) 40%, transparent 100%)'
              : 'linear-gradient(180deg, rgba(0,255,170,0.12) 0%, rgba(0,200,255,0.06) 40%, transparent 100%)',
          }}
        />
      </div>

      {/* NAV */}
      <nav className="sticky top-0 z-50 bg-[#03080f]/90 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-4">
          <a href="/aurora" className="flex items-center gap-2 no-underline">
            <HuskyLogo size={28} />
            <span className="font-display text-base font-black tracking-widest bg-gradient-to-r from-aurora-green to-aurora-teal bg-clip-text text-transparent">
              AURORADOG
            </span>
          </a>

          <div className="flex gap-1 ml-4">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={clsx(
                  'px-4 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all',
                  tab === t.id
                    ? 'bg-aurora-teal/10 border border-aurora-teal/30 text-aurora-teal'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                )}
              >
                {t.live && tab === t.id && (
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_6px_#4ade80] mr-1.5 animate-pulse" />
                )}
                {t.label}
              </button>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <ViewModeSwitch mode={mode} onToggle={toggleMode} />
            <WidgetMenu
              activeWidgets={activeWidgets}
              onToggle={toggleWidget}
              onToggleWidth={toggleWidth}
              getWidth={getWidth}
            />

            {/* Font size toggle */}
            <button
              onClick={toggleFontScale}
              className={clsx(
                'p-1.5 rounded-lg border transition-all',
                isLarge
                  ? 'border-aurora-teal/30 bg-aurora-teal/10 text-aurora-teal'
                  : 'border-white/[0.08] text-slate-400 hover:text-slate-200 hover:bg-white/5'
              )}
              title={isLarge ? 'Normální velikost písma' : 'Větší písmo'}
            >
              <Type size={14} />
            </button>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className={clsx(
                'p-1.5 rounded-lg border transition-all',
                isLight
                  ? 'border-amber-400/30 bg-amber-400/10 text-amber-400'
                  : 'border-white/[0.08] text-slate-400 hover:text-slate-200 hover:bg-white/5'
              )}
              title={isLight ? 'Tmavý režim' : 'Světlý režim'}
            >
              {isLight ? <Sun size={14} /> : <Moon size={14} />}
            </button>

            <a href="/docs" className="hidden sm:block text-[11px] font-mono text-slate-400 hover:text-aurora-teal transition-colors">📖 Docs</a>
            <a href="/admin" className="hidden sm:block text-[11px] font-mono text-slate-400 hover:text-aurora-pink transition-colors">🔧 Admin</a>
            {fetchedAt && (
              <span className="hidden md:block text-[11px] font-mono text-slate-400">
                {cacheSource === 'live' ? '🟢' : '🟡'} {ago}
              </span>
            )}
            <button
              onClick={handleRefresh}
              className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-slate-200 transition-all"
              title="Obnovit data"
            >
              <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={() => setNotifyOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all
                         border-aurora-teal/30 text-aurora-teal hover:bg-aurora-teal/10"
            >
              <Bell size={12} />
              Alerty
            </button>
          </div>
        </div>
      </nav>

      {/* CONTENT */}
      <main className="relative z-10 pb-20">
        <AnimatePresence mode="wait">
          {tab === 'aurora' && (
            <motion.div
              key="aurora"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* SPACE WEATHER HERO — full-width cinematic transit visualization */}
              <SpaceWeatherHero data={data ?? null} isLoading={isLoading} />

              {/* LIVE STATUS PANEL — metrics, narrative, CZ aurora status */}
              <LiveStatusPanel data={data ?? null} />

              <div className="max-w-7xl mx-auto px-4 mt-3">
                <div className="flex flex-wrap gap-3">
                {/* TIER 1: Aurora conditions (full width) */}
                {isVisible('dualAnalysis') && (
                  <div className={getWidth('dualAnalysis') === 'half' ? 'w-full md:w-[calc(50%-6px)]' : 'w-full'}>
                    <DualAnalysis kp={kp} bz={bz} swSpeed={swSpeed} swDensity={swDensity} hpiCurrent={hpiCurrent} dstCurrent={dstCurrent} cme={cme} swHistory={swHistory} isAdvanced={isAdvanced} />
                  </div>
                )}

                {/* TIER 1b: CME impacts + Zprávy expertů side by side */}
                {isVisible('cmeImpacts') && (
                  <div className={getWidth('cmeImpacts') === 'half' ? 'w-full md:w-[calc(50%-6px)]' : 'w-full'}>
                    <CmeImpactList data={data ?? null} />
                  </div>
                )}
                {isVisible('newsFeed') && (
                  <div className={getWidth('newsFeed') === 'half' ? 'w-full md:w-[calc(50%-6px)]' : 'w-full'}>
                    <AuroraNewsFeed />
                  </div>
                )}

                {isVisible('forecast') && (
                  <div className={getWidth('forecast') === 'half' ? 'w-full md:w-[calc(50%-6px)]' : 'w-full'}>
                    <KpCarousel forecast={forecast} currentKp={kp} bz={bz} swSpeed={swSpeed} swDensity={swDensity} hpiCurrent={hpiCurrent} cme={cme} swHistory={swHistory} isAdvanced={isAdvanced} position={position} />
                  </div>
                )}

                {/* TIER 2.5: Cloud radar zoomed to user location */}
                {isVisible('cloudRadar') && (
                  <div className={getWidth('cloudRadar') === 'half' ? 'w-full md:w-[calc(50%-6px)]' : 'w-full'}>
                    <h3 className="text-[10px] font-mono tracking-[2px] text-slate-500 uppercase mb-2 flex items-center gap-2">
                      ☁️ Radar oblačnosti <span className="flex-1 h-px bg-white/5" />
                    </h3>
                    <CloudRadar position={position} />
                  </div>
                )}

                {/* TIER 2.7: CZ map with auroral oval + sighting pins */}
                {isVisible('auroralMap') && (
                  <div className={getWidth('auroralMap') === 'half' ? 'w-full md:w-[calc(50%-6px)]' : 'w-full'}>
                    <h3 className="text-[10px] font-mono tracking-[2px] text-slate-500 uppercase mb-2 flex items-center gap-2">
                      🗺️ Mapa ČR — aurorální ovál <span className="flex-1 h-px bg-white/5" />
                    </h3>
                    <AuroralOvalMap auroralOval={auroralOval} position={position} kp={kp} bz={bz} />
                  </div>
                )}

                {/* TIER 3: Observing conditions */}
                {isVisible('observing') && (
                  <div className={getWidth('observing') === 'half' ? 'w-full md:w-[calc(50%-6px)]' : 'w-full'}>
                    <ObservingConditions kp={kp} bz={bz} />
                  </div>
                )}

                {/* TIER 3.5: Community sightings */}
                {isVisible('sightings') && (
                  <div className={getWidth('sightings') === 'half' ? 'w-full md:w-[calc(50%-6px)]' : 'w-full'}>
                    <CommunitySightings kp={kp} bz={bz} />
                  </div>
                )}

                {/* TIER 4: Live charts — compact single row (advanced by default) */}
                {isVisible('charts') && (
                  <div className="w-full">
                    <h3 className="text-[10px] font-mono tracking-[2px] text-slate-500 uppercase mb-2 flex items-center gap-2">
                      📊 Živá data <span className="flex-1 h-px bg-white/5" />
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <KpChart       data={kpHistory}  />
                      <BzChart       data={swHistory}  />
                      <SolarWindChart data={swHistory} type="speed"   label="Sluneční vítr"   unit="km/s"  color="#ffa500" good={v => v > 500} goodLabel="rychlý vítr" />
                      <SolarWindChart data={swHistory} type="density" label="Hustota větru"   unit="/cm³"  color="#00ffaa" good={v => v > 10}  goodLabel="vysoká hustota" />
                    </div>
                  </div>
                )}

                {/* TIER 5: Solar imagery animations (ENLIL, LASCO, CCOR, SUVI) */}
                {isVisible('enlil') && (
                  <div className={getWidth('enlil') === 'half' ? 'w-full md:w-[calc(50%-6px)]' : 'w-full'}>
                    <SolarImageryPanel />
                  </div>
                )}
                </div>
              </div>
            </motion.div>
          )}

          {tab === 'solar' && (
            <motion.div key="solar" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="max-w-7xl mx-auto px-4">
                <SolarTab flares={flares} cme={cme} donki={donki} />
              </div>
            </motion.div>
          )}

          {tab === 'observe' && (
            <motion.div key="observe" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="max-w-7xl mx-auto px-4">
                <ObservingConditions kp={kp} bz={bz} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <NotifyModal open={notifyOpen} onClose={() => setNotifyOpen(false)} />

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-white/[0.06] bg-[#03080f]/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <HuskyLogo size={22} />
            <span className="font-display text-xs font-bold tracking-widest text-slate-400">AURORADOG</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-mono">
            <a
              href="https://t.me/auroradog_bot"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0088cc]/10 border border-[#0088cc]/20 text-[#0088cc] hover:bg-[#0088cc]/20 transition-colors"
            >
              ✈️ Telegram Bot
            </a>
            <a
              href="https://wa.me/?text=AuroraDog"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366]/10 border border-[#25D366]/20 text-[#25D366] hover:bg-[#25D366]/20 transition-colors"
            >
              💬 WhatsApp
            </a>
            <a
              href="https://buymeacoffee.com/auroradog"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FFDD00]/10 border border-[#FFDD00]/20 text-[#FFDD00] hover:bg-[#FFDD00]/20 transition-colors"
            >
              ☕ Buy me a coffee
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
