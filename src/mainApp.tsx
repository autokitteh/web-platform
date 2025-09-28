import React, { useEffect } from "react";

import { BrowserRouter } from "react-router-dom";

import "@utilities/getApiBaseUrl.utils";

import { App } from "./app";
import { descopeProjectId } from "@constants";
import { VersionService } from "@services";
import { ConsentProvider } from "@src/contexts/consent";

import { useOrganizationStore } from "@store";

import { DesignedForDesktopBanner } from "@components/atoms";
import { AppProvider, DescopeWrapper, WelcomeRedirect } from "@components/templates";

export const MainApp = () => {
	const { currentOrganization, reset, user } = useOrganizationStore();
	if (!descopeProjectId && (currentOrganization || user)) reset();

	useEffect(() => {
		VersionService.initializeVersionTracking();
	}, []);

	return (
		<BrowserRouter>
			<ConsentProvider>
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
			</ConsentProvider>
		</BrowserRouter>
	);
};
