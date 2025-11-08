// eslint-disable-next-line no-undef, @typescript-eslint/no-require-imports
const plugin = require("tailwindcss/plugin");

// eslint-disable-next-line no-undef
module.exports = {
	content: ["./src/**/*.{js,jsx,ts,tsx}"],
	theme: {
		fontFamily: {
			"fira-sans": ["Fira Sans", "sans-serif"],
			"fira-code": ["Fira Code", "sans-serif"],
			mono: ["monospace", "sans-serif", "helvetica"],
			averta: ["Averta", "sans-serif"],
		},
		extend: {
			strokeWidth: {
				4: "4px",
			},
			fontSize: {
				10: "10px",
				"1.5xl": "22px",
			},
			flex: {
				5: "5 5 0%",
			},
			spacing: {
				5.5: "1.375rem",
				7.5: "1.875rem",
				9.5: "2.375rem",
				"3px": "3px",
				50: "50px",
				160: "160px",
				240: "240px",
				280: "280px",
				300: "300px",
				350: "350px",
				440: "440px",
				500: "500px",
				550: "550px",
				650: "650px",
				700: "700px",
			},
			maxWidth: {
				420: "420px",
				680: "680px",
				485: "485px",
			},
			width: {
				"default-icon": "1.625rem",
				"1/8": "12.5%",
			},
			height: {
				"default-icon": "1.625rem",
			},
			borderWidth: {
				0.5: "0.5px",
			},
			borderRadius: {
				14: "14px",
				20: "20px",
				"4xl": "40px",
			},
			gridTemplateColumns: {
				"auto-fit-248": "repeat(auto-fit, minmax(248px, 1fr))",
				"auto-fit-350": "repeat(auto-fit, minmax(350px, 1fr))",
			},
			zIndex: {
				// Base layers
				base: "0",
				below: "-1",

				// Content layers (1-49)
				content: "10",
				elevated: "20",
				sticky: "30",

				// Navigation layers (50-99)
				header: "50",
				navigation: "60",
				dropdown: "70",

				// Overlay layers (100-199)
				overlay: "100",
				drawer: "110",
				popover: "120",
				modal: "130",
				tooltip: "140",

				// Notifications & Critical (200+)
				toast: "200",

				// System maximum
				max: "9999",
			},
		},
		screens: {
			mini: "480px",
			sm: "640px",
			md: "768px",
			lg: "1024px",
			xl: "1280px",
			"2xl": "1536px",
			"3xl": "1736px",
			"4xl": "1936px",
			minHeightLg: { raw: "(min-height: 1000px)" },
			"maxScreenWidth-1600": { raw: "(max-width: 1600px)" },
		},
		colors: {
			transparent: "transparent",
			red: {
				DEFAULT: "red",
				500: "#ef4444",
			},
			white: "#ffffff",
			black: "#000000",
			blue: {
				500: "#3b82f6",
			},
			yellow: {
				500: "#eab308",
			},
			orange: {
				500: "#f59e42",
			},
			green: {
				200: "#E8FEBE",
				400: "#C8F46C",
				500: "#86D13F",
				600: "#7FAE3C",
				700: "#22c55e",
				800: "#BCF870",
			},
			gray: {
				DEFAULT: "#d9d9d9",
				100: "#f8f8f8",
				150: "#f6f6f6",
				200: "#f3f3f6",
				250: "#f1f1f1",
				300: "#ededed",
				400: "#e8e8eb",
				450: "#d3d5dc",
				500: "#d2d2d7",
				550: "#cdcdcd",
				600: "#bec3d1",
				650: "#a9a9a9",
				700: "#898989",
				750: "#818181",
				800: "#707081",
				850: "#626262",
				900: "#5b5b5b",
				950: "#535353",
				1000: "#515151",
				1050: "#454343",
				1100: "#2d2d2d",
				1150: "#232e3f",
				1200: "#2c2c2c",
				1250: "#1b1b1b",
				1300: "#101010",
				1350: "#4c4c4c",
				1400: "#464646",
				1450: "#1c1c1c",
				1500: "#afafb6",
				1550: "#989090",
			},
			error: {
				DEFAULT: "#FF6B61",
				200: "#FF7438",
			},
			warning: {
				DEFAULT: "#eab308",
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
