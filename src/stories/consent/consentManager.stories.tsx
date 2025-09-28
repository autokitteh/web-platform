import React from "react";

import type { Meta, StoryObj } from "@storybook/react";

import { ConsentProvider } from "@src/contexts/consent";

import { ConsentSettingsLink } from "@components/atoms/consentSettingsLink";
import { ConsentManager } from "@components/organisms/consent/consentManager";

const meta: Meta<typeof ConsentManager> = {
	title: "Organisms/Consent/ConsentManager",
	component: ConsentManager,
	parameters: {
		layout: "fullscreen",
		docs: {
			description: {
				component: "Complete consent management system orchestrating banner and preferences modal.",
			},
		},
	},
	decorators: [
		(Story) => (
			<ConsentProvider>
				<div style={{ minHeight: "100vh", background: "#f8f9fa" }}>
					<header
						style={{
							padding: "20px",
							background: "white",
							borderBottom: "1px solid #ddd",
						}}
					>
						<h1>AutoKitteh Web Platform</h1>
						<nav>
							<button
								style={{
									marginRight: "20px",
									background: "none",
									border: "none",
									cursor: "pointer",
								}}
							>
								Home
							</button>
							<button
								style={{
									marginRight: "20px",
									background: "none",
									border: "none",
									cursor: "pointer",
								}}
							>
								Projects
							</button>
							<button
								style={{
									marginRight: "20px",
									background: "none",
									border: "none",
									cursor: "pointer",
								}}
							>
								Settings
							</button>
						</nav>
					</header>

					<main style={{ padding: "40px 20px", minHeight: "60vh" }}>
						<h2>Welcome to AutoKitteh</h2>
						<p>This is sample page content to demonstrate the consent management system in action.</p>
						<p>The cookie banner should appear at the bottom of the page on first visit.</p>
					</main>

					<footer
						style={{
							padding: "20px",
							background: "#333",
							color: "white",
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
						}}
					>
						<div>
							<p>&copy; 2024 AutoKitteh. All rights reserved.</p>
						</div>
						<div>
							<ConsentSettingsLink variant="link" />
						</div>
					</footer>

					<Story />
				</div>
			</ConsentProvider>
		),
	],
	tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ConsentManager>;

export const Default: Story = {
	name: "Complete Consent System",
	parameters: {
		docs: {
			description: {
				story: "Shows the complete consent management system with banner, modal, and settings link integrated into a sample page layout.",
			},
		},
	},
};

export const FirstVisit: Story = {
	name: "First Visit Experience",
	parameters: {
		docs: {
			description: {
				story: "Simulates first-time user experience with banner appearing automatically.",
			},
		},
	},
};

export const ConsentSettings: Story = {
	name: "Settings Entry Point",
	decorators: [
		(Story) => (
			<ConsentProvider>
				<div
					style={{
						padding: "40px",
						background: "white",
						maxWidth: "600px",
						margin: "20px auto",
						borderRadius: "8px",
						boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
					}}
				>
					<h2>User Settings</h2>
					<div style={{ padding: "20px 0", borderBottom: "1px solid #eee" }}>
						<h3>Privacy & Data</h3>
						<p style={{ color: "#666", marginBottom: "10px" }}>
							Manage your privacy preferences and control how we use your data.
						</p>
						<ConsentSettingsLink variant="button" />
					</div>
					<div style={{ padding: "20px 0" }}>
						<h3>Account Settings</h3>
						<p style={{ color: "#666" }}>Other settings would go here...</p>
					</div>
				</div>
				<Story />
			</ConsentProvider>
		),
	],
	parameters: {
		docs: {
			description: {
				story: "Shows the cookie settings link in a typical settings page context.",
			},
		},
	},
};
