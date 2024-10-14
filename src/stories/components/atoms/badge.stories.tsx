import React from "react";

import type { Meta, StoryObj } from "@storybook/react";

import { BadgeProps } from "@src/interfaces/components";

import { Badge, IconSvg } from "@components/atoms";

import { FileIcon } from "@assets/image/icons";

const BadgeWrapper = ({ anchorOrigin, ariaLabel, className }: Partial<BadgeProps>) => {
	return (
		<Badge anchorOrigin={anchorOrigin} ariaLabel={ariaLabel} className={className} variant="dot">
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
		},
		ariaLabel: { control: "text" },
		className: { control: "text" },
		content: { control: "text" },
		isVisible: { control: "boolean" },
		style: { control: "object" },
		variant: {
			control: "inline-radio",
			options: ["dot", "standard"],
		},
		children: { control: "text" },
	},
} satisfies Meta<typeof Badge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary = {
	args: {
		anchorOrigin: { vertical: "top", horizontal: "left" },
		ariaLabel: "Badge",
		className: "absolute",
		isVisible: true,
		variant: "standard",
	},
} satisfies Story;
