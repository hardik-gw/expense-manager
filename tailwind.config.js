/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: '#0b5e3b', // 🍃 Your cozy green as "brand"
      },
      fontFamily: {
        caveat: ['Caveat', 'cursive'], // ✍🏼 Feels handwritten, keep it clear
      },
    },
  },
  plugins: [],
};
