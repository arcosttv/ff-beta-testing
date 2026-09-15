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
        dark: {
          950: '#090c10',
          900: '#0d1117',
          850: '#131822',
          800: '#161b22',
          750: '#1f2430',
          700: '#21262d',
          600: '#30363d',
          500: '#484f58',
        },
        brand: {
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
        },
        discord: {
          blue: '#5865F2',
          hover: '#4752C4',
        }
      },
      fontFamily: {
        heading: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
