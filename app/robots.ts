import type { MetadataRoute } from 'next'
import { WEB } from '@/lib/names/seo'
import { JE_NAHLED } from '@/lib/config'

// Roboty jazykových modelů pouštíme dovnitř záměrně a jmenovitě — chceme,
// aby web citovaly v odpovědích na dotazy typu „jaké jméno pro psa".
// Jmenovitý zápis není jen formalita: část těchhle robotů se řídí vlastním
// pravidlem a obecné `*` ignoruje.
const AI_ROBOTI = [
  'GPTBot', 'OAI-SearchBot', 'ChatGPT-User',
  'ClaudeBot', 'Claude-User', 'Claude-SearchBot', 'anthropic-ai', 'Claude-Web',
  'PerplexityBot', 'Perplexity-User',
  'Google-Extended', 'Applebot', 'Applebot-Extended',
  'Bingbot', 'Amazonbot', 'meta-externalagent', 'cohere-ai', 'CCBot',
  'YouBot', 'Diffbot', 'DuckAssistBot', 'MistralAI-User', 'SeznamBot',
]

/**
 * Osobní nástroje a nekonečné kombinace filtrů do indexu nepatří.
 * Filtry běží přes parametry, které tu zavíráme jmenovitě — jinak by
 * crawler chodil donekonečna po `?zeme=…&styl=…` a katalog by se
 * v indexu množil sám ze sebe.
 */
const ZAKAZANE = ['/oblibene', '/rodina', '/aurora', '/admin', '/docs', '/*?*']

export default function robots(): MetadataRoute.Robots {
  // Náhled se neindexuje vůbec — jinak by na workers.dev vznikla druhá
  // kopie webu, která by konkurovala produkční doméně.
  if (JE_NAHLED) {
    return { rules: [{ userAgent: '*', disallow: '/' }] }
  }

  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ZAKAZANE },
      { userAgent: AI_ROBOTI, allow: '/', disallow: ZAKAZANE },
    ],
    sitemap: `${WEB.url}/sitemap.xml`,
    host: WEB.url,
  }
}
