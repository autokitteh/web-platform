import React from "react";

import "@utilities/getApiBaseUrl.utils";

import * as Sentry from "@sentry/react";
import { BrowserRouter } from "react-router-dom";

import { App } from "./app";
import { descopeProjectId } from "@constants";

import { useOrganizationStore } from "@store";

import { Toast } from "@components/molecules";
import { DescopeWrapper } from "@components/templates";

export const MainApp = () => {
	const { currentOrganization, reset, user } = useOrganizationStore();
	if (!descopeProjectId && (currentOrganization || user)) reset();

	return (
		<BrowserRouter>
			<Sentry.ErrorBoundary fallback={<p>Error occurred</p>}>
				{descopeProjectId ? (
					<DescopeWrapper>
						<App />
					</DescopeWrapper>
				) : (
					<App />
				)}
			</Sentry.ErrorBoundary>
			<Toast />
		</BrowserRouter>
	);
};
