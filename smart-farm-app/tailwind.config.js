/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-green': '#2ecc71',
        'dark-green': '#27ae60',
        'light-green': '#e8f8f5',
      }
    },
  },
  plugins: [],
}