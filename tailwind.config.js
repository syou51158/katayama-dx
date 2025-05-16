/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'katayama': {
          50: '#f0f6fb',
          100: '#dceaf5',
          200: '#bfd8ec',
          300: '#93bdde',
          400: '#619ccc',
          500: '#3f7fba',
          600: '#2d639d',
          700: '#265180',
          800: '#23446a',
          900: '#223a5a',
          950: '#0f1b2d',
        },
        'construction': {
          50: '#fcf9ed',
          100: '#f8f1d3',
          200: '#f1e1a6',
          300: '#e9cc6f',
          400: '#e2b645',
          500: '#d9982b',
          600: '#c47721',
          700: '#a3581e',
          800: '#85461f',
          900: '#6e3a1d',
          950: '#3f1d0e',
        },
      },
      fontFamily: {
        'sans': ['Noto Sans JP', 'sans-serif'],
        'serif': ['Noto Serif JP', 'serif'],
      },
      boxShadow: {
        'premium': '0 4px 20px -2px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
      backgroundImage: {
        'construction-pattern': "url('/images/construction-bg.jpg')",
      }
    },
  },
  plugins: [],
}