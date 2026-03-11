/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cricket: {
          dark: '#0B1120',
          blue: '#1E3A8A',
          blueLight: '#3B82F6',
          yellow: '#FACC15',
          panel: 'rgba(15, 23, 42, 0.85)',
          panelLight: 'rgba(30, 41, 59, 0.9)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Roboto Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}
