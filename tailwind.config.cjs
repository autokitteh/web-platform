const colors = require('tailwindcss/colors');

module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {},
    colors: {
      ...colors,
      white: '#FFFFFF',
      black: '#000000',
      greenLight: '#E8FFCA',
      gray: {
        DEFAULT: '#D9D9D9',
        200: '#f1f1f1',
        300: '#d2d2d7',
        400: '#818181',
        500: '#535353',
        600: '#454343',
        700: '#2D2D2D',
        800: '#1B1B1B',
      },
    },
  },
  plugins: [],
};
