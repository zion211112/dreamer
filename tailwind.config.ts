import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0a0a0b',
        'bg-raised': '#101012',
        'bg-hover': '#17171a',
        'bg-elevated': '#1c1c20',
        border: '#222226',
        'border-strong': '#2e2e34',
        fg: '#ececef',
        'fg-muted': '#7a7a85',
        'fg-dim': '#4a4a52',
        accent: '#a78bfa',
        'accent-hi': '#c4b5fd',
        cyan: '#22d3ee',
        green: '#4ade80',
        amber: '#fbbf24',
        red: '#f87171',
        pink: '#f472b6',
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
        mono: ['var(--font-mono)'],
        serif: ['var(--font-serif)'],
      },
      fontSize: {
        xs: ['10.5px', { lineHeight: '1.4' }],
        sm: ['11.5px', { lineHeight: '1.4' }],
        base: ['13px', { lineHeight: '1.45' }],
        lg: ['15px', { lineHeight: '1.5' }],
        xl: ['22px', { lineHeight: '1.3' }],
        '2xl': ['28px', { lineHeight: '1.25' }],
        '3xl': ['44px', { lineHeight: '1.1' }],
      },
      spacing: {
        1: '4px',
        2: '8px',
        3: '12px',
        4: '16px',
        6: '24px',
        8: '32px',
      },
      borderRadius: {
        sm: '4px',
        md: '6px',
        lg: '8px',
        xl: '12px',
      },
      animation: {
        'aura-breathe': 'aura-breathe 4s ease-in-out infinite',
      },
      keyframes: {
        'aura-breathe': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.07)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config