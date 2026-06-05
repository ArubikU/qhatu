import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary:  '#7B3FF2',
        deep:     '#4B17B6',
        carbon:   '#0F0D17',
        lavender: '#C8B6FF',
      },
      fontFamily: {
        heading: ['var(--font-poppins)', 'sans-serif'],
        body:    ['var(--font-inter)', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '22px',
        '3xl': '28px',
      },
      backgroundImage: {
        'gradient-qhatu': 'linear-gradient(135deg, #7B3FF2 0%, #4B17B6 100%)',
      },
      boxShadow: {
        'glow-purple': '0 0 20px rgba(123,63,242,0.45), 0 0 40px rgba(123,63,242,0.18)',
        'card-purple': '0 8px 32px rgba(123,63,242,0.25)',
      },
    },
  },
  plugins: [],
}

export default config
