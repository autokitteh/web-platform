import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Toggle } from "@components/atoms";
import { action } from "@storybook/addon-actions";
import { ToggleProps } from "@interfaces/components";

const ToggleWrapper = ({ label, checked: initialChecked, onChange }: ToggleProps) => {
	const [checked, setChecked] = useState(initialChecked);

	const handleChange = (checked: boolean) => {
		setChecked(checked);
		onChange(checked);
	};

	return (
		<div className="inline-block rounded bg-gray-500 p-2">
			<Toggle label={label} checked={checked} onChange={handleChange} />
		</div>
	);
};

const meta = {
	title: "Display/Toggle",
	component: Toggle,
	argTypes: {
		label: { control: "text" },
		checked: { control: false },
		onChange: { action: "changed" },
	},
	decorators: [
		(_, context) => {
			const { args } = context;
			return <ToggleWrapper {...args} />;
		},
	],
} satisfies Meta<typeof Toggle>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary = {
	args: {
		label: "Toggle",
		checked: true,
		onChange: action("changed"),
	},
} satisfies Story;
