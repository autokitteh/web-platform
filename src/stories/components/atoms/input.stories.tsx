import React, { useState } from "react";
import { Input } from "@components/atoms";
import type { Meta, StoryObj } from "@storybook/react";
import { InputProps } from "@interfaces/components";
import { InputVariant } from "@enums/components";
import { Eye } from "@assets/image/icons";

const InputWrapper = (props: InputProps) => {
	const [value, setValue] = useState("");

	return <Input {...props} value={value} onChange={(e) => setValue(e.target.value)} />;
};

const meta: Meta<typeof InputWrapper> = {
	title: "Form/Input",
	component: InputWrapper,
	argTypes: {
		placeholder: { control: "text" },
		isError: { control: "boolean" },
		isRequired: { control: "boolean" },
		disabled: { control: "boolean" },
		variant: {
			control: "inline-radio",
			options: Object.values(InputVariant),
		},
		className: { control: "text" },
		classInput: { control: "text" },
		icon: { control: "none" },
	},
	parameters: {
		actions: { disable: true },
		interactions: { disable: true },
	},
};

export default meta;

type Story = StoryObj<typeof InputWrapper>;

export const Primary: Story = {
	args: {
		variant: InputVariant.light,
		placeholder: "Enter text",
		isError: false,
		isRequired: false,
		disabled: false,
		className: "",
		classInput: "",
		icon: <Eye className="fill-gray-400" />,
	},
};
