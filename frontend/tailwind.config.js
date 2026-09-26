/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#F1E8D8',
        primary: '#29251F',
        secondary: '#62594E',
        border: '#C8BCA8',
        white: '#F8F2E7',
        accent: '#8E3D36',
        accentHover: '#713029',
        forest: '#354D3F',
        ochre: '#B1843F',
        'faded-blue': '#526D78',
      },
      fontFamily: {
        sans: ['"DM Sans"', 'sans-serif'],
        serif: ['"DM Serif Display"', 'serif'],
        handwritten: ['"Caveat"', 'cursive'],
      },
      boxShadow: {
        vintage: '3px 4px 0 rgba(41, 37, 31, 0.12), 0 10px 24px rgba(41, 37, 31, 0.06)',
      }
    },
  },
  plugins: [],
}