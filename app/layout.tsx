import type { Metadata } from 'next'
import { Orbitron, Syne, IBM_Plex_Mono } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const orbitron = Orbitron({ subsets: ['latin'], variable: '--font-orbitron', weight: ['400','700','900'] })
const syne     = Syne({ subsets: ['latin'], variable: '--font-syne', weight: ['400','600','700','800'] })
const ibm      = IBM_Plex_Mono({ subsets: ['latin'], variable: '--font-ibm-mono', weight: ['300','400','600'] })

export const metadata: Metadata = {
  title: 'AuroraDog – Živý stav polární záře pro ČR/SK',
  description: 'Sleduj KP index, sluneční vítr a předpovědi aurora borealis v reálném čase. Alerty přes Telegram a WhatsApp.',
  openGraph: {
    title: 'AuroraDog 🐺',
    description: 'Živý stav polární záře pro Česko a Slovensko',
    siteName: 'AuroraDog',
  },
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
