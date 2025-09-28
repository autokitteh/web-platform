import React, { useEffect } from "react";

import { BrowserRouter } from "react-router-dom";

import "@utilities/getApiBaseUrl.utils";

import { App } from "./app";
import { descopeProjectId } from "@constants";
import { VersionService } from "@services";
import { DatadogUtils } from "@utilities";

import { useOrganizationStore } from "@store";

import { DesignedForDesktopBanner } from "@components/atoms";
import { AppProvider, ClarityProvider, DescopeWrapper, WelcomeRedirect } from "@components/templates";

export const MainApp = () => {
	const { currentOrganization, reset, user } = useOrganizationStore();
	if (!descopeProjectId && (currentOrganization || user)) reset();

	useEffect(() => {
		VersionService.initializeVersionTracking();
	}, []);

	useEffect(() => {
		if (user?.id) {
			DatadogUtils.setUser(user.id, user);
		}
	}, [user]);

	useEffect(() => {
		if (currentOrganization?.id) {
			DatadogUtils.setOrg(currentOrganization.id, currentOrganization);
		}
	}, [currentOrganization]);

	return (
		<BrowserRouter>
			<ClarityProvider>
				<AppProvider>
					<DesignedForDesktopBanner />
					<WelcomeRedirect>
						{descopeProjectId ? (
							<DescopeWrapper>
								<App />
							</DescopeWrapper>
						) : (
							<App />
						)}
					</WelcomeRedirect>
				</AppProvider>
			</ClarityProvider>
		</BrowserRouter>
	);
};
