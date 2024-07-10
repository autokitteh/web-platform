import type { Meta, StoryObj } from "@storybook/react";

import { ButtonVariant } from "@enums/components";

import { Button } from "@components/atoms";

const ButtonVariantOptions = Object.values(ButtonVariant);

const meta = {
	title: "Buttons/Button",
	component: Button,
	parameters: {
		actions: { disable: true },
		interactions: { disable: true },
	},
	argTypes: {
		children: { control: "text" },
		className: { control: "text" },
		variant: { control: "inline-radio", options: ButtonVariantOptions, labels: { inline: true } },
		disabled: { control: "boolean" },
		type: { control: false },
		ariaLabel: { control: false },
		onClick: { control: false },
		onKeyDown: { control: false },
		onMouseEnter: { control: false },
		onMouseLeave: { control: false },
		form: { control: false },
		href: { control: false },
	},
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary = {
	args: {
		children: "Button",
		variant: ButtonVariant.filled,
		className: "",
		disabled: false,
		title: "",
	},
} satisfies Story;
