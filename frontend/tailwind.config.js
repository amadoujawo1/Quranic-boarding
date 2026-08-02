/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        emerald: {
          950: '#032313',
          900: '#064e2b',
          800: '#0a6c3d',
          700: '#0f8a4f',
          600: '#14a861',
        },
        gold: {
          400: '#f3d069',
          500: '#d4af37',
          600: '#b89220',
          700: '#947214',
        },
        islamic: {
          green: '#0b4f2c',
          deepGreen: '#042714',
          lightGreen: '#e8f5e9',
          gold: '#d4af37',
          accentGold: '#f7d363'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        arabic: ['Amiri', 'serif']
      }
    },
  },
  plugins: [],
}
