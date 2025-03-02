import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
	stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],

	addons: [
		"@storybook/addon-links",
		"@storybook/addon-essentials",
		"@storybook/addon-onboarding",
		"@storybook/addon-interactions",
		"@chromatic-com/storybook",
		"@storybook/addon-docs",
	],

	framework: {
		name: "@storybook/react-vite",
		options: {},
	},

	typescript: {
		reactDocgen: "react-docgen-typescript",
	},

	docs: {
		defaultName: "Documentation",
		autodocs: true,
	},
};

export default config;
