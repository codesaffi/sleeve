/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#FAF9F6', // Warm paper/cream
        primary: '#1A1A1A',    // Charcoal text
        secondary: '#4A4A4A',  // Muted text
        border: '#D1CFC7',     // Thin charcoal/muted gray
        accent: '#7C2D33',     // Muted burgundy
        accentHover: '#5C1F25',
        forest: '#2D4A3E',     // Dark forest green
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['"Playfair Display"', 'serif'],
      },
      boxShadow: {
        'vintage': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
      }
    },
  },
  plugins: [],
}