import type { Meta, StoryObj } from "@storybook/react";

import { Badge } from "@components/atoms";

const meta = {
	title: "Display/Badge",
	component: Badge,
	parameters: {
		actions: { disable: true },
		interactions: { disable: true },
	},
	argTypes: {
		children: { control: "text" },
		className: { control: false },
	},
} satisfies Meta<typeof Badge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default = {
	args: {
		children: "Badge",
	},
} satisfies Story;
