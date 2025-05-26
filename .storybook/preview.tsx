import React, { Suspense } from "react";

import { withActions } from "@storybook/addon-actions/decorator";
import type { Preview } from "@storybook/react";
import { I18nextProvider } from "react-i18next";
import "@utilities/getApiBaseUrl.utils";

import i18n from "../src/i18n";
import "./storybook-tailwind.css";

const preview: Preview = {
	parameters: {
		actions: {
			handles: ["onClick", "onChange", "onSubmit", "onBlur", "onFocus", "onSelect"],
		},
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/,
			},
		},
		interactions: { disable: true },
	},
	decorators: [
		withActions,
		(Story) => (
			<Suspense fallback={<div>Loading...</div>}>
				<I18nextProvider i18n={i18n}>
					<Story />
				</I18nextProvider>
			</Suspense>
		),
	],

	tags: ["autodocs", "autodocs"],
};

export default preview;
