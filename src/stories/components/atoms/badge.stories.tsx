import type { Meta, StoryObj } from "@storybook/react";

import { Badge } from "@components/atoms";

const meta: Meta<typeof Badge> = {
	argTypes: {
		children: { control: "text" },
		className: { control: "text" },
	},
	component: Badge,
	title: "Core/Badge",
};
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		children: "Default Badge",
		className: "",
	},
};

export const Custom: Story = {
	args: {
		children: "Custom Badge",
		className: "bg-blue-500 text-white",
	},
};
