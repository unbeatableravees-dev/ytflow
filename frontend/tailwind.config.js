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
        brand: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
          glow: '#00f2fe'
        },
        accent: {
          500: '#6366f1',
          600: '#4f46e5',
        },
        dark: {
          bg: '#090b10',
          surface: '#10141d',
          card: '#151b26',
          border: '#232d3f',
          hover: '#1c2433'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 15px -3px rgba(6, 182, 212, 0.3)' },
          '100%': { boxShadow: '0 0 25px 2px rgba(6, 182, 212, 0.6)' },
        }
      }
    },
  },
  plugins: [],
}
