// eslint-disable-next-line no-undef, @typescript-eslint/no-require-imports
const plugin = require("tailwindcss/plugin");

// eslint-disable-next-line no-undef
module.exports = {
	content: ["./src/**/*.{js,jsx,ts,tsx}", "./node_modules/@tremor/**/*.{js,ts,jsx,tsx}"],
	safelist: [
		"nodrag",
		"nopan",
		{
			pattern:
				/^(bg-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
			variants: ["hover", "ui-selected"],
		},
		{
			pattern:
				/^(text-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
			variants: ["hover", "ui-selected"],
		},
		{
			pattern:
				/^(border-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
			variants: ["hover", "ui-selected"],
		},
		{
			pattern:
				/^(ring-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
		},
		{
			pattern:
				/^(stroke-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
		},
		{
			pattern:
				/^(fill-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
		},
	],
	theme: {
		fontFamily: {
			"fira-sans": ["Fira Sans", "sans-serif"],
			"fira-code": ["Fira Code", "sans-serif"],
			mono: ["monospace", "sans-serif", "helvetica"],
			averta: ["Averta", "sans-serif"],
		},
		extend: {
			strokeWidth: {
				1.5: "1.5px",
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
				"above-drawer-overlay": "115",
				popover: "120",
				"modal-overlay": "666",
				"modal-button": "999999",
				modal: "99994",
				tooltip: "140",

				systemLog: "150",

				// Notifications & Critical (200+)
				toast: "9999",

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
				400: "#f87171",
				500: "#ef4444",
				950: "#450a0a",
				600: "#dc2626",
			},
			white: "#ffffff",
			black: "#000000",
			blue: {
				300: "#93c5fd",
				400: "#60a5fa",
				500: "#3b82f6",
				600: "#2563eb",
				900: "#1e3a8a",
			},
			yellow: {
				500: "#eab308",
			},
			orange: {
				300: "#fdba74",
				400: "#fb923c",
				500: "#f59e42",
			},
			amber: {
				300: "#fcd34d",
				400: "#fbbf24",
				500: "#f59e0b",
				600: "#d97706",
				900: "#78350f",
			},
			green: {
				200: "#E8FEBE",
				300: "#86efac",
				400: "#C8F46C",
				500: "#86D13F",
				600: "#7FAE3C",
				700: "#22c55e",
				800: "#BCF870",
				900: "#14532d",
			},
			purple: {
				300: "#d8b4fe",
				400: "#c084fc",
				500: "#a855f7",
				600: "#9333ea",
				900: "#581c87",
			},
			emerald: {
				50: "#ecfdf5",
				100: "#d1fae5",
				200: "#a7f3d0",
				300: "#6ee7b7",
				400: "#34d399",
				500: "#10b981",
				600: "#059669",
				700: "#047857",
				800: "#065f46",
				900: "#064e3b",
				950: "#022c22",
			},
			slate: {
				50: "#f8fafc",
				100: "#f1f5f9",
				200: "#e2e8f0",
				300: "#cbd5e1",
				400: "#94a3b8",
				500: "#64748b",
				600: "#475569",
				700: "#334155",
				800: "#1e293b",
				900: "#0f172a",
				950: "#020617",
			},
			cyan: {
				50: "#ecfeff",
				100: "#cffafe",
				200: "#a5f3fc",
				300: "#67e8f9",
				400: "#22d3ee",
				500: "#06b6d4",
				600: "#0891b2",
				700: "#0e7490",
				800: "#155e75",
				900: "#164e63",
				950: "#083344",
			},
			tremor: {
				brand: {
					faint: "#eff6ff",
					muted: "#bfdbfe",
					subtle: "#60a5fa",
					DEFAULT: "#3b82f6",
					emphasis: "#1d4ed8",
					inverted: "#ffffff",
				},
				background: {
					muted: "#f9fafb",
					subtle: "#f3f4f6",
					DEFAULT: "#ffffff",
					emphasis: "#374151",
				},
				border: {
					DEFAULT: "#e5e7eb",
				},
				ring: {
					DEFAULT: "#e5e7eb",
				},
				content: {
					subtle: "#9ca3af",
					DEFAULT: "#6b7280",
					emphasis: "#374151",
					strong: "#111827",
					inverted: "#ffffff",
				},
			},
			"dark-tremor": {
				brand: {
					faint: "#0b1229",
					muted: "#172554",
					subtle: "#1e40af",
					DEFAULT: "#3b82f6",
					emphasis: "#60a5fa",
					inverted: "#030712",
				},
				background: {
					muted: "#131a2b",
					subtle: "#1f2937",
					DEFAULT: "#111827",
					emphasis: "#d1d5db",
				},
				border: {
					DEFAULT: "#1f2937",
				},
				ring: {
					DEFAULT: "#1f2937",
				},
				content: {
					subtle: "#4b5563",
					DEFAULT: "#6b7280",
					emphasis: "#e5e7eb",
					strong: "#f9fafb",
					inverted: "#000000",
				},
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
