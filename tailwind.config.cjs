import plugin from "tailwindcss/plugin";

// eslint-disable-next-line no-undef
export default {
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
			},
			maxWidth: {
				650: "650px",
				420: "420px",
				680: "680px",
				485: "485px",
			},
			minWidth: {
				550: "550px",
				650: "650px",
			},
			width: {
				"500": "500px",
				"550": "550px",
				"default-icon": "1.625rem",
				"main-nav-sidebar": "85px",
			},
			height: {
				"default-icon": "1.625rem",
			},
			borderRadius: {
				"14": "14px",
				"4xl": "40px",
			},
		},
		screens: {
			"sm": "640px",
			"md": "768px",
			"lg": "1024px",
			"xl": "1280px",
			"2xl": "1536px",
			"3xl": "1736px",
		},
		colors: {
			"transparent": {
				DEFAULT: "transparent",
			},
			"red": {
				DEFAULT: "red",
			},
			"white": {
				DEFAULT: "#ffffff",
			},
			"black": {
				DEFAULT: "#000000",
				900: "#101010",
			},
			"blue": {
				500: "#3b82f6",
			},
			"yellow": {
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
