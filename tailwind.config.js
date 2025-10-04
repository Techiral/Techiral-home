/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/aspect-ratio'),
  ],
}
