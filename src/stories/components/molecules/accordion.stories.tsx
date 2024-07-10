import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Accordion } from "@components/molecules";

const AccordionWrapper = ({
	title,
	children,
	className,
}: {
	title: string;
	children: React.ReactNode;
	className?: string;
}) => {
	return (
		<div className="bg-gray-600 inline-block p-2 pt-1.5 rounded">
			<Accordion title={title} className={className}>
				{children}
			</Accordion>
		</div>
	);
};

const meta = {
	title: "Display/Accordion",
	component: Accordion,
	argTypes: {
		title: { control: "text" },
		children: { control: "text" },
		className: { control: "text" },
	},
	decorators: [
		(_, context) => {
			const { args } = context;
			return <AccordionWrapper {...args} />;
		},
	],
} satisfies Meta<typeof Accordion>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary = {
	args: {
		title: "Accordion Title",
		children: "This is the content of the accordion. It is initially hidden and can be revealed by clicking the title.",
		className: "text-white",
	},
} satisfies Story;
