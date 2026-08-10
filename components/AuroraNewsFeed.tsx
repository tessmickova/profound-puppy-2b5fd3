'use client'
// components/AuroraNewsFeed.tsx — Dnešní zprávy o polární záři od expertů a z médií (důraz na ČR)
import { useState, useMemo } from 'react'
import { useAuroraNews } from '@/lib/hooks/useAuroraNews'
import { useAuroraData } from '@/lib/hooks/useAuroraData'
import { calculateExpertScore } from '@/lib/space-weather/expertScore'
import { formatDistanceToNow, format } from 'date-fns'
import { cs } from 'date-fns/locale'
import { RefreshCw, ExternalLink, Globe, Newspaper, Radio, AlertTriangle, ChevronDown, ChevronUp, GraduationCap, MapPin, Sparkles, Quote } from 'lucide-react'
import clsx from 'clsx'

const CATEGORY_META: Record<string, { label: string; icon: typeof Globe; color: string }> = {
  expert_cz: { label: '🇨🇿 Český expert',      icon: MapPin,        color: 'text-aurora-green border-aurora-green/50' },
  expert_eu: { label: '🇪🇺 Evropský expert',    icon: GraduationCap, color: 'text-aurora-teal border-aurora-teal/40' },
  swpc:      { label: 'NOAA SWPC',             icon: AlertTriangle, color: 'text-amber-400 border-amber-400/30' },
  expert:    { label: 'Světový expert',         icon: GraduationCap, color: 'text-purple-400 border-purple-400/30' },
  media_cz:  { label: 'České médium',           icon: Newspaper,     color: 'text-slate-400 border-slate-500/30' },
  media_int: { label: 'Zahraniční médium',      icon: Globe,         color: 'text-slate-500 border-slate-600/30' },
  official:  { label: 'Oficiální zdroj',        icon: Radio,         color: 'text-aurora-green border-aurora-green/30' },
  social:    { label: 'Sociální sítě',          icon: Globe,         color: 'text-aurora-pink border-aurora-pink/30' },
}

