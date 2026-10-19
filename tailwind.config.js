/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        soviet: {
          50: '#ffebee',
          100: '#ffcdd2',
          500: '#e53935',
          600: '#d32f2f',
          700: '#c62828',
          800: '#b71c1c',
          900: '#8b0000',
          950: '#4a0606',
        },
        gold: {
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
          600: '#d4af37',
          700: '#a16207',
          glow: '#ffbe1a',
        },
        cinema: {
          950: '#090a0d',
          900: '#101116',
          850: '#14151c',
          800: '#1b1d26',
          700: '#262936',
          600: '#34384a',
          500: '#494f66',
        },
        parchment: '#f5efe6'
      },
      fontFamily: {
        russo: ['"Russo One"', 'system-ui', 'sans-serif'],
        cinzel: ['"Cinzel"', 'serif'],
        sans: ['"Outfit"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'soviet-glow': '0 0 25px -5px rgba(218, 41, 28, 0.45)',
        'gold-glow': '0 0 25px -5px rgba(229, 179, 8, 0.4)',
        'cinema-inner': 'inset 0 2px 8px 0 rgba(0, 0, 0, 0.6)',
      },
      animation: {
        'spin-slow': 'spin 12s linear infinite',
        'pulse-glow': 'pulseGlow 2.5s ease-in-out infinite',
        'bob': 'bob 3s ease-in-out infinite',
        'reel-spin': 'reelSpin 1s cubic-bezier(0.15, 0.85, 0.35, 1.2)',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '0.6', filter: 'drop-shadow(0 0 10px rgba(218, 41, 28, 0.5))' },
          '50%': { opacity: '1', filter: 'drop-shadow(0 0 25px rgba(229, 179, 8, 0.8))' },
        },
        bob: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        reelSpin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(1080deg)' },
        }
      }
    },
  },
  plugins: [],
}
