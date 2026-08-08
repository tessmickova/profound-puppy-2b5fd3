import type { MetadataRoute } from 'next'
import { ZEME } from '@/lib/names/data'
import { ENTITY_SE_STRANKOU } from '@/lib/names/entita'
import { KATEGORIE_INFO } from '@/lib/names/types'
import type { Kategorie } from '@/lib/names/types'
import { WEB } from '@/lib/names/seo'
import { JE_NAHLED } from '@/lib/config'

// V mapě webu je jen to, co má být v indexu. Osobní nástroje (uložená jména,
// rodinný profil) sem nepatří — jsou označené noindex a v mapě by si
// odporovaly samy se sebou.
//
// Na náhledu (workers.dev, localhost) mapu nevydáváme vůbec, aby nevznikla
// druhá indexovatelná kopie webu vedle produkční domény.

const KATEGORIE: Kategorie[] = [
  'holka', 'kluk', 'pes', 'fenka', 'kocour', 'kocka', 'kun', 'kralik', 'papousek', 'krecek',
]

export default function sitemap(): MetadataRoute.Sitemap {
  if (JE_NAHLED) return []

  const dnes = new Date()
  const zaznam = (cesta: string, priorita: number, cetnost: 'weekly' | 'monthly' | 'yearly') => ({
    url: `${WEB.url}${cesta}`,
    lastModified: dnes,
    changeFrequency: cetnost,
    priority: priorita,
  })

  return [
    zaznam('/', 1, 'weekly'),
    zaznam('/deti', 0.9, 'weekly'),
    zaznam('/zvirata', 0.9, 'weekly'),
    ...KATEGORIE.map(k => zaznam(`/jmena/${KATEGORIE_INFO[k].slug}`, 0.85, 'weekly')),
    ...ENTITY_SE_STRANKOU.map(e => zaznam(`/jmeno/${e.slug}`, 0.7, 'monthly')),
    ...ZEME.map(z => zaznam(`/zeme/${z.kod}`, 0.6, 'monthly')),
    zaznam('/metodika', 0.5, 'yearly'),
    zaznam('/reklama', 0.3, 'yearly'),
    zaznam('/podminky', 0.2, 'yearly'),
    zaznam('/soukromi', 0.2, 'yearly'),
  ]
}
