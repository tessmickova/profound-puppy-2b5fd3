/** @type {import('next').NextConfig} */

// Produkční build se zastaví, dokud nejsou doplněné údaje provozovatele.
// Radši ať spadne build, než aby web tvrdil návštěvníkům i inzerentům
// vymyšlené IČO nebo neexistující firmu. Náhled (workers.dev, localhost)
// se staví bez téhle zarážky — spouští ji až NEXT_PUBLIC_PRODUKCE=1.
if (process.env.NEXT_PUBLIC_PRODUKCE === '1') {
  const chybi = []
  const zastupne = h => !String(h ?? '').trim() || String(h).includes('VYPLNIT')
  const pole = {
    NEXT_PUBLIC_PROVOZOVATEL: process.env.NEXT_PUBLIC_PROVOZOVATEL,
    NEXT_PUBLIC_ICO: process.env.NEXT_PUBLIC_ICO,
    NEXT_PUBLIC_SIDLO: process.env.NEXT_PUBLIC_SIDLO,
    NEXT_PUBLIC_KONTAKT: process.env.NEXT_PUBLIC_KONTAKT,
    NEXT_PUBLIC_KONTAKT_REKLAMA: process.env.NEXT_PUBLIC_KONTAKT_REKLAMA,
    NEXT_PUBLIC_UCET: process.env.NEXT_PUBLIC_UCET,
  }
  for (const [klic, hodnota] of Object.entries(pole)) {
    if (zastupne(hodnota)) chybi.push(klic)
  }
  if (!/^\d{8}$/.test(String(process.env.NEXT_PUBLIC_ICO ?? '')) && !chybi.includes('NEXT_PUBLIC_ICO')) {
    chybi.push('NEXT_PUBLIC_ICO (osm číslic)')
  }
  if (process.env.NEXT_PUBLIC_PLATCE_DPH === '1' && zastupne(process.env.NEXT_PUBLIC_DIC)) {
    chybi.push('NEXT_PUBLIC_DIC')
  }
  const url = String(process.env.NEXT_PUBLIC_URL ?? '')
  if (!url.startsWith('https://') || url.includes('localhost') || url.includes('workers.dev')) {
    chybi.push('NEXT_PUBLIC_URL (skutečná produkční doména přes https)')
  }
  if (chybi.length) {
    throw new Error(
      '\n\nProdukční build zastaven — chybí údaje provozovatele:\n  - '
      + chybi.join('\n  - ')
      + '\n\nDoplňte je ve `wrangler.jsonc` (vars) a v `ads-worker/wrangler.toml`.'
      + '\nNáhled se staví bez NEXT_PUBLIC_PRODUKCE=1.\n',
    )
  }
}

const nextConfig = {
  // `images.remotePatterns` tu nic neřídí: web nepoužívá `next/image`,
  // loga inzerentů se vykreslují prostým <img> a hlídá je CSP `img-src`.
  poweredByHeader: false,
  async headers() {
    // Reklamní službu pouštíme jen tam, kam web opravdu chodí. Bez adresy
    // služby se do connect-src nic navíc nedostane.
    const ads = String(process.env.NEXT_PUBLIC_ADS_API ?? '').replace(/\/$/, '')
    const csp = [
      "default-src 'self'",
      // Next.js injektuje inline runtime; 'unsafe-eval' povolujeme jen ve vývoji.
      `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === 'development' ? " 'unsafe-eval'" : ''}`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:" + (ads ? ` ${ads}` : ''),
      "font-src 'self' data:",
      "connect-src 'self'" + (ads ? ` ${ads}` : ''),
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
      'upgrade-insecure-requests',
    ].join('; ')

    return [{
      source: '/:cesta*',
      headers: [
        { key: 'Content-Security-Policy', value: csp },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'X-Frame-Options', value: 'DENY' },
        {
          key: 'Permissions-Policy',
          value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()',
        },
        { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
      ],
    }]
  },
}

module.exports = nextConfig
