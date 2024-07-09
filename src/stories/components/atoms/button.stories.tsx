import type { Meta, StoryObj } from "@storybook/react";

import { ButtonVariant } from "@enums/components";

import { Button } from "@components/atoms/buttons";

const meta: Meta<typeof Button> = {
	argTypes: {
		children: { control: "text" },
		className: { control: "text" },
		color: {
			control: "select",
		},
		onClick: { action: "clicked" },
		variant: {
			control: "select",
			options: Object.values(ButtonVariant),
		},
	},
	component: Button,
	title: "Buttons/Button",
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
		children: "Filled Button",
		variant: ButtonVariant.filled,
	},
};

export const Outline: Story = {
	args: {
		...Default.args,
		children: "Outline Button",
		variant: ButtonVariant.outline,
	},
};

export const Transparent: Story = {
	args: {
		...Default.args,
		children: "Transparent Button",
	},
};
