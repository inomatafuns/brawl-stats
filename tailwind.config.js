/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brawl: {
          blue: '#1BA5F5',
          yellow: '#FFC425',
          red: '#FF4757',
          purple: '#9B59B6',
          green: '#2ECC71',
          orange: '#F39C12',
          pink: '#E91E63',
          dark: '#1a1a2e',
          darker: '#16213e',
          card: '#0f3460',
          accent: '#e94560',
        },
      },
      fontFamily: {
        brawl: ['Lilita One', 'Bangers', 'sans-serif'],
      },
      boxShadow: {
        'brawl': '0 4px 0 rgba(0, 0, 0, 0.3)',
        'brawl-lg': '0 6px 0 rgba(0, 0, 0, 0.4)',
        'glow-yellow': 'none',
        'glow-blue': 'none',
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: 'none' },
          '50%': { boxShadow: 'none' },
        },
      },
    },
  },
  plugins: [],
}
