// app/api/aurora-news/route.ts — Scrapuje zprávy o polární záři z médií a oficiálních zdrojů
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

/* ------------------------------------------------------------------ */
/*  Typy                                                               */
/* ------------------------------------------------------------------ */

export interface NewsItem {
  id: string
  title: string
  snippet: string           // doslovný úryvek / citace
  source: string            // název zdroje (iDNES, SpaceWeather.com, …)
  sourceUrl: string         // odkaz na článek
  author: string | null     // jméno autora pokud dostupné
  publishedAt: string       // ISO čas zveřejnění
  translated: boolean       // zda bylo přeloženo do češtiny
  originalLang: string | null // původní jazyk (pokud translated)
  category: 'media_cz' | 'media_int' | 'official' | 'social' | 'swpc' | 'expert_cz' | 'expert_eu' | 'expert'
  forecastQuote: string | null   // doslovná věta o viditelnosti / předpovědi z textu
}

/* ------------------------------------------------------------------ */
/*  Zdroje ke skenování                                               */
/* ------------------------------------------------------------------ */

interface FeedSource {
  name: string
  url: string
  category: NewsItem['category']
  lang: 'cs' | 'en'
  type: 'rss' | 'html'
}

const FEED_SOURCES: FeedSource[] = [
  // ═══════════════════════════════════════════════════════════════════
  //  🇨🇿 ČEŠTÍ EXPERTI — primární zdroje pro ČR
  // ═══════════════════════════════════════════════════════════════════
  { name: 'Astronomický ústav AV ČR', url: 'https://www.asu.cas.cz/feed/', category: 'expert_cz', lang: 'cs', type: 'rss' },   // Akademie věd ČR
  { name: 'Český hydrometeorologický ústav', url: 'https://www.chmi.cz/files/portal/docs/meteo/om/xml/rss.xml', category: 'expert_cz', lang: 'cs', type: 'rss' }, // ČHMÚ
  { name: 'Česká astronomická společnost', url: 'https://www.astro.cz/rss/', category: 'expert_cz', lang: 'cs', type: 'rss' }, // ČAS — astro.cz
  { name: 'Hvězdárna a planetárium Brno', url: 'https://www.hvezdarna.cz/feed/', category: 'expert_cz', lang: 'cs', type: 'rss' },
  { name: 'Štefánikova hvězdárna Praha', url: 'https://www.planetarium.cz/feed/', category: 'expert_cz', lang: 'cs', type: 'rss' },
  { name: 'Astro Fórum CZ',             url: 'https://www.astroforum.cz/feed/', category: 'expert_cz', lang: 'cs', type: 'rss' },

  // ═══════════════════════════════════════════════════════════════════
  //  🇪🇺 EVROPŠTÍ EXPERTI — předpovědi pro Evropu a střední šířky
  // ═══════════════════════════════════════════════════════════════════
  { name: 'STCE (Královská observatoř Belgie)', url: 'https://www.stce.be/news/rss.php', category: 'expert_eu', lang: 'en', type: 'rss' },  // Solar-Terrestrial Centre of Excellence — hlavní EU forecaster
  { name: 'Met Office Space Weather (UK)', url: 'https://www.metoffice.gov.uk/feeds/rss/space-weather.xml', category: 'expert_eu', lang: 'en', type: 'rss' },  // Britská meteo služba
  { name: 'AuroraWatch UK (Lancaster)', url: 'https://aurorawatch.lancs.ac.uk/feeds/alerts/rss.xml', category: 'expert_eu', lang: 'en', type: 'rss' },  // Lancaster University magnetometry
  { name: 'Lund Space Weather (Švédsko)', url: 'http://www.lund.irf.se/rwc/rss/rwc_lund.rss', category: 'expert_eu', lang: 'en', type: 'rss' },  // Swedish Institute of Space Physics
  { name: 'SpaceWeatherLive (NL/BE)',    url: 'https://www.spaceweatherlive.com/en/news/rss', category: 'expert_eu', lang: 'en', type: 'rss' },  // Hlavní evropský real-time aurora portál
  { name: 'PECASUS (EU)',               url: 'https://pecasus.org/feed/', category: 'expert_eu', lang: 'en', type: 'rss' },  // Pan-European Consortium for Aviation Space Weather User Services
  { name: 'ROB SIDC (Belgie)',          url: 'https://www.sidc.be/silso/newsrss', category: 'expert_eu', lang: 'en', type: 'rss' },  // Royal Observatory Belgium — Solar Influences Data Center
  { name: 'Finnish Meteorological Inst.', url: 'https://space.fmi.fi/news/rss/', category: 'expert_eu', lang: 'en', type: 'rss' },  // Finský meteo ústav, aurora forecasting

  // ═══════════════════════════════════════════════════════════════════
  //  🌍 MEZINÁRODNÍ EXPERTI
  // ═══════════════════════════════════════════════════════════════════
  { name: 'NOAA SWPC Alerts',           url: 'https://services.swpc.noaa.gov/products/alerts.json', category: 'swpc', lang: 'en', type: 'html' },
  { name: 'Dr. Tamitha Skov',           url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCkXjdDQ-db4MXbN1tq4q2mQ', category: 'expert', lang: 'en', type: 'rss' },  // Space Weather Woman
  { name: 'Dr. C. Alex Young (NASA)',   url: 'https://thesuntoday.wpcomstaging.com/feed/', category: 'expert', lang: 'en', type: 'rss' },  // NASA Goddard
  { name: 'Aurorasaurus (NASA)',        url: 'https://blog.aurorasaurus.org/feed/', category: 'expert', lang: 'en', type: 'rss' },  // NASA citizen-science
  { name: 'SolarHam (Kevin Reback)',    url: 'https://solarham.com/index.htm', category: 'expert', lang: 'en', type: 'html' },

  // ═══════════════════════════════════════════════════════════════════
  //  📰 ČESKÁ MÉDIA
  // ═══════════════════════════════════════════════════════════════════
  { name: 'iDNES.cz',           url: 'https://servis.idnes.cz/rss.aspx?c=zpravodaj',              category: 'media_cz', lang: 'cs', type: 'rss' },
  { name: 'Novinky.cz',         url: 'https://www.novinky.cz/rss',                                 category: 'media_cz', lang: 'cs', type: 'rss' },
  { name: 'Aktuálně.cz',        url: 'https://www.aktualne.cz/rss/',                               category: 'media_cz', lang: 'cs', type: 'rss' },
  { name: 'ČT24',               url: 'https://ct24.ceskatelevize.cz/rss/hlavni-zpravy',            category: 'media_cz', lang: 'cs', type: 'rss' },
  { name: 'iROZHLAS.cz',        url: 'https://www.irozhlas.cz/rss/irozhlas',                       category: 'media_cz', lang: 'cs', type: 'rss' },
  { name: 'Deník.cz',           url: 'https://www.denik.cz/rss/zpravy.html',                       category: 'media_cz', lang: 'cs', type: 'rss' },

  // ═══════════════════════════════════════════════════════════════════
  //  🌐 ZAHRANIČNÍ MÉDIA
  // ═══════════════════════════════════════════════════════════════════
  { name: 'SpaceWeather.com',   url: 'https://spaceweathernews.com/feed/',                         category: 'media_int', lang: 'en', type: 'rss' },
  { name: 'Space.com',          url: 'https://www.space.com/feeds/all',                             category: 'media_int', lang: 'en', type: 'rss' },
  { name: 'ScienceAlert',       url: 'https://www.sciencealert.com/feed',                           category: 'media_int', lang: 'en', type: 'rss' },
  { name: 'EarthSky',           url: 'https://earthsky.org/feed/',                                  category: 'media_int', lang: 'en', type: 'rss' },
]

// Klíčová slova pro filtraci (case-insensitive)
const KEYWORDS_CS = ['polární záře', 'aurora borealis', 'severní záře', 'geomagnetická bouře', 'sluneční bouře', 'koronální výron']
const KEYWORDS_EN = ['aurora', 'northern lights', 'geomagnetic storm', 'solar storm', 'coronal mass ejection', 'cme impact', 'aurora borealis', 'kp index']
// Expertní zdroje mají méně přísný filtr — vše od nich je relevantní
const KEYWORDS_EXPERT = ['aurora', 'solar', 'geomagnetic', 'cme', 'flare', 'kp', 'bz', 'storm', 'coronal', 'sunspot', 'space weather', 'magnetic', 'forecast', 'alert', 'warning', 'watch', 'bouře', 'záře', 'erupce']

function matchesKeywords(text: string, lang: 'cs' | 'en', category?: string): boolean {
  const lower = text.toLowerCase()
  if (category === 'expert' || category === 'expert_cz' || category === 'expert_eu') {
    return KEYWORDS_EXPERT.some(kw => lower.includes(kw))
  }
  const keywords = lang === 'cs' ? [...KEYWORDS_CS, ...KEYWORDS_EN] : KEYWORDS_EN
  return keywords.some(kw => lower.includes(kw))
}

/* ------------------------------------------------------------------ */
/*  Extrakce předpovědní věty (forecast quote)                        */
/* ------------------------------------------------------------------ */

const FORECAST_PATTERNS_CS = [
  /[^.!?]*(?:polární záře|aurora|severní záře)[^.!?]*(?:bude|nebude|lze očekávat|očekává se|hrozí|pravděpodobnost|možnost|viditelná|viditelnost|pozorovatelná|uvidíme|neuvidíme|šance|nelze)[^.!?]*[.!?]/gi,
  /[^.!?]*(?:geomagnetická bouře|magnetická bouře)[^.!?]*(?:zasáhne|dorazí|očekává|hrozí|stupeň|úroveň|G[1-5])[^.!?]*[.!?]/gi,
  /[^.!?]*(?:Kp\s*(?:index)?)[^.!?]*(?:dosáhne|překročí|stoupne|klesne|očekáván|předpověď)[^.!?]*[.!?]/gi,
]

const FORECAST_PATTERNS_EN = [
  /[^.!?]*(?:aurora|northern lights)[^.!?]*(?:visible|expected|likely|unlikely|possible|forecast|predicted|chance|may be seen|could be|will not|won't|can be observed|observable)[^.!?]*[.!?]/gi,
  /[^.!?]*(?:geomagnetic storm)[^.!?]*(?:expected|watch|warning|G[1-5]|hit|impact|arrive|reach)[^.!?]*[.!?]/gi,
  /[^.!?]*(?:Kp\s*(?:index)?)[^.!?]*(?:reach|exceed|rise|expected|forecast|predicted|up to)[^.!?]*[.!?]/gi,
  /[^.!?]*(?:mid-?latitude|middle latitude|50\s*°?\s*N)[^.!?]*(?:aurora|visible|see|chance)[^.!?]*[.!?]/gi,
]

function extractForecastQuote(text: string, lang: 'cs' | 'en'): string | null {
  if (!text || text.length < 20) return null
  const clean = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  const patterns = lang === 'cs'
    ? [...FORECAST_PATTERNS_CS, ...FORECAST_PATTERNS_EN]
    : FORECAST_PATTERNS_EN

  for (const pattern of patterns) {
    pattern.lastIndex = 0
    const match = pattern.exec(clean)
    if (match) {
      const quote = match[0].trim()
      if (quote.length >= 15 && quote.length <= 300) return quote
    }
  }
  return null
}

/* ------------------------------------------------------------------ */
/*  RSS parser (lightweight, no external dependencies)                */
/* ------------------------------------------------------------------ */

interface RssItem {
  title: string
  link: string
  description: string
  pubDate: string
  author: string | null
}

function parseRssItems(xml: string): RssItem[] {
  const items: RssItem[] = []
  const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi
  let match: RegExpExecArray | null

  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1]
    const getText = (tag: string): string => {
      const r = new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`, 'i')
      const m = block.match(r)
      return m ? m[1].trim().replace(/<[^>]+>/g, '') : ''
    }
    items.push({
      title: getText('title'),
      link: getText('link') || getText('guid'),
      description: getText('description'),
      pubDate: getText('pubDate') || getText('dc:date') || getText('published'),
      author: getText('dc:creator') || getText('author') || null,
    })
  }
  return items
}

/* ------------------------------------------------------------------ */
/*  Dnešní datum (CZ timezone)                                        */
/* ------------------------------------------------------------------ */

function getTodayCZ(): string {
  const now = new Date()
  // CZ timezone: UTC+1 (winter) or UTC+2 (summer)
  const czDate = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Prague' }))
  return czDate.toISOString().split('T')[0] // YYYY-MM-DD
}

function isToday(dateStr: string): boolean {
  if (!dateStr) return false
  try {
    const today = getTodayCZ()
    const d = new Date(dateStr)
    const czDate = new Date(d.toLocaleString('en-US', { timeZone: 'Europe/Prague' }))
    return czDate.toISOString().split('T')[0] === today
  } catch {
    return false
  }
}

/* ------------------------------------------------------------------ */
/*  NOAA SWPC alerts                                                  */
/* ------------------------------------------------------------------ */

interface SwpcAlert {
  product_id: string
  issue_datetime: string
  message: string
}

async function fetchSwpcAlerts(): Promise<NewsItem[]> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)
    const res = await fetch('https://services.swpc.noaa.gov/products/alerts.json', {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    })
    clearTimeout(timeout)
    if (!res.ok) return []

    const data: SwpcAlert[] = await res.json()
    const today = getTodayCZ()

    return data
      .filter(a => {
        const dt = a.issue_datetime?.split(' ')[0] // "YYYY-MM-DD HH:mm:ss"
        const matches = matchesKeywords(a.message, 'en')
        return dt === today && matches
      })
      .map(a => ({
        id: `swpc-${a.product_id}`,
        title: `NOAA SWPC Alert: ${a.product_id}`,
        snippet: a.message.slice(0, 500),
        source: 'NOAA SWPC',
        sourceUrl: 'https://www.swpc.noaa.gov/products/alerts-watches-and-warnings',
        author: 'NOAA Space Weather Prediction Center',
        publishedAt: new Date(a.issue_datetime + 'Z').toISOString(),
        translated: true,
        originalLang: 'en',
        category: 'swpc' as const,
        forecastQuote: extractForecastQuote(a.message, 'en'),
      }))
  } catch {
    return []
  }
}

/* ------------------------------------------------------------------ */
/*  RSS scraping                                                      */
/* ------------------------------------------------------------------ */

async function fetchRssFeed(source: FeedSource): Promise<NewsItem[]> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)
    const res = await fetch(source.url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/rss+xml, application/xml, text/xml, */*',
        'User-Agent': 'AuroraDog/1.0 (aurora monitoring; auroradog.cz)',
      },
    })
    clearTimeout(timeout)
    if (!res.ok) return []

    const xml = await res.text()
    const items = parseRssItems(xml)

    return items
      .filter(item => {
        const combined = `${item.title} ${item.description}`
        return matchesKeywords(combined, source.lang, source.category) && isToday(item.pubDate)
      })
      .map(item => ({
        id: `${source.name.toLowerCase().replace(/[^a-z0-9]/g, '')}-${hashCode(item.link || item.title)}`,
        title: item.title,
        snippet: item.description.slice(0, 600),
        source: source.name,
        sourceUrl: item.link,
        author: item.author || null,
        publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
        translated: source.lang !== 'cs',
        originalLang: source.lang !== 'cs' ? source.lang : null,
        category: source.category,
        forecastQuote: extractForecastQuote(`${item.title}. ${item.description}`, source.lang),
      }))
  } catch {
    return []
  }
}

function hashCode(s: string): string {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0
  }
  return Math.abs(h).toString(36)
}

/* ------------------------------------------------------------------ */
/*  SolarHam scraper (Kevin Reback — expert bez RSS)                  */
/* ------------------------------------------------------------------ */

async function fetchSolarHam(): Promise<NewsItem[]> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)
    const res = await fetch('https://solarham.com/index.htm', {
      signal: controller.signal,
      headers: {
        'User-Agent': 'AuroraDog/1.0 (aurora monitoring; auroradog.cz)',
        'Accept': 'text/html',
      },
    })
    clearTimeout(timeout)
    if (!res.ok) return []

    const html = await res.text()
    // SolarHam main page has dated updates in plain text blocks
    const today = getTodayCZ()
    const items: NewsItem[] = []

    // Look for date headers like "March 31, 2026" or similar patterns
    const datePatterns = [
      /(<h[23][^>]*>[\s\S]*?<\/h[23]>)((?:(?!<h[23])[\s\S])*)/gi,
      /(<strong>[^<]*\d{4}[^<]*<\/strong>)((?:(?!<strong>)[\s\S]){10,500})/gi,
    ]

    for (const pattern of datePatterns) {
      let m: RegExpExecArray | null
      while ((m = pattern.exec(html)) !== null) {
        const header = m[1].replace(/<[^>]+>/g, '').trim()
        const body = m[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
        if (!body || body.length < 20) continue
        if (!KEYWORDS_EXPERT.some(kw => (header + ' ' + body).toLowerCase().includes(kw))) continue

        items.push({
          id: `solarham-${hashCode(header + body.slice(0, 100))}`,
          title: `SolarHam: ${header.slice(0, 120)}`,
          snippet: body.slice(0, 600),
          source: 'SolarHam (Kevin Reback)',
          sourceUrl: 'https://solarham.com/',
          author: 'Kevin Reback',
          publishedAt: new Date().toISOString(),
          translated: true,
          originalLang: 'en',
          category: 'expert',
          forecastQuote: extractForecastQuote(`${header}. ${body}`, 'en'),
        })
      }
    }
    return items.slice(0, 5) // Max 5 z jedné stránky
  } catch {
    return []
  }
}

/* ------------------------------------------------------------------ */
/*  Hlavní handler                                                    */
/* ------------------------------------------------------------------ */

export async function GET() {
  const todayCZ = getTodayCZ()

  // Paralelní fetch ze všech zdrojů
  const rssSources = FEED_SOURCES.filter(s => s.type === 'rss')
  const results = await Promise.allSettled([
    ...rssSources.map(s => fetchRssFeed(s)),
    fetchSwpcAlerts(),
    fetchSolarHam(),
  ])

  const allItems: NewsItem[] = []
  for (const r of results) {
    if (r.status === 'fulfilled') allItems.push(...r.value)
  }

  // Deduplikace podle ID
  const seen = new Set<string>()
  const unique = allItems.filter(item => {
    if (seen.has(item.id)) return false
    seen.add(item.id)
    return true
  })

  // Seřadit podle času (nejnovější první)
  unique.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())

  // Řadit: CZ experti → EU experti → SWPC → mezinárodní experti → CZ média → INT média
  const categoryOrder: Record<string, number> = {
    expert_cz: 0, expert_eu: 1, swpc: 2, expert: 3, media_cz: 4, media_int: 5, official: 6, social: 7,
  }
  unique.sort((a, b) => {
    const catA = categoryOrder[a.category] ?? 9
    const catB = categoryOrder[b.category] ?? 9
    if (catA !== catB) return catA - catB
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  })

  return NextResponse.json({
    date: todayCZ,
    items: unique,
    sources: FEED_SOURCES.map(s => s.name),
    lastChecked: new Date().toISOString(),
  }, {
    headers: {
      'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=60', // 15min cache
    },
  })
}
