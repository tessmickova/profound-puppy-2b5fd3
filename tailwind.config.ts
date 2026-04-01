import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        aurora: {
          green:  '#00ffaa',
          teal:   '#00d4ff',
          purple: '#a855f7',
          pink:   '#ff3d9a',
        },
      },
      fontFamily: {
        head:    ['var(--font-syne)', 'sans-serif'],
        display: ['var(--font-orbitron)', 'sans-serif'],
        mono:    ['var(--font-ibm-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
}

export default config
