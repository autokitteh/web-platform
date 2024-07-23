import React, { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react";

import { InputVariant } from "@enums/components";
import { SecretInputProps } from "@interfaces/components";

import { SecretInput } from "@components/atoms";

const InputWrapper = ({
	isLocked: initialIsLocked,
	isLockedDisabled,
	...rest
}: SecretInputProps & { icon?: React.ReactNode }) => {
	const [value, setValue] = useState("");
	const [isLocked, setIsLocked] = useState(initialIsLocked || false);

	const handleLockToggle = () => {
		if (!isLockedDisabled) {
			setIsLocked(!isLocked);
		}
	};

	return (
		<SecretInput
			{...rest}
			isLocked={isLocked}
			isLockedDisabled={isLockedDisabled}
			onChange={(event) => setValue(event.target.value)}
			onLock={handleLockToggle}
			value={value}
		/>
	);
};

const meta: Meta<typeof InputWrapper> = {
	title: "Form/SecretInput",
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
			control: "select",
			options: [InputVariant.light, InputVariant.dark],
		},
		isLocked: { control: "boolean" },
		isLockedDisabled: { control: "boolean" },
		className: { control: "text" },
		classInput: { control: "text" },
	},
	decorators: [
		(Story, context) => (
			<div
				style={{
					backgroundColor: context.args.variant === InputVariant.light ? "#333" : "white",
					padding: "20px",
				}}
			>
				<Story />
			</div>
		),
	],
};

export default meta;

// Stories for Default state
export const DefaultDark: StoryObj<typeof InputWrapper> = {
	args: {
		placeholder: "Enter Secret",
		isError: false,
		isRequired: false,
		disabled: false,
		variant: InputVariant.dark,
		isLocked: false,
		isLockedDisabled: false,
	},
};

export const DefaultLight: StoryObj<typeof InputWrapper> = {
	args: {
		...DefaultDark.args,
		variant: InputVariant.light,
	},
};

// Stories for Locked state
export const LockedDark: StoryObj<typeof InputWrapper> = {
	args: {
		...DefaultDark.args,
		isLocked: true,
	},
};

export const LockedLight: StoryObj<typeof InputWrapper> = {
	args: {
		...DefaultLight.args,
		isLocked: true,
	},
};

// Stories for Error state
export const ErrorDark: StoryObj<typeof InputWrapper> = {
	args: {
		...DefaultDark.args,
		isError: true,
	},
};

export const ErrorLight: StoryObj<typeof InputWrapper> = {
	args: {
		...DefaultLight.args,
		isError: true,
	},
};

// Stories for Lock Toggle Disabled state
export const LockToggleDisabledDark: StoryObj<typeof InputWrapper> = {
	args: {
		...DefaultDark.args,
		isLockedDisabled: true,
	},
};

export const LockToggleDisabledLight: StoryObj<typeof InputWrapper> = {
	args: {
		...DefaultLight.args,
		isLockedDisabled: true,
	},
};
