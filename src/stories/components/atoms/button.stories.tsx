import type { Meta, StoryObj } from "@storybook/react";

import { ButtonVariant } from "@enums/components";

import { Button } from "@components/atoms/buttons";

const meta: Meta<typeof Button> = {
	title: "Buttons/Button",
	component: Button,
	argTypes: {
		className: { control: "text" },
		variant: {
			control: "select",
			options: Object.values(ButtonVariant),
		},
		color: {
			control: "select",
		},
		children: { control: "text" },
		onClick: { action: "clicked" },
	},
};
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		children: "Click Me",
		className: "",
		variant: ButtonVariant.default,
	},
};

export const Filled: Story = {
	args: {
		...Default.args,
		variant: ButtonVariant.filled,
		children: "Filled Button",
	},
};

export const Outline: Story = {
	args: {
		...Default.args,
		variant: ButtonVariant.outline,
		children: "Outline Button",
	},
};

export const Transparent: Story = {
	args: {
		...Default.args,
		children: "Transparent Button",
	},
};
