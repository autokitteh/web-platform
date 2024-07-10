import React from "react";
import { Toast } from "@components/molecules";
import { Button } from "@components/atoms";
import { useToastStore } from "@store/useToastStore";
import type { Meta, StoryObj } from "@storybook/react";
import { ToasterTypes } from "@interfaces/components";

const ToastWrapper = () => {
	const { addToast } = useToastStore();

	const handleAddToast = (type: ToasterTypes) => {
		addToast({ id: Date.now().toString(), type, message: `This is a ${type} toast message.` });
	};

	return (
		<div className="flex gap-2">
			<Button variant="filled" className="pt-1 font-medium" onClick={() => handleAddToast("success")}>
				Show Success Toast
			</Button>
			<Button variant="filled" className="pt-1 font-medium" onClick={() => handleAddToast("error")}>
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
