import React from "react";

import type { Meta, StoryObj } from "@storybook/react";

import { Accordion } from "@components/molecules";

const AccordionWrapper = ({
	children,
	className,
	title,
}: {
	children: React.ReactNode;
	className?: string;
	title: string;
}) => {
	return (
		<div className="inline-block rounded bg-gray-600 p-2 pt-1.5">
			<Accordion className={className} title={title}>
				{children}
			</Accordion>
		</div>
	);
};

const meta = {
	title: "Display/Accordion",
	component: AccordionWrapper,
	argTypes: {
		title: { control: "text" },
		children: { control: "text" },
		className: { control: "text" },
	},
} satisfies Meta<typeof Accordion>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary = {
	args: {
		title: "Accordion Title",
		children:
			"This is the content of the accordion. It is initially hidden and can be revealed by clicking the title.",
		className: "text-white",
	},
} satisfies Story;
