import React from "react";

import type { Meta, StoryObj } from "@storybook/react";

import { Notification } from "@components/atoms";

const NotificationWrapper = ({ content }: { content: string }) => (
	<div className="relative inline-block">
		<img
			alt="avatar"
			className="size-12 rounded-full object-cover"
			src="https://images.pexels.com/photos/57416/cat-sweet-kitty-animals-57416.jpeg?auto=compress&cs=tinysrgb&w=640&h=426&dpr=1"
		/>

		<div className="absolute right-0 top-2 -translate-y-1/2 translate-x-1/2">
			<Notification>{content}</Notification>
		</div>
	</div>
);

const meta = {
	title: "Display/Notification",
	component: NotificationWrapper,
	parameters: {
		actions: { disable: true },
	},
	argTypes: {
		content: { control: "text" },
	},
} satisfies Meta<typeof NotificationWrapper>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary = {
	args: {
		content: "Notification",
	},
} satisfies Story;
