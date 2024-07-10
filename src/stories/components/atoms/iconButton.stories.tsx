import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { IconButton } from "@components/atoms";
import { ButtonVariant } from "@enums/components";
import { Close } from "@assets/image/icons";

const meta = {
	title: "Buttons/IconButton",
	component: IconButton,
	parameters: {
		actions: { disable: true },
		interactions: { disable: true },
	},
	argTypes: {
		children: { control: false },
		className: { control: "text" },
		variant: { control: "radio", options: ButtonVariant, labels: { inline: true } },
		ariaLabel: { control: "text" },
		disabled: { control: "boolean" },
		onClick: { control: false },
		onKeyDown: { control: false },
		onMouseEnter: { control: false },
		onMouseLeave: { control: false },
		form: { control: false },
		href: { control: false },
	},
} satisfies Meta<typeof IconButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary = {
	args: {
		variant: ButtonVariant.filled,
		className: "",
		ariaLabel: "",
		disabled: false,
		title: "",
		children: <Close className="w-2 h-2 transition fill-gray-300 group-hover:fill-white" />,
	},
} satisfies Story;
