import React from "react";

import type { Meta, StoryObj } from "@storybook/react";

import { Accordion } from "@components/molecules";

import { ExternalLinkIcon } from "@assets/image/icons";

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
		<div className="inline-block rounded bg-gray-1050 p-2 pt-1.5">
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
} satisfies Meta<typeof AccordionWrapper>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary = {
	args: {
		title: "Accordion Title",
		children: "This is the content of the accordion.",
		className: "text-white",
	},
} satisfies Story;

export const WithLink = {
	args: {
		title: "With Link",
		children: "This is the content of the accordion.",
		className: "text-white",
	},
	render: ({ children, className, title }) => (
		<AccordionWrapper className={className} title={title}>
			<a
				className="group inline-flex items-center gap-2.5 text-green-800"
				href={window.location.href}
				rel="noreferrer"
				target="_blank"
			>
				{children}

				<ExternalLinkIcon className="h-3.5 w-3.5 fill-green-800 duration-200" />
			</a>
		</AccordionWrapper>
	),
} satisfies Story;
