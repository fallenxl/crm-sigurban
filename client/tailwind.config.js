/** @type {import('tailwindcss').Config} */
import withMt from '@material-tailwind/react/utils/withMT'
export default withMt({
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  darkMode:'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter var', 'sans-serif'],
      },
      typography: {
        defaultProps:{
          fontFamily: 'Inter var',
        }
      }
    },
  },
  plugins: [
    // Nested CSS
    require('tailwindcss/nesting'),
  ],
})