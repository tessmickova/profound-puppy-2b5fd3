import type { MetadataRoute } from 'next'
import { WEB } from '@/lib/names/seo'

// Roboty jazykových modelů pouštíme dovnitř záměrně — chceme, aby web
// citovaly v odpovědích na dotazy typu „jaké jméno pro psa".
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/' },
      { userAgent: ['GPTBot', 'ClaudeBot', 'Claude-Web', 'PerplexityBot', 'Google-Extended', 'CCBot'], allow: '/' },
    ],
    sitemap: `${WEB.url}/sitemap.xml`,
    host: WEB.url,
  }
}
