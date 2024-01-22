const colors = require('tailwindcss/colors')

module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {},
    colors: {
        ...colors,
      white: '#FFFFFF',
      black: '#000000',
    },
  },
  plugins: [],
};
