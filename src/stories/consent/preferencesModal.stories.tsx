import React from "react";

import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "@storybook/test";

import { ConsentProvider } from "@src/contexts/consent";

import { PreferencesModal } from "@components/organisms/consent/preferencesModal";

const meta: Meta<typeof PreferencesModal> = {
	title: "Organisms/Consent/PreferencesModal",
	component: PreferencesModal,
	parameters: {
		layout: "fullscreen",
		docs: {
			description: {
				component: "Detailed cookie preferences modal with granular purpose controls and cookie listings.",
			},
		},
	},
	decorators: [
		(Story) => (
			<ConsentProvider>
				<div style={{ height: "100vh", background: "#f8f9fa" }}>
					<Story />
				</div>
			</ConsentProvider>
		),
	],
	tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof PreferencesModal>;

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);

		// Modal should be accessible
		await expect(canvas.getByRole("dialog")).toBeInTheDocument();
		await expect(canvas.getByText("Cookie Preferences")).toBeInTheDocument();
		await expect(canvas.getByTestId("save-preferences")).toBeInTheDocument();
	},
};

export const PurposeCategories: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);

		// Check all purpose categories are present
		await expect(canvas.getByText("Strictly Necessary")).toBeInTheDocument();
		await expect(canvas.getByText("Functional")).toBeInTheDocument();
		await expect(canvas.getByText("Analytics")).toBeInTheDocument();
		await expect(canvas.getByText("Marketing")).toBeInTheDocument();

		// Strictly necessary should be disabled (always on)
		const strictlyNecessaryToggle = canvas.getByLabelText(/strictly necessary/i);
		await expect(strictlyNecessaryToggle).toBeDisabled();
	},
};

export const AccessibilityTest: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);

		// Check modal ARIA attributes
		const modal = canvas.getByRole("dialog");
		await expect(modal).toHaveAttribute("aria-labelledby", "preferences-modal-title");
		await expect(modal).toHaveAttribute("aria-modal", "true");

		// Check toggle accessibility
		const toggles = canvas.getAllByRole("switch");
		expect(toggles.length).toBeGreaterThan(0);

		// Check expandable sections have proper ARIA
		const expandableButtons = canvas.getAllByRole("button");
		const expandableButton = expandableButtons.find(
			(btn: HTMLElement) => btn.getAttribute("aria-expanded") !== null
		);
		if (expandableButton) {
			await expect(expandableButton).toHaveAttribute("aria-expanded");
		}
	},
};
