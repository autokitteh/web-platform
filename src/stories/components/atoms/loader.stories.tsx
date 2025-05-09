import type { Meta, StoryObj } from "@storybook/react";

import { Loader } from "@components/atoms";

const meta = {
	title: "Display/Loader",
	component: Loader,
	parameters: {
		actions: { disable: true },
	},
	argTypes: {
		size: {
			control: { type: "inline-radio" },
			options: ["sm", "md", "lg", "xl", "2xl"],
		},
		firstColor: {
			control: { type: "inline-radio" },
			options: ["dark-gray", "gray"],
		},
		secondColor: {
			control: { type: "inline-radio" },
			options: ["dark-gray", "gray"],
		},
		isCenter: {
			control: "boolean",
		},
	},
} satisfies Meta<typeof Loader>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary = {
	args: {
		size: "lg",
		firstColor: "dark-gray",
		secondColor: "gray",
		isCenter: true,
	},
} satisfies Story;
