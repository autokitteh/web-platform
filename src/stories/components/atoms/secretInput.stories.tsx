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
			handleLockAction={handleLockToggle}
			isLocked={isLocked}
			isLockedDisabled={isLockedDisabled}
			onChange={(event) => setValue(event.target.value)}
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
					color: context.args.variant === InputVariant.light ? "white" : "black",
				}}
			>
				<Story />
			</div>
		),
	],
};

export default meta;

const baseArgs = {
	placeholder: "Enter Secret",
	isError: false,
	isRequired: false,
	disabled: false,
	isLocked: false,
	isLockedDisabled: false,
};

export const DefaultDark: StoryObj<typeof InputWrapper> = {
	args: {
		...baseArgs,
		variant: InputVariant.dark,
	},
};

export const DefaultLight: StoryObj<typeof InputWrapper> = {
	args: {
		...baseArgs,
		variant: InputVariant.light,
	},
};

export const LockedDark: StoryObj<typeof InputWrapper> = {
	args: {
		...baseArgs,
		variant: InputVariant.dark,
		isLocked: true,
	},
};

export const LockedLight: StoryObj<typeof InputWrapper> = {
	args: {
		...baseArgs,
		variant: InputVariant.light,
		isLocked: true,
	},
};

export const ErrorDark: StoryObj<typeof InputWrapper> = {
	args: {
		...baseArgs,
		variant: InputVariant.dark,
		isError: true,
	},
};

export const ErrorLight: StoryObj<typeof InputWrapper> = {
	args: {
		...baseArgs,
		variant: InputVariant.light,
		isError: true,
	},
};

export const LockToggleDisabledDark: StoryObj<typeof InputWrapper> = {
	args: {
		...baseArgs,
		variant: InputVariant.dark,
		isLockedDisabled: true,
	},
};

export const LockToggleDisabledLight: StoryObj<typeof InputWrapper> = {
	args: {
		...baseArgs,
		variant: InputVariant.light,
		isLockedDisabled: true,
	},
};
