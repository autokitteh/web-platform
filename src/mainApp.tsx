import React, { useEffect } from "react";

import "@utilities/getApiBaseUrl.utils";

import { BrowserRouter } from "react-router-dom";

import { App } from "./app";
import { descopeProjectId } from "@constants";
import { VersionService } from "@services";

import { useOrganizationStore } from "@store";

import { DesignedForDesktopBanner } from "@components/atoms";
import { AppProvider, ClarityProvider, DescopeWrapper } from "@components/templates";

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
							<App />
						</DescopeWrapper>
					) : (
						<App />
					)}
				</AppProvider>
			</ClarityProvider>
		</BrowserRouter>
	);
};
