import type { Metadata, Viewport } from 'next'
import { Orbitron, Baloo_2, Nunito, IBM_Plex_Mono } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import { jsonLdProvozovatel, jsonLdWeb, WEB } from '@/lib/names/seo'
import './globals.css'

// Nadpisy: Baloo 2 — zaoblené konce tahů působí vlídně (jde o jména dětí
// a zvířat), ale kresba zůstává moderní a v tučném řezu čitelná. Syne měla
// tvrdé geometrické tvary a hlavně se načítala jen s podmnožinou `latin`,
// takže česká diakritika padala do náhradního písma a nadpisy se rozjížděly.
const nadpis = Baloo_2({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-nadpis',
  weight: ['500', '600', '700', '800'],
  display: 'swap',
})

// Text: Nunito — zaoblený groteskový bezpatkový font, dobře se čte v malých
// velikostech a ladí s nadpisy, aniž by se s nimi pral.
const text = Nunito({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-text',
  weight: ['400', '600', '700'],
  display: 'swap',
})

// Zbytek patří AuroraDogu, který sdílí stejný layout.
const orbitron = Orbitron({ subsets: ['latin'], variable: '--font-orbitron', weight: ['400','700','900'] })
const ibm      = IBM_Plex_Mono({ subsets: ['latin'], variable: '--font-ibm-mono', weight: ['300','400','600'] })

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
    <html lang="cs" className="dark" data-theme="dark" data-fontscale="normal" suppressHydrationWarning>
      <body className={`${orbitron.variable} ${nadpis.variable} ${text.variable} ${ibm.variable}`}>
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            try {
              var t = localStorage.getItem('auroradog_theme');
              var f = localStorage.getItem('auroradog_fontscale');
              var el = document.documentElement;
              if (t === 'light') { el.setAttribute('data-theme','light'); el.classList.remove('dark'); }
              if (f === 'large') el.setAttribute('data-fontscale','large');
            } catch(e){}
          })();
        `}} />
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
