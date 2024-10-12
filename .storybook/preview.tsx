import React, { Suspense } from "react";

import type { Preview } from "@storybook/react";
import { I18nextProvider } from "react-i18next";
import "@utilities/getApiBaseUrl.utils";

import i18n from "../src/i18n";
import "./storybook-tailwind.css";

const preview: Preview = {
	parameters: {
		actions: { argTypesRegex: "^on[A-Z].*" },
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/,
			},
		},
		interactions: { disable: true },
	},
	decorators: [
		(Story) => (
			<Suspense fallback={<div>Loading...</div>}>
				<I18nextProvider i18n={i18n}>
					<Story />
				</I18nextProvider>
			</Suspense>
		),
	],
};

export default preview;
