import type { Metadata, Viewport } from 'next'
import { Toaster } from 'react-hot-toast'
import { jsonLdProvozovatel, jsonLdWeb, WEB } from '@/lib/names/seo'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(WEB.url),
  title: {
    default: 'Svět jmen — jména pro děti i zvířata podle zemí',
    template: '%s | Svět jmen',
  },
  description: WEB.popis,
  applicationName: WEB.nazev,
  alternates: { canonical: '/' },
  robots: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  openGraph: {
    type: 'website',
    locale: 'cs_CZ',
    siteName: WEB.nazev,
    title: 'Svět jmen — jména pro děti i zvířata podle zemí',
    description: WEB.popis,
  },
  twitter: { card: 'summary_large_image' },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#faf6ef',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="cs" suppressHydrationWarning>
      <head>
        {/* Bez tohohle by prohlížeč o písmech věděl až po stažení a rozboru
            CSS — nadpisy by na okamžik problikly systémovým písmem. Předem
            se stahují jen základní `latin` řezy; `latin-ext` s háčky si
            prohlížeč dotáhne sám, když ho stránka potřebuje. */}
        <link rel="preload" href="/pisma/baloo2-latin.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/pisma/nunito-latin.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWeb()) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdProvozovatel()) }}
        />
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#04101e',
              color: '#e0f0ff',
              border: '1px solid rgba(0,212,255,0.2)',
              fontSize: '13px',
            },
          }}
        />
      </body>
    </html>
  )
}
