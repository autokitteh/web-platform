import React from "react";

import type { Meta, StoryObj } from "@storybook/react";

import { ButtonVariant } from "@enums/components";

import { IconButton } from "@components/atoms";

import { Close } from "@assets/image/icons";

const ButtonVariantOptions = Object.values(ButtonVariant);

const meta = {
	title: "Buttons/IconButton",
	component: IconButton,
	parameters: {
		actions: { disable: true },
	},
	argTypes: {
		className: { control: "text" },
		variant: { control: "inline-radio", options: ButtonVariantOptions, labels: { inline: true } },
		disabled: { control: "boolean" },
		children: { control: false },
		ariaLabel: { control: false },
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
		className: "w-8 h-8",
		disabled: false,
		title: "",
		children: <Close className="size-3 fill-gray-500 transition group-hover:fill-white" />,
	},
} satisfies Story;
