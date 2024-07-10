import type { Meta, StoryObj } from "@storybook/react";

import { IconSvg } from "@components/atoms";

import { EditIcon } from "@assets/image/icons";

const meta = {
	title: "Display/IconSvg",
	component: IconSvg,
	argTypes: {
		className: { control: "text" },
		alt: { control: "text" },
		src: { control: false },
		isVisible: { control: "boolean" },
		disabled: { control: "boolean" },
	},
} satisfies Meta<typeof IconSvg>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary = {
	args: {
		className: "w-6",
		alt: "default icon",
		isVisible: true,
		disabled: false,
		src: EditIcon,
	},
} satisfies Story;
