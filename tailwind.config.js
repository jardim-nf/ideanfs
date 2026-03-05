/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        idea: {
          dark: '#081c34',
          base: '#11335c',
          light: '#e6f0fa',
          accent: '#0ea5e9',
        }
      }
    },
  },
  plugins: [],
}