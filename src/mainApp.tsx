import React from "react";

import "@utilities/getApiBaseUrl.utils";

import { BrowserRouter } from "react-router-dom";

import { App } from "./app";
import { descopeProjectId } from "@constants";

import { useOrganizationStore, useUserStore } from "@store";

import { Toast } from "@components/molecules";
import { DescopeWrapper } from "@components/templates";

export const MainApp = () => {
	const { reset: resetUser, user } = useUserStore();
	const { currentOrganization, reset: resetOrganization } = useOrganizationStore();
	if (!descopeProjectId && (currentOrganization?.id || user)) {
		resetUser();
		resetOrganization();
	}

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
