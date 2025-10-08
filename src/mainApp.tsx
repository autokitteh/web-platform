import React, { useEffect } from "react";

import "@utilities/getApiBaseUrl.utils";

import { BrowserRouter } from "react-router-dom";

import { App } from "./app";
import { descopeProjectId } from "@constants";
import { VersionService } from "@services";

import { useOrganizationStore } from "@store";

import { DesignedForDesktopBanner } from "@components/atoms";
import { AppProvider, ClarityProvider, DescopeWrapper, WelcomeRedirect } from "@components/templates";

export const MainApp = () => {
	const { currentOrganization, reset, user } = useOrganizationStore();
	if (!descopeProjectId && (currentOrganization || user)) reset();

	useEffect(() => {
		VersionService.initializeVersionTracking();
	}, []);

	return (
		<BrowserRouter>
			<ClarityProvider>
				<AppProvider>
					<DesignedForDesktopBanner />

					{descopeProjectId ? (
						<DescopeWrapper>
							<WelcomeRedirect>
								<App />
							</WelcomeRedirect>
						</DescopeWrapper>
					) : (
						<WelcomeRedirect>
							<App />
						</WelcomeRedirect>
					)}
				</AppProvider>
			</ClarityProvider>
		</BrowserRouter>
	);
};
