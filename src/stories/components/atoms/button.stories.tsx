import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "@components/atoms/buttons";
import { EButtonVariant } from "@enums";

const meta: Meta<typeof Button> = {
	title: "Buttons/Button",
	component: Button,
	argTypes: {
		className: { control: "text" },
		variant: {
			control: "select",
			options: Object.values(EButtonVariant),
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
		variant: EButtonVariant.default,
	},
};

export const Filled: Story = {
	args: {
		...Default.args,
		variant: EButtonVariant.filled,
		children: "Filled Button",
	},
};

export const Outline: Story = {
	args: {
		...Default.args,
		variant: EButtonVariant.outline,
		children: "Outline Button",
	},
};

export const Transparent: Story = {
	args: {
		...Default.args,
		children: "Transparent Button",
	},
};
