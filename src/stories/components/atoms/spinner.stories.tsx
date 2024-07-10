import type { Meta, StoryObj } from "@storybook/react";
import { Spinner } from "@components/atoms";

const meta = {
	title: "Display/Spinner",
	component: Spinner,
	argTypes: {
		className: { control: false },
	},
} satisfies Meta<typeof Spinner>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary = {
	args: {
		className: "border-black",
	},
} satisfies Story;
