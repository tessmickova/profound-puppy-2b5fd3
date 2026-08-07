import type { Metadata, Viewport } from 'next'
import { Orbitron, Syne, IBM_Plex_Mono } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import { jsonLdWeb, WEB } from '@/lib/names/seo'
import './globals.css'

const orbitron = Orbitron({ subsets: ['latin'], variable: '--font-orbitron', weight: ['400','700','900'] })
const syne     = Syne({ subsets: ['latin'], variable: '--font-syne', weight: ['400','600','700','800'] })
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
      <body className={`${orbitron.variable} ${syne.variable} ${ibm.variable}`}>
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
