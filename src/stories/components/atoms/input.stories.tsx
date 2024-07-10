import React, { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react";

import { InputVariant } from "@enums/components";
import { InputProps } from "@interfaces/components";

import { Input } from "@components/atoms";

import { Eye } from "@assets/image/icons";

const InputWrapper = (props: InputProps) => {
	const [value, setValue] = useState("");

	return <Input {...props} onChange={(event) => setValue(event.target.value)} value={value} />;
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
		icon: {
			control: "boolean",
			description: "Show icon",
		},
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
		className: "",
		classInput: "",
		isError: false,
		isRequired: false,
		disabled: false,
		icon: true,
	},
	render: (args) => <InputWrapper {...args} icon={args.icon ? <Eye className="fill-gray-400" /> : null} />,
};
