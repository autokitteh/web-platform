import type { Meta, StoryObj } from "@storybook/react";

import { IconSvg } from "@components/atoms";

import { EditIcon } from "@assets/image/icons";

const meta = {
	title: "Display/IconSvg",
	component: IconSvg,
	parameters: {
		actions: { disable: true },
	},
	argTypes: {
		size: {
			control: { type: "inline-radio" },
			options: ["xs", "sm", "md", "lg", "xl", "2xl"],
		},
		className: { control: "text" },
		isVisible: { control: "boolean" },
		disabled: { control: "boolean" },
		alt: { control: false },
		src: { control: false },
	},
} satisfies Meta<typeof IconSvg>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary = {
	args: {
		size: "xl",
		isVisible: true,
		disabled: false,
		className: "",
		alt: "default icon",
		src: EditIcon,
	},
} satisfies Story;
