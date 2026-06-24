/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Ember — the oven-fire accent (replaces "pizza")
        ember: {
          50: '#fff1ea',
          100: '#ffe0d1',
          200: '#ffc2a3',
          300: '#ff9c6b',
          400: '#ff7f47',
          500: '#ff6b35',
          600: '#e6491a',
          700: '#bf3814',
          800: '#962c14',
          900: '#5c1c0f',
          950: '#2e1108',
        },
        // Char — the night-kitchen background scale (replaces "crust" as the neutral)
        char: {
          50: '#f4f1ed',
          100: '#e4ddd3',
          200: '#c7b9a8',
          300: '#a3917a',
          400: '#7a6852',
          500: '#574838',
          600: '#3c3024',
          700: '#2b2219',
          800: '#1f1812',
          900: '#16110d',
          950: '#0d0a07',
        },
        // Copper — secondary warm accent for highlights/borders
        copper: {
          50: '#fbf3e7',
          100: '#f5e3c4',
          200: '#eccb91',
          300: '#e0ac5e',
          400: '#d9a05b',
          500: '#c2843c',
          600: '#a06a2c',
          700: '#7d5224',
          800: '#5e3e1e',
          900: '#4a3119',
        },
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'Impact', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ember-flicker': 'flicker 2.4s ease-in-out infinite',
      },
      keyframes: {
        flicker: {
          '0%, 100%': { opacity: 0.55, transform: 'scale(1)' },
          '50%': { opacity: 0.9, transform: 'scale(1.06)' },
        },
      },
      boxShadow: {
        ember: '0 0 40px -8px rgba(255, 107, 53, 0.45)',
      },
    },
  },
  plugins: [],
};
