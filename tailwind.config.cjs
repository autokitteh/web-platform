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
		},
		colors: {
			...colors,
			"white": {
				DEFAULT: "#ffffff",
			},
			"black": {
				DEFAULT: "#000000",
			},
			"green-light": {
				DEFAULT: "#E8FFCA",
			},
			"green-accent": {
				DEFAULT: "#BCF870",
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
