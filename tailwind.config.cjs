// eslint-disable-next-line @typescript-eslint/no-var-requires, no-undef
const plugin = require('tailwindcss/plugin');

// eslint-disable-next-line no-undef
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    fontFamily: {
      "fira-sans": ["Fira Sans", "sans-serif"],
      "fira-code": ["Fira Code", "sans-serif"],
    },
    extend: {
      fontSize: {
        "settings-title": "1.3rem",
      },
      flex: {
        5: "5 5 0%",
      },
      spacing: {
        9.5: "2.375rem",
        '3px': '3px'
      },
      maxWidth: {
        650: "650px",
        420: "420px",
        680: "680px",
        550: "550px",
        485: "485px",
      },
      minWidth: {
        550: "550px",
        650: "650px",
      },
      width: {
        500: "500px",
        550: "550px",
        "default-icon": "1.625rem",
        "main-nav-sidebar": "85px",
      },
      height: {
        "default-icon": "1.625rem",
      },
      borderRadius: {
        14: "14px",
        20: "20px",
        "4xl": "40px",
      },
      gridTemplateColumns: {
        'auto-fit-305': 'repeat(auto-fit, minmax(290px, 1fr))',
      }
    },
    screens: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
      "3xl": "1736px",
    },
    colors: {
      transparent: {
        DEFAULT: "transparent",
      },
      red: {
        DEFAULT: "red",
      },
      white: {
        DEFAULT: "#ffffff",
      },
      black: {
        DEFAULT: "#000000",
        100: "#CDCDCD",
        200: "#2C2C2C",
        300: "#BEC3D1",
        500: "#515151",
        900: "#101010",
        'text': "#232E3F"
      },
      blue: {
        500: "#3b82f6",
      },
      yellow: {
        500: "#eab308",
      },
      "green-light": {
        DEFAULT: "#E8FFCA",
      },
      "green-accent": {
        DEFAULT: "#BCF870",
      },
      "gray-black": {
        DEFAULT: "#898989",
        100: "#F6F6F6",
        200: "#F3F3F6",
        300: "#F8F8F8",
        500: "#5B5B5B",
        600: "#626262",
        900: "#A9A9A9",
      },
      gray: {
        DEFAULT: "#D9D9D9",
        200: "#f1f1f1",
        300: "#d2d2d7",
        400: "#818181",
        500: "#535353",
        600: "#454343",
        700: "#2D2D2D",
        800: "#1B1B1B",
        "stroke": "#D3D5DC",
        "light": "#E8E8EB",
        "dark": "#707081",
      },
      error: {
        DEFAULT: "#FF6B61",
        200: "#FF7438",
      },
    },
  },
  plugins: [
    plugin(({ addBase }) => {
      addBase({
        body: {
          fontSize: "14px",
          lineHeight: "20px",
        },
        // TODO: add tags for h1-h6
      });
    }),
  ],
};
