import type { MetadataRoute } from 'next'
import { ZEME } from '@/lib/names/data'
import { WEB } from '@/lib/names/seo'

export default function sitemap(): MetadataRoute.Sitemap {
  const dnes = new Date()
  const staticke = [
    { url: '/', priority: 1, changeFrequency: 'weekly' as const },
    { url: '/deti', priority: 0.9, changeFrequency: 'weekly' as const },
    { url: '/zvirata', priority: 0.9, changeFrequency: 'weekly' as const },
    { url: '/rodina', priority: 0.7, changeFrequency: 'monthly' as const },
    { url: '/oblibene', priority: 0.4, changeFrequency: 'monthly' as const },
  ]
  return [
    ...staticke.map(s => ({ url: `${WEB.url}${s.url}`, lastModified: dnes, changeFrequency: s.changeFrequency, priority: s.priority })),
    ...ZEME.map(z => ({
      url: `${WEB.url}/zeme/${z.kod}`,
      lastModified: dnes,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ]
}
