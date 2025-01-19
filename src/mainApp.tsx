import React from "react";

import "@utilities/getApiBaseUrl.utils";

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
			{descopeProjectId ? (
				<DescopeWrapper>
					<App />
				</DescopeWrapper>
			) : (
				<App />
			)}
			<Toast />
		</BrowserRouter>
	);
};
