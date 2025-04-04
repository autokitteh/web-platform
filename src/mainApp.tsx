import React from "react";

import "@utilities/getApiBaseUrl.utils";

import { BrowserRouter } from "react-router-dom";

import { App } from "./app";
import { descopeProjectId } from "@constants";

import { useOrganizationStore } from "@store";

import { AppProvider, DescopeWrapper } from "@components/templates";

export const MainApp = () => {
	const { currentOrganization, reset, user } = useOrganizationStore();
	if (!descopeProjectId && (currentOrganization || user)) reset();

	return (
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
	);
};
