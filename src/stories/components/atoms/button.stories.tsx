import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "@components/atoms";
import { ButtonVariant } from "@enums/components";

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
		variant: { control: "inline-radio", options: ButtonVariant, labels: { inline: true } },
		ariaLabel: { control: "text" },
		disabled: { control: "boolean" },
		type: { control: "inline-radio", options: ["button", "submit", "reset"] },
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
		ariaLabel: "",
		disabled: false,
		title: "",
		type: "button",
	},
} satisfies Story;
