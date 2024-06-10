import type { Meta, StoryObj } from "@storybook/react";
import { Icon } from "@components/atoms";
import { DefaultAvatar } from "@assets/image";

const meta: Meta<typeof Icon> = {
	title: "Core/Icon",
	component: Icon,
	argTypes: {
		className: { control: "none" },
		alt: { control: "text" },
		src: { control: { type: "file", accept: ".png, .jpg, .jpeg, .svg" } },
		isVisible: { control: "boolean" },
	},
};
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		className: "",
		alt: "icon",
		src: DefaultAvatar,
		isVisible: true,
	},
	argTypes: {
		src: { control: "none" },
	},
};

export const Hidden: Story = {
	args: {
		...Default.args,
		isVisible: false,
	},
	argTypes: {
		src: { control: "none" },
	},
};

export const Custom: Story = {
	args: {
		...Default.args,
	},
};
