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
          dark: '#081c34',   // O azul profundo da sua logo (fundo da sidebar)
          base: '#11335c',   // Azul médio (para headers e destaques)
          light: '#e6f0fa',  // Azul bem clarinho (para fundos de tabelas/cards)
          accent: '#0ea5e9', // Azul vibrante (para os botões de ação)
        }
      }
    },
  },
  plugins: [],
}