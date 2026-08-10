import type { MetadataRoute } from 'next'
import { adresyVrstvy, VRSTVY } from '@/lib/names/adresy'
import { WEB } from '@/lib/names/seo'
import { JE_NAHLED } from '@/lib/config'

// Mapa webu se rozděluje podle typu stránky, ne kvůli velikosti (218 adres
// by se do jedné vešlo s přehledem), ale kvůli **měření**: Search Console
// hlásí pokrytí za každou mapu zvlášť, takže je hned vidět, jestli
// vypadávají detaily jmen, nebo stránky zemí. V jedné mapě by to byl jeden
// průměr, ze kterého se nic nepozná.
//
// Seznam adres je v `lib/names/adresy.ts` — sdílí ho i IndexNow a kontrola
// SEO, aby se tři seznamy nemohly rozejít.
//
// Rejstřík k dílčím mapám Next.js nevyrábí; dodává ho `app/sitemap.xml`.
//
// Na náhledu (workers.dev, localhost) mapu nevydáváme vůbec, aby nevznikla
// druhá indexovatelná kopie webu vedle produkční domény.

export { VRSTVY as CASTI }

export async function generateSitemaps() {
  if (JE_NAHLED) return []
  return VRSTVY.map((_, id) => ({ id }))
}

// Next.js 16 předává `id` **jako Promise** (stejně jako `params` u stránek).
// V 15 to bylo prosté číslo — kdo to jen tak přepne, dostane čtyři prázdné
// mapy a build na to neupozorní. Proto se `id` awaituje a pro jistotu se
// převádí na číslo.
export default async function sitemap(
  { id }: { id: number | Promise<number> },
): Promise<MetadataRoute.Sitemap> {
  if (JE_NAHLED) return []
  const cislo = Number(await id)
  const vrstva = VRSTVY[cislo]
  if (!vrstva) return []

  const dnes = new Date()
  return adresyVrstvy(vrstva).map(a => ({
    url: `${WEB.url}${a.cesta === '/' ? '' : a.cesta}`,
    lastModified: dnes,
    changeFrequency: a.cetnost,
    priority: a.priorita,
  }))
}
