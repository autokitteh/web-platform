import tailwindConfig from "tailwind-config";
import resolveConfig from "tailwindcss/resolveConfig";

const twConfig = resolveConfig(tailwindConfig);

export const formColors = {
	"error": twConfig.theme.colors.error["DEFAULT"],
	"black": twConfig.theme.colors.black["DEFAULT"],
	"white": twConfig.theme.colors.white["DEFAULT"],
	"gray-300": twConfig.theme.colors.gray[300],
	"gray-400": twConfig.theme.colors.gray[400],
	"gray-500": twConfig.theme.colors.gray[500],
	"gray-800": twConfig.theme.colors.gray[800],
	"green-light": twConfig.theme.colors["green-light"]["DEFAULT"],
};
