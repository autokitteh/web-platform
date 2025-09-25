import React, { useEffect } from "react";

import { datadogRum } from "@datadog/browser-rum";
import { ErrorBoundary } from "@datadog/browser-rum-react";
import { BrowserRouter } from "react-router-dom";

import "@utilities/getApiBaseUrl.utils";

import { App } from "./app";
import { descopeProjectId } from "@constants";
import { VersionService } from "@services";

import { useOrganizationStore } from "@store";

import { DesignedForDesktopBanner, ErrorFallback } from "@components/atoms";
import { AppProvider, ClarityProvider, DescopeWrapper } from "@components/templates";

export const MainApp = () => {
	const { currentOrganization, reset, user } = useOrganizationStore();
	if (!descopeProjectId && (currentOrganization || user)) reset();

	useEffect(() => {
		VersionService.initializeVersionTracking();
	}, []);

	useEffect(() => {
		if (user?.id) {
			datadogRum.setUser({
				id: user.id,
				email: user.email,
				name: user.name,
			});
		}
	}, [user]);

	useEffect(() => {
		if (currentOrganization?.id) {
			datadogRum.setGlobalContextProperty("organization.id", currentOrganization.id);
			datadogRum.setGlobalContextProperty("organization.name", currentOrganization.displayName);
		}
	}, [currentOrganization]);

	return (
		<ErrorBoundary fallback={({ error }) => <ErrorFallback error={error} />}>
			<BrowserRouter>
				<ClarityProvider>
					<AppProvider>
						<DesignedForDesktopBanner />

						{descopeProjectId ? (
							<DescopeWrapper>
								<App />
							</DescopeWrapper>
						) : (
							<App />
						)}
					</AppProvider>
				</ClarityProvider>
			</BrowserRouter>
		</ErrorBoundary>
	);
};
