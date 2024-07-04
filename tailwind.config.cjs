import plugin from "tailwindcss/plugin";

// eslint-disable-next-line no-undef
export default {
	content: ["./src/**/*.{js,jsx,ts,tsx}"],
	plugins: [
		plugin(({ addBase }) => {
			addBase({
				body: {
					fontSize: "14px",
					lineHeight: "20px",
				},
			});
		}),
	],
	theme: {
		colors: {
			"black": {
				900: "#101010",
				DEFAULT: "#000000",
			},
			"blue": {
				500: "#3b82f6",
			},
			"error": {
				200: "#FF7438",
				DEFAULT: "#FF6B61",
			},
			"gray": {
				200: "#f1f1f1",
				300: "#d2d2d7",
				400: "#818181",
				500: "#535353",
				600: "#454343",
				700: "#2D2D2D",
				800: "#1B1B1B",
				DEFAULT: "#D9D9D9",
			},
			"gray-black": {
				100: "#F6F6F6",
				DEFAULT: "#898989",
			},
			"green-accent": {
				DEFAULT: "#BCF870",
			},
			"green-light": {
				DEFAULT: "#E8FFCA",
			},
			"red": {
				DEFAULT: "red",
			},
			"transparent": {
				DEFAULT: "transparent",
			},
			"white": {
				DEFAULT: "#ffffff",
			},
			"yellow": {
				500: "#eab308",
			},
		},
		extend: {
			borderRadius: {
				"14": "14px",
				"4xl": "40px",
			},
			flex: {
				5: "5 5 0%",
			},
			fontSize: {
				"settings-title": "1.3rem",
			},
			height: {
				"default-icon": "1.625rem",
			},
			maxWidth: {
				420: "420px",
				485: "485px",
				650: "650px",
				680: "680px",
			},
			minWidth: {
				550: "550px",
				650: "650px",
			},
			spacing: {
				9.5: "2.375rem",
			},
			width: {
				"500": "500px",
				"550": "550px",
				"default-icon": "1.625rem",
				"main-nav-sidebar": "85px",
			},
		},
		fontFamily: {
			"fira-code": ["Fira Code", "sans-serif"],
			"fira-sans": ["Fira Sans", "sans-serif"],
		},
		screens: {
			"2xl": "1536px",
			"3xl": "1736px",
			"lg": "1024px",
			"md": "768px",
			"sm": "640px",
			"xl": "1280px",
		},
	},
};
