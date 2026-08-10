import { CASTI } from '../sitemap'
import { WEB } from '@/lib/names/seo'
import { JE_NAHLED } from '@/lib/config'

// Rejstřík map webu.
//
// Next.js z `generateSitemaps()` vyrobí jednotlivé mapy na `/sitemap/0.xml`
// až `/sitemap/3.xml`, ale **rejstřík k nim nevyrobí**. Bez něj by
// `robots.txt` odkazoval na neexistující adresu a vyhledávače by o dílčích
// mapách nevěděly.
//
// Proč `/sitemap-index.xml` a ne `/sitemap.xml`: adresu `sitemap.xml` si
// od Next.js 16 zabírá samotná konvence metadat a vlastní handler na ní
// build odmítne („Conflicting route and metadata"). Vyhledávačům to nevadí,
// rejstřík může být na libovolné adrese — hlavně že na ni ukazuje
// `robots.txt`.
//
// Pořadí musí sedět s `CASTI` v `app/sitemap.ts` — proto se odtud i importuje.

export const dynamic = 'force-static'

export function GET() {
  if (JE_NAHLED) {
    return new Response('', { status: 404 })
  }

  const zmena = new Date().toISOString()
  const mapy = CASTI.map((_, i) =>
    `  <sitemap>\n`
    + `    <loc>${WEB.url}/sitemap/${i}.xml</loc>\n`
    + `    <lastmod>${zmena}</lastmod>\n`
    + `  </sitemap>`,
  ).join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n`
    + `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`
    + `${mapy}\n`
    + `</sitemapindex>\n`

  return new Response(xml, {
    headers: {
      'content-type': 'application/xml; charset=utf-8',
      'cache-control': 'public, max-age=3600',
    },
  })
}
