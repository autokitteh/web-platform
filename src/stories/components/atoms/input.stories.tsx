import React, { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react";

import { InputVariant } from "@enums/components";
import { InputProps } from "@interfaces/components";

import { Input } from "@components/atoms";

import { EyeIcon } from "@assets/image/icons";

const InputWrapper = (props: InputProps) => {
	const [value, setValue] = useState("");

	return <Input {...props} onChange={(event) => setValue(event.target.value)} value={value} />;
};

const meta: Meta<typeof InputWrapper> = {
	title: "Form/Input",
	component: InputWrapper,
	parameters: {
		actions: { disable: true },
	},
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
};

export default meta;

type Story = StoryObj<typeof InputWrapper>;

export const Primary: Story = {
	args: {
		variant: InputVariant.light,
		placeholder: "Enter text",
		className: "",
		classInput: "",
		icon: true,
		isError: false,
		isRequired: false,
		disabled: false,
	},
	render: (args) => <InputWrapper {...args} icon={args.icon ? <EyeIcon className="fill-gray-750" /> : null} />,
};
