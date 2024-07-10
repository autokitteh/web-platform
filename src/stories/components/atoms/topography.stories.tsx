import type { Meta, StoryObj } from "@storybook/react";

import { Typography } from "@components/atoms";

const meta = {
	title: "Display/Typography",
	component: Typography,
	parameters: {
		actions: { disable: true },
	},
	argTypes: {
		element: {
			control: "inline-radio",
			options: ["h1", "h2", "h3", "h4", "h5", "h6", "p", "div", "i", "b", "u"],
		},
		children: { control: "text" },
		className: { control: "text" },
		size: {
			control: "inline-radio",
			options: ["default", "small", "medium", "large"],
		},
	},
} satisfies Meta<typeof Typography>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary = {
	args: {
		children: "Sample text",
		element: "b",
		size: "default",
		className: "",
	},
} satisfies Story;
