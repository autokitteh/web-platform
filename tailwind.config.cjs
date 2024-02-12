import colors from "tailwindcss/colors";
import plugin from "tailwindcss/plugin";

// eslint-disable-next-line no-undef
module.exports = {
	content: ["./src/**/*.{js,jsx,ts,tsx}"],
	theme: {
		extend: {
			maxWidth: {
				650: "650px",
			},
			width: {
				500: "500px",
				6.5: "1.625rem",
			},
			height: {
				6.5: "1.625rem",
			},
		},
		colors: {
			...colors,
			"white": {
				DEFAULT: "#ffffff",
			},
			"black": {
				DEFAULT: "#000000",
				900: "#101010",
			},
			"green-light": {
				DEFAULT: "#E8FFCA",
			},
			"green-accent": {
				DEFAULT: "#BCF870",
			},
			"gray-black": {
				DEFAULT: "#898989",
			},
			"gray": {
				DEFAULT: "#D9D9D9",
				200: "#f1f1f1",
				300: "#d2d2d7",
				400: "#818181",
				500: "#535353",
				600: "#454343",
				700: "#2D2D2D",
				800: "#1B1B1B",
			},
			"error": {
				DEFAULT: "#FF6B61",
				200: "#FF7438",
			},
		},
	},
	plugins: [
		plugin(function ({ addBase }) {
			addBase({
				body: {
					fontSize: "14px",
					lineHeight: "20px",
				},
			});
		}),
	],
};
