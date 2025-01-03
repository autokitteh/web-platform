import React, { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react";

import { TextArea } from "@interfaces/components";

import { Textarea } from "@components/atoms";

const TextareaWrapper = (props: Partial<TextArea>) => {
	const [value, setValue] = useState("");

	return (
		<Textarea
			{...props}
			isError={props?.isError || false}
			onChange={(event) => setValue(event.target.value)}
			placeholder={props?.placeholder || ""}
			value={value}
		/>
	);
};

const meta: Meta<typeof TextareaWrapper> = {
	title: "Form/Textarea",
	component: TextareaWrapper,
	parameters: {
		actions: { disable: true },
	},
	argTypes: {
		placeholder: { control: "text" },
		isError: { control: "boolean" },
		disabled: { control: "boolean" },
		className: { control: "text" },
	},
};

export default meta;

type Story = StoryObj<typeof TextareaWrapper>;

export const Primary: Story = {
	args: {
		placeholder: "Enter text",
		isError: false,
		disabled: false,
		className: "",
	},
};
