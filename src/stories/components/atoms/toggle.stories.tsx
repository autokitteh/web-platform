import React, { useState } from "react";

import { action } from "@storybook/addon-actions";
import type { Meta, StoryObj } from "@storybook/react";

import { ToggleProps } from "@interfaces/components";

import { Toggle } from "@components/atoms";

const ToggleWrapper = ({ checked: initialChecked, label, onChange }: ToggleProps) => {
	const [checked, setChecked] = useState(initialChecked);

	const handleChange = (checked: boolean) => {
		setChecked(checked);
		onChange(checked);
	};

	return (
		<div className="inline-block rounded bg-gray-500 p-2">
			<Toggle checked={checked} label={label} onChange={handleChange} />
		</div>
	);
};

const meta = {
	title: "Display/Toggle",
	component: Toggle,
	argTypes: {
		checked: { control: false },
		label: { control: "text" },
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
