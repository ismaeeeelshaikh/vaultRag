/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          dark: '#050308',
          card: '#0c0a10',
        },
        primary: {
          500: '#a78bfa',
          600: '#7c3aed',
        },
        cyan: {
          500: '#00f2ff',
        }
      },
    },
  },
  plugins: [],
}