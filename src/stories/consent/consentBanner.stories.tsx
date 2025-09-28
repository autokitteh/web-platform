import React from "react";

import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "@storybook/test";

import { ConsentProvider } from "@src/contexts/consent";

import { CookieBanner } from "@components/organisms/consent/cookieBanner";

const meta: Meta<typeof CookieBanner> = {
	title: "Organisms/Consent/CookieBanner",
	component: CookieBanner,
	parameters: {
		layout: "fullscreen",
		docs: {
			description: {
				component: "GDPR-compliant cookie consent banner with equal prominence for accept/reject actions.",
			},
		},
	},
	decorators: [
		(Story) => (
			<ConsentProvider>
				<div style={{ height: "100vh", position: "relative", background: "#f8f9fa" }}>
					<div style={{ padding: "20px" }}>
						<h1>Sample Page Content</h1>
						<p>This is sample content to show the banner overlay behavior.</p>
					</div>
					<Story />
				</div>
			</ConsentProvider>
		),
	],
	tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof CookieBanner>;

export const Default: Story = {
	name: "Default Banner",
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);

		// Verify banner is visible
		await expect(canvas.getByText("We value your privacy")).toBeInTheDocument();
		await expect(canvas.getByTestId("accept-all-cookies")).toBeInTheDocument();
		await expect(canvas.getByTestId("reject-all-cookies")).toBeInTheDocument();
		await expect(canvas.getByTestId("customize-cookies")).toBeInTheDocument();
	},
};

export const WithActions: Story = {
	name: "Interactive Banner",
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);

		// Test button interactions
		const acceptButton = canvas.getByTestId("accept-all-cookies");
		const rejectButton = canvas.getByTestId("reject-all-cookies");
		const customizeButton = canvas.getByTestId("customize-cookies");

		// Verify buttons are clickable
		await expect(acceptButton).toBeEnabled();
		await expect(rejectButton).toBeEnabled();
		await expect(customizeButton).toBeEnabled();
	},
};

export const AccessibilityTest: Story = {
	name: "Accessibility Features",
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);

		// Check ARIA attributes
		const banner = canvas.getByRole("dialog");
		await expect(banner).toHaveAttribute("aria-labelledby", "cookie-banner-title");
		await expect(banner).toHaveAttribute("aria-describedby", "cookie-banner-description");
		await expect(banner).toHaveAttribute("aria-modal", "false");

		// Check focus management
		const closeButton = canvas.getByLabelText(/close cookie banner/i);
		await expect(closeButton).toBeInTheDocument();
	},
};
