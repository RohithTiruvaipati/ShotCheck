/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          500: '#38bdf8',
          700: '#0ea5e9'
        }
      }
    }
  },
  plugins: [],
};
