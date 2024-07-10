import type { Meta, StoryObj } from "@storybook/react";

import { Typography } from "@components/atoms";

const meta = {
	title: "Display/Typography",
	component: Typography,
	parameters: {
		actions: { disable: true },
		interactions: { disable: true },
	},
	argTypes: {
		element: {
			control: "inline-radio",
			options: ["div", "i", "b", "u"],
		},
		children: { control: "text" },
		className: { control: "text" },
		size: {
			control: "inline-radio",
			options: ["small", "medium", "large"],
		},
	},
} satisfies Meta<typeof Typography>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary = {
	args: {
		element: "div",
		children: "Sample text",
		className: "",
		size: "medium",
	},
} satisfies Story;
