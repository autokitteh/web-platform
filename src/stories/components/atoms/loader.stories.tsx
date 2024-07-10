import type { Meta, StoryObj } from "@storybook/react";
import { Loader } from "@components/atoms";

const meta = {
	title: "Display/Loader",
	component: Loader,
	argTypes: {
		size: {
			control: { type: "select" },
			options: ["sm", "md", "lg", "xl", "2xl"],
		},
		firstColor: {
			control: { type: "radio" },
			options: ["dark-gray", "gray"],
		},
		secondColor: {
			control: { type: "radio" },
			options: ["dark-gray", "gray"],
		},
		isCenter: {
			control: "boolean",
		},
	},
} satisfies Meta<typeof Loader>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary = {
	args: {
		size: "lg",
		firstColor: "dark-gray",
		secondColor: "gray",
		isCenter: true,
	},
} satisfies Story;