export function AuroraNewsFeed() {
  const { news, date, lastChecked, isLoading, refresh } = useAuroraNews()
  const { kp, bz, swSpeed, swDensity, swHistory, hpiCurrent, dstCurrent } = useAuroraData()
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [filter, setFilter] = useState<string | null>(null)
  const [aiOpen, setAiOpen] = useState(false)

  // AI analýza založená na reálných datech pro ČR (50°N) + expertní zdroje
  const aiAnalysis = useMemo(() => {
    const score = calculateExpertScore({
      kp,
      bz,
      swSpeed,
      swDensity,
      solarWindHistory: swHistory,
      hpiCurrent,
      dstCurrent,
    }, 50.08, 14.44, true) // nightIndependent=true → ukazuje potenciál bez ohledu na denní dobu

    const lines: string[] = []
    lines.push(`Expertní skóre pro ČR: ${score.score.toFixed(0)}/100 — ${score.label}`)
    if (score.explanation) lines.push(score.explanation)

    // Přeložit faktory do čitelného formátu — KP text musí zohlednit Bz
    const bzNorth = (bz ?? 0) > 2
    const kpText = kp >= 5
      ? bzNorth
        ? `KP ${kp} — historicky nad prahem, ale Bz je severní → magnetosféra nepropouští energii, záře neaktivní`
        : `KP ${kp} — dosahuje prahu viditelnosti pro ČR`
      : `KP ${kp} — pod prahem viditelnosti (potřeba ≥5)`
    lines.push(kpText)

    if (bz !== null) {
      lines.push(bz < -10 ? `Bz ${bz.toFixed(1)} nT — silně jižní, magnetosféra otevřená` :
                 bz < -5  ? `Bz ${bz.toFixed(1)} nT — mírně jižní, podmínky se zlepšují` :
                 bz > 2   ? `Bz ${bz.toFixed(1)} nT — severní, magnetosféra zavřená. Vysoké KP odráží minulou aktivitu, ne aktuální stav.` :
                 bz > 0   ? `Bz ${bz.toFixed(1)} nT — slabě kladné, magnetosféra se uzavírá` :
                            `Bz ${bz.toFixed(1)} nT — slabé jižní pole`)
    }

    if (swSpeed !== null && swSpeed > 450) {
      lines.push(`Sluneční vítr: ${Math.round(swSpeed)} km/s ${swSpeed > 600 ? '— velmi rychlý' : '— zvýšený'}`)
    }

    // Citace z expertních zdrojů — Met Office, SpaceWeatherLive, STCE aj.
    const expertQuotes: string[] = []
    const prioritySources = ['Met Office', 'SpaceWeatherLive', 'STCE', 'AuroraWatch', 'Finnish', 'NOAA SWPC']
    for (const item of news) {
      if (item.forecastQuote && (item.category === 'expert_eu' || item.category === 'expert_cz' || item.category === 'swpc')) {
        const isHighPriority = prioritySources.some(s => item.source.includes(s))
        if (isHighPriority) {
          expertQuotes.unshift(`${item.source}: „${item.forecastQuote}"`)
        } else {
          expertQuotes.push(`${item.source}: „${item.forecastQuote}"`)
        }
      }
    }

    let verdict: string
    if (score.score >= 55) verdict = '✅ Vysoká šance na polární záři v ČR dnes v noci!'
    else if (score.score >= 40) verdict = '📷 Šance na fotografickou záři z tmavých míst v ČR.'
    else if (score.score >= 25) verdict = '⚠️ Podmínky zatím nejisté, sledujte vývoj.'
    else verdict = '❌ Polární záře z ČR dnes nepravděpodobná.'

    return { lines, verdict, score: score.score, color: score.color, expertQuotes }
  }, [kp, bz, swSpeed, swDensity, swHistory, hpiCurrent, dstCurrent, news])

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const filtered = filter ? news.filter(n => n.category === filter) : news

  const lastCheckedAgo = lastChecked
    ? formatDistanceToNow(new Date(lastChecked), { addSuffix: true, locale: cs })
    : null

  return (
    <div className="space-y-3">
      {/* Hlavička */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-[10px] font-mono tracking-[2px] text-slate-500 uppercase flex items-center gap-2">
          📰 Předpovědi expertů a zprávy — polární záře dnes v ČR
          <span className="flex-1 h-px bg-white/5" />
        </h3>
        <div className="flex items-center gap-2">
          {lastCheckedAgo && (
            <span className="text-[10px] font-mono text-slate-500">
              Poslední kontrola: {lastCheckedAgo}
            </span>
          )}
          <button
            onClick={() => refresh()}
            className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-slate-200 transition-all"
            title="Znovu zkontrolovat zdroje"
          >
            <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* AI Analýza — štítek s rozbalitelným detailem */}
      <div className="relative">
        <button
          onClick={() => setAiOpen(!aiOpen)}
          className={clsx(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-mono transition-all border',
            'bg-linear-to-r from-purple-500/10 to-aurora-teal/10',
            'border-purple-400/30 text-purple-300 hover:border-purple-400/60 hover:text-purple-200',
          )}
        >
          <Sparkles size={12} className="text-purple-400" />
          AI analýza pro ČR
          <span
            className="ml-1 w-2 h-2 rounded-full"
            style={{ backgroundColor: aiAnalysis.color }}
          />
          <span className="text-[10px] text-slate-400 ml-1">
            {aiAnalysis.score.toFixed(0)}/100
          </span>
          {aiOpen ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
        </button>

        {aiOpen && (
          <div className="mt-2 rounded-xl border border-purple-400/20 bg-[#04101e]/95 p-4 space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={14} className="text-purple-400" />
              <span className="text-[11px] font-bold text-purple-300 uppercase tracking-wider">AI generovaná analýza</span>
            </div>
            <p className="text-sm font-semibold" style={{ color: aiAnalysis.color }}>
              {aiAnalysis.verdict}
            </p>
            <div className="space-y-1">
              {aiAnalysis.lines.map((line, i) => (
                <p key={i} className="text-[11px] text-slate-300 leading-relaxed font-mono">
                  {line}
                </p>
              ))}
            </div>
            {aiAnalysis.expertQuotes.length > 0 && (
              <div className="mt-3 pt-2 border-t border-white/4 space-y-1.5">
                <p className="text-[10px] font-mono text-aurora-teal/70 uppercase tracking-wider">
                  Co říkají experti dnes:
                </p>
                {aiAnalysis.expertQuotes.slice(0, 4).map((q, i) => (
                  <p key={i} className="text-[10px] text-slate-400 leading-relaxed italic font-mono">
                    {q}
                  </p>
                ))}
              </div>
            )}
            <p className="text-[9px] text-slate-500 pt-2 border-t border-white/4 leading-relaxed">
              ⚠️ Tato analýza je automaticky generována algoritmem na základě reálných dat z NOAA, NASA a dalších zdrojů.
              Vždy ověřte aktuální podmínky u expertních zdrojů výše. Není to lidská předpověď.
            </p>
          </div>
        )}
      </div>

      {/* Filtr kategorií */}
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setFilter(null)}
          className={clsx(
            'px-2.5 py-1 rounded-md text-[10px] font-mono transition-all border',
            !filter
              ? 'bg-aurora-teal/10 border-aurora-teal/30 text-aurora-teal'
              : 'border-white/5 text-slate-500 hover:text-slate-300 hover:bg-white/5'
          )}
        >
          Vše ({news.length})
        </button>
        {Object.entries(CATEGORY_META).map(([key, meta]) => {
          const count = news.filter(n => n.category === key).length
          if (count === 0) return null
          return (
            <button
              key={key}
              onClick={() => setFilter(filter === key ? null : key)}
              className={clsx(
                'px-2.5 py-1 rounded-md text-[10px] font-mono transition-all border',
                filter === key
                  ? `bg-white/5 ${meta.color}`
                  : 'border-white/5 text-slate-500 hover:text-slate-300 hover:bg-white/5'
              )}
            >
              {meta.label} ({count})
            </button>
          )
        })}
      </div>

      {/* Obsah */}
      <div className="rounded-xl border border-white/6 bg-[#04101e]/80 overflow-hidden">
        {isLoading && news.length === 0 ? (
          <div className="p-8 text-center">
            <RefreshCw size={18} className="animate-spin mx-auto text-slate-500 mb-2" />
            <p className="text-xs font-mono text-slate-500">Prohledávám expertní zdroje a média…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-slate-400 mb-1">Dnes zatím žádné zprávy o polární záři pro ČR</p>
            <p className="text-[11px] font-mono text-slate-500">
              Sledujeme české a evropské experty, hvězdárny, NOAA SWPC i média.
              <br />Kontrola co 15 minut.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/4">
            {filtered.map((item) => {
              const meta = CATEGORY_META[item.category] ?? CATEGORY_META.media_int
              const Icon = meta.icon
              const isOpen = expanded.has(item.id)
              const pubTime = (() => {
                try {
                  return format(new Date(item.publishedAt), 'd. MMMM yyyy, HH:mm', { locale: cs })
                } catch {
                  return item.publishedAt
                }
              })()

              return (
                <div
                  key={item.id}
                  className="group hover:bg-white/2 transition-colors"
                >
                  {/* Hlavní řádek */}
                  <div
                    className="px-4 py-3 cursor-pointer flex items-start gap-3"
                    onClick={() => toggleExpand(item.id)}
                  >
                    <div className={clsx('mt-0.5 p-1.5 rounded-md border bg-white/2', meta.color)}>
                      <Icon size={12} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <span className={clsx('text-[9px] font-mono px-1.5 py-0.5 rounded-sm border', meta.color)}>
                          {item.source}
                        </span>
                        {item.translated && (
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-sm border border-amber-400/30 text-amber-400">
                            🌐 Doslova přeloženo z {item.originalLang === 'en' ? 'angličtiny' : item.originalLang}
                          </span>
                        )}
                        <span className="text-[9px] font-mono text-slate-500">
                          {pubTime}
                        </span>
                      </div>

                      <h4 className="text-sm font-semibold text-slate-200 mb-1 leading-snug">
                        {item.title}
                      </h4>

                      <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                        {item.snippet}
                      </p>

                      {item.forecastQuote && (
                        <div className="mt-1.5 flex items-start gap-1.5">
                          <Quote size={10} className="text-aurora-teal mt-0.5 shrink-0" />
                          <p className="text-[10px] text-aurora-teal/90 font-mono leading-relaxed italic line-clamp-2">
                            &ldquo;{item.forecastQuote}&rdquo;
                          </p>
                        </div>
                      )}

                      {item.author && (
                        <p className="text-[10px] font-mono text-slate-500 mt-1">
                          ✍️ {item.author}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 mt-1">
                      <a
                        href={item.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-md hover:bg-white/5 text-slate-500 hover:text-aurora-teal transition-all"
                        title="Otevřít zdroj"
                        onClick={e => e.stopPropagation()}
                      >
                        <ExternalLink size={12} />
                      </a>
                      {isOpen ? (
                        <ChevronUp size={12} className="text-slate-500" />
                      ) : (
                        <ChevronDown size={12} className="text-slate-500" />
                      )}
                    </div>
                  </div>

                  {/* Rozbalený detail */}
                  {isOpen && (
                    <div className="px-4 pb-3 pl-12">
                      <div className="rounded-lg bg-[#03080f]/80 border border-white/4 p-3">
                        <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-2">
                          Doslovná citace ze zdroje:
                        </p>
                        <blockquote className="text-xs text-slate-300 leading-relaxed border-l-2 border-aurora-teal/30 pl-3 italic">
                          &ldquo;{item.snippet}&rdquo;
                        </blockquote>
                        {item.translated && (
                          <p className="text-[10px] font-mono text-amber-400/70 mt-2">
                            ⚠️ Tento text byl doslova přeložen z {item.originalLang === 'en' ? 'angličtiny' : item.originalLang}. Originál viz odkaz na zdroj.
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-3 pt-2 border-t border-white/4 flex-wrap">
                          <a
                            href={item.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-[10px] font-mono text-aurora-teal hover:underline"
                          >
                            <ExternalLink size={10} />
                            Přejít na zdroj →
                          </a>
                          {item.author && (
                            <span className="text-[10px] font-mono text-slate-500">
                              Autor: {item.author}
                            </span>
                          )}
                          <span className="text-[10px] font-mono text-slate-500">
                            Zveřejněno: {pubTime}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Patička */}
        <div className="px-4 py-2 border-t border-white/4 flex items-center justify-between flex-wrap gap-2">
          <span className="text-[9px] font-mono text-slate-600">
            Dnes: {date ?? '–'} • Kontrola co 15 min
          </span>
          <span className="text-[9px] font-mono text-slate-600">
            🇨🇿 AÚ AV ČR, ČHMÚ, astro.cz, hvězdárny • 🇪🇺 STCE, SpaceWeatherLive, AuroraWatch, Met Office • 🌍 NOAA SWPC, Dr. Skov, SolarHam
          </span>
        </div>
      </div>
    </div>
  )
}
