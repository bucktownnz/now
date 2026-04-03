import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0E0F0D',
        'bg-2': '#161714',
        'site-text': '#E8E4DC',
        'text-muted': '#7A7870',
        accent: '#C8A96E',
        'accent-dim': '#8A7249',
        border: '#252620',
        gain: '#4A7C59',
        loss: '#7C4A4A',
      },
      fontFamily: {
        mono: ['"DM Mono"', 'monospace'],
        serif: ['Fraunces', 'serif'],
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease forwards',
        'fade-up-slow': 'fadeUp 0.7s ease forwards',
      },
    },
  },
  plugins: [],
}

export default config
