import resolveConfig from "tailwindcss/resolveConfig";

import tailwindConfig from "tailwind-config";

const twConfig = resolveConfig(tailwindConfig);

export const formThemes = {
	"dark": twConfig.theme.colors.black["DEFAULT"],
	"error": twConfig.theme.colors.error["DEFAULT"],
	"gray-300": twConfig.theme.colors.gray[300],
	"gray-400": twConfig.theme.colors.gray[400],
	"gray-500": twConfig.theme.colors.gray[500],
	"gray-800": twConfig.theme.colors.gray[800],
	"green-accent": twConfig.theme.colors["green-accent"]["DEFAULT"],
	"green-light": twConfig.theme.colors["green-light"]["DEFAULT"],
	"light": twConfig.theme.colors.white["DEFAULT"],
	"white": twConfig.theme.colors.white["DEFAULT"],
};
