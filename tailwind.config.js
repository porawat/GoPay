/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        greenLight: '#e6ffe6',
        greenAccent: '#4ade80',
      },
      fontFamily: {
        kanit: ['Kanit', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
};