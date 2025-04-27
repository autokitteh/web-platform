import React from "react";

import type { Meta, StoryObj } from "@storybook/react";

import { BadgeProps } from "@interfaces/components";

import { Badge, IconSvg } from "@components/atoms";

import { FileIcon } from "@assets/image/icons/sidebar";

const BadgeWrapper = (props: Partial<BadgeProps>) => {
	return (
		<Badge {...props}>
			<IconSvg className="size-7 stroke-gray-1300 transition" src={FileIcon} />
		</Badge>
	);
};

const meta = {
	title: "Display/Badge",
	component: BadgeWrapper,
	argTypes: {
		anchorOrigin: {
			control: "object",
			description: "Controls the position of the badge.",
			table: {
				type: { summary: "{ vertical: 'top' | 'bottom', horizontal: 'left' | 'right' }" },
			},
		},
		variant: {
			control: "inline-radio",
			options: ["dot", "standard"],
		},
		content: { control: "text" },
		className: { control: "text" },
		ariaLabel: { control: "text" },
		isVisible: { control: "boolean" },
		children: { control: false },
		style: { control: false },
	},
	parameters: {
		controls: { expanded: true },
	},
} satisfies Meta<typeof Badge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary = {
	args: {
		anchorOrigin: { vertical: "top", horizontal: "left" },
		variant: "dot",
		isVisible: true,
		content: "",
		className: "absolute text-black",
		ariaLabel: "Badge",
	},
} satisfies Story;
