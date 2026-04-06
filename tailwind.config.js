/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: '#0b0c10',
        'electric-cyan': '#66fcf1',
        'dark-gray': '#1f2833',
        'light-gray': '#c5c6c7',
        'teal-glow': '#45a29e'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
