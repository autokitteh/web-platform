import React from "react";

import type { Meta, StoryObj } from "@storybook/react";

import { ToasterTypes } from "@src/types/components";
import { useToastStore } from "@store/useToastStore";

import { Button } from "@components/atoms";
import { Toast } from "@components/molecules";

const ToastWrapper = () => {
	const { addToast } = useToastStore();

	const handleAddToast = (type: ToasterTypes) => {
		addToast({ type, message: `This is a ${type} toast message.` });
	};

	return (
		<div className="flex gap-2">
			<Button className="pt-1 font-medium" onClick={() => handleAddToast("success")} variant="filled">
				Show Success Toast
			</Button>

			<Button className="pt-1 font-medium" onClick={() => handleAddToast("error")} variant="filled">
				Show Error Toast
			</Button>

			<Toast />
		</div>
	);
};

const meta = {
	title: "Display/Toast",
	component: ToastWrapper,
	parameters: {
		actions: { disable: true },
		interactions: { disable: true },
	},
} satisfies Meta<typeof ToastWrapper>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary = {
	args: {},
} satisfies Story;
