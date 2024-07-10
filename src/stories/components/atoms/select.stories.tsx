import React, { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react";
import { SingleValue } from "react-select";

import { InputVariant } from "@enums/components";
import { SelectOption, SelectProps } from "@interfaces/components";

import { Select } from "@components/atoms";

const options: SelectOption[] = [
	{ value: "option1", label: "Option 1" },
	{ value: "option2", label: "Option 2" },
	{ value: "option3", label: "Option 3", disabled: true },
];

const SelectWrapper = (props: SelectProps) => {
	const [selectedOption, setSelectedOption] = useState<SingleValue<SelectOption>>();

	const handleChange = (selected: SingleValue<SelectOption>) => {
		setSelectedOption(selected);
	};

	return <Select {...props} onChange={handleChange} options={options} value={selectedOption as SelectOption} />;
};

const meta: Meta<typeof SelectWrapper> = {
	title: "Form/Select",
	component: SelectWrapper,
	parameters: {
		actions: { disable: true },
		interactions: { disable: true },
	},
	argTypes: {
		placeholder: { control: "text" },
		isError: { control: "boolean" },
		noOptionsLabel: { control: "text" },
		variant: {
			control: "inline-radio",
			options: Object.values(InputVariant),
		},
		dataTestid: { control: false },
	},
};

export default meta;

type Story = StoryObj<typeof SelectWrapper>;

export const Primary: Story = {
	args: {
		variant: InputVariant.light,
		isError: false,
		placeholder: "Select an option",
		noOptionsLabel: "No options available",
		dataTestid: "",
	},
};
