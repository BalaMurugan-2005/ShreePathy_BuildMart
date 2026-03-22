/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          yellow: '#F5C518',
          black: '#1A1A1A',
          gray: '#2D2D2D',
          light: '#F7F7F7',
          orange: '#E07B00',
        },
      },
      fontFamily: {
        sans: ["'Inter'", 'sans-serif'],
      },
    },
  },
  plugins: [],
}
