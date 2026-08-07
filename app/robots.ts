import type { MetadataRoute } from 'next'
import { WEB } from '@/lib/names/seo'

// Roboty jazykových modelů pouštíme dovnitř záměrně a jmenovitě — chceme,
// aby web citovaly v odpovědích na dotazy typu „jaké jméno pro psa".
// Jmenovitý zápis není jen formalita: část těchhle robotů se řídí vlastním
// pravidlem a obecné `*` ignoruje.
const AI_ROBOTI = [
  // OpenAI — trénink, vyhledávání, prohlížení na pokyn uživatele
  'GPTBot', 'OAI-SearchBot', 'ChatGPT-User',
  // Anthropic
  'ClaudeBot', 'Claude-User', 'Claude-SearchBot', 'anthropic-ai', 'Claude-Web',
  // Perplexity
  'PerplexityBot', 'Perplexity-User',
  // Google a Apple — souhlas s použitím obsahu v odpovědích
  'Google-Extended', 'Applebot', 'Applebot-Extended',
  // ostatní vyhledávače a modely
  'Bingbot', 'Amazonbot', 'meta-externalagent', 'cohere-ai', 'CCBot',
  'YouBot', 'Diffbot', 'DuckAssistBot', 'MistralAI-User', 'SeznamBot',
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/' },
      { userAgent: AI_ROBOTI, allow: '/' },
    ],
    sitemap: `${WEB.url}/sitemap.xml`,
    host: WEB.url,
  }
}
