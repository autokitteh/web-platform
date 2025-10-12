import React, { useEffect } from "react";

import { BrowserRouter } from "react-router-dom";

import "@utilities/getApiBaseUrl.utils";

import { App } from "./app";
import { descopeProjectId } from "@constants";
import { VersionService } from "@services";
import { UserTrackingUtils } from "@utilities";

import { useOrganizationStore } from "@store";

import { DesignedForDesktopBanner } from "@components/atoms";
import { AppProvider, UserTrackingProvider, DescopeWrapper, WelcomeRedirect } from "@components/templates";

export const MainApp = () => {
	const { currentOrganization, reset, user } = useOrganizationStore();
	if (!descopeProjectId && (currentOrganization || user)) reset();

	useEffect(() => {
		VersionService.initializeVersionTracking();
	}, []);

	useEffect(() => {
		if (user?.id) {
			UserTrackingUtils.setUser(user.id, user);
		}
	}, [user]);

	useEffect(() => {
		if (currentOrganization?.id) {
			UserTrackingUtils.setOrg(currentOrganization.id, currentOrganization);
		}
	}, [currentOrganization]);

	return (
		<BrowserRouter>
			<UserTrackingProvider>
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
			</UserTrackingProvider>
		</BrowserRouter>
	);
};
