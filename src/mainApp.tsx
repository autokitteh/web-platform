import React from "react";

import "@utilities/getApiBaseUrl.utils";

import { BrowserRouter } from "react-router-dom";

import { App } from "./app";
import ErrorBoundary from "./errorBoundaries";
import { descopeProjectId } from "@constants";

import { useOrganizationStore } from "@store";

import { AppProvider, DescopeWrapper } from "@components/templates";

export const MainApp = () => {
	const { currentOrganization, reset, user } = useOrganizationStore();
	if (!descopeProjectId && (currentOrganization || user)) reset();

	return (
		<ErrorBoundary>
			<BrowserRouter>
				<AppProvider>
					{descopeProjectId ? (
						<DescopeWrapper>
							<App />
						</DescopeWrapper>
					) : (
						<App />
					)}
				</AppProvider>
			</BrowserRouter>
		</ErrorBoundary>
	);
};
